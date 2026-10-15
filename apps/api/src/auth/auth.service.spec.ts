import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const findFirst = jest.fn();
  const transaction = jest.fn();
  const auditLog = jest.fn();

  const prisma = {
    user: { findFirst },
    $transaction: transaction,
  } as unknown as PrismaService;

  const auditService = {
    log: auditLog,
  } as unknown as AuditService;

  let jwt: JwtService;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwt = new JwtService({ secret: 'unit-test-secret' });
    service = new AuthService(prisma, jwt, auditService);
  });

  describe('registerAgency()', () => {
    it('seeds agency-scoped catalog inventory during registration', async () => {
      const agencyCreate = jest.fn().mockResolvedValue({ id: 'agency-new' });
      const catalogCreateMany = jest.fn().mockResolvedValue({ count: 10 });
      const userCreate = jest.fn().mockResolvedValue({
        id: 'admin-new',
        agencyId: 'agency-new',
        email: 'admin@new-agency.com',
        name: 'Admin',
        role: Role.ADMIN,
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      transaction.mockImplementation((callback) =>
        callback({
          agency: { create: agencyCreate },
          catalogItem: { createMany: catalogCreateMany },
          user: { create: userCreate },
        }),
      );

      const result = await service.registerAgency({
        agencyName: 'Nueva Agencia SAS',
        nit: '900111223',
        slug: 'nueva-agencia',
        adminEmail: 'admin@new-agency.com',
        adminPassword: 'S3cure-Passw0rd!',
        adminName: 'Admin',
      });

      expect(result.user.agencyId).toBe('agency-new');
      expect(catalogCreateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ agencyId: 'agency-new' }),
          ]),
          skipDuplicates: true,
        }),
      );
    });

    it('rejects duplicate admin emails before creating the tenant', async () => {
      findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.registerAgency({
          agencyName: 'Duplicada SAS',
          nit: '900111222',
          slug: 'duplicada',
          adminEmail: 'admin@duplicada.com',
          adminPassword: 'S3cure-Passw0rd!',
          adminName: 'Admin',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(transaction).not.toHaveBeenCalled();
    });

    it('maps Prisma unique violations to ConflictException', async () => {
      findFirst.mockResolvedValue(null);
      transaction.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          meta: { target: ['slug'] },
        }),
      );

      await expect(
        service.registerAgency({
          agencyName: 'Duplicada SAS',
          nit: '900111222',
          slug: 'ya-existe',
          adminEmail: 'admin@duplicada.com',
          adminPassword: 'S3cure-Passw0rd!',
          adminName: 'Admin',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login()', () => {
    it('returns a JWT cookie payload for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('S3cure-Passw0rd!', 10);
      findFirst.mockResolvedValue({
        id: 'user-1',
        agencyId: 'agency-1',
        email: 'admin@example.com',
        name: 'Admin',
        role: Role.ADMIN,
        passwordHash,
      });
      auditLog.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'admin@example.com',
        password: 'S3cure-Passw0rd!',
      });

      expect(result.user).toMatchObject({
        id: 'user-1',
        agencyId: 'agency-1',
        email: 'admin@example.com',
        role: Role.ADMIN,
      });
      expect(result.accessToken.split('.')).toHaveLength(3);
      expect(auditLog).toHaveBeenCalledWith(
        'agency-1',
        'user-1',
        'LOGIN_SUCCESS',
      );
    });

    it('audits failed password attempts and rejects them', async () => {
      const passwordHash = await bcrypt.hash('S3cure-Passw0rd!', 10);
      findFirst.mockResolvedValue({
        id: 'user-1',
        agencyId: 'agency-1',
        email: 'admin@example.com',
        name: 'Admin',
        role: Role.ADMIN,
        passwordHash,
      });
      auditLog.mockResolvedValue(undefined);

      await expect(
        service.login({
          email: 'admin@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(auditLog).toHaveBeenCalledWith('agency-1', 'user-1', 'LOGIN_FAIL');
    });
  });
});
