import type { CreateItineraryItemInput } from "@travelos/shared";

const TIME_ZONE = "America/Bogota";
const BOGOTA_OFFSET = "-05:00";
const DAY_MS = 86_400_000;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const keyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });
const labelFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

export type TripDay = { key: string; label: string };

export type CatalogEntry = {
  name: string;
  description: string;
  destination: string;
};

export function tripDays(startsAt: string, endsAt: string): TripDay[] {
  const days: TripDay[] = [];
  const last = Date.parse(`${keyFormat.format(new Date(endsAt))}T00:00:00Z`);
  let cursor = Date.parse(`${keyFormat.format(new Date(startsAt))}T00:00:00Z`);
  while (cursor <= last) {
    const date = new Date(cursor);
    const label = labelFormat.format(date);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
    cursor += DAY_MS;
  }
  return days;
}

export function isValidTime(time: string): boolean {
  return TIME_PATTERN.test(time);
}

export function activityStartsAt(dayKey: string, time: string): string {
  return `${dayKey}T${time}:00${BOGOTA_OFFSET}`;
}

export function buildCatalogActivityInput(
  entry: CatalogEntry,
  slot: { dayKey: string; time: string; position: number },
): CreateItineraryItemInput {
  return {
    title: entry.name,
    details: entry.description,
    location: entry.destination,
    startsAt: activityStartsAt(slot.dayKey, slot.time),
    position: slot.position,
  };
}
