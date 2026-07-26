# Sprint 1 — Frontend (Santiago Arboleda Giraldo)

## Issues propios / liderazgo UI

| Issue | HU | Responsabilidad |
|---|---|---|
| #4 | HU-04 Branding marca blanca | Owner |
| #8 | HU-08 Pipeline visual stages | Owner |
| #9 | HU-09 Tareas y recordatorios (UI) | Owner |
| #11 | HU-11 Listado y filtros | Owner |
| #2 | HU-02 Login (pantallas) | Pair BE |
| #7 | HU-07 Forms leads | Pair BE |

## Archivos a crear/modificar

```
apps/web/src/app/**                      # rutas: login, register, dashboard, crm
apps/web/src/components/layout/**        # sidebar TravelOS, topbar
apps/web/src/components/crm/**           # kanban, lead table, task list
apps/web/src/components/auth/**
apps/web/src/lib/api.ts
apps/web/src/lib/auth.ts
apps/web/src/styles/** o globals.css     # CSS variables de marca (primaryColor, logo)
documentacion/mockups/screenshots/**     # referencia visual (no editar salvo acuerdo UX)
```

## Tareas ordenadas

1. Layout base (sidebar oscura + shell) alineado a mockups.
2. Páginas login / registro de agencia consumiendo API.
3. CRM: lista + filtros + formulario crear/editar lead.
4. Pipeline kanban (drag o botones de stage) → PATCH stage.
5. Panel de tareas/recordatorios en detalle de lead.
6. Aplicar logo + `primaryColor` del tenant (HU-04).

## Prompt para tu agente de coding

```
Trabaja en TravelOS monorepo. Eres Frontend Developer Sprint 1.
Lee AGENTS.md, .cursor/rules/frontend-next.mdc y mockups en documentacion/mockups/screenshots.
Implementa UI de Issues #4 #8 #9 #11 y pantallas de #2 #7 en apps/web (Next.js App Router + Tailwind).
Consume API en NEXT_PUBLIC_API_URL. No inventes endpoints: coordina con packages/shared.
Mantén multi-tenant solo vía sesión (no agencyId libre en forms).
Referencia visual: CRM y Panel de Control del prototipo.
Plan: documentacion/planes/sprint-1/frontend.md
```
