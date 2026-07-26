# Sprint 1 — QA (Miguel Mercado Mercado)

## Coverage

All Sprint 1 stories (#1–#9, #11, #12): case design + execution + reporting.

## Files to create/change

```
apps/api/test/**
apps/api/src/**/*.spec.ts
apps/web/e2e/**                          # optional Playwright
documentation/plans/sprint-1/qa-matrix.md  # create
```

## Ordered tasks

1. AC matrix → Gherkin-style cases per story.
2. API e2e: register → login → lead CRUD → forbid cross-tenant.
3. UI smoke: login + create lead + move stage.
4. RBAC checklist (advisor cannot change roles).
5. File bugs as Issues labeled `bug`, linked to the HU.

## Coding-agent prompt

```
You are QA Engineer for TravelOS Sprint 1.
Create/extend e2e tests in apps/api/test for multi-tenant isolation and auth (Issues #1 #2 #3 #7).
Write documentation/plans/sprint-1/qa-matrix.md with cases per story.
Do not implement product features; tests and fixtures only.
Plan: documentation/plans/sprint-1/qa.md
```
