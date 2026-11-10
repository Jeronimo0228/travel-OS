# UX Notes — Sprint 3 (Juan José Palacio Zuluaga)

Fuentes auditadas: `index.html` (Panel de Control / dashboard gerencial) y `agentes.html`
(referencia del Centro de Agentes) del repo
[nickamam08/TravelOS-AI-Ecosystem](https://github.com/nickamam08/TravelOS-AI-Ecosystem),
más la adaptación mobile-first del shell para el **portal del viajero** (sin HTML fuente propio).
En conflicto, gana el HTML sobre el PNG (regla del proyecto).

Cierra el ciclo de los tres sprints: [`../sprint-1/ux-notes.md`](../sprint-1/ux-notes.md) ·
[`../sprint-2/ux-notes.md`](../sprint-2/ux-notes.md). Cubre las tareas del plan
[`ux.md`](./ux.md) y da la fuente visual de verdad + criterios de aceptación para los
issues de Frontend **#22** (dashboard KPIs), **#19/#20** (portal itinerario/docs) y **#21** (chat).
Complementa el UAT del PO en [`uat-po.md`](./uat-po.md).

## 0. Estado de la implementación (verificado contra `apps/web`)

A diferencia de Sprints 1–2, las pantallas de este sprint **ya están implementadas y mergeadas**
(HU #19–#23 cerradas, PRs #38–#44). Esta nota documenta la fuente visual **y** audita que lo
construido cumpla los criterios UX. Archivos revisados línea por línea:

| Entregable | Archivo en `apps/web` | Fuente / HU |
|---|---|---|
| Dashboard gerencial | `src/components/dashboard/ManagerDashboard.tsx` | `index.html` · #22 |
| Portal (shell + tabs + hero) | `src/components/portal/TravelerPortal.tsx` | adaptación mobile-first · #19/20/21 |
| Timeline del viaje | `src/components/portal/ItineraryTimeline.tsx` | patrón timeline · #19 |
| Documentos del viaje | `src/components/portal/DocumentList.tsx` | tarjetas por tipo · #20 |
| Chat viajero↔agencia | `src/components/portal/ChatThread.tsx` | burbujas · #21 |

**Reusado del shell de Sprints 1–2 (no re-hecho):** tokens de `globals.css`, `AppShell`,
`Sidebar`, `Topbar`, `AiAssistantWidget`, `.glass-ai`, `.ai-pulse`, `.custom-scrollbar`,
helpers `formatCop`/`pluralize`/`formatRelativeTime`.

## 1. Tokens — sin cambios respecto a Sprints 1–2

El `tailwind.config` embebido de `index.html` es **idéntico** en paleta/radios/spacing al ya
centralizado en `globals.css`. **Hallazgo repetido de Sprint 1 (confirmado):** `index.html`
define `colors`/`borderRadius`/`spacing` pero **no** los bloques `fontFamily`/`fontSize`
(solo `crm.html` los traía). No es bloqueante porque Frontend ya resolvió la tipografía en
`globals.css` (Plus Jakarta Sans para `font-headline`, Inter para body/label).

Gradiente IA del prototipo (`from-secondary to-tertiary-fixed-dim`) ya está adoptado tanto en
el `AiAssistantWidget` como en el hero del portal → coherencia de marca mantenida.

## 2. `index.html` → Dashboard gerencial (#22): Reuse / Adapt / Drop

Layout del prototipo: encabezado + **grid bento** (3 KPIs arriba, luego alertas IA / predicciones /
destinos, y un mapa mundial grande abajo).

| Bloque del prototipo | Decisión | Verificación contra la implementación (`ManagerDashboard.tsx`) |
|---|---|---|
| **3 KPIs con chip de ícono + tendencia** | **Reuse → ampliado a 4** | ✅ Implementado como 4 KPIs (`payments`/`analytics`/`flight_takeoff`/`notifications_active`) con el mismo patrón chip+valor `headline-lg`. Mejora sobre el prototipo: el 4º KPI ("Follow-ups vencidos", tono `alert-coral`) conecta con HU-23. Valores reales vía `getDashboardMetrics`/`getOperationsMetrics`, no hardcode. |
| **Tendencia `+14.2% ↑`** | **Drop (correcto)** | El prototipo muestra deltas inventados. La implementación los omite y en su lugar da un `hint` con cifra real (p. ej. "X en cotizaciones abiertas"). Decisión UX acertada: no mostrar tendencias sin histórico real. |
| **Embudo / predicciones de ventas** | **Adapt** | ✅ "Embudo comercial" con barras normalizadas (`shareOfMax`) y color semántico por etapa (GANADO=esmeralda, PERDIDO=coral, resto=secondary). Las "Predicciones IA" del prototipo (texto generado) **no** se portan → bien, no hay modelo de forecast real. |
| **Rendimiento por destino** | **Reuse** | ✅ Lista con barra proporcional; muestra `ganados/leads`. Fiel al bloque "Rendimiento por Destino" del mockup, con datos reales. |
| **Desempeño por asesor** | **Adapt (nuevo)** | ✅ Tabla con tasa de cierre por asesor (no estaba explícita en el prototipo pero encaja en el patrón bento). Responde la pregunta de gestión en <10s. |
| **Próximas salidas** | **Adapt (nuevo)** | ✅ Reemplaza funcionalmente al mapa: lista accionable con enlace a `/viajes/[id]` y "en N d". Mucho más útil que el mapa simulado. |
| **Mapa mundial "Tráfico en Vivo"** | **Drop (por ahora)** | ✅ No portado. Igual que en Sprint 1: es imagen estática + pines `position:absolute` con `animate-ping`, no un mapa real. Decisión correcta; "Próximas salidas" cubre la necesidad real. Documentar como deuda si algún día se quiere mapa funcional (Mapbox/Leaflet). |
| **Toggle "Vista en Vivo / Historial"** | **Drop** | No hay histórico temporal en el backend de métricas → no portar el toggle hasta que exista. |

### Regla de los 10 segundos (criterio de #22) — ✅ cumplida
- Cada tarjeta responde **una sola** pregunta; las cifras van en `headline-lg` en negrita.
- Color semántico consistente (esmeralda=dinero, secondary=conversión, coral=alerta/vencido).
- **Gate por rol:** solo ADMIN/GERENTE ven KPIs; a un asesor se le redirige amablemente al CRM
  y a Viajes (evita exponer métricas sensibles y respeta la regla multi-tenant del `AGENTS.md`).
- **Estados cubiertos:** `loading` (skeleton `animate-pulse` con `aria-busy`), `error`
  (`role="alert"` + botón "Reintentar"), y `ready`. Sin estados muertos.

## 3. Portal del viajero (#19/#20/#21): adaptación mobile-first

No hay HTML fuente dedicado al portal (el prototipo es desktop/agencia). Se adapta el **shell**
y los tokens a una experiencia **mobile-first 390 px**. Auditoría de `TravelerPortal.tsx` y sus hijos:

| Patrón | Decisión | Verificación |
|---|---|---|
| **Hero con saludo + destino + estado** | **Nuevo (mobile-first)** | ✅ "Hola, {nombre}", destino, rango de fechas y `PhaseBadge` dinámico ("Faltan N días" / "Día X de Y" / "Viaje finalizado"). Jerarquía exacta que pide `ux.md`. Blobs decorativos con `aria-hidden`. |
| **Contadores (Actividades/Documentos/Mensajes)** | **Nuevo** | ✅ `<dl>` semántico con 3 stats reales derivadas de los datos cargados. |
| **Navegación inferior de 3 pestañas** | **Nuevo** | ✅ `Itinerario / Documentos / Chat` fija abajo al alcance del pulgar en móvil (`fixed bottom-0`), y en escritorio pasa a pastilla centrada (`md:static md:rounded-full`). Marcada como `<nav aria-label>` con `aria-current="page"` en la pestaña activa. |
| **Itinerario = timeline por día** | **Reuse del patrón timeline** | ✅ `<ol>`/`<li>` con día numerado, línea vertical, hora a la derecha en `<time dateTime>`, lugar con ícono `location_on`. Agrupa por día (`groupItineraryByDay`). Estado vacío explícito. |
| **Documentos = tarjetas por tipo** | **Reuse** | ✅ Ícono según tipo (`documentIcon` por contentType/nombre), `target="_blank"` + `rel="noopener noreferrer"`, `open_in_new`. Estado vacío explícito. |
| **Chat con burbujas** | **Reuse** | ✅ Burbujas propias en `secondary` a la derecha, ajenas a la izquierda; hora relativa (`formatRelativeTime`); autoscroll al último; envío con submit; `maxLength` 4000; estados sending/error. |
| **Acceso por enlace seguro (token)** | **Nuevo** | ✅ Token leído del hash de la URL, guardado en `sessionStorage`, y limpiado de la barra con `replaceState`. Estado "enlace venció" claro. Encaja con el magic-link del backend (#21). |

### Verificación de la regla "mobile-first al alcance del pulgar"
- `pb-24` en móvil reserva espacio para la barra inferior fija (no tapa contenido); `md:pb-8` en escritorio.
- Contenido centrado en `max-w-2xl` → legible tanto en 390 px como en desktop.

## 4. `agentes.html` — referencia (fuera de alcance #19–#22)

`agentes.html` (Centro de Agentes) está listado como **referencia visual**, no como entregable
del sprint. Hallazgos para un futuro sprint si se retoma el "Hub de Soporte de Agentes" que el
dashboard enlaza:
- Reutilizaría el mismo grid bento y el patrón de "Agentes que Requieren Apoyo" ya visto en `index.html`.
- Mismo problema de A11y (ver §5): `alt` presente pero **cero `aria-*`**.
- **No portar en Sprint 3.** El botón "Ir al Hub de Soporte de Agentes" del dashboard debe
  apuntar a `/agentes` (que hoy es placeholder) o quedar deshabilitado para no prometer una pantalla inexistente.

## 5. Criterios de aceptación A11y — estado real (auditado en el código)

**Hallazgo positivo:** a diferencia de `crm.html` (Sprint 1), `index.html` usa `alt` reales en
sus 7 imágenes (0 `data-alt`). Pero **ambos** HTML (`index.html` y `agentes.html`) tienen
**cero atributos `aria-*`** — toda la semántica accesible fue añadida en la migración a React.
Verificación de que eso se cumplió:

Cumplido en la implementación (✅):
- [x] **Estados de carga anunciados:** dashboard con `aria-busy`, chat con `aria-live="polite"`.
- [x] **Errores con `role="alert"`:** dashboard y chat.
- [x] **Pestañas accesibles:** `<nav aria-label>` + `aria-current="page"` en el portal.
- [x] **Inputs con `<label>`:** el input del chat tiene `<label class="sr-only">` asociado por `id`.
- [x] **Botón solo-ícono con `aria-label`:** "Enviar mensaje" en el chat.
- [x] **Tiempo semántico:** `<time dateTime>` en el timeline.
- [x] **Decorativo oculto:** blobs del hero con `aria-hidden`.
- [x] **Listas semánticas:** `<ol>/<li>` en timeline, pipeline, próximas salidas; `<dl>` en stats.
- [x] **Enlaces externos seguros:** documentos con `rel="noopener noreferrer"`.

Revisar / deuda menor (no bloqueante, dejar documentado para pulido pre-entrega):
- [ ] **Foco visible en la barra de pestañas del portal:** los botones de tab no declaran
      `focus-visible:ring`. Teclado funciona, pero el anillo de foco debería ser explícito
      (los botones del dashboard y el chat sí lo manejan). Recomendación: añadir
      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container`.
- [ ] **Topbar del shell dice "Análisis IA"** (ya estandarizado); el prototipo `index.html`
      traía "Análisis AI". Confirmado que el shell usa la forma correcta en español. OK.
- [ ] **Tabla "Desempeño por asesor":** sin `<caption>` ni `scope` en los `<th>`. Para una tabla
      de datos de lectura rápida conviene `scope="col"` en los encabezados (mejora lectores de pantalla).
- [ ] **Contraste de texto sobre el hero en gradiente:** texto blanco sobre
      `from-primary-container via-secondary to-secondary-container`. Verificar el tramo más claro
      (`secondary-container #6063ee`) — blanco sobre ese azul pasa AA, pero validar el rango completo del gradiente.

## 6. Soporte al UAT visual del PO (tarea 3 de `ux.md`)

Checklist para acompañar a Juan Manuel (PO) comparando `apps/web` corriendo (`pnpm dev`) contra
el prototipo. Regla: en conflicto, gana el HTML. Evidencia PNG solo valida.

**Dashboard (#22) — abrir como GERENTE/ADMIN:**
- [ ] Los 4 KPIs se entienden en <10s sin leer ayuda (prueba del vistazo).
- [ ] Color semántico correcto: dinero=esmeralda, alerta=coral.
- [ ] Como asesor (no gerente): se ve el mensaje de redirección, NO los KPIs.
- [ ] Cortar red → aparece el estado de error con "Reintentar"; reintentar recupera.

**Portal del viajero (#19/20/21) — abrir con enlace de token, en móvil (390 px):**
- [ ] La barra de 3 pestañas queda al alcance del pulgar y no tapa contenido.
- [ ] El badge de estado del viaje refleja la fase real (faltan N días / día X de Y / finalizado).
- [ ] Itinerario agrupa por día con hora y lugar; documentos abren en pestaña nueva; chat envía y recibe.
- [ ] Enlace vencido → mensaje claro de "pide uno nuevo", sin pantalla rota.

**Transversal:**
- [ ] Marca consistente (gradiente IA, tipografías Plus Jakarta/Inter) entre agencia y portal.
- [ ] Textos en español, moneda en COP (`formatCop`), fechas en zona `America/Bogota`.

## 7. Verificación de fuente (re-auditoría contra HTML + código)

Chequeado directamente sobre los archivos descargados del repo del prototipo y sobre `apps/web`:
- `tailwind.config` de `index.html` idéntico a Sprints 1–2; sin `fontFamily/fontSize` (como Sprint 1).
- `index.html`: 7 `alt` reales, 0 `data-alt`, **0 `aria-*`** (grep).
- `agentes.html`: 1 `alt`, **0 `aria-*`** (grep); es solo referencia, no se porta.
- Mapa "Tráfico en Vivo" de `index.html`: imagen de fondo + pines absolutos con `animate-ping`
  → no funcional. Correctamente NO portado; sustituido por "Próximas salidas".
- Copy "Análisis AI" (index.html) → el shell en producción usa "Análisis IA" (`Topbar.tsx:53`).
- Implementación del portal/dashboard verificada archivo por archivo (§2–§5): cumple la jerarquía
  y los estados que pide `ux.md`; las desviaciones son mejoras conscientes (4º KPI, próximas salidas).

## 8. Cierre de UX en los tres sprints

- **Sprint 1:** dashboard + CRM auditados; shell/tokens migrados; gaps (Login/Lead detail/Task) escalados.
- **Sprint 2:** cotizador + itinerario auditados; reuse/adapt + A11y + alineación con APIs reales (COP, PDF async).
- **Sprint 3 (este doc):** dashboard gerencial + portal del viajero auditados contra `index.html`
  y verificados contra la implementación; UAT visual del PO soportado.

**Pendientes menores de pulido pre-sustentación (no bloqueantes):** foco visible en tabs del portal,
`scope` en la tabla de asesores, destino del botón "Hub de Soporte de Agentes". Ninguno afecta
las HU cerradas; son mejoras de accesibilidad para dejar la entrega impecable.
