import { describe, expect, it } from "vitest";
import { ApiError, SessionExpiredError } from "./api-client";
import { cheapestOptionId, quoteErrorMessage } from "./quote-logic";
import type { QuoteOption } from "./quotes";

function option(id: string, totalPrice: string): QuoteOption {
  return {
    id,
    position: 1,
    title: id,
    summary: "resumen",
    totalPrice,
    currency: "COP",
    items: [],
  };
}

describe("cheapestOptionId", () => {
  it("returns the option with the lowest total", () => {
    expect(
      cheapestOptionId([
        option("a", "2500000.00"),
        option("b", "1800000.00"),
        option("c", "3100000.00"),
      ]),
    ).toBe("b");
  });

  it("compares totals numerically, not as strings", () => {
    expect(
      cheapestOptionId([option("a", "900000.00"), option("b", "1000000.00")]),
    ).toBe("a");
  });

  it("returns null when the lowest total is tied", () => {
    expect(
      cheapestOptionId([
        option("a", "1000000.00"),
        option("b", "1000000.00"),
        option("c", "2000000.00"),
      ]),
    ).toBeNull();
  });

  it("returns null when there is nothing to compare", () => {
    expect(cheapestOptionId([option("a", "1000000.00")])).toBeNull();
    expect(cheapestOptionId([])).toBeNull();
  });
});

describe("quoteErrorMessage", () => {
  it("explains a 400 as a catalog problem", () => {
    expect(
      quoteErrorMessage(new ApiError("English detail", undefined, 400)),
    ).toContain("catálogo");
  });

  it("explains a 403 as missing permission", () => {
    expect(
      quoteErrorMessage(new ApiError("Forbidden", undefined, 403)),
    ).toBe("No tienes permiso para realizar esta acción.");
  });

  it("explains a 502 as an invalid AI response", () => {
    expect(
      quoteErrorMessage(new ApiError("bad gateway", undefined, 502)),
    ).toContain("respuesta inválida");
  });

  it("explains a 503 as the AI being unavailable", () => {
    expect(
      quoteErrorMessage(new ApiError("unavailable", undefined, 503)),
    ).toContain("no está disponible");
  });

  it("keeps the session-expired message", () => {
    expect(quoteErrorMessage(new SessionExpiredError())).toBe(
      "Tu sesión expiró. Inicia sesión de nuevo.",
    );
  });

  it("keeps the message of errors without a mapped status", () => {
    expect(
      quoteErrorMessage(new ApiError("No se pudo conectar con el servidor.")),
    ).toBe("No se pudo conectar con el servidor.");
  });

  it("falls back for unknown errors", () => {
    expect(quoteErrorMessage(new Error("boom"))).toBe(
      "Ocurrió un error inesperado. Inténtalo de nuevo.",
    );
  });
});
