import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PortalMessageSender, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { LeadsService } from '../leads/leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { PortalService } from './portal.service';

describe('PortalService', () => {
  const user: AuthenticatedUser = {
    id: 'advisor-1',
    agencyId: 'agency-a',
    role: Role.ASESOR,
  };
  const reservation = {
    id: 'reservation-1',
    agencyId: 'agency-a',
    leadId: 'lead-1',
    travelerName: 'Traveler',
  };
  const findFirst = jest.fn();
  const create = jest.fn();
  const deleteMany = jest.fn();
  const transaction = jest.fn();
  const prisma = {
    reservation: { findFirst },
    portalAccessToken: { create, deleteMany },
    $transaction: transaction,
  } as unknown as PrismaService;
  const leadsService = {} as LeadsService;
  const service = new PortalService(prisma, leadsService);

  beforeEach(() => {
    findFirst.mockReset();
    create.mockReset();
    deleteMany.mockReset();
    transaction.mockReset();
  });

  it('limits advisor reservation access to their agency and lead assignments', async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      service.getReservation(user, 'reservation-other'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'reservation-other',
        agencyId: 'agency-a',
        lead: { is: { assigneeId: 'advisor-1' } },
      },
    });
  });

  it('returns a random access token while persisting only its hash', async () => {
    findFirst.mockResolvedValue(reservation);
    deleteMany.mockResolvedValue({ count: 0 });
    create.mockResolvedValue({ id: 'access-token-1' });
    transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    const result = await service.createAccessToken(user, 'reservation-1');

    expect(result.accessToken).toHaveLength(43);
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reservationId: 'reservation-1',
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      }),
    );
    expect(create.mock.calls[0][0].data.tokenHash).not.toBe(result.accessToken);
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects traveler access after its reservation has been removed', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const travelerPrisma = {
      reservation: { findUnique },
    } as unknown as PrismaService;
    const travelerService = new PortalService(travelerPrisma, leadsService);

    await expect(
      travelerService.getTravelerReservation('reservation-removed'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('uses traveler sender identity for portal messages', async () => {
    const messageCreate = jest.fn().mockResolvedValue({ id: 'message-1' });
    const chatPrisma = {
      chatMessage: { create: messageCreate },
    } as unknown as PrismaService;
    const chatService = new PortalService(chatPrisma, leadsService);

    await chatService.addTravelerMessage('reservation-1', { body: 'Hello' });

    expect(messageCreate).toHaveBeenCalledWith({
      data: {
        reservationId: 'reservation-1',
        sender: PortalMessageSender.TRAVELER,
        body: 'Hello',
      },
    });
  });

  it('returns the newest chat page in chronological display order', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'newer' }, { id: 'older' }]);
    const chatPrisma = {
      chatMessage: { findMany },
    } as unknown as PrismaService;
    const chatService = new PortalService(chatPrisma, leadsService);

    await expect(
      chatService.listTravelerMessages('reservation-1'),
    ).resolves.toEqual([{ id: 'older' }, { id: 'newer' }]);
    expect(findMany).toHaveBeenCalledWith({
      where: { reservationId: 'reservation-1' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  });
});
