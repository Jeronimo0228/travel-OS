# MINUTES-016 — Preparación de la Sprint Review (Sprint 3)

> **BORRADOR — reconstruido a partir de la evidencia del repositorio (commits, PRs, issues y planes por rol). El equipo debe validar asistentes, horas y comentarios antes de darlo por oficial.** Lo marcado «por confirmar» no tiene evidencia escrita.

| Campo | Valor |
|---|---|
| ID | MINUTES-016 |
| Tipo | Review Prep |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 3 — Portal + Insights + Piloto (milestone #4, issues #19–#23) |
| Fecha | 2026-10-20 |
| Hora | Tarde (por confirmar) |
| Modalidad | Por confirmar |
| Facilitador | Jerónimo Restrepo (SM) |
| Autor del acta | Jerónimo Restrepo (SM) — borrador |

## 1. Evidencia lista

- Producción: web https://travel-os.pdpcomunica.com, API https://api.travel-os.pdpcomunica.com (Vercel PDP + Neon; DNS en cPanel PDP).
- Deck: `documentation/presentation/sprint-3-deck.html`.
- Checklist y pruebas: `documentation/sprint-3/CHECKLIST.md`, `functional-tests/`, `EXECUTION-LOG.md`, capturas `evidence/01–08`.
- CI verde en `main` (lint, unit, e2e, build).

## 2. Guion de demo

1. Login gerente → dashboard KPIs (HU-22).
2. Campana de recordatorios (HU-23).
3. Cotizador IA: pedido en lenguaje natural → alternativas en COP → PDF (HU-13/14).
4. Copiloto: leads priorizados con razón (HU-10).
5. Viajes → Cartagena → enlace del portal → abrir en celular → chat en vivo (HU-19/20/21).

## 3. Riesgos de la demo

- Arranque en frío: abrir `/api/health` 5 minutos antes.
- Saturación de Gemini: hay fallback automático a `gemini-2.5-flash-lite`.
