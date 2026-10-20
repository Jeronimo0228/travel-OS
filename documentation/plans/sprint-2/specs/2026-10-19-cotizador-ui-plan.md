# Cotizador IA (UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el placeholder `/cotizador` por la pantalla real: chat de pedidos con historial, propuesta con 2–3 alternativas comparables en COP, vincular a lead y generar/descargar PDF, todo contra la API ya entregada.

**Architecture:** Mismo patrón que el CRM: `lib/*.ts` con fetchers tipados sobre `apiFetch` y un `QuoterStoreProvider` (Context) que guarda historial, selección y acciones. La lógica con riesgo de error silencioso (formato COP, alternativa más económica, polling del PDF, mapeo de errores) vive en módulos puros con pruebas Vitest; los componentes solo presentan.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4 con los tokens de `globals.css`, `@travelos/shared` (Zod), Vitest (nuevo, solo dev).

**Spec:** `documentation/plans/sprint-2/specs/2026-10-19-cotizador-ui-design.md`

## Global Constraints

- El PDF **nunca** se genera en el cliente; solo `POST /api/quotes/:id/pdf` y `GET /api/quotes/:id/pdf`.
- Ningún texto en USD: los montos salen con `formatCop` usando la moneda de la respuesta.
- No se re-portan sidebar, topbar ni el botón flotante de IA; se usa `AppShell`.
- Estilos solo con los tokens del tema (`bg-surface-container-lowest`, `text-primary`, `font-headline`…); sin hex crudos en componentes.
- Todo botón de solo ícono lleva `aria-label`; todo input lleva `<label>`; el estado "IA analizando" va en una región `aria-live="polite"`.
- Textos de interfaz en español.
- La ruta sigue siendo `app/cotizador` (no se crea route group).
- Commits solo con la autoría del desarrollador, **sin** línea `Co-Authored-By` (`AGENTS.md`, regla 6). No abrir PR sin que el desarrollador lo pida.
- Código limpio: funciones pequeñas, sin comentarios obvios, sin código muerto.

## Prerrequisitos (una sola vez)

- Node 24 y pnpm 9.15. Si `pnpm` no está en el PATH, anteponer `corepack` a cada comando (`corepack pnpm ...`) o ejecutar `corepack enable` una vez. El script raíz `pnpm db:seed` llama a `pnpm` internamente; sin `pnpm` en el PATH usar `pnpm --filter @travelos/api prisma:seed`.
- Antes de levantar el API, ejecutar `pnpm install` en la raíz (el backend del Sprint 2 agregó `pdfkit` y `bullmq`).
- Si hay migraciones pendientes (`prisma migrate status`), aplicarlas con `pnpm --filter @travelos/api exec prisma migrate deploy`.
- Para las verificaciones manuales de las Tareas 4–7: Docker Desktop encendido, y `apps/web/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:4000` (confirmar que está ignorado con `git check-ignore apps/web/.env.local`).

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `apps/web/vitest.config.ts` (nuevo) | Config de Vitest con el alias `@/` |
| `apps/web/src/lib/format.ts` (nuevo) | `formatCop`, `formatRelativeTime`, `pluralize` |
| `apps/web/src/lib/api-client.ts` (modifica) | `ApiError.status`, exporta `API_URL` |
| `apps/web/src/lib/quotes.ts` (nuevo) | Tipos de cotización y fetchers |
| `apps/web/src/lib/quote-logic.ts` (nuevo) | `cheapestOptionId`, `quoteErrorMessage` |
| `apps/web/src/lib/pdf-poller.ts` (nuevo) | `pollPdfStatus`, `pdfButtonState` |
| `apps/web/src/components/quotes/quick-prompts.ts` (nuevo) | Textos de los chips |
| `apps/web/src/components/quotes/QuoterStoreProvider.tsx` (nuevo) | Estado y acciones |
| `apps/web/src/components/quotes/QuoterChat.tsx` (nuevo) | Chat de pedidos |
| `apps/web/src/components/quotes/QuoteCanvas.tsx` (nuevo) | Encabezado y alternativas |
| `apps/web/src/components/quotes/QuoteOptionCard.tsx` (nuevo) | Una alternativa |
| `apps/web/src/components/quotes/LeadLinker.tsx` (nuevo) | Selector de lead |
| `apps/web/src/components/quotes/QuotePdfButton.tsx` (nuevo) | Botón con estados del PDF |
| `apps/web/src/app/cotizador/page.tsx` (modifica) | Reemplaza el placeholder |
| `apps/web/src/app/globals.css` (modifica) | Agrega `.shimmer` |
| `apps/web/package.json` (modifica) | `vitest` y script `test` |
| `.github/workflows/ci.yml` (modifica) | Paso `Test Web` |

---

### Task 1: Vitest y utilidades de formato

**Files:**
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/lib/format.ts`
- Test: `apps/web/src/lib/format.test.ts`
- Modify: `apps/web/package.json` (script `test`, devDependency `vitest`)
- Modify: `.github/workflows/ci.yml` (paso `Test Web`)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `formatCop(value: string | number, currency?: string): string` — monto en pesos enteros, p. ej. `"$ 1.250.000"`.
  - `formatRelativeTime(isoDate: string, now?: number): string` — `"hace unos segundos" | "hace N min" | "hace N h" | "hace N d"`.
  - `pluralize(count: number, singular: string, plural: string): string` — `"1 día"`, `"5 días"`.

- [ ] **Step 1: Crear la rama y verificar la identidad de git**

```bash
cd C:/Users/santi/travel-OS
git config user.name
git config user.email
git switch -c feature/HU-14-cotizador-ui
```

Expected: el nombre y correo son los del desarrollador (Santiago). Si no lo son, configurarlos solo en este repo con `git config user.name "..."` y `git config user.email "..."` antes de seguir. La rama se crea desde `main`; los documentos de `documentation/plans/sprint-2/specs/` siguen sin versionar.

- [ ] **Step 2: Commitear el diseño y este plan**

```bash
git add documentation/plans/sprint-2/specs
git commit -m "docs(sprint-2): agrega diseño y plan de implementación del cotizador"
```

- [ ] **Step 3: Instalar Vitest**

```bash
pnpm --filter @travelos/web add -D vitest@^3.2.4
```

Expected: `apps/web/package.json` y `pnpm-lock.yaml` cambian.

- [ ] **Step 4: Crear `apps/web/vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Cambiar el script `test` en `apps/web/package.json`**

Reemplazar la línea `"test": "echo 'no-tests'"` por:

```json
    "test": "vitest run"
```

