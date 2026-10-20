import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PortalTokenGuard } from './portal-token.guard';

describe('PortalTokenGuard', () => {
  const findFirst = jest.fn();
  const prisma = {
    portalAccessToken: { findFirst },
  } as unknown as PrismaService;
  const guard = new PortalTokenGuard(prisma);
  const token = 'a'.repeat(43);
  const request = {
    headers: { authorization: `Bearer ${token}` },
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;

  beforeEach(() => {
    findFirst.mockReset();
    delete (request as { traveler?: { reservationId: string } }).traveler;
  });

  it('validates a hash and binds the request to its reservation', async () => {
    findFirst.mockResolvedValue({ reservationId: 'reservation-1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash('sha256').update(token).digest('hex'),
        expiresAt: { gt: expect.any(Date) },
      },
      select: { reservationId: true },
    });
    expect(request).toHaveProperty('traveler', {
      reservationId: 'reservation-1',
    });
  });

  it('rejects malformed and expired tokens', async () => {
    request.headers.authorization = 'Bearer invalid';
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(findFirst).not.toHaveBeenCalled();

    request.headers.authorization = `Bearer ${token}`;
    findFirst.mockResolvedValue(null);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
