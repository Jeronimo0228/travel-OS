import { afterEach, describe, expect, it, vi } from "vitest";
import { askAssistant, historyForRequest, type ChatTurn } from "./assistant";

describe("assistant client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends only the last 6 turns, each capped at 1200 characters", () => {
    const turns: ChatTurn[] = Array.from({ length: 9 }, (_, i) => ({
      role: i % 2 ? "assistant" : "user",
      text: `${i}`.padEnd(2000, "x"),
    }));
    const sent = historyForRequest(turns);
    expect(sent).toHaveLength(6);
    expect(sent[0].text.startsWith("3")).toBe(true);
    expect(sent.every((t) => t.text.length <= 1200)).toBe(true);
  });

  it("posts to the assistant endpoint with the session cookie", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ reply: "Hola", suggestions: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(askAssistant("Hola", [])).resolves.toEqual({ reply: "Hola", suggestions: [] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/ai\/assistant$/);
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(JSON.parse(String(init?.body))).toEqual({ message: "Hola", history: [] });
  });
});
