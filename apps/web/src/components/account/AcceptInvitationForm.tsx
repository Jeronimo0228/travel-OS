"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { ApiError } from "@/lib/api-client";
import {
  acceptInvitation,
  passwordProblem,
  previewInvitation,
  ROLE_LABEL,
  tokenFromHash,
  type InvitationPreview,
} from "@/lib/account";
import { login } from "@/lib/auth";
import { errorClass, fieldClass, labelClass, primaryButton } from "@/components/ui/styles";
import { PasswordFields } from "./PasswordFields";

export function AcceptInvitationForm() {
  const router = useRouter();
  const { setUser } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const t = tokenFromHash(window.location.hash);
    history.replaceState(null, "", window.location.pathname);
    if (!t) {
      setLoadError("El enlace de invitación no es válido.");
      return;
    }
    setToken(t);
    previewInvitation(t)
      .then(setPreview)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "No se pudo abrir la invitación."));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = passwordProblem(values.password, values.confirm);
    if (problem) return setError(problem);
    if (!token || !preview) return;
    setPending(true);
    setError(null);
    try {
      await acceptInvitation(token, name.trim(), values.password);
      const session = await login({ email: preview.email, password: values.password });
      setUser(session.user);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la cuenta.");
      setPending(false);
    }
  }

  if (loadError) return <p className={errorClass} role="alert">{loadError}</p>;
  if (!preview) return <p className="text-body-sm text-on-surface-variant">Cargando invitación…</p>;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="rounded-lg bg-surface-container-low p-3 text-body-sm">
        <b>{preview.agencyName}</b> te invitó como <b>{ROLE_LABEL[preview.role]}</b>.<br />
        Tu usuario será <b>{preview.email}</b>.
      </p>
      <div>
        <label htmlFor="invite-name" className={labelClass}>Tu nombre</label>
        <input
          id="invite-name"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>
      <PasswordFields password={values.password} confirm={values.confirm} onChange={setValues} />
      {error && <p className={errorClass} role="alert">{error}</p>}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Creando cuenta…" : "Crear mi cuenta"}
      </button>
    </form>
  );
}
