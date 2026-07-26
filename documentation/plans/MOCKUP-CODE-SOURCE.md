# Mockup code source (mandatory for Frontend & UX)

Mockups are **not screenshots only**. They already exist as HTML + Tailwind in a separate repo.  
Frontend and UX must **review and reuse that code** when implementing `apps/web` (migrate to Next.js/React; do not redesign from scratch).

## Repository

| Field | Value |
|---|---|
| GitHub | https://github.com/nickamam08/TravelOS-AI-Ecosystem |
| Clone SSH | `git@github.com:nickamam08/TravelOS-AI-Ecosystem.git` |
| Local copy (outside monorepo) | `Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem` |
| Prototype stack | Vite + multi-page HTML + Tailwind CDN + Material Symbols |
| Delivery screenshots | `documentation/mockups/screenshots/` (visual check; **source HTML wins**) |

```bash
mkdir -p "$HOME/Documentos/Semestre 6/_external"
git clone git@github.com:nickamam08/TravelOS-AI-Ecosystem.git \
  "$HOME/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
cd "$HOME/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
npm install && npm run dev
```

## Screen → source file

| Product screen | Source HTML | Screenshot |
|---|---|---|
| Control panel / Dashboard | `index.html` | `documentation/mockups/screenshots/index.png` |
| Smart CRM | `crm.html` | `.../crm.png` |
| AI Quoter | `cotizador.html` | `.../cotizador.png` |
| Itinerary builder | `itinerario.html` | `.../itinerario.png` |
| Agent center | `agentes.html` | `.../agentes.png` |
| Agents (EN) | `agentes-en.html` | `.../agentes-en.png` |

## Reuse rules

1. Open the matching HTML and understand layout, Tailwind classes, visual components, and copy.
2. Port into Next.js as React components (sidebar, cards, tables, kanban, etc.).
3. Reuse tokens: embedded `tailwind.config` colors, fonts (Plus Jakarta / Inter), Material Symbols if needed.
4. Screenshots validate the outcome; **on conflict, the prototype HTML wins**.
5. Do not vendor-copy the whole prototype repo into `travel-OS`; migrate piece by piece into the App Router.
6. UX documents reuse vs adapt; Frontend implements the migration.

## Do not

- Redesign screens from PNGs without opening the HTML.
- Paste raw HTML without reusable React components.
- Change visual identity without UX + PO agreement.
