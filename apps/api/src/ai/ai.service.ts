import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { z } from 'zod';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
/** Comma-separated fallback chain; the next model is tried on 429/5xx. */
const DEFAULT_GEMINI_MODELS =
  'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-2.5-flash-lite,gemini-2.5-flash';
const DEFAULT_RETRY_PAUSE_MS = 3000;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models';

export type AiProvider = 'gemini' | 'groq' | 'openrouter';

const KEY_COOLDOWN_MS = 60_000;
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODELS =
  'meta-llama/llama-3.3-70b-instruct:free,deepseek/deepseek-chat-v3-0324:free';

/** Per-process cooldowns, keyed by key index (never by key value). */

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async generateJson<TSchema extends z.ZodTypeAny>(
    systemPrompt: string,
    userPrompt: string,
    schema: TSchema,
  ): Promise<z.output<TSchema>> {
    const provider = this.resolveProvider();
    if (!provider) {
      throw new ServiceUnavailableException('AI service is not configured');
    }

    const content = await this.completeWithFallback(
      provider,
      systemPrompt,
      userPrompt,
    );

    if (!content) {
      throw new BadGatewayException('AI provider returned an empty response');
    }

    let generated: unknown;
    try {
      generated = JSON.parse(content);
    } catch (error) {
      throw new BadGatewayException(
        'AI provider returned malformed structured data',
        { cause: error },
      );
    }

    const result = schema.safeParse(generated);
    if (!result.success) {
      this.logger.warn(
        `AI response failed validation: ${result.error.issues
          .slice(0, 5)
          .map((issue) => `${issue.path.join('.') || '(root)'} ${issue.code}`)
          .join('; ')}`,
      );
      throw new BadGatewayException(
        'AI provider response did not match the required format',
      );
    }

    return result.data;
  }

  /**
   * Picks the AI provider. AI_PROVIDER forces one; otherwise Gemini wins when
   * its key is present and Groq is the fallback.
   */
  resolveProvider(): AiProvider | null {
    const forced = this.config.get<string>('AI_PROVIDER')?.toLowerCase();
    const hasGemini = this.geminiKeys().length > 0;
    const hasGroq = Boolean(this.config.get<string>('GROQ_API_KEY'));
    const hasOpenRouter = Boolean(
      this.config.get<string>('OPENROUTER_API_KEY'),
    );
    if (forced === 'gemini') return hasGemini ? 'gemini' : null;
    if (forced === 'groq') return hasGroq ? 'groq' : null;
    if (forced === 'openrouter') return hasOpenRouter ? 'openrouter' : null;
    if (hasGemini) return 'gemini';
    if (hasGroq) return 'groq';
    if (hasOpenRouter) return 'openrouter';
    return null;
  }

  /** GEMINI_API_KEYS (comma list) plus legacy GEMINI_API_KEY, de-duplicated. */
  geminiKeys(): string[] {
    const list = [
      ...(this.config.get<string>('GEMINI_API_KEYS') ?? '').split(','),
      this.config.get<string>('GEMINI_API_KEY') ?? '',
    ]
      .map((key) => key.trim())
      .filter(Boolean);
    return [...new Set(list)];
  }

  /** Provider chain after the primary one, unless AI_PROVIDER pins a provider. */
  providerChain(primary: AiProvider): AiProvider[] {
    if (this.config.get<string>('AI_PROVIDER')) return [primary];
    const chain: AiProvider[] = [];
    if (this.geminiKeys().length) chain.push('gemini');
    if (this.config.get<string>('GROQ_API_KEY')) chain.push('groq');
    if (this.config.get<string>('OPENROUTER_API_KEY')) chain.push('openrouter');
    return chain.slice(chain.indexOf(primary));
  }

  /** Safe status: counts and cooldowns only, never key values. */
  status() {
    const now = Date.now();
    const keys = this.geminiKeys();
    const cooling = keys
      .map((_, index) => this.geminiCooldowns.get(index) ?? 0)
      .filter((until) => until > now);
    return {
      provider: this.resolveProvider(),
      forced: Boolean(this.config.get<string>('AI_PROVIDER')),
      gemini: {
        keys: keys.length,
        available: keys.length - cooling.length,
        coolingDown: cooling.length,
        cooldownSecondsRemaining: cooling.map((until) =>
          Math.ceil((until - now) / 1000),
        ),
      },
      groq: Boolean(this.config.get<string>('GROQ_API_KEY')),
      openrouter: Boolean(this.config.get<string>('OPENROUTER_API_KEY')),
    };
  }

  resetCooldowns(): void {
    this.geminiCooldowns.clear();
  }

  private async completeWithFallback(
    primary: AiProvider,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | null | undefined> {
    const chain = this.providerChain(primary);
    let lastError: unknown;
    for (const provider of chain) {
      try {
        if (provider === 'gemini')
          return await this.completeWithGeminiKeys(systemPrompt, userPrompt);
        if (provider === 'groq')
          return await this.completeWithGroq(systemPrompt, userPrompt);
        return await this.completeWithOpenRouter(systemPrompt, userPrompt);
      } catch (error) {
        lastError = error;
        if (!(error instanceof ServiceUnavailableException)) throw error;
        this.logger.warn(`AI provider ${provider} unavailable, trying next`);
      }
    }
    throw (
      lastError ?? new ServiceUnavailableException('AI provider is unavailable')
    );
  }

  /** Rotates keys; a key that ends rate limited (429) cools down for 60 s. */
  private async completeWithGeminiKeys(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | undefined> {
    const keys = this.geminiKeys();
    const now = Date.now();
    let indexes = keys
      .map((_, index) => index)
      .filter((index) => (this.geminiCooldowns.get(index) ?? 0) <= now);
    if (!indexes.length) {
      throw new ServiceUnavailableException(
        'AI provider request failed with status 429 (all Gemini keys cooling down)',
      );
    }
    // Start at a rotating offset so load spreads across keys.
    const offset = this.rotation++ % indexes.length;
    indexes = [...indexes.slice(offset), ...indexes.slice(0, offset)];
    let lastError: unknown;
    for (const index of indexes) {
      try {
        return await this.completeWithGemini(
          systemPrompt,
          userPrompt,
          keys[index],
        );
      } catch (error) {
        lastError = error;
        if (
          error instanceof ServiceUnavailableException &&
          error.message.includes('429')
        ) {
          this.geminiCooldowns.set(index, Date.now() + KEY_COOLDOWN_MS);
          this.logger.warn(
            `Gemini key #${index + 1} rate limited; cooling 60s`,
          );
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  private rotation = 0;
  private readonly geminiCooldowns = new Map<number, number>();

  private async completeWithOpenRouter(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | undefined> {
    const apiKey = this.config.getOrThrow<string>('OPENROUTER_API_KEY');
    const models = (
      this.config.get<string>('OPENROUTER_MODEL') || DEFAULT_OPENROUTER_MODELS
    )
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    let lastStatus = 0;
    for (const model of models) {
      let response: Response;
      try {
        response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
          signal: AbortSignal.timeout(45_000),
        });
      } catch {
        continue;
      }
      if (response.ok) {
        const body = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        return body.choices?.[0]?.message?.content?.trim();
      }
      lastStatus = response.status;
      if (response.status !== 429 && response.status < 500) break;
    }
    throw new ServiceUnavailableException(
      `AI provider request failed with status ${lastStatus || 'n/a'} (openrouter)`,
    );
  }

  private async completeWithGemini(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
  ): Promise<string | undefined> {
    const models = (
      this.config.get<string>('GEMINI_MODEL') || DEFAULT_GEMINI_MODELS
    )
      .split(',')
      .map((model) => model.trim())
      .filter(Boolean);

    let lastStatus = 0;
    // Free-tier quotas are per model and per minute: walk the chain, and if
    // every model is rate limited wait briefly and walk it once more.
    const chain = [...models, ...models];
    for (const [attempt, model] of chain.entries()) {
      if (attempt === models.length) {
        if (lastStatus !== 429 && lastStatus < 500) break;
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Number(
              this.config.get<string>('AI_RETRY_PAUSE_MS') ??
                DEFAULT_RETRY_PAUSE_MS,
            ),
          ),
        );
      }
      let response: Response;
      try {
        response = await fetch(
          `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.4,
              },
            }),
            signal: AbortSignal.timeout(45_000),
          },
        );
      } catch (error) {
        this.logger.error(
          `Gemini request failed (model: ${model}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        continue;
      }

      if (response.ok) {
        const body = (await response.json()) as GeminiResponse;
        return body.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? '')
          .join('')
          .trim();
      }

      lastStatus = response.status;
      this.logger.error(
        `Gemini request failed with status ${response.status} (model: ${model})`,
      );
      // Only overload/quota/server errors are worth retrying on another model.
      if (response.status !== 429 && response.status < 500) break;
    }

    throw new ServiceUnavailableException(
      lastStatus
        ? `AI provider request failed with status ${lastStatus} (models: ${models.join(', ')})`
        : 'AI provider is unavailable',
    );
  }

  private async completeWithGroq(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | null | undefined> {
    const apiKey = this.config.getOrThrow<string>('GROQ_API_KEY');
    const model = this.config.get<string>('GROQ_MODEL') || DEFAULT_MODEL;
    const groq = new Groq({ apiKey, timeout: 30_000, maxRetries: 1 });

    try {
      const completion = await groq.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      return completion.choices[0]?.message?.content;
    } catch (error) {
      this.logger.error(
        `Groq request failed (model: ${model}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if (error instanceof Groq.APIError) {
        throw new ServiceUnavailableException(
          `AI provider request failed with status ${error.status} (model: ${model}): ${error.message}`,
          { cause: error },
        );
      }
      throw new ServiceUnavailableException('AI provider is unavailable', {
        cause: error,
      });
    }
  }
}
