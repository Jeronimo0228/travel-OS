import { groupItineraryByDay } from "@/lib/portal";
import type { ItineraryItem } from "@/lib/reservations";

const timeFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  hour: "numeric",
  minute: "2-digit",
});

export function ItineraryTimeline({
  items,
  emptyText,
}: {
  items: ItineraryItem[];
  emptyText: string;
}) {
  const days = groupItineraryByDay(items);
  if (days.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant py-6 text-center">
        {emptyText}
      </p>
    );
  }
  return (
    <ol className="space-y-6">
      {days.map((day, dayIndex) => (
        <li key={day.key}>
          <h3 className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-secondary text-on-secondary text-label-md flex items-center justify-center">
              {dayIndex + 1}
            </span>
            <span className="font-headline text-headline-md capitalize">
              {day.label}
            </span>
          </h3>
          <ul className="border-l-2 border-secondary/30 ml-4 pl-6 space-y-4">
            {day.items.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[33px] top-2 w-4 h-4 rounded-full bg-surface border-4 border-secondary" />
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
                  <div className="flex justify-between gap-3">
                    <p className="text-label-md font-bold">{item.title}</p>
                    {item.startsAt && (
                      <time
                        className="text-label-sm text-secondary whitespace-nowrap"
                        dateTime={item.startsAt}
                      >
                        {timeFormat.format(new Date(item.startsAt))}
                      </time>
                    )}
                  </div>
                  {item.location && (
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[16px]">
                        location_on
                      </span>
                      {item.location}
                    </p>
                  )}
                  {item.details && (
                    <p className="text-body-sm mt-2">{item.details}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
