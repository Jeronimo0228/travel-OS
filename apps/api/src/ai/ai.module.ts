import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LeadPrioritizationService } from './lead-prioritization.service';

@Module({
  controllers: [AiController],
  providers: [AiService, LeadPrioritizationService],
  exports: [AiService],
})
export class AiModule {}
