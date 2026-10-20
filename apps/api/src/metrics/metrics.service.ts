import { Injectable } from '@nestjs/common';
import { LeadStage } from '@prisma/client';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: AuthenticatedUser) {
    const leads = await this.prisma.lead.findMany({
      where: { agencyId: user.agencyId },
      select: {
        stage: true,
        destination: true,
        assigneeId: true,
        assignee: { select: { name: true } },
      },
    });
    const wonLeads = leads.filter((lead) => lead.stage === LeadStage.GANADO);
    const advisors = new Map<
      string,
      { name: string; leads: number; wonLeads: number }
    >();
    const destinations = new Map<string, { leads: number; wonLeads: number }>();

    for (const lead of leads) {
      const advisorId = lead.assigneeId ?? 'unassigned';
      const advisor = advisors.get(advisorId) ?? {
        name: lead.assignee?.name ?? 'Sin asesor',
        leads: 0,
        wonLeads: 0,
      };
      advisor.leads += 1;
      if (lead.stage === LeadStage.GANADO) {
        advisor.wonLeads += 1;
      }
      advisors.set(advisorId, advisor);

      const destinationName = lead.destination?.trim() || 'Sin destino';
      const destination = destinations.get(destinationName) ?? {
        leads: 0,
        wonLeads: 0,
      };
      destination.leads += 1;
      if (lead.stage === LeadStage.GANADO) {
        destination.wonLeads += 1;
      }
      destinations.set(destinationName, destination);
    }

    return {
      sales: {
        totalLeads: leads.length,
        wonLeads: wonLeads.length,
        conversionRate:
          leads.length === 0
            ? 0
            : Number(((wonLeads.length / leads.length) * 100).toFixed(2)),
      },
      advisors: [...advisors.entries()]
        .map(([id, metrics]) => ({ id, ...metrics }))
        .sort((left, right) => right.wonLeads - left.wonLeads),
      destinations: [...destinations.entries()]
        .map(([destination, metrics]) => ({ destination, ...metrics }))
        .sort((left, right) => right.wonLeads - left.wonLeads),
    };
  }
}
