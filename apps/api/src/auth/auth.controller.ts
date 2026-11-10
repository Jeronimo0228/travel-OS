import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { loginSchema, registerAgencySchema } from '@travelos/shared';
import type { LoginInput, RegisterAgencyInput } from '@travelos/shared';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PortalAttemptLimiter } from '../portal/portal-attempts';
import { AUTH_COOKIE_NAME, JWT_EXPIRATION_SECONDS } from './auth.constants';
import { AuthService } from './auth.service';

/** 10 contraseñas fallidas por IP y correo en 15 minutos bloquean el login. */
const LOGIN_MAX_FAILURES = 10;
const LOGIN_WINDOW_MS = 15 * 60_000;

@Controller('auth')
export class AuthController {
  private readonly loginFailures = new PortalAttemptLimiter(
    LOGIN_MAX_FAILURES,
    LOGIN_WINDOW_MS,
  );

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerAgency(
    @Body(new ZodValidationPipe(registerAgencySchema))
    input: RegisterAgencyInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.registerAgency(input);
    this.setAccessCookie(response, result.accessToken);
    return { user: result.user };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) input: LoginInput,
    @Res({ passthrough: true }) response: Response,
    @Req() request?: Request,
  ) {
    const key = `${request?.ip ?? 'unknown'}|${input.email.toLowerCase()}`;
    if (this.loginFailures.isBlocked(key)) {
      throw new HttpException(
        'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    let result: Awaited<ReturnType<AuthService['login']>>;
    try {
      result = await this.authService.login(input);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.loginFailures.recordFailure(key);
      }
      throw error;
    }
    this.setAccessCookie(response, result.accessToken);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions());
  }

  private setAccessCookie(response: Response, accessToken: string) {
    response.cookie(AUTH_COOKIE_NAME, accessToken, {
      ...this.cookieOptions(),
      maxAge: JWT_EXPIRATION_SECONDS * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    };
  }
}
