# Sprint 0 — Presentación / Sustentación

## Deck ampliado (10 diapositivas)

- [`sprint-0-deck.html`](./sprint-0-deck.html) — deck visual (pitch 5–8 min)
- [`guion-sustentacion-sprint-0.pdf`](./guion-sustentacion-sprint-0.pdf) — guion fuente del equipo

### Cómo presentarlo

```bash
cd travel-OS
python3 -m http.server 8765
# http://127.0.0.1:8765/documentation/presentation/sprint-0-deck.html
```

Controles: `→` / espacio · `←` · botones. PDF: `Ctrl+P`.

### Contenido (alineado al guion)

1. Portada + equipo completo  
2. 8 dolores (problemática)  
3. Solución mapeada a cada dolor  
4. Arquitectura multi-tenant (`agencyId`, colas, RAG)  
5. Stack tecnológico  
6. MVP en 3 releases / sprints  
7. Prototipos + demo local verificada  
8. Competencia (TravelJoy / Travefy / chatbots)  
9. Ventaja competitiva + frase de cierre  
10. Checklist Sprint 0 + pedido al PO  

### Demo mockups

```bash
cd "$HOME/Documentos/Semestre 6/_external/TravelOS-AI-Ecosystem"
npm run dev -- --host 127.0.0.1 --port 5173
```
