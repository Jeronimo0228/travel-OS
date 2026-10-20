import { formatCop } from "@/lib/format";
import type { QuoteOption } from "@/lib/quotes";

const UNIT_LABELS = { PER_NIGHT: "noche", PER_PERSON: "persona" } as const;

type QuoteOptionCardProps = {
  option: QuoteOption;
  cheapest: boolean;
};

export function QuoteOptionCard({ option, cheapest }: QuoteOptionCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-card-padding">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-headline text-headline-md text-primary">
          {option.title}
        </h3>
        {cheapest && (
          <span className="shrink-0 rounded-full bg-secondary-fixed px-2 py-1 font-body-custom text-label-sm text-on-secondary-fixed-variant">
            Más económica
          </span>
        )}
      </header>

      <p className="mb-4 font-body-custom text-body-sm text-on-surface-variant">
        {option.summary}
      </p>

      <ul className="mb-4 flex-1 space-y-3">
        {option.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 border-b border-outline-variant/50 pb-3 last:border-b-0"
          >
            <div>
              <p className="font-body-custom text-label-md text-primary">
                {item.nameSnapshot}
              </p>
              <p className="line-clamp-2 font-body-custom text-label-sm text-on-surface-variant">
                {item.descriptionSnapshot}
              </p>
              <p className="font-body-custom text-label-sm text-on-surface-variant">
                {item.quantity} × {formatCop(item.unitPrice, option.currency)} /{" "}
                {UNIT_LABELS[item.pricingUnit]}
              </p>
            </div>
            <p className="shrink-0 font-body-custom text-label-md text-primary">
              {formatCop(Number(item.unitPrice) * item.quantity, option.currency)}
            </p>
          </li>
        ))}
      </ul>

      <footer className="flex items-baseline justify-between border-t border-outline-variant pt-3">
        <span className="font-body-custom text-label-md text-on-surface-variant">
          Total estimado
        </span>
        <span className="font-headline text-headline-lg text-primary">
          {formatCop(option.totalPrice, option.currency)}
        </span>
      </footer>
    </article>
  );
}
