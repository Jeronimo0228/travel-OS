import { describe, expect, it } from "vitest";
import { bookingEstimate, formatDay } from "./wholesale";

describe("wholesale helpers", () => {
  it("estima neto y comisión", () => {
    expect(bookingEstimate("2000000", 2, "12.5")).toEqual({ net: 4000000, commission: 500000 });
    expect(bookingEstimate(100, 3, 0)).toEqual({ net: 300, commission: 0 });
  });
  it("muestra la fecha de salida sin correrla de día", () => {
    expect(formatDay("2026-12-15T12:00:00.000Z")).toMatch(/15/);
  });
});
