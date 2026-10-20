import {
  LeadStage,
  PortalMessageSender,
  PrismaClient,
  Role,
} from '@prisma/client';

const DAY = 86_400_000;
const MARKER = '[DEMO S3]';
const SAMPLE_PDF =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const advisors = [
  { email: 'valentina@demo.travelos.local', name: 'Valentina Ríos' },
  { email: 'mateo@demo.travelos.local', name: 'Mateo Giraldo' },
];

const leads: {
  name: string;
  destination: string;
  stage: LeadStage;
  advisor: number;
  value: number;
}[] = [
  {
    name: 'Familia Restrepo',
    destination: 'Cartagena',
    stage: LeadStage.GANADO,
    advisor: 0,
    value: 8_450_000,
  },
  {
    name: 'Daniela Ochoa',
    destination: 'Cusco',
    stage: LeadStage.GANADO,
    advisor: 1,
    value: 12_300_000,
  },
  {
    name: 'Grupo Bienestar EAFIT',
    destination: 'San Andrés',
    stage: LeadStage.GANADO,
    advisor: 0,
    value: 21_600_000,
  },
  {
    name: 'Andrés Pineda',
    destination: 'Ciudad de México',
    stage: LeadStage.GANADO,
    advisor: 2,
    value: 9_800_000,
  },
  {
    name: 'Camila Henao',
    destination: 'Madrid',
    stage: LeadStage.CIERRE,
    advisor: 1,
    value: 18_900_000,
  },
  {
    name: 'Santiago Vélez',
    destination: 'Punta Cana',
    stage: LeadStage.CIERRE,
    advisor: 0,
    value: 11_200_000,
  },
  {
    name: 'Mariana Toro',
    destination: 'Cartagena',
    stage: LeadStage.COTIZANDO,
    advisor: 2,
    value: 4_700_000,
  },
  {
    name: 'Julián Arango',
    destination: 'Eje Cafetero',
    stage: LeadStage.COTIZANDO,
    advisor: 1,
    value: 3_200_000,
  },
  {
    name: 'Isabella Mejía',
    destination: 'Cusco',
    stage: LeadStage.PROSPECTO,
    advisor: 0,
    value: 0,
  },
  {
    name: 'Tomás Cardona',
    destination: 'San Andrés',
    stage: LeadStage.PROSPECTO,
    advisor: 2,
    value: 0,
  },
  {
    name: 'Lucía Zapata',
    destination: 'Madrid',
    stage: LeadStage.PERDIDO,
    advisor: 1,
    value: 0,
  },
];

type Trip = {
  lead: number;
  traveler: string;
  email: string;
  startsInDays: number;
  nights: number;
  itinerary: {
    day: number;
    hour: number;
    title: string;
    location: string;
    details: string;
  }[];
  documents: { name: string; contentType: string }[];
  chat: { sender: PortalMessageSender; body: string; minutesAgo: number }[];
};

const trips: Trip[] = [
  {
    lead: 0,
    traveler: 'Laura Restrepo',
    email: 'laura.restrepo@demo.travelos.local',
    startsInDays: -1,
    nights: 5,
    itinerary: [
      {
        day: 0,
        hour: 9,
        title: 'Vuelo MDE → CTG (AV 9402)',
        location: 'Aeropuerto José María Córdova',
        details: 'Presentarse 2 h antes. Equipaje de bodega incluido.',
      },
      {
        day: 0,
        hour: 14,
        title: 'Check-in Hotel Casa San Agustín',
        location: 'Centro Histórico, Cartagena',
        details: 'Reserva a nombre de Laura Restrepo. Desayuno incluido.',
      },
      {
        day: 1,
        hour: 8,
        title: 'Tour Islas del Rosario en lancha',
        location: 'Muelle La Bodeguita',
        details: 'Llevar bloqueador biodegradable y efectivo para propinas.',
      },
      {
        day: 2,
        hour: 17,
        title: 'Recorrido a pie por la Ciudad Amurallada',
        location: 'Torre del Reloj',
        details: 'Guía bilingüe. Termina con cena en Getsemaní.',
      },
      {
        day: 4,
        hour: 11,
        title: 'Check-out y traslado al aeropuerto',
        location: 'Hotel Casa San Agustín',
        details: 'Transporte privado confirmado.',
      },
    ],
    documents: [
      {
        name: 'Voucher hotel Casa San Agustín',
        contentType: 'application/pdf',
      },
      {
        name: 'Tiquetes Avianca ida y regreso',
        contentType: 'application/pdf',
      },
      { name: 'Seguro de viaje Assist Card', contentType: 'application/pdf' },
    ],
    chat: [
      {
        sender: PortalMessageSender.TRAVELER,
        body: 'Hola, ¿el tour a las islas incluye almuerzo?',
        minutesAgo: 180,
      },
      {
        sender: PortalMessageSender.AGENCY,
        body: 'Hola Laura, sí: almuerzo típico en Isla Grande y bebidas sin alcohol.',
        minutesAgo: 170,
      },
      {
        sender: PortalMessageSender.TRAVELER,
        body: 'Perfecto, ¡gracias! ¿A qué hora nos recogen?',
        minutesAgo: 20,
      },
    ],
  },
  {
    lead: 1,
    traveler: 'Daniela Ochoa',
    email: 'daniela.ochoa@demo.travelos.local',
    startsInDays: 9,
    nights: 7,
    itinerary: [
      {
        day: 0,
        hour: 6,
        title: 'Vuelo BOG → LIM → CUZ',
        location: 'Aeropuerto El Dorado',
        details: 'Conexión de 2 h en Lima.',
      },
      {
        day: 1,
        hour: 9,
        title: 'Aclimatación y city tour Cusco',
        location: 'Plaza de Armas',
        details: 'Día suave por la altura. Mate de coca de bienvenida.',
      },
      {
        day: 3,
        hour: 5,
        title: 'Tren a Aguas Calientes y Machu Picchu',
        location: 'Estación Poroy',
        details: 'Entrada circuito 2 confirmada.',
      },
    ],
    documents: [
      { name: 'Pasaporte Daniela Ochoa', contentType: 'image/jpeg' },
      { name: 'Boletos Machu Picchu', contentType: 'application/pdf' },
    ],
    chat: [
      {
        sender: PortalMessageSender.TRAVELER,
        body: '¿Necesito vacuna de fiebre amarilla?',
        minutesAgo: 1440,
      },
      {
        sender: PortalMessageSender.AGENCY,
        body: 'No es obligatoria para Cusco, pero sí recomendada si visitas selva.',
        minutesAgo: 1400,
      },
    ],
  },
  {
    lead: 2,
    traveler: 'Grupo Bienestar EAFIT',
    email: 'bienestar@demo.travelos.local',
    startsInDays: 24,
    nights: 4,
    itinerary: [
      {
        day: 0,
        hour: 10,
        title: 'Vuelo grupal MDE → ADZ',
        location: 'Aeropuerto José María Córdova',
        details: '24 pasajeros. Check-in grupal.',
      },
      {
        day: 1,
        hour: 9,
        title: 'Snorkel en Johnny Cay y Acuario',
        location: 'San Andrés',
        details: 'Equipo de snorkel incluido.',
      },
    ],
    documents: [
      { name: 'Tarjeta de turismo San Andrés', contentType: 'application/pdf' },
    ],
    chat: [],
  },
];

