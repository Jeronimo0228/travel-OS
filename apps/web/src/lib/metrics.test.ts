import { describe, expect, it } from "vitest";
import { daysUntil, shareOfMax, winRate } from "./metrics";

describe("metrics helpers", () => {
  it("computes win rate as a rounded percentage", () => {
    expect(winRate(3, 1)).toBe(33);
    expect(winRate(0, 0)).toBe(0);
  });

  it("scales bars against the largest value", () => {
    expect(shareOfMax(5, [5, 10])).toBe(50);
    expect(shareOfMax(0, [0, 0])).toBe(0);
  });

  it("counts whole days until a trip starts", () => {
    const now = Date.parse("2026-10-21T12:00:00Z");
    expect(daysUntil("2026-10-23T12:00:00Z", now)).toBe(2);
    expect(daysUntil("2026-10-21T18:00:00Z", now)).toBe(1);
  });
});
