import { describe, expect, it } from "vitest";
import type { ItineraryItem } from "./reservations";
import {
  buildUpdateInput,
  itemToFormValues,
  validateItemForm,
  type ItemFormValues,
} from "./trip-editing";

const item = (overrides: Partial<ItineraryItem> = {}): ItineraryItem => ({
  id: "i1",
  reservationId: "r1",
  title: "Tour por el centro",
  details: "Caminata guiada",
  location: "Getsemaní",
  startsAt: "2026-10-21T20:00:00.000Z",
  endsAt: null,
  position: 0,
  ...overrides,
});

describe("itemToFormValues", () => {
  it("shows the activity date and time in Bogotá time", () => {
    expect(itemToFormValues(item())).toEqual({
      title: "Tour por el centro",
      details: "Caminata guiada",
      location: "Getsemaní",
      date: "2026-10-21",
      time: "15:00",
    });
  });

  it("uses empty strings for missing optional values and date", () => {
    expect(
      itemToFormValues(item({ details: null, location: null, startsAt: null })),
    ).toEqual({
      title: "Tour por el centro",
      details: "",
      location: "",
      date: "",
      time: "",
    });
  });
});

describe("buildUpdateInput", () => {
  const unchanged = (): ItemFormValues => itemToFormValues(item());

  it("sends nothing when nothing changed", () => {
    expect(buildUpdateInput(item(), unchanged())).toEqual({});
  });

  it("sends only the title when only the title changed", () => {
    expect(
      buildUpdateInput(item(), { ...unchanged(), title: "  Tour nocturno " }),
    ).toEqual({ title: "Tour nocturno" });
  });

  it("clears details and location with null when emptied", () => {
    expect(
      buildUpdateInput(item(), { ...unchanged(), details: "  ", location: "" }),
    ).toEqual({ details: null, location: null });
  });

  it("sets details on an activity that had none", () => {
    expect(
      buildUpdateInput(item({ details: null }), {
        ...unchanged(),
        details: "Lleva bloqueador",
      }),
    ).toEqual({ details: "Lleva bloqueador" });
  });

  it("moves the activity to another day and time using Bogotá time", () => {
    expect(
      buildUpdateInput(item(), { ...unchanged(), date: "2026-10-22", time: "10:30" }),
    ).toEqual({ startsAt: "2026-10-22T10:30:00-05:00" });
  });

  it("does not report a date change when the same instant is re-entered", () => {
    expect(
      buildUpdateInput(item(), { ...unchanged(), date: "2026-10-21", time: "15:00" }),
    ).toEqual({});
  });

  it("clears the date with null when the day is removed", () => {
    expect(buildUpdateInput(item(), { ...unchanged(), date: "", time: "" })).toEqual({
      startsAt: null,
    });
  });

  it("does not touch the date of an activity that never had one", () => {
    expect(
      buildUpdateInput(item({ startsAt: null }), {
        ...itemToFormValues(item({ startsAt: null })),
      }),
    ).toEqual({});
  });
});

describe("validateItemForm", () => {
  const valid = (): ItemFormValues => itemToFormValues(item());

  it("accepts a complete form", () => {
    expect(validateItemForm(valid())).toEqual({});
  });

  it("requires a title", () => {
    expect(validateItemForm({ ...valid(), title: "   " })).toEqual({
      title: "Escribe el título de la actividad",
    });
  });

  it("requires a valid time when there is a day", () => {
    expect(validateItemForm({ ...valid(), time: "" })).toEqual({
      time: "Elige la hora",
    });
  });

  it("allows no day and no time", () => {
    expect(validateItemForm({ ...valid(), date: "", time: "" })).toEqual({});
  });
});
