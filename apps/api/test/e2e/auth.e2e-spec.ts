import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AUTH_COOKIE_NAME } from '../../src/auth/auth.constants';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  createE2eApp,
  expectStatusIn,
  extractAccessToken,
  makeE2ePrefix,
  registerPayload,
} from './e2e-helpers';

const SUITE_PREFIX = makeE2ePrefix('auth');

function tryExtractAccessToken(res: {
  headers: Record<string, string | string[] | undefined>;
}): string | undefined {
  const raw = res.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return cookies
    .map((cookie) => cookie.split(`${AUTH_COOKIE_NAME}=`)[1]?.split(';')[0])
    .find(Boolean);
}

describe('Auth (e2e) — HU-01 register, HU-02 login, HU-07 tenant isolation', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createE2eApp());
  });

  afterAll(async () => {
    await prisma.agency.deleteMany({
      where: { slug: { startsWith: SUITE_PREFIX } },
    });
    await app.close();
  });

  function agencyPayload(overrides: Partial<Record<string, string>> = {}) {
    return registerPayload(overrides, SUITE_PREFIX);
  }

  describe('POST /api/auth/register (HU-01)', () => {
    it('CP-01-01: valid data creates an isolated tenant and its admin user', async () => {
      const input = agencyPayload();

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(input)
        .expect(201);

      expect(res.body).toMatchObject({
        user: { email: input.adminEmail, role: 'ADMIN' },
      });
      const raw = JSON.stringify(res.body);
      expect(raw).not.toContain('passwordHash');
      expect(raw).not.toContain(input.adminPassword);
      expect(extractAccessToken(res).split('.')).toHaveLength(3);

      const created = await prisma.agency.findUnique({
        where: { slug: input.slug },
      });
      expect(created).not.toBeNull();
    });

    it('CP-01-02: duplicate slug is rejected and no second tenant is created', async () => {
      const input = agencyPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(input)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...input,
          nit: `n2${Date.now().toString(36)}`.slice(0, 30),
          adminEmail: `second-${input.adminEmail}`,
        });
      expectStatusIn(res, [400, 409]);

      const count = await prisma.agency.count({ where: { slug: input.slug } });
      expect(count).toBe(1);
    });

    it('CP-01-03: invalid email fails validation (400)', async () => {
      const input = agencyPayload({ adminEmail: 'not-an-email' });

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(input)
        .expect(400);

      const created = await prisma.agency.findUnique({
        where: { slug: input.slug },
      });
      expect(created).toBeNull();
    });

    it('CP-01-03b: missing required fields fails validation (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/auth/login (HU-02)', () => {
    it('CP-02-01: valid credentials set a JWT cookie', async () => {
      const input = agencyPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(input)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: input.adminEmail, password: input.adminPassword })
        .expect(200);

      expect(extractAccessToken(res).split('.')).toHaveLength(3);
    });

    it('CP-02-02: wrong password is rejected with 401', async () => {
      const input = agencyPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(input)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: input.adminEmail, password: 'wrong-password' })
        .expect(401);

      expect(tryExtractAccessToken(res)).toBeUndefined();
    });

    it('CP-02-02b: unknown email uses the same generic message', async () => {
      const unknownEmailRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever123' })
        .expect(401);

      const input = agencyPayload();
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(input)
        .expect(201);
      const wrongPasswordRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: input.adminEmail, password: 'wrong-password' })
        .expect(401);

      expect(unknownEmailRes.body.message).toEqual(
        wrongPasswordRes.body.message,
      );
    });

    it('CP-02-04: garbage bearer token is rejected with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });

  describe('Multi-tenant isolation on leads (HU-07 AC-04)', () => {
    it('CP-07-04: agency B cannot list/read/edit agency A lead', async () => {
      const agencyA = agencyPayload();
      const agencyB = agencyPayload();
      const regA = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(agencyA)
        .expect(201);
      const regB = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(agencyB)
        .expect(201);

      const tokenA = extractAccessToken(regA);
      const tokenB = extractAccessToken(regB);

      const createRes = await request(app.getHttpServer())
        .post('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Cliente Tenant A', stage: 'PROSPECTO' })
        .expect(201);
      const leadId = createRes.body.id as string;

      const listAsB = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);
      expect(
        (listAsB.body.items as Array<{ id: string }>).find(
          (lead) => lead.id === leadId,
        ),
      ).toBeUndefined();

      const getAsB = await request(app.getHttpServer())
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expectStatusIn(getAsB, [403, 404]);

      const putAsB = await request(app.getHttpServer())
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hijacked' });
      expectStatusIn(putAsB, [403, 404]);

      const listAsA = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(
        (listAsA.body.items as Array<{ id: string }>).some(
          (lead) => lead.id === leadId,
        ),
      ).toBe(true);
    });
  });
});