- [ ] **Step 6: Escribir las pruebas que fallan en `apps/web/src/lib/format.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { formatCop, formatRelativeTime, pluralize } from "./format";

const plain = (text: string) => text.replace(/\s/g, " ");

describe("formatCop", () => {
  it("formats a decimal string as whole-peso COP", () => {
    expect(plain(formatCop("1250000.00"))).toBe("$ 1.250.000");
  });

  it("formats numbers and zero", () => {
    expect(plain(formatCop(0))).toBe("$ 0");
  });

  it("uses the currency it is given", () => {
    expect(plain(formatCop(620, "USD"))).toBe("US$ 620");
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-10-19T12:00:00.000Z");

  it("says a few seconds under a minute", () => {
    expect(formatRelativeTime("2026-10-19T11:59:30.000Z", now)).toBe(
      "hace unos segundos",
    );
  });

  it("says minutes under an hour", () => {
    expect(formatRelativeTime("2026-10-19T11:55:00.000Z", now)).toBe(
      "hace 5 min",
    );
  });

  it("says hours under a day", () => {
    expect(formatRelativeTime("2026-10-19T09:00:00.000Z", now)).toBe("hace 3 h");
  });

  it("says days after a day", () => {
    expect(formatRelativeTime("2026-10-16T12:00:00.000Z", now)).toBe("hace 3 d");
  });

  it("treats dates slightly in the future as just now", () => {
    expect(formatRelativeTime("2026-10-19T12:00:05.000Z", now)).toBe(
      "hace unos segundos",
    );
  });
});

describe("pluralize", () => {
  it("uses the singular for one", () => {
    expect(pluralize(1, "día", "días")).toBe("1 día");
  });

  it("uses the plural otherwise", () => {
    expect(pluralize(5, "día", "días")).toBe("5 días");
    expect(pluralize(0, "viajero", "viajeros")).toBe("0 viajeros");
  });
});
```

- [ ] **Step 7: Ejecutar las pruebas y verificar que fallan**

Run: `pnpm --filter @travelos/web test`
Expected: FAIL — no se puede resolver `./format`.

- [ ] **Step 8: Implementar `apps/web/src/lib/format.ts`**

```ts
export function formatCop(value: string | number, currency = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatRelativeTime(
  isoDate: string,
  now: number = Date.now(),
): string {
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(isoDate).getTime()) / 1000),
  );
  if (seconds < 60) return "hace unos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
```

- [ ] **Step 9: Ejecutar las pruebas y verificar que pasan**

Run: `pnpm --filter @travelos/web test`
Expected: PASS — 10 pruebas en `format.test.ts`.

- [ ] **Step 10: Agregar el paso `Test Web` al CI**

En `.github/workflows/ci.yml`, reemplazar:

```yaml
      - name: Lint Web
        run: pnpm --filter @travelos/web lint
```

por:

```yaml
      - name: Lint Web
        run: pnpm --filter @travelos/web lint
      - name: Test Web
        run: pnpm --filter @travelos/web test
```

- [ ] **Step 11: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/vitest.config.ts apps/web/src/lib/format.ts apps/web/src/lib/format.test.ts .github/workflows/ci.yml
git commit -m "chore(web): agrega Vitest, paso Test Web en CI y utilidades de formato"
```

---

### Task 2: Tipos de cotización, errores con estado y lógica pura

**Files:**
- Modify: `apps/web/src/lib/api-client.ts`
- Create: `apps/web/src/lib/quotes.ts`
- Create: `apps/web/src/lib/quote-logic.ts`
- Test: `apps/web/src/lib/quote-logic.test.ts`

**Interfaces:**
- Consumes: `apiFetch`, `ApiError`, `SessionExpiredError` de `api-client.ts`; `CreateQuoteInput` de `@travelos/shared`.
- Produces:
  - `ApiError.status?: number` (tercer parámetro del constructor); `export const API_URL: string`.
  - Tipos: `PdfStatus`, `QuoteItem`, `QuoteOption`, `Quote`.
  - Fetchers: `createQuote(input)`, `listQuotes(take?)`, `getQuote(id)`, `linkQuoteLead(id, leadId)`, `requestQuotePdf(id)`, `downloadQuotePdf(id): Promise<Blob>`.
  - `cheapestOptionId(options: QuoteOption[]): string | null`.
  - `quoteErrorMessage(error: unknown): string`.

- [ ] **Step 1: Modificar `apps/web/src/lib/api-client.ts`**

Reemplazar la primera línea:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
```

por:

```ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
```

Reemplazar la clase `ApiError` y `SessionExpiredError`:

```ts
export class ApiError extends Error {
  fieldErrors?: Record<string, string>;
  status?: number;

  constructor(
    message: string,
    fieldErrors?: Record<string, string>,
    status?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

export class SessionExpiredError extends ApiError {
  constructor() {
    super("Tu sesión expiró. Inicia sesión de nuevo.", undefined, 401);
    this.name = "SessionExpiredError";
  }
}
```

Reemplazar la función `parseErrorBody` completa por:

```ts
async function parseErrorBody(res: Response): Promise<ApiError> {
  if (res.status === 401) return new SessionExpiredError();

  const body = await res.json().catch(() => null) as
    | (ZodErrorBody & MessageErrorBody)
    | null;

  if (!body) {
    return new ApiError(
      `La solicitud falló (${res.status}).`,
      undefined,
      res.status,
    );
  }

  const fieldErrors = flattenFieldErrors(body);

  if (typeof body.message === "string") {
    return new ApiError(body.message, fieldErrors, res.status);
  }
  if (Array.isArray(body.message) && body.message.length > 0) {
    return new ApiError(body.message.join(" "), fieldErrors, res.status);
  }
  if (body.formErrors?.length) {
    return new ApiError(body.formErrors.join(" "), fieldErrors, res.status);
  }
  if (fieldErrors) {
    return new ApiError(Object.values(fieldErrors)[0], fieldErrors, res.status);
  }

  return new ApiError(
    `La solicitud falló (${res.status}).`,
    undefined,
    res.status,
  );
}
```

- [ ] **Step 2: Crear `apps/web/src/lib/quotes.ts`**

