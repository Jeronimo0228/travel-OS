import { ConfigService } from '@nestjs/config';
import { FollowUpReminderQueue } from './follow-up-reminder.queue';
import { FollowUpReminderService } from './follow-up-reminder.service';

describe('FollowUpReminderQueue inline mode (serverless, no Redis)', () => {
  const createOverdueReminders = jest.fn().mockResolvedValue(undefined);
  const service = {
    createOverdueReminders,
  } as unknown as FollowUpReminderService;

  beforeEach(() => createOverdueReminders.mockClear());

  it('sweeps on demand at most once per minute', async () => {
    const queue = new FollowUpReminderQueue(
      new ConfigService({ JOBS_MODE: 'inline' }),
      service,
    );
    await queue.onModuleInit();
    await queue.sweepIfDue(1_000_000);
    await queue.sweepIfDue(1_030_000);
    expect(createOverdueReminders).toHaveBeenCalledTimes(1);
    await queue.sweepIfDue(1_061_000);
    expect(createOverdueReminders).toHaveBeenCalledTimes(2);
  });

  it('never throws to the caller when the sweep fails', async () => {
    createOverdueReminders.mockRejectedValueOnce(new Error('db down'));
    const queue = new FollowUpReminderQueue(new ConfigService({}), service);
    await queue.onModuleInit();
    await expect(queue.sweepIfDue(5_000_000)).resolves.toBeUndefined();
  });
});
