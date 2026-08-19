"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAgencySchema, type RegisterAgencyInput } from "@travelos/shared";
import { registerAgency, AuthError } from "@/lib/auth";

const inputClass =
  "w-full border border-outline-variant rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-2 focus:ring-secondary-container bg-surface-container-lowest";
const labelClass =
  "font-body-custom text-label-sm text-on-surface-variant mb-1 block";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      new RegExp(
        "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
        "g",
      ),
      "",
    )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormState = {
  agencyName: string;
  slug: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
};

const emptyForm: FormState = {
  agencyName: "",
  slug: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

export function RegisterAgencyForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAgencyNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      agencyName: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload: RegisterAgencyInput = form;
    const result = registerAgencySchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await registerAgency(result.data);
      router.push("/login");
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
        <label className={labelClass} htmlFor="register-agency-name">
          Nombre de la agencia
        </label>
        <input
          id="register-agency-name"
          type="text"
          className={inputClass}
          value={form.agencyName}
          onChange={(event) => handleAgencyNameChange(event.target.value)}
        />
        {errors.agencyName && (
          <p className="text-alert-coral text-body-sm mt-1">{errors.agencyName}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="register-slug">
          Slug (URL de tu agencia)
        </label>
        <input
          id="register-slug"
          type="text"
          className={inputClass}
          value={form.slug}
          onChange={(event) => handleSlugChange(event.target.value)}
        />
        {errors.slug && (
          <p className="text-alert-coral text-body-sm mt-1">{errors.slug}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="register-admin-name">
          Tu nombre
        </label>
        <input
          id="register-admin-name"
          type="text"
          className={inputClass}
          value={form.adminName}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, adminName: event.target.value }))
          }
        />
        {errors.adminName && (
          <p className="text-alert-coral text-body-sm mt-1">{errors.adminName}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="register-admin-email">
          Email
        </label>
        <input
          id="register-admin-email"
          type="email"
          autoComplete="email"
          className={inputClass}
          value={form.adminEmail}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, adminEmail: event.target.value }))
          }
        />
        {errors.adminEmail && (
          <p className="text-alert-coral text-body-sm mt-1">{errors.adminEmail}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="register-admin-password">
          Contraseña
        </label>
        <input
          id="register-admin-password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={form.adminPassword}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, adminPassword: event.target.value }))
          }
        />
        {errors.adminPassword && (
          <p className="text-alert-coral text-body-sm mt-1">{errors.adminPassword}</p>
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
        {loading ? "Creando agencia..." : "Crear agencia"}
      </button>
    </form>
  );
}
