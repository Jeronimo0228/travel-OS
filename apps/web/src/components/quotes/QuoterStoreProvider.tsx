"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pollPdfStatus } from "@/lib/pdf-poller";
import { quoteErrorMessage } from "@/lib/quote-logic";
import {
  createQuote,
  getQuote,
  linkQuoteLead,
  listQuotes,
  requestQuotePdf,
  type Quote,
} from "@/lib/quotes";

type QuoterStoreValue = {
  quotes: Quote[];
  selected: Quote | null;
  loading: boolean;
  loadError: string | null;
  creating: boolean;
  createError: string | null;
  pdfWatching: Record<string, boolean>;
  pdfNotices: Record<string, string>;
  select: (quoteId: string) => void;
  submitPrompt: (prompt: string) => Promise<boolean>;
  linkLead: (quoteId: string, leadId: string) => Promise<void>;
  generatePdf: (quoteId: string) => Promise<void>;
  refetch: () => void;
};

const QuoterStoreContext = createContext<QuoterStoreValue | null>(null);

export function QuoterStoreProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [pdfWatching, setPdfWatching] = useState<Record<string, boolean>>({});
  const [pdfNotices, setPdfNotices] = useState<Record<string, string>>({});
  const [reloadToken, setReloadToken] = useState(0);
  const pollingRef = useRef(new Set<string>());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
  }, []);

  const upsertQuote = useCallback((quote: Quote) => {
    setQuotes((current) =>
      current.map((item) => (item.id === quote.id ? quote : item)),
    );
  }, []);

  const setPdfNotice = useCallback((quoteId: string, message: string | null) => {
    setPdfNotices((current) => {
      const next = { ...current };
      if (message) next[quoteId] = message;
      else delete next[quoteId];
      return next;
    });
  }, []);

  const runPdf = useCallback(
    async (quoteId: string, shouldRequest: boolean) => {
      if (pollingRef.current.has(quoteId)) return;
      pollingRef.current.add(quoteId);
      setPdfWatching((current) => ({ ...current, [quoteId]: true }));
      setPdfNotice(quoteId, null);

      try {
        if (shouldRequest) await requestQuotePdf(quoteId);
        const outcome = await pollPdfStatus({
          signal: abortRef.current?.signal,
          fetchStatus: async () => {
            const quote = await getQuote(quoteId);
            upsertQuote(quote);
            return quote.pdfStatus;
          },
        });
        if (outcome === "FAILED") {
          setPdfNotice(quoteId, "No se pudo generar el PDF. Inténtalo de nuevo.");
        }
        if (outcome === "TIMEOUT") {
          setPdfNotice(
            quoteId,
            "El PDF está tardando más de lo normal. Inténtalo de nuevo en un momento.",
          );
        }
      } catch (error) {
        setPdfNotice(quoteId, quoteErrorMessage(error));
      } finally {
        pollingRef.current.delete(quoteId);
        setPdfWatching((current) => ({ ...current, [quoteId]: false }));
      }
    },
    [setPdfNotice, upsertQuote],
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    listQuotes()
      .then((result) => {
        if (cancelled) return;
        setQuotes(result.items);
        result.items
          .filter((quote) => quote.pdfStatus === "PENDING")
          .forEach((quote) => void runPdf(quote.id, false));
      })
      .catch((error) => {
        if (!cancelled) setLoadError(quoteErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, runPdf]);

  const submitPrompt = useCallback(async (prompt: string) => {
    setCreating(true);
    setCreateError(null);
    try {
      const quote = await createQuote({ prompt });
      setQuotes((current) => [
        quote,
        ...current.filter((item) => item.id !== quote.id),
      ]);
      setSelectedId(quote.id);
      return true;
    } catch (error) {
      setCreateError(quoteErrorMessage(error));
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  const linkLead = useCallback(
    async (quoteId: string, leadId: string) => {
      upsertQuote(await linkQuoteLead(quoteId, leadId));
    },
    [upsertQuote],
  );

  const generatePdf = useCallback(
    (quoteId: string) => runPdf(quoteId, true),
    [runPdf],
  );

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const value = useMemo<QuoterStoreValue>(
    () => ({
      quotes,
      selected: quotes.find((quote) => quote.id === selectedId) ?? quotes[0] ?? null,
      loading,
      loadError,
      creating,
      createError,
      pdfWatching,
      pdfNotices,
      select: setSelectedId,
      submitPrompt,
      linkLead,
      generatePdf,
      refetch,
    }),
    [
      quotes,
      selectedId,
      loading,
      loadError,
      creating,
      createError,
      pdfWatching,
      pdfNotices,
      submitPrompt,
      linkLead,
      generatePdf,
      refetch,
    ],
  );

  return (
    <QuoterStoreContext.Provider value={value}>
      {children}
    </QuoterStoreContext.Provider>
  );
}

export function useQuoterStore(): QuoterStoreValue {
  const context = useContext(QuoterStoreContext);
  if (!context) {
    throw new Error("useQuoterStore must be used within a QuoterStoreProvider");
  }
  return context;
}
