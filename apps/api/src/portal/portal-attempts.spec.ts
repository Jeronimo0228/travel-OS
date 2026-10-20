import { PortalAttemptLimiter } from './portal-attempts';

describe('PortalAttemptLimiter', () => {
  it('blocks a client after too many failed token attempts inside the window', () => {
    const limiter = new PortalAttemptLimiter(3, 1000);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      limiter.recordFailure('1.2.3.4', 0);
    }
    expect(limiter.isBlocked('1.2.3.4', 10)).toBe(true);
    expect(limiter.isBlocked('5.6.7.8', 10)).toBe(false);
  });

  it('forgets failures once the window expires', () => {
    const limiter = new PortalAttemptLimiter(1, 1000);
    limiter.recordFailure('1.2.3.4', 0);
    expect(limiter.isBlocked('1.2.3.4', 1001)).toBe(false);
  });
});
