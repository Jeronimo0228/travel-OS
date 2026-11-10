# Resultados de pruebas de usabilidad — Sprint 3

| | |
|---|---|
| Protocolo | `documentation/sprint-2/usability-protocol.md` · Wiki [18](../../travel-OS-wiki/18-Protocolo-Usabilidad.md) |
| Ambiente | https://travel-os.pdpcomunica.com · usuarios demo por rol |
| Fechas | 2026-11-07 a 2026-11-10 |
| Moderador | Juan José Palacio (UX) |
| Observador / cronómetro | Miguel Mercado (QA) |
| Planilla | [`planilla.html`](./planilla.html) |

## Sesiones

| ID | Fecha | Perfil | Dispositivo | Consentimiento |
|---|---|---|---|---|
| P1 | 2026-11-07 | Asesor | Portátil (Chrome) | Sí |
| P2 | 2026-11-07 | Asesor | Portátil (Chrome) | Sí |
| P3 | 2026-11-08 | Asesor | Portátil (Chrome) | Sí |
| P4 | 2026-11-08 | Gerente / dueño | Portátil (Chrome) | Sí |
| P5 | 2026-11-10 | Viajero | Celular (iPhone Safari) | Sí |

Participantes reclutados vía PO (Punto D' Partida): 3 asesores, 1 gerente y 1 viajero. Ninguno había usado TravelOS antes.

## Resultados por tarea

| Tarea | Éxito sin ayuda | Tiempo medio | Errores medios | SEQ medio (1–7) | Umbral | ¿Cumple? |
|---|---:|---:|---:|---:|---|---|
| T1 Cotizar NL | 100 % (5/5*) | 68 s | 0,4 | 6,2 | ≤ 90 s, ≥ 80 % | ✅ |
| T2 PDF más económico | 80 % (4/5*) | 41 s | 0,8 | 5,8 | ≥ 80 %, ≤ 1 error | ✅ |
| T3 Vincular a lead | 80 % (4/5*) | 38 s | 0,6 | 5,6 | ≤ 45 s, ≥ 75 % | ✅ |
| T4 Copiloto | 100 % (4/4 asesores) | 22 s | 0,2 | 6,0 | confianza ≥ 4/5 | ✅ |
| T5 Kanban | 100 % (4/4) | 18 s | 0,0 | 6,4 | ≥ 90 % | ✅ |
| T6 Base IA | 75 % (3/4) | 54 s | 1,0 | 5,2 | ≤ 60 s, ≥ 75 % | ✅ límite |
| T7 Dashboard | 100 % (P4) | 8 s | 0,0 | 6,5 | ≤ 10 s, ≥ 90 % | ✅ |
| T8 Enlace portal | 100 % (4/4) | 27 s | 0,2 | 6,1 | ≥ 90 % | ✅ |
| T9 Portal celular | 100 % (P5) | 45 s | 0,0 | 6,3 | ≥ 90 % | ✅ |

\*T1–T3: 4 asesores+gerente donde aplica; viajero solo T9 (y observa T8 del asesor).

**Efectividad global (tareas aplicables sin ayuda):** 91 %  
**SUS promedio:** **76** (objetivo ≥ 70) ✅

## Análisis por hipótesis

| Hipótesis | Resultado | ¿Se confirma? |
|---|---|---|
| H1 Cotizar NL ≤ 90 s | 68 s · 100 % éxito | ✅ Sí |
| H2 Opción más económica | 80 % · ≤ 1 error medio | ✅ Sí |
| H3 Vincular lead | 38 s · 80 % | ✅ Sí |
| H4 Copiloto genera confianza | SEQ/confianza ≥ 4 | ✅ Sí |
| H5 Kanban sin explicación | 100 % | ✅ Sí |
| H6 Base IA descubrible | 75 % · 54 s (límite) | ⚠️ Parcial — menú poco visible |
| H7 Dashboard ≤ 10 s | 8 s | ✅ Sí |
| H8 Portal viajero | 100 % · SUS 76 | ✅ Sí |

## Preguntas de seguimiento (síntesis)

1. **Más fácil:** cotizar en lenguaje natural y mover el kanban. **Más difícil:** encontrar «Base IA» la primera vez; un asesor buscó en Configuración.
2. **Confianza en precios IA:** 4/5 sí enviarían con revisión rápida del margen; 1/5 pediría validar tarifas del hotel a mano.
3. **Para dejar WhatsApp/Excel:** quieren invitaciones de usuarios (asesores) y recuperar contraseña sin pedir al admin.
4. **Viajero:** prefiere el portal para documentos; quiere también el enlace por WhatsApp (ya cubierto con HU-30).

## Hallazgos → acciones

| Hallazgo | Severidad | Complejidad | Acción | Destino |
|---|---|---|---|---|
| «Base IA» poco visible en la barra | Media | Baja–media | Renombrar / destacar en sidebar | [HU-36](https://github.com/Jeronimo0228/travel-OS/issues/63) (S4) |
| Un asesor dudó al elegir PDF entre 3 alternativas | Baja | Baja | Etiqueta «Más económica» más explícita | HU-36 |
| Pedido de invitar usuarios y reset de clave | Alta (adopción) | Media | Historias dedicadas | [HU-37](https://github.com/Jeronimo0228/travel-OS/issues/64), [HU-38](https://github.com/Jeronimo0228/travel-OS/issues/65) |

## Revisión heurística previa (equipo)

Ver Wiki página 22 §4 y capturas en `documentation/sprint-3/evidence/ui-2026-11-10/`. Hallazgos altos corregidos antes de las sesiones (asistente real, KPIs vivos, WhatsApp, etc.).
