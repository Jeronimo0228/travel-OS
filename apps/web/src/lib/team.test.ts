import { describe, expect, it } from "vitest";
import { invitationWhatsApp } from "./team";

describe("team helpers", () => {
  it("arma el mensaje de invitación para WhatsApp", () => {
    const url = new URL(invitationWhatsApp("https://travel-os.pdpcomunica.com/invitacion#t=abc", "asesor"));
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toContain("invitacion#t=abc");
    expect(url.searchParams.get("text")).toContain("asesor");
  });
});