export async function seedSprint3Demo(
  prisma: PrismaClient,
  agencyId: string,
  passwordHash: string,
) {
  const already = await prisma.lead.findFirst({
    where: { agencyId, notes: { startsWith: MARKER } },
    select: { id: true },
  });
  if (already) return;

  const existingAdvisor = await prisma.user.findFirst({
    where: { agencyId, role: Role.ASESOR },
    select: { id: true },
  });
  const advisorIds: string[] = [];
  for (const advisor of advisors) {
    const user = await prisma.user.upsert({
      where: { agencyId_email: { agencyId, email: advisor.email } },
      update: {},
      create: { ...advisor, agencyId, role: Role.ASESOR, passwordHash },
      select: { id: true },
    });
    advisorIds.push(user.id);
  }
  if (existingAdvisor) advisorIds.push(existingAdvisor.id);

  const now = Date.now();
  const createdLeads = [];
  for (const [index, fixture] of leads.entries()) {
    const assigneeId = advisorIds[fixture.advisor % advisorIds.length];
    const lead = await prisma.lead.create({
      data: {
        agencyId,
        assigneeId,
        name: fixture.name,
        email: `lead${index + 1}@demo.travelos.local`,
        destination: fixture.destination,
        stage: fixture.stage,
        notes: `${MARKER} ${fixture.destination}`,
        createdAt: new Date(now - (index + 3) * DAY),
      },
      select: { id: true },
    });
    createdLeads.push(lead);

    if (fixture.value > 0) {
      await prisma.quote.create({
        data: {
          agencyId,
          createdById: assigneeId,
          leadId: lead.id,
          prompt: `${MARKER} ${fixture.destination}`,
          destination: fixture.destination,
          durationDays: 5,
          travelerCount: 2,
          options: {
            create: [
              {
                position: 0,
                title: 'Recomendada',
                summary: `Plan ${fixture.destination}`,
                totalPrice: fixture.value,
              },
            ],
          },
        },
      });
    }

    if (
      fixture.stage === LeadStage.COTIZANDO ||
      fixture.stage === LeadStage.CIERRE
    ) {
      const task = await prisma.task.create({
        data: {
          agencyId,
          leadId: lead.id,
          createdById: assigneeId,
          title: `Llamar a ${fixture.name} para cerrar ${fixture.destination}`,
          dueAt: new Date(now - ((index % 3) + 1) * 6 * 3_600_000),
        },
        select: { id: true, dueAt: true },
      });
      await prisma.taskReminder.create({
        data: {
          agencyId,
          taskId: task.id,
          dueAt: task.dueAt as Date,
          recipientId: assigneeId,
        },
      });
    }
  }

  for (const trip of trips) {
    const startsAt = new Date(now + trip.startsInDays * DAY);
    startsAt.setUTCHours(5, 0, 0, 0);
    await prisma.reservation.create({
      data: {
        agencyId,
        leadId: createdLeads[trip.lead].id,
        travelerName: trip.traveler,
        travelerEmail: trip.email,
        destination: leads[trip.lead].destination,
        startsAt,
        endsAt: new Date(startsAt.getTime() + trip.nights * DAY),
        itinerary: {
          create: trip.itinerary.map((item, position) => ({
            title: item.title,
            location: item.location,
            details: item.details,
            position,
            startsAt: new Date(
              startsAt.getTime() + item.day * DAY + item.hour * 3_600_000,
            ),
          })),
        },
        documents: {
          create: trip.documents.map((document) => ({
            ...document,
            url: SAMPLE_PDF,
          })),
        },
        messages: {
          create: trip.chat.map((message) => ({
            sender: message.sender,
            body: message.body,
            createdAt: new Date(now - message.minutesAgo * 60_000),
          })),
        },
      },
    });
  }
}
