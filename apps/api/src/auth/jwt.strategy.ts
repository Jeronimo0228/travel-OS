import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { AUTH_COOKIE_NAME } from './auth.constants';

interface JwtPayload {
  sub: string;
  agencyId: string;
  role: Role;
}

function extractCookieToken(request: Request): string | null {
  const cookie = request.headers.cookie;
  const prefix = `${AUTH_COOKIE_NAME}=`;
  const token = cookie
    ?.split(';')
    .find((part) => part.trim().startsWith(prefix));

  return token?.trim().slice(prefix.length) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractCookieToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      agencyId: payload.agencyId,
      role: payload.role,
    };
  }
}
