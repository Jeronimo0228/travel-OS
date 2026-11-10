"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Role } from "@travelos/shared";
import { useSession } from "@/components/auth/SessionProvider";
import { ApiError } from "@/lib/api-client";
import { ROLE_LABEL } from "@/lib/account";
import {
  changeRole,
  invitationWhatsApp,
  inviteUser,
  listInvitations,
  listTeam,
  passwordResetLink,
  revokeInvitation,
  setUserActive,
  type Invitation,
  type TeamUser,
} from "@/lib/team";
import { cardClass, errorClass, fieldClass, ghostButton, labelClass, okClass, primaryButton } from "@/components/ui/styles";

const ROLES: Role[] = ["ASESOR", "GERENTE", "ADMIN"];
const message = (err: unknown) => (err instanceof ApiError ? err.message : "No se pudo completar la acción.");

function CopyLink({ link, label }: { link: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
      <p className="text-label-sm text-on-surface-variant">{label}</p>
      <input readOnly value={link} onFocus={(e) => e.target.select()} className={`${fieldClass} font-mono text-[12px]`} aria-label={label} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={ghostButton}
          onClick={() =>
            navigator.clipboard
              .writeText(link)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }
        >
          {copied ? "Copiado ✓" : "Copiar enlace"}
        </button>
        <a className={ghostButton} href={invitationWhatsApp(link, "parte del equipo")} target="_blank" rel="noopener noreferrer">
          Enviar por WhatsApp
        </a>
      </div>
    </div>
  );
}

export function TeamManager() {
  const { user } = useSession();
  const isAdmin = user?.role === "ADMIN";
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ASESOR");
  const [inviteLink, setInviteLink] = useState<{ link: string; emailSent: boolean } | null>(null);
  const [resetLink, setResetLink] = useState<{ userId: string; link: string } | null>(null);

  const reload = useCallback(async () => {
    try {
      const [users, invites] = await Promise.all([listTeam(), isAdmin ? listInvitations() : Promise.resolve([])]);
      setTeam(users);
      setInvitations(invites);
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) void reload();
  }, [user, reload]);

  async function act(fn: () => Promise<unknown>, done?: string) {
    setError(null);
    setNotice(null);
    try {
      await fn();
      if (done) setNotice(done);
      await reload();
    } catch (err) {
      setError(message(err));
    }
  }

  async function onInvite(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInviteLink(null);
    try {
      const res = await inviteUser(email.trim(), role);
      setInviteLink({ link: res.link, emailSent: res.emailSent });
      setEmail("");
      await reload();
    } catch (err) {
      setError(message(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className={errorClass} role="alert">{error}</p>}
      {notice && <p className={okClass} role="status">{notice}</p>}

      {isAdmin && (
        <section className={cardClass} aria-labelledby="invite-title">
          <h3 id="invite-title" className="font-headline text-headline-md text-primary">Invitar a alguien</h3>
          <form onSubmit={onInvite} className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
            <div>
              <label htmlFor="invite-email" className={labelClass}>Correo</label>
              <input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="invite-role" className={labelClass}>Rol</label>
              <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className={fieldClass}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            <button type="submit" className={primaryButton}>Invitar</button>
          </form>
          {inviteLink && (
            <>
              <p className={`${okClass} mt-3`} role="status">
                {inviteLink.emailSent ? "Invitación enviada por correo." : "Invitación creada. Comparte este enlace con la persona (vence en 7 días)."}
              </p>
              <CopyLink link={inviteLink.link} label="Enlace de invitación" />
            </>
          )}
          {invitations.length > 0 && (
            <div className="mt-4">
              <p className="text-label-md font-bold">Invitaciones pendientes</p>
              <ul className="mt-2 divide-y divide-outline-variant">
                {invitations.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-body-sm">
                    <span>{inv.email} · {ROLE_LABEL[inv.role]} · vence {new Date(inv.expiresAt).toLocaleDateString("es-CO")}</span>
                    <button type="button" className={ghostButton} onClick={() => act(() => revokeInvitation(inv.id), "Invitación revocada.")}>
                      Revocar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className={cardClass} aria-labelledby="team-title">
        <h3 id="team-title" className="font-headline text-headline-md text-primary">Equipo</h3>
        {loading ? (
          <p className="mt-2 text-body-sm text-on-surface-variant">Cargando…</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                  <th className="py-2">Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th>{isAdmin && <th className="text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {team.map((member) => {
                  const self = member.id === user?.id;
                  const active = !member.disabledAt;
                  return (
                    <tr key={member.id} className="border-b border-outline-variant align-middle">
                      <td className="py-2 font-semibold">{member.name}{self && " (tú)"}</td>
                      <td>{member.email}</td>
                      <td>
                        {isAdmin && !self ? (
                          <select
                            aria-label={`Rol de ${member.name}`}
                            value={member.role}
                            onChange={(e) => act(() => changeRole(member.id, e.target.value as Role), "Rol actualizado.")}
                            className={`${fieldClass} min-h-11 w-auto`}
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                          </select>
                        ) : (
                          ROLE_LABEL[member.role]
                        )}
                      </td>
                      <td>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                          {active ? "Activo" : "Desactivado"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-2 text-right">
                          {!self && (
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                className={ghostButton}
                                onClick={async () => {
                                  setError(null);
                                  try {
                                    const res = await passwordResetLink(member.id);
                                    setResetLink({ userId: member.id, link: res.link });
                                  } catch (err) {
                                    setError(message(err));
                                  }
                                }}
                              >
                                Enlace de contraseña
                              </button>
                              <button
                                type="button"
                                className={ghostButton}
                                onClick={() =>
                                  act(
                                    () => setUserActive(member.id, !active),
                                    active ? `${member.name} ya no puede entrar y se cerraron sus sesiones.` : `${member.name} puede volver a entrar.`,
                                  )
                                }
                              >
                                {active ? "Desactivar" : "Reactivar"}
                              </button>
                            </div>
                          )}
                          {resetLink?.userId === member.id && (
                            <CopyLink link={resetLink.link} label="Enlace para crear contraseña (vence en 30 minutos)" />
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
