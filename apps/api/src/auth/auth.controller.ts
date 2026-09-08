import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { loginSchema, registerAgencySchema } from '@travelos/shared';
import type { LoginInput, RegisterAgencyInput } from '@travelos/shared';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AUTH_COOKIE_NAME, JWT_EXPIRATION_SECONDS } from './auth.constants';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
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
  ) {
    const result = await this.authService.login(input);
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
