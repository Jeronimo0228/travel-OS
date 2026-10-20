import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  createE2eApp,
  extractAccessToken,
  makeE2ePrefix,
  registerPayload,
} from './e2e-helpers';

const SUITE_PREFIX = makeE2ePrefix('portal');

describe('Traveler portal + KPIs (e2e) — HU-19/20/21/22', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let staffA: string;
  let staffB: string;
  let reservationId: string;
  let travelerToken: string;

  const http = () => request(app.getHttpServer());

  async function registerAndLogin() {
    const registered = await http()
      .post('/api/auth/register')
      .send(registerPayload({}, SUITE_PREFIX))
      .expect(201);
    return extractAccessToken(registered);
  }

  beforeAll(async () => {
    ({ app, prisma } = await createE2eApp());
    staffA = await registerAndLogin();
    staffB = await registerAndLogin();

    const lead = await http()
      .post('/api/leads')
      .set('Authorization', `Bearer ${staffA}`)
      .send({
        name: `${SUITE_PREFIX} viajera`,
        stage: 'GANADO',
        destination: 'Cartagena',
      })
      .expect(201);

    const reservation = await http()
      .post('/api/reservations')
      .set('Authorization', `Bearer ${staffA}`)
      .send({
        leadId: lead.body.id,
        travelerName: 'Ana Viajera',
        travelerEmail: 'ana.viajera@example.com',
        destination: 'Cartagena',
        startsAt: '2026-11-02T05:00:00.000Z',
        endsAt: '2026-11-06T05:00:00.000Z',
      })
      .expect(201);
    reservationId = reservation.body.id;
  });

  afterAll(async () => {
    await prisma.agency.deleteMany({
      where: { slug: { startsWith: SUITE_PREFIX } },
    });
    await app.close();
  });

  it('lets staff build the itinerary and attach HTTPS documents', async () => {
    await http()
      .post(`/api/reservations/${reservationId}/itinerary`)
      .set('Authorization', `Bearer ${staffA}`)
      .send({
        title: 'Tour Islas del Rosario',
        startsAt: '2026-11-03T13:00:00.000Z',
      })
      .expect(201);
    await http()
      .post(`/api/reservations/${reservationId}/documents`)
      .set('Authorization', `Bearer ${staffA}`)
      .send({ name: 'Voucher hotel', url: 'https://example.com/voucher.pdf' })
      .expect(201);
    await http()
      .post(`/api/reservations/${reservationId}/documents`)
      .set('Authorization', `Bearer ${staffA}`)
      .send({ name: 'Inseguro', url: 'http://example.com/x.pdf' })
      .expect(400);
  });

  it('blocks another agency from the reservation', async () => {
    await http()
      .get(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${staffB}`)
      .expect(403);
  });

  it('issues a portal token that exposes only this trip', async () => {
    const access = await http()
      .post(`/api/reservations/${reservationId}/portal-access`)
      .set('Authorization', `Bearer ${staffA}`)
      .expect(201);
    travelerToken = access.body.accessToken;

    const trip = await http()
      .get('/api/portal/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(200);
    expect(trip.body).toMatchObject({
      id: reservationId,
      destination: 'Cartagena',
    });
    expect(trip.body).not.toHaveProperty('travelerEmail');

    const itinerary = await http()
      .get('/api/portal/itinerary')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(200);
    expect(itinerary.body).toHaveLength(1);

    const documents = await http()
      .get('/api/portal/documents')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(200);
    expect(documents.body.map((doc: { name: string }) => doc.name)).toEqual([
      'Voucher hotel',
    ]);
  });

  it('records portal access in the audit log', async () => {
    const audit = await prisma.auditLog.findMany({
      where: {
        action: { in: ['PORTAL_ACCESS_ISSUED', 'PORTAL_DOCUMENTS_VIEWED'] },
        meta: { path: ['reservationId'], equals: reservationId },
      },
    });
    expect(audit.map((entry) => entry.action).sort()).toEqual([
      'PORTAL_ACCESS_ISSUED',
      'PORTAL_DOCUMENTS_VIEWED',
    ]);
  });

  it('carries a two-way chat between traveler and agency', async () => {
    await http()
      .post('/api/portal/messages')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({ body: '¿El tour incluye almuerzo?' })
      .expect(201);
    await http()
      .post(`/api/reservations/${reservationId}/messages`)
      .set('Authorization', `Bearer ${staffA}`)
      .send({ body: 'Sí, almuerzo típico incluido.' })
      .expect(201);

    const thread = await http()
      .get('/api/portal/messages')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(200);
    expect(
      thread.body.map((message: { sender: string }) => message.sender),
    ).toEqual(['TRAVELER', 'AGENCY']);
  });

  it('revokes the previous token when a new one is issued', async () => {
    await http()
      .post(`/api/reservations/${reservationId}/portal-access`)
      .set('Authorization', `Bearer ${staffA}`)
      .expect(201);
    await http()
      .get('/api/portal/reservation')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(401);
  });

  it('rejects malformed traveler tokens', async () => {
    await http()
      .get('/api/portal/itinerary')
      .set('Authorization', 'Bearer nope')
      .expect(401);
  });

  it('serves manager KPIs and operations metrics scoped to the agency', async () => {
    const metrics = await http()
      .get('/api/metrics')
      .set('Authorization', `Bearer ${staffA}`)
      .expect(200);
    expect(metrics.body.sales).toEqual({
      totalLeads: 1,
      wonLeads: 1,
      conversionRate: 100,
    });

    const operations = await http()
      .get('/api/metrics/operations')
      .set('Authorization', `Bearer ${staffA}`)
      .expect(200);
    expect(operations.body.trips.active).toBe(1);
    expect(operations.body.portal.travelerMessagesLast7Days).toBe(1);
  });
});
