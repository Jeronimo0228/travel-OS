import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  updateAgencyBrandingSchema,
  updateAgencyKnowledgeSchema,
} from '@travelos/shared';
import type {
  UpdateAgencyBrandingInput,
  UpdateAgencyKnowledgeInput,
} from '@travelos/shared';
import { AgencyKnowledgeService } from '../ai/agency-knowledge.service';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AgencyService } from './agency.service';

@Controller('agency')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgencyController {
  constructor(
    private readonly agencyService: AgencyService,
    private readonly knowledgeService: AgencyKnowledgeService,
  ) {}

  @Get('branding')
  @Roles(Role.ADMIN, Role.GERENTE, Role.ASESOR)
  getBranding(@CurrentUser() user: AuthenticatedUser) {
    return this.agencyService.getBranding(user.agencyId);
  }

  @Put('branding')
  @Roles(Role.ADMIN, Role.GERENTE)
  updateBranding(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateAgencyBrandingSchema))
    input: UpdateAgencyBrandingInput,
  ) {
    return this.agencyService.updateBranding(user.agencyId, user.id, input);
  }

  /** HU-24: knowledge base used by the AI quote builder and copilot. */
  @Get('knowledge')
  @Roles(Role.ADMIN, Role.GERENTE, Role.ASESOR)
  getKnowledge(@CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.get(user.agencyId);
  }

  @Put('knowledge')
  @Roles(Role.ADMIN, Role.GERENTE)
  updateKnowledge(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateAgencyKnowledgeSchema))
    input: UpdateAgencyKnowledgeInput,
  ) {
    return this.knowledgeService.update(user.agencyId, user.id, input);
  }
}
