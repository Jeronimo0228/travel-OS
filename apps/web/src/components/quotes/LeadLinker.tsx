"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { listLeads, type Lead } from "@/lib/leads";
import { quoteErrorMessage } from "@/lib/quote-logic";
import type { Quote } from "@/lib/quotes";
import { useQuoterStore } from "./QuoterStoreProvider";

export function LeadLinker({ quote }: { quote: Quote }) {
  const { linkLead } = useQuoterStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLeads({ take: 100 })
      .then((result) => {
        if (!cancelled) setLeads(result.items);
      })
      .catch((err) => {
        if (!cancelled) setError(quoteErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setError(null);
  }, [quote.id]);

  async function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const leadId = event.target.value;
    if (!leadId) return;
    setSaving(true);
    setError(null);
    try {
      await linkLead(quote.id, leadId);
    } catch (err) {
      setError(quoteErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const linkedLeadIsListed = leads.some((lead) => lead.id === quote.leadId);

  return (
    <div className="flex flex-col items-start gap-1">
      <label htmlFor="quote-lead" className="sr-only">
        Vincular cotización a un lead
      </label>
      <select
        id="quote-lead"
        value={quote.leadId ?? ""}
        onChange={onChange}
        disabled={saving}
        aria-busy={saving}
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-custom text-label-md text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container disabled:opacity-60"
      >
        <option value="" disabled>
          Vincular a un lead…
        </option>
        {quote.leadId && !linkedLeadIsListed && (
          <option value={quote.leadId}>Lead vinculado</option>
        )}
        {leads.map((lead) => (
          <option key={lead.id} value={lead.id}>
            {lead.name}
          </option>
        ))}
      </select>
      {error && (
        <p
          role="alert"
          className="max-w-xs font-body-custom text-label-sm text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
