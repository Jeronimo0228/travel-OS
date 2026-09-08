import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuditAction, ListAuditLogsQuery } from '@travelos/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    agencyId: string,
    userId: string | undefined,
    action: AuditAction,
    meta?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: { agencyId, userId, action, meta },
    });
  }

  async list(agencyId: string, query: ListAuditLogsQuery) {
    const where = {
      agencyId,
      ...(query.action ? { action: query.action } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }
}
