import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import {
  ReservationsController,
  TravelerPortalController,
} from './portal.controller';
import { PortalService } from './portal.service';
import { PortalTokenGuard } from './portal-token.guard';

@Module({
  imports: [LeadsModule],
  controllers: [ReservationsController, TravelerPortalController],
  providers: [PortalService, PortalTokenGuard],
})
export class PortalModule {}
