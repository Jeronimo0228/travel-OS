import { HttpException, type ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../prisma/prisma.service';
import { AiRateLimitGuard } from './ai-rate-limit.guard';

const contextFor = (id?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user: id ? { id } : undefined }),
    }),
  }) as unknown as ExecutionContext;

const expect429 = async (promise: Promise<boolean>) => {
  await expect(promise).rejects.toBeInstanceOf(HttpException);
  await expect(promise).rejects.toMatchObject({ status: 429 });
};

describe('AiRateLimitGuard (memoria)', () => {
  it('permite hasta el límite por usuario y luego responde 429', async () => {
    const guard = new AiRateLimitGuard(
      new ConfigService({ AI_RATE_LIMIT_PER_MIN: '2' }),
    );
    await expect(guard.canActivate(contextFor('u1'))).resolves.toBe(true);
    await expect(guard.canActivate(contextFor('u1'))).resolves.toBe(true);
    await expect429(guard.canActivate(contextFor('u1')));
    await expect(guard.canActivate(contextFor('u2'))).resolves.toBe(true);
  });

  it('libera el cupo después de la ventana de un minuto', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(0);
    const guard = new AiRateLimitGuard(
      new ConfigService({ AI_RATE_LIMIT_PER_MIN: '1' }),
    );
    await expect(guard.canActivate(contextFor('u1'))).resolves.toBe(true);
    now.mockReturnValue(60_001);
    await expect(guard.canActivate(contextFor('u1'))).resolves.toBe(true);
    now.mockRestore();
  });
});

describe('AiRateLimitGuard (compartido en PostgreSQL, HU-31)', () => {
  it('usa el contador de la base, común a todas las instancias', async () => {
    let shared = 0;
    const prisma = {
      $queryRaw: jest.fn(() => Promise.resolve([{ count: ++shared }])),
      rateCounter: { deleteMany: jest.fn().mockResolvedValue({}) },
    } as unknown as PrismaService;
    const config = new ConfigService({ AI_RATE_LIMIT_PER_MIN: '2' });
    const instanceA = new AiRateLimitGuard(config, prisma);
    const instanceB = new AiRateLimitGuard(config, prisma);
    await expect(instanceA.canActivate(contextFor('u1'))).resolves.toBe(true);
    await expect(instanceB.canActivate(contextFor('u1'))).resolves.toBe(true);
    await expect429(instanceA.canActivate(contextFor('u1')));
  });

  it('si la base falla, protege igual con el contador en memoria', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('db down')),
    } as unknown as PrismaService;
    const guard = new AiRateLimitGuard(
      new ConfigService({ AI_RATE_LIMIT_PER_MIN: '1' }),
      prisma,
    );
    await expect(guard.canActivate(contextFor('u1'))).resolves.toBe(true);
    await expect429(guard.canActivate(contextFor('u1')));
  });
});
