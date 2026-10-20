"use client";

import { useEffect, useState } from "react";
import { pdfButtonState } from "@/lib/pdf-poller";
import { quoteErrorMessage } from "@/lib/quote-logic";
import { downloadQuotePdf, type Quote } from "@/lib/quotes";
import { useQuoterStore } from "./QuoterStoreProvider";

export function QuotePdfButton({ quote }: { quote: Quote }) {
  const { pdfWatching, pdfNotices, generatePdf } = useQuoterStore();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const state = pdfButtonState(quote.pdfStatus, pdfWatching[quote.id] === true);
  const busy = state.busy || downloading;
  const notice = downloadError ?? pdfNotices[quote.id] ?? null;

  useEffect(() => {
    setDownloadError(null);
  }, [quote.id]);

  async function download() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const url = URL.createObjectURL(await downloadQuotePdf(quote.id));
      const link = document.createElement("a");
      link.href = url;
      link.download = `cotizacion-${quote.id}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setDownloadError(quoteErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  function onClick() {
    if (state.action === "generate") void generatePdf(quote.id);
    if (state.action === "download") void download();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-busy={busy}
        className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-body-custom text-label-md text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={`material-symbols-outlined text-[20px] ${busy ? "ai-pulse" : ""}`}
          aria-hidden="true"
        >
          picture_as_pdf
        </span>
        {state.label}
      </button>
      {notice && (
        <p
          role="alert"
          className="max-w-xs font-body-custom text-label-sm text-error"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
