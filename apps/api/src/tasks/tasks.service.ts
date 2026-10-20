import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { LeadsService } from '../leads/leads.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadsService: LeadsService,
  ) {}

  async create(
    user: AuthenticatedUser,
    leadId: string,
    input: CreateTaskInput,
  ) {
    const lead = await this.leadsService.findOne(user, leadId);
    return this.prisma.task.create({
      data: {
        agencyId: user.agencyId,
        leadId: lead.id,
        title: input.title,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        createdById: user.id,
      },
    });
  }

  async list(user: AuthenticatedUser, leadId: string, query: ListTasksQuery) {
    const lead = await this.leadsService.findOne(user, leadId);
    return this.prisma.task.findMany({
      where: {
        agencyId: user.agencyId,
        leadId: lead.id,
        ...(query.overdue
          ? { dueAt: { lt: new Date() }, completedAt: null }
          : {}),
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async update(
    user: AuthenticatedUser,
    taskId: string,
    input: UpdateTaskInput,
  ) {
    const task = await this.findAccessibleTask(user, taskId);
    await this.prisma.task.updateMany({
      where: { id: task.id, agencyId: user.agencyId, leadId: task.leadId },
      data: {
        ...input,
        dueAt:
          input.dueAt === undefined
            ? undefined
            : input.dueAt
              ? new Date(input.dueAt)
              : null,
        completedAt:
          input.completedAt === undefined
            ? undefined
            : input.completedAt
              ? new Date(input.completedAt)
              : null,
      },
    });

    return this.findAccessibleTask(user, taskId);
  }

  async remove(user: AuthenticatedUser, taskId: string) {
    const task = await this.findAccessibleTask(user, taskId);
    await this.prisma.task.deleteMany({
      where: { id: task.id, agencyId: user.agencyId, leadId: task.leadId },
    });
  }

  listReminders(user: AuthenticatedUser) {
    return this.prisma.taskReminder.findMany({
      where: {
        agencyId: user.agencyId,
        ...(user.role === Role.ASESOR
          ? {
              OR: [
                { recipientId: user.id },
                {
                  recipientId: null,
                  task: {
                    is: { lead: { is: { assigneeId: user.id } } },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            dueAt: true,
            lead: {
              select: { id: true, name: true, destination: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markReminderRead(user: AuthenticatedUser, reminderId: string) {
    const result = await this.prisma.taskReminder.updateMany({
      where: {
        id: reminderId,
        agencyId: user.agencyId,
        ...(user.role === Role.ASESOR
          ? {
              OR: [
                { recipientId: user.id },
                {
                  recipientId: null,
                  task: {
                    is: { lead: { is: { assigneeId: user.id } } },
                  },
                },
              ],
            }
          : {}),
      },
      data: { readAt: new Date() },
    });
    if (result.count !== 1) {
      throw new ForbiddenException('Reminder is outside your permitted scope');
    }

    return this.prisma.taskReminder.findFirst({
      where: { id: reminderId, agencyId: user.agencyId },
    });
  }

  private async findAccessibleTask(user: AuthenticatedUser, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, agencyId: user.agencyId },
    });

    if (!task) {
      throw new ForbiddenException('Task is outside your permitted scope');
    }

    await this.leadsService.findOne(user, task.leadId);
    return task;
  }
}
