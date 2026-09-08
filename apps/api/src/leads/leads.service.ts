import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import type {
  AssignLeadInput,
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadInput,
} from '@travelos/shared';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(user: AuthenticatedUser, input: CreateLeadInput) {
    const assigneeId = await this.resolveAssignee(user, input.assigneeId);

    return this.prisma.lead.create({
      data: {
        ...input,
        assigneeId,
        agencyId: user.agencyId,
      },
    });
  }

  async list(user: AuthenticatedUser, query: ListLeadsQuery) {
    const where: Prisma.LeadWhereInput = {
      ...this.visibilityWhere(user),
      ...(query.stage ? { stage: query.stage } : {}),
      ...(query.name
        ? { name: { contains: query.name, mode: 'insensitive' } }
        : {}),
      ...(query.assigneeId && user.role !== Role.ASESOR
        ? { assigneeId: query.assigneeId }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(user: AuthenticatedUser, leadId: string) {
    return this.findAccessibleLead(user, leadId);
  }

  async update(
    user: AuthenticatedUser,
    leadId: string,
    input: UpdateLeadInput,
  ) {
    await this.findAccessibleLead(user, leadId);
    await this.prisma.lead.updateMany({
      where: { id: leadId, ...this.visibilityWhere(user) },
      data: input,
    });

    return this.findAccessibleLead(user, leadId);
  }

  async assign(
    user: AuthenticatedUser,
    leadId: string,
    input: AssignLeadInput,
  ) {
    await this.findAccessibleLead(user, leadId);
    const assigneeId = await this.resolveAgencyAdvisor(
      user.agencyId,
      input.assigneeId,
    );
    await this.prisma.lead.updateMany({
      where: { id: leadId, ...this.visibilityWhere(user) },
      data: { assigneeId },
    });

    await this.auditService.log(user.agencyId, user.id, 'LEAD_ASSIGN', {
      leadId,
      assigneeId,
    });

    return this.findAccessibleLead(user, leadId);
  }

  async remove(user: AuthenticatedUser, leadId: string) {
    const result = await this.prisma.lead.deleteMany({
      where: { id: leadId, ...this.visibilityWhere(user) },
    });

    if (result.count === 0) {
      throw new ForbiddenException('Lead is outside your permitted scope');
    }

    await this.auditService.log(user.agencyId, user.id, 'LEAD_DELETE', {
      leadId,
    });
  }

  private visibilityWhere(user: AuthenticatedUser): Prisma.LeadWhereInput {
    return {
      agencyId: user.agencyId,
      ...(user.role === Role.ASESOR ? { assigneeId: user.id } : {}),
    };
  }

  private async findAccessibleLead(user: AuthenticatedUser, leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, ...this.visibilityWhere(user) },
    });

    if (!lead) {
      throw new ForbiddenException('Lead is outside your permitted scope');
    }

    return lead;
  }

  private async resolveAssignee(user: AuthenticatedUser, assigneeId?: string) {
    if (user.role === Role.ASESOR) {
      if (assigneeId && assigneeId !== user.id) {
        throw new ForbiddenException(
          'Advisors can only create leads for themselves',
        );
      }

      return user.id;
    }

    return assigneeId
      ? this.resolveAgencyAdvisor(user.agencyId, assigneeId)
      : undefined;
  }

  private async resolveAgencyAdvisor(agencyId: string, assigneeId: string) {
    const advisor = await this.prisma.user.findFirst({
      where: { id: assigneeId, agencyId, role: Role.ASESOR },
      select: { id: true },
    });

    if (!advisor) {
      throw new BadRequestException(
        'Assignee must be an advisor in this agency',
      );
    }

    return advisor.id;
  }
}
