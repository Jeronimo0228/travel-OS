# Sprint 3 — UX notes

Fuente visual: `index.html` (dashboard) y el shell de `TravelOS-AI-Ecosystem`.

## Dashboard (HU-22)
- Mismo grid bento del prototipo: 4 KPIs arriba (ventas, conversión, viajes activos, follow-ups) con icono de color semántico (esmeralda = dinero, índigo = conversión, coral = alerta).
- Debajo: embudo (barras normalizadas al máximo), próximas salidas, desempeño por asesor y rendimiento por destino, igual al bloque "Rendimiento por Destino" del mockup.
- Regla de los 10 s: cada tarjeta responde una sola pregunta; las cifras van en `headline-lg`.
- Estados: skeleton al cargar, error con "Reintentar", y mensaje explicativo para el rol asesor.

## Portal del viajero (HU-19/20/21)
- Mobile-first (390 px). Jerarquía: saludo + destino → fechas + estado del viaje ("Faltan N días" / "Día X de Y") → contadores → contenido.
- Navegación inferior de 3 pestañas al alcance del pulgar: Itinerario, Documentos, Chat. En escritorio pasa a pastilla centrada.
- Itinerario como línea de tiempo por día con hora a la derecha y lugar con icono.
- Documentos como tarjetas grandes con icono según tipo (pasaporte, voucher, vuelo, seguro).
- Chat con burbujas (propias en índigo a la derecha), hora relativa y envío con Enter.

## Agencia
- "Itinerario" del menú se convierte en "Viajes y Portal": tarjetas por viaje con estado, y un workspace con itinerario, documentos, enlace seguro y chat lado a lado.
- Campana del topbar con contador coral y panel de follow-ups vencidos.

## Accesibilidad
- `aria-live` en el chat, `aria-current` en pestañas, etiquetas en todos los campos, foco visible.
