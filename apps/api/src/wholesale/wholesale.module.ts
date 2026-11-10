import { Module } from '@nestjs/common';
import { NetworkController, WholesaleController } from './wholesale.controller';
import { WholesaleService } from './wholesale.service';

@Module({
  controllers: [WholesaleController, NetworkController],
  providers: [WholesaleService],
})
export class WholesaleModule {}
