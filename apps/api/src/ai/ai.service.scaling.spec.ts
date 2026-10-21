import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { AiService } from './ai.service';

const schema = z.object({ ok: z.boolean() });
const geminiOk = () =>
  new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
    }),
    { status: 200 },
  );
const status = (code: number) => new Response('{}', { status: code });

describe('AiService scaling', () => {
  let fetchMock: jest.SpyInstance;
  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
  });
  afterEach(() => fetchMock.mockRestore());

  it('rotates to the next key on 429 and cools the first one down', async () => {
    fetchMock
      .mockResolvedValueOnce(status(429))
      .mockResolvedValueOnce(status(429))
      .mockResolvedValueOnce(geminiOk());
    const s = new AiService(
      new ConfigService({
        GEMINI_API_KEYS: 'k1,k2',
        GEMINI_MODEL: 'a',
        AI_RETRY_PAUSE_MS: '0',
      }),
    );
    await expect(s.generateJson('s', 'u', schema)).resolves.toEqual({
      ok: true,
    });
    const st = s.status();
    expect(st.gemini.keys).toBe(2);
    expect(st.gemini.coolingDown).toBe(1);
    expect(JSON.stringify(st)).not.toMatch(/k1|k2/);
  });

  it('falls back to OpenRouter when every Gemini key is rate limited', async () => {
    fetchMock
      .mockResolvedValueOnce(status(429))
      .mockResolvedValueOnce(status(429))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"ok":true}' } }],
          }),
          { status: 200 },
        ),
      );
    const s = new AiService(
      new ConfigService({
        GEMINI_API_KEYS: 'k1',
        GEMINI_MODEL: 'a',
        AI_RETRY_PAUSE_MS: '0',
        OPENROUTER_API_KEY: 'or',
      }),
    );
    await expect(s.generateJson('s', 'u', schema)).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock.mock.calls[2][0]).toContain('openrouter.ai');
  });

  it('does not fall back when AI_PROVIDER pins gemini', async () => {
    fetchMock.mockResolvedValue(status(429));
    const s = new AiService(
      new ConfigService({
        AI_PROVIDER: 'gemini',
        GEMINI_API_KEYS: 'k1',
        GEMINI_MODEL: 'a',
        AI_RETRY_PAUSE_MS: '0',
        OPENROUTER_API_KEY: 'or',
      }),
    );
    await expect(s.generateJson('s', 'u', schema)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(
      fetchMock.mock.calls.every((c) => !String(c[0]).includes('openrouter')),
    ).toBe(true);
  });

  it('skips cooling keys and reports all-cooling as 503', async () => {
    fetchMock.mockResolvedValue(status(429));
    const s = new AiService(
      new ConfigService({
        GEMINI_API_KEYS: 'k1',
        GEMINI_MODEL: 'a',
        AI_RETRY_PAUSE_MS: '0',
      }),
    );
    await expect(s.generateJson('s', 'u', schema)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    const calls = fetchMock.mock.calls.length;
    await expect(s.generateJson('s', 'u', schema)).rejects.toThrow(/cooling/);
    expect(fetchMock.mock.calls.length).toBe(calls);
  });
});
