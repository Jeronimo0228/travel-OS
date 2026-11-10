import type { AssistantReply } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type ChatTurn = { role: "user" | "assistant"; text: string };

/** Máximo de turnos previos que viajan al API (el API también lo limita a 6). */
export const HISTORY_LIMIT = 6;

export function historyForRequest(turns: ChatTurn[]): ChatTurn[] {
  return turns
    .slice(-HISTORY_LIMIT)
    .map((turn) => ({ role: turn.role, text: turn.text.slice(0, 1200) }));
}

export function askAssistant(message: string, history: ChatTurn[]) {
  return apiFetch<AssistantReply>("/api/ai/assistant", {
    method: "POST",
    body: JSON.stringify({ message, history: historyForRequest(history) }),
  });
}

export const STARTER_QUESTIONS = [
  "¿Cómo va mi embudo de ventas?",
  "¿Tengo seguimientos vencidos?",
  "¿Cómo creo una cotización con IA?",
];
