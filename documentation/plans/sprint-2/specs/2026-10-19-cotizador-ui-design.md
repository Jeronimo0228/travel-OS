# Cotizador IA — diseño de UI (Sprint 2, Frontend)

Autor: Santiago Arboleda Giraldo · Fecha: 2026-10-19
Issues: #13 (prompt del cotizador, par), #14 (opciones comparables, dueño). Incluye los botones de PDF (#15) y de vincular a lead (#17), que son UI sobre API ya entregada.

Fuente visual de verdad: `cotizador.html` del repo `nickamam08/TravelOS-AI-Ecosystem` (gana el HTML sobre el PNG). Auditoría de UX: [`../ux-notes.md`](../ux-notes.md).

## 1. Alcance

### Dentro
- Pantalla `/cotizador` con chat de pedidos (izquierda) y propuesta con alternativas comparables (derecha).
- Historial de cotizaciones persistido en backend (`GET /quotes`).
- Vincular una cotización a un lead después de generada.
- Generar y descargar el PDF por la API asíncrona.

### Fuera (y por qué)
| Bloque del prototipo | Motivo |
|---|---|
| Vuelos recomendados | El catálogo del backend solo tiene HOTEL y ACTIVITY. |
| "% de precisión" | El backend no entrega score de confianza. No se inventa el número. |
| Badge "Objetivo de presupuesto cumplido" | La cotización no guarda presupuesto. |
| Mini "Borrador de itinerario" | Una cotización es hotel + actividades, sin datos por día. Se conecta en #16. |
| Refinamiento conversacional | Cada `POST /quotes` es independiente. Queda para el Sprint 3. |
| "Enviar al Viajero" | No existe endpoint. El botón se muestra deshabilitado con "Próximamente". |
| Fotos en las tarjetas | El backend no expone imágenes del catálogo. |
| Paginación del historial | Se carga solo la página más reciente (20). |

## 2. Decisiones tomadas

1. **Chat = historial de pedidos.** Cada mensaje crea una cotización nueva; el panel derecho muestra la seleccionada. Las anteriores se reabren desde el chat. Los chips solo rellenan el textarea.
2. **Vincular lead con selector en el encabezado de la propuesta**, sobre una cotización ya generada (`PUT /quotes/:id/lead`). No se envía `leadId` en la creación.
3. **Estado con el patrón del CRM:** `lib/quotes.ts` + `QuoterStoreProvider` (Context). Sin dependencias de datos nuevas.
4. **Pruebas con Vitest** (única dependencia nueva), solo para lógica pura.
5. **La ruta se queda en `app/cotizador`.** No se mueve a un route group `(agency)` porque `nav-items.ts` ya apunta a `/cotizador`.

## 3. Arquitectura

```
apps/web/src/
  app/cotizador/page.tsx                       reemplaza el placeholder ComingSoonPage
  app/globals.css                              se agrega .shimmer (una sola vez)
  lib/api-client.ts                            ApiError gana `status`; se exporta API_URL
  lib/quotes.ts                                tipos + fetchers
  lib/format.ts                                formatCop(), formatRelativeTime(), pluralize()
  lib/quote-logic.ts                           cheapestOptionId(), quoteErrorMessage()
  lib/pdf-poller.ts                            pollPdfStatus(), pdfButtonState()
  components/quotes/quick-prompts.ts           textos de los chips
  components/quotes/
    QuoterStoreProvider.tsx                    historial, selección, acciones
    QuoterChat.tsx                             mensajes, textarea, chips, estado "analizando"
    QuoteCanvas.tsx                            encabezado + alternativas
    QuoteOptionCard.tsx                        una alternativa
    QuotePdfButton.tsx                         botón con estados del PDF
    LeadLinker.tsx                             selector de lead
```

La página usa `AppShell` y el provider, igual que `/crm`. No se vuelven a portar sidebar, topbar ni el botón flotante de IA; ya existen.

### lib/quotes.ts
Fetchers sobre `apiFetch`: `createQuote`, `listQuotes`, `getQuote`, `linkQuoteLead`, `requestQuotePdf`, `getQuotePdf`. Reutiliza `createQuoteSchema` y los tipos de `@travelos/shared`.
Tipos de respuesta alineados con `quoteSelect` del backend: `id`, `leadId`, `prompt`, `destination`, `durationDays`, `travelerCount`, `pdfStatus` (`NOT_REQUESTED | PENDING | READY | FAILED`), `createdAt`, `updatedAt` y `options[]` con `title`, `summary`, `totalPrice` (string decimal), `currency` e `items[]` (`nameSnapshot`, `descriptionSnapshot`, `pricingUnit`, `quantity`, `unitPrice`).
El prefijo de ruta (`/api/quotes`) y la forma de la respuesta de `GET /quotes` (`{ items, total }`) se confirman contra el código del API antes de escribir los tipos.

### lib/format.ts
`formatCop(value, currency)` con `Intl.NumberFormat('es-CO')`, tomando la moneda de la respuesta. Ningún texto en USD.

