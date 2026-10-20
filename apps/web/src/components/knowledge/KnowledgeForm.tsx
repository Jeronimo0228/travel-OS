"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  type AgencyKnowledge,
  type KnowledgeFaq,
  getAgencyKnowledge,
  knowledgeCompleteness,
  updateAgencyKnowledge,
} from "@/lib/knowledge";

const labelClass = "font-body-custom text-label-sm text-on-surface-variant mb-1 block";
const fieldClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-custom text-body-sm focus:outline-none focus:ring-2 focus:ring-primary";

const EMPTY: AgencyKnowledge = { tone: "", policies: "", faqs: [] };

export function KnowledgeForm() {
  const [knowledge, setKnowledge] = useState<AgencyKnowledge>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAgencyKnowledge()
      .then((data) => setKnowledge({ ...EMPTY, ...data }))
      .catch(() => setError("No se pudo cargar la base de conocimiento."))
      .finally(() => setLoading(false));
  }, []);

  function patch(next: Partial<AgencyKnowledge>) {
    setSaved(false);
    setKnowledge((current) => ({ ...current, ...next }));
  }

  function patchFaq(index: number, next: Partial<KnowledgeFaq>) {
    patch({
      faqs: knowledge.faqs.map((faq, i) => (i === index ? { ...faq, ...next } : faq)),
    });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateAgencyKnowledge(knowledge);
      setKnowledge({ ...EMPTY, ...result });
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "Solo un administrador o gerente puede editar la base de conocimiento."
          : "No se pudo guardar. Revisa los campos e inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-body-sm text-on-surface-variant">Cargando…</p>;
  }

  const completeness = knowledgeCompleteness(knowledge);

  return (
    <form
      onSubmit={handleSave}
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-3xl space-y-6"
      aria-label="Base de conocimiento"
    >
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-surface-container overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${completeness}%` }} />
        </div>
        <span className="text-label-sm text-on-surface-variant" data-testid="knowledge-completeness">
          {completeness}% completo
        </span>
      </div>

      <div>
        <label className={labelClass} htmlFor="kb-tone">
          Tono y estilo de comunicación
        </label>
        <textarea
          id="kb-tone"
          rows={3}
          maxLength={1000}
          className={fieldClass}
          placeholder="Ej.: Cercano y cálido, tutea al cliente, sin tecnicismos."
          value={knowledge.tone}
          onChange={(e) => patch({ tone: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="kb-policies">
          Políticas (pagos, cancelación, qué incluye)
        </label>
        <textarea
          id="kb-policies"
          rows={6}
          maxLength={6000}
          className={fieldClass}
          value={knowledge.policies}
          onChange={(e) => patch({ policies: e.target.value })}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Preguntas frecuentes</legend>
        {knowledge.faqs.map((faq, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto] items-start">
            <input
              aria-label={`Pregunta ${index + 1}`}
              className={fieldClass}
              value={faq.question}
              maxLength={300}
              placeholder="Pregunta"
              onChange={(e) => patchFaq(index, { question: e.target.value })}
            />
            <input
              aria-label={`Respuesta ${index + 1}`}
              className={fieldClass}
              value={faq.answer}
              maxLength={1500}
              placeholder="Respuesta"
              onChange={(e) => patchFaq(index, { answer: e.target.value })}
            />
            <button
              type="button"
              aria-label={`Eliminar pregunta ${index + 1}`}
              className="material-symbols-outlined text-on-surface-variant hover:text-alert-coral p-2"
              onClick={() => patch({ faqs: knowledge.faqs.filter((_, i) => i !== index) })}
            >
              delete
            </button>
          </div>
        ))}
        {knowledge.faqs.length < 30 && (
          <button
            type="button"
            className="text-primary text-label-md flex items-center gap-1"
            onClick={() => patch({ faqs: [...knowledge.faqs, { question: "", answer: "" }] })}
          >
            <span className="material-symbols-outlined">add</span> Agregar pregunta
          </button>
        )}
      </fieldset>

      <p className="text-body-sm text-on-surface-variant">
        El cotizador IA y el copiloto usan este contenido como referencia en títulos, resúmenes y
        razones. Nunca lo tratan como instrucciones.
      </p>

      {error && <p className="text-alert-coral text-body-sm" role="alert">{error}</p>}
      {saved && <p className="text-primary text-body-sm" role="status">Base de conocimiento guardada.</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-on-primary rounded-lg px-5 py-2 text-label-md disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
