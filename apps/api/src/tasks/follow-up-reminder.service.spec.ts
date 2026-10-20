import { PrismaService } from '../prisma/prisma.service';
import { FollowUpReminderService } from './follow-up-reminder.service';

describe('FollowUpReminderService', () => {
  const findMany = jest.fn();
  const createMany = jest.fn();
  const prisma = {
    task: { findMany },
    taskReminder: { createMany },
  } as unknown as PrismaService;
  const service = new FollowUpReminderService(prisma);

  beforeEach(() => {
    findMany.mockReset();
    createMany.mockReset();
  });

  it('creates deduplicated reminders for overdue incomplete tasks', async () => {
    const dueAt = new Date('2026-10-19T12:00:00.000Z');
    findMany.mockResolvedValue([
      {
        id: 'task-1',
        agencyId: 'agency-a',
        dueAt,
        createdById: 'creator-1',
        lead: { assigneeId: 'advisor-1' },
      },
      {
        id: 'task-2',
        agencyId: 'agency-b',
        dueAt,
        createdById: 'creator-2',
        lead: { assigneeId: null },
      },
    ]);
    createMany.mockResolvedValue({ count: 2 });

    await service.createOverdueReminders();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { dueAt: { lt: expect.any(Date) }, completedAt: null },
      }),
    );
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          taskId: 'task-1',
          agencyId: 'agency-a',
          dueAt,
          recipientId: 'advisor-1',
        },
        {
          taskId: 'task-2',
          agencyId: 'agency-b',
          dueAt,
          recipientId: 'creator-2',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('does not write reminders when no tasks are overdue', async () => {
    findMany.mockResolvedValue([]);

    await service.createOverdueReminders();

    expect(createMany).not.toHaveBeenCalled();
  });
});
