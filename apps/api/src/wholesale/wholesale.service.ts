import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AgencyKind,
  PartnershipStatus,
  Prisma,
  ProgramBookingStatus,
} from '@prisma/client';
import type {
  CreatePartnershipInput,
  CreateProgramBookingInput,
  DepartureInput,
  ProgramInput,
  UpdatePartnershipInput,
  UpdateProgramInput,
} from '@travelos/shared';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';

const HOLDING: ProgramBookingStatus[] = [
  ProgramBookingStatus.REQUESTED,
  ProgramBookingStatus.CONFIRMED,
];

const departureSelect = {
  id: true,
  startsOn: true,
  seats: true,
} satisfies Prisma.DepartureSelect;

/** Cupos ocupados por salida (reservas solicitadas o confirmadas). */
async function usedSeats(db: Prisma.TransactionClient, departureIds: string[]) {
  if (!departureIds.length) return new Map<string, number>();
  const rows = await db.programBooking.groupBy({
    by: ['departureId'],
    where: { departureId: { in: departureIds }, status: { in: HOLDING } },
    _sum: { pax: true },
  });
  return new Map(rows.map((row) => [row.departureId, row._sum.pax ?? 0]));
}

function toDate(day: string) {
  return new Date(`${day}T12:00:00.000Z`);
}

/**
 * HU-33: red de agencias para mayoristas.
 * Mayorista: programas, salidas con cupos y tarifa neta; aliadas con comisión.
 * Aliada: ve los programas publicados de sus mayoristas activos y solicita cupos.
 * Toda consulta filtra por la agencia del usuario en el lado que le corresponde.
 */
