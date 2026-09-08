# QA Matrix — Sprint 1

Casos de prueba por historia de usuario, con trazabilidad a los archivos `documentation/sprint-1/functional-tests/CP-HU-*.md` y a los tests automatizados en `apps/api/`.

IDs siguen la numeración ya usada en `CP-HU-*.md` (`CP-01-01`, no `CP-HU-01-01`) para no crear un segundo esquema de IDs en el repo.

**Status cierre Sprint 1 (2026-09-08):** auth/leads/tasks/audit/agency/health implementados. Unit API verdes. E2e contractuales en repo (aún no gate CI). Fuente de ejecución: `documentation/sprint-1/functional-tests/EXECUTION-LOG.md`.

## HU-01 — Registro de agencia (Issue #1)

| CP | AC | Caso | Test automatizado | Status |
|---|---|---|---|---|
| CP-01-01 | AC-01 | Registro exitoso crea tenant aislado | `auth.e2e-spec.ts` › `CP-01-01` | ✅ Implementado |
| CP-01-02 | AC-02 | Slug/email duplicado rechazado, sin segundo tenant | `auth.e2e-spec.ts` › `CP-01-02` | ✅ (código en main; re-ejecutar e2e local) |
| CP-01-03 | AC-03 | Email inválido → error de validación, sin create | `auth.e2e-spec.ts` › `CP-01-03` | ✅ (código en main; re-ejecutar e2e local) |
| CP-01-03b *(QA extra, no está en CP-HU-01.md)* | AC-03 | Campos obligatorios vacíos → 400 | `auth.e2e-spec.ts` › `CP-01-03b` | ✅ (código en main; re-ejecutar e2e local) |
| CP-01-04 | AC-04 | Aislamiento: tenant solo ve su propio `agencyId` | — | ⏳ Pendiente — sin test propio; cubierto indirectamente por el aislamiento de leads (CP-07-04), falta una prueba directa sobre el recurso "agencia" |

## HU-02 — Login y sesión segura (Issue #2)

| CP | AC | Caso | Test automatizado | Status |
|---|---|---|---|---|
| CP-02-01 | AC-01 | Login OK devuelve JWT | `auth.e2e-spec.ts` › `CP-02-01` | ✅ Implementado |
| CP-02-02 | AC-02 | Password incorrecta → 401 | `auth.e2e-spec.ts` › `CP-02-02` | ✅ (código en main; re-ejecutar e2e local) |
| CP-02-02b *(QA extra)* | AC-02 | Email inexistente → mismo mensaje genérico que password incorrecta (anti user-enumeration) | `auth.e2e-spec.ts` › `CP-02-02b` | ✅ (código en main; re-ejecutar e2e local) |
| CP-02-03 | AC-03 | Logout invalida token/sesión | — | ⏳ Pendiente — sin test; no hay endpoint de logout documentado (JWT stateless no tiene "logout" server-side salvo blacklist/refresh token, hay que definir el mecanismo con Backend antes de automatizar) |
| CP-02-04 | AC-04 | Bearer token inválido/manipulado → 401 en ruta protegida | `auth.e2e-spec.ts` › `CP-02-04` | ✅ (código en main; re-ejecutar e2e local) (ruta protegida `/api/leads` tampoco existe aún) |

## HU-07 — Crear y editar leads + aislamiento (Issue #7)

