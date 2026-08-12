# MINUTES-003 — Sprint 1 Planning

| Campo | Valor |
|---|---|
| Fecha | 2026-08-11 |
| Tipo | Sprint Planning |
| Sprint | 1 — Fundación + CRM núcleo |
| Facilitador | Jerónimo Restrepo (SM) |

## 1. Asistentes

- Jerónimo Restrepo — SM + DevSecOps  
- Santiago Arboleda — Frontend  
- Samuel Madrid — Backend  
- Miguel Mercado — QA  
- Juan José Palacio — UX  
- (PO opcional en planning técnico)

## 2. Sprint goal

Tener plataforma multi-tenant autenticada con CRM básico usable (leads, pipeline, tareas, filtros, asignación) + calidad base (CI, health, auditoría).

## 3. Alcance (Issues)

| Issue | HU | Owner sugerido |
|---|---|---|
| #1 | Registro tenant | Backend |
| #2 | Login / sesión | Backend (+ FE forms) |
| #3 | RBAC | Backend |
| #4 | Marca blanca | FE + BE |
| #5 | Auditoría | Backend |
| #6 | Health + CI | DevSecOps |
| #7 | Leads CRUD | BE + FE |
| #8 | Pipeline | FE + BE |
| #9 | Tareas | BE + FE |
| #11 | Filtros listado | FE + BE |
| #12 | Asignación lead | BE + FE |

**Fuera de Sprint 1:** cotizador IA, itinerarios, portal viajero (Sprints 2–3).

## 4. Definition of Done (equipo)

- AC Gherkin cumplidos  
- CP funcionales asociados ejecutados o justificados  
- CI verde en PR  
- Review de pares  
- Wiki/Issue actualizado  

## 5. Entregables no-código (paralelos)

- Plan de negocios secciones 1–5  
- Diseño CP Sprint 1  
- Documentación calidad  
- Guion sustentación  

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Alcance CRM ambicioso | Priorizar #1–#3–#7–#8; #4/#9 pueden recortarse si bloquean |
| Dependencia auth para FE | BE entrega contratos OpenAPI/DTO temprano |
| Evidencias ceremonias | Capturas en `evidence/MINUTES-003/` |

## 7. Acuerdos

1. Trabajar por PR contra `main` (GitHub Flow).  
2. Cada HU enlaza CP en `documentation/sprint-1/functional-tests/`.  
3. Código de HU lo implementa el rol asignado (no se hace en bloque por el SM).  

## 8. Evidencias

Carpeta: `documentation/ceremonies/evidence/MINUTES-003/`  
(Agregar capturas de reunión / lista de asistencia.)
