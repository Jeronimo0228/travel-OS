import { redactPath, resolveRequestId } from './request-logger.middleware';

describe('request logger helpers', () => {
  it('keeps a well-formed incoming request id', () => {
    expect(resolveRequestId('abc12345-req')).toBe('abc12345-req');
  });

  it('replaces missing or malformed request ids', () => {
    expect(resolveRequestId(undefined)).toMatch(/^[0-9a-f-]{36}$/);
    expect(resolveRequestId('bad id\n')).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('drops query strings so tokens or PII never reach the logs', () => {
    expect(redactPath('/api/leads?name=Ana')).toBe('/api/leads');
  });
});
