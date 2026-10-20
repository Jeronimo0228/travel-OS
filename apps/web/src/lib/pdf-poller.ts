import type { PdfStatus } from "./quotes";

type PollOptions = {
  fetchStatus: () => Promise<PdfStatus>;
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type PdfPollOutcome = "READY" | "FAILED" | "TIMEOUT" | "ABORTED";

export type PdfButtonState = {
  label: string;
  action: "generate" | "download" | "none";
  busy: boolean;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function pollPdfStatus({
  fetchStatus,
  intervalMs = 2000,
  timeoutMs = 60_000,
  signal,
}: PollOptions): Promise<PdfPollOutcome> {
  let elapsed = 0;
  while (elapsed < timeoutMs) {
    if (signal?.aborted) return "ABORTED";
    const status = await fetchStatus();
    if (status === "READY" || status === "FAILED") return status;
    await sleep(intervalMs);
    elapsed += intervalMs;
  }
  return "TIMEOUT";
}

export function pdfButtonState(
  status: PdfStatus,
  watching: boolean,
): PdfButtonState {
  if (watching) return { label: "Generando…", action: "none", busy: true };
  if (status === "READY") {
    return { label: "Descargar PDF", action: "download", busy: false };
  }
  if (status === "NOT_REQUESTED") {
    return { label: "Generar PDF", action: "generate", busy: false };
  }
  return { label: "Reintentar", action: "generate", busy: false };
}
