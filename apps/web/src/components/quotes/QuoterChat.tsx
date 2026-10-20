"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createQuoteSchema } from "@travelos/shared";
import { pluralize } from "@/lib/format";
import { quickPrompts } from "./quick-prompts";
import { useQuoterStore } from "./QuoterStoreProvider";

const promptSchema = createQuoteSchema.shape.prompt;

export function QuoterChat() {
  const {
    quotes,
    selected,
    loading,
    loadError,
    creating,
    createError,
    select,
    submitPrompt,
    refetch,
  } = useQuoterStore();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const history = [...quotes].reverse();
  const canSend = promptSchema.safeParse(draft).success && !creating;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [quotes.length, creating]);

  async function send() {
    const parsed = promptSchema.safeParse(draft);
    if (!parsed.success || creating) return;
    if (await submitPrompt(parsed.data)) setDraft("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <section
      aria-label="Cotizador"
      className="flex h-full min-h-0 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest"
    >
      <div className="border-b border-outline-variant p-4">
        <h2 className="font-headline text-headline-lg text-primary">
          Cotizador en lenguaje natural
        </h2>
        <p className="font-body-custom text-body-sm text-on-surface-variant">
          Describe el viaje y deja que TravelOS IA construya la experiencia.
        </p>
      </div>

      <div
        role="log"
        aria-label="Historial de cotizaciones"
        className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
      >
        {loading && (
          <div className="space-y-2" aria-hidden="true">
            <div className="shimmer h-4 w-3/4 rounded-full bg-surface-container-highest" />
            <div className="shimmer h-4 w-1/2 rounded-full bg-surface-container-highest" />
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-error bg-error-container p-3 font-body-custom text-body-sm text-on-error-container"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-2 rounded-lg border border-error px-3 py-1 font-body-custom text-label-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && quotes.length === 0 && (
          <div className="rounded-xl border border-outline-variant p-3 font-body-custom text-body-sm text-primary">
            ¡Hola! Estoy listo para crear una nueva cotización. Cuéntame sobre
            los viajeros, el destino y las fechas.
          </div>
        )}

        {history.map((quote) => {
          const isSelected = selected?.id === quote.id;
          return (
            <div key={quote.id} className="space-y-2">
              <p className="ml-8 rounded-xl bg-primary p-3 font-body-custom text-body-sm text-on-primary">
                {quote.prompt}
              </p>
              <button
                type="button"
                onClick={() => select(quote.id)}
                aria-pressed={isSelected}
                className={`mr-8 w-full rounded-xl border p-3 text-left font-body-custom text-body-sm text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container ${
                  isSelected
                    ? "border-secondary bg-secondary-fixed"
                    : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                }`}
              >
                Preparé {quote.options.length} alternativas para{" "}
                {quote.destination} · {pluralize(quote.durationDays, "día", "días")}{" "}
                · {pluralize(quote.travelerCount, "viajero", "viajeros")}
              </button>
            </div>
          );
        })}

        <div aria-live="polite">
          {creating && (
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined ai-pulse text-secondary"
                aria-hidden="true"
              >
                auto_awesome
              </span>
              <div className="flex-1 space-y-2">
                <p className="font-body-custom text-label-sm uppercase tracking-wider text-secondary">
                  IA analizando…
                </p>
                <div className="shimmer h-3 w-3/4 rounded-full bg-surface-container-highest" />
                <div className="shimmer h-3 w-1/2 rounded-full bg-surface-container-highest" />
              </div>
            </div>
          )}
        </div>

        {createError && (
          <p
            role="alert"
            className="rounded-xl border border-error bg-error-container p-3 font-body-custom text-body-sm text-on-error-container"
          >
            {createError}
          </p>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 border-t border-outline-variant p-4"
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ejemplos de pedido">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-full border border-outline-variant px-3 py-1 text-left font-body-custom text-label-sm text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="relative">
          <label htmlFor="quoter-prompt" className="sr-only">
            Describe el viaje que quieres cotizar
          </label>
          <textarea
            id="quoter-prompt"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={2000}
            rows={3}
            placeholder="Ej.: Pareja a Cartagena por 4 noches, hotel frente al mar"
            className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-lowest p-3 pr-14 font-body-custom text-body-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Enviar solicitud"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-on-secondary transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              send
            </span>
          </button>
        </div>
        <p className="font-body-custom text-label-sm text-on-surface-variant">
          Enter envía · Shift+Enter agrega una línea · mínimo 10 caracteres
        </p>
      </form>
    </section>
  );
}
