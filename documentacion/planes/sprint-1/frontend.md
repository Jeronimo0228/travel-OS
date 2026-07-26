# Sprint 1 — Frontend (Santiago Arboleda Giraldo)

## Fuente de UI (obligatoria)

Los mockups **ya están codificados**. No implementes “de memoria” ni solo con screenshots.

- Guía completa: [`../FUENTE-MOCKUPS-CODIGO.md`](../FUENTE-MOCKUPS-CODIGO.md)
- Repo: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: `Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem`
- Sprint 1 prioriza reutilizar: **`index.html`** (shell/layout) + **`crm.html`** (CRM, embudo, copiloto, tabla)

Estrategia: migrar markup/Tailwind del prototipo → componentes React en `apps/web`, conectados a la API real.

## Issues propios / liderazgo UI

| Issue | HU | Responsabilidad | Fuente prototipo |
|---|---|---|---|
| #4 | HU-04 Branding marca blanca | Owner | tokens/`tailwind.config` en HTML + theming shell |
| #8 | HU-08 Pipeline visual stages | Owner | `crm.html` (embudo) |
| #9 | HU-09 Tareas y recordatorios (UI) | Owner | patrones de cards/listas en `crm.html` |
| #11 | HU-11 Listado y filtros | Owner | tabla “Inteligencia de Clientes” en `crm.html` |
| #2 | HU-02 Login (pantallas) | Pair BE | shell de layout de `index.html` / `crm.html` |
| #7 | HU-07 Forms leads | Pair BE | formularios/controles del CRM |

## Archivos a crear/modificar

```
# Destino (monorepo TravelOS)
apps/web/src/app/**                      # rutas: login, register, dashboard, crm
apps/web/src/components/layout/**        # sidebar/topbar → portar desde index.html/crm.html
apps/web/src/components/crm/**           # kanban, lead table, task list ← crm.html
apps/web/src/components/auth/**
apps/web/src/lib/api.ts
apps/web/src/lib/auth.ts
apps/web/src/app/globals.css             # CSS variables desde tokens del prototipo

# Fuente (NO vive dentro de travel-OS; clonar aparte)
# .../_external/TravelOS-AI-Ecosystem/index.html
# .../_external/TravelOS-AI-Ecosystem/crm.html
# .../_external/TravelOS-AI-Ecosystem/vite.config.js

# Solo referencia visual de entrega
documentacion/mockups/screenshots/{index,crm}.png
```

## Tareas ordenadas

1. Clonar/abrir TravelOS-AI-Ecosystem y correr `npm run dev`; inspeccionar `index.html` + `crm.html`.
2. Extraer shell (sidebar oscura, topbar, tipografía) a `apps/web/src/components/layout`.
3. Portar CRM: embudo, tabla de clientes, bloques tipo copiloto (UI; datos vía API).
4. Páginas login / registro consumiendo API (mantener look & feel del shell).
5. Pipeline stages + filtros + tareas (HU-08/09/11) reutilizando estructura del HTML.
6. Branding tenant (logo + `primaryColor`) sobre el mismo layout (HU-04).
7. Pedir review visual a UX contrastando HTML prototipo vs `apps/web`.

## Prompt para tu agente de coding

```
Trabaja en TravelOS monorepo (apps/web). Eres Frontend Developer Sprint 1.

OBLIGATORIO: reutiliza el código del prototipo, no rediseñes desde screenshots.
- Repo prototipo: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem
- Archivos fuente Sprint 1: index.html (layout) y crm.html (CRM)
- Guía: documentacion/planes/FUENTE-MOCKUPS-CODIGO.md

Lee AGENTS.md y .cursor/rules/frontend-next.mdc.
Migra el HTML/Tailwind del prototipo a componentes React (App Router).
Implementa Issues #4 #8 #9 #11 y pantallas de #2 #7.
Consume API en NEXT_PUBLIC_API_URL; no inventes endpoints (packages/shared).
Screenshots en documentacion/mockups/screenshots solo validan el resultado visual.
Plan: documentacion/planes/sprint-1/frontend.md
```
