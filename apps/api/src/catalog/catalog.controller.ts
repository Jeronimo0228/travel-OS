import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { catalogQuerySchema } from '@travelos/shared';
import type { CatalogQuery } from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogService } from './catalog.service';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(catalogQuerySchema)) query: CatalogQuery,
  ) {
    return this.catalogService.list(user, query);
  }
}