```ts
import type { CreateQuoteInput } from "@travelos/shared";
import { API_URL, ApiError, apiFetch } from "./api-client";

export type PdfStatus = "NOT_REQUESTED" | "PENDING" | "READY" | "FAILED";

export type QuoteItem = {
  id: string;
  nameSnapshot: string;
  descriptionSnapshot: string;
  pricingUnit: "PER_NIGHT" | "PER_PERSON";
  quantity: number;
  unitPrice: string;
};

export type QuoteOption = {
  id: string;
  position: number;
  title: string;
  summary: string;
  totalPrice: string;
  currency: string;
  items: QuoteItem[];
};

export type Quote = {
  id: string;
  leadId: string | null;
  prompt: string;
  destination: string;
  durationDays: number;
  travelerCount: number;
  pdfStatus: PdfStatus;
  createdAt: string;
  updatedAt: string;
  options: QuoteOption[];
};

export function createQuote(input: CreateQuoteInput) {
  return apiFetch<Quote>("/api/quotes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listQuotes(take = 20) {
  return apiFetch<{ items: Quote[]; total: number }>(
    `/api/quotes?take=${take}`,
  );
}

export function getQuote(id: string) {
  return apiFetch<Quote>(`/api/quotes/${id}`);
}

export function linkQuoteLead(id: string, leadId: string) {
  return apiFetch<Quote>(`/api/quotes/${id}/lead`, {
    method: "PUT",
    body: JSON.stringify({ leadId }),
  });
}

export function requestQuotePdf(id: string) {
  return apiFetch<{ status: PdfStatus }>(`/api/quotes/${id}/pdf`, {
    method: "POST",
  });
}

export async function downloadQuotePdf(id: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/quotes/${id}/pdf`, {
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté disponible.",
    );
  }

  if (!res.ok) {
    throw new ApiError(
      `No se pudo descargar el PDF (${res.status}).`,
      undefined,
      res.status,
    );
  }
  if (!res.headers.get("content-type")?.includes("application/pdf")) {
    throw new ApiError("El PDF todavía no está listo. Inténtalo de nuevo.");
  }

  return res.blob();
}
```

- [ ] **Step 3: Escribir las pruebas que fallan en `apps/web/src/lib/quote-logic.test.ts`**

```ts
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
```

- [ ] **Step 4: Ejecutar las pruebas y verificar que fallan**

Run: `pnpm --filter @travelos/web test`
Expected: FAIL — no se puede resolver `./quote-logic`.

- [ ] **Step 5: Implementar `apps/web/src/lib/quote-logic.ts`**

```ts
import { ApiError } from "./api-client";
import type { QuoteOption } from "./quotes";

const STATUS_MESSAGES: Record<number, string> = {
  400: "No pudimos armar una cotización con ese pedido. Revisa que el destino esté en el catálogo de tu agencia e inténtalo de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  502: "La IA devolvió una respuesta inválida. Reformula tu pedido o inténtalo de nuevo.",
  503: "El servicio de IA no está disponible en este momento. Inténtalo de nuevo más tarde.",
};

export function cheapestOptionId(options: QuoteOption[]): string | null {
  if (options.length < 2) return null;
  const totals = options.map((option) => ({
    id: option.id,
    total: Number(option.totalPrice),
  }));
  const lowest = Math.min(...totals.map((entry) => entry.total));
  const winners = totals.filter((entry) => entry.total === lowest);
  return winners.length === 1 ? winners[0].id : null;
}

export function quoteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const mapped = error.status ? STATUS_MESSAGES[error.status] : undefined;
    return mapped ?? error.message;
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
```

- [ ] **Step 6: Ejecutar las pruebas y verificar que pasan**

Run: `pnpm --filter @travelos/web test`
Expected: PASS — `format.test.ts` y `quote-logic.test.ts` (11 pruebas nuevas).

- [ ] **Step 7: Verificar tipos y lint**

Run: `pnpm --filter @travelos/web exec tsc --noEmit`
Expected: sin salida (sin errores).

Run: `pnpm --filter @travelos/web lint`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/api-client.ts apps/web/src/lib/quotes.ts apps/web/src/lib/quote-logic.ts apps/web/src/lib/quote-logic.test.ts
git commit -m "feat(web): tipos de cotización, estado en ApiError y lógica pura del cotizador"
```

---

### Task 3: Polling del PDF y estado del botón

**Files:**
- Create: `apps/web/src/lib/pdf-poller.ts`
- Test: `apps/web/src/lib/pdf-poller.test.ts`

**Interfaces:**
- Consumes: `PdfStatus` de `quotes.ts`.
- Produces:
  - `pollPdfStatus(options: { fetchStatus: () => Promise<PdfStatus>; intervalMs?: number; timeoutMs?: number; signal?: AbortSignal }): Promise<"READY" | "FAILED" | "TIMEOUT" | "ABORTED">` (por defecto consulta cada 2000 ms y se rinde a los 60000 ms).
  - `pdfButtonState(status: PdfStatus, watching: boolean): { label: string; action: "generate" | "download" | "none"; busy: boolean }`.

- [ ] **Step 1: Escribir las pruebas que fallan en `apps/web/src/lib/pdf-poller.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pdfButtonState, pollPdfStatus } from "./pdf-poller";
import type { PdfStatus } from "./quotes";

describe("pollPdfStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves READY once the status flips, polling every 2 seconds", async () => {
    const statuses: PdfStatus[] = ["PENDING", "PENDING", "READY"];
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => statuses.shift() ?? "READY");

    const outcome = pollPdfStatus({ fetchStatus });
    await vi.advanceTimersByTimeAsync(4000);

    await expect(outcome).resolves.toBe("READY");
    expect(fetchStatus).toHaveBeenCalledTimes(3);
  });

  it("resolves FAILED without waiting", async () => {
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => "FAILED");

    await expect(pollPdfStatus({ fetchStatus })).resolves.toBe("FAILED");
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it("gives up with TIMEOUT after 60 seconds of PENDING", async () => {
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => "PENDING");

    const outcome = pollPdfStatus({ fetchStatus });
    await vi.advanceTimersByTimeAsync(60_000);

    await expect(outcome).resolves.toBe("TIMEOUT");
    expect(fetchStatus).toHaveBeenCalledTimes(30);
  });

  it("stops with ABORTED when the signal is aborted", async () => {
    const controller = new AbortController();
    const fetchStatus = vi.fn(async (): Promise<PdfStatus> => "PENDING");

    const outcome = pollPdfStatus({ fetchStatus, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(2000);
    controller.abort();
    await vi.advanceTimersByTimeAsync(2000);

    await expect(outcome).resolves.toBe("ABORTED");
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });
});

describe("pdfButtonState", () => {
  it("offers to generate when nothing was requested", () => {
    expect(pdfButtonState("NOT_REQUESTED", false)).toEqual({
      label: "Generar PDF",
      action: "generate",
      busy: false,
    });
  });

  it("is busy while a request is being watched", () => {
    expect(pdfButtonState("PENDING", true)).toEqual({
      label: "Generando…",
      action: "none",
      busy: true,
    });
  });

  it("offers to download when ready", () => {
    expect(pdfButtonState("READY", false)).toEqual({
      label: "Descargar PDF",
      action: "download",
      busy: false,
    });
  });

  it("offers to retry after a failure or a timeout", () => {
    const retry = { label: "Reintentar", action: "generate", busy: false };
    expect(pdfButtonState("FAILED", false)).toEqual(retry);
    expect(pdfButtonState("PENDING", false)).toEqual(retry);
  });
});
```

