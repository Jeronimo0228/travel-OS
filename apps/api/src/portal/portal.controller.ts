import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  createItineraryItemSchema,
  createPortalMessageSchema,
  createReservationDocumentSchema,
  createReservationSchema,
} from '@travelos/shared';
import type {
  CreateItineraryItemInput,
  CreatePortalMessageInput,
  CreateReservationDocumentInput,
  CreateReservationInput,
} from '@travelos/shared';
import { z } from 'zod';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PortalService } from './portal.service';
import { PortalTokenGuard } from './portal-token.guard';
import type { TravelerRequest } from './portal-token.guard';

const reservationIdSchema = z.string().trim().min(1).max(128);

@Controller()
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly portalService: PortalService) {}

  @Post('reservations')
  createReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createReservationSchema))
    input: CreateReservationInput,
  ) {
    return this.portalService.createReservation(user, input);
  }

  @Get('reservations')
  listReservations(@CurrentUser() user: AuthenticatedUser) {
    return this.portalService.listReservations(user);
  }

  @Get('reservations/:id')
  getReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(reservationIdSchema))
    reservationId: string,
  ) {
    return this.portalService.getReservation(user, reservationId);
  }

  @Post('reservations/:id/itinerary')
  addItineraryItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(reservationIdSchema))
    reservationId: string,
    @Body(new ZodValidationPipe(createItineraryItemSchema))
    input: CreateItineraryItemInput,
  ) {
    return this.portalService.addItineraryItem(user, reservationId, input);
  }

  @Post('reservations/:id/documents')
  addDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(reservationIdSchema))
    reservationId: string,
    @Body(new ZodValidationPipe(createReservationDocumentSchema))
    input: CreateReservationDocumentInput,
  ) {
    return this.portalService.addDocument(user, reservationId, input);
  }

  @Post('reservations/:id/portal-access')
  createPortalAccess(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(reservationIdSchema))
    reservationId: string,
  ) {
    return this.portalService.createAccessToken(user, reservationId);
  }

  @Get('reservations/:id/messages')
  listMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(reservationIdSchema))
    reservationId: string,
  ) {
    return this.portalService.listMessages(user, reservationId);
  }

  @Post('reservations/:id/messages')
  addAgencyMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(reservationIdSchema))
    reservationId: string,
    @Body(new ZodValidationPipe(createPortalMessageSchema))
    input: CreatePortalMessageInput,
  ) {
    return this.portalService.addAgencyMessage(user, reservationId, input);
  }
}

@Controller('portal')
@UseGuards(PortalTokenGuard)
export class TravelerPortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('reservation')
  getReservation(@Req() request: TravelerRequest) {
    return this.portalService.getTravelerReservation(
      request.traveler.reservationId,
    );
  }

  @Get('itinerary')
  getItinerary(@Req() request: TravelerRequest) {
    return this.portalService.listTravelerItinerary(
      request.traveler.reservationId,
    );
  }

  @Get('documents')
  getDocuments(@Req() request: TravelerRequest) {
    return this.portalService.listTravelerDocuments(
      request.traveler.reservationId,
    );
  }

  @Get('messages')
  getMessages(@Req() request: TravelerRequest) {
    return this.portalService.listTravelerMessages(
      request.traveler.reservationId,
    );
  }

  @Post('messages')
  addMessage(
    @Req() request: TravelerRequest,
    @Body(new ZodValidationPipe(createPortalMessageSchema))
    input: CreatePortalMessageInput,
  ) {
    return this.portalService.addTravelerMessage(
      request.traveler.reservationId,
      input,
    );
  }
}
