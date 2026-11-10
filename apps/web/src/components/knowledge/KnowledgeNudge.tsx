"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAgencyKnowledge, knowledgeCompleteness } from "@/lib/knowledge";

/**
 * HU-36: la base de conocimiento estaba escondida al fondo del menú (hipótesis H6).
 * Si está incompleta, el cotizador la muestra con un enlace directo.
 */
export function KnowledgeNudge() {
  const [score, setScore] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem("travelos.knowledge-nudge") === "off");
    } catch {
      /* sin almacenamiento: se muestra */
    }
    getAgencyKnowledge()
      .then((k) => setScore(knowledgeCompleteness(k)))
      .catch(() => setScore(null));
  }, []);

  if (dismissed || score === null || score >= 100) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-secondary/30 bg-secondary-fixed/40 px-4 py-3 text-body-sm">
      <span className="material-symbols-outlined text-secondary" aria-hidden>menu_book</span>
      <p className="min-w-0 flex-1">
        La IA aún no conoce bien a tu agencia (base de conocimiento al {score} %). Agrega tu tono, políticas de anticipo y preguntas frecuentes para que las cotizaciones suenen como ustedes.
      </p>
      <Link href="/settings/knowledge" className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-4 font-semibold text-on-secondary">
        Completar Base IA
      </Link>
      <button
        type="button"
        aria-label="Ocultar aviso"
        className="min-h-11 px-2 text-on-surface-variant"
        onClick={() => {
          setDismissed(true);
          try {
            window.sessionStorage.setItem("travelos.knowledge-nudge", "off");
          } catch {
            /* sin almacenamiento */
          }
        }}
      >
        <span className="material-symbols-outlined" aria-hidden>close</span>
      </button>
    </div>
  );
}
