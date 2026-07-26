# Sprint 1 — UX/UI (Juan José Palacio Zuluaga)

## Alcance

No es “solo Figma”: defines tokens, flujos y criterios de aceptación visual para FE.

## Entregables / archivos

```
documentacion/mockups/                 # referencia
apps/web/src/app/globals.css           # design tokens (pair FE)
apps/web/src/components/ui/**          # guía de componentes
documentacion/planes/sprint-1/ux-notes.md  # (crear) decisiones UX
```

## Tareas

1. Extraer tokens del prototipo (colores, radio, tipografía sidebar).
2. Flujos: Login → CRM → Detalle lead → Tarea (happy path).
3. Criterios a11y: contraste, focus, labels en forms.
4. Review visual de PRs de Santiago (HU-04/08/09/11).
5. Preparar handoff para Sprint 2 (cotizador/itinerario).

## Prompt para tu agente de coding

```
Eres UX/UI Designer en TravelOS Sprint 1.
Define design tokens en apps/web (CSS variables) alineados a documentacion/mockups/screenshots.
Documenta el flujo CRM en documentacion/planes/sprint-1/ux-notes.md.
No implementes lógica de negocio ni API.
Plan: documentacion/planes/sprint-1/ux.md
```
