import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { updateAgencyBrandingSchema } from '@travelos/shared';
import type { UpdateAgencyBrandingInput } from '@travelos/shared';
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
  constructor(private readonly agencyService: AgencyService) {}

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
}
