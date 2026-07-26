# Sprint 1 — Backend (Samuel Madrid Ossa)

## Owned / lead issues

| Issue | Story | Responsibility |
|---|---|---|
| #1 | HU-01 Agency registration (tenant) | Owner |
| #2 | HU-02 Secure login & session | Owner |
| #3 | HU-03 RBAC | Owner |
| #7 | HU-07 Create/edit leads | Owner |
| #12 | HU-12 Assign lead to advisor | Owner |
| #11 | HU-11 Filters (API) | Support FE |
| #5 | HU-05 Audit log | Pair DevSecOps |
| #9 | HU-09 Tasks (API) | Support FE |

## Files to create/change

```
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/**
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/prisma/**
apps/api/src/auth/**
apps/api/src/agencies/**
apps/api/src/users/**
apps/api/src/leads/**
apps/api/src/tasks/**
apps/api/src/audit/**
apps/api/src/common/**        # CurrentUser, TenantGuard, RolesGuard
packages/shared/src/schemas/**
```

## Ordered tasks

1. Finish migrate + demo seed (`pnpm db:up && pnpm db:migrate && pnpm db:seed`).
2. `POST /api/auth/register-agency` (#1) + `POST /api/auth/login` (#2) + JWT.
3. RBAC guards + `@Roles()` (#3).
4. Leads CRUD scoped by `agencyId` (#7) + assign (#12) + query filters (#11).
5. Tasks CRUD per lead (#9).
6. Write `AuditLog` on login and role change (#5, with DevSecOps).
7. Minimal unit/e2e tests for auth + tenant isolation.

## Domain context

- Tenant = `Agency`. Users always belong to an `agencyId`.
- Roles: `ADMIN`, `GERENTE`, `ASESOR`.
- Lead stages: `PROSPECTO | COTIZANDO | CIERRE | GANADO | PERDIDO`.

## Coding-agent prompt

```
Work in the TravelOS monorepo (pnpm). You are the Backend Developer for Sprint 1.
Read AGENTS.md and .cursor/rules/security-multitenant.mdc.
Implement Issues #1 #2 #3 #7 #12 (and API for #9 #11) in apps/api with NestJS + Prisma.
Rules: strict multi-tenancy, Zod/class-validator, bcrypt, JWT, no secrets in git.
Do not touch UI except contracts/types in packages/shared.
Deliver: tenant-isolation tests + manual test notes.
Issues: https://github.com/Jeronimo0228/travel-OS/issues
Plan: documentation/plans/sprint-1/backend.md
```