- [ ] **Step 2: Ejecutar las pruebas y verificar que fallan**

Run: `pnpm --filter @travelos/web test`
Expected: FAIL — no se puede resolver `./pdf-poller`.

- [ ] **Step 3: Implementar `apps/web/src/lib/pdf-poller.ts`**

```ts
import type { PdfStatus } from "./quotes";

type PollOptions = {
  fetchStatus: () => Promise<PdfStatus>;
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type PdfPollOutcome = "READY" | "FAILED" | "TIMEOUT" | "ABORTED";

export type PdfButtonState = {
  label: string;
  action: "generate" | "download" | "none";
  busy: boolean;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function pollPdfStatus({
  fetchStatus,
  intervalMs = 2000,
  timeoutMs = 60_000,
  signal,
}: PollOptions): Promise<PdfPollOutcome> {
  let elapsed = 0;
  while (elapsed < timeoutMs) {
    if (signal?.aborted) return "ABORTED";
    const status = await fetchStatus();
    if (status === "READY" || status === "FAILED") return status;
    await sleep(intervalMs);
    elapsed += intervalMs;
  }
  return "TIMEOUT";
}

export function pdfButtonState(
  status: PdfStatus,
  watching: boolean,
): PdfButtonState {
  if (watching) return { label: "Generando…", action: "none", busy: true };
  if (status === "READY") {
    return { label: "Descargar PDF", action: "download", busy: false };
  }
  if (status === "NOT_REQUESTED") {
    return { label: "Generar PDF", action: "generate", busy: false };
  }
  return { label: "Reintentar", action: "generate", busy: false };
}
```

- [ ] **Step 4: Ejecutar las pruebas y verificar que pasan**

Run: `pnpm --filter @travelos/web test`
Expected: PASS — 8 pruebas nuevas en `pdf-poller.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/pdf-poller.ts apps/web/src/lib/pdf-poller.test.ts
git commit -m "feat(web): polling del PDF y estado del botón con pruebas"
```

---

### Task 4: Store, chat y página del cotizador

**Files:**
- Create: `apps/web/src/components/quotes/QuoterStoreProvider.tsx`
- Create: `apps/web/src/components/quotes/quick-prompts.ts`
- Create: `apps/web/src/components/quotes/QuoterChat.tsx`
- Create: `apps/web/src/components/quotes/QuoteCanvas.tsx` (versión mínima; la Tarea 5 la reemplaza)
- Modify: `apps/web/src/app/cotizador/page.tsx`
- Modify: `apps/web/src/app/globals.css`

**Interfaces:**
- Consumes: `createQuote`, `getQuote`, `linkQuoteLead`, `listQuotes`, `requestQuotePdf`, `Quote` de `@/lib/quotes`; `pollPdfStatus` de `@/lib/pdf-poller`; `quoteErrorMessage` de `@/lib/quote-logic`; `pluralize` de `@/lib/format`; `createQuoteSchema` de `@travelos/shared`.
- Produces:
  - `QuoterStoreProvider({ children })` y `useQuoterStore(): QuoterStoreValue` con: `quotes: Quote[]` (más reciente primero), `selected: Quote | null`, `loading: boolean`, `loadError: string | null`, `creating: boolean`, `createError: string | null`, `pdfWatching: Record<string, boolean>`, `pdfNotices: Record<string, string>`, `select(quoteId)`, `submitPrompt(prompt): Promise<boolean>`, `linkLead(quoteId, leadId): Promise<void>`, `generatePdf(quoteId): Promise<void>`, `refetch()`.
  - `quickPrompts: string[]`.
  - `QuoterChat()` y `QuoteCanvas()` sin props.

- [ ] **Step 1: Agregar `.shimmer` a `apps/web/src/app/globals.css`**

Reemplazar el último bloque:

```css
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
```

por:

```css
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
  }
}
```

- [ ] **Step 2: Crear `apps/web/src/components/quotes/quick-prompts.ts`**

```ts
export const quickPrompts = [
  "Pareja a Cartagena por 4 noches, hotel frente al mar",
  "Familia de 4 a Medellín por 5 días con actividades cerca",
  "Grupo de 6 amigos a Santa Marta por 3 días, presupuesto bajo",
];
```

