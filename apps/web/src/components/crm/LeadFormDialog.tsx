"use client";

import { useEffect, useState } from "react";
import {
  createLeadSchema,
  updateLeadSchema,
  leadStages,
  type CreateLeadInput,
} from "@travelos/shared";
import type { Lead } from "@/lib/leads";
import { ApiError } from "@/lib/api-client";
import { useCrmStore } from "./CrmStoreProvider";
import { stageBadge } from "./mock-data";

type LeadFormDialogProps = {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  destination: string;
  notes: string;
  stage: (typeof leadStages)[number];
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  destination: "",
  notes: "",
  stage: "PROSPECTO",
};

const inputClass =
  "w-full border border-outline-variant rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-2 focus:ring-secondary-container bg-surface-container-lowest";
const labelClass =
  "font-body-custom text-label-sm text-on-surface-variant mb-1 block";

export function LeadFormDialog({ open, lead, onClose }: LeadFormDialogProps) {
  const { addLead, updateLead } = useCrmStore();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormError(null);
    setForm(
      lead
        ? {
            name: lead.name,
            email: lead.email ?? "",
            phone: lead.phone ?? "",
            destination: lead.destination ?? "",
            notes: lead.notes ?? "",
            stage: lead.stage ?? "PROSPECTO",
          }
        : emptyForm,
    );
  }, [open, lead]);

  if (!open) return null;

  const isEdit = Boolean(lead);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload: CreateLeadInput = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      destination: form.destination || undefined,
      notes: form.notes || undefined,
      stage: form.stage,
    };

    const schema = isEdit ? updateLeadSchema : createLeadSchema;
    const result = schema.safeParse(payload);

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

    setSubmitting(true);
    try {
      if (isEdit && lead) {
        await updateLead(lead.id, result.data);
      } else {
        await addLead(result.data as CreateLeadInput);
      }
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.fieldErrors) {
          setErrors(error.fieldErrors as Partial<Record<keyof FormState, string>>);
        }
      } else {
        setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h3
            id="lead-form-title"
            className="font-headline text-headline-md text-primary"
          >
            {isEdit ? "Editar Prospecto" : "Añadir Prospecto"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className={labelClass} htmlFor="lead-name">
              Nombre
            </label>
            <input
              id="lead-name"
              type="text"
              className={inputClass}
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
            {errors.name && (
              <p className="text-alert-coral text-body-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="lead-email">
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
            {errors.email && (
              <p className="text-alert-coral text-body-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="lead-phone">
              Teléfono
            </label>
            <input
              id="lead-phone"
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
            />
            {errors.phone && (
              <p className="text-alert-coral text-body-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="lead-destination">
              Destino
            </label>
            <input
              id="lead-destination"
              type="text"
              className={inputClass}
              value={form.destination}
              onChange={(event) => handleChange("destination", event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="lead-stage">
              Etapa
            </label>
            <select
              id="lead-stage"
              className={inputClass}
              value={form.stage}
              onChange={(event) =>
                handleChange("stage", event.target.value as FormState["stage"])
              }
            >
              {leadStages.map((option) => (
                <option key={option} value={option}>
                  {stageBadge[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="lead-notes">
              Notas
            </label>
            <textarea
              id="lead-notes"
              rows={2}
              className={inputClass}
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
            />
          </div>

          {formError && (
            <p
              role="alert"
              className="bg-error-container text-on-error-container text-body-sm rounded-lg px-3 py-2"
            >
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-custom text-label-md hover:bg-surface-container-low transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting && (
                <span className="material-symbols-outlined text-[18px] animate-spin" aria-hidden="true">
                  progress_activity
                </span>
              )}
              {isEdit ? "Guardar cambios" : "Añadir Prospecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
