# Sprint 1 — QA (Miguel Mercado Mercado)

## Cobertura de issues

Todas las HU del Sprint 1 (#1–#9, #11, #12): diseño de casos + ejecución + reporte.

## Archivos a crear/modificar

```
apps/api/test/**                         # e2e Nest
apps/api/src/**/*.spec.ts
apps/web/ e2e opcional (Playwright) en apps/web/e2e/**
documentacion/planes/sprint-1/qa-matrix.md  # (crear) matriz AC
```

## Tareas ordenadas

1. Matriz AC → casos Gherkin por HU.
2. E2E API: register → login → CRUD lead → forbid cross-tenant.
3. Smoke UI: login + crear lead + mover stage.
4. Checklist RBAC (asesor no cambia roles).
5. Reporte de bugs como Issues `bug` linkeados a la HU.

## Prompt para tu agente de coding

```
Eres QA Engineer de TravelOS Sprint 1.
Crea/amplía tests e2e en apps/api/test para aislamiento multi-tenant y auth (Issues #1 #2 #3 #7).
Genera documentacion/planes/sprint-1/qa-matrix.md con casos por HU.
No implementes features de producto; solo pruebas y fixtures.
Plan: documentacion/planes/sprint-1/qa.md
```
