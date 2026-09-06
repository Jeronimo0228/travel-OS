# RBAC Checklist — Sprint 1

Roles del sistema (`packages/shared/src/roles.ts`): `ADMIN`, `GERENTE`, `ASESOR`. Todos son roles **dentro de un tenant** — no existe un rol "super-admin" que cruce agencias; el límite de tenant (`agencyId`) siempre manda sobre el rol (ver `.cursor/rules/security-multitenant.mdc`).

## Matriz de permisos

| Acción | ADMIN | GERENTE | ASESOR | Fuente | Notas |
|---|---|---|---|---|---|
| Ver leads propios / asignados | ✅ | ✅ | ✅ | CP-03-04, CP-12-02 | |
| Ver todos los leads del tenant | ✅ | ✅ | ❌ | CP-12-02 ("mis leads" implica vista restringida para asesor) | Propuesta QA — no hay AC que lo diga explícitamente para ASESOR, inferido de HU-12 |
| Crear lead | ✅ | ✅ | ✅ | HU-07 AC-01 ("un asesor autenticado... crea un lead") | |
| Editar lead propio/asignado | ✅ | ✅ | ✅ | HU-07 AC-02 | |
| Editar lead asignado a otro asesor (mismo tenant) | ✅ | ✅ | ❌ | Propuesta QA, sin AC formal | Ver `lead.service.spec.ts` › `updateLead()` |
| Eliminar lead propio/asignado | ✅ | ✅ | ✅ | Propuesta QA, sin AC formal | Ver gap en `qa-matrix.md` (HU-07) |
| Eliminar lead asignado a otro asesor | ✅ | ✅ | ❌ | Propuesta QA, sin AC formal | Ver `lead.service.spec.ts` › `deleteLead()` |
| Asignar lead a un asesor | ✅ | ✅ | ❌ | HU-12 AC-01 ("gerente/admin... asigna") | |
| Reasignar lead a otro asesor | ✅ | ✅ | ❌ | HU-12 AC-03 | |
| Crear tarea en un lead | ✅ | ✅ | ✅ | HU-09 AC-01 | |
| Completar/editar tarea propia | ✅ | ✅ | ✅ | HU-09 AC-02 | |
| **Cambiar el rol de un usuario** | ✅ | ❌ | ❌ | HU-03 AC-02 ("un admin de agencia... asigna rol") | Caso crítico — ver checklist abajo |
| Invitar/crear usuarios en la agencia | ✅ | ❌ | ❌ | Propuesta QA, sin AC formal | Confirmar con Backend/PO |
| Cambiar branding (logo, color primario) | ✅ | ❌ | ❌ | HU-04 AC-01, AC-03 ("asesor bloqueado... branding global") | |
| Ver auditoría del tenant | ✅ | ⚠️ por confirmar | ❌ | HU-05 AC-02/AC-03 hablan de "admin" | GERENTE no mencionado explícitamente en CP-HU-05.md — confirmar con PO |
| Filtrar auditoría por tipo de evento | ✅ | ⚠️ por confirmar | ❌ | HU-05 AC-03 | Idem |

Leyenda: ✅ permitido · ❌ prohibido (debe responder 403) · ⚠️ regla no confirmada en la documentación, no automatizar hasta aclarar.

## Checklist de verificación

Marcar cuando el caso esté probado (manual o automatizado) y en verde contra una implementación real.

### Crítico: ASESOR no puede escalar privilegios

- [ ] `ASESOR` que llama al endpoint de cambio de rol (`PATCH /api/users/:id/role` o equivalente) recibe **403**, no 200 ni 401.
- [ ] `ASESOR` no puede auto-asignarse `ADMIN` ni `GERENTE` aunque envíe su propio `userId` como target.
- [ ] El campo `role` en el body de un `PATCH /api/users/:id` genérico (si existe un endpoint de edición de perfil) es ignorado o rechazado cuando lo envía un `ASESOR` — un asesor no debe poder cambiarse el rol "de paso" al editar su propio nombre/email.
- [ ] Un `ASESOR` no puede cambiar el rol de otro `ASESOR` ni el de un `GERENTE`.
- [ ] El cambio de rol exitoso (por `ADMIN`) queda registrado en `AuditLog` (HU-05 AC-01) con actor, acción y `agencyId`.
- [ ] Los nuevos permisos se aplican "en la siguiente sesión/request" (HU-03 AC-02) — confirmar si el JWT viejo (con el rol anterior) sigue siendo válido hasta expirar, o si hay invalidación inmediata. **Esto no está definido** — mismo tipo de gap que el logout en `qa-matrix.md` (CP-02-03); depende de si hay revocación de tokens.

### Límite de tenant (siempre por encima del rol)

- [ ] Un `ADMIN` de la agencia B **no** puede leer/editar/eliminar leads, usuarios ni configuración de la agencia A, sin importar su rol (ver `CP-07-04`, `lead.e2e-spec.ts`).
- [ ] Ningún endpoint acepta un `agencyId` explícito del cliente para decidir el alcance de una query — siempre se deriva del JWT (ver `lead.service.spec.ts` › `createLead()` assigns agencyId from user, not from body).

### Acciones sensibles por rol (matriz de arriba)

- [ ] Cada fila con ❌ tiene al menos un test (unit o e2e) que confirme 403, no solo lo contrario (fila ✅ con 200).
- [ ] Las dos filas ⚠️ (auditoría para GERENTE) quedaron confirmadas con el PO antes de sprint review y esta tabla se actualizó.

## Estado de automatización

Ninguna fila de esta matriz tiene todavía un test que la ejecute contra un endpoint real, porque no existe módulo de `users`/roles ni guard `RolesGuard` en `apps/api/src` (ver `documentation/plans/sprint-1/backend.md`, pendiente `apps/api/src/common/**`). Lo único parcialmente cubierto hoy:

- Límite de tenant en leads (`updateLead`/`deleteLead`/list) → `apps/api/src/lead/lead.service.spec.ts`, `apps/api/test/e2e/lead.e2e-spec.ts`, `apps/api/test/e2e/auth.e2e-spec.ts`.
- Owner-vs-no-owner dentro del mismo tenant para editar/eliminar lead (asesor) → `lead.service.spec.ts` (contrato propuesto, no implementado).

Todo lo demás (cambio de rol, branding, auditoría, asignación de leads) queda pendiente de que Backend implemente los módulos correspondientes antes de poder automatizarlo.
