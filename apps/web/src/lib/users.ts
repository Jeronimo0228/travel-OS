import type { Role } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type AgencyUser = {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  role: Role;
};

export function listAgencyUsers() {
  return apiFetch<AgencyUser[]>("/api/users");
}
