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
] as const;

export const listAuditLogsQuerySchema = z.object({
  action: z.enum(auditActions).optional(),
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type AuditAction = (typeof auditActions)[number];
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;