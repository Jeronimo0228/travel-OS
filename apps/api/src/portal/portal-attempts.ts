const WINDOW_MS = 60_000;
const MAX_FAILURES = 20;

export class PortalAttemptLimiter {
  private readonly failures = new Map<
    string,
    { count: number; resetAt: number }
  >();

  constructor(
    private readonly maxFailures = MAX_FAILURES,
    private readonly windowMs = WINDOW_MS,
  ) {}

  isBlocked(key: string, now = Date.now()): boolean {
    const entry = this.failures.get(key);
    if (!entry || entry.resetAt <= now) return false;
    return entry.count >= this.maxFailures;
  }

  recordFailure(key: string, now = Date.now()): void {
    const entry = this.failures.get(key);
    if (!entry || entry.resetAt <= now) {
      this.failures.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }
    entry.count += 1;
  }
}
