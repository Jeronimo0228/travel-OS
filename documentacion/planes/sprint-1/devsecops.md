# Sprint 1 — DevSecOps + SM (Jerónimo Restrepo Ángel)

## Issues propios

| Issue | HU | Responsabilidad |
|---|---|---|
| #5 | HU-05 Auditoría | Owner |
| #6 | HU-06 Healthcheck y CI | Owner |
| — | Calidad repo / secrets / DoD | Owner |
| #3 | Guards RBAC review | Reviewer |

## Archivos a crear/modificar

```
.github/workflows/ci.yml
docker-compose.yml
.env.example
apps/api/.env.example
apps/api/src/health/**
apps/api/src/audit/**
apps/api/src/common/guards/**
AGENTS.md / .cursor/rules/**          # mantener vigentes
scripts/**
```

## Tareas ordenadas

1. CI: install → lint → test → build (web+api) en GitHub Actions.
2. Healthcheck `/api/health` con DB check (ya scaffold) + badge/README.
3. Módulo audit_log + interceptor login/role_change.
4. Revisar PRs con checklist `.cursor/rules/pr-review.mdc`.
5. Asegurar que `.env*` no se commitea; Dependabot opcional.
6. Facilitar daily/planning; actualizar milestone Sprint 1.

## Prompt para tu agente de coding

```
Eres DevSecOps de TravelOS. Sprint 1 Issues #5 y #6.
Configura CI en .github/workflows/ci.yml para monorepo pnpm (lint/test/build).
Completa auditoría de acciones sensibles en apps/api y endurece guards.
No implementes features CRM salvo seguridad transversal.
Sigue AGENTS.md y security-multitenant.mdc.
Plan: documentacion/planes/sprint-1/devsecops.md
```
