import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from '@travelos/shared';
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('leads/:leadId/tasks')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('leadId') leadId: string,
    @Body(new ZodValidationPipe(createTaskSchema)) input: CreateTaskInput,
  ) {
    return this.tasksService.create(user, leadId, input);
  }

  @Get('leads/:leadId/tasks')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('leadId') leadId: string,
    @Query(new ZodValidationPipe(listTasksQuerySchema)) query: ListTasksQuery,
  ) {
    return this.tasksService.list(user, leadId, query);
  }

  @Patch('tasks/:id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') taskId: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) input: UpdateTaskInput,
  ) {
    return this.tasksService.update(user, taskId, input);
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') taskId: string) {
    return this.tasksService.remove(user, taskId);
  }
}
