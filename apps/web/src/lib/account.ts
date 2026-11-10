import type { Role } from "@travelos/shared";
import { apiFetch } from "./api-client";

/** Token de un solo uso en el fragmento #t= (no viaja al servidor web ni queda en registros). */
export function tokenFromHash(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("t");
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

export function requestPasswordReset(email: string) {
  return apiFetch<{ message: string }>("/api/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return apiFetch<void>("/api/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export type InvitationPreview = { email: string; role: Role; agencyName: string };

export function previewInvitation(token: string) {
  return apiFetch<InvitationPreview>("/api/auth/invitations/preview", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function acceptInvitation(token: string, name: string, password: string) {
  return apiFetch<{ email: string }>("/api/auth/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ token, name, password }),
  });
}

/** Reglas mínimas que el API también exige; mensajes listos para la pantalla. */
export function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (password.length > 128) return "La contraseña es demasiado larga.";
  if (password !== confirm) return "Las contraseñas no coinciden.";
  return null;
}

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "Administrador", GERENTE: "Gerente", ASESOR: "Asesor" };
