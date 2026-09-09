import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AUTH_COOKIE_NAME } from '../../src/auth/auth.constants';
import { PrismaService } from '../../src/prisma/prisma.service';

export const E2E_PREFIX = 'qa-e2e';

export function makeE2ePrefix(suite: string): string {
  return `${E2E_PREFIX}-${suite}`;
}

export function uniqueSlug(prefix = E2E_PREFIX): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function registerPayload(
  overrides: Partial<Record<string, string>> = {},
  prefix = E2E_PREFIX,
) {
  const slug = uniqueSlug(prefix);
  // Agency.nit max length is 30 in shared Zod schema.
  const nit = `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(
    0,
    30,
  );
  return {
    agencyName: `QA Agency ${slug}`,
    nit,
    slug,
    adminEmail: `${slug}@example.com`,
    adminPassword: 'S3cure-Passw0rd!',
    adminName: 'QA Admin',
    ...overrides,
  };
}

export function extractAccessToken(res: {
  headers: Record<string, string | string[] | undefined>;
}): string {
  const raw = res.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const token = cookies
    .map((cookie) => cookie.split(`${AUTH_COOKIE_NAME}=`)[1]?.split(';')[0])
    .find(Boolean);

  if (!token) {
    throw new Error('Expected access token cookie was not set');
  }

  return token;
}

export function expectStatusIn(res: { status: number }, allowed: number[]) {
  if (!allowed.includes(res.status)) {
    throw new Error(
      `Expected status in [${allowed.join(', ')}], got ${res.status}`,
    );
  }
}

export async function createE2eApp(): Promise<{
  app: INestApplication<App>;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  await app.init();

  return {
    app,
    prisma: moduleFixture.get(PrismaService),
  };
}
