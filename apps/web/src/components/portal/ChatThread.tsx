"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatRelativeTime } from "@/lib/format";
import type { ChatMessage } from "@/lib/reservations";

type ChatThreadProps = {
  messages: ChatMessage[];
  viewer: ChatMessage["sender"];
  onSend: (body: string) => Promise<void>;
  placeholder: string;
  emptyText: string;
};

export function ChatThread({
  messages,
  viewer,
  onSend,
  placeholder,
  emptyText,
}: ChatThreadProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(body);
      setDraft("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo enviar el mensaje.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[320px]">
      <ol className="flex-1 overflow-y-auto space-y-3 p-1" aria-live="polite">
        {messages.length === 0 && (
          <li className="text-center text-body-sm text-on-surface-variant py-8">
            {emptyText}
          </li>
        )}
        {messages.map((message) => {
          const mine = message.sender === viewer;
          return (
            <li
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  mine
                    ? "bg-secondary text-on-secondary rounded-br-sm"
                    : "bg-surface-container-low text-on-surface rounded-bl-sm"
                }`}
              >
                <p className="text-body-md whitespace-pre-wrap break-words">
                  {message.body}
                </p>
                <p
                  className={`text-[11px] mt-1 ${mine ? "text-on-secondary/80" : "text-on-surface-variant"}`}
                >
                  {message.sender === "AGENCY" ? "Agencia" : "Viajero"} ·{" "}
                  {formatRelativeTime(message.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
        <div ref={endRef} />
      </ol>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-3 border-t border-outline-variant mt-3"
      >
        <label htmlFor={`chat-${viewer}`} className="sr-only">
          {placeholder}
        </label>
        <input
          id={`chat-${viewer}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={4000}
          placeholder={placeholder}
          className="flex-1 bg-surface-container-low rounded-full px-4 py-3 text-body-md outline-none focus:ring-2 focus:ring-secondary-container"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Enviar mensaje"
          className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
      {error && (
        <p role="alert" className="text-body-sm text-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
