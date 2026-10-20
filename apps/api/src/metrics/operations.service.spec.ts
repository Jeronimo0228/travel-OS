import { LeadStage, Prisma, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { OperationsMetricsService, sumQuoteValue } from './operations.service';

const price = (value: number) => new Prisma.Decimal(value);

describe('OperationsMetricsService', () => {
  const now = new Date('2026-10-21T12:00:00Z');
  const user: AuthenticatedUser = {
    id: 'manager-1',
    agencyId: 'agency-a',
    role: Role.GERENTE,
  };
  const prisma = {
    lead: { groupBy: jest.fn() },
    quote: { findMany: jest.fn() },
    reservation: { findMany: jest.fn() },
    task: { count: jest.fn() },
    taskReminder: { count: jest.fn() },
    chatMessage: { count: jest.fn() },
  };
  const service = new OperationsMetricsService(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    prisma.lead.groupBy.mockResolvedValue([
      { stage: LeadStage.GANADO, _count: { _all: 2 } },
      { stage: LeadStage.COTIZANDO, _count: { _all: 3 } },
    ]);
    prisma.quote.findMany.mockResolvedValue([
      {
        lead: { stage: LeadStage.GANADO },
        options: [{ totalPrice: price(5_000_000) }],
      },
      {
        lead: { stage: LeadStage.COTIZANDO },
        options: [{ totalPrice: price(2_000_000) }],
      },
      { lead: null, options: [{ totalPrice: price(9_999) }] },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        id: 'r1',
        travelerName: 'Ana',
        destination: 'Cartagena',
        startsAt: new Date('2026-10-20T00:00:00Z'),
        endsAt: new Date('2026-10-25T00:00:00Z'),
      },
      {
        id: 'r2',
        travelerName: 'Luis',
        destination: 'Cusco',
        startsAt: new Date('2026-11-02T00:00:00Z'),
        endsAt: new Date('2026-11-09T00:00:00Z'),
      },
    ]);
    prisma.task.count.mockResolvedValue(4);
    prisma.taskReminder.count.mockResolvedValue(2);
    prisma.chatMessage.count.mockResolvedValue(7);
  });

  it('aggregates pipeline, revenue, trips and follow-ups for the agency only', async () => {
    const result = await service.getOperations(user, now);

    expect(result.pipeline).toEqual(
      expect.arrayContaining([
        { stage: LeadStage.GANADO, count: 2 },
        { stage: LeadStage.PROSPECTO, count: 0 },
      ]),
    );
    expect(result.revenue).toEqual({
      currency: 'COP',
      won: 5_000_000,
      open: 2_000_000,
      quotes: 3,
    });
    expect(result.trips.active).toBe(2);
    expect(result.trips.travelingNow).toBe(1);
    expect(result.trips.upcoming.map((trip) => trip.id)).toEqual(['r2']);
    expect(result.followUps).toEqual({ overdueTasks: 4, unreadReminders: 2 });
    expect(result.portal.travelerMessagesLast7Days).toBe(7);
    expect(prisma.lead.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { agencyId: 'agency-a' } }),
    );
    expect(prisma.chatMessage.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          reservation: { agencyId: 'agency-a' },
        }),
      }),
    );
  });

  it('ignores quotes without options or lead', () => {
    expect(
      sumQuoteValue(
        [
          { lead: { stage: LeadStage.GANADO }, options: [] },
          { lead: null, options: [{ totalPrice: price(1) }] },
        ],
        [LeadStage.GANADO],
      ),
    ).toBe(0);
  });
});
