import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  createE2eApp,
  expectStatusIn,
  extractAccessToken,
  makeE2ePrefix,
  registerPayload,
} from './e2e-helpers';

const SUITE_PREFIX = makeE2ePrefix('leads');

describe('Leads (e2e) — HU-07/08/11/12 + DELETE AC-06', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let agencyA: ReturnType<typeof registerPayload>;
  let agencyB: ReturnType<typeof registerPayload>;
  let tokenA: string;
  let tokenB: string;

  async function registerAndLogin(payload: ReturnType<typeof registerPayload>) {
    const registered = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    return extractAccessToken(registered);
  }

  function createLeadAs(token: string, overrides: Record<string, unknown> = {}) {
    return request(app.getHttpServer())
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `${SUITE_PREFIX} lead`, stage: 'PROSPECTO', ...overrides });
  }

  beforeAll(async () => {
    ({ app, prisma } = await createE2eApp());
    agencyA = registerPayload({}, SUITE_PREFIX);
    agencyB = registerPayload({}, SUITE_PREFIX);
    tokenA = await registerAndLogin(agencyA);
    tokenB = await registerAndLogin(agencyB);
  });

  afterAll(async () => {
    await prisma.agency.deleteMany({
      where: { slug: { startsWith: SUITE_PREFIX } },
    });
    await app.close();
  });

  describe('POST /api/leads (HU-07 create)', () => {
    it('CP-07-01: valid data creates a lead scoped to the caller agency', async () => {
      const res = await createLeadAs(tokenA, {
        name: 'Cliente Valido',
        email: 'cliente@example.com',
      }).expect(201);

      expect(res.body).toMatchObject({
        name: 'Cliente Valido',
        stage: 'PROSPECTO',
      });

      const persisted = await prisma.lead.findUnique({
        where: { id: res.body.id as string },
      });
      const adminA = await prisma.user.findFirst({
        where: { email: agencyA.adminEmail },
      });
      expect(persisted?.agencyId).toBe(adminA?.agencyId);
    });

    it('CP-07-03: invalid email fails validation (400)', async () => {
      const before = await prisma.lead.count();
      await createLeadAs(tokenA, {
        name: 'Cliente Malo',
        email: 'not-an-email',
      }).expect(400);
      expect(await prisma.lead.count()).toBe(before);
    });

    it('CP-07-03b: missing name fails validation (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'sin-nombre@example.com' })
        .expect(400);
    });

    it('unauthenticated create is rejected with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/leads')
        .send({ name: 'Sin Token' })
        .expect(401);
    });
  });

  describe('GET /api/leads (HU-11 list/filter)', () => {
    it('CP-11-01: list returns { items, total } for own agency', async () => {
      const created = await createLeadAs(tokenA, {
        name: 'Listable Lead',
      }).expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(
        (res.body.items as Array<{ id: string }>).some(
          (lead) => lead.id === created.body.id,
        ),
      ).toBe(true);
    });

    it('CP-11-04: agency A never sees agency B leads', async () => {
      const leadB = await createLeadAs(tokenB, { name: 'Solo de B' }).expect(
        201,
      );

      const listAsA = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(
        (listAsA.body.items as Array<{ id: string }>).find(
          (lead) => lead.id === leadB.body.id,
        ),
      ).toBeUndefined();
    });

    it('CP-11-02: filtering by stage=PROSPECTO excludes other stages', async () => {
      await createLeadAs(tokenA, {
        name: 'En Prospecto',
        stage: 'PROSPECTO',
      }).expect(201);
      const cierre = await createLeadAs(tokenA, {
        name: 'En Cierre',
        stage: 'CIERRE',
      }).expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/leads?stage=PROSPECTO')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(
        (res.body.items as Array<{ id: string }>).some(
          (lead) => lead.id === cierre.body.id,
        ),
      ).toBe(false);
    });

    it('pagination via skip/take limits results', async () => {
      await createLeadAs(tokenA, { name: 'Pag 1' }).expect(201);
      await createLeadAs(tokenA, { name: 'Pag 2' }).expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/leads?skip=0&take=1')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect((res.body.items as unknown[]).length).toBeLessThanOrEqual(1);
    });
  });

  describe('PUT /api/leads/:id (HU-07 edit + HU-08 stage move)', () => {
    it('CP-07-02 / CP-08-02: owner updates name and stage and changes persist', async () => {
      const created = await createLeadAs(tokenA, { name: 'Antes' }).expect(201);

      const res = await request(app.getHttpServer())
        .put(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Despues',
          email: 'despues@example.com',
          stage: 'COTIZANDO',
          notes: 'nota',
        })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Despues',
        email: 'despues@example.com',
        stage: 'COTIZANDO',
        notes: 'nota',
      });
    });

    it('CP-07-04: non-owner agency gets 403/404 editing foreign lead', async () => {
      const created = await createLeadAs(tokenA, {
        name: 'Propiedad de A',
      }).expect(201);

      const res = await request(app.getHttpServer())
        .put(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Secuestrado' });
      expectStatusIn(res, [403, 404]);

      const stillA = await prisma.lead.findUnique({
        where: { id: created.body.id as string },
      });
      expect(stillA?.name).toBe('Propiedad de A');
    });

    it('invalid email on update fails validation (400)', async () => {
      const created = await createLeadAs(tokenA, {
        name: 'Para validar',
      }).expect(201);

      await request(app.getHttpServer())
        .put(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('DELETE /api/leads/:id (HU-07 AC-06)', () => {
    it('CP-07-06: owner deletes own lead -> 204', async () => {
      const created = await createLeadAs(tokenA, { name: 'A Borrar' }).expect(
        201,
      );

      await request(app.getHttpServer())
        .delete(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(204);

      const gone = await prisma.lead.findUnique({
        where: { id: created.body.id as string },
      });
      expect(gone).toBeNull();
    });

    it('CP-07-07: non-owner cannot delete foreign lead', async () => {
      const created = await createLeadAs(tokenA, { name: 'Protegido' }).expect(
        201,
      );

      const res = await request(app.getHttpServer())
        .delete(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expectStatusIn(res, [403, 404]);

      const stillThere = await prisma.lead.findUnique({
        where: { id: created.body.id as string },
      });
      expect(stillThere).not.toBeNull();
    });

    it('unauthenticated delete is rejected with 401', async () => {
      const created = await createLeadAs(tokenA, {
        name: 'Para 401 delete',
      }).expect(201);

      await request(app.getHttpServer())
        .delete(`/api/leads/${created.body.id}`)
        .expect(401);
    });
  });
});
