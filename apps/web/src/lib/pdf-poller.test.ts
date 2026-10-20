import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pdfButtonState, pollPdfStatus } from "./pdf-poller";
import type { PdfStatus } from "./quotes";

describe("pollPdfStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves READY once the status flips, polling every 2 seconds", async () => {
    const statuses: PdfStatus[] = ["PENDING", "PENDING", "READY"];
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => statuses.shift() ?? "READY");

    const outcome = pollPdfStatus({ fetchStatus });
    await vi.advanceTimersByTimeAsync(4000);

    await expect(outcome).resolves.toBe("READY");
    expect(fetchStatus).toHaveBeenCalledTimes(3);
  });

  it("resolves FAILED without waiting", async () => {
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => "FAILED");

    await expect(pollPdfStatus({ fetchStatus })).resolves.toBe("FAILED");
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it("gives up with TIMEOUT after 60 seconds of PENDING", async () => {
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => "PENDING");

    const outcome = pollPdfStatus({ fetchStatus });
    await vi.advanceTimersByTimeAsync(60_000);

    await expect(outcome).resolves.toBe("TIMEOUT");
    expect(fetchStatus).toHaveBeenCalledTimes(30);
  });

  it("stops with ABORTED when the signal is aborted", async () => {
    const controller = new AbortController();
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => "PENDING");

    const outcome = pollPdfStatus({ fetchStatus, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(2000);
    controller.abort();
    await vi.advanceTimersByTimeAsync(2000);

    await expect(outcome).resolves.toBe("ABORTED");
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });
});

describe("pdfButtonState", () => {
  it("offers to generate when nothing was requested", () => {
    expect(pdfButtonState("NOT_REQUESTED", false)).toEqual({
      label: "Generar PDF",
      action: "generate",
      busy: false,
    });
  });

  it("is busy while a request is being watched", () => {
    expect(pdfButtonState("PENDING", true)).toEqual({
      label: "Generando…",
      action: "none",
      busy: true,
    });
  });

  it("offers to download when ready", () => {
    expect(pdfButtonState("READY", false)).toEqual({
      label: "Descargar PDF",
      action: "download",
      busy: false,
    });
  });

  it("offers to retry after a failure or a timeout", () => {
    const retry = { label: "Reintentar", action: "generate", busy: false };
    expect(pdfButtonState("FAILED", false)).toEqual(retry);
    expect(pdfButtonState("PENDING", false)).toEqual(retry);
  });
});
