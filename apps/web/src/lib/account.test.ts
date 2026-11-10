import { describe, expect, it } from "vitest";
import { passwordProblem, tokenFromHash } from "./account";

describe("account helpers", () => {
  it("lee solo tokens válidos del fragmento", () => {
    const token = "a".repeat(43);
    expect(tokenFromHash(`#t=${token}`)).toBe(token);
    expect(tokenFromHash("#t=corto")).toBeNull();
    expect(tokenFromHash(`#t=${"a".repeat(42)}<`)).toBeNull();
    expect(tokenFromHash("")).toBeNull();
  });

  it("valida la nueva contraseña", () => {
    expect(passwordProblem("corta", "corta")).toMatch(/8 caracteres/);
    expect(passwordProblem("larga-segura", "otra-segura")).toMatch(/no coinciden/);
    expect(passwordProblem("larga-segura", "larga-segura")).toBeNull();
  });
});
