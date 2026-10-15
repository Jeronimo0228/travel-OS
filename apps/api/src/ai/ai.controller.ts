import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { prioritizedLeadsQuerySchema } from '@travelos/shared';
import type { PrioritizedLeadsQuery } from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LeadPrioritizationService } from './lead-prioritization.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly leadPrioritization: LeadPrioritizationService) {}

  @Get('leads/prioritized')
  prioritizeLeads(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(prioritizedLeadsQuerySchema))
    query: PrioritizedLeadsQuery,
  ) {
    return this.leadPrioritization.prioritize(user, query);
  }
}
