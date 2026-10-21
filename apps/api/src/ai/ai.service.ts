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

export type AiProvider = 'gemini' | 'groq';

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

    const content =
      provider === 'gemini'
        ? await this.completeWithGemini(systemPrompt, userPrompt)
        : await this.completeWithGroq(systemPrompt, userPrompt);

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
    const hasGemini = Boolean(this.config.get<string>('GEMINI_API_KEY'));
    const hasGroq = Boolean(this.config.get<string>('GROQ_API_KEY'));
    if (forced === 'gemini') return hasGemini ? 'gemini' : null;
    if (forced === 'groq') return hasGroq ? 'groq' : null;
    if (hasGemini) return 'gemini';
    if (hasGroq) return 'groq';
    return null;
  }

  private async completeWithGemini(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | undefined> {
    const apiKey = this.config.getOrThrow<string>('GEMINI_API_KEY');
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
