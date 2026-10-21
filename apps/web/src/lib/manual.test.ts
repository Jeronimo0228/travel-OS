import { describe, expect, it } from "vitest";
import { MANUAL_SECTIONS } from "./manual";

describe("in-app manual", () => {
  it("covers every user type", () => {
    const roles = new Set(MANUAL_SECTIONS.flatMap((section) => section.roles));
    for (const role of ["Admin", "Gerente", "Asesor", "Viajero"]) {
      expect(roles.has(role)).toBe(true);
    }
  });

  it("has unique anchors and at least one step per section", () => {
    const ids = MANUAL_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(MANUAL_SECTIONS.every((section) => section.steps.length > 0)).toBe(true);
  });
});
