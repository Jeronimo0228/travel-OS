import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LeadService } from './lead.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * QA NOTE — Sprint 1 (Issue #7 HU-07 create/edit, Issue #11 HU-11 list).
 *
 * `apps/api/src/lead/lead.service.ts` does not exist yet (backend.md plans
 * it under `apps/api/src/leads/**`, plural — flagging that path mismatch
 * for Backend to resolve; this spec follows the singular path the QA task
 * asked for). Running this file will fail at import time ("Cannot find
 * module './lead.service'") until Backend creates it — a harder failure
 * mode than the e2e specs' 404s, and expected at this stage. This file is
 * the proposed unit-level contract:
 *
 *   interface CurrentUser { id: string; agencyId: string; role: 'ADMIN' | 'GERENTE' | 'ASESOR'; }
 *
 *   class LeadService {
 *     constructor(prisma: PrismaService) {}
 *     createLead(user: CurrentUser, dto: CreateLeadInput): Promise<Lead>
 *     getLeadsByAgency(agencyId: string, filters?: { stage?: LeadStage }): Promise<Lead[]>
 *     updateLead(user: CurrentUser, leadId: string, dto: UpdateLeadInput): Promise<Lead>
 *     deleteLead(user: CurrentUser, leadId: string): Promise<void>
 *   }
 *
 * Authorization rule assumed for update/delete (mirrors CP-07-04 tenant
 * isolation + the RBAC intent in documentation/plans/sprint-1/rbac-checklist.md):
 *   - Different agencyId than the lead's -> Forbidden, no matter the role
 *     (hard tenant boundary, never bypassable).
 *   - Same agency + ADMIN/GERENTE -> allowed on any lead in the tenant.
 *   - Same agency + ASESOR -> allowed only if they are the lead's assignee
 *     ("owner"); otherwise Forbidden.
 */
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    lead: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

interface CurrentUser {
  id: string;
  agencyId: string;
  role: 'ADMIN' | 'GERENTE' | 'ASESOR';
}

const agencyA = 'agency-a';
const agencyB = 'agency-b';

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return { id: 'user-1', agencyId: agencyA, role: 'ASESOR', ...overrides };
}

describe('LeadService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: LeadService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaService() as jest.Mocked<PrismaService>;
    service = new LeadService(prisma);
  });

  describe('createLead()', () => {
    it('assigns agencyId from the authenticated user, never from the request body', async () => {
      const user = makeUser({ agencyId: agencyA });
      (prisma.lead.create as jest.Mock).mockResolvedValue({ id: 'lead-1', agencyId: agencyA });

      // Even if a malicious/naive caller smuggled an `agencyId` into the dto,
      // the service must ignore it and use the JWT-derived tenant instead.
      const dto = { name: 'Cliente', agencyId: agencyB } as unknown as {
        name: string;
      };

      await service.createLead(user, dto as never);

      expect(prisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ agencyId: agencyA, name: 'Cliente' }),
        }),
      );
    });
  });

  describe('getLeadsByAgency()', () => {
    it('queries Prisma scoped to the given agencyId', async () => {
      (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);

      await service.getLeadsByAgency(agencyA);

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ agencyId: agencyA }) }),
      );
    });

    it('merges an optional stage filter into the same agencyId-scoped where clause', async () => {
      (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);

      await service.getLeadsByAgency(agencyA, { stage: 'COTIZANDO' });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ agencyId: agencyA, stage: 'COTIZANDO' }),
        }),
      );
    });
  });

  describe('updateLead() — owner/admin authorization', () => {
    it('allows ADMIN to update a lead in their own agency even if not the assignee', async () => {
      const admin = makeUser({ id: 'admin-1', role: 'ADMIN', agencyId: agencyA });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'someone-else',
      });
      (prisma.lead.update as jest.Mock).mockResolvedValue({ id: 'lead-1', name: 'Nuevo' });

      await expect(
        service.updateLead(admin, 'lead-1', { name: 'Nuevo' } as never),
      ).resolves.toMatchObject({ name: 'Nuevo' });
    });

    it('allows ASESOR to update a lead they are assigned to (owner)', async () => {
      const asesor = makeUser({ id: 'asesor-1', role: 'ASESOR', agencyId: agencyA });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'asesor-1',
      });
      (prisma.lead.update as jest.Mock).mockResolvedValue({ id: 'lead-1', name: 'Nuevo' });

      await expect(
        service.updateLead(asesor, 'lead-1', { name: 'Nuevo' } as never),
      ).resolves.toMatchObject({ name: 'Nuevo' });
    });

    it('rejects ASESOR updating a lead assigned to someone else in the same agency', async () => {
      const asesor = makeUser({ id: 'asesor-1', role: 'ASESOR', agencyId: agencyA });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'other-asesor',
      });

      await expect(
        service.updateLead(asesor, 'lead-1', { name: 'Nuevo' } as never),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.lead.update).not.toHaveBeenCalled();
    });

    it('rejects updates across tenants regardless of role (hard boundary)', async () => {
      const adminOfB = makeUser({ id: 'admin-b', role: 'ADMIN', agencyId: agencyB });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'asesor-1',
      });

      await expect(
        service.updateLead(adminOfB, 'lead-1', { name: 'Hijack' } as never),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.lead.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the lead does not exist', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateLead(makeUser(), 'missing-lead', { name: 'x' } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteLead() — owner/admin authorization', () => {
    it('allows ADMIN to delete any lead in their own agency', async () => {
      const admin = makeUser({ id: 'admin-1', role: 'ADMIN', agencyId: agencyA });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'someone-else',
      });

      await service.deleteLead(admin, 'lead-1');

      expect(prisma.lead.delete).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
    });

    it('allows ASESOR to delete a lead they own', async () => {
      const asesor = makeUser({ id: 'asesor-1', role: 'ASESOR', agencyId: agencyA });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'asesor-1',
      });

      await service.deleteLead(asesor, 'lead-1');

      expect(prisma.lead.delete).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
    });

    it('rejects ASESOR deleting a lead assigned to someone else', async () => {
      const asesor = makeUser({ id: 'asesor-1', role: 'ASESOR', agencyId: agencyA });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'other-asesor',
      });

      await expect(service.deleteLead(asesor, 'lead-1')).rejects.toThrow(ForbiddenException);
      expect(prisma.lead.delete).not.toHaveBeenCalled();
    });

    it('rejects deletes across tenants regardless of role', async () => {
      const adminOfB = makeUser({ id: 'admin-b', role: 'ADMIN', agencyId: agencyB });
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        agencyId: agencyA,
        assigneeId: 'asesor-1',
      });

      await expect(service.deleteLead(adminOfB, 'lead-1')).rejects.toThrow(ForbiddenException);
      expect(prisma.lead.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the lead does not exist', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteLead(makeUser(), 'missing-lead')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
