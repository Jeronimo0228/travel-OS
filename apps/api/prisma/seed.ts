import { LeadStage, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedCatalogForAgency } from './seed-catalog';
import { seedSprint3Demo } from './seed-sprint3';

const prisma = new PrismaClient();
const DEMO_PDF_PROMPT =
  '[DEMO PDF] Cotización de prueba para Cartagena - TravelOS';
const DEMO_LEADS = [
  {
    marker: '[DEMO LEAD] Seguimiento Cartagena',
    name: 'Ana Martínez (Demo)',
    email: 'ana.demo@travelos.local',
    phone: '+573001234501',
    destination: 'Cartagena',
    notes:
      '[DEMO LEAD] Seguimiento Cartagena. Lead de prueba para cotizaciones y priorización.',
    stage: LeadStage.COTIZANDO,
    daysAgo: 2,
  },
  {
    marker: '[DEMO LEAD] Prospecto Medellín',
    name: 'Carlos Ruiz (Demo)',
    email: 'carlos.demo@travelos.local',
    phone: '+573001234502',
    destination: 'Medellín',
    notes:
      '[DEMO LEAD] Prospecto Medellín. Lead de prueba para cotizaciones y priorización.',
    stage: LeadStage.PROSPECTO,
    daysAgo: 8,
  },
  {
    marker: '[DEMO LEAD] Cierre Santa Marta',
    name: 'Laura Gómez (Demo)',
    email: 'laura.demo@travelos.local',
    phone: '+573001234503',
    destination: 'Santa Marta',
    notes:
      '[DEMO LEAD] Cierre Santa Marta. Lead de prueba para cotizaciones y priorización.',
    stage: LeadStage.CIERRE,
    daysAgo: 1,
  },
] as const;

