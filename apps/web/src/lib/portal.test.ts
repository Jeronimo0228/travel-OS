import { describe, expect, it } from "vitest";
import {
  buildPortalLink,
  documentIcon,
  groupItineraryByDay,
  readTokenFromHash,
  tripPhase,
} from "./portal";
import type { ItineraryItem } from "./reservations";

const token = "a".repeat(43);
const item = (
  id: string,
  startsAt: string | null,
  position = 0,
): ItineraryItem => ({
  id,
  reservationId: "r1",
  title: id,
  details: null,
  location: null,
  startsAt,
  endsAt: null,
  position,
});

describe("portal token handling", () => {
  it("reads a well-formed token from the URL fragment", () => {
    expect(readTokenFromHash(`#t=${token}`)).toBe(token);
  });

  it("rejects malformed tokens", () => {
    expect(readTokenFromHash("#t=short")).toBeNull();
    expect(readTokenFromHash("")).toBeNull();
  });

  it("keeps the token in the fragment so it never reaches server logs", () => {
    expect(buildPortalLink("https://app.example", token)).toBe(
      `https://app.example/portal#t=${token}`,
    );
  });
});

describe("groupItineraryByDay", () => {
  it("groups by local day in chronological order and leaves undated items last", () => {
    const days = groupItineraryByDay([
      item("tour", "2026-11-03T14:00:00Z"),
      item("libre", null),
      item("vuelo", "2026-11-02T12:00:00Z"),
      item("hotel", "2026-11-02T20:00:00Z"),
    ]);
    expect(days.map((day) => day.key)).toEqual([
      "2026-11-02",
      "2026-11-03",
      "sin-fecha",
    ]);
    expect(days[0].items.map((entry) => entry.id)).toEqual(["vuelo", "hotel"]);
    expect(days[2].label).toBe("Por confirmar");
  });

  it("uses Bogota time to decide the day", () => {
    const [day] = groupItineraryByDay([item("late", "2026-11-03T03:00:00Z")]);
    expect(day.key).toBe("2026-11-02");
  });
});

describe("tripPhase", () => {
  const start = "2026-11-02T00:00:00Z";
  const end = "2026-11-06T00:00:00Z";

  it("counts down before departure", () => {
    expect(tripPhase(start, end, Date.parse("2026-10-31T00:00:00Z"))).toEqual({
      phase: "upcoming",
      days: 2,
    });
  });

  it("reports the current trip day while traveling", () => {
    expect(tripPhase(start, end, Date.parse("2026-11-03T10:00:00Z"))).toEqual({
      phase: "traveling",
      day: 2,
      totalDays: 4,
    });
  });

  it("marks finished trips", () => {
    expect(tripPhase(start, end, Date.parse("2026-12-01T00:00:00Z"))).toEqual({
      phase: "finished",
    });
  });
});

describe("documentIcon", () => {
  it("picks an icon from the document name or type", () => {
    expect(documentIcon(null, "Pasaporte Ana")).toBe("badge");
    expect(documentIcon("application/pdf", "Voucher hotel")).toBe("hotel");
    expect(documentIcon("application/pdf", "Factura")).toBe("picture_as_pdf");
  });
});
