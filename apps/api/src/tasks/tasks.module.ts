import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { FollowUpReminderQueue } from './follow-up-reminder.queue';
import { FollowUpReminderService } from './follow-up-reminder.service';

@Module({
  imports: [LeadsModule],
  controllers: [TasksController],
  providers: [TasksService, FollowUpReminderQueue, FollowUpReminderService],
})
export class TasksModule {}
