import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  catalogAdminQuerySchema,
  catalogImportSchema,
  catalogItemInputSchema,
  catalogQuerySchema,
  updateCatalogItemSchema,
} from '@travelos/shared';
import type {
  CatalogAdminQuery,
  CatalogImportInput,
  CatalogItemInput,
  CatalogQuery,
  UpdateCatalogItemInput,
} from '@travelos/shared';
import { z } from 'zod';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogService } from './catalog.service';

const archiveSchema = z.object({ archived: z.boolean() });

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(catalogQuerySchema)) query: CatalogQuery,
  ) {
    return this.catalogService.list(user, query);
  }

  @Get('manage')
  @Roles(Role.ADMIN, Role.GERENTE)
  manage(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(catalogAdminQuerySchema))
    query: CatalogAdminQuery,
  ) {
    return this.catalogService.listForEditor(user, query);
  }

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(catalogItemInputSchema))
    input: CatalogItemInput,
  ) {
    return this.catalogService.create(user, input);
  }

  @Post('import')
  @Roles(Role.ADMIN, Role.GERENTE)
  import(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(catalogImportSchema)) input: CatalogImportInput,
  ) {
    return this.catalogService.importCsv(user, input.csv);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCatalogItemSchema))
    input: UpdateCatalogItemInput,
  ) {
    return this.catalogService.update(user, id, input);
  }

  @Patch(':id/archive')
  @Roles(Role.ADMIN, Role.GERENTE)
  archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(archiveSchema)) input: { archived: boolean },
  ) {
    return this.catalogService.setArchived(user, id, input.archived);
  }
}
