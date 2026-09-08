import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateAgencyBrandingInput } from '@travelos/shared';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgencyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getBranding(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    return agency;
  }

  async updateBranding(
    agencyId: string,
    actorId: string,
    input: UpdateAgencyBrandingInput,
  ) {
    const agency = await this.prisma.agency.update({
      where: { id: agencyId },
      data: {
        primaryColor: input.primaryColor,
        logoUrl: input.logoUrl,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
      },
    });

    await this.auditService.log(agencyId, actorId, 'BRANDING_UPDATE', {
      primaryColor: input.primaryColor,
      hasLogo: Boolean(input.logoUrl),
    });

    return agency;
  }
}
