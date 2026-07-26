# Sprint 2 — Frontend (Santiago)

## Fuente de UI (obligatoria)

- Guía: [`../FUENTE-MOCKUPS-CODIGO.md`](../FUENTE-MOCKUPS-CODIGO.md)
- Repo: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Reutilizar código de: **`cotizador.html`**, **`itinerario.html`**, y bloques de copiloto en **`crm.html`** (HU-10)
- Screenshots: `cotizador.png`, `itinerario.png`, `crm.png` (validación, no fuente primaria)

## Issues

| Issue | HU | Rol | Fuente prototipo |
|---|---|---|---|
| #14 | Opciones cotización UI | Owner | `cotizador.html` |
| #16 | Constructor itinerario | Owner | `itinerario.html` |
| #13 | UI prompt cotizador | Pair | `cotizador.html` |
| #10 | Copiloto CRM UI | Pair | `crm.html` (Co-Piloto IA) |

## Archivos

```
# Destino
apps/web/src/app/(agency)/cotizador/**
apps/web/src/app/(agency)/itinerarios/**
apps/web/src/components/quotes/**       # ← portar desde cotizador.html
apps/web/src/components/itinerary/**    # ← portar desde itinerario.html

# Fuente
.../_external/TravelOS-AI-Ecosystem/cotizador.html
.../_external/TravelOS-AI-Ecosystem/itinerario.html
.../_external/TravelOS-AI-Ecosystem/crm.html
```

## Prompt agente

```
Frontend TravelOS Sprint 2. Issues #14 #16 (+ UI #13 #10).

OBLIGATORIO: reutiliza código de
https://github.com/nickamam08/TravelOS-AI-Ecosystem
(archivos cotizador.html, itinerario.html, crm.html).
Migra a React/Next en apps/web; screenshots solo validan.
No generes PDF en cliente; consume job/API.
Guía: documentacion/planes/FUENTE-MOCKUPS-CODIGO.md
Plan: documentacion/planes/sprint-2/frontend.md
```
