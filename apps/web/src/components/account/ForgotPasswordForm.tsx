"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api-client";
import { requestPasswordReset } from "@/lib/account";
import { errorClass, fieldClass, labelClass, okClass, primaryButton } from "@/components/ui/styles";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await requestPasswordReset(email.trim());
      setSent(res.message);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? err.message : "No pudimos procesar la solicitud. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className={okClass} role="status">
        {sent} Revisa también la carpeta de spam. El enlace vence en 30 minutos.
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="forgot-email" className={labelClass}>
          Correo de tu cuenta
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      {error && <p className={errorClass} role="alert">{error}</p>}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
