# Sprint 1 — Backend (Samuel Madrid Ossa)

## Issues propios / liderazgo técnico

| Issue | HU | Responsabilidad |
|---|---|---|
| #1 | HU-01 Registro de agencia (tenant) | Owner |
| #2 | HU-02 Login y sesión segura | Owner |
| #3 | HU-03 RBAC | Owner |
| #7 | HU-07 Crear/editar leads | Owner |
| #12 | HU-12 Asignación de lead | Owner |
| #11 | HU-11 Filtros (API) | Support FE |
| #5 | HU-05 Auditoría | Pair DevSecOps |
| #9 | HU-09 Tareas (API) | Support FE |

## Archivos a crear/modificar

```
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/**
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/prisma/**
apps/api/src/auth/**          # register, login, jwt strategy, guards
apps/api/src/agencies/**
apps/api/src/users/**
apps/api/src/leads/**
apps/api/src/tasks/**
apps/api/src/audit/**
apps/api/src/common/**        # CurrentUser, TenantGuard, RolesGuard
packages/shared/src/schemas/**
```

## Tareas ordenadas

1. Completar migrate + seed demo (`pnpm db:up && pnpm db:migrate && pnpm db:seed`).
2. `POST /api/auth/register-agency` (HU-01) + `POST /api/auth/login` (HU-02) + JWT.
3. Guards RBAC + decorators `@Roles()` (HU-03).
4. CRUD leads scoped por `agencyId` (HU-07) + assign (HU-12) + query filters (HU-11).
5. CRUD tasks por lead (HU-09).
6. Escribir `AuditLog` en login y role change (HU-05, con DevSecOps).
7. Tests unit/e2e mínimos de auth + isolation tenant.

## Contexto de dominio

- Tenant = `Agency`. Usuario siempre pertenece a un `agencyId`.
- Roles: `ADMIN`, `GERENTE`, `ASESOR`.
- Stages lead: `PROSPECTO | COTIZANDO | CIERRE | GANADO | PERDIDO`.

## Prompt para tu agente de coding

```
Trabaja en el repo TravelOS (monorepo pnpm). Eres Backend Developer en Sprint 1.
Lee AGENTS.md y .cursor/rules/security-multitenant.mdc.
Implementa las Issues #1 #2 #3 #7 #12 (y API de #9 #11) en apps/api con NestJS + Prisma.
Reglas: multi-tenant estricto, Zod/class-validator, bcrypt, JWT, sin secretos en git.
No toques UI excepto contratos OpenAPI/tipos en packages/shared.
Al terminar: tests de aislamiento tenant + instrucciones de prueba manual.
Issue tracker: https://github.com/Jeronimo0228/travel-OS/issues
Plan: documentacion/planes/sprint-1/backend.md
```
