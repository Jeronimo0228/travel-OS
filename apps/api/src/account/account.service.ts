import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
  ResetPasswordInput,
} from '@travelos/shared';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { BCRYPT_SALT_ROUNDS } from '../auth/auth.constants';
import { demoReadonlyAgencies } from '../common/demo-readonly';
import {
  createOneTimeToken,
  hashToken,
  webOrigin,
} from '../common/one-time-token';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

export const RESET_TTL_MS = 30 * 60_000;
export const INVITATION_TTL_MS = 7 * 24 * 60 * 60_000;

const userSelect = {
  id: true,
  agencyId: true,
  email: true,
  name: true,
  role: true,
  disabledAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/**
 * HU-37 (recuperar contraseña) y HU-38 (invitar y desactivar usuarios).
 * Los tokens viajan solo en el enlace (fragmento #t=) y se guardan como SHA-256.
 */
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
  ) {}

  /** Siempre responde igual, exista o no el correo, para no revelar cuentas. */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        disabledAt: null,
      },
      select: { id: true, agencyId: true, email: true, name: true },
    });
    if (!user || demoReadonlyAgencies().has(user.agencyId)) return;

    const link = await this.issueResetLink(user.id);
    const sent = await this.mail.send({
      to: user.email,
      subject: 'Restablece tu contraseña de Travel OS',
      text:
        `Hola ${user.name},\n\nRecibimos una solicitud para restablecer tu contraseña de Travel OS. ` +
        `Abre este enlace en los próximos 30 minutos:\n\n${link}\n\n` +
        'Si no fuiste tú, ignora este correo: tu contraseña no cambia.\n\nTravel OS · PDP Comunica',
    });
    await this.audit.log(user.agencyId, user.id, 'PASSWORD_RESET_REQUESTED', {
      emailSent: sent,
    });
  }

  /** El administrador genera el enlace para entregarlo por otro canal (útil sin correo configurado). */
  async adminResetLink(agencyId: string, actorId: string, userId: string) {
    this.assertNotDemo(agencyId);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, agencyId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const link = await this.issueResetLink(user.id);
    await this.audit.log(agencyId, actorId, 'PASSWORD_RESET_LINK_ISSUED', {
      targetUserId: user.id,
    });
    return { link, expiresInMinutes: RESET_TTL_MS / 60_000 };
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.$transaction(async (tx) => {
      const token = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        include: {
          user: { select: { id: true, agencyId: true, disabledAt: true } },
        },
      });
      if (
        !token ||
        token.usedAt ||
        token.expiresAt <= new Date() ||
        token.user.disabledAt
      ) {
        throw new BadRequestException(
          'El enlace no es válido o ya venció. Pide uno nuevo.',
        );
      }
      // Marca de uso atómica: dos envíos simultáneos del mismo enlace no pueden ganar ambos.
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: token.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1)
        throw new BadRequestException('El enlace ya se usó.');
      await tx.user.update({
        where: { id: token.user.id },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      });
      return token.user;
    });
    await this.audit.log(user.agencyId, user.id, 'PASSWORD_RESET');
  }

  async invite(
    agencyId: string,
    actorId: string,
    input: CreateInvitationInput,
  ) {
    this.assertNotDemo(agencyId);
    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: input.email, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException('Ya existe un usuario con ese correo.');

    const { token, tokenHash } = createOneTimeToken();
    const [agency] = await Promise.all([
      this.prisma.agency.findUniqueOrThrow({
        where: { id: agencyId },
        select: { name: true },
      }),
      // Una invitación vigente por correo: la anterior queda revocada.
      this.prisma.userInvitation.updateMany({
        where: {
          agencyId,
          email: input.email,
          acceptedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      }),
    ]);
    const invitation = await this.prisma.userInvitation.create({
      data: {
        agencyId,
        email: input.email,
        role: input.role,
        tokenHash,
        createdById: actorId,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    const link = `${webOrigin()}/invitacion#t=${token}`;
    const emailSent = await this.mail.send({
      to: input.email,
      subject: `${agency.name} te invitó a Travel OS`,
      text:
        `Hola,\n\n${agency.name} te invitó a Travel OS como ${roleName(input.role)}. ` +
        `Crea tu contraseña con este enlace (vence en 7 días):\n\n${link}\n\nTravel OS · PDP Comunica`,
    });
    await this.audit.log(agencyId, actorId, 'USER_INVITED', {
      invitationId: invitation.id,
      role: input.role,
      emailSent,
    });
    return { invitation, link, emailSent };
  }

  listInvitations(agencyId: string) {
    return this.prisma.userInvitation.findMany({
      where: {
        agencyId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeInvitation(
    agencyId: string,
    actorId: string,
    invitationId: string,
  ) {
    const result = await this.prisma.userInvitation.updateMany({
      where: { id: invitationId, agencyId, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundException('Invitation not found');
    await this.audit.log(agencyId, actorId, 'INVITATION_REVOKED', {
      invitationId,
    });
  }

  /** Datos mínimos para mostrar en la pantalla de aceptación. */
  async previewInvitation(token: string) {
    const invitation = await this.findUsableInvitation(this.prisma, token);
    return {
      email: invitation.email,
      role: invitation.role,
      agencyName: invitation.agency.name,
    };
  }

  async acceptInvitation(input: AcceptInvitationInput) {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const invitation = await this.findUsableInvitation(tx, input.token);
        const claimed = await tx.userInvitation.updateMany({
          where: { id: invitation.id, acceptedAt: null, revokedAt: null },
          data: { acceptedAt: new Date() },
        });
        if (claimed.count !== 1)
          throw new BadRequestException('La invitación ya se usó.');
        const taken = await tx.user.findFirst({
          where: { email: { equals: invitation.email, mode: 'insensitive' } },
          select: { id: true },
        });
        if (taken)
          throw new ConflictException('Ya existe un usuario con ese correo.');
        return tx.user.create({
          data: {
            agencyId: invitation.agencyId,
            email: invitation.email,
            name: input.name,
            role: invitation.role,
            passwordHash,
          },
          select: userSelect,
        });
      });
      await this.audit.log(user.agencyId, user.id, 'INVITATION_ACCEPTED', {
        role: user.role,
      });
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe un usuario con ese correo.');
      }
      throw error;
    }
  }

  async setActive(
    agencyId: string,
    actorId: string,
    userId: string,
    active: boolean,
  ) {
    this.assertNotDemo(agencyId);
    if (userId === actorId)
      throw new ForbiddenException('No puedes desactivar tu propia cuenta.');
    const user = await this.prisma.user.findFirst({
      where: { id: userId, agencyId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!active && user.role === Role.ADMIN) {
      const admins = await this.prisma.user.count({
        where: { agencyId, role: Role.ADMIN, disabledAt: null },
      });
      if (admins <= 1)
        throw new ForbiddenException(
          'La agencia debe conservar al menos un administrador activo.',
        );
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      // Desactivar cierra todas las sesiones abiertas de ese usuario.
      data: active
        ? { disabledAt: null }
        : { disabledAt: new Date(), sessionVersion: { increment: 1 } },
      select: userSelect,
    });
    await this.audit.log(
      agencyId,
      actorId,
      active ? 'USER_ENABLED' : 'USER_DISABLED',
      { targetUserId: user.id },
    );
    return updated;
  }

  private async issueResetLink(userId: string): Promise<string> {
    const { token, tokenHash } = createOneTimeToken();
    await this.prisma.$transaction([
      // Un solo enlace vigente por usuario.
      this.prisma.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      }),
    ]);
    return `${webOrigin()}/restablecer#t=${token}`;
  }

  private async findUsableInvitation(
    db: Prisma.TransactionClient,
    token: string,
  ) {
    const invitation = await db.userInvitation.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { agency: { select: { name: true } } },
    });
    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.revokedAt ||
      invitation.expiresAt <= new Date()
    ) {
      throw new BadRequestException(
        'La invitación no es válida o ya venció. Pide una nueva al administrador.',
      );
    }
    return invitation;
  }

  private assertNotDemo(agencyId: string) {
    if (demoReadonlyAgencies().has(agencyId)) {
      throw new ForbiddenException(
        'Cuenta demo de solo lectura: esta acción no está disponible en la demo.',
      );
    }
  }
}

function roleName(role: Role) {
  return { ADMIN: 'administrador', GERENTE: 'gerente', ASESOR: 'asesor' }[role];
}
