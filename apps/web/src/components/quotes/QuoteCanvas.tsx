"use client";

import { useQuoterStore } from "./QuoterStoreProvider";

export function QuoteCanvas() {
  const { selected } = useQuoterStore();

  return (
    <section
      aria-label="Propuesta"
      className="h-full rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
    >
      <p className="font-body-custom text-body-md text-on-surface-variant">
        {selected
          ? `Propuesta para ${selected.destination}`
          : "Tu propuesta aparecerá aquí."}
      </p>
    </section>
  );
}