- [ ] **Step 3: Crear `apps/web/src/components/quotes/QuoterStoreProvider.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pollPdfStatus } from "@/lib/pdf-poller";
import { quoteErrorMessage } from "@/lib/quote-logic";
import {
  createQuote,
  getQuote,
  linkQuoteLead,
  listQuotes,
  requestQuotePdf,
  type Quote,
} from "@/lib/quotes";

type QuoterStoreValue = {
  quotes: Quote[];
  selected: Quote | null;
  loading: boolean;
  loadError: string | null;
  creating: boolean;
  createError: string | null;
  pdfWatching: Record<string, boolean>;
  pdfNotices: Record<string, string>;
  select: (quoteId: string) => void;
  submitPrompt: (prompt: string) => Promise<boolean>;
  linkLead: (quoteId: string, leadId: string) => Promise<void>;
  generatePdf: (quoteId: string) => Promise<void>;
  refetch: () => void;
};

const QuoterStoreContext = createContext<QuoterStoreValue | null>(null);

export function QuoterStoreProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [pdfWatching, setPdfWatching] = useState<Record<string, boolean>>({});
  const [pdfNotices, setPdfNotices] = useState<Record<string, string>>({});
  const [reloadToken, setReloadToken] = useState(0);
  const pollingRef = useRef(new Set<string>());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
  }, []);

  const upsertQuote = useCallback((quote: Quote) => {
    setQuotes((current) =>
      current.map((item) => (item.id === quote.id ? quote : item)),
    );
  }, []);

  const setPdfNotice = useCallback((quoteId: string, message: string | null) => {
    setPdfNotices((current) => {
      const next = { ...current };
      if (message) next[quoteId] = message;
      else delete next[quoteId];
      return next;
    });
  }, []);

  const runPdf = useCallback(
    async (quoteId: string, shouldRequest: boolean) => {
      if (pollingRef.current.has(quoteId)) return;
      pollingRef.current.add(quoteId);
      setPdfWatching((current) => ({ ...current, [quoteId]: true }));
      setPdfNotice(quoteId, null);

      try {
        if (shouldRequest) await requestQuotePdf(quoteId);
        const outcome = await pollPdfStatus({
          signal: abortRef.current?.signal,
          fetchStatus: async () => {
            const quote = await getQuote(quoteId);
            upsertQuote(quote);
            return quote.pdfStatus;
          },
        });
        if (outcome === "FAILED") {
          setPdfNotice(quoteId, "No se pudo generar el PDF. Inténtalo de nuevo.");
        }
        if (outcome === "TIMEOUT") {
          setPdfNotice(
            quoteId,
            "El PDF está tardando más de lo normal. Inténtalo de nuevo en un momento.",
          );
        }
      } catch (error) {
        setPdfNotice(quoteId, quoteErrorMessage(error));
      } finally {
        pollingRef.current.delete(quoteId);
        setPdfWatching((current) => ({ ...current, [quoteId]: false }));
      }
    },
    [setPdfNotice, upsertQuote],
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    listQuotes()
      .then((result) => {
        if (cancelled) return;
        setQuotes(result.items);
        result.items
          .filter((quote) => quote.pdfStatus === "PENDING")
          .forEach((quote) => void runPdf(quote.id, false));
      })
      .catch((error) => {
        if (!cancelled) setLoadError(quoteErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, runPdf]);

  const submitPrompt = useCallback(async (prompt: string) => {
    setCreating(true);
    setCreateError(null);
    try {
      const quote = await createQuote({ prompt });
      setQuotes((current) => [
        quote,
        ...current.filter((item) => item.id !== quote.id),
      ]);
      setSelectedId(quote.id);
      return true;
    } catch (error) {
      setCreateError(quoteErrorMessage(error));
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  const linkLead = useCallback(
    async (quoteId: string, leadId: string) => {
      upsertQuote(await linkQuoteLead(quoteId, leadId));
    },
    [upsertQuote],
  );

  const generatePdf = useCallback(
    (quoteId: string) => runPdf(quoteId, true),
    [runPdf],
  );

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const value = useMemo<QuoterStoreValue>(
    () => ({
      quotes,
      selected: quotes.find((quote) => quote.id === selectedId) ?? quotes[0] ?? null,
      loading,
      loadError,
      creating,
      createError,
      pdfWatching,
      pdfNotices,
      select: setSelectedId,
      submitPrompt,
      linkLead,
      generatePdf,
      refetch,
    }),
    [
      quotes,
      selectedId,
      loading,
      loadError,
      creating,
      createError,
      pdfWatching,
      pdfNotices,
      submitPrompt,
      linkLead,
      generatePdf,
      refetch,
    ],
  );

  return (
    <QuoterStoreContext.Provider value={value}>
      {children}
    </QuoterStoreContext.Provider>
  );
}

export function useQuoterStore(): QuoterStoreValue {
  const context = useContext(QuoterStoreContext);
  if (!context) {
    throw new Error("useQuoterStore must be used within a QuoterStoreProvider");
  }
  return context;
}
```

- [ ] **Step 4: Crear `apps/web/src/components/quotes/QuoterChat.tsx`**

```tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createQuoteSchema } from "@travelos/shared";
import { pluralize } from "@/lib/format";
import { quickPrompts } from "./quick-prompts";
import { useQuoterStore } from "./QuoterStoreProvider";

const promptSchema = createQuoteSchema.shape.prompt;

export function QuoterChat() {
  const {
    quotes,
    selected,
    loading,
    loadError,
    creating,
    createError,
    select,
    submitPrompt,
    refetch,
  } = useQuoterStore();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const history = [...quotes].reverse();
  const canSend = promptSchema.safeParse(draft).success && !creating;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [quotes.length, creating]);

  async function send() {
    const parsed = promptSchema.safeParse(draft);
    if (!parsed.success || creating) return;
    if (await submitPrompt(parsed.data)) setDraft("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <section
      aria-label="Cotizador"
      className="flex h-full min-h-0 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest"
    >
      <div className="border-b border-outline-variant p-4">
        <h2 className="font-headline text-headline-lg text-primary">
          Cotizador en lenguaje natural
        </h2>
        <p className="font-body-custom text-body-sm text-on-surface-variant">
          Describe el viaje y deja que TravelOS IA construya la experiencia.
        </p>
      </div>

      <div
        role="log"
        aria-label="Historial de cotizaciones"
        className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
      >
        {loading && (
          <div className="space-y-2" aria-hidden="true">
            <div className="shimmer h-4 w-3/4 rounded-full bg-surface-container-highest" />
            <div className="shimmer h-4 w-1/2 rounded-full bg-surface-container-highest" />
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-error bg-error-container p-3 font-body-custom text-body-sm text-on-error-container"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-2 rounded-lg border border-error px-3 py-1 font-body-custom text-label-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && quotes.length === 0 && (
          <div className="rounded-xl border border-outline-variant p-3 font-body-custom text-body-sm text-primary">
            ¡Hola! Estoy listo para crear una nueva cotización. Cuéntame sobre
            los viajeros, el destino y las fechas.
          </div>
        )}

        {history.map((quote) => {
          const isSelected = selected?.id === quote.id;
          return (
            <div key={quote.id} className="space-y-2">
              <p className="ml-8 rounded-xl bg-primary p-3 font-body-custom text-body-sm text-on-primary">
                {quote.prompt}
              </p>
              <button
                type="button"
                onClick={() => select(quote.id)}
                aria-pressed={isSelected}
                className={`mr-8 w-full rounded-xl border p-3 text-left font-body-custom text-body-sm text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container ${
                  isSelected
                    ? "border-secondary bg-secondary-fixed"
                    : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                }`}
              >
                Preparé {quote.options.length} alternativas para{" "}
                {quote.destination} · {pluralize(quote.durationDays, "día", "días")}{" "}
                · {pluralize(quote.travelerCount, "viajero", "viajeros")}
              </button>
            </div>
          );
        })}

        <div aria-live="polite">
          {creating && (
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined ai-pulse text-secondary"
                aria-hidden="true"
              >
                auto_awesome
              </span>
              <div className="flex-1 space-y-2">
                <p className="font-body-custom text-label-sm uppercase tracking-wider text-secondary">
                  IA analizando…
                </p>
                <div className="shimmer h-3 w-3/4 rounded-full bg-surface-container-highest" />
                <div className="shimmer h-3 w-1/2 rounded-full bg-surface-container-highest" />
              </div>
            </div>
          )}
        </div>

        {createError && (
          <p
            role="alert"
            className="rounded-xl border border-error bg-error-container p-3 font-body-custom text-body-sm text-on-error-container"
          >
            {createError}
          </p>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 border-t border-outline-variant p-4"
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ejemplos de pedido">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-full border border-outline-variant px-3 py-1 text-left font-body-custom text-label-sm text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="relative">
          <label htmlFor="quoter-prompt" className="sr-only">
            Describe el viaje que quieres cotizar
          </label>
          <textarea
            id="quoter-prompt"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={2000}
            rows={3}
            placeholder="Ej.: Pareja a Cartagena por 4 noches, hotel frente al mar"
            className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-lowest p-3 pr-14 font-body-custom text-body-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Enviar solicitud"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-on-secondary transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              send
            </span>
          </button>
        </div>
        <p className="font-body-custom text-label-sm text-on-surface-variant">
          Enter envía · Shift+Enter agrega una línea · mínimo 10 caracteres
        </p>
      </form>
    </section>
  );
}
```

