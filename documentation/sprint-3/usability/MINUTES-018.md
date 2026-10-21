# MINUTES-018 — Revision de usabilidad Sprint 3 (BORRADOR)

**Estado:** BORRADOR, pendiente de aprobacion del equipo.
**Fecha:** 21 de octubre de 2026, 6:25 a.m. (hora de Colombia)
**Modalidad:** simulacion automatizada; Grok Bot como PO y como 5 usuarios (admin, gerente, 2 asesores, viajero).

## Puntos tratados
1. Se ejecutaron 36 tareas guionadas contra produccion (`sim/usability_sim.py`). Resultado: 36/36 superadas, SUS promedio 85.0 (ver `results.md`).
2. Se verifico que no quedaran datos de prueba: 0 sobrantes.
3. Hallazgos: H1 (403 en vez de 404 tras borrar un lead), H2 (tareas de mas de 2 s por latencia), H3 (dependencia de cuota gratuita de IA).

## Decisiones propuestas (por confirmar)
- Abordar H1 en el siguiente sprint.
- Activar la rotacion de llaves Gemini y el respaldo Groq/OpenRouter (rama `feat/s3-usability-redo`) tras revision del equipo.
- Repetir la prueba con usuarios reales sobre la interfaz grafica.

## Limitaciones
Simulacion por API, no con personas reales ni sobre la interfaz. El SUS se deriva de lo medido, no de encuestas a humanos.
