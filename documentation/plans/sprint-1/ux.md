# Sprint 1 — UX/UI (Juan José Palacio Zuluaga)

## UI source (mandatory)

Mockups are **already in code**. Govern the FE migration from prototype HTML; do not invent a new design system.

- Guide: [`../MOCKUP-CODE-SOURCE.md`](../MOCKUP-CODE-SOURCE.md)
- Repo: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: `Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem`
- Sprint 1: audit **`index.html`** + **`crm.html`**

## Scope

1. Inventory prototype components/tokens.
2. Define reuse vs adapt for Next.js.
3. A11y + visual acceptance criteria for Frontend PRs.
4. Do not rebuild screens in Figma from scratch if HTML already solves them.

## Deliverables / files

```
.../_external/TravelOS-AI-Ecosystem/{index,crm}.html
apps/web/src/app/globals.css
apps/web/src/components/ui/**
documentation/plans/sprint-1/ux-notes.md    # create: reuse inventory
documentation/mockups/screenshots/
```

## Tasks

1. Map sidebar, topbar, KPI cards, funnel, CRM table, badges, typography.
2. Extract tokens from embedded `tailwind.config` in the HTML files.
3. Write `ux-notes.md`: reuse / adapt / drop per block.
4. Flows: Login → CRM → Lead detail → Task on the prototype shell.
5. A11y criteria: contrast, focus, labels (FE must fix font/icon issues in React).
6. Review Santiago’s PRs against HTML source (not PNG only).
7. Sprint 2 handoff: `cotizador.html` + `itinerario.html`.

## Coding-agent prompt

```
You are UX/UI Designer for TravelOS Sprint 1.

MANDATORY: work from prototype code, not screenshots alone.
- https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem
- Files: index.html, crm.html
- Guide: documentation/plans/MOCKUP-CODE-SOURCE.md

Inventory tokens/components and document in documentation/plans/sprint-1/ux-notes.md
what Frontend must reuse when migrating to apps/web.
You may propose CSS variables in apps/web/src/app/globals.css (pair with FE).
Do not implement business logic or API.
Plan: documentation/plans/sprint-1/ux.md
```