- [ ] **Step 5: Crear `apps/web/src/components/quotes/QuoteCanvas.tsx` (versión mínima)**

```tsx
"use client";

import { useQuoterStore } from "./QuoterStoreProvider";

export function QuoteCanvas() {
  const { selected } = useQuoterStore();

  return (
    <section
      aria-label="Propuesta"
      className="h-full rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
    >
      <p className="font-body-custom text-body-md text-on-surface-variant">
        {selected
          ? `Propuesta para ${selected.destination}`
          : "Tu propuesta aparecerá aquí."}
      </p>
    </section>
  );
}
```

- [ ] **Step 6: Reemplazar `apps/web/src/app/cotizador/page.tsx`**

```tsx
import { AppShell } from "@/components/layout/AppShell";
import { QuoteCanvas } from "@/components/quotes/QuoteCanvas";
import { QuoterChat } from "@/components/quotes/QuoterChat";
import { QuoterStoreProvider } from "@/components/quotes/QuoterStoreProvider";

export default function CotizadorPage() {
  return (
    <AppShell searchPlaceholder="Buscar cotizaciones, clientes...">
      <QuoterStoreProvider>
        <div className="grid grid-cols-1 gap-6 lg:h-[calc(100vh-112px)] lg:grid-cols-5">
          <div className="h-[70vh] min-h-0 lg:col-span-2 lg:h-full">
            <QuoterChat />
          </div>
          <div className="min-h-0 lg:col-span-3 lg:h-full">
            <QuoteCanvas />
          </div>
        </div>
      </QuoterStoreProvider>
    </AppShell>
  );
}
```

- [ ] **Step 7: Verificar tipos, lint y pruebas**

Run: `pnpm --filter @travelos/web exec tsc --noEmit`
Expected: sin salida.

Run: `pnpm --filter @travelos/web lint`
Expected: sin errores.

Run: `pnpm --filter @travelos/web test`
Expected: PASS (todas las pruebas anteriores).

- [ ] **Step 8: Levantar el stack (primera vez)**

```bash
pnpm db:up
pnpm --filter @travelos/shared build
pnpm --filter @travelos/api prisma:generate
pnpm --filter @travelos/api exec prisma migrate dev
pnpm db:seed
pnpm dev
```

Expected: web en http://localhost:3000 y API en http://localhost:4000/api/health. Entrar a `/login` con el usuario demo del `README.md` (`admin@demo.travelos.local`).

- [ ] **Step 9: Verificación manual en el navegador**

Abrir http://localhost:3000/cotizador y comprobar:
- Se ve el historial con la cotización `[DEMO PDF]` de Cartagena; hacer clic en su respuesta la marca como seleccionada y el panel derecho dice "Propuesta para Cartagena".
- Con el historial vacío (otro usuario) aparece el saludo.
- Los tres chips rellenan el textarea; con menos de 10 caracteres el botón de enviar está deshabilitado; **Enter** envía y **Shift+Enter** agrega una línea.
- Enviar un pedido muestra "IA analizando…". Con `GROQ_API_KEY` configurada aparece una respuesta nueva y queda seleccionada; sin la clave aparece el mensaje "El servicio de IA no está disponible en este momento…" en una caja de error.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/components/quotes apps/web/src/app/cotizador/page.tsx apps/web/src/app/globals.css
git commit -m "feat(web): store, chat y página del cotizador con historial de pedidos"
```

---

### Task 5: Propuesta con alternativas comparables

**Files:**
- Create: `apps/web/src/components/quotes/QuoteOptionCard.tsx`
- Modify (reemplazo completo): `apps/web/src/components/quotes/QuoteCanvas.tsx`

**Interfaces:**
- Consumes: `useQuoterStore` (`selected`, `loading`); `cheapestOptionId` de `@/lib/quote-logic`; `formatCop`, `formatRelativeTime`, `pluralize` de `@/lib/format`; `QuoteOption` de `@/lib/quotes`; `EmptyState` de `@/components/crm/EmptyState`.
- Produces: `QuoteOptionCard({ option: QuoteOption; cheapest: boolean })`; `QuoteCanvas()` con encabezado y grilla de alternativas.

- [ ] **Step 1: Crear `apps/web/src/components/quotes/QuoteOptionCard.tsx`**

```tsx
import { formatCop } from "@/lib/format";
import type { QuoteOption } from "@/lib/quotes";

const UNIT_LABELS = { PER_NIGHT: "noche", PER_PERSON: "persona" } as const;

type QuoteOptionCardProps = {
  option: QuoteOption;
  cheapest: boolean;
};

export function QuoteOptionCard({ option, cheapest }: QuoteOptionCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-card-padding">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-headline text-headline-md text-primary">
          {option.title}
        </h3>
        {cheapest && (
          <span className="shrink-0 rounded-full bg-secondary-fixed px-2 py-1 font-body-custom text-label-sm text-on-secondary-fixed-variant">
            Más económica
          </span>
        )}
      </header>

      <p className="mb-4 font-body-custom text-body-sm text-on-surface-variant">
        {option.summary}
      </p>

      <ul className="mb-4 flex-1 space-y-3">
        {option.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 border-b border-outline-variant/50 pb-3 last:border-b-0"
          >
            <div>
              <p className="font-body-custom text-label-md text-primary">
                {item.nameSnapshot}
              </p>
              <p className="line-clamp-2 font-body-custom text-label-sm text-on-surface-variant">
                {item.descriptionSnapshot}
              </p>
              <p className="font-body-custom text-label-sm text-on-surface-variant">
                {item.quantity} × {formatCop(item.unitPrice, option.currency)} /{" "}
                {UNIT_LABELS[item.pricingUnit]}
              </p>
            </div>
            <p className="shrink-0 font-body-custom text-label-md text-primary">
              {formatCop(Number(item.unitPrice) * item.quantity, option.currency)}
            </p>
          </li>
        ))}
      </ul>

      <footer className="flex items-baseline justify-between border-t border-outline-variant pt-3">
        <span className="font-body-custom text-label-md text-on-surface-variant">
          Total estimado
        </span>
        <span className="font-headline text-headline-lg text-primary">
          {formatCop(option.totalPrice, option.currency)}
        </span>
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Reemplazar `apps/web/src/components/quotes/QuoteCanvas.tsx`**

