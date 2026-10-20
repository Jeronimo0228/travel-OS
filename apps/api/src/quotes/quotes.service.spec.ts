import { AgencyKnowledgeService } from '../ai/agency-knowledge.service';
import { BadGatewayException } from '@nestjs/common';
import {
  CatalogKind,
  CatalogPricingUnit,
  PdfStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { LeadsService } from '../leads/leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuotePdfQueue } from './quote-pdf.queue';
import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  const findCatalogItems = jest.fn();
  const createQuote = jest.fn();
  const findQuote = jest.fn();
  const updateQuoteMany = jest.fn();
  const generateJson = jest.fn();
  const findLead = jest.fn();
  const enqueuePdf = jest.fn();
  const prisma = {
    catalogItem: { findMany: findCatalogItems },
    quote: {
      create: createQuote,
      findFirst: findQuote,
      updateMany: updateQuoteMany,
    },
  } as unknown as PrismaService;
  const leadsService = { findOne: findLead } as unknown as LeadsService;
  const aiService = { generateJson } as unknown as AiService;
  const pdfQueue = { enqueue: enqueuePdf } as unknown as QuotePdfQueue;
  const knowledgeService = {
    promptFor: jest
      .fn()
      .mockResolvedValue('\n\nBase de conocimiento: tono cálido'),
  } as unknown as AgencyKnowledgeService;
  const service = new QuotesService(
    prisma,
    leadsService,
    aiService,
    pdfQueue,
    knowledgeService,
  );
  const user = {
    id: 'advisor-a',
    agencyId: 'agency-a',
    role: Role.ASESOR,
  };
  const catalog = [
    {
      id: 'hotel-a',
      agencyId: 'agency-a',
      slug: 'hotel-a',
      kind: CatalogKind.HOTEL,
      name: 'Hotel Centro',
      destination: 'Cartagena',
      description: 'Hotel en el centro.',
      pricingUnit: CatalogPricingUnit.PER_NIGHT,
      price: new Prisma.Decimal(250_000),
      currency: 'COP',
      createdAt: new Date(),
    },
    {
      id: 'hotel-b',
      agencyId: 'agency-a',
      slug: 'hotel-b',
      kind: CatalogKind.HOTEL,
      name: 'Hotel Bahía',
      destination: 'Cartagena',
      description: 'Hotel frente al mar.',
      pricingUnit: CatalogPricingUnit.PER_NIGHT,
      price: new Prisma.Decimal(400_000),
      currency: 'COP',
      createdAt: new Date(),
    },
    {
      id: 'activity-a',
      agencyId: 'agency-a',
      slug: 'activity-a',
      kind: CatalogKind.ACTIVITY,
      name: 'Recorrido histórico',
      destination: 'Cartagena',
      description: 'Visita guiada.',
      pricingUnit: CatalogPricingUnit.PER_PERSON,
      price: new Prisma.Decimal(80_000),
      currency: 'COP',
      createdAt: new Date(),
    },
    {
      id: 'activity-b',
      agencyId: 'agency-a',
      slug: 'activity-b',
      kind: CatalogKind.ACTIVITY,
      name: 'Paseo en lancha',
      destination: 'Cartagena',
      description: 'Paseo por las islas.',
      pricingUnit: CatalogPricingUnit.PER_PERSON,
      price: new Prisma.Decimal(190_000),
      currency: 'COP',
      createdAt: new Date(),
    },
  ];
  const quote = {
    id: 'quote-a',
    createdById: 'advisor-a',
    leadId: null,
    prompt: 'Viaje familiar a Cartagena por cuatro días',
    destination: 'Cartagena',
    durationDays: 4,
    travelerCount: 2,
    pdfStatus: PdfStatus.NOT_REQUESTED,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates two catalog-backed alternatives under the authenticated agency', async () => {
    findCatalogItems.mockResolvedValue(catalog);
    generateJson
      .mockResolvedValueOnce({
        destination: 'Cartagena',
        durationDays: 4,
        travelers: 2,
        preferences: [],
      })
      .mockResolvedValueOnce({
        alternatives: [
          {
            title: 'Centro',
            summary: 'Hotel y recorrido guiado.',
            itemIds: ['hotel-a', 'activity-a'],
          },
          {
            title: 'Bahía',
            summary: 'Hotel y paseo en lancha.',
            itemIds: ['hotel-b', 'activity-b'],
          },
        ],
      });
    createQuote.mockResolvedValue(quote);

    const result = await service.create(user, {
      prompt: 'Viaje familiar a Cartagena por cuatro días',
    });

    expect(findCatalogItems).toHaveBeenCalledWith(
      expect.objectContaining({ where: { agencyId: 'agency-a' } }),
    );
    // HU-24: the agency knowledge base reaches the alternatives prompt.
    expect(knowledgeService.promptFor).toHaveBeenCalledWith('agency-a');
    expect(generateJson.mock.calls[1]?.[0]).toContain('tono cálido');
    const createInput = createQuote.mock.calls[0]?.[0];
    expect(createInput.data).toMatchObject({
      agencyId: 'agency-a',
      createdById: 'advisor-a',
      destination: 'Cartagena',
      durationDays: 4,
      travelerCount: 2,
      options: {
        create: [{ totalPrice: '910000.00' }, { totalPrice: '1580000.00' }],
      },
    });
    expect(result).not.toHaveProperty('createdById');
  });

  it('rejects AI-selected catalog items outside the agency catalog', async () => {
    findCatalogItems.mockResolvedValue(catalog);
    generateJson
      .mockResolvedValueOnce({
        destination: 'Cartagena',
        durationDays: 3,
        travelers: 2,
        preferences: [],
      })
      .mockResolvedValue({
        alternatives: [
          {
            title: 'Opción 1',
            summary: 'Resumen.',
            itemIds: ['foreign-hotel', 'activity-a'],
          },
          {
            title: 'Opción 2',
            summary: 'Resumen.',
            itemIds: ['hotel-b', 'activity-b'],
          },
        ],
      });

    await expect(
      service.create(user, {
        prompt: 'Viaje a Cartagena con actividades',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(createQuote).not.toHaveBeenCalled();
  });

  it('regenerates the proposal once when the first one is unusable', async () => {
    findCatalogItems.mockResolvedValue(catalog);
    const good = {
      alternatives: [
        { title: 'A', summary: 'S', itemIds: ['hotel-a', 'activity-a'] },
        { title: 'B', summary: 'S', itemIds: ['hotel-b', 'activity-b'] },
      ],
    };
    generateJson
      .mockReset()
      .mockResolvedValueOnce({
        destination: 'Cartagena',
        durationDays: 3,
        travelers: 2,
        preferences: [],
      })
      .mockResolvedValueOnce({
        alternatives: [
          { title: 'A', summary: 'S', itemIds: ['foreign', 'activity-a'] },
          { title: 'B', summary: 'S', itemIds: ['hotel-b', 'activity-b'] },
        ],
      })
      .mockResolvedValueOnce(good);
    createQuote.mockResolvedValue(quote);

    await expect(
      service.create(user, { prompt: 'Viaje a Cartagena con actividades' }),
    ).resolves.toBeDefined();
    expect(generateJson).toHaveBeenCalledTimes(3);
  });

  it('links a quote only after verifying access to the lead', async () => {
    findQuote.mockResolvedValue(quote);
    findLead.mockResolvedValue({ id: 'lead-a' });
    updateQuoteMany.mockResolvedValue({ count: 1 });

    await service.linkLead(user, 'quote-a', { leadId: 'lead-a' });

    expect(findLead).toHaveBeenCalledWith(user, 'lead-a');
    expect(updateQuoteMany).toHaveBeenCalledWith({
      where: { id: 'quote-a', agencyId: 'agency-a' },
      data: { leadId: 'lead-a' },
    });
  });

  it('queues PDF generation and reports pending status', async () => {
    findQuote.mockResolvedValue(quote);
    updateQuoteMany.mockResolvedValue({ count: 1 });
    enqueuePdf.mockResolvedValue(undefined);

    await expect(service.requestPdf(user, 'quote-a')).resolves.toEqual({
      status: PdfStatus.PENDING,
    });
    expect(updateQuoteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'quote-a',
          agencyId: 'agency-a',
          pdfStatus: PdfStatus.NOT_REQUESTED,
        },
        data: {
          pdfStatus: PdfStatus.PENDING,
          pdfData: null,
        },
      }),
    );
    expect(enqueuePdf).toHaveBeenCalledWith('agency-a', 'quote-a');
  });

  it('re-enqueues a pending PDF job if a previous enqueue was interrupted', async () => {
    findQuote.mockResolvedValue({ ...quote, pdfStatus: PdfStatus.PENDING });
    enqueuePdf.mockResolvedValue(undefined);

    await expect(service.requestPdf(user, 'quote-a')).resolves.toEqual({
      status: PdfStatus.PENDING,
    });
    expect(updateQuoteMany).not.toHaveBeenCalled();
    expect(enqueuePdf).toHaveBeenCalledWith('agency-a', 'quote-a');
  });
});
