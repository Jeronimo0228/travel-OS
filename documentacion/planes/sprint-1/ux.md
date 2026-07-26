# Sprint 1 — UX/UI (Juan José Palacio Zuluaga)

## Fuente de UI (obligatoria)

Los mockups **ya están en código**. Tu trabajo es gobernar la migración visual FE ← prototipo HTML, no inventar otro sistema de diseño.

- Guía: [`../FUENTE-MOCKUPS-CODIGO.md`](../FUENTE-MOCKUPS-CODIGO.md)
- Repo: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: `Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem`
- Sprint 1: auditar **`index.html`** + **`crm.html`** (y screenshots solo como evidencia)

## Alcance

1. Inventariar componentes/tokens del HTML prototipo.
2. Definir qué se reutiliza tal cual vs qué se adapta a Next.js.
3. Criterios a11y y aceptación visual para PRs de Frontend.
4. No reimplementar pantallas en Figma desde cero si el HTML ya las resuelve.

## Entregables / archivos

```
# Fuente a revisar
.../_external/TravelOS-AI-Ecosystem/index.html
.../_external/TravelOS-AI-Ecosystem/crm.html

# Destino / handoff
apps/web/src/app/globals.css                 # design tokens (pair FE)
apps/web/src/components/ui/**                # átomos alineados al prototipo
documentacion/planes/sprint-1/ux-notes.md    # (crear) inventario de reutilización
documentacion/mockups/screenshots/           # evidencia visual de entrega
```

## Tareas

1. Abrir el repo prototipo y mapear: sidebar, topbar, cards KPI, embudo, tabla CRM, badges, tipografía.
2. Extraer tokens (colores, radios, spacing) del `tailwind.config` embebido en los HTML.
3. Escribir `ux-notes.md`: lista “reutilizar / adaptar / descartar” por bloque de `crm.html` e `index.html`.
4. Flujos: Login → CRM → Detalle lead → Tarea (happy path) sobre el shell del prototipo.
5. Criterios a11y: contraste, focus, labels (el prototipo puede fallar iconos/fonts; FE debe corregirlo en React).
6. Review visual de PRs de Santiago: comparar contra HTML fuente (no solo PNG).
7. Handoff Sprint 2: `cotizador.html` + `itinerario.html`.

## Prompt para tu agente de coding

```
Eres UX/UI Designer en TravelOS Sprint 1.

OBLIGATORIO: trabaja sobre el código del prototipo, no solo screenshots.
- https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Local: Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem
- Archivos: index.html, crm.html
- Guía: documentacion/planes/FUENTE-MOCKUPS-CODIGO.md

Inventaria tokens/componentes y documenta en documentacion/planes/sprint-1/ux-notes.md
qué debe reutilizar el Frontend al migrar a apps/web.
Puedes proponer CSS variables en apps/web/src/app/globals.css (pair FE).
No implementes lógica de negocio ni API.
Plan: documentacion/planes/sprint-1/ux.md
```
