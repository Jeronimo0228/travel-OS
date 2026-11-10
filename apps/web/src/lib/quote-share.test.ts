import { describe, expect, it } from "vitest";
import { quoteShareText, quoteWhatsAppLink } from "./quote-share";

const quote = {
  destination: "Cartagena",
  durationDays: 4,
  travelerCount: 2,
  options: [
    { title: "Frente al mar", totalPrice: "2500000", currency: "COP" },
    { title: "Centro histórico", totalPrice: "1800000", currency: "COP" },
  ],
} as Parameters<typeof quoteShareText>[0];

describe("quote share", () => {
  it("lists every option with its total and no internal IDs", () => {
    const text = quoteShareText(quote);
    expect(text).toContain("Cartagena (4 días, 2 viajeros)");
    expect(text).toContain("1. Frente al mar:");
    expect(text).toContain("2. Centro histórico:");
    expect(text).not.toMatch(/id|catalog/i);
  });

  it("builds a wa.me link with the encoded text", () => {
    const url = new URL(quoteWhatsAppLink(quote));
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toBe(quoteShareText(quote));
  });
});
