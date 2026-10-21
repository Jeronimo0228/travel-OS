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

const SUITE_PREFIX = makeE2ePrefix('knowledge');

describe('Agency knowledge base (e2e) — HU-24', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminA: string;
  let adminB: string;

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
    adminA = await registerAndLogin();
    adminB = await registerAndLogin();
  });

  afterAll(async () => {
    await prisma.agency.deleteMany({
      where: { slug: { startsWith: SUITE_PREFIX } },
    });
    await app.close();
  });

  it('starts empty and saves tone, policies and FAQs (happy path)', async () => {
    const empty = await http()
      .get('/api/agency/knowledge')
      .set('Authorization', `Bearer ${adminA}`)
      .expect(200);
    expect(empty.body).toMatchObject({ tone: '', policies: '', faqs: [] });

    const saved = await http()
      .put('/api/agency/knowledge')
      .set('Authorization', `Bearer ${adminA}`)
      .send({
        tone: 'Cálido y cercano',
        policies: 'Anticipo del 30 %.',
        faqs: [{ question: '¿Incluye tiquetes?', answer: 'No.' }],
      })
      .expect(200);
    expect(saved.body.faqs).toHaveLength(1);

    const audit = await http()
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminA}`)
      .expect(200);
    expect(JSON.stringify(audit.body)).toContain('KNOWLEDGE_UPDATE');
  });

  it('keeps each agency knowledge isolated', async () => {
    const other = await http()
      .get('/api/agency/knowledge')
      .set('Authorization', `Bearer ${adminB}`)
      .expect(200);
    expect(other.body.tone).toBe('');
  });

  it('rejects invalid FAQs and anonymous access (alternative paths)', async () => {
    await http()
      .put('/api/agency/knowledge')
      .set('Authorization', `Bearer ${adminA}`)
      .send({ tone: 'x', policies: '', faqs: [{ question: '', answer: '' }] })
      .expect(400);
    await http().get('/api/agency/knowledge').expect(401);
  });
});
