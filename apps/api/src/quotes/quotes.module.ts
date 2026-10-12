import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { LeadsModule } from '../leads/leads.module';
import { QuotePdfQueue } from './quote-pdf.queue';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [AiModule, LeadsModule],
  controllers: [QuotesController],
  providers: [QuotesService, QuotePdfQueue],
})
export class QuotesModule {}
