# MINUTES-008 — Sprint 2 Planning

> **BORRADOR — reconstruido a partir de la evidencia del repositorio (commits, PRs, issues y planes por rol). El equipo debe validar asistentes, horas y comentarios antes de darlo por oficial.** Lo marcado «por confirmar» no tiene evidencia escrita.

| Campo | Valor |
|---|---|
| ID | MINUTES-008 |
| Tipo | Sprint Planning |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 2 — Cotizador IA + Itinerarios (milestone #3: #10, #13–#18, #24) |
| Fecha | Por confirmar (después de la review de Sprint 1 del 2026-09-08) |
| Hora | Por confirmar |
| Modalidad | Por confirmar |
| Facilitador | Jerónimo Restrepo (SM) |
| Autor del acta | Jerónimo Restrepo (SM) — borrador |

## 1. Asistentes

| Nombre | Rol | Asistió |
|---|---|---|
| Jerónimo Restrepo | Scrum Master + DevSecOps | Por confirmar |
| Santiago Arboleda | Frontend | Por confirmar |
| Samuel Madrid | Backend | Por confirmar |
| Miguel Mercado | QA | Por confirmar |
| Juan José Palacio | UX | Por confirmar |

## 2. Objetivo del sprint

Cotizar un viaje en lenguaje natural en menos de 60 s con alternativas comparables y PDF, sobre el catálogo propio de la agencia; itinerario por días; copiloto de priorización de leads. Compromiso del PO en la review de Sprint 1: «en Sprint 2 cotización NL <60 s. Si el PDF sale mal, no hay piloto» (MINUTES-007).

## 3. Alcance comprometido (milestone #3)

| Issue | Historia | Rol principal (planes `documentation/plans/sprint-2/`) |
|---|---|---|
| #13 | HU-13 Cotización por lenguaje natural | Backend + Frontend |
| #14 | HU-14 Opciones comparables | Backend + Frontend |
| #15 | HU-15 Exportar cotización a PDF | Backend (cola) + Frontend |
| #16 | HU-16 Constructor de itinerario por días | Backend + Frontend |
| #17 | HU-17 Vincular cotización a lead | Backend + Frontend |
| #18 | HU-18 Catálogo seed | Backend |
| #10 | HU-10 Copiloto IA de priorización | Backend + Frontend |
| #24 | HU-24 Base de conocimiento para IA | Jerónimo Restrepo (sugerido en el issue) |

## 4. Decisiones

| # | Decisión | Responsable |
|---|---|---|
| D1 | La IA solo puede elegir ítems del catálogo de la agencia; precios y totales los calcula el backend | Backend |
| D2 | El PDF se genera en una cola (BullMQ) y el frontend consulta el estado | Backend + Frontend |
| D3 | Protocolo de usabilidad se planea en Sprint 2 y se ejecuta en Sprint 3 (documento maestro) | UX + QA |
