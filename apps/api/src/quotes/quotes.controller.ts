import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  createQuoteSchema,
  linkQuoteLeadSchema,
  listQuotesQuerySchema,
  quoteIdSchema,
} from '@travelos/shared';
import type {
  CreateQuoteInput,
  LinkQuoteLeadInput,
  ListQuotesQuery,
} from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { QuotesService } from './quotes.service';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createQuoteSchema)) input: CreateQuoteInput,
  ) {
    return this.quotesService.create(user, input);
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(listQuotesQuerySchema)) query: ListQuotesQuery,
  ) {
    return this.quotesService.list(user, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(quoteIdSchema)) quoteId: string,
  ) {
    return this.quotesService.findOne(user, quoteId);
  }

  @Put(':id/lead')
  linkLead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(quoteIdSchema)) quoteId: string,
    @Body(new ZodValidationPipe(linkQuoteLeadSchema))
    input: LinkQuoteLeadInput,
  ) {
    return this.quotesService.linkLead(user, quoteId, input);
  }

  @Post(':id/pdf')
  @HttpCode(202)
  requestPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(quoteIdSchema)) quoteId: string,
  ) {
    return this.quotesService.requestPdf(user, quoteId);
  }

  @Get(':id/pdf')
  async getPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(quoteIdSchema)) quoteId: string,
  ) {
    const result = await this.quotesService.getPdf(user, quoteId);
    if (!Buffer.isBuffer(result)) {
      return result;
    }
    return new StreamableFile(result, {
      type: 'application/pdf',
      disposition: `attachment; filename="quote-${quoteId}.pdf"`,
    });
  }
}