```tsx
"use client";

import { EmptyState } from "@/components/crm/EmptyState";
import { formatRelativeTime, pluralize } from "@/lib/format";
import { cheapestOptionId } from "@/lib/quote-logic";
import { QuoteOptionCard } from "./QuoteOptionCard";
import { useQuoterStore } from "./QuoterStoreProvider";

export function QuoteCanvas() {
  const { selected, loading } = useQuoterStore();

  if (!selected) {
    return (
      <section
        aria-label="Propuesta"
        className="h-full rounded-xl border border-outline-variant bg-surface-container-lowest"
      >
        {loading ? (
          <div className="space-y-3 p-6" aria-hidden="true">
            <div className="shimmer h-6 w-1/2 rounded-full bg-surface-container-highest" />
            <div className="shimmer h-40 w-full rounded-xl bg-surface-container-highest" />
          </div>
        ) : (
          <EmptyState
            icon="request_quote"
            title="Aún no hay cotizaciones"
            description="Escribe un pedido en el chat y TravelOS IA armará 2 o 3 alternativas comparables."
          />
        )}
      </section>
    );
  }

  const cheapestId = cheapestOptionId(selected.options);

  return (
    <section
      aria-label="Propuesta"
      className="custom-scrollbar @container flex h-full flex-col gap-6 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 pb-24"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-lg text-primary">
            Borrador de propuesta: {selected.destination}
          </h2>
          <p className="font-body-custom text-body-sm text-on-surface-variant">
            {pluralize(selected.durationDays, "día", "días")} ·{" "}
            {pluralize(selected.travelerCount, "viajero", "viajeros")} ·
            Actualizado {formatRelativeTime(selected.updatedAt)}
          </p>
        </div>
      </header>

      <div
        className={`grid gap-4 @xl:grid-cols-2 ${
          selected.options.length >= 3 ? "@4xl:grid-cols-3" : ""
        }`}
      >
        {selected.options.map((option) => (
          <QuoteOptionCard
            key={option.id}
            option={option}
            cheapest={option.id === cheapestId}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar tipos y lint**

Run: `pnpm --filter @travelos/web exec tsc --noEmit`
Expected: sin salida.

Run: `pnpm --filter @travelos/web lint`
Expected: sin errores.

- [ ] **Step 4: Verificación manual en el navegador**

En http://localhost:3000/cotizador:
- La cotización `[DEMO PDF]` muestra 2 o 3 tarjetas de igual altura con ítems `cantidad × precio / noche|persona`, subtotal por ítem y total.
- **Todos los montos están en COP** (formato `$ 1.250.000`); no aparece ningún `US$` ni `$` sin separador de miles.
- Exactamente una tarjeta lleva "Más económica" (la de menor total); si dos empatan en el mínimo, ninguna.
- Con el historial vacío se ve el estado vacío "Aún no hay cotizaciones"; durante la carga inicial, el skeleton.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/quotes/QuoteOptionCard.tsx apps/web/src/components/quotes/QuoteCanvas.tsx
git commit -m "feat(web): propuesta con alternativas comparables en COP"
```

---

### Task 6: Vincular cotización a un lead

**Files:**
- Create: `apps/web/src/components/quotes/LeadLinker.tsx`
- Modify: `apps/web/src/components/quotes/QuoteCanvas.tsx`

**Interfaces:**
- Consumes: `listLeads`, `Lead` de `@/lib/leads`; `quoteErrorMessage` de `@/lib/quote-logic`; `Quote` de `@/lib/quotes`; `useQuoterStore().linkLead`.
- Produces: `LeadLinker({ quote: Quote })` — `<select>` con label, preseleccionado si `quote.leadId` existe.

- [ ] **Step 1: Crear `apps/web/src/components/quotes/LeadLinker.tsx`**

```tsx
"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { listLeads, type Lead } from "@/lib/leads";
import { quoteErrorMessage } from "@/lib/quote-logic";
import type { Quote } from "@/lib/quotes";
import { useQuoterStore } from "./QuoterStoreProvider";

export function LeadLinker({ quote }: { quote: Quote }) {
  const { linkLead } = useQuoterStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLeads({ take: 100 })
      .then((result) => {
        if (!cancelled) setLeads(result.items);
      })
      .catch((err) => {
        if (!cancelled) setError(quoteErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setError(null);
  }, [quote.id]);

  async function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const leadId = event.target.value;
    if (!leadId) return;
    setSaving(true);
    setError(null);
    try {
      await linkLead(quote.id, leadId);
    } catch (err) {
      setError(quoteErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const linkedLeadIsListed = leads.some((lead) => lead.id === quote.leadId);

  return (
    <div className="flex flex-col items-start gap-1">
      <label htmlFor="quote-lead" className="sr-only">
        Vincular cotización a un lead
      </label>
      <select
        id="quote-lead"
        value={quote.leadId ?? ""}
        onChange={onChange}
        disabled={saving}
        aria-busy={saving}
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-custom text-label-md text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container disabled:opacity-60"
      >
        <option value="" disabled>
          Vincular a un lead…
        </option>
        {quote.leadId && !linkedLeadIsListed && (
          <option value={quote.leadId}>Lead vinculado</option>
        )}
        {leads.map((lead) => (
          <option key={lead.id} value={lead.id}>
            {lead.name}
          </option>
        ))}
      </select>
      {error && (
        <p
          role="alert"
          className="max-w-xs font-body-custom text-label-sm text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Integrarlo en `QuoteCanvas.tsx`**

Agregar el import junto a los demás:

```tsx
import { LeadLinker } from "./LeadLinker";
```

Reemplazar:

```tsx
        </div>
      </header>
```

por:

```tsx
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <LeadLinker quote={selected} />
        </div>
      </header>
