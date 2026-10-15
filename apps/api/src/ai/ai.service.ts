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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async generateJson<TSchema extends z.ZodTypeAny>(
    systemPrompt: string,
    userPrompt: string,
    schema: TSchema,
  ): Promise<z.output<TSchema>> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI service is not configured');
    }

    const model = this.config.get<string>('GROQ_MODEL') || DEFAULT_MODEL;
    const groq = new Groq({ apiKey, timeout: 30_000, maxRetries: 1 });

    let content: string | null | undefined;
    try {
      const completion = await groq.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      content = completion.choices[0]?.message?.content;
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
      throw new BadGatewayException(
        'AI provider response did not match the required format',
      );
    }

    return result.data;
  }
}
