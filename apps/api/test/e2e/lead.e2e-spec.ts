import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * QA NOTE — Sprint 1 Lead CRUD.
 *
 * Mapping to the *actual* documented backlog (documentation/sprint-1/functional-tests/):
 *   - Create + edit lead  -> HU-07 "Crear y editar leads" (Issue #7)
 *   - List + filter leads -> HU-11 "Listado y filtros de clientes" (Issue #11)
 *   - Delete lead         -> NOT covered by any CP-HU-*.md today. There is no
 *     documented AC for DELETE /leads. These delete tests encode the REST
 *     completeness expected from a CRUD resource and the tenant-isolation
 *     rule in .cursor/rules/security-multitenant.mdc, but the gap should be
 *     raised with the PO so it gets a formal AC (see final QA report).
 *
 * (CP-HU-03/04/05/06 are RBAC, Branding, Audit and Healthcheck respectively —
 * they are NOT about leads, despite HU numbers sometimes being assumed to
 * line up 1:1 with CRUD steps.)
 *
 * As with auth.e2e-spec.ts, apps/api/src has no `leads` module yet, so these
 * specs are expected to be RED until Backend implements Issue #7/#11. They
 * are the executable contract, written against packages/shared/src/schemas/lead.ts.
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

describe('Leads (e2e) — HU-07 create/edit, HU-11 list/filter, delete (undocumented)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Two independent tenants shared across the whole suite so we don't pay
  // register+login twice per test; each `it` still creates its own leads.
  let agencyA: ReturnType<typeof registerPayload>;
  let agencyB: ReturnType<typeof registerPayload>;
  let tokenA: string;
  let tokenB: string;

  // Registers agency + logs in, returns the bearer token for its admin user.
  async function registerAndLogin(payload: ReturnType<typeof registerPayload>) {
    await request(app.getHttpServer())
      .post('/api/auth/register-agency')
      .send(payload)
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: payload.adminEmail, password: payload.adminPassword })
      .expect(200);

    return login.body.accessToken as string;
  }

  function createLeadAs(token: string, overrides: Record<string, unknown> = {}) {
    return request(app.getHttpServer())
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `${TEST_PREFIX} lead`, stage: 'PROSPECTO', ...overrides });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    agencyA = registerPayload();
    agencyB = registerPayload();
    tokenA = await registerAndLogin(agencyA);
    tokenB = await registerAndLogin(agencyB);
  });

  afterAll(async () => {
    // Leads have no natural prefix field of their own; deleting the two test
    // agencies cascades (onDelete: Cascade in schema.prisma) to their leads,
    // tasks and audit logs, so this is enough cleanup.
    await prisma.agency.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
    await app.close();
  });

  describe('POST /api/leads (HU-07 create)', () => {
    it('CP-07-01: valid data creates a lead scoped to the caller\'s agency', async () => {
      const res = await createLeadAs(tokenA, {
        name: 'Cliente Valido',
        email: 'cliente@example.com',
      }).expect(201);

      expect(res.body).toMatchObject({
        name: 'Cliente Valido',
        stage: 'PROSPECTO',
      });
      expect(res.body.id).toBeDefined();

      // Multi-tenant: the lead must be persisted under the caller's own
      // agencyId, never a client-supplied one (security-multitenant.mdc).
      const persisted = await prisma.lead.findUnique({ where: { id: res.body.id } });
      const adminA = await prisma.user.findUnique({ where: { email: agencyA.adminEmail } });
      expect(persisted?.agencyId).toBe(adminA?.agencyId);
    });

    it('CP-07-03: invalid email fails validation (400) and creates no lead', async () => {
      const before = await prisma.lead.count();

      await createLeadAs(tokenA, { name: 'Cliente Malo', email: 'not-an-email' }).expect(400);

      const after = await prisma.lead.count();
      expect(after).toBe(before);
    });

    it('CP-07-03b: missing required "name" fails validation (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'sin-nombre@example.com' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('unauthenticated request is rejected with 401 (HU-02 AC-04 applied to /leads)', async () => {
      await request(app.getHttpServer())
        .post('/api/leads')
        .send({ name: 'Sin Token' })
        .expect(401);
    });
  });

  describe('GET /api/leads (HU-11 list/filter)', () => {
    it('CP-11-01: authenticated user gets an array of leads from their own agency', async () => {
      const created = await createLeadAs(tokenA, { name: 'Listable Lead' }).expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(
        (res.body as Array<{ id: string }>).some((l) => l.id === created.body.id),
      ).toBe(true);
    });

    it('unauthenticated request is rejected with 401', async () => {
      await request(app.getHttpServer()).get('/api/leads').expect(401);
    });

    it('CP-11-04 (tenant isolation, implicit — security-multitenant.mdc): agency A never sees agency B leads in the list', async () => {
      const leadB = await createLeadAs(tokenB, { name: 'Solo de B' }).expect(201);

      const listAsA = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(
        (listAsA.body as Array<{ id: string }>).find((l) => l.id === leadB.body.id),
      ).toBeUndefined();
    });

    it('CP-11-02: filtering by stage=PROSPECTO returns only leads in that stage', async () => {
      await createLeadAs(tokenA, { name: 'En Prospecto', stage: 'PROSPECTO' }).expect(201);
      const cierre = await createLeadAs(tokenA, { name: 'En Cierre', stage: 'CIERRE' }).expect(
        201,
      );

      const res = await request(app.getHttpServer())
        .get('/api/leads?stage=PROSPECTO')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const stages = new Set((res.body as Array<{ stage: string }>).map((l) => l.stage));
      expect(stages.has('CIERRE')).toBe(false);
      expect(
        (res.body as Array<{ id: string }>).some((l) => l.id === cierre.body.id),
      ).toBe(false);
    });

    it('pagination via ?skip=&take= limits and offsets results (best-effort: scheme not finalized in docs)', async () => {
      // Seed a few extra leads so a take=1 actually exercises the limit.
      await createLeadAs(tokenA, { name: 'Pag 1' }).expect(201);
      await createLeadAs(tokenA, { name: 'Pag 2' }).expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/leads?skip=0&take=1')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBeLessThanOrEqual(1);
    });
  });

  describe('PATCH /api/leads/:id (HU-07 edit)', () => {
    it('CP-07-02: owner agency updates name/email/stage/notes and changes persist', async () => {
      const created = await createLeadAs(tokenA, { name: 'Antes' }).expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Despues', email: 'despues@example.com', stage: 'COTIZANDO', notes: 'nota' })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Despues',
        email: 'despues@example.com',
        stage: 'COTIZANDO',
        notes: 'nota',
      });
    });

    it('CP-07-04: non-owner agency (B) gets 403/404 editing agency A\'s lead', async () => {
      const created = await createLeadAs(tokenA, { name: 'Propiedad de A' }).expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Secuestrado' });
      expectStatusIn(res, [403, 404]);

      // The lead itself must be untouched.
      const stillA = await prisma.lead.findUnique({ where: { id: created.body.id } });
      expect(stillA?.name).toBe('Propiedad de A');
    });

    it('non-existent lead id returns 404', async () => {
      await request(app.getHttpServer())
        .patch('/api/leads/does-not-exist')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'x' })
        .expect(404);
    });

    it('unauthenticated request is rejected with 401', async () => {
      const created = await createLeadAs(tokenA, { name: 'Para 401' }).expect(201);

      await request(app.getHttpServer())
        .patch(`/api/leads/${created.body.id}`)
        .send({ name: 'x' })
        .expect(401);
    });

    it('invalid email on update fails validation (400)', async () => {
      const created = await createLeadAs(tokenA, { name: 'Para validar' }).expect(201);

      await request(app.getHttpServer())
        .patch(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('DELETE /api/leads/:id (no formal HU/CP documented — REST completeness)', () => {
    it('owner agency deletes its own lead -> 204', async () => {
      const created = await createLeadAs(tokenA, { name: 'A Borrar' }).expect(201);

      await request(app.getHttpServer())
        .delete(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(204);

      const gone = await prisma.lead.findUnique({ where: { id: created.body.id } });
      expect(gone).toBeNull();
    });

    it('non-owner agency (B) gets 403/404 deleting agency A\'s lead, lead survives', async () => {
      const created = await createLeadAs(tokenA, { name: 'Protegido' }).expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/api/leads/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expectStatusIn(res, [403, 404]);

      const stillThere = await prisma.lead.findUnique({ where: { id: created.body.id } });
      expect(stillThere).not.toBeNull();
    });

    it('non-existent lead id returns 404', async () => {
      await request(app.getHttpServer())
        .delete('/api/leads/does-not-exist')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });

    it('unauthenticated request is rejected with 401', async () => {
      const created = await createLeadAs(tokenA, { name: 'Para 401 delete' }).expect(201);

      await request(app.getHttpServer())
        .delete(`/api/leads/${created.body.id}`)
        .expect(401);
    });
  });
});
