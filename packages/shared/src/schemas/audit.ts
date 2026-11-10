import { z } from 'zod';

export const auditActions = [
  'LOGIN_SUCCESS',
  'LOGIN_FAIL',
  'ROLE_CHANGE',
  'LEAD_ASSIGN',
  'LEAD_DELETE',
  'BRANDING_UPDATE',
  'KNOWLEDGE_UPDATE',
  'PORTAL_ACCESS_ISSUED',
  'PORTAL_DOCUMENTS_VIEWED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_LINK_ISSUED',
  'PASSWORD_RESET',
  'USER_INVITED',
  'INVITATION_REVOKED',
  'INVITATION_ACCEPTED',
  'USER_DISABLED',
  'USER_ENABLED',
  'CATALOG_CREATE',
  'CATALOG_UPDATE',
  'CATALOG_ARCHIVE',
  'CATALOG_IMPORT',
  'ITINERARY_ITEM_UPDATE',
  'ITINERARY_ITEM_DELETE',
  'RESERVATION_DOCUMENT_UPLOAD',
  'AGENCY_KIND_UPDATE',
  'PARTNERSHIP_INVITE',
  'PARTNERSHIP_UPDATE',
  'PROGRAM_CREATE',
  'PROGRAM_UPDATE',
  'PROGRAM_BOOKING_REQUEST',
  'PROGRAM_BOOKING_UPDATE',
] as const;

export const listAuditLogsQuerySchema = z.object({
  action: z.enum(auditActions).optional(),
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type AuditAction = (typeof auditActions)[number];
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;