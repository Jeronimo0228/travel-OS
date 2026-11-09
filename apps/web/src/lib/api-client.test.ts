import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, SessionExpiredError, apiFetch } from "./api-client";

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function captureError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (cause) {
    return cause as ApiError;
  }
  throw new Error("Expected the request to be rejected");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch · success", () => {
  it("returns the parsed JSON body", async () => {
    mockFetch(json({ id: "1" }));

    await expect(apiFetch("/api/x")).resolves.toEqual({ id: "1" });
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch(new Response(null, { status: 204 }));

    await expect(apiFetch("/api/x", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("sends cookies and a JSON content type by default", async () => {
    const fetchMock = mockFetch(json({}));

    await apiFetch("/api/x");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/x$/);
    expect(init.credentials).toBe("include");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("keeps the default content type when the caller adds other headers", async () => {
    const fetchMock = mockFetch(json({}));

    await apiFetch("/api/x", { headers: { "X-Trace": "abc" } });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Trace": "abc",
    });
  });

  it("lets the caller override credentials (traveler portal uses omit)", async () => {
    const fetchMock = mockFetch(json({}));

    await apiFetch("/api/portal/x", { credentials: "omit" });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.credentials).toBe("omit");
  });
});

describe("apiFetch · errors", () => {
  it("maps a 401 to SessionExpiredError", async () => {
    mockFetch(json({ message: "Unauthorized" }, 401));

    const error = await captureError(apiFetch("/api/x"));

    expect(error).toBeInstanceOf(SessionExpiredError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("Tu sesión expiró. Inicia sesión de nuevo.");
  });

  it("uses a string message and keeps the status", async () => {
    mockFetch(json({ message: "Quote is outside your permitted scope" }, 403));

    const error = await captureError(apiFetch("/api/x"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Quote is outside your permitted scope");
    expect(error.status).toBe(403);
  });

  it("joins an array of messages (Nest validation)", async () => {
    mockFetch(json({ message: ["name must not be empty", "email must be an email"] }, 400));

    const error = await captureError(apiFetch("/api/x"));

    expect(error.message).toBe("name must not be empty email must be an email");
    expect(error.status).toBe(400);
  });

  it("flattens Zod field errors to the first message per field", async () => {
    mockFetch(
      json({ fieldErrors: { email: ["Email inválido", "otro"], name: [] } }, 400),
    );

    const error = await captureError(apiFetch("/api/x"));

    expect(error.fieldErrors).toEqual({ email: "Email inválido" });
    expect(error.message).toBe("Email inválido");
    expect(error.status).toBe(400);
  });

  it("uses form errors when there are no field errors", async () => {
    mockFetch(json({ formErrors: ["Fechas inválidas"] }, 400));

    const error = await captureError(apiFetch("/api/x"));

    expect(error.message).toBe("Fechas inválidas");
    expect(error.fieldErrors).toBeUndefined();
  });

  it("falls back to a generic message when the body is not JSON", async () => {
    mockFetch(new Response("<html>boom</html>", { status: 500 }));

    const error = await captureError(apiFetch("/api/x"));

    expect(error.message).toBe("La solicitud falló (500).");
    expect(error.status).toBe(500);
  });

  it("falls back to a generic message when the JSON has no usable fields", async () => {
    mockFetch(json({}, 502));

    const error = await captureError(apiFetch("/api/x"));

    expect(error.message).toBe("La solicitud falló (502).");
    expect(error.status).toBe(502);
  });

  it("reports a network failure without a status", async () => {
    mockFetch(new TypeError("Failed to fetch"));

    const error = await captureError(apiFetch("/api/x"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBeUndefined();
    expect(error.message).toContain("No se pudo conectar con el servidor");
  });
});
