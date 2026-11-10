import { HttpException, type ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiRateLimitGuard } from './ai-rate-limit.guard';

const contextFor = (id?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user: id ? { id } : undefined }),
    }),
  }) as unknown as ExecutionContext;

describe('AiRateLimitGuard', () => {
  it('allows up to the limit per user and then answers 429', () => {
    const guard = new AiRateLimitGuard(
      new ConfigService({ AI_RATE_LIMIT_PER_MIN: '2' }),
    );
    expect(guard.canActivate(contextFor('u1'))).toBe(true);
    expect(guard.canActivate(contextFor('u1'))).toBe(true);
    try {
      guard.canActivate(contextFor('u1'));
      fail('expected 429');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
    }
    // Another user has their own budget.
    expect(guard.canActivate(contextFor('u2'))).toBe(true);
  });

  it('frees the budget after the one-minute window', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(0);
    const guard = new AiRateLimitGuard(
      new ConfigService({ AI_RATE_LIMIT_PER_MIN: '1' }),
    );
    expect(guard.canActivate(contextFor('u1'))).toBe(true);
    now.mockReturnValue(60_001);
    expect(guard.canActivate(contextFor('u1'))).toBe(true);
    now.mockRestore();
  });
});
