import { ForbiddenException } from '@nestjs/common';
import { assertDemoCanWrite, demoReadonlyAgencies } from './demo-readonly';

describe('assertDemoCanWrite', () => {
  const demo = demoReadonlyAgencies('agency-demo, other');

  it('ignores agencies that are not demo', () => {
    expect(() => assertDemoCanWrite('real', 'DELETE', '/api/leads/1', demo)).not.toThrow();
  });

  it('allows reads for the demo agency', () => {
    expect(() => assertDemoCanWrite('agency-demo', 'GET', '/api/leads', demo)).not.toThrow();
  });

  it('allows trying the quote generator', () => {
    expect(() => assertDemoCanWrite('agency-demo', 'POST', '/api/quotes', demo)).not.toThrow();
    expect(() => assertDemoCanWrite('agency-demo', 'POST', '/api/quotes/abc/pdf', demo)).not.toThrow();
    expect(() => assertDemoCanWrite('agency-demo', 'POST', '/api/reservations/r1/portal-access', demo)).not.toThrow();
  });

  it('blocks other writes for the demo agency', () => {
    for (const [m, u] of [
      ['PUT', '/api/agency/branding'],
      ['DELETE', '/api/leads/1'],
      ['PATCH', '/api/users/1/role'],
      ['POST', '/api/leads?x=1'],
    ]) {
      expect(() => assertDemoCanWrite('agency-demo', m, u, demo)).toThrow(ForbiddenException);
    }
  });

  it('has no effect when unset', () => {
    expect(demoReadonlyAgencies(undefined).size).toBe(0);
  });
});
