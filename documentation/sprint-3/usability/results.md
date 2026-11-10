# Resultados de pruebas de usabilidad — Sprint 3

| | |
|---|---|
| Protocolo | `documentation/sprint-2/usability-protocol.md` · Wiki [18](../../travel-OS-wiki/18-Protocolo-Usabilidad.md) |
| Ambiente | https://travel-os.pdpcomunica.com (producción) · cuentas de prueba por rol preparadas para la sesión |
| Fechas | 2026-11-07 a 2026-11-10 |
| Moderador | Juan José Palacio (UX) |
| Observador / cronómetro | Miguel Mercado (QA) |
| Planilla | [`planilla.html`](./planilla.html) (carga los datos de `sessions.json`) |
| Datos crudos | [`sessions.json`](./sessions.json) |
| Consentimientos | [`consentimientos.md`](./consentimientos.md) |
| Estado | **Ejecutado con usuarios finales reales** · analizado · publicado en Wiki 22 |

## Sesiones

| ID | Fecha | Perfil | Vínculo | Dispositivo | Duración | Consentimiento |
|---|---|---|---|---|---|---|
| P1 | 2026-11-07 | Asesor | Punto D' Partida | Portátil (Chrome) | 28 min | Sí |
| P2 | 2026-11-07 | Asesor | Punto D' Partida | Portátil (Chrome) | 31 min | Sí |
| P3 | 2026-11-08 | Asesor | Punto D' Partida | Portátil (Chrome) | 29 min | Sí |
| P4 | 2026-11-08 | Gerente / dueño | Punto D' Partida | Portátil (Chrome) | 32 min | Sí |
| P5 | 2026-11-10 | Viajero | Cliente real de la agencia | Celular (iPhone Safari) | 18 min | Sí |

Reclutamiento vía PO (Juan Manuel Restrepo Molina). Ningún participante había usado TravelOS antes. Criterio del protocolo: usan WhatsApp y Excel a diario — cumplido.

## SUS por participante

| ID | Respuestas ítems 1–10 (escala 1–5) | SUS |
|---|---|---:|
| P1 | 5, 2, 4, 2, 4, 2, 5, 2, 4, 2 | **80** |
| P2 | 4, 2, 4, 2, 4, 3, 4, 2, 4, 2 | **72,5** |
| P3 | 4, 2, 5, 2, 4, 2, 4, 2, 4, 2 | **77,5** |
| P4 | 4, 2, 4, 2, 4, 2, 4, 2, 4, 2 | **75** |
| P5 | 4, 2, 4, 2, 4, 2, 4, 2, 4, 2 | **75** |

**SUS promedio:** **76** (objetivo ≥ 70) ✅

## Resultados por tarea

| Tarea | n | Éxito sin ayuda | Con ayuda | Fallida | Tiempo medio | Errores medios | SEQ medio | Umbral | ¿Cumple? |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| T1 Cotizar NL | 4 | 100 % (4/4) | 0 | 0 | 68 s | 0,5 | 6,3 | ≤ 90 s, ≥ 80 % | ✅ |
| T2 PDF más económico | 4 | 75 % (3/4) | 1 | 0 | 41 s | 0,8 | 5,8 | ≥ 80 %, ≤ 1 error | ⚠️ Bajo 80 % |
| T3 Vincular a lead | 4 | 75 % (3/4) | 1 | 0 | 38 s | 0,5 | 5,5 | ≤ 45 s, ≥ 75 % | ✅ |
| T4 Copiloto | 4 | 100 % (4/4) | 0 | 0 | 22 s | 0,3 | 6,0 | confianza ≥ 4/5 | ✅ |
| T5 Kanban | 4 | 100 % (4/4) | 0 | 0 | 18 s | 0,0 | 6,5 | ≥ 90 % | ✅ |
| T6 Base IA | 4 | 75 % (3/4) | 1 | 0 | 54 s | 1,0 | 5,0 | ≤ 60 s, ≥ 75 % | ✅ límite |
| T7 Dashboard | 1 | 100 % (P4) | 0 | 0 | 8 s | 0,0 | 7,0 | ≤ 10 s, ≥ 90 % | ✅ |
| T8 Enlace portal | 4 | 100 % (4/4) | 0 | 0 | 27 s | 0,3 | 6,0 | ≥ 90 % | ✅ |
| T9 Portal celular | 1 | 100 % (P5) | 0 | 0 | 45 s | 0,0 | 6,0 | ≥ 90 % | ✅ |

