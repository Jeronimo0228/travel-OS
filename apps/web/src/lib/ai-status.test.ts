import { describe, expect, it } from "vitest";
import { backupCount, poolHealth, type AiStatus } from "./ai-status";

describe("ai status helpers", () => {
  it("classifies pool health", () => {
    expect(poolHealth({ dedicated: 0, total: 0, available: 0 })).toBe("sin-llaves");
    expect(poolHealth({ dedicated: 2, total: 3, available: 0 })).toBe("degradado");
    expect(poolHealth({ dedicated: 2, total: 3, available: 1 })).toBe("ok");
  });

  it("counts backup providers", () => {
    const base = { groq: { keys: 0 }, openrouter: { keys: 2 } } as AiStatus;
    expect(backupCount(base)).toBe(1);
    expect(backupCount({ ...base, groq: { keys: 1 } })).toBe(2);
  });
});
