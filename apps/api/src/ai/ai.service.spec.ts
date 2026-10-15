import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { AiService } from './ai.service';

const create = jest.fn();

jest.mock('groq-sdk', () => {
  class APIError extends Error {
    constructor(
      readonly status: number,
      message: string,
    ) {
      super(message);
    }
  }
  const GroqMock = jest.fn().mockImplementation(() => ({
    chat: { completions: { create } },
  }));
  return { __esModule: true, default: Object.assign(GroqMock, { APIError }) };
});

const scoreSchema = z.object({ score: z.number() });
const completion = (content: string | null) => ({
  choices: [{ message: { content } }],
});

describe('AiService', () => {
  beforeEach(() => {
    create.mockReset();
  });

  it('calls Groq through the SDK with the configured model', async () => {
    create.mockResolvedValue(completion('{"score":82}'));
    const service = new AiService(
      new ConfigService({ GROQ_API_KEY: 'test-key', GROQ_MODEL: 'some/model' }),
    );

    await expect(
      service.generateJson('system', 'user', scoreSchema),
    ).resolves.toEqual({ score: 82 });
    expect(Groq).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'test-key' }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'some/model',
        response_format: { type: 'json_object' },
      }),
    );
  });

  it('defaults to openai/gpt-oss-120b', async () => {
    create.mockResolvedValue(completion('{"score":1}'));
    const service = new AiService(
      new ConfigService({ GROQ_API_KEY: 'test-key' }),
    );

    await service.generateJson('system', 'user', scoreSchema);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'openai/gpt-oss-120b' }),
    );
  });

  it('rejects malformed provider output', async () => {
    create.mockResolvedValue(completion('{"score":"high"}'));
    const service = new AiService(
      new ConfigService({ GROQ_API_KEY: 'test-key' }),
    );

    await expect(
      service.generateJson('system', 'user', scoreSchema),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('fails explicitly when the provider key is missing', async () => {
    const service = new AiService({
      get: () => undefined,
    } as unknown as ConfigService);

    await expect(
      service.generateJson('system', 'user', scoreSchema),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(create).not.toHaveBeenCalled();
  });

  it('includes the status, model and Groq message when the provider rejects a request', async () => {
    create.mockRejectedValue(
      new (
        Groq.APIError as unknown as new (
          status: number,
          message: string,
        ) => Error
      )(404, 'model_not_found'),
    );
    const service = new AiService(
      new ConfigService({ GROQ_API_KEY: 'test-key', GROQ_MODEL: 'bad/model' }),
    );

    await expect(
      service.generateJson('system', 'user', scoreSchema),
    ).rejects.toThrow(
      'AI provider request failed with status 404 (model: bad/model): model_not_found',
    );
  });
});
