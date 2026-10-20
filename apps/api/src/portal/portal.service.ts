import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PortalMessageSender, Role } from '@prisma/client';
import type {
  CreateItineraryItemInput,
  CreatePortalMessageInput,
  CreateReservationDocumentInput,
  CreateReservationInput,
} from '@travelos/shared';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { AuditService } from '../audit/audit.service';
import { LeadsService } from '../leads/leads.service';
import { PrismaService } from '../prisma/prisma.service';

const PORTAL_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadsService: LeadsService,
    private readonly auditService: AuditService,
  ) {}

  async createReservation(
    user: AuthenticatedUser,
    input: CreateReservationInput,
  ) {
    const lead = await this.leadsService.findOne(user, input.leadId);
    return this.prisma.reservation.create({
      data: {
        agencyId: user.agencyId,
        leadId: lead.id,
        travelerName: input.travelerName,
        travelerEmail: input.travelerEmail,
        destination: input.destination,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
      },
    });
  }

  listReservations(user: AuthenticatedUser) {
    return this.prisma.reservation.findMany({
      where: {
        agencyId: user.agencyId,
        ...(user.role === Role.ASESOR
          ? { lead: { is: { assigneeId: user.id } } }
          : {}),
      },
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getReservation(user: AuthenticatedUser, reservationId: string) {
    const reservation = await this.findAccessibleReservation(
      user,
      reservationId,
    );
    const [itinerary, documents] = await Promise.all([
      this.prisma.itineraryItem.findMany({
        where: { reservationId: reservation.id },
        orderBy: [{ position: 'asc' }, { startsAt: 'asc' }],
      }),
      this.prisma.reservationDocument.findMany({
        where: { reservationId: reservation.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { ...reservation, itinerary, documents };
  }

  async addItineraryItem(
    user: AuthenticatedUser,
    reservationId: string,
    input: CreateItineraryItemInput,
  ) {
    const reservation = await this.findAccessibleReservation(
      user,
      reservationId,
    );
    return this.prisma.itineraryItem.create({
      data: {
        reservationId: reservation.id,
        title: input.title,
        details: input.details,
        location: input.location,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        position: input.position,
      },
    });
  }

  async addDocument(
    user: AuthenticatedUser,
    reservationId: string,
    input: CreateReservationDocumentInput,
  ) {
    const reservation = await this.findAccessibleReservation(
      user,
      reservationId,
    );
    return this.prisma.reservationDocument.create({
      data: {
        reservationId: reservation.id,
        name: input.name,
        url: input.url,
        contentType: input.contentType,
      },
    });
  }

  async createAccessToken(user: AuthenticatedUser, reservationId: string) {
    const reservation = await this.findAccessibleReservation(
      user,
      reservationId,
    );
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + PORTAL_TOKEN_LIFETIME_MS);
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.prisma.$transaction([
      this.prisma.portalAccessToken.deleteMany({
        where: { reservationId: reservation.id },
      }),
      this.prisma.portalAccessToken.create({
        data: { reservationId: reservation.id, tokenHash, expiresAt },
        select: { id: true },
      }),
    ]);

    await this.auditService.log(
      user.agencyId,
      user.id,
      'PORTAL_ACCESS_ISSUED',
      { reservationId: reservation.id, expiresAt: expiresAt.toISOString() },
    );

    return { accessToken: token, expiresAt };
  }

  async listMessages(user: AuthenticatedUser, reservationId: string) {
    const reservation = await this.findAccessibleReservation(
      user,
      reservationId,
    );
    return this.getLatestMessages(reservation.id);
  }

  async addAgencyMessage(
    user: AuthenticatedUser,
    reservationId: string,
    input: CreatePortalMessageInput,
  ) {
    const reservation = await this.findAccessibleReservation(
      user,
      reservationId,
    );
    return this.prisma.chatMessage.create({
      data: {
        reservationId: reservation.id,
        sender: PortalMessageSender.AGENCY,
        senderUserId: user.id,
        body: input.body,
      },
    });
  }

  async getTravelerReservation(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        travelerName: true,
        destination: true,
        startsAt: true,
        endsAt: true,
      },
    });
    if (!reservation) {
      throw new UnauthorizedException(
        'Traveler reservation is no longer available',
      );
    }
    return reservation;
  }

  listTravelerItinerary(reservationId: string) {
    return this.prisma.itineraryItem.findMany({
      where: { reservationId },
      orderBy: [{ position: 'asc' }, { startsAt: 'asc' }],
    });
  }

  async listTravelerDocuments(reservationId: string) {
    const [reservation, documents] = await Promise.all([
      this.prisma.reservation.findUnique({
        where: { id: reservationId },
        select: { agencyId: true },
      }),
      this.prisma.reservationDocument.findMany({
        where: { reservationId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    if (reservation) {
      await this.auditService.log(
        reservation.agencyId,
        undefined,
        'PORTAL_DOCUMENTS_VIEWED',
        { reservationId, documentCount: documents.length },
      );
    }
    return documents;
  }

  listTravelerMessages(reservationId: string) {
    return this.getLatestMessages(reservationId);
  }

  private async getLatestMessages(reservationId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return messages.reverse();
  }

  addTravelerMessage(reservationId: string, input: CreatePortalMessageInput) {
    return this.prisma.chatMessage.create({
      data: {
        reservationId,
        sender: PortalMessageSender.TRAVELER,
        body: input.body,
      },
    });
  }

  private async findAccessibleReservation(
    user: AuthenticatedUser,
    reservationId: string,
  ) {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id: reservationId,
        agencyId: user.agencyId,
        ...(user.role === Role.ASESOR
          ? { lead: { is: { assigneeId: user.id } } }
          : {}),
      },
    });
    if (!reservation) {
      throw new ForbiddenException(
        'Reservation is outside your permitted agency or assignment',
      );
    }
    return reservation;
  }
}
