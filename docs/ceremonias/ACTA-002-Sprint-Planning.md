# Acta 002 — Sprint Planning (equipo)

| Campo | Valor |
|---|---|
| ID | ACTA-002 |
| Tipo de ceremonia | **Sprint Planning** (aterrizaje Sprint 0 → preparación Sprint 1) |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Fecha | 2026-07-24 |
| Hora | 17:00 – 18:30 (COT) |
| Modalidad | Virtual (Google Meet) |
| Facilitador | Jerónimo Restrepo Ángel (Scrum Master) |
| Redactor del acta | Jerónimo Restrepo Ángel |

## 1. Asistentes

| Nombre | Rol | Asistió |
|---|---|---|
| Jerónimo Restrepo Ángel | Scrum Master + DevSecOps | Sí |
| Santiago Arboleda Giraldo | Frontend Developer | Sí |
| Samuel Madrid Ossa | Backend Developer | Sí |
| Miguel Mercado Mercado | QA Engineer | Sí |
| Juan José Palacio Zuluaga | UX/UI Designer | Sí |

> El PO no asiste a este planning interno; se validará el resultado en review/aceptación.

## 2. Agenda

1. Recapitulación de decisiones del Kickoff.
2. Story Mapping del MVP.
3. Creación de épicas e historias (≥20).
4. Detalle de historias candidatas a Sprint 1 (tareas, AC, pruebas, esfuerzo, responsable).
5. Definición de milestones y “Definition of Done” del MVP por sprint.
6. Plan de evidencias y Wiki.

## 3. Desarrollo / Temas tratados

- Se confirma que Sprint 0 es solo definición (sin features productivas).
- Se construye backbone del Story Map: captar → calificar → cotizar → itinerario → cerrar → acompañar → medir.
- Se acuerdan 4 épicas (Fundación, CRM, Cotizador/Itinerarios, Portal+Insights).
- Se estiman historias Sprint 1 orientadas a fundación técnica + CRM núcleo.
- QA propone casos de prueba iniciales ligados a AC.
- UX alinea pantallas del prototipo con HUs del backlog.
- DevSecOps define bootstrap de labels/milestones/issues en GitHub.

## 4. Decisiones

| # | Decisión | Responsable |
|---|---|---|
| D1 | 4 épicas oficiales E1–E4 | Equipo |
| D2 | Product Backlog inicial = 24 HU | Equipo |
| D3 | Sprint 1 = Fundación + CRM núcleo (ver planning) | Equipo |
| D4 | DoD: HU con AC, pruebas, PR review, CI verde, doc Wiki actualizada | SM |
| D5 | Milestones: Sprint 0…Sprint 3 con criterios de estado MVP | DevSecOps |

## 5. Acuerdos y action items

| # | Acción | Responsable | Fecha límite | Estado |
|---|---|---|---|---|
| A1 | Publicar Story Map y backlog en Wiki/repo | SM | 2026-07-25 | Hecho |
| A2 | Detallar Sprint 1 planning (tareas/AC/pruebas) | Equipo | 2026-07-25 | Hecho |
| A3 | Subir screenshots mockups al repo | FE + UX | 2026-07-25 | Hecho |
| A4 | Ejecutar script bootstrap Issues/Milestones | DevSecOps | 2026-07-26 | Pendiente auth `gh` |
| A5 | Cargar evidencias gráficas de Kickoff y Planning | Todos | 2026-07-28 | Pendiente |

## 6. Riesgos / impedimentos

- Auth de GitHub CLI en la máquina local apunta a otra cuenta → usar SSH `github.com-jeronimo0228` + re-login `gh` como Jeronimo0228.
- Fotos de integrantes pendientes para tabla de roles.

## 7. Próximos pasos

1. Cerrar documentación Sprint 0 y presentación tipo pitch.
2. Sesión de aceptación de prototipo con PO.
3. Iniciar Sprint 1 al cerrar sustentación Sprint 0.

## 8. Evidencias *(cargar capturas/fotos/links)*

> Sección libre para evidencias gráficas reales de la ceremonia.

- [ ] Captura Meet / asistencia
- [ ] Export del Story Map (Miro/FigJam/Canva)
- [ ] Foto tablero de estimaciones
- [ ] Link de grabación (si aplica): _______________________

**Carpeta sugerida:** `docs/ceremonias/evidencias/ACTA-002/`

---
*Acta de Sprint Planning — TravelOS AI / Grupo 2*
