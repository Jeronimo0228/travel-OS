import {
  BadGatewayException,
  Injectable,
  Logger,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

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

/**
 * Each AI agent can have its own key pool (GEMINI_API_KEYS_<POOL>) so one
 * agent exhausting its quota does not starve the others. The shared pool
 * (GEMINI_API_KEYS + GEMINI_API_KEY) is appended as the agent's reserve.
 */
export type AiAgent =
  'quote-extract' | 'quote-options' | 'copilot' | 'assistant' | 'default';

const AGENT_POOL: Record<AiAgent, string | null> = {
  'quote-extract': 'QUOTE',
  'quote-options': 'QUOTE',
  copilot: 'COPILOT',
  assistant: 'ASSISTANT',
  default: null,
};

/** Las llaves se identifican por su SHA-256: la llave nunca se guarda. */
function keyHash(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function splitList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  /**
   * HU-31: trae los descansos de llaves que registraron otras instancias.
   * Si la base no responde, sigue con lo que hay en memoria.
   */
  async refreshCooldowns(keys: string[] = this.allGeminiKeys()): Promise<void> {
    if (!this.prisma || !keys.length) return;
    try {
      const byHash = new Map(keys.map((key) => [keyHash(key), key]));
      const rows = await this.prisma.aiKeyCooldown.findMany({
        where: {
          keyHash: { in: [...byHash.keys()] },
          until: { gt: new Date() },
        },
      });
      for (const row of rows) {
        const key = byHash.get(row.keyHash);
        if (key) {
          this.geminiCooldowns.set(
            key,
            Math.max(this.geminiCooldowns.get(key) ?? 0, row.until.getTime()),
          );
        }
      }
    } catch {
      this.logger.warn('ai_cooldown_store_unavailable using in-memory state');
    }
  }

  private allGeminiKeys(): string[] {
    return [
      ...new Set(
        (['quote-options', 'copilot', 'assistant'] as AiAgent[]).flatMap(
          (agent) => this.geminiKeys(agent),
        ),
      ),
    ];
  }

  private persistCooldown(key: string, until: number) {
    if (!this.prisma) return;
    const hash = keyHash(key);
    this.prisma.aiKeyCooldown
      .upsert({
        where: { keyHash: hash },
        create: { keyHash: hash, until: new Date(until) },
        update: { until: new Date(until) },
      })
      .catch(() => this.logger.warn('ai_cooldown_store_unavailable'));
  }

  async generateJson<TSchema extends z.ZodTypeAny>(
    systemPrompt: string,
    userPrompt: string,
    schema: TSchema,
    agent: AiAgent = 'default',
  ): Promise<z.output<TSchema>> {
    const provider = this.resolveProvider(agent);
    if (!provider) {
      throw new ServiceUnavailableException('AI service is not configured');
    }

    const startedAt = Date.now();
    let content: string | null | undefined;
    try {
      content = await this.completeWithFallback(
        provider,
        systemPrompt,
        userPrompt,
        agent,
      );
    } catch (error) {
      this.logger.warn(
        `ai_call agent=${agent} outcome=unavailable ms=${Date.now() - startedAt}`,
      );
      throw error;
    }
    this.logger.log(
      `ai_call agent=${agent} outcome=ok ms=${Date.now() - startedAt}`,
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
  resolveProvider(agent: AiAgent = 'default'): AiProvider | null {
    const forced = this.config.get<string>('AI_PROVIDER')?.toLowerCase();
    const hasGemini = this.geminiKeys(agent).length > 0;
    const hasGroq = this.providerKeys('GROQ').length > 0;
    const hasOpenRouter = this.providerKeys('OPENROUTER').length > 0;
    if (forced === 'gemini') return hasGemini ? 'gemini' : null;
    if (forced === 'groq') return hasGroq ? 'groq' : null;
    if (forced === 'openrouter') return hasOpenRouter ? 'openrouter' : null;
    if (hasGemini) return 'gemini';
    if (hasGroq) return 'groq';
    if (hasOpenRouter) return 'openrouter';
    return null;
  }

  /**
   * Keys for an agent: its dedicated pool first, then the shared pool
   * (GEMINI_API_KEYS comma list plus legacy GEMINI_API_KEY), de-duplicated.
   */
  geminiKeys(agent: AiAgent = 'default'): string[] {
    const pool = AGENT_POOL[agent];
    const dedicated = pool
      ? splitList(this.config.get<string>(`GEMINI_API_KEYS_${pool}`))
      : [];
    return [...new Set([...dedicated, ...this.providerKeys('GEMINI')])];
  }

  /** <NAME>_API_KEYS (comma list) plus <NAME>_API_KEY, de-duplicated. */
  private providerKeys(name: 'GEMINI' | 'GROQ' | 'OPENROUTER'): string[] {
    return [
      ...new Set([
        ...splitList(this.config.get<string>(`${name}_API_KEYS`)),
        ...splitList(this.config.get<string>(`${name}_API_KEY`)),
      ]),
    ];
  }

  /** Provider chain after the primary one, unless AI_PROVIDER pins a provider. */
  providerChain(primary: AiProvider, agent: AiAgent = 'default'): AiProvider[] {
    if (this.config.get<string>('AI_PROVIDER')) return [primary];
    const chain: AiProvider[] = [];
    if (this.geminiKeys(agent).length) chain.push('gemini');
    if (this.providerKeys('GROQ').length) chain.push('groq');
    if (this.providerKeys('OPENROUTER').length) chain.push('openrouter');
    return chain.slice(chain.indexOf(primary));
  }

  /** Safe status: counts and cooldowns only, never key values. */
  status() {
    const now = Date.now();
    const keys = this.geminiKeys();
    const cooling = keys
      .map((key) => this.geminiCooldowns.get(key) ?? 0)
      .filter((until) => until > now);
    const pool = (agent: AiAgent) => {
      const agentKeys = this.geminiKeys(agent);
      const name = AGENT_POOL[agent];
      return {
        dedicated: name
          ? splitList(this.config.get<string>(`GEMINI_API_KEYS_${name}`)).length
          : 0,
        total: agentKeys.length,
        available: agentKeys.filter(
          (key) => (this.geminiCooldowns.get(key) ?? 0) <= now,
        ).length,
      };
    };
    return {
      agents: {
        cotizador: pool('quote-options'),
        copiloto: pool('copilot'),
        asistente: pool('assistant'),
      },
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
      groq: { keys: this.providerKeys('GROQ').length },
      openrouter: { keys: this.providerKeys('OPENROUTER').length },
    };
  }

  resetCooldowns(): void {
    this.geminiCooldowns.clear();
  }

  private async completeWithFallback(
    primary: AiProvider,
    systemPrompt: string,
    userPrompt: string,
    agent: AiAgent,
  ): Promise<string | null | undefined> {
    const chain = this.providerChain(primary, agent);
    let lastError: unknown;
    for (const provider of chain) {
      try {
        if (provider === 'gemini')
          return await this.completeWithGeminiKeys(
            systemPrompt,
            userPrompt,
            agent,
          );
        if (provider === 'groq')
          return await this.completeWithGroq(systemPrompt, userPrompt);
        return await this.completeWithOpenRouter(systemPrompt, userPrompt);
      } catch (error) {
        lastError = error;
        if (!(error instanceof ServiceUnavailableException)) throw error;
        this.logger.warn(
          `ai_fallback agent=${agent} provider=${provider} unavailable, trying next`,
        );
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new ServiceUnavailableException('AI provider is unavailable');
  }

  /** Rotates keys; a key that ends rate limited (429) cools down for 60 s. */
  private async completeWithGeminiKeys(
    systemPrompt: string,
    userPrompt: string,
    agent: AiAgent,
  ): Promise<string | undefined> {
    const keys = this.geminiKeys(agent);
    await this.refreshCooldowns(keys);
    const now = Date.now();
    let indexes = keys
      .map((_, index) => index)
      .filter((index) => (this.geminiCooldowns.get(keys[index]) ?? 0) <= now);
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
          const until = Date.now() + KEY_COOLDOWN_MS;
          this.geminiCooldowns.set(keys[index], until);
          this.persistCooldown(keys[index], until);
          this.logger.warn(
            `ai_key_cooldown agent=${agent} slot=${index + 1} seconds=60`,
          );
          continue;
        }
        throw error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new ServiceUnavailableException('AI provider is unavailable');
  }

  private rotation = 0;
  /** In-memory only and never serialized; status() reports counts. */
  private readonly geminiCooldowns = new Map<string, number>();

  private async completeWithOpenRouter(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | undefined> {
    const apiKeys = this.providerKeys('OPENROUTER');
    const models = (
      this.config.get<string>('OPENROUTER_MODEL') || DEFAULT_OPENROUTER_MODELS
    )
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    let lastStatus = 0;
    const attempts = apiKeys.flatMap((apiKey) =>
      models.map((model) => ({ apiKey, model })),
    );
    for (const { apiKey, model } of attempts) {
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
      // 401/403 means this key is bad: try the next key, not the next model.
      if (
        response.status !== 429 &&
        response.status < 500 &&
        response.status !== 401 &&
        response.status !== 403
      )
        break;
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

  /** Tries each Groq key in order; a quota or outage error moves to the next. */
  private async completeWithGroq(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | null | undefined> {
    const keys = this.providerKeys('GROQ');
    let lastError: unknown;
    for (const apiKey of keys) {
      try {
        return await this.completeWithGroqKey(systemPrompt, userPrompt, apiKey);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new ServiceUnavailableException('AI provider is unavailable');
  }

  private async completeWithGroqKey(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
  ): Promise<string | null | undefined> {
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
