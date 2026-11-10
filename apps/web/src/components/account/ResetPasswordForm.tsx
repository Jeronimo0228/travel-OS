"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api-client";
import { passwordProblem, resetPassword, tokenFromHash } from "@/lib/account";
import { errorClass, okClass, primaryButton } from "@/components/ui/styles";
import { PasswordFields } from "./PasswordFields";

export function ResetPasswordForm() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setToken(tokenFromHash(window.location.hash));
    // Quita el token de la barra de direcciones y del historial.
    history.replaceState(null, "", window.location.pathname);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = passwordProblem(values.password, values.confirm);
    if (problem) return setError(problem);
    if (!token) return;
    setPending(true);
    setError(null);
    try {
      await resetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setPending(false);
    }
  }

  if (token === undefined) return null;
  if (!token) {
    return (
      <p className={errorClass} role="alert">
        El enlace no es válido. <Link href="/recuperar" className="underline">Pide uno nuevo</Link>.
      </p>
    );
  }
  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p className={okClass} role="status">Listo. Tu contraseña cambió y se cerraron las sesiones abiertas.</p>
        <Link href="/login" className={primaryButton}>Iniciar sesión</Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <PasswordFields password={values.password} confirm={values.confirm} onChange={setValues} />
      {error && <p className={errorClass} role="alert">{error}</p>}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
