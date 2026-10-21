import { describe, expect, it } from "vitest";
import { cleanFaqs, knowledgeCompleteness } from "./knowledge";

describe("knowledge helpers (HU-24)", () => {
  it("drops incomplete FAQ rows and trims text", () => {
    expect(
      cleanFaqs([
        { question: "  ¿Seguro? ", answer: " Sí " },
        { question: "", answer: "sin pregunta" },
        { question: "sin respuesta", answer: "  " },
      ]),
    ).toEqual([{ question: "¿Seguro?", answer: "Sí" }]);
  });

  it("reports completeness across tone, policies and FAQs", () => {
    expect(knowledgeCompleteness({ tone: "", policies: "", faqs: [] })).toBe(0);
    expect(
      knowledgeCompleteness({
        tone: "Cálido",
        policies: "Anticipo 30 %",
        faqs: [{ question: "¿Q?", answer: "A" }],
      }),
    ).toBe(100);
    expect(knowledgeCompleteness({ tone: "Cálido", policies: "", faqs: [] })).toBe(33);
  });
});
