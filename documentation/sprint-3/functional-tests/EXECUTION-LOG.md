# Execution log — Sprint 3

| Fecha (COT) | Entorno | Ejecutó | Resultado |
|---|---|---|---|
| 2026-10-20 | Local (Postgres 16 + Redis 7) | CI local | API unit 44/44, API e2e 32/32, web 46/46, lint y build OK |
| 2026-10-20 | Producción piloto (`travelos-pdp.vercel.app`) | Smoke con Playwright | Login gerente, dashboard, campana, viajes, enlace del portal, portal móvil, chat ida y vuelta. Evidencias en `../evidence/` |

Bugs abiertos: ninguno. Hallazgo menor corregido en el sprint: títulos de día con mayúscula en cada palabra (`fix(web): sentence-case itinerary day headings`).
| 2026-10-20 (noche) | Producción (`travel-os.pdpcomunica.com`, API `api.travel-os.pdpcomunica.com`) | Smoke con Playwright + curl | Mismo flujo en el dominio nuevo; cotizador IA (Gemini) en 6 destinos, PDF, vínculo a lead, copiloto, base de conocimiento y manual. Capturas 09–12 |
