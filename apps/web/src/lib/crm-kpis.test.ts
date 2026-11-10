import { describe, expect, it } from "vitest";
import { crmKpis } from "./crm-kpis";

describe("crmKpis", () => {
  it("counts active, closing and conversion from real leads", () => {
    const leads = [
      { stage: "PROSPECTO" },
      { stage: "CIERRE" },
      { stage: "GANADO" },
      { stage: "GANADO" },
      { stage: "PERDIDO" },
    ] as const;
    expect(crmKpis([...leads])).toEqual({ active: 2, closing: 1, won: 2, lost: 1, conversion: 67 });
  });

  it("has no conversion before any lead is decided", () => {
    expect(crmKpis([{ stage: "PROSPECTO" }]).conversion).toBeNull();
  });
});
