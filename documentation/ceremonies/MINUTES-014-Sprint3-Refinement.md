# MINUTES-014 — Refinamiento del backlog (Sprint 3)

> **BORRADOR — reconstruido a partir de la evidencia del repositorio (commits, PRs, issues y planes por rol). El equipo debe validar asistentes, horas y comentarios antes de darlo por oficial.** Lo marcado «por confirmar» no tiene evidencia escrita.

| Campo | Valor |
|---|---|
| ID | MINUTES-014 |
| Tipo | Backlog Refinement |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 3 — Portal + Insights + Piloto (milestone #4, issues #19–#23) |
| Fecha | Por confirmar (entre el planning y el 2026-10-19) |
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
| Juan Manuel Restrepo Molina | Product Owner (Punto D' Partida) | Por confirmar |

## 2. Historias refinadas (criterios tal como quedaron implementados)

- **HU-19** Itinerario por días con estado del viaje, visible en celular.
- **HU-20** Documentos del viaje listados en el portal; cada consulta queda auditada (`PORTAL_DOCUMENTS_VIEWED`).
- **HU-21** Chat viajero ↔ agencia por reserva, con actualización periódica.
- **HU-22** KPIs: ventas cerradas, conversión, embudo, viajes activos, follow-ups vencidos y tabla por asesor (`GET /metrics/operations`).
- **HU-23** Recordatorio automático para tareas de follow-up vencidas, con campana y «marcar leído».
- Seguridad del portal: token de 24 h, se revoca al generar uno nuevo, 429 tras 20 intentos fallidos por minuto.

## 3. Pendientes que salen del refinamiento

- HU-24 base de conocimiento → Sprint 4.
- Pruebas de usabilidad con usuarios reales (protocolo en `documentation/sprint-3/usability/`).
