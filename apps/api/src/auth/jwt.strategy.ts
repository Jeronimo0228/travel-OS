import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_COOKIE_NAME } from './auth.constants';

interface JwtPayload {
  sub: string;
  agencyId: string;
  role: Role;
  /** sessionVersion del usuario al emitir el token. */
  ver?: number;
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
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractCookieToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * HU-38: la sesión vale mientras el usuario exista, esté activo y no haya cambiado
   * su contraseña ni haya sido desactivado (sessionVersion). Rol y agencia salen de la base.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        agencyId: true,
        role: true,
        disabledAt: true,
        sessionVersion: true,
      },
    });
    if (
      !user ||
      user.disabledAt ||
      (payload.ver ?? 0) !== user.sessionVersion
    ) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    return { id: user.id, agencyId: user.agencyId, role: user.role };
  }
}
