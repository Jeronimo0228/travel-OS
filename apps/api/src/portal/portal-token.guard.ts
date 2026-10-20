import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export interface TravelerRequest extends Request {
  traveler: { reservationId: string };
}

@Injectable()
export class PortalTokenGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TravelerRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/);

    if (!match) {
      throw new UnauthorizedException(
        'A valid traveler access token is required',
      );
    }

    const tokenHash = createHash('sha256').update(match[1]).digest('hex');
    const accessToken = await this.prisma.portalAccessToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      select: { reservationId: true },
    });

    if (!accessToken) {
      throw new UnauthorizedException(
        'Traveler access token is invalid or expired',
      );
    }

    request.traveler = { reservationId: accessToken.reservationId };
    return true;
  }
}