**Efectividad global (éxito sin ayuda en tareas aplicables):** **91 %**  
**SUS promedio:** **76** ✅

## Detalle por participante

| ID | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | SUS |
|---|---|---|---|---|---|---|---|---|---|---:|
| P1 | ✓ 0:52 | ✓ 0:35 | ✓ 0:32 | ✓ 0:18 | ✓ 0:15 | ✓ 0:48 | — | ✓ 0:24 | — | 80 |
| P2 | ✓ 1:10 | ✓ 0:38 | ~ 0:45 | ✓ 0:25 | ✓ 0:20 | ~ 1:02 | — | ✓ 0:30 | — | 72,5 |
| P3 | ✓ 1:18 | ~ 0:52 | ✓ 0:35 | ✓ 0:22 | ✓ 0:17 | ✓ 0:50 | — | ✓ 0:28 | — | 77,5 |
| P4 | ✓ 1:12 | ✓ 0:39 | ✓ 0:40 | ✓ 0:23 | ✓ 0:20 | ✓ 0:56 | ✓ 0:08 | ✓ 0:26 | — | 75 |
| P5 | — | — | — | — | — | — | — | (observó) | ✓ 0:45 | 75 |

✓ = completa sin ayuda · ~ = con ayuda · — = no aplica al perfil

## Análisis por hipótesis

| Hipótesis | Resultado | ¿Se confirma? |
|---|---|---|
| H1 Cotizar NL ≤ 90 s | 68 s · 100 % éxito | ✅ Sí |
| H2 Opción más económica | 75 % sin ayuda · errores medios 0,8 | ⚠️ Parcial — etiqueta poco clara |
| H3 Vincular lead | 38 s · 75 % | ✅ Sí |
| H4 Copiloto genera confianza | SEQ/confianza ≥ 4 | ✅ Sí |
| H5 Kanban sin explicación | 100 % | ✅ Sí |
| H6 Base IA descubrible | 75 % · 54 s | ⚠️ Parcial — menú poco visible |
| H7 Dashboard ≤ 10 s | 8 s | ✅ Sí |
| H8 Portal viajero | 100 % · SUS 76 | ✅ Sí |

## Preguntas de seguimiento (síntesis)

1. **Más fácil:** cotizar en lenguaje natural y mover el kanban. **Más difícil:** encontrar «Base IA»; un asesor buscó primero en Configuración.
2. **Confianza en precios IA:** 4/5 enviarían con revisión rápida del margen; 1/5 validaría tarifas del hotel a mano.
3. **Para dejar WhatsApp/Excel:** invitaciones de usuarios y recuperar contraseña sin pedir al admin.
4. **Viajero:** prefiere el portal para documentos; quiere el enlace también por WhatsApp (HU-30).

Respuestas literales por participante: ver `sessions.json` → `follow`.

## Hallazgos → acciones

| Hallazgo | Severidad | Complejidad | Acción | Destino |
|---|---|---|---|---|
| «Base IA» poco visible en la barra | Media | Baja–media | Renombrar / destacar en sidebar | [HU-36](https://github.com/Jeronimo0228/travel-OS/issues/63) |
| PDF «más económica» no siempre obvio (T2) | Media | Baja | Etiqueta / orden por precio | HU-36 |
| Invitar usuarios y reset de clave | Alta (adopción) | Media | Historias nuevas | [HU-37](https://github.com/Jeronimo0228/travel-OS/issues/64), [HU-38](https://github.com/Jeronimo0228/travel-OS/issues/65) |

## Revisión heurística previa (equipo)

Antes de las sesiones con usuarios finales se corrigieron hallazgos altos (asistente, KPIs, WhatsApp, etc.). Wiki 22 §4 · capturas `documentation/sprint-3/evidence/ui-2026-11-10/`.
