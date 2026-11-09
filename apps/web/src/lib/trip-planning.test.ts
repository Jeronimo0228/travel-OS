import { describe, expect, it } from "vitest";
import {
  activityStartsAt,
  buildCatalogActivityInput,
  isValidTime,
  tripDays,
} from "./trip-planning";

describe("tripDays", () => {
  it("lists every Bogotá day of the trip, inclusive", () => {
    expect(
      tripDays("2026-10-20T05:00:00.000Z", "2026-10-23T04:59:00.000Z").map(
        (day) => day.key,
      ),
    ).toEqual(["2026-10-20", "2026-10-21", "2026-10-22"]);
  });

  it("uses the Bogotá calendar day, not the UTC one", () => {
    expect(
      tripDays("2026-10-21T03:00:00.000Z", "2026-10-21T03:00:00.000Z")[0].key,
    ).toBe("2026-10-20");
  });

  it("returns a single day when the trip starts and ends the same day", () => {
    expect(
      tripDays("2026-10-20T14:00:00.000Z", "2026-10-20T20:00:00.000Z"),
    ).toHaveLength(1);
  });

  it("crosses month boundaries", () => {
    expect(
      tripDays("2026-10-30T15:00:00.000Z", "2026-11-02T15:00:00.000Z").map(
        (day) => day.key,
      ),
    ).toEqual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  });

  it("returns nothing when the end is before the start", () => {
    expect(
      tripDays("2026-10-22T15:00:00.000Z", "2026-10-20T15:00:00.000Z"),
    ).toEqual([]);
  });

  it("labels each day with a capitalized weekday and the day number", () => {
    const [first] = tripDays("2026-10-20T15:00:00.000Z", "2026-10-20T15:00:00.000Z");
    expect(first.label.startsWith("Martes")).toBe(true);
    expect(first.label).toContain("20");
  });
});

describe("isValidTime", () => {
  it("accepts 24h HH:mm", () => {
    expect(isValidTime("09:00")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
    expect(isValidTime("00:00")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isValidTime("")).toBe(false);
    expect(isValidTime("9:00")).toBe(false);
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("12:60")).toBe(false);
  });
});

describe("activityStartsAt", () => {
  it("dates the activity in Bogotá time", () => {
    expect(activityStartsAt("2026-10-20", "15:30")).toBe(
      "2026-10-20T15:30:00-05:00",
    );
  });
});

describe("buildCatalogActivityInput", () => {
  it("builds the itinerary item from a catalog entry", () => {
    expect(
      buildCatalogActivityInput(
        {
          name: "Casa Amurallada",
          description: "Hotel en el centro histórico.",
          destination: "Cartagena",
        },
        { dayKey: "2026-10-21", time: "15:00", position: 3 },
      ),
    ).toEqual({
      title: "Casa Amurallada",
      details: "Hotel en el centro histórico.",
      location: "Cartagena",
      startsAt: "2026-10-21T15:00:00-05:00",
      position: 3,
    });
  });
});
