import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async changeRole(
    agencyId: string,
    actorId: string,
    userId: string,
    role: Role,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, agencyId },
    });

    if (!user) {
      throw new ForbiddenException('User does not belong to this agency');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: {
        id: true,
        agencyId: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    await this.auditService.log(agencyId, actorId, 'ROLE_CHANGE', {
      targetUserId: user.id,
      role,
    });

    return updatedUser;
  }
}
