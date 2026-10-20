import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AgencyKnowledgeService } from './agency-knowledge.service';
import { AiService } from './ai.service';
import { LeadPrioritizationService } from './lead-prioritization.service';

@Module({
  controllers: [AiController],
  providers: [AiService, LeadPrioritizationService, AgencyKnowledgeService],
  exports: [AiService, AgencyKnowledgeService],
})
export class AiModule {}
