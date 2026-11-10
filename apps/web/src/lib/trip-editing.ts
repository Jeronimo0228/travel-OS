import type { UpdateItineraryItemInput } from "@travelos/shared";
import type { ItineraryItem } from "./reservations";
import { activityStartsAt, isValidTime } from "./trip-planning";

export type ItemFormValues = {
  title: string;
  details: string;
  location: string;
  date: string;
  time: string;
};

export type ItemFormErrors = Partial<Record<"title" | "time", string>>;

const bogotaParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function bogotaDateAndTime(iso: string): { date: string; time: string } {
  const parts = Object.fromEntries(
    bogotaParts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function itemToFormValues(item: ItineraryItem): ItemFormValues {
  const when = item.startsAt
    ? bogotaDateAndTime(item.startsAt)
    : { date: "", time: "" };
  return {
    title: item.title,
    details: item.details ?? "",
    location: item.location ?? "",
    ...when,
  };
}

export function validateItemForm(values: ItemFormValues): ItemFormErrors {
  const errors: ItemFormErrors = {};
  if (!values.title.trim()) errors.title = "Escribe el título de la actividad";
  if (values.date && !isValidTime(values.time)) errors.time = "Elige la hora";
  return errors;
}

export function buildUpdateInput(
  item: ItineraryItem,
  values: ItemFormValues,
): UpdateItineraryItemInput {
  const input: UpdateItineraryItemInput = {};

  const title = values.title.trim();
  if (title !== item.title) input.title = title;

  const details = values.details.trim();
  if (details !== (item.details ?? "")) input.details = details || null;

  const location = values.location.trim();
  if (location !== (item.location ?? "")) input.location = location || null;

  const nextStartsAt = values.date
    ? activityStartsAt(values.date, values.time)
    : null;
  const sameInstant =
    nextStartsAt === null
      ? item.startsAt === null
      : item.startsAt !== null &&
        Date.parse(nextStartsAt) === Date.parse(item.startsAt);
  if (!sameInstant) input.startsAt = nextStartsAt;

  return input;
}
