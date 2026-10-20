import { Injectable } from '@nestjs/common';
import { LeadStage, PortalMessageSender, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';

const OPEN_STAGES = [
  LeadStage.PROSPECTO,
  LeadStage.COTIZANDO,
  LeadStage.CIERRE,
] as const;
const DAY_MS = 86_400_000;

type QuoteWithBestOption = {
  lead: { stage: LeadStage } | null;
  options: { totalPrice: Prisma.Decimal }[];
};

export function sumQuoteValue(
  quotes: QuoteWithBestOption[],
  stages: readonly LeadStage[],
) {
  return quotes
    .filter((quote) => quote.lead && stages.includes(quote.lead.stage))
    .reduce((total, quote) => {
      const best = quote.options[0];
      return best ? total + Number(best.totalPrice) : total;
    }, 0);
}

@Injectable()
export class OperationsMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOperations(user: AuthenticatedUser, now = new Date()) {
    const agencyId = user.agencyId;
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);

    const [
      stageGroups,
      quotes,
      reservations,
      overdueTasks,
      unreadReminders,
      travelerMessages,
    ] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['stage'],
        where: { agencyId },
        _count: { _all: true },
      }),
      this.prisma.quote.findMany({
        where: { agencyId },
        select: {
          lead: { select: { stage: true } },
          options: {
            select: { totalPrice: true },
            orderBy: { position: 'asc' },
            take: 1,
          },
        },
      }),
      this.prisma.reservation.findMany({
        where: { agencyId, endsAt: { gte: now } },
        orderBy: { startsAt: 'asc' },
        select: {
          id: true,
          travelerName: true,
          destination: true,
          startsAt: true,
          endsAt: true,
        },
      }),
      this.prisma.task.count({
        where: { agencyId, completedAt: null, dueAt: { lt: now } },
      }),
      this.prisma.taskReminder.count({
        where: { agencyId, readAt: null },
      }),
      this.prisma.chatMessage.count({
        where: {
          reservation: { agencyId },
          sender: PortalMessageSender.TRAVELER,
          createdAt: { gte: weekAgo },
        },
      }),
    ]);

    const pipeline = Object.values(LeadStage).map((stage) => ({
      stage,
      count:
        stageGroups.find((group) => group.stage === stage)?._count._all ?? 0,
    }));
    const traveling = reservations.filter((trip) => trip.startsAt <= now);

    return {
      pipeline,
      revenue: {
        currency: 'COP',
        won: sumQuoteValue(quotes, [LeadStage.GANADO]),
        open: sumQuoteValue(quotes, OPEN_STAGES),
        quotes: quotes.length,
      },
      trips: {
        active: reservations.length,
        travelingNow: traveling.length,
        upcoming: reservations
          .filter((trip) => trip.startsAt > now)
          .slice(0, 5),
      },
      followUps: { overdueTasks, unreadReminders },
      portal: { travelerMessagesLast7Days: travelerMessages },
    };
  }
}
