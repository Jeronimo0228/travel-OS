import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [LeadsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
