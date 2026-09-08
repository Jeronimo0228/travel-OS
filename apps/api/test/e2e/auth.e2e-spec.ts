import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * QA NOTE — Sprint 1 (Issues #1 HU-01, #2 HU-02, #7 HU-07):
 * At the time this file was written, apps/api/src has no auth/leads modules
 * yet (only Prisma + Health are wired into AppModule) — see
 * documentation/plans/sprint-1/backend.md. These specs encode the agreed
 * contract from packages/shared/src/schemas/{auth,lead}.ts and
 * documentation/sprint-1/functional-tests/CP-HU-{01,02,07}.md as executable
 * acceptance criteria. They are expected to be RED (404 "Cannot POST ...")
 * until the backend implements the routes, then should go green unmodified.
 * Requires a reachable Postgres at DATABASE_URL (see docker-compose.yml).
 */

const TEST_PREFIX = 'qa-e2e';

function uniqueSlug(): string {
  return `${TEST_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function registerPayload(overrides: Partial<Record<string, string>> = {}) {
  const slug = uniqueSlug();
  return {
    agencyName: `QA Agency ${slug}`,
    slug,
    adminEmail: `${slug}@example.com`,
    adminPassword: 'S3cure-Passw0rd!',
    adminName: 'QA Admin',
    ...overrides,
  };
}

function expectStatusIn(res: { status: number }, allowed: number[]) {
  if (!allowed.includes(res.status)) {
    throw new Error(`Expected status in [${allowed.join(', ')}], got ${res.status}`);
  }
}

describe('Auth (e2e) — HU-01 register-agency, HU-02 login, HU-07 tenant isolation', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror apps/api/src/main.ts so the e2e suite exercises the same pipes/prefix as prod.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    // Agency -> User/Lead/Task/AuditLog is onDelete: Cascade, so deleting the
    // agencies this suite created is enough to clean up everything.
    await prisma.agency.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
    await app.close();
  });

  describe('POST /api/auth/register-agency (HU-01)', () => {
    it('CP-01-01: valid data creates an isolated tenant and its admin user', async () => {
      const payload = registerPayload();

      const res = await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(payload)
        .expect(201);

      expect(res.body).toMatchObject({
        agency: { name: payload.agencyName, slug: payload.slug },
      });
      // The password (hashed or plain) must never round-trip to the client.
      const raw = JSON.stringify(res.body);
      expect(raw).not.toContain('passwordHash');
      expect(raw).not.toContain(payload.adminPassword);

      const created = await prisma.agency.findUnique({ where: { slug: payload.slug } });
      expect(created).not.toBeNull();
    });

    it('CP-01-02: duplicate slug is rejected and no second tenant is created', async () => {
      const payload = registerPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(payload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send({ ...payload, adminEmail: `second-${payload.adminEmail}` });
      expectStatusIn(res, [400, 409]);
      expect(res.body.message).toBeDefined();

      const count = await prisma.agency.count({ where: { slug: payload.slug } });
      expect(count).toBe(1);
    });

    it('CP-01-03: invalid email fails validation (400) and creates no tenant', async () => {
      const payload = registerPayload({ adminEmail: 'not-an-email' });

      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(payload)
        .expect(400);

      const created = await prisma.agency.findUnique({ where: { slug: payload.slug } });
      expect(created).toBeNull();
    });

    it('CP-01-03b: missing required fields fails validation (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send({})
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  describe('POST /api/auth/login (HU-02)', () => {
    it('CP-02-01: valid credentials return a JWT access token', async () => {
      const payload = registerPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(payload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: payload.adminEmail, password: payload.adminPassword })
        .expect(200);

      // ASSUMPTION: the token is returned as `accessToken`. Update this once
      // the backend team confirms the login response DTO.
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('CP-02-02: wrong password is rejected with 401', async () => {
      const payload = registerPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(payload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: payload.adminEmail, password: 'wrong-password' })
        .expect(401);

      expect(res.body.accessToken).toBeUndefined();
    });

    it('CP-02-02b: unknown email fails with the same generic message as wrong password (no user enumeration)', async () => {
      const unknownEmailRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever123' })
        .expect(401);

      const payload = registerPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(payload)
        .expect(201);
      const wrongPasswordRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: payload.adminEmail, password: 'wrong-password' })
        .expect(401);

      expect(unknownEmailRes.body.message).toEqual(wrongPasswordRes.body.message);
    });

    it('CP-02-04: a garbage bearer token is rejected with 401 on a protected route', async () => {
      await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });

  describe('Multi-tenant isolation on leads (HU-07 AC-04)', () => {
    it('CP-07-04: agency B cannot list, read, or edit a lead created by agency A', async () => {
      // Arrange: two independent tenants, each with their own admin user.
      const agencyA = registerPayload();
      const agencyB = registerPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(agencyA)
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/auth/register-agency')
        .send(agencyB)
        .expect(201);

      const loginA = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: agencyA.adminEmail, password: agencyA.adminPassword })
        .expect(200);
      const loginB = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: agencyB.adminEmail, password: agencyB.adminPassword })
        .expect(200);

      const tokenA: string = loginA.body.accessToken;
      const tokenB: string = loginB.body.accessToken;

      // A creates a lead inside its own tenant.
      const createRes = await request(app.getHttpServer())
        .post('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Cliente Tenant A', stage: 'PROSPECTO' })
        .expect(201);
      const leadId: string = createRes.body.id;
      expect(leadId).toBeDefined();

      // B must not see it in its own listing...
      const listAsB = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);
      expect(
        (listAsB.body as Array<{ id: string }>).find((l) => l.id === leadId),
      ).toBeUndefined();

      // ...nor fetch it directly...
      const getAsB = await request(app.getHttpServer())
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expectStatusIn(getAsB, [403, 404]);

      // ...nor edit it.
      const patchAsB = await request(app.getHttpServer())
        .patch(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hijacked' });
      expectStatusIn(patchAsB, [403, 404]);

      // Sanity check: isolation is scoped to B, A can still see its own lead.
      const listAsA = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(
        (listAsA.body as Array<{ id: string }>).some((l) => l.id === leadId),
      ).toBe(true);
    });
  });
});
