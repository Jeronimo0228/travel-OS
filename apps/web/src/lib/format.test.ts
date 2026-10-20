import { describe, expect, it } from "vitest";
import { formatCop, formatRelativeTime, pluralize } from "./format";

const plain = (text: string) => text.replace(/\s/g, " ");

describe("formatCop", () => {
  it("formats a decimal string as whole-peso COP", () => {
    expect(plain(formatCop("1250000.00"))).toBe("$ 1.250.000");
  });

  it("formats numbers and zero", () => {
    expect(plain(formatCop(0))).toBe("$ 0");
  });

  it("uses the currency it is given", () => {
    expect(plain(formatCop(620, "USD"))).toBe("US$ 620");
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-10-19T12:00:00.000Z");

  it("says a few seconds under a minute", () => {
    expect(formatRelativeTime("2026-10-19T11:59:30.000Z", now)).toBe(
      "hace unos segundos",
    );
  });

  it("says minutes under an hour", () => {
    expect(formatRelativeTime("2026-10-19T11:55:00.000Z", now)).toBe(
      "hace 5 min",
    );
  });

  it("says hours under a day", () => {
    expect(formatRelativeTime("2026-10-19T09:00:00.000Z", now)).toBe("hace 3 h");
  });

  it("says days after a day", () => {
    expect(formatRelativeTime("2026-10-16T12:00:00.000Z", now)).toBe("hace 3 d");
  });

  it("treats dates slightly in the future as just now", () => {
    expect(formatRelativeTime("2026-10-19T12:00:05.000Z", now)).toBe(
      "hace unos segundos",
    );
  });
});

describe("pluralize", () => {
  it("uses the singular for one", () => {
    expect(pluralize(1, "día", "días")).toBe("1 día");
  });

  it("uses the plural otherwise", () => {
    expect(pluralize(5, "día", "días")).toBe("5 días");
    expect(pluralize(0, "viajero", "viajeros")).toBe("0 viajeros");
  });
});
