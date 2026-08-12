# Pruebas funcionales manuales — Sprint 1

Diseño de casos de prueba (CP) asociados a cada HU del Sprint 1 y a sus criterios de aceptación (formato *Dado / Cuando / Entonces*).

| Campo | Valor |
|---|---|
| Sprint | 1 — Fundación + CRM |
| Issues | #1–#9, #11, #12 |
| Ejecutor sugerido | Miguel Mercado (QA) + peer del responsable de la HU |
| Evidencia de ejecución | [EXECUTION-LOG.md](./EXECUTION-LOG.md) |
| Bugs | Issues con label `type:bug` enlazando HU y CP |

## Inventario CP ↔ HU

| HU | Issue | Archivo CP | # CP diseñados |
|---|---:|---|---:|
| HU-01 Registro tenant | #1 | [CP-HU-01.md](./CP-HU-01.md) | 4 |
| HU-02 Login sesión | #2 | [CP-HU-02.md](./CP-HU-02.md) | 4 |
| HU-03 RBAC | #3 | [CP-HU-03.md](./CP-HU-03.md) | 4 |
| HU-04 Marca blanca | #4 | [CP-HU-04.md](./CP-HU-04.md) | 3 |
| HU-05 Auditoría | #5 | [CP-HU-05.md](./CP-HU-05.md) | 3 |
| HU-06 Health + CI | #6 | [CP-HU-06.md](./CP-HU-06.md) | 3 |
| HU-07 Leads CRUD | #7 | [CP-HU-07.md](./CP-HU-07.md) | 5 |
| HU-08 Pipeline | #8 | [CP-HU-08.md](./CP-HU-08.md) | 3 |
| HU-09 Tareas | #9 | [CP-HU-09.md](./CP-HU-09.md) | 3 |
| HU-11 Filtros clientes | #11 | [CP-HU-11.md](./CP-HU-11.md) | 3 |
| HU-12 Asignación lead | #12 | [CP-HU-12.md](./CP-HU-12.md) | 3 |

**Total diseñados: 38 CP.**

## Convención de ID

`CP-<HU>-<nn>` ejemplo: `CP-01-02`.

## Estado de ejecución

- **Diseño:** completo (este directorio).
- **Ejecución:** se completa cuando exista la funcionalidad implementada por cada rol; registrar resultado en `EXECUTION-LOG.md` y abrir bugs si aplica.