### QuoterStoreProvider
Estado: `quotes` (historial), `selectedId`, `loading`, `creating`, `error`.
Acciones: `submitPrompt`, `select`, `linkLead`, `requestPdf`, `refetch`.
Al montar carga `GET /quotes` (take 20, más reciente primero); el chat los muestra del más antiguo al más reciente.

## 4. Comportamiento de la interfaz

**Layout.** Dos columnas dentro de `AppShell`: chat 2/5, propuesta el resto. El scroll vive dentro de cada panel.

**QuoterChat**
- Por cada cotización: burbuja con el pedido y respuesta del asistente ("Preparé N alternativas para {destino} · {días} días · {viajeros} viajeros"). Clic en la respuesta selecciona esa cotización; la seleccionada queda resaltada.
- Historial vacío: saludo del prototipo.
- Textarea con `<label>` `sr-only`, validado con `createQuoteSchema` (10 a 2000 caracteres). Enter envía; Shift+Enter hace salto de línea. Botón de enviar con `aria-label`.
- Chips desde una constante de datos; rellenan el textarea con un pedido de ejemplo completo y válido contra el catálogo sembrado (Cartagena, Medellín, Santa Marta). Se cambian los textos del prototipo: "Añadir clase ejecutiva" implica vuelos y "Comparar con Tulum" no existe en el catálogo.
- Mientras espera la IA: skeleton `.shimmer` con `aria-live="polite"` y envío bloqueado.

**QuoteCanvas**
- Encabezado: "Borrador de propuesta: {destino}", días, viajeros, "Actualizado hace…" desde `updatedAt`, `LeadLinker`, `QuotePdfButton` y "Enviar al Viajero" deshabilitado con "Próximamente".
- 2 o 3 `QuoteOptionCard` de igual altura: título, resumen, ítems con `cantidad × precio unitario`, total en COP. La de menor total lleva la etiqueta "Más económica" (calculada con los datos reales; en empate no se marca ninguna).

**LeadLinker**
- `<select>` nativo con `<label>`, poblado con `listLeads({ take: 100 })`. Preseleccionado si la cotización ya tiene `leadId`. Al cambiar llama `PUT /quotes/:id/lead` y actualiza el estado.

**QuotePdfButton**
| `pdfStatus` | Botón |
|---|---|
| `NOT_REQUESTED` | "Generar PDF" → `POST /quotes/:id/pdf` |
| `PENDING` | "Generando…", deshabilitado, `aria-busy`. Consulta `GET /quotes/:id` (que trae `pdfStatus`) cada 2 s y se detiene a los 60 s con mensaje de reintento. Si la página se recarga con un PDF en `PENDING`, el polling se retoma |
| `READY` | "Descargar PDF": `GET /quotes/:id/pdf` autenticado, `blob`, descarga con nombre de archivo |
| `FAILED` | "Reintentar" con el error visible |

El PDF nunca se genera en el cliente.

**Estados vacíos y errores.** Carga inicial con skeleton. Error de red con botón "Reintentar". Mensajes en español para: destino sin catálogo (400), la IA no respondió (502), sesión expirada (401, ya manejado por `apiFetch`).

**Accesibilidad.** Foco visible en chips, tarjetas y botones. Botones de solo ícono con `aria-label`. Aplican los criterios bloqueantes de `ux-notes.md` §5 que corresponden al cotizador.

## 5. Pruebas

Se agrega Vitest a `apps/web` y el script `test` pasa de `echo 'no-tests'` a `vitest run`. El CI **no** corre tests de la web hoy (solo lint y build), así que se agrega el paso `Test Web` a `.github/workflows/ci.yml` antes de `Build Web`. Solo lógica pura, sin pruebas de componentes:

- `formatCop()`, `formatRelativeTime()` y `pluralize()`: formato, moneda, textos.
- Cálculo de la alternativa más económica: empates y totales como string decimal.
- Polling del PDF con timers falsos: `PENDING → READY/FAILED`, tope de 60 s, cancelación.
- Estado del botón de PDF (`pdfButtonState`).
- Mapeo de errores a mensajes en español (400, 403, 502, 503, 401, red).

## 6. Verificación manual

Requiere Docker Desktop (Postgres + Redis), API y web en marcha, y login con el usuario demo del README.
- `POST /quotes` necesita `GROQ_API_KEY` en `apps/api/.env`. Sin ella solo se pueden verificar historial, vincular lead y PDF, usando la cotización `[DEMO PDF]` que crea `pnpm db:seed`.
- Se revisa cada estado de la tabla del PDF, los estados vacíos y de error, y que no aparezca ningún USD.

## 7. Flujo de trabajo

- Rama `feature/HU-14-cotizador-ui` desde `main`.
- Commits solo con la autoría del desarrollador, sin co-autor de herramienta (`AGENTS.md`, regla 6).
- No se hace commit ni PR sin pedirlo explícitamente. El PR usa el checklist de `.cursor/rules/pr-review.mdc`.

## 8. Pendientes con otros roles (no bloquean este diseño)

- Samuel: endpoint para "Enviar al Viajero", score de confianza de la cotización, inventario de vuelos.
- SM/PO: confirmar que no se mueve la ruta a un route group `(agency)`.
