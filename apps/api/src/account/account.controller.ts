import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  acceptInvitationSchema,
  changeUserStatusSchema,
  createInvitationSchema,
  forgotPasswordSchema,
  oneTimeTokenSchema,
  resetPasswordSchema,
} from '@travelos/shared';
import type {
  AcceptInvitationInput,
  ChangeUserStatusInput,
  CreateInvitationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@travelos/shared';
import type { Request } from 'express';
import { z } from 'zod';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PortalAttemptLimiter } from '../portal/portal-attempts';
import { AccountService } from './account.service';

const tokenBody = z.object({ token: oneTimeTokenSchema });

/** Rutas públicas de cuenta (sin sesión), con límite por IP. */
@Controller('auth')
export class PublicAccountController {
  private readonly limiter = new PortalAttemptLimiter(10, 15 * 60_000);

  constructor(private readonly account: AccountService) {}

  @Post('password/forgot')
  @HttpCode(202)
  async forgot(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    input: ForgotPasswordInput,
    @Req() request?: Request,
  ) {
    this.throttle(request, 'forgot');
    await this.account.requestPasswordReset(input.email);
    return {
      message:
        'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.',
    };
  }

  @Post('password/reset')
  @HttpCode(204)
  async reset(
    @Body(new ZodValidationPipe(resetPasswordSchema)) input: ResetPasswordInput,
    @Req() request?: Request,
  ) {
    this.throttle(request, 'reset');
    await this.account.resetPassword(input);
  }

  @Post('invitations/preview')
  @HttpCode(200)
  preview(
    @Body(new ZodValidationPipe(tokenBody)) input: { token: string },
    @Req() request?: Request,
  ) {
    this.throttle(request, 'invite');
    return this.account.previewInvitation(input.token);
  }

  @Post('invitations/accept')
  @HttpCode(201)
  accept(
    @Body(new ZodValidationPipe(acceptInvitationSchema))
    input: AcceptInvitationInput,
    @Req() request?: Request,
  ) {
    this.throttle(request, 'invite');
    return this.account.acceptInvitation(input);
  }

  /** Cuenta cada solicitud: estas rutas no deberían recibir más de unas pocas por persona. */
  private throttle(request: Request | undefined, scope: string) {
    const key = `${scope}|${request?.ip ?? 'unknown'}`;
    if (this.limiter.isBlocked(key)) {
      throw new HttpException(
        'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.limiter.recordFailure(key);
  }
}

/** Administración de usuarios de la agencia (HU-38). */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamController {
  constructor(private readonly account: AccountService) {}

  @Get('invitations')
  @Roles(Role.ADMIN)
  invitations(@CurrentUser() user: AuthenticatedUser) {
    return this.account.listInvitations(user.agencyId);
  }

  @Post('invitations')
  @Roles(Role.ADMIN)
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createInvitationSchema))
    input: CreateInvitationInput,
  ) {
    return this.account.invite(user.agencyId, user.id, input);
  }

  @Delete('invitations/:id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  revoke(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.account.revokeInvitation(user.agencyId, user.id, id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  status(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(changeUserStatusSchema))
    input: ChangeUserStatusInput,
  ) {
    return this.account.setActive(user.agencyId, user.id, id, input.active);
  }

  @Post(':id/password-reset-link')
  @Roles(Role.ADMIN)
  resetLink(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.account.adminResetLink(user.agencyId, user.id, id);
  }
}