| CP | AC | Caso | Test automatizado | Status |
|---|---|---|---|---|
| CP-07-01 | AC-01 | Crear lead válido, queda en el tenant del asesor | `lead.e2e-spec.ts` › `CP-07-01`, `lead.service.spec.ts` › `createLead()` | ✅ (código en main; re-ejecutar e2e local) / ✅ unit alineado / orphan spec eliminado |
| CP-07-02 | AC-02 | Editar nombre/contacto/etapa persiste | `lead.e2e-spec.ts` › `CP-07-02` | ✅ (código en main; re-ejecutar e2e local) |
| CP-07-03 | AC-03 | Datos inválidos impiden guardado (create) | `lead.e2e-spec.ts` › `CP-07-03`, `CP-07-03b` | ✅ (código en main; re-ejecutar e2e local) |
| CP-07-03 (update) *(QA extra)* | AC-03 | Email inválido en `PATCH` → 400 | `lead.e2e-spec.ts` › `invalid email on update` | ✅ (código en main; re-ejecutar e2e local) |
| CP-07-04 | AC-04 | Tenant B no edita/lee/lista lead de tenant A → 403/404 | `auth.e2e-spec.ts` › `CP-07-04`, `lead.e2e-spec.ts` › `CP-07-04`, `lead.service.spec.ts` › tenant-boundary cases | ✅ (código en main; re-ejecutar e2e local) / ✅ unit alineado / orphan spec eliminado |
| CP-07-05 | AC-05 | Detalle de lead muestra campos acordados | — | ⏳ Pendiente — sin test de "happy path" `GET /leads/:id`; solo se probó el caso cross-tenant (403/404), falta el caso de lectura exitosa del propio tenant |
| — *(QA extra, sin AC formal)* | — | `DELETE /leads/:id`: owner → 204, no-owner → 403/404, inexistente → 404, sin auth → 401 | `lead.e2e-spec.ts` › describe `DELETE /api/leads/:id`, `lead.service.spec.ts` › `deleteLead()` | ✅ (código en main; re-ejecutar e2e local) / ✅ unit alineado / orphan spec eliminado — **acción para PO**: no hay AC documentada para eliminar lead, se recomienda formalizarla |
| — *(QA extra)* | — | RBAC en update/delete: ASESOR solo puede tocar leads propios; ADMIN/GERENTE cualquiera del tenant | `lead.service.spec.ts` › `updateLead()`/`deleteLead()` owner/admin cases | ✅ unit alineado / orphan spec eliminado — regla asumida, confirmar con `rbac-checklist.md` |

## HU-11 — Listado y filtros de clientes (Issue #11)

| CP | AC | Caso | Test automatizado | Status |
|---|---|---|---|---|
| CP-11-01 | AC-01 | Listado renderiza leads del propio tenant | `lead.e2e-spec.ts` › `CP-11-01`, `lead.service.spec.ts` › `getLeadsByAgency()` | ✅ (código en main; re-ejecutar e2e local) / ✅ unit alineado / orphan spec eliminado |
| CP-11-02 | AC-02 | Filtro por stage devuelve solo coincidencias | `lead.e2e-spec.ts` › `CP-11-02`, `lead.service.spec.ts` › stage filter case | ✅ (código en main; re-ejecutar e2e local) / ✅ unit alineado / orphan spec eliminado |
| CP-11-03 | AC-03 | Filtro sin resultados → estado vacío claro | — | ⏳ Pendiente — sin test; falta definir qué devuelve el API en ese caso (`[]` con 200 se asume, pero no está confirmado) |
| CP-11-04 *(QA extra, implícito — regla de aislamiento multi-tenant)* | — | Tenant A nunca ve leads de tenant B en el listado | `lead.e2e-spec.ts` › `CP-11-04` | ✅ (código en main; re-ejecutar e2e local) |
| — *(QA extra)* | — | Paginación `?skip=&take=` | `lead.e2e-spec.ts` › pagination test | ✅ (código en main; re-ejecutar e2e local) — **best-effort**: el esquema de paginación no está definido en ningún doc, confirmar con Backend (`skip/take` vs `page/pageSize`) |
| — *(QA extra)* | AC-01 | `GET /leads` sin token → 401 | `lead.e2e-spec.ts` | ✅ (código en main; re-ejecutar e2e local) |

## Gaps abiertos (para siguiente iteración)

1. **CP-01-04** (aislamiento de datos de agencia) y **CP-07-05** (detalle de lead, happy path) no tienen test automatizado todavía.
2. **CP-02-03** (logout) no puede automatizarse sin que Backend defina el mecanismo de invalidación de sesión (JWT stateless no tiene logout nativo).
3. **CP-11-03** (estado vacío en filtros) no tiene test — falta confirmar la forma de la respuesta.
4. **Eliminar lead** no tiene AC/CP formal en ningún `CP-HU-*.md` — se escribieron tests igual (completitud REST) pero se recomienda que el PO lo formalice.
5. ~~Inconsistencia de contrato entre `backend.md` (`register-agency`) y `apps/web/src/lib/auth.ts` (`register`).~~ **Resuelto**: la ruta acordada es `POST /api/auth/register` (confirmado 2026-09-08); los e2e ya se actualizaron. Pendiente: alinear `documentation/plans/sprint-1/backend.md`, que todavía menciona `register-agency`.
