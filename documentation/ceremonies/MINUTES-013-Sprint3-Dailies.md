# MINUTES-013 — Dailies Sprint 3 (registro consolidado)

> **BORRADOR — reconstruido a partir de la evidencia del repositorio (commits, PRs, issues y planes por rol). El equipo debe validar asistentes, horas y comentarios antes de darlo por oficial.** Lo marcado «por confirmar» no tiene evidencia escrita.

| Campo | Valor |
|---|---|
| ID | MINUTES-013 |
| Tipo | Daily Scrum (registro consolidado) |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 3 — Portal + Insights + Piloto (milestone #4, issues #19–#23) |
| Fecha | 2026-10-12 a 2026-10-20 |
| Hora | Por confirmar |
| Modalidad | Por confirmar |
| Facilitador | Jerónimo Restrepo (SM) |
| Autor del acta | Jerónimo Restrepo (SM) — borrador |

Cada entrada resume lo que la evidencia muestra por día. Si hubo dailies sin actividad en el repo, el equipo debe añadirlas.

| Fecha | Qué se hizo (evidencia) | Siguiente paso | Bloqueos |
|---|---|---|---|
| 2026-10-12 | Backend abre PR #34 (cotización y catálogo, Sprint 2) | Revisión del PR | Por confirmar |
| 2026-10-15 | PR #34 fusionado (Samuel Madrid) | Frontend consume la API del cotizador | — |
| 2026-10-19 | UX fusiona PR #35 (auditoría cotizador + itinerario). Frontend sube cotizador con chat, alternativas, lead y PDF (PR #36) y copiloto HU-10 (PR #37); se agrega Vitest a CI | Backend Sprint 3 | — |
| 2026-10-20 (mañana/tarde) | Backend fusiona PR #38: portal, chat, recordatorios y métricas (#19–#23) | Frontend y DevSecOps sobre la API nueva | — |
| 2026-10-20 (tarde) | PRs #39 (KPIs), #40 (portal + viajes), #41 (campana), #42 (hardening + piloto + e2e) y #43 (QA, UAT, UX, deck). Milestone #4 cerrado 17:40 COT | Review con el PO | Vercel bloqueó el deploy por Next 15.2.4 vulnerable → se actualizó a 15.5.28. Sin clave de IA en producción → se habilita Gemini |
| 2026-10-20 (noche) | Proveedor IA Gemini con cadena de modelos; API movida a Vercel PDP + Neon; dominios `travel-os.pdpcomunica.com` y `api.travel-os.pdpcomunica.com` (DNS cPanel PDP); HU-24 base de conocimiento; manual en la app (`/ayuda`) | Review conjunta Sprint 2 + 3 | Límite por minuto del plan gratuito de Gemini → reintento y cadena de modelos |
