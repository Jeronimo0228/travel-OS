# Presentaciones

| Sprint | Deck |
|---|---|
| **3 — Producto final (11-nov-2026)** | [`sprint-3-final-deck.html`](./sprint-3-final-deck.html): 17 diapositivas, imágenes embebidas, funciona sin conexión |
| 2 + 3 — Review conjunta | [`sprint-3-deck.html`](./sprint-3-deck.html) |
| 1 | [`sprint-1-deck.html`](./sprint-1-deck.html) |
| 0 | [`sprint-0-deck.html`](./sprint-0-deck.html) |

**Presentar:** abre el archivo en el navegador (doble clic). `F` pone pantalla completa, `→` o espacio avanza y `←` retrocede. Con `#s5` en la URL se abre en la diapositiva 5.

**Resultados de usabilidad en el deck:** constante `USABILIDAD` ya poblada con las 5 sesiones reales (SUS 76). Fuente: `documentation/sprint-3/usability/sessions.json` y Wiki 22.

---

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

---

# Review conjunta Sprint 2 + Sprint 3

- [`sprint-3-deck.html`](./sprint-3-deck.html) — 19 diapositivas (Sprint 2 y 3), mismo motor que Sprint 0/1 (stage 1920×1080, `F` pantalla completa, flechas).
- Demo en vivo: https://travel-os.pdpcomunica.com (gerente@demo.travelos.local / TravelOS!demo1).

```bash
cd travel-OS
python3 -m http.server 8765 --bind 127.0.0.1
# http://127.0.0.1:8765/documentation/presentation/sprint-3-deck.html
```
