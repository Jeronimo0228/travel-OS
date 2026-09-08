# Execution log — Sprint 1 functional tests

| Fecha | CP | HU | Ejecutor | Resultado | Bug | Evidencia |
|---|---|---|---|---|---|---|
| 2026-09-08 | CP-01-01…04 | HU-01 | Miguel / Jerónimo | ✅ Pass (API + FE register) | — | auth e2e + demo |
| 2026-09-08 | CP-02-01…04 | HU-02 | Miguel / Jerónimo | ✅ Pass (cookie JWT + fail audit) | — | LOGIN_SUCCESS/FAIL |
| 2026-09-08 | CP-03-01…03 | HU-03 | Samuel / Jerónimo | ✅ Pass (RolesGuard) | — | rbac-checklist |
| 2026-09-08 | CP-04-01…03 | HU-04 | Santiago / Jerónimo | ✅ Pass (branding API persistido) | — | PUT /api/agency/branding |
| 2026-09-08 | CP-05-01…03 | HU-05 | Jerónimo | ✅ Pass (API + UI ADMIN) | — | /settings/audit |
| 2026-09-08 | CP-06-01…02 | HU-06 | Jerónimo | ✅ Pass (health + CI verde) | — | GET /api/health · Actions |
| 2026-09-08 | CP-07-01…04 | HU-07 | Miguel / Samuel | ✅ Pass | — | leads CRUD |
| 2026-09-08 | CP-08-01…02 | HU-08 | Santiago | ✅ Pass (stages select) | Deuda: kanban DnD → S2 | CRM table |
| 2026-09-08 | CP-09-01…03 | HU-09 | Santiago / Samuel | ✅ Pass | — | LeadTasksPanel |
| 2026-09-08 | CP-11-01…04 | HU-11 | Miguel / Santiago | ✅ Pass (name/stage/assignee) | — | listLeads query |
| 2026-09-08 | CP-12-01…03 | HU-12 | Santiago / Jerónimo | ✅ Pass (assign UI + API) | — | PUT /leads/:id/assignee |

## Resumen (Sprint Review 2026-09-08)

| Métrica | Valor |
|---|---|
| CP diseñados | 38 |
| CP ejecutados (muestra representativa) | 33+ |
| CP OK | Mayoría ✅ |
| CP FAIL / deuda | Pipeline kanban visual (AC mínimo cumplido vía select) |
| Bugs abiertos bloqueantes | 0 |
| Hallazgos no bloqueantes | DELETE lead sin AC formal (documentado) |

## Notas de cierre

- Contratos e2e alineados a `{ items, total }` en listados.
- Unit API: AuthService + LeadsService isolation en verde.
- CI: lint/test/build API + lint/build Web.
- Branding ya **no** depende solo de localStorage: fuente de verdad = Agency en PostgreSQL.
