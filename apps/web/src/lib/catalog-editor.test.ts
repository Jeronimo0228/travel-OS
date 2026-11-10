import { describe, expect, it } from "vitest";
import { draftFromItem, draftToInput, EMPTY_DRAFT } from "./catalog";

describe("catalog editor helpers", () => {
  it("convierte precios con formato colombiano", () => {
    const { input } = draftToInput({ ...EMPTY_DRAFT, name: "Hotel", destination: "Cali", price: "$ 450.000" });
    expect(input?.price).toBe(450000);
    expect(input?.currency).toBe("COP");
  });

  it("explica qué falta", () => {
    expect(draftToInput({ ...EMPTY_DRAFT, destination: "Cali", price: "1" }).error).toMatch(/nombre/);
    expect(draftToInput({ ...EMPTY_DRAFT, name: "Hotel", destination: "Cali", price: "0" }).error).toMatch(/precio/);
  });

  it("carga un ítem existente para editarlo", () => {
    const draft = draftFromItem({
      id: "1",
      kind: "ACTIVITY",
      name: "Tour",
      destination: "Cartagena",
      description: "",
      pricingUnit: "PER_PERSON",
      price: "180000.00",
      currency: "COP",
    });
    expect(draft.price).toBe("180000");
    expect(draft.kind).toBe("ACTIVITY");
  });
});
