export const ROLES = ['ADMIN', 'GERENTE', 'ASESOR'] as const;
export type Role = (typeof ROLES)[number];