async function main() {
  const passwordHash = await bcrypt.hash('TravelOS!demo1', 10);

  const agency = await prisma.agency.upsert({
    where: { slug: 'demo-agencia' },
    update: {},
    create: {
      name: 'Agencia Demo TravelOS',
      nit: '900123456-7',
      slug: 'demo-agencia',
      primaryColor: '#4648d4',
      users: {
        create: [
          {
            email: 'admin@demo.travelos.local',
            name: 'Admin Demo',
            role: Role.ADMIN,
            passwordHash,
          },
          {
            email: 'gerente@demo.travelos.local',
            name: 'Gerente Demo',
            role: Role.GERENTE,
            passwordHash,
          },
          {
            email: 'asesor@demo.travelos.local',
            name: 'Asesor Demo',
            role: Role.ASESOR,
            passwordHash,
          },
        ],
      },
    },
  });

  const agencies = await prisma.agency.findMany({ select: { id: true } });
  for (const existingAgency of agencies) {
    await seedCatalogForAgency(prisma, existingAgency.id);
  }
  const [admin, advisor] = await Promise.all([
    prisma.user.findFirst({
      where: { agencyId: agency.id, role: Role.ADMIN },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { agencyId: agency.id, role: Role.ASESOR },
      select: { id: true },
    }),
  ]);
  if (!admin || !advisor) {
    throw new Error('Demo agency must have an admin and an advisor');
  }

  const demoLeads = [];
  for (const [index, fixture] of DEMO_LEADS.entries()) {
    const existingLead = await prisma.lead.findFirst({
      where: { agencyId: agency.id, notes: fixture.notes },
      select: { id: true },
    });
    const lead =
      existingLead ??
      (await prisma.lead.create({
        data: {
          agencyId: agency.id,
          assigneeId: advisor.id,
          name: fixture.name,
          email: fixture.email,
          phone: fixture.phone,
          destination: fixture.destination,
          notes: fixture.notes,
          stage: fixture.stage,
          createdAt: new Date(Date.now() - fixture.daysAgo * 86_400_000),
        },
        select: { id: true },
      }));
    demoLeads.push(lead);

    if (index === 0) {
      const taskTitle = '[DEMO] Contactar lead de Cartagena';
      const existingTask = await prisma.task.findFirst({
        where: { agencyId: agency.id, leadId: lead.id, title: taskTitle },
        select: { id: true },
      });
      if (!existingTask) {
        await prisma.task.create({
          data: {
            agencyId: agency.id,
            leadId: lead.id,
            createdById: advisor.id,
            title: taskTitle,
            dueAt: new Date(Date.now() - 86_400_000),
          },
        });
      }
    }
  }

  const existingDemoQuote = await prisma.quote.findFirst({
    where: { agencyId: agency.id, prompt: DEMO_PDF_PROMPT },
    select: { id: true },
  });
  if (!existingDemoQuote) {
    const cartagenaItems = await prisma.catalogItem.findMany({
      where: { agencyId: agency.id, destination: 'Cartagena' },
    });
    const hotelCentro = cartagenaItems.find(
      (item) => item.slug === 'cartagena-hotel-centro',
    );
    const hotelBocagrande = cartagenaItems.find(
      (item) => item.slug === 'cartagena-hotel-bocagrande',
    );
    const activityIslas = cartagenaItems.find(
      (item) => item.slug === 'cartagena-activity-islas',
    );
    const activityCentro = cartagenaItems.find(
      (item) => item.slug === 'cartagena-activity-centro',
    );
    if (!hotelCentro || !hotelBocagrande || !activityIslas || !activityCentro) {
      throw new Error('Demo PDF requires the Cartagena catalog fixtures');
    }

    await prisma.quote.create({
      data: {
        agencyId: agency.id,
        createdById: admin.id,
        leadId: demoLeads[0]?.id,
        prompt: DEMO_PDF_PROMPT,
        destination: 'Cartagena',
        durationDays: 4,
        travelerCount: 2,
        options: {
          create: [
            {
              position: 1,
              title: 'Centro histórico',
              summary: 'Alojamiento central con recorrido guiado.',
              totalPrice: 1_570_000,
              currency: 'COP',
              items: {
                create: [
                  {
                    catalogItemId: hotelCentro.id,
                    nameSnapshot: hotelCentro.name,
                    descriptionSnapshot: hotelCentro.description,
                    pricingUnit: hotelCentro.pricingUnit,
                    quantity: 3,
                    unitPrice: hotelCentro.price,
                  },
                  {
                    catalogItemId: activityCentro.id,
                    nameSnapshot: activityCentro.name,
                    descriptionSnapshot: activityCentro.description,
                    pricingUnit: activityCentro.pricingUnit,
                    quantity: 2,
                    unitPrice: activityCentro.price,
                  },
                ],
              },
            },
            {
              position: 2,
              title: 'Playa e islas',
              summary: 'Hotel frente al mar con paseo a las islas.',
              totalPrice: 2_365_000,
              currency: 'COP',
              items: {
                create: [
                  {
                    catalogItemId: hotelBocagrande.id,
                    nameSnapshot: hotelBocagrande.name,
                    descriptionSnapshot: hotelBocagrande.description,
                    pricingUnit: hotelBocagrande.pricingUnit,
                    quantity: 3,
                    unitPrice: hotelBocagrande.price,
                  },
                  {
                    catalogItemId: activityIslas.id,
                    nameSnapshot: activityIslas.name,
                    descriptionSnapshot: activityIslas.description,
                    pricingUnit: activityIslas.pricingUnit,
                    quantity: 2,
                    unitPrice: activityIslas.price,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  await seedSprint3Demo(prisma, agency.id, passwordHash);

  // HU-24: demo knowledge base, only when the agency has none yet.
  await prisma.agency.updateMany({
    where: { id: agency.id, aiTone: '', aiPolicies: '' },
    data: {
      aiTone:
        'Cercano, cálido y paisa, sin exagerar. Tutea al cliente y destaca la tranquilidad de viajar con acompañamiento de la agencia.',
      aiPolicies:
        '- Precios en COP, impuestos incluidos.\n- Reserva con 30 % de anticipo; saldo 15 días antes del viaje.\n- Cancelación sin penalidad hasta 15 días antes; después se retiene el anticipo.\n- Toda cotización incluye asistencia 24/7 por WhatsApp.',
      aiFaqs: [
        {
          question: '¿Las cotizaciones incluyen tiquetes aéreos?',
          answer:
            'No, salvo que se indique. Los cotizamos aparte según fechas.',
        },
        {
          question: '¿Puedo pagar a cuotas?',
          answer:
            'Sí, con tarjeta de crédito o en abonos antes del saldo final.',
        },
      ],
    },
  });

  console.log('Seed OK agency:', agency.slug);
  console.log(
    `Demo data ready: ${demoLeads.length} open leads and one PDF test quote.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
