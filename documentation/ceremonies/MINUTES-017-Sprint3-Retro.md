# MINUTES-017 — Retrospectiva Sprint 3

> **BORRADOR — reconstruido a partir de la evidencia del repositorio (commits, PRs, issues y planes por rol). El equipo debe validar asistentes, horas y comentarios antes de darlo por oficial.** Lo marcado «por confirmar» no tiene evidencia escrita.

| Campo | Valor |
|---|---|
| ID | MINUTES-017 |
| Tipo | Retrospectiva |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Sprint | 3 — Portal + Insights + Piloto (milestone #4, issues #19–#23) |
| Fecha | Por confirmar (después de la review) |
| Hora | Por confirmar |
| Modalidad | Por confirmar |
| Facilitador | Jerónimo Restrepo (SM) |
| Autor del acta | Jerónimo Restrepo (SM) — borrador |

## 1. Asistentes

| Nombre | Rol | Asistió |
|---|---|---|
| Jerónimo Restrepo | Scrum Master + DevSecOps | Por confirmar |
| Santiago Arboleda | Frontend | Por confirmar |
| Samuel Madrid | Backend | Por confirmar |
| Miguel Mercado | QA | Por confirmar |
| Juan José Palacio | UX | Por confirmar |

## 2. Observaciones basadas en evidencia (para discutir; el equipo completa sus opiniones)

**Qué funcionó**
- Planes por rol en `documentation/plans/sprint-3/` dieron un alcance claro por persona.
- CI con lint, unitarias, e2e y build atrapó regresiones antes de fusionar.
- Cierre con evidencia (capturas, log de ejecución, UAT) en el mismo repositorio.

**Qué mejorar**
- El trabajo se concentró en los dos últimos días (19–20 de octubre), un mes después de la fecha del milestone.
- PRs apilados: el borrado automático de ramas cerró PRs sin fusionar y hubo que reabrirlos.
- Dependencias vulnerables detectadas recién en el deploy (Next 15.2.4).
- Sin clave de IA en producción hasta el final.

**Acciones propuestas para Sprint 4**

| # | Acción | Responsable |
|---|---|---|
| R1 | Daily corta con avance visible en el tablero cada día | SM |
| R2 | PRs pequeños contra `main`, sin apilar | Todos |
| R3 | Dependabot / auditoría de dependencias en CI | DevSecOps |
| R4 | Ejecutar y documentar las pruebas de usabilidad con usuarios reales | UX + QA |

## 3. Votación / acuerdos del equipo

Por completar en la sesión.
