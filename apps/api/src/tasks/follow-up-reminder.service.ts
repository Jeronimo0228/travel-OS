import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowUpReminderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOverdueReminders() {
    const overdueTasks = await this.prisma.task.findMany({
      where: { dueAt: { lt: new Date() }, completedAt: null },
      select: {
        id: true,
        agencyId: true,
        dueAt: true,
        createdById: true,
        lead: { select: { assigneeId: true } },
      },
    });

    if (overdueTasks.length === 0) {
      return;
    }

    const reminders = overdueTasks.map((task) => {
      if (!task.dueAt) {
        throw new Error(`Overdue task ${task.id} is missing its due date`);
      }

      return {
        taskId: task.id,
        agencyId: task.agencyId,
        dueAt: task.dueAt,
        recipientId: task.lead.assigneeId ?? task.createdById,
      };
    });

    await this.prisma.taskReminder.createMany({
      data: reminders,
      skipDuplicates: true,
    });
  }
}
