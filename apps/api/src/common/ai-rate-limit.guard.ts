import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from './authenticated-user.interface';

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 20;

/**
 * Per-user cap on AI calls (AI_RATE_LIMIT_PER_MIN, default 20 per minute).
 * Protects the providers' quota from one user or a stolen session. State is
 * per serverless instance, which is enough to stop bursts; a shared store
 * (Redis) would make it exact across instances.
 */
@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const userId = request.user?.id;
    if (!userId) return true; // JwtAuthGuard already rejects anonymous calls.

    const limit =
      Number(this.config.get<string>('AI_RATE_LIMIT_PER_MIN')) || DEFAULT_LIMIT;
    const now = Date.now();
    const recent = (this.hits.get(userId) ?? []).filter(
      (at) => now - at < WINDOW_MS,
    );
    if (recent.length >= limit) {
      this.hits.set(userId, recent);
      throw new HttpException(
        'Demasiadas solicitudes a la IA. Espera un minuto e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recent.push(now);
    this.hits.set(userId, recent);
    if (this.hits.size > 5_000) this.prune(now);
    return true;
  }

  private prune(now: number) {
    for (const [key, times] of this.hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) this.hits.delete(key);
    }
  }
}
