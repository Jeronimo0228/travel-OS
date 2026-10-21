# Sprint 3 — Resultados de pruebas de usabilidad (simuladas)

Ejecucion: 2026-10-21 06:26:07 -0500 contra produccion (`https://api.travel-os.pdpcomunica.com/api`), script `sim/usability_sim.py`.
Grok Bot actuo como PO y como 5 usuarios: admin de agencia, gerente, 2 asesores (Valentina, Mateo) y un viajero.
Solo lecturas o crear-y-borrar; verificacion final: 0 datos de prueba sobrantes, 0 sin limpiar.

**Limitacion:** es una simulacion por API, no una sesion con usuarios humanos ni sobre la interfaz grafica. El SUS se deriva mecanicamente de lo medido (regla en `sus_answers()`: items positivos = 1 + round(4 x tasa de exito), -1 si alguna tarea tardo mas de 2 s; negativos = 6 - positivo).

## Resumen

- Tareas superadas: **36/36**
- SUS promedio: **85.0**

| Persona | Tareas | SUS |
|---|---|---|
| admin | 8/8 | 100.0 |
| gerente | 8/8 | 75.0 |
| asesor1 | 8/8 | 75.0 |
| asesor2 | 8/8 | 75.0 |
| viajero | 4/4 | 100.0 |

## Detalle por tarea

| Persona | ID | Tarea | Resultado | ms | Detalle |
|---|---|---|---|---|---|
| admin | admin-1 | Iniciar sesion | OK | 638 | HTTP 200 |
| admin | admin-2 | Ver pipeline de leads | OK | 496 | HTTP 200, 10 leads |
| admin | admin-3 | Ver cotizaciones | OK | 929 | HTTP 200, 20 cotizaciones |
| admin | admin-4 | Ver reservas del portal | OK | 404 | HTTP 200, 3 reservas |
| admin | admin-5 | Gestionar usuarios (listar) | OK | 513 | HTTP 200, 5 usuarios |
| admin | admin-6 | Revisar auditoria | OK | 610 | HTTP 200 |
| admin | admin-7 | Ver marca de la agencia | OK | 514 | HTTP 200 |
| admin | admin-Z | Cerrar sesion (y quedar fuera) | OK | 934 | logout HTTP 204, then /leads HTTP 401 |
| gerente | gerente-1 | Iniciar sesion | OK | 505 | HTTP 200 |
| gerente | gerente-2 | Ver pipeline de leads | OK | 620 | HTTP 200, 10 leads |
| gerente | gerente-3 | Ver cotizaciones | OK | 3685 | HTTP 200, 20 cotizaciones |
| gerente | gerente-4 | Ver reservas del portal | OK | 714 | HTTP 200, 3 reservas |
| gerente | gerente-5 | Ver tablero de operaciones | OK | 398 | HTTP 200 |
| gerente | gerente-6 | Priorizar leads con IA | OK | 1635 | HTTP 200 en 1635 ms |
| gerente | gerente-7 | Consultar auditoria segun rol | OK | 514 | HTTP 403 (control de acceso por rol) |
| gerente | gerente-Z | Cerrar sesion (y quedar fuera) | OK | 828 | logout HTTP 204, then /leads HTTP 401 |
| asesor1 | asesor1-1 | Iniciar sesion | OK | 600 | HTTP 200 |
| asesor1 | asesor1-2 | Ver pipeline de leads | OK | 510 | HTTP 200, 2 leads |
| asesor1 | asesor1-3 | Ver cotizaciones | OK | 516 | HTTP 200, 4 cotizaciones |
| asesor1 | asesor1-4 | Ver reservas del portal | OK | 418 | HTTP 200, 2 reservas |
| asesor1 | asesor1-5 | Crear, abrir y borrar un lead | OK | 2280 | create 201, read 200, delete 204, read-after 403 |
| asesor1 | asesor1-6 | Ver recordatorios | OK | 368 | HTTP 200 |
| asesor1 | asesor1-7 | Intentar cambiar un rol (debe negarse) | OK | 618 | HTTP 403 (debe ser 403) |
| asesor1 | asesor1-Z | Cerrar sesion (y quedar fuera) | OK | 832 | logout HTTP 204, then /leads HTTP 401 |
| asesor2 | asesor2-1 | Iniciar sesion | OK | 505 | HTTP 200 |
| asesor2 | asesor2-2 | Ver pipeline de leads | OK | 499 | HTTP 200, 4 leads |
| asesor2 | asesor2-3 | Ver cotizaciones | OK | 1540 | HTTP 200, 4 cotizaciones |
| asesor2 | asesor2-4 | Ver reservas del portal | OK | 422 | HTTP 200, 1 reservas |
| asesor2 | asesor2-5 | Crear, abrir y borrar un lead | OK | 2030 | create 201, read 200, delete 204, read-after 403 |
| asesor2 | asesor2-6 | Ver recordatorios | OK | 614 | HTTP 200 |
| asesor2 | asesor2-7 | Intentar cambiar un rol (debe negarse) | OK | 516 | HTTP 403 (debe ser 403) |
| asesor2 | asesor2-Z | Cerrar sesion (y quedar fuera) | OK | 1039 | logout HTTP 204, then /leads HTTP 401 |
| viajero | viajero-1 | Abrir la web publica | OK | 1329 | HTTP 200 en 1329 ms |
| viajero | viajero-2 | Portal sin enlace se protege | OK | 697 | HTTP 401 sin enlace (debe negarse) |
| viajero | viajero-3 | Enlace invalido se rechaza | OK | 315 | HTTP 401 con enlace invalido |
| viajero | viajero-4 | Servicio disponible | OK | 507 | HTTP 200 en 507 ms |

## Hallazgos

- **H1 (bajo):** tras borrar un lead, `GET /leads/:id` responde 403 en vez de 404. El borrado funciona, pero el codigo confunde (parece falta de permiso).
- **H2 (medio, rendimiento):** 3 tarea(s) superaron 2 s: gerente-3 (3685 ms), asesor1-5 (2280 ms), asesor2-5 (2030 ms). El ciclo crear/abrir/borrar lead hace 4 llamadas de ~0,4-0,6 s cada una (latencia serverless).
- **H3 (medio, rendimiento):** la priorizacion con IA tarda ~1,6-1,8 s; aceptable, pero depende de la cuota gratuita de Gemini (ver `../ai-scaling.md`).
- Control de acceso por rol correcto: el asesor recibe 403 al intentar cambiar roles; el gerente recibe 403 en auditoria; tras cerrar sesion la API responde 401.
- Portal del viajero protegido: sin enlace o con enlace invalido responde 401.
- Nota de metodo: la primera corrida del script uso rutas equivocadas (`/portal/reservations`, `/leads/tasks/reminders`) y dio 28/36; eran errores del script, no de la app. Se corrigieron y la corrida valida es la de arriba.
