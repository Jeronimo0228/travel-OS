import { LeadStage, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  const findMany = jest.fn();
  const prisma = { lead: { findMany } } as unknown as PrismaService;
  const service = new MetricsService(prisma);
  const user: AuthenticatedUser = {
    id: 'manager-1',
    agencyId: 'agency-a',
    role: Role.GERENTE,
  };

  beforeEach(() => findMany.mockReset());

  it('computes sales conversion and breakdowns only from the active agency', async () => {
    findMany.mockResolvedValue([
      {
        stage: LeadStage.GANADO,
        destination: 'Cartagena',
        assigneeId: 'advisor-1',
        assignee: { name: 'Ana' },
      },
      {
        stage: LeadStage.COTIZANDO,
        destination: 'Cartagena',
        assigneeId: 'advisor-1',
        assignee: { name: 'Ana' },
      },
      {
        stage: LeadStage.PROSPECTO,
        destination: null,
        assigneeId: null,
        assignee: null,
      },
    ]);

    await expect(service.getDashboard(user)).resolves.toEqual({
      sales: { totalLeads: 3, wonLeads: 1, conversionRate: 33.33 },
      advisors: [
        { id: 'advisor-1', name: 'Ana', leads: 2, wonLeads: 1 },
        { id: 'unassigned', name: 'Sin asesor', leads: 1, wonLeads: 0 },
      ],
      destinations: [
        { destination: 'Cartagena', leads: 2, wonLeads: 1 },
        { destination: 'Sin destino', leads: 1, wonLeads: 0 },
      ],
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { agencyId: 'agency-a' } }),
    );
  });

  it('returns a zero conversion rate when the agency has no leads', async () => {
    findMany.mockResolvedValue([]);

    const result = await service.getDashboard(user);

    expect(result.sales).toEqual({
      totalLeads: 0,
      wonLeads: 0,
      conversionRate: 0,
    });
  });
});
