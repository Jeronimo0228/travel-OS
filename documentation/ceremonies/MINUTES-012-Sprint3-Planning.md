# MINUTES-012 — Sprint 3 Planning

> **BORRADOR — reconstruido a partir de la evidencia del repositorio (commits, PRs, issues y planes por rol). El equipo debe validar asistentes, horas y comentarios antes de darlo por oficial.** Lo marcado «por confirmar» no tiene evidencia escrita.

| Campo | Valor |
|---|---|
| ID | MINUTES-012 |
| Tipo | Sprint Planning |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 3 — Portal + Insights + Piloto (milestone #4, issues #19–#23) |
| Fecha | Por confirmar (antes del 2026-10-19; el milestone #4 tenía fecha objetivo 2026-09-16) |
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

Portal del viajero (itinerario, documentos, chat), dashboard de KPIs para el gerente y automatización de follow-up, más el piloto desplegado para Punto D' Partida.

## 3. Alcance comprometido (evidencia: milestone #4 y `documentation/plans/sprint-3/`)

| Issue | Historia | Responsable principal (según planes por rol) |
|---|---|---|
| #19 | HU-19 Portal: ver itinerario | Backend (API) / Frontend (portal) |
| #20 | HU-20 Portal: documentos del viaje | Backend / Frontend |
| #21 | HU-21 Portal: chat básico con la agencia | Backend / Frontend |
| #22 | HU-22 Dashboard de KPIs gerenciales | Backend (métricas) / Frontend (dashboard) |
| #23 | HU-23 Recordatorio automático de follow-up | Backend (cola) / Frontend (campana) |

Transversal: DevSecOps (hardening del portal, despliegue del piloto), QA (casos funcionales y e2e), UX (notas y validación móvil). Planes: `backend.md`, `frontend.md`, `devsecops.md`, `qa.md`, `ux.md`.

## 4. Decisiones

| # | Decisión | Responsable |
|---|---|---|
| D1 | Cerrar primero la deuda de Sprint 2 en el frontend (cotizador HU-13/14 y copiloto HU-10) antes del portal | Frontend |
| D2 | El portal se abre con enlace con token (sin cuenta del viajero), revocable y con vigencia limitada | Backend + DevSecOps |
| D3 | HU-24 (base de conocimiento) es deuda de Sprint 2; se intenta cerrar antes de la review conjunta | SM / PO |

## 5. Riesgos

- Retraso acumulado: el milestone vencía el 2026-09-16 y el trabajo se concentró el 19–20 de octubre (ver dailies).
- Dependencia de un proveedor de IA con clave activa para la demo.
