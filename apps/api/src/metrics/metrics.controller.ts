import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.GERENTE)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.metricsService.getDashboard(user);
  }
}
