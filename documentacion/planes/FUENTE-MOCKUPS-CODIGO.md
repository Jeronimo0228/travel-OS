# Fuente de mockups en código (obligatoria para FE y UX)

Los mockups **no son solo screenshots**: ya existen como HTML + Tailwind en un repo separado.  
Frontend y UX deben **revisar y reutilizar ese código** al implementar `apps/web` (migrar a Next.js/React, no rediseñar desde cero).

## Repositorio

| Campo | Valor |
|---|---|
| GitHub | https://github.com/nickamam08/TravelOS-AI-Ecosystem |
| Clone SSH | `git@github.com:nickamam08/TravelOS-AI-Ecosystem.git` |
| Copia local (fuera del monorepo) | `Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem` |
| Stack del prototipo | Vite + HTML multipage + Tailwind CDN + Material Symbols |
| Screenshots de entrega | `documentacion/mockups/screenshots/` (referencia visual; el código fuente manda) |

```bash
# Si no tienes el clone local:
mkdir -p "/home/jeronimorestrepoangel/Documentos/Semestre 6/_external"
git clone git@github.com:nickamam08/TravelOS-AI-Ecosystem.git \
  "/home/jeronimorestrepoangel/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
cd "/home/jeronimorestrepoangel/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
npm install && npm run dev
```

## Mapa pantalla → archivo fuente

| Pantalla producto | Archivo HTML fuente | Screenshot |
|---|---|---|
| Panel / Dashboard | `index.html` | `documentacion/mockups/screenshots/index.png` |
| CRM Inteligente | `crm.html` | `.../crm.png` |
| Cotizador IA | `cotizador.html` | `.../cotizador.png` |
| Itinerario | `itinerario.html` | `.../itinerario.png` |
| Centro de Agentes | `agentes.html` | `.../agentes.png` |
| Agents (EN) | `agentes-en.html` | `.../agentes-en.png` |

También hay assets PNG en `public/` del repo prototipo (misma UI renderizada).

## Regla de reutilización

1. **Abrir el HTML** correspondiente y entender layout, clases Tailwind, componentes visuales y copy.
2. **Portar a Next.js** en `apps/web` como componentes React (sidebar, cards, tablas, kanban, etc.).
3. Reutilizar tokens: colores del `tailwind.config` embebido, tipografías (Plus Jakarta / Inter), Material Symbols si aplica.
4. Las screenshots validan el resultado; **si hay duda, gana el HTML del repo prototipo**.
5. No copiar el repo entero dentro de `travel-OS`; migrar por piezas al App Router.
6. UX documenta qué se reutiliza / qué se adapta; FE implementa la migración.

## Qué NO hacer

- Rediseñar pantallas solo mirando PNG sin abrir el HTML.
- Pegar HTML crudo sin componentes React reutilizables.
- Cambiar la identidad visual sin acuerdo UX + PO.
