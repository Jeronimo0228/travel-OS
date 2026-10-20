# Pruebas funcionales — Sprint 3

| CP | HU | Tipo | Automatizado en | Estado |
|---|---|---|---|---|
| CP-19-01 | HU-19 | Viajero abre el enlace y ve el itinerario agrupado por días en hora de Bogotá | `portal.e2e-spec.ts`, `portal.test.ts` | Pasa |
| CP-19-02 | HU-19 | Enlace vencido o revocado muestra aviso y no datos | `portal.e2e-spec.ts` (revocación) | Pasa |
| CP-19-03 | HU-19 | Vista móvil 390 px con navegación inferior | Manual, evidencia `05-portal-itinerario.png` | Pasa |
| CP-20-01 | HU-20 | Documentos de la reserva visibles y abren en pestaña nueva | `portal.e2e-spec.ts` | Pasa |
| CP-20-02 | HU-20 | URL `http://` rechazada (400) | `portal.e2e-spec.ts` | Pasa |
| CP-20-03 | HU-20 | Consulta de documentos queda en auditoría | `portal.e2e-spec.ts`, `portal.service.spec.ts` | Pasa |
| CP-21-01 | HU-21 | Viajero envía mensaje y la agencia lo ve (≤5 s) | `portal.e2e-spec.ts`, evidencia `07`/`08` | Pasa |
| CP-21-02 | HU-21 | Agencia responde y el viajero lo ve en orden cronológico | `portal.e2e-spec.ts` | Pasa |
| CP-21-03 | HU-21 | Otra agencia no accede a la reserva (403) | `portal.e2e-spec.ts` | Pasa |
| CP-22-01 | HU-22 | Gerente ve ventas, conversión, viajes y follow-ups | `portal.e2e-spec.ts`, `operations.service.spec.ts`, evidencia `01` | Pasa |
| CP-22-02 | HU-22 | Desglose por asesor y destino | `metrics.service.spec.ts` | Pasa |
| CP-22-03 | HU-22 | Asesor no accede a `/metrics` (RBAC) | `metrics.controller` `@Roles(ADMIN, GERENTE)` + mensaje en UI | Pasa |
| CP-23-01 | HU-23 | Tarea vencida genera un recordatorio deduplicado | `follow-up-reminder.service.spec.ts` | Pasa |
| CP-23-02 | HU-23 | Campana muestra no leídos y "Marcar leído" baja el contador | `reminders.test.ts`, evidencia `02` | Pasa |

Bitácora: [EXECUTION-LOG.md](./EXECUTION-LOG.md)
