import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * QA NOTE — Sprint 1 (Issues #1 HU-01, #2 HU-02).
 *
 * `apps/api/src/auth/auth.service.ts` does not exist yet — the only modules
 * wired into AppModule today are Prisma and Health. Running this file will
 * currently fail at import time ("Cannot find module './auth.service'"),
 * which is a different (harder) failure mode than the e2e specs' 404s: it
 * breaks the whole suite, not just individual assertions. That is expected —
 * this file is the proposed unit-level contract for AuthService, for
 * Backend to implement against:
 *
 *   class AuthService {
 *     constructor(prisma: PrismaService, jwt: JwtService) {}
 *     hashPassword(password: string): Promise<string>
 *     validatePassword(password: string, hash: string): Promise<boolean>
 *     generateToken(payload: { sub: string; email: string; agencyId: string; role: string }): string
 *     registerAgency(input: RegisterAgencyInput): Promise<{ agency: Agency; adminUser: User }>
 *   }
 *
 * PrismaService is mocked via jest.mock() with a factory (plain automock
 * would not reproduce Prisma's runtime-generated `.user`/`.agency` model
 * delegates, since those aren't part of the module's static shape).
 * bcrypt and JwtService are used for real — hashing/token generation is
 * exactly the crypto logic under test here, mocking it would test nothing.
 */
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    agency: { create: jest.fn(), findUnique: jest.fn() },
    user: { create: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  })),
}));

describe('AuthService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let jwt: JwtService;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaService() as jest.Mocked<PrismaService>;
    // Real JwtService (not mocked) so generateToken() produces a genuine,
    // verifiable JWT instead of an opaque mock return value.
    jwt = new JwtService({ secret: 'unit-test-secret' });
    service = new AuthService(prisma, jwt);
  });

  describe('hashPassword()', () => {
    it('never returns the plaintext password', async () => {
      const plain = 'S3cure-Passw0rd!';

      const hash = await service.hashPassword(plain);

      expect(hash).not.toBe(plain);
      expect(hash).not.toContain(plain);
      // bcrypt hash format: $2a$|$2b$|$2y$ + cost + salt/hash
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });
  });

  describe('validatePassword()', () => {
    it('returns true for the correct password against its own hash', async () => {
      const plain = 'S3cure-Passw0rd!';
      const hash = await bcrypt.hash(plain, 10);

      await expect(service.validatePassword(plain, hash)).resolves.toBe(true);
    });

    it('returns false for an incorrect password', async () => {
      const hash = await bcrypt.hash('S3cure-Passw0rd!', 10);

      await expect(service.validatePassword('wrong-password', hash)).resolves.toBe(false);
    });
  });

  describe('generateToken()', () => {
    it('creates a well-formed, verifiable JWT carrying the expected claims', () => {
      const token = service.generateToken({
        sub: 'user-1',
        email: 'admin@example.com',
        agencyId: 'agency-1',
        role: 'ADMIN',
      });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = jwt.verify(token);
      expect(decoded).toMatchObject({
        sub: 'user-1',
        email: 'admin@example.com',
        agencyId: 'agency-1',
        role: 'ADMIN',
      });
    });
  });

  describe('registerAgency() — duplicate email/slug', () => {
    it('throws a ConflictException when Prisma reports a unique constraint violation', async () => {
      // Simulate Prisma's known unique-constraint error (code P2002) that a
      // duplicate agency slug or (agencyId, email) pair would raise.
      const uniqueViolation = Object.assign(new Error('Unique constraint failed'), {
        code: 'P2002',
        meta: { target: ['slug'] },
      });
      (prisma.$transaction as jest.Mock).mockRejectedValue(uniqueViolation);

      await expect(
        service.registerAgency({
          agencyName: 'Duplicada SAS',
          slug: 'ya-existe',
          adminEmail: 'admin@duplicada.com',
          adminPassword: 'S3cure-Passw0rd!',
          adminName: 'Admin',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
