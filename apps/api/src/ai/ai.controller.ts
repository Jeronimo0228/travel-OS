import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  assistantRequestSchema,
  prioritizedLeadsQuerySchema,
} from '@travelos/shared';
import type { AssistantRequest, PrioritizedLeadsQuery } from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { AiRateLimitGuard } from '../common/ai-rate-limit.guard';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AiService } from './ai.service';
import { AssistantService } from './assistant.service';
import { LeadPrioritizationService } from './lead-prioritization.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly leadPrioritization: LeadPrioritizationService,
    private readonly ai: AiService,
    private readonly assistant: AssistantService,
  ) {}

  /** Asistente conversacional de solo lectura (HU-25). */
  @Post('assistant')
  @HttpCode(200)
  @UseGuards(AiRateLimitGuard)
  ask(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(assistantRequestSchema))
    input: AssistantRequest,
  ) {
    return this.assistant.reply(user, input);
  }

  /** Provider health for admins: key counts and cooldowns, never key values. */
  @Get('status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  status() {
    return this.ai.status();
  }

  @Get('leads/prioritized')
  @UseGuards(AiRateLimitGuard)
  prioritizeLeads(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(prioritizedLeadsQuerySchema))
    query: PrioritizedLeadsQuery,
  ) {
    return this.leadPrioritization.prioritize(user, query);
  }
}
