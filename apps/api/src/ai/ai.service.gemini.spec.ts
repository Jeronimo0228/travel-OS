import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { AiService } from './ai.service';

const schema = z.object({ score: z.number() });

const geminiBody = (text: string) => ({
  candidates: [{ content: { parts: [{ text }] } }],
});

describe('AiService (Gemini provider)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('prefers Gemini when its key is configured', () => {
    const service = new AiService(
      new ConfigService({ GEMINI_API_KEY: 'g', GROQ_API_KEY: 'q' }),
    );
    expect(service.resolveProvider()).toBe('gemini');
  });

  it('honours AI_PROVIDER=groq even when Gemini is configured', () => {
    const service = new AiService(
      new ConfigService({
        AI_PROVIDER: 'groq',
        GEMINI_API_KEY: 'g',
        GROQ_API_KEY: 'q',
      }),
    );
    expect(service.resolveProvider()).toBe('groq');
  });

  it('returns null when the forced provider has no key', () => {
    const service = new AiService(
      new ConfigService({ AI_PROVIDER: 'gemini', GROQ_API_KEY: 'q' }),
    );
    expect(service.resolveProvider()).toBeNull();
  });

  it('calls generateContent with JSON mode and parses the reply', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(geminiBody('{"score":91}')),
    });
    const service = new AiService(
      new ConfigService({ GEMINI_API_KEY: 'secret', GEMINI_MODEL: 'gm-test' }),
    );

    await expect(service.generateJson('sys', 'user', schema)).resolves.toEqual({
      score: 91,
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/models/gm-test:generateContent');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe(
      'secret',
    );
    const body = JSON.parse(init.body as string) as {
      generationConfig: { responseMimeType: string };
      systemInstruction: { parts: { text: string }[] };
    };
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.systemInstruction.parts[0].text).toBe('sys');
  });

  it('falls back to the next model when the first is overloaded', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(geminiBody('{"score":7}')),
      });
    const service = new AiService(
      new ConfigService({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'a, b' }),
    );

    await expect(service.generateJson('s', 'u', schema)).resolves.toEqual({
      score: 7,
    });
    expect(fetchMock.mock.calls[1][0]).toContain('/models/b:generateContent');
  });

  it('walks the model chain a second time when every model is rate limited', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(geminiBody('{"score":3}')),
      });
    const service = new AiService(
      new ConfigService({
        GEMINI_API_KEY: 'k',
        GEMINI_MODEL: 'a,b',
        AI_RETRY_PAUSE_MS: '0',
      }),
    );
    await expect(service.generateJson('s', 'u', schema)).resolves.toEqual({
      score: 3,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry on client errors', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    const service = new AiService(
      new ConfigService({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'a,b' }),
    );
    await expect(service.generateJson('s', 'u', schema)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps HTTP errors to 503 without leaking the key', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429 });
    const service = new AiService(
      new ConfigService({ GEMINI_API_KEY: 'secret', AI_RETRY_PAUSE_MS: '0' }),
    );

    const error = await service
      .generateJson('s', 'u', schema)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as Error).message).toContain('429');
    expect((error as Error).message).not.toContain('secret');
  });
});
