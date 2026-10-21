# Estrategia de pruebas automáticas (Sprint 2 y 3)

CI (`.github/workflows/ci.yml`) corre en cada pull request: lint, pruebas unitarias de la API, pruebas e2e contra Postgres y Redis reales, build de la API, y lint, pruebas y build de la web. La rama `main` solo recibe merges con CI verde.

| Funcionalidad | Tipo de prueba | Archivo(s) | Happy path | Flujo alternativo | Justificación |
|---|---|---|---|---|---|
| HU-13 cotización en lenguaje natural | Unitaria (servicio con IA simulada) | `apps/api/src/quotes/quotes.service.spec.ts` | Crea 2 alternativas con precios del catálogo | Rechaza ítems fuera del catálogo; regenera una vez una propuesta inválida | La IA es no determinista: se simula para probar las reglas de negocio que la limitan |
| HU-14 alternativas comparables | Unitaria | `quotes.service.spec.ts`, `apps/web/src/lib/quote-logic.test.ts` | Totales calculados por el backend | Alternativas duplicadas o sin hotel → error | Cálculo de dinero: debe ser exacto y repetible |
| HU-15 PDF | Unitaria (cola y renderer) | `quotes.service.spec.ts`, `quote-pdf.renderer.spec.ts`, `apps/web/src/lib/pdf-poller.test.ts` | Encola y reporta PENDING→READY | Reencola un PDF pendiente interrumpido; polling se detiene en FAILED | Proceso asíncrono con estados |
| HU-17 vincular a lead | Unitaria | `quotes.service.spec.ts` | Vincula tras validar acceso | Lead de otro asesor → prohibido | Regla de autorización |
| HU-18 catálogo seed | Unitaria | `apps/api/src/catalog/catalog.service.spec.ts` | Inventario idempotente por agencia | `skipDuplicates` evita duplicados | Datos de demo consistentes |
| HU-10 copiloto | Unitaria | `apps/api/src/ai/lead-prioritization.service.spec.ts`, `apps/web/src/lib/lead-priority.test.ts` | Ordena por score con razón | IA omite o inventa un lead → error | Valida la respuesta de la IA contra los datos reales |
| HU-24 base de conocimiento | Unitaria + E2E | `agency-knowledge.service.spec.ts`, `test/e2e/knowledge.e2e-spec.ts`, `apps/web/src/lib/knowledge.test.ts` | Guarda tono/políticas/FAQ y audita; llega al prompt | FAQ inválida → 400; anónimo → 401; aislamiento entre agencias | Afecta a la IA y es multi-tenant |
| Proveedor IA (Gemini/Groq) | Unitaria | `ai.service.spec.ts`, `ai.service.gemini.spec.ts` | Respuesta JSON válida | 429/503 → siguiente modelo; 400 no reintenta; clave nunca en el error | Resiliencia ante límites del plan gratuito |
| HU-16/19/20/21 itinerario y portal | E2E | `test/e2e/portal.e2e-spec.ts` | Arma itinerario, adjunta documentos, chat | Token revocado → 401; otra agencia → 404 | Flujo completo con seguridad |
| HU-22 KPIs | Unitaria + E2E | `metrics/operations.service.spec.ts`, `portal.e2e-spec.ts`, `apps/web/src/lib/metrics.test.ts` | Calcula ventas/conversión | Sin datos → ceros | Agregaciones |
| HU-23 recordatorios | Unitaria | `tasks/*reminder*.spec.ts`, `apps/web/src/lib/reminders.test.ts` | Crea recordatorio vencido | No duplica; modo inline sin Redis | Automatización en segundo plano |
| Auth y aislamiento (Sprint 1) | E2E | `test/e2e/auth.e2e-spec.ts`, `lead.e2e-spec.ts` | Registro/login/CRUD | Credenciales inválidas, cross-tenant | Base de seguridad |

## Cobertura

`pnpm --filter @travelos/api test:cov` genera el reporte de cobertura (Jest). Pendiente: añadirlo como paso del CI (requiere un token con permiso `workflow`).

## Relación con pruebas manuales

Los casos funcionales manuales (`documentation/sprint-2/functional-tests/README.md`, `documentation/sprint-3/functional-tests/`) cubren lo visual y la experiencia; la usabilidad se mide con el protocolo.
