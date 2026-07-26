# Sprint 1 — Frontend (Santiago Arboleda Giraldo)

## UI source (mandatory)

Mockups are **already coded**. Do not implement from memory or screenshots alone.

- Full guide: [`../MOCKUP-CODE-SOURCE.md`](../MOCKUP-CODE-SOURCE.md)
- Repo: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: `Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem`
- Sprint 1 priority: reuse **`index.html`** (shell/layout) + **`crm.html`** (CRM, funnel, copiloto, table)

Strategy: migrate prototype markup/Tailwind → React components in `apps/web`, wired to the real API.

## Owned / lead issues

| Issue | Story | Responsibility | Prototype source |
|---|---|---|---|
| #4 | HU-04 White-label branding | Owner | tokens / embedded tailwind config + shell theming |
| #8 | HU-08 Visual pipeline stages | Owner | `crm.html` (funnel) |
| #9 | HU-09 Tasks & reminders (UI) | Owner | card/list patterns in `crm.html` |
| #11 | HU-11 List & filters | Owner | clients table in `crm.html` |
| #2 | HU-02 Login screens | Pair BE | shell from `index.html` / `crm.html` |
| #7 | HU-07 Lead forms | Pair BE | CRM form controls |

## Files to create/change

```
apps/web/src/app/**
apps/web/src/components/layout/**     # port from index.html/crm.html
apps/web/src/components/crm/**        # from crm.html
apps/web/src/components/auth/**
apps/web/src/lib/api.ts
apps/web/src/lib/auth.ts
apps/web/src/app/globals.css

# Source (clone separately; not inside travel-OS)
# .../_external/TravelOS-AI-Ecosystem/{index,crm}.html

documentation/mockups/screenshots/{index,crm}.png   # visual validation only
```

## Ordered tasks

1. Clone/open TravelOS-AI-Ecosystem; run `npm run dev`; inspect `index.html` + `crm.html`.
2. Extract shell (dark sidebar, topbar, typography) into `apps/web/src/components/layout`.
3. Port CRM: funnel, clients table, copiloto-style blocks (UI; data via API).
4. Login / agency register pages using API (keep shell look & feel).
5. Pipeline stages + filters + tasks (#8/#9/#11) reusing HTML structure.
6. Tenant branding (logo + `primaryColor`) on the same layout (#4).
7. Ask UX for visual review vs prototype HTML.

## Coding-agent prompt

```
Work in TravelOS monorepo (apps/web). You are Frontend Developer for Sprint 1.

MANDATORY: reuse prototype code; do not redesign from screenshots.
- Prototype: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem
- Source files: index.html (layout), crm.html (CRM)
- Guide: documentation/plans/MOCKUP-CODE-SOURCE.md

Read AGENTS.md and .cursor/rules/frontend-next.mdc + ui-prototype-reuse.mdc.
Migrate HTML/Tailwind to React (App Router).
Implement Issues #4 #8 #9 #11 and screens for #2 #7.
Consume NEXT_PUBLIC_API_URL; do not invent endpoints (packages/shared).
Screenshots under documentation/mockups/screenshots only validate visuals.
Plan: documentation/plans/sprint-1/frontend.md
```
