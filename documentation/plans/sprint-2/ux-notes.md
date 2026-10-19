# UX Notes — Sprint 2 (Juan José Palacio Zuluaga)

Fuentes auditadas: `cotizador.html` (Cotizador en Lenguaje Natural) e `itinerario.html`
(Constructor de Itinerarios) del repo
[nickamam08/TravelOS-AI-Ecosystem](https://github.com/nickamam08/TravelOS-AI-Ecosystem).
En conflicto, gana el HTML sobre el PNG (regla del proyecto).

Continúa el handoff de [`../sprint-1/ux-notes.md`](../sprint-1/ux-notes.md) §5.
Cubre las tareas del plan [`ux.md`](./ux.md) y da la fuente visual de verdad a Frontend
para los issues **#14** (opciones de cotización comparables) y **#16** (constructor día a día),
más el apoyo a **#13** (prompt del cotizador).

## 0. Estado actual en `apps/web` (punto de partida real)

Ambas pantallas existen hoy solo como placeholder `ComingSoonPage`:

- `apps/web/src/app/cotizador/page.tsx` → "Coming Soon".
- `apps/web/src/app/itinerario/page.tsx` → "Coming Soon".

Lo que **sí** está listo para reusar (migrado en Sprint 1, no re-hacer):

- Tokens de diseño centralizados en `apps/web/src/app/globals.css` (misma paleta embebida
  en los `tailwind.config` de ambos HTML — ya verificado idéntica).
- Shell: `AppShell`, `Sidebar`, `Topbar`, `AiAssistantWidget`, `Avatar`, `nav-items.ts`.
  El sidebar de `nav-items.ts` ya incluye las rutas `/cotizador` (icon `chat_bubble`) e
  `/itinerario` (icon `map`), que coinciden con el nav de ambos prototipos.
- Utilidades CSS ya portadas: `.glass-ai`, `.ai-pulse`, `.custom-scrollbar`,
  `.material-symbols-outlined`.

**Consecuencia para Frontend:** NO re-portar sidebar, topbar ni el botón flotante de IA.
El prototipo de Sprint 2 los repite (ligeramente distintos), pero el componente compartido
ya existe. Ver §4 (deltas a reconciliar).

> **Nota de rutas:** `frontend.md` propone `app/(agency)/cotizador/**` y
> `app/(agency)/itinerarios/**`. Hoy las rutas vivas son `app/cotizador` y `app/itinerario`
> (singular, sin route group) y así están en `nav-items.ts`. Si Frontend mueve a un route
> group `(agency)`, debe actualizar `nav-items.ts` y los `href` para no romper el nav.
> Recomiendo decidirlo con SM antes de empezar; UX no bloquea ninguna de las dos.

## 1. Tokens — sin cambios respecto a Sprint 1

Los `<script id="tailwind-config">` de `cotizador.html` e `itinerario.html` son **idénticos**
a los de `index.html`/`crm.html` (misma paleta, radios y spacing semántico).
No hay tokens nuevos que centralizar. Tokens adicionales usados solo como clases sueltas
(no en el config), que Frontend debe mapear a los tokens del tema en vez de copiar hex/clases Tailwind crudas:

| Visto en el prototipo | Dónde | Mapear a |
|---|---|---|
| Gradiente IA `from-indigo-500 to-cyan-500` | botón "Nuevo Itinerario", botón flotante IA | `secondary` → `tertiary-fixed-dim` (mismo gradiente ya usado en `AiAssistantWidget`) |
| `bg-indigo-50` / `border-indigo-100` | botón "Análisis IA" (itinerario) | contenedor suave sobre `secondary` (definir utilidad, no hex crudo) |
| `from-indigo-50/30 to-cyan-50/30` | card "Sugerencia IA" (itinerario) | variante de `.glass-ai` / superficie IA |

**Reusar también las keyframes ya portadas:** el cotizador define `.shimmer` + `.ai-pulse` y
el itinerario `.ai-shimmer` + `.timeline-line`. `.ai-pulse` y el scrollbar ya existen en
`globals.css`; `.shimmer`/`.ai-shimmer` (skeleton de "IA Analizando") y `.timeline-line`
(línea vertical del timeline) **faltan** y hay que portarlas una sola vez a `globals.css`.

## 2. `cotizador.html` — inventario de bloques (Reuse / Adapt / Drop)

Layout: dos columnas dentro del shell — izquierda **chat del cotizador** (`w-2/5`), derecha
**lienzo de propuesta en vivo** (`flex-1`, scrollable).

| Bloque | Decisión | Notas para Frontend / enlace con backend |
|---|---|---|
| **Panel de chat (stream)** | **Reuse** | Mensajes bot/usuario, estado "IA Analizando…" con skeleton `.shimmer`. Alimenta el prompt de **#13** → `POST /quotes { prompt, leadId? }`. El estado "thinking" se muestra mientras el request está pendiente. |
| **Textarea + chips de sugerencia** | **Reuse** | Textarea con botón `send`; 3 chips ("Añadir clase ejecutiva", "Actividades cercanas", "Comparar con Tulum") son *quick-prompts* que rellenan el textarea. Chips como data, no hardcode. `aria-label` en el botón `send`. |
| **Header de propuesta + badge estado** | **Adapt** | "Borrador de Propuesta: …" + badge "Objetivo de Presupuesto Cumplido" + "Actualizado hace 2 min". El badge debe derivar de datos reales de la quote (¿total ≤ presupuesto?), no ser fijo. El timestamp, de `updatedAt`. |
| **Botones "Generar PDF" / "Enviar al Viajero"** | **Adapt** | **Regla dura del plan:** NO generar PDF en el cliente. "Generar PDF" → `POST /quotes/:id/pdf` (async, BullMQ) y luego `GET /quotes/:id/pdf` con estado (polling / loading). El botón necesita estados: idle → generando → listo (descargar). "Enviar al Viajero" queda fuera de alcance del backend actual (no hay endpoint) → marcar como **deshabilitado / próximamente** o escalar a backend. |
| **Widget "Vuelos Recomendados"** | **Drop (por ahora)** | El backend de Sprint 2 cotiza **hoteles y actividades** del catálogo (`/catalog?kind=HOTEL`), no vuelos. No hay fuente de datos de vuelos. Portar como bloque opcional vacío o no portarlo hasta que exista inventario de vuelos. Documentar como gap de producto. |
| **"Selecciones IA de Alojamiento" (card con imagen)** | **Reuse** | Este es el corazón de **#14**: opciones comparables. El prototipo muestra 1 hotel; el backend devuelve **2–3 alternativas** (`POST /quotes` → alternativas con total estimado en COP). Portar como lista/grid de `QuoteOptionCard` comparables, no una sola. Precio en **COP** (prototipo dice "$2,140 total" en USD → localizar a COP). |
| **"Borrador de Itinerario" (mini timeline)** | **Adapt** | Timeline resumido Día 1–3 con estado (confirmado vs "Esperando confirmación"). Es una **vista previa**; el builder completo vive en `itinerario.html`. Reusar el patrón visual de nodo/línea pero compartir estilos con el timeline grande (§3). |
| **"% de Precisión en la Cotización" (glass panel)** | **Adapt** | "92% de Precisión" + "Inventario Sincronizado en Vivo". El % debe venir de la respuesta de IA si existe; si el backend no expone un score de confianza, **no inventar el número** — ocultar el bloque o mostrar un estado neutro. Escalar a backend si se quiere el score real. |

### Moneda / localización (bloqueante de contenido para #14)
El prototipo usa dólares (`$620/pers.`, `$4k total`, `$2,140 total`). El backend entrega
**totales estimados en COP**. Frontend debe formatear en COP (p. ej. `Intl.NumberFormat('es-CO')`)
y UX debe validar que ningún texto quede en USD. No es solo estético: cambia el significado.

## 3. `itinerario.html` — inventario de bloques (Reuse / Adapt / Drop)

Layout: tres columnas dentro del shell — **Biblioteca** (`w-80`), **Timeline** (`flex-1`),
**Mapa** (`w-[400px]`).

| Bloque | Decisión | Notas para Frontend / enlace con backend |
|---|---|---|
| **Biblioteca de actividades (izquierda)** | **Reuse** | Tabs Global/Guardados/Socio, categorías (Restaurantes, Experiencias), cards arrastrables (`.drag-handle`) con imagen+nombre+ubicación+badge "Mejor Valorado". Fuente de datos = `GET /catalog` (kind HOTEL/ACTIVITY, por agencia). Tabs y categorías como data. |
| **Botón "Actividad Personalizada"** | **Reuse** | CTA de borde punteado al final de la biblioteca → abre form de ítem custom. |
| **Header del builder** | **Adapt** | Título del viaje + badge "7 Días" + cliente/fechas. Debe venir del itinerario real; fechas del prototipo ("12 Oct - 19 Oct, 2024") son placeholder. |
| **"Previsualizar App" / "Publicar Viaje"** | **Adapt** | No hay endpoint de itinerarios en el backend de Sprint 2 (`backend.md` lista `src/itineraries/**` como alcance, pero la sección "API delivered" solo confirma quotes/catalog/PDF). **Verificar con Samuel** si existe API de itinerarios; si no, #16 es UI sobre estado local/mock hasta que llegue. Marcar como dependencia. |
| **Timeline día a día (centro)** | **Reuse** | Es **#16**. Nodos numerados por día, línea vertical (`.timeline-line`), cards de actividad con hover-actions (editar/eliminar), y **drop zones** ("Arrastra una actividad aquí"). Compartir estilos de timeline con la mini-vista del cotizador (§2). |
| **Card "Sugerencia IA" dentro de un día** | **Reuse** | Bloque `.ai-shimmer` con recomendación + "Añadir a la línea de tiempo" / "Ver Detalles". Buen patrón `AiSuggestionCard`. El texto usa `**markdown**` en el HTML (`**Tour Matutino…**`) → renderizar como negrita real, no literal. |
| **Drag & drop** | **Adapt** | El prototipo solo simula feedback visual (`dragstart`/`dragend` togglean opacidad). La reordenación real (DnD entre días / desde biblioteca) hay que implementarla de verdad (p. ej. dnd-kit). UX: mantener `.drag-handle` como asa visible y accesible por teclado. |
| **Mapa interactivo (derecha)** | **Drop / simplificar en MVP** | Igual que el mapa del dashboard en Sprint 1: es **imagen estática** + pines `position:absolute` + polyline SVG simulada. No es un mapa real. Para MVP: no portar como mapa funcional; dejar placeholder o integrar librería real (Mapbox/Leaflet) solo si el sprint lo prioriza. Los marcadores comunican estado **solo por color** → necesitan texto/aria alternativo si se conserva. |
| **Card ETA flotante + barra "Optimización" (Dist/Tránsito/Densidad)** | **Drop (por ahora)** | Dependen de datos de ruteo/mapa que no existen en backend. No portar como números reales; si se conservan visualmente, marcarlos claramente como simulados o esperar API. |
| **Botón flotante asistente IA** | **Drop (usar el compartido)** | Ya existe `AiAssistantWidget`. **Ojo:** el prototipo lo posiciona en `right-[420px]` (para no taparse con el panel de mapa de 400px); el componente actual es `right-6`. Decidir si el widget se corre cuando hay panel derecho (ver §4). |

## 4. Deltas del shell a reconciliar (prototipo vs. componente ya migrado)

El shell ya está en `apps/web`; el prototipo de Sprint 2 trae variaciones que **no** deben
regenerar componentes nuevos, solo ajustar los existentes:

- **Copy "Análisis IA":** consistente en ambos HTML de Sprint 2 (ya estandarizado en Sprint 1). OK.
- **Usuario del topbar:** `cotizador.html` muestra solo avatar; `itinerario.html` añade
  "Alex Rivera / Agente Senior". Usar el patrón con nombre+rol (viene de la sesión real), no el hardcode.
- **Botón "Nuevo Itinerario":** aparece en el sidebar del cotizador (sólido `secondary`) y en el
  del itinerario (gradiente indigo→cyan). Elegir **una** variante para el `Sidebar` compartido
  (recomiendo la sólida `secondary`, consistente con el resto de CTAs del sistema).
- **Botón flotante de IA con panel derecho:** en itinerario está desplazado a `right-[420px]`.
  Si se conserva el panel de mapa, el `AiAssistantWidget` debería aceptar un offset o el layout
  reservar el espacio, para que no se solapen. UX: aceptable dejarlo en `right-6` si el mapa se
  simplifica/elimina en MVP.
- **`<main>` height:** cotizador usa `h-screen`/`overflow-hidden` con columnas internas
  scrollables; itinerario usa `h-[calc(100vh-64px)]`. Ambas pantallas son **layout denso sin
  scroll de página** (el scroll vive dentro de cada panel). Respetar eso al portar.

## 5. Criterios de aceptación A11y para los PRs de Frontend (#13 #14 #16)

Bloqueantes (no aprobar PR sin resolver):
- [ ] **`data-alt` → `alt` real.** Confirmado como bug heredado: el prototipo usa `data-alt`
      en TODAS las imágenes de contenido (hoteles, actividades, avatares, mapa). `data-alt`
      no es texto alternativo. Verificado por grep sobre ambos HTML: **cero** atributos `alt`
      válidos salvo la imagen del mapa de `itinerario.html`. Al migrar a `next/image` usar `alt`
      descriptivo (o `alt=""` si es decorativa, p. ej. el fondo del mapa).
- [ ] **Botones solo-ícono con `aria-label`:** `send` (chat y textarea), `more_horiz` (día),
      `edit`/`delete` (card de actividad), `notifications`, `layers`/`directions`/`my_location`
      y zoom `+`/`−` del mapa, `add_circle` de drop zone. El prototipo tiene **cero** `aria-*`
      (confirmado por grep).
- [ ] **Inputs con `<label>`:** la búsqueda del topbar y el input "Tokio, Japón" del mapa solo
      tienen `placeholder`/`value`. El textarea del cotizador solo tiene `placeholder`. Añadir
      label asociado (visualmente oculto con `sr-only` si hace falta).
- [ ] **Drag & drop accesible:** la reordenación del timeline (#16) no puede depender solo del
      ratón. Proveer alternativa por teclado (mover arriba/abajo) y `aria` apropiado. El prototipo
      no cubre esto en absoluto.
- [ ] **Markdown en texto de IA:** el `**texto**` de la sugerencia IA debe renderizar como
      `<strong>`, no mostrarse literal con asteriscos.

No bloqueantes / revisar:
- [ ] **Estado de carga del cotizador:** el skeleton "IA Analizando…" debe anunciarse a lectores
      de pantalla (`aria-live="polite"`), no solo animarse visualmente.
- [ ] **Pines del mapa por color:** si se conserva el mapa, los marcadores (hotel/restaurante)
      diferencian por color sin texto → añadir etiqueta/aria.
- [ ] **Foco visible** en cards arrastrables, chips de sugerencia y filas de la biblioteca
      (el prototipo no define `focus-visible`; no asumir default del navegador).
- [ ] **Contraste del texto sobre imágenes:** el nombre del hotel va en blanco sobre foto con
      gradiente `from-black/60`. Verificar contraste real sobre la imagen más clara posible.

## 6. Verificación de fuente (re-auditoría contra HTML)

Hallazgos chequeados directamente sobre los dos HTML descargados del repo (no suposiciones):
- `tailwind.config` embebido **idéntico** a Sprint 1 en ambos archivos (misma paleta/radios/spacing).
- `data-alt` en vez de `alt`: confirmado en todas las imágenes de contenido de ambos archivos;
  única `alt` real es la del fondo del mapa (`alt="Tokyo Map"`) en `itinerario.html`.
- Cero atributos `aria-*` en ambos archivos: confirmado.
- Vuelos: `cotizador.html` los muestra, pero el backend de Sprint 2 solo cotiza catálogo
  HOTEL/ACTIVITY → gap de datos real, no estético.
- Mapa de `itinerario.html`: imagen + pines absolutos + `<svg>` con polyline simulada → no es
  mapa funcional. Mismo patrón "mock" señalado en el dashboard de Sprint 1.
- Precios en USD en el prototipo vs. totales en COP del backend → bloqueante de localización para #14.
- `**markdown**` literal en la sugerencia IA de `itinerario.html` (Día 2).

## 7. Handoff a Frontend

- **Fuente visual de verdad** para #14 y #16: estos dos HTML (gana HTML sobre PNG).
- **Reusar**, no recrear: shell, tokens, `AiAssistantWidget`, scrollbar, `.ai-pulse`.
- **Portar una sola vez** a `globals.css`: `.shimmer`/`.ai-shimmer` y `.timeline-line`.
- **Conectar a backend real** (no mock) donde exista: `POST /quotes`, `GET /catalog`,
  `POST|GET /quotes/:id/pdf`, `PUT /quotes/:id/lead`. PDF siempre vía API async, nunca cliente.
- **Dependencias a confirmar con backend (Samuel):** API de itinerarios (#16), "Enviar al Viajero",
  score de confianza de la cotización, inventario de vuelos.
- **Decisiones de producto a escalar a SM/PO:** mapa real vs. simplificado; route group `(agency)`;
  alcance de drag & drop en el MVP.
