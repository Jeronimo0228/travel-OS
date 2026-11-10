# MINUTES-020 — Retrospectiva final del proyecto

| Campo | Valor |
|---|---|
| ID | MINUTES-020 |
| Tipo | Retrospectiva |
| Proyecto | TravelOS AI — Proyecto Integrador 2 |
| Fecha | 2026-11-10 (post review PO) |
| Hora | 18:15 – 18:50 COT |
| Modalidad | Virtual |
| Facilitador | Jerónimo Restrepo (SM) |
| Autor del acta | Jerónimo Restrepo |

## 1. Asistentes

| Nombre | Rol | Asistió |
|---|---|---|
| Jerónimo Restrepo | Scrum Master + DevSecOps | Sí |
| Santiago Arboleda | Frontend | Sí |
| Samuel Madrid | Backend | Sí |
| Miguel Mercado | QA | Sí |
| Juan José Palacio | UX | Sí |

## 2. Datos del sprint

- Milestones #4 y #5 cerrados (0 issues abiertos).
- CI: 234 pruebas; Security pipeline (gitleaks, audit, CodeQL).
- CI roto 7–9 nov por e2e con fechas fijas → corregido en PR #49.
- Acumulación de historias al final del sprint (riesgo R6).

## 3. ¿Qué salió bien?

- Demo estable en dominio público (`travel-os.pdpcomunica.com`).
- Contratos compartidos Zod + e2e como gate.
- Manual embebido en `/ayuda` (el cliente lo puede abrir sin PDF aparte).
- Usabilidad con SUS ≥ 70 y hallazgos accionables en backlog S4.

## 4. ¿Qué no salió bien?

- Varias HU se concentraron en la última semana.
- Descubribilidad de «Base IA» (confirmado en usabilidad).
- No había flujo de invitar asesores desde la UI (bloqueo de adopción real).

## 5. ¿Qué haríamos distinto?

- Congelar scope de cierre 1 semana antes de la sustentación.
- Ejecutar usabilidad a mitad de sprint, no solo al final.
- Priorizar onboarding multi-usuario (invitar / roles) junto al CRM.

## 6. Acciones de mejora

| # | Acción | Responsable |
|---|---|---|
| M1 | HU-36 ajustes UI usabilidad | UX + FE |
| M2 | HU-37 / HU-38 auth de agencia | BE + DevSecOps |
| M3 | Checklist «demo cold-start» 24 h antes de cada pitch | SM |
