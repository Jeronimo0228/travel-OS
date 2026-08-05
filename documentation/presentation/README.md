# Sprint 0 — Presentación / Sustentación

## Deck (10 diapositivas, modo 16:9 a pantalla completa)

- [`sprint-0-deck.html`](./sprint-0-deck.html)
- Guion fuente: [`guion-sustentacion-sprint-0.pdf`](./guion-sustentacion-sprint-0.pdf)

### Presentar

```bash
cd travel-OS
python3 -m http.server 8765 --bind 127.0.0.1
# http://127.0.0.1:8765/documentation/presentation/sprint-0-deck.html
```

- `F` — pantalla completa  
- `→` / espacio — siguiente · `←` — anterior  
- El stage es **1920×1080** y escala para llenar el monitor.

### Demo mockups (CSS local, sin CDN Tailwind)

```bash
cd "$HOME/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
npm install
npm run css   # regenera public/styles.css
npm run dev   # http://127.0.0.1:5173
```
