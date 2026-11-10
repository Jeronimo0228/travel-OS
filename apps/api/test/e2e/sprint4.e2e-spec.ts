import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { BlobStorageService } from '../../src/storage/blob-storage.service';
import {
  createE2eApp,
  extractAccessToken,
  makeE2ePrefix,
  registerPayload,
  uniqueSlug,
} from './e2e-helpers';

const SUITE = makeE2ePrefix('sprint4');
const DAY = 86_400_000;
const PASSWORD = 'S3cure-Passw0rd!';
const tokenFrom = (link: string) => link.split('#t=')[1];

describe('Sprint 4 (e2e) — HU-31 a HU-38', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function register() {
    const payload = registerPayload({}, SUITE);
    const res = await http()
      .post('/api/auth/register')
      .send(payload)
      .expect(201);
    return {
      token: extractAccessToken(res),
      userId: res.body.user.id as string,
      email: payload.adminEmail,
      slug: payload.slug,
      agencyId: res.body.user.agencyId as string,
    };
  }
  async function login(email: string, password = PASSWORD) {
    return http().post('/api/auth/login').send({ email, password });
  }

  let A: Awaited<ReturnType<typeof register>>;
  let B: Awaited<ReturnType<typeof register>>;
  let C: Awaited<ReturnType<typeof register>>;

  beforeAll(async () => {
    ({ app, prisma } = await createE2eApp());
    A = await register();
    B = await register();
    C = await register();
  });

  afterAll(async () => {
    await prisma.agency.deleteMany({ where: { slug: { startsWith: SUITE } } });
    await app.close();
  });

  describe('HU-37 recuperar contraseña', () => {
    it('responde igual exista o no el correo', async () => {
      const unknown = await http()
        .post('/api/auth/password/forgot')
        .send({ email: 'nadie@example.com' });
      const known = await http()
        .post('/api/auth/password/forgot')
        .send({ email: A.email });
      expect(unknown.status).toBe(202);
      expect(known.status).toBe(202);
      expect(known.body).toEqual(unknown.body);
      expect(
        await prisma.passwordResetToken.count({ where: { userId: A.userId } }),
      ).toBe(1);
    });

    it('el enlace cambia la contraseña una sola vez y cierra las sesiones abiertas', async () => {
      const link = await http()
        .post(`/api/users/${A.userId}/password-reset-link`)
        .set(auth(A.token))
        .expect(201);
      const token = tokenFrom(link.body.link);
      expect(token).toHaveLength(43);
      // El token no se guarda en claro.
      expect(
        await prisma.passwordResetToken.findFirst({
          where: { tokenHash: token },
        }),
      ).toBeNull();

      await http()
        .post('/api/auth/password/reset')
        .send({ token, password: 'Nueva-Clave-2026' })
        .expect(204);
      await http().get('/api/leads').set(auth(A.token)).expect(401);
      await http()
        .post('/api/auth/password/reset')
        .send({ token, password: 'Otra-Clave-2026' })
        .expect(400);
      expect((await login(A.email)).status).toBe(401);
      const relogin = await login(A.email, 'Nueva-Clave-2026');
      expect(relogin.status).toBe(200);
      A.token = extractAccessToken(relogin);
    });

    it('rechaza tokens mal formados y contraseñas cortas', async () => {
      await http()
        .post('/api/auth/password/reset')
        .send({ token: 'x', password: 'Nueva-Clave-2026' })
        .expect(400);
      await http()
        .post('/api/auth/password/reset')
        .send({ token: 'a'.repeat(43), password: 'corta' })
        .expect(400);
    });
  });

  describe('HU-38 invitar y desactivar usuarios', () => {
    let advisorToken: string;
    let advisorId: string;
    const advisorEmail = `${uniqueSlug(SUITE)}@example.com`;

    it('el administrador invita y el invitado crea su cuenta con el rol de la invitación', async () => {
      const invite = await http()
        .post('/api/users/invitations')
        .set(auth(A.token))
        .send({ email: advisorEmail, role: 'ASESOR' })
        .expect(201);
      expect(invite.body.emailSent).toBe(false);
      const token = tokenFrom(invite.body.link);

      const preview = await http()
        .post('/api/auth/invitations/preview')
        .send({ token })
        .expect(200);
      expect(preview.body).toMatchObject({
        email: advisorEmail,
        role: 'ASESOR',
      });

      const accepted = await http()
        .post('/api/auth/invitations/accept')
        .send({ token, name: 'Asesora Invitada', password: PASSWORD })
        .expect(201);
      expect(accepted.body).toMatchObject({
        email: advisorEmail,
        role: 'ASESOR',
        agencyId: A.agencyId,
      });
      advisorId = accepted.body.id;
      await http()
        .post('/api/auth/invitations/accept')
        .send({ token, name: 'Otra', password: PASSWORD })
        .expect(400);

      const res = await login(advisorEmail);
      expect(res.status).toBe(200);
      advisorToken = extractAccessToken(res);
    });

    it('un asesor no puede invitar y una invitación revocada ya no sirve', async () => {
      await http()
        .post('/api/users/invitations')
        .set(auth(advisorToken))
        .send({ email: 'x@example.com', role: 'ADMIN' })
        .expect(403);
      const invite = await http()
        .post('/api/users/invitations')
        .set(auth(A.token))
        .send({ email: `${uniqueSlug(SUITE)}@example.com`, role: 'GERENTE' })
        .expect(201);
      const list = await http()
        .get('/api/users/invitations')
        .set(auth(A.token))
        .expect(200);
      expect(list.body.map((i: { id: string }) => i.id)).toContain(
        invite.body.invitation.id,
      );
      await http()
        .delete(`/api/users/invitations/${invite.body.invitation.id}`)
        .set(auth(A.token))
        .expect(204);
      await http()
        .post('/api/auth/invitations/preview')
        .send({ token: tokenFrom(invite.body.link) })
        .expect(400);
    });

    it('no se puede invitar un correo que ya tiene cuenta', async () => {
      await http()
        .post('/api/users/invitations')
        .set(auth(A.token))
        .send({ email: B.email })
        .expect(409);
    });

    it('desactivar cierra la sesión y bloquea el login; reactivar lo devuelve', async () => {
      await http()
        .patch(`/api/users/${advisorId}/status`)
        .set(auth(A.token))
        .send({ active: false })
        .expect(200);
      await http().get('/api/leads').set(auth(advisorToken)).expect(401);
      expect((await login(advisorEmail)).status).toBe(401);
      await http()
        .patch(`/api/users/${advisorId}/status`)
        .set(auth(A.token))
        .send({ active: true })
        .expect(200);
      expect((await login(advisorEmail)).status).toBe(200);
    });

    it('nadie se desactiva a sí mismo ni toca usuarios de otra agencia', async () => {
      await http()
        .patch(`/api/users/${A.userId}/status`)
        .set(auth(A.token))
        .send({ active: false })
        .expect(403);
      await http()
        .patch(`/api/users/${advisorId}/status`)
        .set(auth(B.token))
        .send({ active: false })
        .expect(404);
    });
  });

  describe('HU-34 editor de catálogo', () => {
    let itemId: string;

    it('crea, edita y archiva; lo archivado sale del cotizador', async () => {
      const created = await http()
        .post('/api/catalog')
        .set(auth(A.token))
        .send({
          kind: 'HOTEL',
          name: 'Hotel Prueba Sprint 4',
          destination: 'Leticia',
          pricingUnit: 'PER_NIGHT',
          price: 320000,
        })
        .expect(201);
      itemId = created.body.id;
      expect(created.body.slug).toBe('hotel-prueba-sprint-4');
      await http()
        .patch(`/api/catalog/${itemId}`)
        .set(auth(A.token))
        .send({ price: 350000 })
        .expect(200);
      let list = await http()
        .get('/api/catalog?destination=Leticia')
        .set(auth(A.token))
        .expect(200);
      expect(list.body).toHaveLength(1);
      expect(Number(list.body[0].price)).toBe(350000);

      await http()
        .patch(`/api/catalog/${itemId}/archive`)
        .set(auth(A.token))
        .send({ archived: true })
        .expect(200);
      list = await http()
        .get('/api/catalog?destination=Leticia')
        .set(auth(A.token))
        .expect(200);
      expect(list.body).toHaveLength(0);
      const manage = await http()
        .get('/api/catalog/manage?includeArchived=true')
        .set(auth(A.token))
        .expect(200);
      expect(manage.body.some((i: { id: string }) => i.id === itemId)).toBe(
        true,
      );
    });

    it('otra agencia no puede editar el ítem', async () => {
      await http()
        .patch(`/api/catalog/${itemId}`)
        .set(auth(B.token))
        .send({ price: 1 })
        .expect(404);
    });

    it('importa CSV todo o nada', async () => {
      const header = 'tipo,nombre,destino,descripcion,unidad,precio,moneda';
      const bad = await http()
        .post('/api/catalog/import')
        .set(auth(A.token))
        .send({
          csv: `${header}\nhotel,Hotel Uno,Pasto,,noche,100000,\ncrucero,Mal,Pasto,,noche,1,`,
        })
        .expect(400);
      expect(bad.body.errors).toEqual([expect.objectContaining({ row: 3 })]);
      expect(
        await prisma.catalogItem.count({
          where: { agencyId: A.agencyId, destination: 'Pasto' },
        }),
      ).toBe(0);

      const ok = await http()
        .post('/api/catalog/import')
        .set(auth(A.token))
        .send({
          csv: `${header}\nhotel,Hotel Uno,Pasto,,noche,100000,\nactividad,Laguna,Pasto,"Tour, con guía",persona,"$80.000",COP`,
        })
        .expect(201);
      expect(ok.body).toEqual({ created: 2 });
    });
  });

  describe('HU-35 editar itinerario y subir documentos', () => {
    let reservationId: string;
    let itemId: string;

    beforeAll(async () => {
      const lead = await http()
        .post('/api/leads')
        .set(auth(A.token))
        .send({
          name: `${SUITE} viajero`,
          stage: 'GANADO',
          destination: 'Leticia',
        })
        .expect(201);
      const reservation = await http()
        .post('/api/reservations')
        .set(auth(A.token))
        .send({
          leadId: lead.body.id,
          travelerName: 'Viajero Leticia',
          travelerEmail: 'viajero@example.com',
          destination: 'Leticia',
          startsAt: new Date(Date.now() + 10 * DAY).toISOString(),
          endsAt: new Date(Date.now() + 14 * DAY).toISOString(),
        })
        .expect(201);
      reservationId = reservation.body.id;
      const item = await http()
        .post(`/api/reservations/${reservationId}/itinerary`)
        .set(auth(A.token))
        .send({
          title: 'Llegada',
          details: 'Traslado',
          startsAt: new Date(Date.now() + 10 * DAY).toISOString(),
        })
        .expect(201);
      itemId = item.body.id;
    });

    it('edita solo los campos enviados y limpia con null', async () => {
      const updated = await http()
        .patch(`/api/reservations/${reservationId}/itinerary/${itemId}`)
        .set(auth(A.token))
        .send({ title: 'Llegada a Leticia', details: null })
        .expect(200);
      expect(updated.body).toMatchObject({
        title: 'Llegada a Leticia',
        details: null,
      });
    });

    it('valida el cuerpo, las fechas y el alcance', async () => {
      const url = `/api/reservations/${reservationId}/itinerary/${itemId}`;
      await http().patch(url).set(auth(A.token)).send({}).expect(400);
      await http()
        .patch(url)
        .set(auth(A.token))
        .send({ title: null })
        .expect(400);
      await http()
        .patch(url)
        .set(auth(A.token))
        .send({ endsAt: new Date(Date.now() + 9 * DAY).toISOString() })
        .expect(400);
      await http()
        .patch(url)
        .set(auth(B.token))
        .send({ title: 'x' })
        .expect(403);
      await http()
        .patch(`/api/reservations/${reservationId}/itinerary/no-existe`)
        .set(auth(A.token))
        .send({ title: 'x' })
        .expect(404);
    });

    it('borra la actividad y el viajero deja de verla', async () => {
      await http()
        .delete(`/api/reservations/${reservationId}/itinerary/${itemId}`)
        .set(auth(A.token))
        .expect(204);
      await http()
        .delete(`/api/reservations/${reservationId}/itinerary/${itemId}`)
        .set(auth(A.token))
        .expect(404);
      const detail = await http()
        .get(`/api/reservations/${reservationId}`)
        .set(auth(A.token))
        .expect(200);
      expect(detail.body.itinerary).toHaveLength(0);
    });

    it('sube un PDF real y rechaza ejecutables disfrazados, archivos grandes y envíos sin archivo', async () => {
      const storage = app.get(BlobStorageService);
      const upload = jest
        .spyOn(storage, 'upload')
        .mockResolvedValue(
          'https://blob.example/agencies/a/documents/voucher.pdf',
        );
      const url = `/api/reservations/${reservationId}/documents/upload`;

      const ok = await http()
        .post(url)
        .set(auth(A.token))
        .field('name', 'Voucher hotel')
        .attach('file', Buffer.from('%PDF-1.7\n1 0 obj\n'), {
          filename: 'voucher.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);
      expect(ok.body).toMatchObject({
        name: 'Voucher hotel',
        contentType: 'application/pdf',
      });
      expect(upload).toHaveBeenCalledWith(
        A.agencyId,
        'pdf',
        'application/pdf',
        expect.any(Buffer),
      );

      await http()
        .post(url)
        .set(auth(A.token))
        .attach('file', Buffer.from('MZ\x90\x00 not a pdf'), {
          filename: 'voucher.pdf',
          contentType: 'application/pdf',
        })
        .expect(415);
      await http()
        .post(url)
        .set(auth(A.token))
        .attach('file', Buffer.alloc(4 * 1024 * 1024 + 10, 0x25), {
          filename: 'big.pdf',
          contentType: 'application/pdf',
        })
        .expect(413);
      await http()
        .post(url)
        .set(auth(A.token))
        .field('name', 'sin archivo')
        .expect(400);
      await http()
        .post(url)
        .set(auth(B.token))
        .attach('file', Buffer.from('%PDF-1.7'), {
          filename: 'x.pdf',
          contentType: 'application/pdf',
        })
        .expect(403);
      expect(upload).toHaveBeenCalledTimes(1);
      upload.mockRestore();
    });
  });

  describe('HU-33 red de agencias para mayoristas', () => {
    let partnershipId: string;
    let departureId: string;
    let programId: string;

    it('solo un mayorista puede invitar aliadas', async () => {
      await http()
        .post('/api/wholesale/partners')
        .set(auth(C.token))
        .send({ agencySlug: B.slug, commissionPct: 10 })
        .expect(403);
      await http()
        .patch('/api/wholesale/kind')
        .set(auth(C.token))
        .send({ kind: 'WHOLESALER' })
        .expect(200);
    });

    it('el mayorista invita y la aliada acepta', async () => {
      const invite = await http()
        .post('/api/wholesale/partners')
        .set(auth(C.token))
        .send({ agencySlug: B.slug, commissionPct: 12.5 })
        .expect(201);
      partnershipId = invite.body.id;
      expect(invite.body.status).toBe('PENDING');
      await http()
        .post('/api/wholesale/partners')
        .set(auth(C.token))
        .send({ agencySlug: B.slug, commissionPct: 5 })
        .expect(409);
      const mine = await http()
        .get('/api/network/partnerships')
        .set(auth(B.token))
        .expect(200);
      expect(mine.body).toHaveLength(1);
      const accepted = await http()
        .patch(`/api/network/partnerships/${partnershipId}`)
        .set(auth(B.token))
        .send({ accept: true })
        .expect(200);
      expect(accepted.body.status).toBe('ACTIVE');
    });

    it('la aliada solo ve programas publicados', async () => {
      const program = await http()
        .post('/api/wholesale/programs')
        .set(auth(C.token))
        .send({
          name: 'Amazonas 5 días',
          destination: 'Leticia',
          days: 5,
          netPrice: 2000000,
          departures: [
            {
              startsOn: new Date(Date.now() + 30 * DAY)
                .toISOString()
                .slice(0, 10),
              seats: 3,
            },
          ],
        })
        .expect(201);
      programId = program.body.id;
      departureId = program.body.departures[0].id;
      expect(
        (
          await http()
            .get('/api/network/programs')
            .set(auth(B.token))
            .expect(200)
        ).body,
      ).toHaveLength(0);
      await http()
        .patch(`/api/wholesale/programs/${programId}`)
        .set(auth(C.token))
        .send({ published: true })
        .expect(200);
      const visible = await http()
        .get('/api/network/programs')
        .set(auth(B.token))
        .expect(200);
      expect(visible.body).toHaveLength(1);
      expect(visible.body[0]).toMatchObject({
        commissionPct: '12.5',
        wholesalerName: expect.any(String),
      });
      expect(visible.body[0].departures[0].seatsLeft).toBe(3);
      // Una agencia sin alianza no ve nada.
      expect(
        (
          await http()
            .get('/api/network/programs')
            .set(auth(A.token))
            .expect(200)
        ).body,
      ).toHaveLength(0);
    });

    it('reserva cupos con tarifa neta y comisión, sin sobrevender', async () => {
      const booking = await http()
        .post('/api/network/bookings')
        .set(auth(B.token))
        .send({ departureId, travelerName: 'Familia Pérez', pax: 2 })
        .expect(201);
      expect(Number(booking.body.netTotal)).toBe(4000000);
      expect(Number(booking.body.commissionTotal)).toBe(500000);
      await http()
        .post('/api/network/bookings')
        .set(auth(B.token))
        .send({ departureId, travelerName: 'Otra familia', pax: 2 })
        .expect(409);
      await http()
        .post('/api/network/bookings')
        .set(auth(A.token))
        .send({ departureId, travelerName: 'Sin alianza', pax: 1 })
        .expect(403);

      // Dos solicitudes simultáneas por el último cupo: solo una gana.
      const [first, second] = await Promise.all([
        http()
          .post('/api/network/bookings')
          .set(auth(B.token))
          .send({ departureId, travelerName: 'P1', pax: 1 }),
        http()
          .post('/api/network/bookings')
          .set(auth(B.token))
          .send({ departureId, travelerName: 'P2', pax: 1 }),
      ]);
      expect([first.status, second.status].sort()).toEqual([201, 409]);
    });

    it('cada agencia ve solo sus reservas y el mayorista confirma', async () => {
      const incoming = await http()
        .get('/api/wholesale/bookings')
        .set(auth(C.token))
        .expect(200);
      expect(incoming.body).toHaveLength(2);
      expect(
        (
          await http()
            .get('/api/network/bookings')
            .set(auth(B.token))
            .expect(200)
        ).body,
      ).toHaveLength(2);
      expect(
        (
          await http()
            .get('/api/network/bookings')
            .set(auth(A.token))
            .expect(200)
        ).body,
      ).toHaveLength(0);
      const id = incoming.body[0].id;
      await http()
        .patch(`/api/wholesale/bookings/${id}`)
        .set(auth(B.token))
        .send({ status: 'CONFIRMED' })
        .expect(404);
      await http()
        .patch(`/api/wholesale/bookings/${id}`)
        .set(auth(C.token))
        .send({ status: 'CONFIRMED' })
        .expect(200);
      await http()
        .patch(`/api/network/bookings/${id}/cancel`)
        .set(auth(B.token))
        .expect(404);
    });
  });

  describe('HU-31 límites compartidos', () => {
    it('el contador vive en la base de datos', async () => {
      await prisma.$executeRaw`INSERT INTO "RateCounter" ("key","windowStart","count") VALUES ('e2e:probe', now(), 1)`;
      const row = await prisma.rateCounter.findFirst({
        where: { key: 'e2e:probe' },
      });
      expect(row?.count).toBe(1);
      await prisma.rateCounter.deleteMany({ where: { key: 'e2e:probe' } });
    });
  });
});
