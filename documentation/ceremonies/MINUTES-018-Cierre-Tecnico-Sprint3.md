# MINUTES-018 — Cierre técnico del Sprint 3 (integración y salida a producción)

| Campo | Valor |
|---|---|
| ID | MINUTES-018 |
| Tipo | Sesión de trabajo / refinamiento técnico |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 3 — Cierre y salida a producción (milestone #5, issues #52–#57) |
| Fecha | 2026-11-10 |
| Facilitador | Jerónimo Restrepo (SM + DevSecOps) |
| Autor del acta | Jerónimo Restrepo |

## 1. Asistentes

| Nombre | Rol | Asistió |
|---|---|---|
| Jerónimo Restrepo | Scrum Master + DevSecOps | Sí |
| Santiago Arboleda | Frontend (autor de los PR #46–#49) | Sí |
| Samuel Madrid | Backend | Sí |
| Miguel Mercado | QA | Sí |
| Juan José Palacio | UX (autor del PR #50) | Sí |

## 2. Agenda

1. Estado de los PR abiertos y del CI.
2. Revisión heurística de la aplicación en producción.
3. Seguridad de los agentes de IA y redundancia de llaves.
4. Preparación comercial (SEO, legal) y plan de la entrega final.

## 3. Discusión (hechos verificables en el repositorio)

- El CI de todos los PR fallaba desde el 7 de noviembre por una prueba e2e con fechas fijas; el PR #49 la corrige con fechas relativas.
- Los PR #46, #47, #48 y #50 se integraron en la rama `release/sprint-3-final` (PR #51). Hubo un conflicto en `ClientsTable.tsx`, resuelto conservando el objetivo táctil de 44 px y el foco visible.
- La revisión heurística encontró controles que no hacían nada (asistente con mensaje fijo, buscador, «Análisis IA», «Nuevo Itinerario», «Enviar al viajero») y KPI con cifras fijas en el CRM. Se corrigieron todos (ver página 22 de la Wiki, sección 4).
- `pnpm audit` reportaba 36 vulnerabilidades (2 críticas) en dependencias de producción; quedaron en 0 altas o críticas.

## 4. Decisiones

| # | Decisión | Responsable |
|---|---|---|
| D1 | Un pool de llaves de IA por agente (cotizador, copiloto, asistente) con reserva compartida y respaldo Groq/OpenRouter | DevSecOps |
| D2 | El asistente es de solo lectura y solo enlaza pantallas internas | DevSecOps + UX |
| D3 | Pipeline Security obligatorio en cada PR (gitleaks, pnpm audit, CodeQL) | DevSecOps |
| D4 | Las pruebas de usabilidad se ejecutan con usuarios reales usando la planilla del moderador; resultados publicados en Wiki 22 tras sesiones 7–10 nov | UX + QA |
| D5 | Las mejoras grandes van al milestone «Sprint 4 (hipotético)» (#58–#65) | SM |

## 5. Compromisos

| # | Acción | Responsable | Fecha | Estado |
|---|---|---|---|---|
| A1 | Aprobar y fusionar el PR #51 | SM | 2026-11-10 | Pendiente |
| A2 | Cargar las llaves de IA adicionales con `scripts/set-ai-keys.sh` | DevSecOps | 2026-11-11 | Pendiente |
| A3 | Ejecutar las sesiones de usabilidad y pegar la exportación en la página 22 | UX + QA | 2026-11-11 | Pendiente |
| A4 | Ensayar la presentación con el deck del Sprint 3 | Todo el equipo | 2026-11-11 | Pendiente |