@Injectable()
export class WholesaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async overview(user: AuthenticatedUser) {
    const agency = await this.prisma.agency.findUniqueOrThrow({
      where: { id: user.agencyId },
      select: { kind: true, slug: true, name: true },
    });
    const [pendingInvites, activeWholesalers] = await Promise.all([
      this.prisma.partnership.count({
        where: { agencyId: user.agencyId, status: PartnershipStatus.PENDING },
      }),
      this.prisma.partnership.count({
        where: { agencyId: user.agencyId, status: PartnershipStatus.ACTIVE },
      }),
    ]);
    return { ...agency, pendingInvites, activeWholesalers };
  }

  async setKind(user: AuthenticatedUser, kind: AgencyKind) {
    const agency = await this.prisma.agency.update({
      where: { id: user.agencyId },
      data: { kind },
      select: { kind: true },
    });
    await this.audit.log(user.agencyId, user.id, 'AGENCY_KIND_UPDATE', {
      kind,
    });
    return agency;
  }

  // ───────────── Lado mayorista ─────────────

  listPartners(user: AuthenticatedUser) {
    return this.prisma.partnership.findMany({
      where: { wholesalerId: user.agencyId },
      include: { agency: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async invitePartner(user: AuthenticatedUser, input: CreatePartnershipInput) {
    await this.assertWholesaler(user);
    const partner = await this.prisma.agency.findUnique({
      where: { slug: input.agencySlug },
      select: { id: true },
    });
    if (!partner)
      throw new NotFoundException(
        'No existe una agencia con ese identificador.',
      );
    if (partner.id === user.agencyId)
      throw new BadRequestException('No puedes aliarte con tu propia agencia.');
    try {
      const partnership = await this.prisma.partnership.create({
        data: {
          wholesalerId: user.agencyId,
          agencyId: partner.id,
          commissionPct: input.commissionPct,
        },
        include: { agency: { select: { name: true, slug: true } } },
      });
      await this.audit.log(user.agencyId, user.id, 'PARTNERSHIP_INVITE', {
        partnershipId: partnership.id,
      });
      return partnership;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Esa agencia ya está en tu red.');
      }
      throw error;
    }
  }

  async updatePartner(
    user: AuthenticatedUser,
    id: string,
    input: UpdatePartnershipInput,
  ) {
    const partnership = await this.prisma.partnership.findFirst({
      where: { id, wholesalerId: user.agencyId },
    });
    if (!partnership) throw new NotFoundException('Partnership not found');
    // El mayorista puede terminar la alianza o reactivar una que terminó; aceptar es de la aliada.
    if (
      input.status === PartnershipStatus.ACTIVE &&
      partnership.status !== PartnershipStatus.ENDED
    ) {
      throw new BadRequestException(
        'La agencia aliada debe aceptar la invitación.',
      );
    }
    const updated = await this.prisma.partnership.update({
      where: { id },
      data: { commissionPct: input.commissionPct, status: input.status },
      include: { agency: { select: { name: true, slug: true } } },
    });
    await this.audit.log(user.agencyId, user.id, 'PARTNERSHIP_UPDATE', {
      partnershipId: id,
      ...input,
    });
    return updated;
  }

  async listPrograms(user: AuthenticatedUser) {
    const programs = await this.prisma.program.findMany({
      where: { wholesalerId: user.agencyId, archivedAt: null },
      include: {
        departures: { select: departureSelect, orderBy: { startsOn: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const used = await usedSeats(
      this.prisma,
      programs.flatMap((p) => p.departures.map((d) => d.id)),
    );
    return programs.map((program) => ({
      ...program,
      departures: program.departures.map((d) => ({
        ...d,
        seatsLeft: d.seats - (used.get(d.id) ?? 0),
      })),
    }));
  }

  async createProgram(user: AuthenticatedUser, input: ProgramInput) {
    await this.assertWholesaler(user);
    const { departures, ...data } = input;
    const program = await this.prisma.program.create({
      data: {
        ...data,
        wholesalerId: user.agencyId,
        departures: {
          create: departures.map((d) => ({
            startsOn: toDate(d.startsOn),
            seats: d.seats,
          })),
        },
      },
      include: { departures: { select: departureSelect } },
    });
    await this.audit.log(user.agencyId, user.id, 'PROGRAM_CREATE', {
      programId: program.id,
    });
    return program;
  }

  async updateProgram(
    user: AuthenticatedUser,
    id: string,
    input: UpdateProgramInput,
  ) {
    await this.findOwnProgram(user, id);
    const { published, ...data } = input;
    const program = await this.prisma.program.update({
      where: { id },
      data: {
        ...data,
        ...(published === undefined
          ? {}
          : { publishedAt: published ? new Date() : null }),
      },
    });
    await this.audit.log(user.agencyId, user.id, 'PROGRAM_UPDATE', {
      programId: id,
    });
    return program;
  }

  async archiveProgram(user: AuthenticatedUser, id: string) {
    await this.findOwnProgram(user, id);
    await this.prisma.program.update({
      where: { id },
      data: { archivedAt: new Date(), publishedAt: null },
    });
    await this.audit.log(user.agencyId, user.id, 'PROGRAM_UPDATE', {
      programId: id,
      archived: true,
    });
  }

  async addDeparture(
    user: AuthenticatedUser,
    programId: string,
    input: DepartureInput,
  ) {
    await this.findOwnProgram(user, programId);
    return this.prisma.departure.create({
      data: { programId, startsOn: toDate(input.startsOn), seats: input.seats },
      select: departureSelect,
    });
  }

  async updateDepartureSeats(
    user: AuthenticatedUser,
    departureId: string,
    seats: number,
  ) {
    const departure = await this.prisma.departure.findFirst({
      where: { id: departureId, program: { wholesalerId: user.agencyId } },
    });
    if (!departure) throw new NotFoundException('Departure not found');
    const used =
      (await usedSeats(this.prisma, [departureId])).get(departureId) ?? 0;
    if (seats < used)
      throw new ConflictException(
        `Ya hay ${used} cupos reservados en esta salida.`,
      );
    return this.prisma.departure.update({
      where: { id: departureId },
      data: { seats },
      select: departureSelect,
    });
  }

  listIncomingBookings(user: AuthenticatedUser) {
    return this.prisma.programBooking.findMany({
      where: { wholesalerId: user.agencyId },
      include: this.bookingInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async decideBooking(
    user: AuthenticatedUser,
    id: string,
    status: 'CONFIRMED' | 'CANCELLED',
  ) {
    const booking = await this.prisma.programBooking.findFirst({
      where: { id, wholesalerId: user.agencyId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === ProgramBookingStatus.CANCELLED)
      throw new BadRequestException('La reserva ya está cancelada.');
    const updated = await this.prisma.programBooking.update({
      where: { id },
      data: { status },
      include: this.bookingInclude(),
    });
    await this.audit.log(user.agencyId, user.id, 'PROGRAM_BOOKING_UPDATE', {
      bookingId: id,
      status,
    });
    return updated;
  }

  // ───────────── Lado agencia aliada ─────────────

  listMyPartnerships(user: AuthenticatedUser) {
    return this.prisma.partnership.findMany({
      where: { agencyId: user.agencyId },
      include: { wholesaler: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async answerInvitation(user: AuthenticatedUser, id: string, accept: boolean) {
    const partnership = await this.prisma.partnership.findFirst({
      where: { id, agencyId: user.agencyId, status: PartnershipStatus.PENDING },
    });
    if (!partnership) throw new NotFoundException('Invitation not found');
    const updated = await this.prisma.partnership.update({
      where: { id },
      data: {
        status: accept ? PartnershipStatus.ACTIVE : PartnershipStatus.ENDED,
      },
      include: { wholesaler: { select: { name: true, slug: true } } },
    });
    await this.audit.log(user.agencyId, user.id, 'PARTNERSHIP_UPDATE', {
      partnershipId: id,
      accepted: accept,
    });
    return updated;
  }

  /** Programas publicados por los mayoristas con los que la agencia tiene alianza activa. */
  async availablePrograms(user: AuthenticatedUser) {
    const partnerships = await this.prisma.partnership.findMany({
      where: { agencyId: user.agencyId, status: PartnershipStatus.ACTIVE },
      select: {
        wholesalerId: true,
        commissionPct: true,
        wholesaler: { select: { name: true } },
      },
    });
    if (!partnerships.length) return [];
    const byWholesaler = new Map(partnerships.map((p) => [p.wholesalerId, p]));
    const programs = await this.prisma.program.findMany({
      where: {
        wholesalerId: { in: [...byWholesaler.keys()] },
        publishedAt: { not: null },
        archivedAt: null,
      },
      include: {
        departures: {
          where: { startsOn: { gte: new Date(Date.now() - 86_400_000) } },
          select: departureSelect,
          orderBy: { startsOn: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    const used = await usedSeats(
      this.prisma,
      programs.flatMap((p) => p.departures.map((d) => d.id)),
    );
    return programs.map((program) => {
      const partnership = byWholesaler.get(program.wholesalerId)!;
      return {
        id: program.id,
        name: program.name,
        destination: program.destination,
        days: program.days,
        description: program.description,
        netPrice: program.netPrice,
        currency: program.currency,
        wholesalerName: partnership.wholesaler.name,
        commissionPct: partnership.commissionPct,
        departures: program.departures.map((d) => ({
          ...d,
          seatsLeft: d.seats - (used.get(d.id) ?? 0),
        })),
      };
    });
  }

  /** Reserva de cupos en transacción serializable: dos agencias no pueden sobrevender la misma salida. */
  async requestBooking(
    user: AuthenticatedUser,
    input: CreateProgramBookingInput,
  ) {
    const run = () =>
      this.prisma.$transaction(
        async (tx) => {
          const departure = await tx.departure.findUnique({
            where: { id: input.departureId },
            include: { program: true },
          });
          if (
            !departure ||
            !departure.program.publishedAt ||
            departure.program.archivedAt
          ) {
            throw new NotFoundException('Departure not found');
          }
          const partnership = await tx.partnership.findFirst({
            where: {
              wholesalerId: departure.program.wholesalerId,
              agencyId: user.agencyId,
              status: PartnershipStatus.ACTIVE,
            },
          });
          if (!partnership)
            throw new ForbiddenException(
              'Tu agencia no tiene alianza activa con este mayorista.',
            );
          const used =
            (await usedSeats(tx, [departure.id])).get(departure.id) ?? 0;
          if (used + input.pax > departure.seats) {
            throw new ConflictException(
              `Solo quedan ${Math.max(0, departure.seats - used)} cupos en esta salida.`,
            );
          }
          const netTotal = new Prisma.Decimal(departure.program.netPrice).mul(
            input.pax,
          );
          const commissionTotal = netTotal
            .mul(partnership.commissionPct)
            .div(100)
            .toDecimalPlaces(2);
          return tx.programBooking.create({
            data: {
              departureId: departure.id,
              agencyId: user.agencyId,
              wholesalerId: departure.program.wholesalerId,
              travelerName: input.travelerName,
              pax: input.pax,
              netTotal,
              commissionPct: partnership.commissionPct,
              commissionTotal,
              createdById: user.id,
            },
            include: this.bookingInclude(),
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    let booking;
    try {
      booking = await run();
    } catch (error) {
      // Conflicto de serialización: se reintenta una vez con el estado ya actualizado.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      )
        booking = await run();
      else throw error;
    }
    await this.audit.log(user.agencyId, user.id, 'PROGRAM_BOOKING_REQUEST', {
      bookingId: booking.id,
      pax: input.pax,
    });
    return booking;
  }

  listMyBookings(user: AuthenticatedUser) {
    return this.prisma.programBooking.findMany({
      where: { agencyId: user.agencyId },
      include: this.bookingInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelMyBooking(user: AuthenticatedUser, id: string) {
    const booking = await this.prisma.programBooking.findFirst({
      where: {
        id,
        agencyId: user.agencyId,
        status: ProgramBookingStatus.REQUESTED,
      },
    });
    if (!booking)
      throw new NotFoundException(
        'Solo puedes cancelar reservas que aún no confirma el mayorista.',
      );
    const updated = await this.prisma.programBooking.update({
      where: { id },
      data: { status: ProgramBookingStatus.CANCELLED },
      include: this.bookingInclude(),
    });
    await this.audit.log(user.agencyId, user.id, 'PROGRAM_BOOKING_UPDATE', {
      bookingId: id,
      status: 'CANCELLED',
    });
    return updated;
  }

  // ───────────── Ayudas ─────────────

  private bookingInclude() {
    return {
      agency: { select: { name: true } },
      wholesaler: { select: { name: true } },
      departure: {
        select: {
          startsOn: true,
          program: { select: { name: true, destination: true } },
        },
      },
    } satisfies Prisma.ProgramBookingInclude;
  }

  private async assertWholesaler(user: AuthenticatedUser) {
    const agency = await this.prisma.agency.findUniqueOrThrow({
      where: { id: user.agencyId },
      select: { kind: true },
    });
    if (agency.kind !== AgencyKind.WHOLESALER) {
      throw new ForbiddenException(
        'Activa el modo mayorista en Configuración para usar esta función.',
      );
    }
  }

  private async findOwnProgram(user: AuthenticatedUser, id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, wholesalerId: user.agencyId },
    });
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }
}
