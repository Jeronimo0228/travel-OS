import { BadGatewayException } from '@nestjs/common';
import { LeadStage, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { LeadPrioritizationService } from './lead-prioritization.service';

describe('LeadPrioritizationService', () => {
  const findMany = jest.fn();
  const generateJson = jest.fn();
  const prisma = {
    lead: { findMany },
  } as unknown as PrismaService;
  const aiService = { generateJson } as unknown as AiService;
  const service = new LeadPrioritizationService(prisma, aiService);
  const advisor = {
    id: 'advisor-a',
    agencyId: 'agency-a',
    role: Role.ASESOR,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scores and sorts only leads visible to the authenticated advisor', async () => {
    const oldLead = {
      id: 'lead-old',
      name: 'Ana',
      destination: 'Cartagena',
      stage: 'COTIZANDO',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      tasks: [{ id: 'overdue-task' }],
    };
    const newLead = {
      ...oldLead,
      id: 'lead-new',
      name: 'Luis',
      createdAt: new Date('2026-09-01T00:00:00Z'),
      tasks: [],
    };
    findMany.mockResolvedValue([newLead, oldLead]);
    generateJson.mockResolvedValue({
      leads: [
        { leadId: 'lead-new', score: 40, reason: 'Solicitud reciente' },
        { leadId: 'lead-old', score: 90, reason: 'Tiene seguimiento vencido' },
      ],
    });

    const result = await service.prioritize(advisor, { take: 20 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          agencyId: 'agency-a',
          stage: { notIn: [LeadStage.GANADO, LeadStage.PERDIDO] },
          assigneeId: 'advisor-a',
        },
        take: 20,
      }),
    );
    expect(result.map((item) => item.lead.id)).toEqual([
      'lead-old',
      'lead-new',
    ]);
    expect(result[0]).toMatchObject({ overdueTaskCount: 1 });
    expect(result[0]?.lead).not.toHaveProperty('tasks');
    expect(generateJson).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"overdueTaskCount":1'),
      expect.anything(),
    );
  });

  it('rejects provider scores that refer outside the scoped lead set', async () => {
    findMany.mockResolvedValue([
      {
        id: 'agency-lead',
        name: 'Ana',
        destination: null,
        stage: 'PROSPECTO',
        createdAt: new Date(),
        tasks: [],
      },
    ]);
    generateJson.mockResolvedValue({
      leads: [{ leadId: 'other-agency-lead', score: 90, reason: 'Listo' }],
    });

    await expect(
      service.prioritize(advisor, { take: 20 }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('does not call the AI provider when the agency has no leads', async () => {
    findMany.mockResolvedValue([]);

    await expect(service.prioritize(advisor, { take: 20 })).resolves.toEqual(
      [],
    );
    expect(generateJson).not.toHaveBeenCalled();
  });
});
