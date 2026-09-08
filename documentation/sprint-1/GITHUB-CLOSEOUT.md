# Sprint 1 — Cierre GitHub (PRs, merges, issues)

## Flujo (GitHub Flow)

1. Rama corta desde `main`.
2. PR con descripción: **qué / por qué / cómo probar / riesgos**.
3. Review de pares (o SM en close-out DevSecOps).
4. Merge squash/merge cuando CI verde.
5. Issue ← comentario de evidencia → Close.

## Justificación de aprobación — PRs históricos Sprint 1

| PR | Título | Justificación de merge |
|---|---|---|
| #25 | UX docs | Notas WCAG verificables; sin riesgo runtime. |
| #26 | HU-QA auth spec | Contratos e2e auth; documenta bloqueadores. |
| #27 | HU-QA lead CRUD | Cobertura CP leads/filtros; hallazgo DELETE. |
| #28 | HU-QA unitarios + matrix | Unit + qa-matrix + rbac-checklist. |
| #29 | API Sprint 1 integration | Auth/leads/tasks/audit/health; base del MVP. |

### Criterios usados para aprobar

- Scope acotado a HU del Sprint 1.
- No secrets en diff.
- Multi-tenant: queries con `agencyId` del token.
- CI verde (o plan explícito de fix en follow-up inmediato).
- Docs de prueba actualizadas cuando cambia contrato.

## Close-out DevSecOps (este cierre)

| Cambio | Motivo |
|---|---|
| ESLint API (no-unsafe off pragmático) | Desbloquear CI sin reescribir 100+ asserts e2e |
| Auth unit specs reescritos | Alinear a AuthService real + AuditService |
| cookie-parser | Cookies httpOnly funcionales |
| Agency branding API | HU-04: persistencia por tenant |
| Users list + assign UI | HU-12: asignación real ADMIN/GERENTE |
| Audit UI | HU-05: evidencia visible |
| Actas + deck | Rúbrica ceremonias + presentación 20% |

## Issues Sprint 1 → Done

Cerrar con comentario estándar:

```
Done Sprint 1.
Evidencia: <commit/PR>
AC Gherkin + CP asociados en documentation/sprint-1/functional-tests/.
CI: lint/test/build verdes en main tras merge.
```

Milestone: **Sprint 1 — Fundación + CRM núcleo** → Closed.
