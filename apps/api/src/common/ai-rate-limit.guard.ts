import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from './authenticated-user.interface';

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 20;

/**
 * Límite de llamadas de IA por usuario (AI_RATE_LIMIT_PER_MIN, 20 por minuto).
 * HU-31: el conteo vive en PostgreSQL (tabla RateCounter), así es exacto aunque
 * Vercel abra varias instancias. Si la base falla, cuenta en memoria para no
 * dejar la IA sin protección ni tumbar la petición.
 */
@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AiRateLimitGuard.name);
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly config: ConfigService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const userId = request.user?.id;
    if (!userId) return true; // JwtAuthGuard ya rechaza a quien no tiene sesión.

    const limit =
      Number(this.config.get<string>('AI_RATE_LIMIT_PER_MIN')) || DEFAULT_LIMIT;
    const count = (await this.sharedCount(userId)) ?? this.memoryCount(userId);
    if (count > limit) {
      throw new HttpException(
        'Demasiadas solicitudes a la IA. Espera un minuto e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  /** Incremento atómico del contador de la ventana actual; null si la base no responde. */
  private async sharedCount(userId: string): Promise<number | null> {
    if (!this.prisma) return null;
    const now = Date.now();
    const windowStart = new Date(Math.floor(now / WINDOW_MS) * WINDOW_MS);
    try {
      const rows = await this.prisma.$queryRaw<{ count: number }[]>`
        INSERT INTO "RateCounter" ("key", "windowStart", "count")
        VALUES (${`ai:${userId}`}, ${windowStart}, 1)
        ON CONFLICT ("key", "windowStart")
        DO UPDATE SET "count" = "RateCounter"."count" + 1
        RETURNING "count"`;
      if (Math.random() < 0.02) {
        void this.prisma.rateCounter
          .deleteMany({
            where: { windowStart: { lt: new Date(now - 3_600_000) } },
          })
          .catch(() => undefined);
      }
      return Number(rows[0]?.count ?? 1);
    } catch {
      this.logger.warn('rate_limit_store_unavailable using in-memory counter');
      return null;
    }
  }

  private memoryCount(userId: string): number {
    const now = Date.now();
    const recent = (this.hits.get(userId) ?? []).filter(
      (at) => now - at < WINDOW_MS,
    );
    recent.push(now);
    this.hits.set(userId, recent);
    if (this.hits.size > 5_000) {
      for (const [key, times] of this.hits) {
        if (times.every((at) => now - at >= WINDOW_MS)) this.hits.delete(key);
      }
    }
    return recent.length;
  }
}
