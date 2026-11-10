import type { Role } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type TeamUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  disabledAt: string | null;
  createdAt: string;
};
export type Invitation = { id: string; email: string; role: Role; expiresAt: string; createdAt: string };

export const listTeam = () => apiFetch<TeamUser[]>("/api/users");
export const listInvitations = () => apiFetch<Invitation[]>("/api/users/invitations");
export const changeRole = (id: string, role: Role) =>
  apiFetch<TeamUser>(`/api/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
export const setUserActive = (id: string, active: boolean) =>
  apiFetch<TeamUser>(`/api/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) });
export const passwordResetLink = (id: string) =>
  apiFetch<{ link: string; expiresInMinutes: number }>(`/api/users/${id}/password-reset-link`, { method: "POST" });
export const inviteUser = (email: string, role: Role) =>
  apiFetch<{ invitation: Invitation; link: string; emailSent: boolean }>("/api/users/invitations", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
export const revokeInvitation = (id: string) => apiFetch<void>(`/api/users/invitations/${id}`, { method: "DELETE" });

/** Mensaje para compartir el enlace cuando no hay correo configurado. */
export function invitationWhatsApp(link: string, agencyRole: string) {
  const text = `Hola, te invito a Travel OS como ${agencyRole}. Crea tu contraseña aquí (vence en 7 días): ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
