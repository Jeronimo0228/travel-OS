import type { LoginInput, RegisterAgencyInput, Role } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type SessionUser = {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  role: Role;
};

export function login(input: LoginInput) {
  return apiFetch<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function registerAgency(input: RegisterAgencyInput) {
  return apiFetch<{ user: SessionUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export { ApiError as AuthError } from "./api-client";
