import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  const advisor = {
    id: 'advisor-1',
    agencyId: 'agency-a',
    role: Role.ASESOR,
  };

  const findFirst = jest.fn();
  const prisma = {
    lead: { findFirst },
  } as unknown as PrismaService;
  const auditService = {} as AuditService;
  const service = new LeadsService(prisma, auditService);

  beforeEach(() => {
    findFirst.mockReset();
  });

  it('restricts advisor lead access to their agency assignment', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.findOne(advisor, 'lead-from-another-scope')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'lead-from-another-scope',
        agencyId: 'agency-a',
        assigneeId: 'advisor-1',
      },
    });
  });
});