```

- [ ] **Step 3: Verificar tipos y lint**

Run: `pnpm --filter @travelos/web exec tsc --noEmit`
Expected: sin salida.

Run: `pnpm --filter @travelos/web lint`
Expected: sin errores.

- [ ] **Step 4: Verificación manual en el navegador**

En http://localhost:3000/cotizador con una cotización seleccionada:
- El selector lista los leads visibles para el usuario (con el admin demo, los leads del seed).
- Elegir un lead lo deja seleccionado sin recargar; recargar la página conserva la vinculación (viene de `leadId`).
- Cambiar a otra cotización del historial muestra su propio lead (o el placeholder "Vincular a un lead…").
- Con el servidor de la API detenido, elegir un lead muestra un mensaje de error en rojo bajo el selector.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/quotes/LeadLinker.tsx apps/web/src/components/quotes/QuoteCanvas.tsx
git commit -m "feat(web): vincular cotización a un lead desde el encabezado"
```

---

### Task 7: Botón de PDF y "Enviar al viajero" deshabilitado

**Files:**
- Create: `apps/web/src/components/quotes/QuotePdfButton.tsx`
- Modify: `apps/web/src/components/quotes/QuoteCanvas.tsx`

**Interfaces:**
- Consumes: `useQuoterStore` (`pdfWatching`, `pdfNotices`, `generatePdf`); `pdfButtonState` de `@/lib/pdf-poller`; `downloadQuotePdf`, `Quote` de `@/lib/quotes`; `quoteErrorMessage` de `@/lib/quote-logic`.
- Produces: `QuotePdfButton({ quote: Quote })`.

- [ ] **Step 1: Crear `apps/web/src/components/quotes/QuotePdfButton.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { pdfButtonState } from "@/lib/pdf-poller";
import { quoteErrorMessage } from "@/lib/quote-logic";
import { downloadQuotePdf, type Quote } from "@/lib/quotes";
import { useQuoterStore } from "./QuoterStoreProvider";

export function QuotePdfButton({ quote }: { quote: Quote }) {
  const { pdfWatching, pdfNotices, generatePdf } = useQuoterStore();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const state = pdfButtonState(quote.pdfStatus, pdfWatching[quote.id] === true);
  const busy = state.busy || downloading;
  const notice = downloadError ?? pdfNotices[quote.id] ?? null;

  useEffect(() => {
    setDownloadError(null);
  }, [quote.id]);

  async function download() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const url = URL.createObjectURL(await downloadQuotePdf(quote.id));
      const link = document.createElement("a");
      link.href = url;
      link.download = `cotizacion-${quote.id}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setDownloadError(quoteErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  function onClick() {
    if (state.action === "generate") void generatePdf(quote.id);
    if (state.action === "download") void download();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-busy={busy}
        className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-body-custom text-label-md text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={`material-symbols-outlined text-[20px] ${busy ? "ai-pulse" : ""}`}
          aria-hidden="true"
        >
          picture_as_pdf
        </span>
        {state.label}
      </button>
      {notice && (
        <p
          role="alert"
          className="max-w-xs font-body-custom text-label-sm text-error"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Integrarlo en `QuoteCanvas.tsx`**

Agregar el import:

```tsx
import { QuotePdfButton } from "./QuotePdfButton";
```

Reemplazar:

```tsx
          <LeadLinker quote={selected} />
        </div>
```

por:

```tsx
          <LeadLinker quote={selected} />
          <QuotePdfButton quote={selected} />
          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body-custom text-label-md text-on-primary opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              send
            </span>
            Enviar al viajero
            <span className="rounded-full bg-on-primary/20 px-2 py-0.5 text-label-sm">
              Próximamente
            </span>
          </button>
        </div>
```

- [ ] **Step 3: Verificar tipos, lint y pruebas**

Run: `pnpm --filter @travelos/web exec tsc --noEmit`
Expected: sin salida.

Run: `pnpm --filter @travelos/web lint`
Expected: sin errores.

Run: `pnpm --filter @travelos/web test`
Expected: PASS.

- [ ] **Step 4: Verificación manual en el navegador**

Con Redis arriba (Docker) y la API corriendo, en http://localhost:3000/cotizador:
- En la cotización `[DEMO PDF]`: "Generar PDF" → pasa a "Generando…" (deshabilitado, con pulso) → al terminar queda "Descargar PDF".
- "Descargar PDF" baja un archivo `cotizacion-<id>.pdf` que abre con el contenido de la cotización.
- Recargar la página mientras está "Generando…" retoma el estado "Generando…" y termina en "Descargar PDF".
- Detener Redis y pedir un PDF nuevo: el botón vuelve a "Reintentar" con el error visible.
- "Enviar al viajero" aparece deshabilitado con "Próximamente".

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/quotes/QuotePdfButton.tsx apps/web/src/components/quotes/QuoteCanvas.tsx
git commit -m "feat(web): generar y descargar PDF de la cotización"
```

---

### Task 8: Verificación final

**Files:** ninguno nuevo; solo verificación.

- [ ] **Step 1: Pruebas, lint, tipos y build**

```bash
pnpm --filter @travelos/shared build
pnpm --filter @travelos/web test
pnpm --filter @travelos/web lint
pnpm --filter @travelos/web exec tsc --noEmit
pnpm --filter @travelos/web build
```

Expected: todo sin errores; el build lista la ruta `/cotizador`.

- [ ] **Step 2: Recorrido manual completo**

Con el stack arriba, en http://localhost:3000/cotizador:
1. Historial vacío → saludo y estado vacío.
2. Enviar un pedido con cada chip → alternativas en COP, "Más económica" en una sola tarjeta (solo con `GROQ_API_KEY`; sin ella, mensaje de IA no disponible).
3. Pedir un destino fuera del catálogo (por ejemplo "Tokio por 5 días") → mensaje de catálogo (400), sin romper el historial.
4. Vincular un lead y recargar → sigue vinculado.
5. Generar y descargar el PDF.
6. Navegar solo con teclado: foco visible en chips, tarjetas del historial, selector y botones; los botones de solo ícono tienen nombre accesible.
7. Ningún `US$` ni texto en inglés visible.

- [ ] **Step 3: Revisar el estado del repo**

```bash
git status
git log --oneline main..HEAD
```

Expected: árbol limpio; 8 commits en la rama `feature/HU-14-cotizador-ui` (diseño+plan, Vitest, lógica, polling, store+chat, propuesta, lead, PDF). Todos con la autoría del desarrollador y sin `Co-Authored-By`.

- [ ] **Step 4: Entregar**

No hacer push ni abrir PR sin que el desarrollador lo pida. Si lo pide, el PR sigue el checklist de `.cursor/rules/pr-review.mdc` y menciona el paso `Test Web` agregado al CI.
