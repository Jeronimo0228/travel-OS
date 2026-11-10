import { apiFetch } from "./api-client";

export type AgentPool = { dedicated: number; total: number; available: number };

export type AiStatus = {
  agents: { cotizador: AgentPool; copiloto: AgentPool; asistente: AgentPool };
  provider: string | null;
  forced: boolean;
  gemini: { keys: number; available: number; coolingDown: number };
  groq: { keys: number };
  openrouter: { keys: number };
};

/** Solo administradores (el API responde 403 a los demás roles). */
export function getAiStatus() {
  return apiFetch<AiStatus>("/api/ai/status");
}

/** Proveedores de respaldo configurados además de Gemini. */
export function backupCount(status: AiStatus) {
  return (status.groq.keys > 0 ? 1 : 0) + (status.openrouter.keys > 0 ? 1 : 0);
}

export function poolHealth(pool: AgentPool): "ok" | "degradado" | "sin-llaves" {
  if (pool.total === 0) return "sin-llaves";
  return pool.available > 0 ? "ok" : "degradado";
}
