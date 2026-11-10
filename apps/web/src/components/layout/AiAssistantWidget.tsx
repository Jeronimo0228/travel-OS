"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AssistantReply } from "@travelos/shared";
import { ApiError } from "@/lib/api-client";
import { askAssistant, STARTER_QUESTIONS, type ChatTurn } from "@/lib/assistant";

/** Otros componentes (p. ej. el botón «Análisis IA») abren el asistente con este evento. */
export const OPEN_ASSISTANT_EVENT = "travelos:open-assistant";

type Message = ChatTurn & { suggestions?: AssistantReply["suggestions"] };

const GREETING =
  "Hola, soy el asistente de Travel OS. Te ayudo con las cifras de tu embudo, tus seguimientos y cómo usar cada pantalla. Solo leo información: no cambio datos.";

function errorText(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Hiciste muchas preguntas seguidas. Espera un minuto e inténtalo de nuevo.";
    if (error.status === 503) return "La IA está ocupada en este momento. Inténtalo de nuevo en unos segundos.";
    return error.message;
  }
  return "No pude responder. Inténtalo de nuevo.";
}

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_ASSISTANT_EVENT, show);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, show);
  }, []);

  async function send(text: string) {
    const message = text.trim().slice(0, 1000);
    if (!message || pending) return;
    const history: ChatTurn[] = messages.map(({ role, text: t }) => ({ role, text: t }));
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setDraft("");
    setError(null);
    setPending(true);
    try {
      const answer = await askAssistant(message, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer.reply, suggestions: answer.suggestions },
      ]);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Cerrar asistente IA" : "Abrir asistente IA"}
        aria-expanded={open}
        aria-controls="ai-assistant-panel"
        className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container transition-all group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="material-symbols-outlined relative z-10 text-[28px]">
          {open ? "close" : "smart_toy"}
        </span>
      </button>

      {open && (
        <section
          id="ai-assistant-panel"
          aria-label="Asistente IA de Travel OS"
          className="absolute bottom-20 right-0 w-[min(22rem,calc(100vw-2rem))] h-[min(520px,calc(100dvh-7rem))] glass-ai rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <header className="p-4 bg-primary text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] ai-pulse">auto_awesome</span>
              <div>
                <p className="font-body-custom text-label-md">Asistente IA</p>
                <p className="text-[11px] opacity-70">Solo lectura · datos de tu agencia</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar"
            aria-live="polite"
          >
            <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none mr-8">
              <p className="font-body-custom text-body-sm">{GREETING}</p>
            </div>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Preguntas sugeridas">
                {STARTER_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void send(question)}
                    className="min-h-9 rounded-full border border-outline-variant bg-white px-3 py-1 text-left text-[12px] text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="ml-8 rounded-lg rounded-tr-none bg-secondary p-3 text-white">
                  <p className="font-body-custom text-body-sm whitespace-pre-wrap break-words">{message.text}</p>
                </div>
              ) : (
                <div key={index} className="mr-8 rounded-lg rounded-tl-none bg-surface-container-low p-3">
                  <p className="font-body-custom text-body-sm whitespace-pre-wrap break-words">{message.text}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion) => (
                        <Link
                          key={suggestion.href + suggestion.label}
                          href={suggestion.href}
                          onClick={() => setOpen(false)}
                          className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-semibold text-secondary hover:underline"
                        >
                          {suggestion.label}
                          <span className="material-symbols-outlined text-[14px]" aria-hidden>
                            arrow_forward
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            {pending && (
              <p className="mr-8 text-body-sm text-on-surface-variant" role="status">
                Pensando…
              </p>
            )}
            {error && (
              <p className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="p-3 bg-white/60 border-t border-white/30">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="ai-widget-input">
                Pregunta al asistente
              </label>
              <input
                ref={inputRef}
                id="ai-widget-input"
                type="text"
                value={draft}
                maxLength={1000}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Pregunta sobre tu agencia…"
                autoComplete="off"
                className="min-w-0 flex-grow bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-custom text-body-sm outline-none focus:ring-2 focus:ring-secondary-container"
              />
              <button
                type="submit"
                disabled={pending || !draft.trim()}
                aria-label="Enviar pregunta"
                className="bg-secondary text-white p-2 rounded-lg active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <p className="mt-1 text-[10px] text-on-surface-variant">
              La IA puede equivocarse. Verifica las cifras en el tablero.
            </p>
          </form>
        </section>
      )}
    </div>
  );
}
