import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  createPartnershipSchema,
  createProgramBookingSchema,
  departureInputSchema,
  programInputSchema,
  updateAgencyKindSchema,
  updatePartnershipSchema,
  updateProgramBookingSchema,
  updateProgramSchema,
} from '@travelos/shared';
import type {
  CreatePartnershipInput,
  CreateProgramBookingInput,
  DepartureInput,
  ProgramInput,
  UpdateAgencyKindInput,
  UpdatePartnershipInput,
  UpdateProgramBookingInput,
  UpdateProgramInput,
} from '@travelos/shared';
import { z } from 'zod';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { WholesaleService } from './wholesale.service';

const idSchema = z.string().trim().min(1).max(40);
const seatsSchema = z.object({
  seats: z.coerce.number().int().min(1).max(500),
});
const answerSchema = z.object({ accept: z.boolean() });

/** Lado mayorista (HU-33). */
@Controller('wholesale')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.GERENTE)
export class WholesaleController {
  constructor(private readonly wholesale: WholesaleService) {}

  @Get('overview')
  @Roles(Role.ADMIN, Role.GERENTE, Role.ASESOR)
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.overview(user);
  }

  @Patch('kind')
  @Roles(Role.ADMIN)
  setKind(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateAgencyKindSchema))
    input: UpdateAgencyKindInput,
  ) {
    return this.wholesale.setKind(user, input.kind);
  }

  @Get('partners')
  partners(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.listPartners(user);
  }

  @Post('partners')
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createPartnershipSchema))
    input: CreatePartnershipInput,
  ) {
    return this.wholesale.invitePartner(user, input);
  }

  @Patch('partners/:id')
  updatePartner(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(updatePartnershipSchema))
    input: UpdatePartnershipInput,
  ) {
    return this.wholesale.updatePartner(user, id, input);
  }

  @Get('programs')
  programs(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.listPrograms(user);
  }

  @Post('programs')
  createProgram(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(programInputSchema)) input: ProgramInput,
  ) {
    return this.wholesale.createProgram(user, input);
  }

  @Patch('programs/:id')
  updateProgram(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(updateProgramSchema)) input: UpdateProgramInput,
  ) {
    return this.wholesale.updateProgram(user, id, input);
  }

  @Delete('programs/:id')
  @HttpCode(204)
  archiveProgram(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
  ) {
    return this.wholesale.archiveProgram(user, id);
  }

  @Post('programs/:id/departures')
  addDeparture(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(departureInputSchema)) input: DepartureInput,
  ) {
    return this.wholesale.addDeparture(user, id, input);
  }

  @Patch('departures/:id')
  updateDeparture(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(seatsSchema)) input: { seats: number },
  ) {
    return this.wholesale.updateDepartureSeats(user, id, input.seats);
  }

  @Get('bookings')
  bookings(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.listIncomingBookings(user);
  }

  @Patch('bookings/:id')
  decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(updateProgramBookingSchema))
    input: UpdateProgramBookingInput,
  ) {
    return this.wholesale.decideBooking(user, id, input.status);
  }
}

/** Lado agencia aliada (HU-33). */
@Controller('network')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.GERENTE, Role.ASESOR)
export class NetworkController {
  constructor(private readonly wholesale: WholesaleService) {}

  @Get('partnerships')
  partnerships(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.listMyPartnerships(user);
  }

  @Patch('partnerships/:id')
  @Roles(Role.ADMIN)
  answer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(answerSchema)) input: { accept: boolean },
  ) {
    return this.wholesale.answerInvitation(user, id, input.accept);
  }

  @Get('programs')
  programs(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.availablePrograms(user);
  }

  @Get('bookings')
  bookings(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesale.listMyBookings(user);
  }

  @Post('bookings')
  book(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createProgramBookingSchema))
    input: CreateProgramBookingInput,
  ) {
    return this.wholesale.requestBooking(user, input);
  }

  @Patch('bookings/:id/cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
  ) {
    return this.wholesale.cancelMyBooking(user, id);
  }
}
