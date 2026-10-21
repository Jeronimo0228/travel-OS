# Protocolo de pruebas de usabilidad (planeado en Sprint 2, ejecución en Sprint 3)

## 1. Objetivo

Verificar que asesores y gerentes de Punto D' Partida puedan cotizar, gestionar prospectos y compartir el portal sin ayuda, y que el viajero use el portal desde el celular.

## 2. Participantes

| Perfil | Cantidad objetivo | Reclutamiento |
|---|---|---|
| Asesor de viajes de la agencia | 3 | Por el PO |
| Gerente / dueño de agencia | 1 | El PO |
| Viajero (cliente real o simulado) | 2 | Por el equipo |

Criterio: usan WhatsApp y Excel a diario; no han visto TravelOS antes.

## 3. Entorno

https://travel-os.pdpcomunica.com, usuario demo por rol. Portátil para asesor/gerente, celular propio para el viajero. Grabación de pantalla con consentimiento. Un moderador (UX) y un observador que cronometra (QA).

## 4. Tareas

| # | Tarea (como se le lee al participante) | Rol | Objetivo real del usuario | Éxito si… |
|---|---|---|---|---|
| T1 | «Un cliente te escribe: quiere ir con su pareja a Cartagena 5 días, hotel frente al mar. Prepárale una cotización.» | Asesor | Responder rápido una solicitud | Hay una cotización con ≥2 alternativas en pantalla |
| T2 | «Envíale al cliente la opción más económica en PDF.» | Asesor | Formalizar la propuesta | Descarga el PDF correcto |
| T3 | «Esa cotización es de Ana Martínez. Déjala asociada a ella.» | Asesor | Mantener el historial del cliente | La cotización queda vinculada al lead |
| T4 | «¿A qué cliente deberías llamar primero hoy y por qué?» | Asesor | Priorizar el día | Nombra el primer lead del copiloto y su razón |
| T5 | «Pasa a Carlos Ruiz a la etapa En cierre.» | Asesor | Actualizar el embudo | El lead aparece en la columna correcta |
| T6 | «Dile a la IA que en tu agencia siempre se pide 30 % de anticipo.» | Gerente | Personalizar la IA | Guarda la política en Base IA |
| T7 | «¿Cuánto se vendió este mes y qué asesor va mejor?» | Gerente | Controlar el negocio | Lee el KPI y la tabla por asesor |
| T8 | «Comparte con el viajero de Cartagena su itinerario.» | Asesor | Entregar el viaje | Genera y copia el enlace del portal |
| T9 | «Desde tu celular, revisa el voucher del hotel y pregunta a qué hora te recogen.» | Viajero | Resolver dudas del viaje | Abre el documento y envía el mensaje |

## 5. Hipótesis y preguntas de investigación

| # | Hipótesis (basada en el diseño) | Pregunta de investigación | Tareas | Métrica y umbral |
|---|---|---|---|---|
| H1 | Escribir el pedido en lenguaje natural es más rápido que armar la cotización a mano | ¿Cuánto tarda un asesor en tener una propuesta? | T1 | Tiempo ≤ 90 s; éxito ≥ 80 % |
| H2 | Las alternativas lado a lado permiten elegir sin ayuda | ¿Identifica la opción más económica? | T2 | Éxito ≥ 80 %; ≤ 1 error |
| H3 | El selector del encabezado hace obvio vincular a un lead | ¿Encuentra cómo vincular? | T3 | Éxito ≥ 75 %; tiempo ≤ 45 s |
| H4 | La razón del copiloto genera confianza | ¿Entiende por qué un lead va primero? | T4 | Explica la razón con sus palabras; confianza ≥ 4/5 |
| H5 | El kanban se entiende sin explicación | ¿Arrastra la tarjeta a la etapa correcta? | T5 | Éxito ≥ 90 % |
| H6 | «Base IA» es descubrible desde la barra lateral | ¿Encuentra dónde configurar políticas? | T6 | Éxito ≥ 75 %; tiempo ≤ 60 s |
| H7 | El dashboard responde en menos de 10 s a «cómo vamos» | ¿Lee el dato correcto? | T7 | Tiempo ≤ 10 s; éxito ≥ 90 % |
| H8 | El viajero usa el portal sin instrucciones | ¿Encuentra documentos y chat? | T8, T9 | Éxito ≥ 90 %; SUS ≥ 70 |

## 6. Métricas

- Tasa de éxito por tarea (completa / con ayuda / fallida).
- Tiempo por tarea (cronómetro del observador).
- Errores: clics en rutas equivocadas, mensajes de error.
- Satisfacción: SEQ (1–7) después de cada tarea y SUS al final.

## 7. Preguntas de seguimiento

1. ¿Qué fue lo más fácil y lo más difícil?
2. ¿Confiarías en los precios que armó la IA para enviárselos a un cliente? ¿Por qué?
3. ¿Qué te faltó para usar esto en tu día a día en vez de WhatsApp/Excel?
4. (Viajero) ¿Preferirías recibir esto por WhatsApp o en el portal?

## 8. Guion de la sesión (30 min)

Bienvenida y consentimiento (3 min) → tareas pensando en voz alta (20 min) → SUS y preguntas (7 min).

## 9. Registro

Plantilla de resultados: `documentation/sprint-3/usability/results.md`.
