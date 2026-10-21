# Sprint 3 checklist — Portal + Insights + Piloto

Sprint goal: **the traveler follows the trip from the phone and the manager runs the agency from data.**

| Entregable | Estado | Artefacto |
|---|---|---|
| HU-19 Portal: ver itinerario | Cerrado | `/portal` (itinerario por días) · CP-HU-19 |
| HU-20 Portal: documentos | Cerrado | `/portal` pestaña Documentos · CP-HU-20 |
| HU-21 Portal: chat con la agencia | Cerrado | Chat viajero ↔ agencia · CP-HU-21 |
| HU-22 Dashboard KPIs gerenciales | Cerrado | `/` Comando de Inteligencia · `GET /api/metrics`, `/api/metrics/operations` · CP-HU-22 |
| HU-23 Recordatorio de follow-up | Cerrado | Worker BullMQ + campana de recordatorios · CP-HU-23 |
| Carry-over Sprint 2 | Cerrado | HU-13/14/15/17 (cotizador UI, PR #36) · HU-10 (copiloto, PR #37) · HU-16 constructor por días en Viajes |
| DevSecOps piloto | Cerrado | [pilot-runbook.md](../plans/sprint-3/pilot-runbook.md) |
| QA | Cerrado | [functional-tests/](./functional-tests/) · e2e `apps/api/test/e2e/portal.e2e-spec.ts` |
| UAT PO | Listo para ejecutar en la review | [uat-po.md](../plans/sprint-3/uat-po.md) |
| UX | Cerrado | [ux-notes.md](../plans/sprint-3/ux-notes.md) |
| Presentación | Lista | [sprint-3-deck.html](../presentation/sprint-3-deck.html) |

## Demo

- Web: https://travel-os.pdpcomunica.com
- Gerente: `gerente@demo.travelos.local` / `TravelOS!demo1`
- Portal: *Viajes y Portal → Cartagena → Generar enlace del portal* y abrir el enlace en el celular.

## Calidad

| Suite | Resultado |
|---|---|
| API unit (Jest) | 60/60 |
| API e2e (Jest + Postgres + Redis) | 35/35 (portal/KPIs + base de conocimiento) |
| Web unit (Vitest) | 50/50 |
| Lint + build API y web | OK |
