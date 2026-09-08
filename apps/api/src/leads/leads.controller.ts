import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  assignLeadSchema,
  createLeadSchema,
  listLeadsQuerySchema,
  updateLeadSchema,
} from '@travelos/shared';
import type {
  AssignLeadInput,
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadInput,
} from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LeadsService } from './leads.service';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.GERENTE, Role.ASESOR)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createLeadSchema)) input: CreateLeadInput,
  ) {
    return this.leadsService.create(user, input);
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(listLeadsQuerySchema)) query: ListLeadsQuery,
  ) {
    return this.leadsService.list(user, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') leadId: string) {
    return this.leadsService.findOne(user, leadId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') leadId: string,
    @Body(new ZodValidationPipe(updateLeadSchema)) input: UpdateLeadInput,
  ) {
    return this.leadsService.update(user, leadId, input);
  }

  @Put(':id/assignee')
  @Roles(Role.ADMIN, Role.GERENTE)
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') leadId: string,
    @Body(new ZodValidationPipe(assignLeadSchema)) input: AssignLeadInput,
  ) {
    return this.leadsService.assign(user, leadId, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') leadId: string) {
    return this.leadsService.remove(user, leadId);
  }
}
