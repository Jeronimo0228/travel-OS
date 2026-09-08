import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  agencyId: string;
  role: Role;
}
