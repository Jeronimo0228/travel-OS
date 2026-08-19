"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@travelos/shared";
import { login, AuthError } from "@/lib/auth";

const inputClass =
  "w-full border border-outline-variant rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-2 focus:ring-secondary-container bg-surface-container-lowest";
const labelClass =
  "font-body-custom text-label-sm text-on-surface-variant mb-1 block";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "email" | "password";
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await login(result.data);
      router.push("/crm");
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "Ocurrió un error inesperado. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {fieldErrors.email && (
          <p className="text-alert-coral text-body-sm mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {fieldErrors.password && (
          <p className="text-alert-coral text-body-sm mt-1">{fieldErrors.password}</p>
        )}
      </div>

      {formError && (
        <p
          role="alert"
          className="bg-error-container text-on-error-container text-body-sm rounded-lg px-3 py-2"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-secondary text-on-secondary rounded-lg font-body-custom text-label-md hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
