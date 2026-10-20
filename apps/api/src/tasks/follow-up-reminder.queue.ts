import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { createBullMqRedisConnection } from '../common/bullmq-redis-connection';
import { FollowUpReminderService } from './follow-up-reminder.service';

const QUEUE_NAME = 'follow-up-reminders';
const SCAN_INTERVAL_MS = 5 * 60 * 1000;

type FollowUpJobData = Record<string, never>;

@Injectable()
export class FollowUpReminderQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FollowUpReminderQueue.name);
  private queue?: Queue<FollowUpJobData>;
  private worker?: Worker<FollowUpJobData>;

  constructor(
    private readonly config: ConfigService,
    private readonly reminderService: FollowUpReminderService,
  ) {}

  async onModuleInit() {
    const connection = createBullMqRedisConnection(this.config);
    this.queue = new Queue<FollowUpJobData>(QUEUE_NAME, { connection });
    this.worker = new Worker<FollowUpJobData>(
      QUEUE_NAME,
      () => this.process(),
      { connection, concurrency: 1 },
    );
    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Follow-up reminder job ${job?.id ?? 'unknown'} failed: ${error.message}`,
      );
    });
    this.worker.on('error', (error) => {
      this.logger.error(`Follow-up reminder worker error: ${error.message}`);
    });
    this.queue.on('error', (error) => {
      this.logger.error(`Follow-up reminder queue error: ${error.message}`);
    });

    await this.queue.add(
      'scan-overdue-tasks',
      {},
      {
        repeat: { every: SCAN_INTERVAL_MS },
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async onModuleDestroy() {
    await Promise.all([this.worker?.close(), this.queue?.close()]);
  }

  private async process() {
    await this.reminderService.createOverdueReminders();
  }
}
