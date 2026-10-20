import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { OperationsMetricsService } from './operations.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, OperationsMetricsService],
})
export class MetricsModule {}
