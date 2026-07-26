# Diseño de Interfaces — Mockups

## Prototipo dinámico

Se reutiliza el prototipo interactivo existente:

- Repositorio origen: https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Stack del prototipo: Vite + HTML multi-page + Tailwind CDN
- Ejecución local: `npm install && npm run dev`
- Pantallas: Panel de Control, CRM Inteligente, Cotizador, Itinerario, Centro de Agentes

Este prototipo permite pruebas de aceptación tempranas con el PO y será la base visual del frontend Next.js.

## Screenshots (capturas del prototipo en ejecución)

| Pantalla | Archivo |
|---|---|
| Panel de Control / Inteligencia | [`docs/mockups/screenshots/index.png`](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/index.png) |
| CRM Inteligente | [`docs/mockups/screenshots/crm.png`](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/crm.png) |
| Cotizador IA | [`docs/mockups/screenshots/cotizador.png`](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/cotizador.png) |
| Constructor de Itinerario | [`docs/mockups/screenshots/itinerario.png`](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/itinerario.png) |
| Centro de Agentes | [`docs/mockups/screenshots/agentes.png`](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/agentes.png) |
| Agents (EN) | [`docs/mockups/screenshots/agentes-en.png`](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/agentes-en.png) |

### Vista embebida (Panel)

![Panel TravelOS AI](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/index.png)

### Vista embebida (CRM)

![CRM TravelOS AI](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/crm.png)

### Vista embebida (Cotizador)

![Cotizador TravelOS AI](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/cotizador.png)

### Vista embebida (Itinerario)

![Itinerario TravelOS AI](https://raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/itinerario.png)

## Prueba de prototipo (casos iniciales)

| ID | Caso | Resultado esperado | Aceptación PO |
|---|---|---|---|
| PT-01 | Navegar Panel → ver KPIs e insights | Usuario comprende salud comercial en < 10 s | ⏳ Pendiente firma en sesión |
| PT-02 | Abrir CRM → identificar lead prioritario del copiloto | Se ve lead sugerido + embudo | ⏳ |
| PT-03 | Abrir Cotizador → entender flujo NL | Campo de prompt y resultados claros | ⏳ |
| PT-04 | Abrir Itinerario → revisar días/actividades | Itinerario legible y exportable (UI) | ⏳ |
| PT-05 | Abrir Centro de Agentes → ver estado agentes | Monitoreo de agentes IA comprensible | ⏳ |

**Sesión de aceptación:** programar con Juan Manuel Restrepo Molina; registrar resultado en acta y marcar ✅/❌ aquí.

## Notas UX

- Dark sidebar + surface clara (identidad del prototipo).
- Acciones primarias: “Análisis AI”, “Nuevo Itinerario”.
- Copiloto IA visible en CRM (diferencial).
- Juan José Palacio (UX) liderará refinamiento AA y design tokens al pasar a Next.js.
