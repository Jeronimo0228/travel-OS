# Sprint 0 — Presentación / Sustentación

## Deck (10 diapositivas)

Archivo: [`sprint-0-deck.html`](./sprint-0-deck.html)

### Cómo presentarlo

Desde la raíz del repo (para que carguen fotos y screenshots):

```bash
cd "/path/to/travel-OS"
python3 -m http.server 8765
# Abrir:
# http://127.0.0.1:8765/documentation/presentation/sprint-0-deck.html
```

Controles: `→` / espacio (siguiente), `←` (anterior), o botones abajo a la derecha.  
Imprimir / PDF: `Ctrl+P` → “Guardar como PDF” (cada slide es una página).

### Contenido (guion)

1. Portada + equipo  
2. Problemática  
3. Solución TravelOS AI  
4. Flujos (asesor / gerente / viajero)  
5. Alcance MVP  
6. Arquitectura  
7. Stack  
8. Mockups + demo local verificada  
9. Competencia  
10. Roadmap + aprobación PO  

## Demo de mockups en local (verificado)

Prototipo Vite (código fuente HTML, no solo screenshots):

```bash
cd "$HOME/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

| Ruta | Pantalla | Check local |
|---|---|---|
| http://127.0.0.1:5173/ | Panel | 200 |
| http://127.0.0.1:5173/crm.html | CRM | 200 |
| http://127.0.0.1:5173/cotizador.html | Cotizador | 200 |
| http://127.0.0.1:5173/itinerario.html | Itinerario | 200 |
| http://127.0.0.1:5173/agentes.html | Agentes | 200 |

Guía de reutilización en FE: [`../plans/MOCKUP-CODE-SOURCE.md`](../plans/MOCKUP-CODE-SOURCE.md)
