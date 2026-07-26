# Sprint 1 — DevSecOps + SM (Jerónimo Restrepo Ángel)

## Owned issues

| Issue | Story | Responsibility |
|---|---|---|
| #5 | HU-05 Sensitive-action audit | Owner |
| #6 | HU-06 Healthcheck & CI | Owner |
| — | Repo quality / secrets / DoD | Owner |
| #3 | RBAC guard review | Reviewer |

## Files to create/change

```
.github/workflows/ci.yml
docker-compose.yml
.env.example
apps/api/.env.example
apps/api/src/health/**
apps/api/src/audit/**
apps/api/src/common/guards/**
AGENTS.md / .cursor/rules/**
scripts/**
```

## Ordered tasks

1. Keep CI green (lint/test/build web+api).
2. Harden `/api/health` (DB check already scaffolded).
3. Audit log module + interceptor for login/role_change.
4. Review PRs with `.cursor/rules/pr-review.mdc`.
5. Ensure `.env*` is never committed.
6. Facilitate ceremonies; keep Sprint 1 milestone honest.

## Coding-agent prompt

```
You are DevSecOps for TravelOS. Sprint 1 Issues #5 and #6.
Maintain CI in .github/workflows/ci.yml for the pnpm monorepo.
Complete sensitive-action auditing in apps/api and harden guards.
Do not implement CRM features unless they are security cross-cuts.
Follow AGENTS.md and security-multitenant.mdc.
Plan: documentation/plans/sprint-1/devsecops.md
```
