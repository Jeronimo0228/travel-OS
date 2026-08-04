# UX Notes — Sprint 1 (Juan José Palacio Zuluaga)

Fuente auditada: `index.html` (Panel de Control) y `crm.html` (CRM Inteligente) del repo
[nickamam08/TravelOS-AI-Ecosystem](https://github.com/nickamam08/TravelOS-AI-Ecosystem).
En conflicto, gana el HTML sobre el PNG (regla del proyecto).

## 1. Tokens (Tailwind config embebido)

Ambos archivos comparten la misma paleta de colores (copiada literal en los dos `<script id="tailwind-config">`).
Frontend debe centralizarla en `apps/web/tailwind.config` / `globals.css` una sola vez.

| Token | Hex | Uso visto en el prototipo |
|---|---|---|
| `primary` | `#000000` | Sidebar, botones oscuros, texto principal |
| `secondary` | `#4648d4` | Acciones primarias, active state del nav, links |
| `secondary-container` | `#6063ee` | Botón CTA "Nuevo Itinerario" |
| `success-emerald` | `#10B981` | Métricas positivas, badge "Ganado", sentimiento feliz |
| `alert-coral` | `#F43F5E` | Alertas críticas, sentimiento negativo, notificación |
| `tertiary-fixed-dim` | `#4cd7f6` | Gradientes IA (junto con `secondary`) |
| `surface` / `background` | `#f7f9fb` | Fondo general |
| `surface-container-lowest` | `#ffffff` | Cards |
| `surface-container` / `-low` / `-high` | `#eceef0` / `#f2f4f6` / `#e6e8ea` | Fondos secundarios, hover |
| `outline-variant` | `#c6c6cd` | Bordes de card |
| `on-surface-variant` | `#45464d` | Texto secundario |
| `data-table-header` | `#F1F5F9` | Header de tabla CRM |

Radios: `DEFAULT 0.25rem`, `lg 0.5rem`, `xl 0.75rem`, `full 9999px`.
Spacing semántico: `container-margin 24px`, `gutter 16px`, `card-padding 20px`, `section-gap 40px`.

**Hallazgo (bloqueante para FE):** `crm.html` define `fontFamily` y `fontSize` completos (Plus Jakarta Sans
para headlines, Inter para body/label, escala `body-sm→display-lg`) dentro de su `tailwind.config`.
`index.html` **no** define esos mismos bloques, aunque usa las mismas clases (`font-headline-xl`,
`text-headline-lg`, etc.). Al portar a Next.js hay que tomar el config de `crm.html` como fuente única de
verdad de tipografía — si no, las clases en la pantalla de dashboard no resuelven a nada.
Además, los tamaños están en `px` fijos (`"32px"`); recomendado pasarlos a `rem` al migrar, por zoom/accesibilidad.

## 2. Inventario de componentes — Reuse / Adapt / Drop

| Bloque | Dónde aparece | Decisión | Notas para Frontend |
|---|---|---|---|
| **Sidebar** | index.html (`<aside>`), crm.html (`<nav>`) | **Adapt** | Mismo diseño visual, distinta etiqueta HTML y clases (`aside` vs `nav`, orden de flex distinto). Unificar en un solo componente `Sidebar` con la lista de items como prop; usar `<nav>` semánticamente. |
| **Topbar / búsqueda** | Ambos | **Adapt** | index.html aplica `ml-64` directo al `<header>`; crm.html envuelve todo en un `<div class="ml-64">` y el header es full-width dentro. Usar el patrón de crm.html (más limpio para layout con `<main>` debajo). Unificar copy: dice "Análisis AI" en un lado y "Análisis IA" en el otro — estandarizar a **"Análisis IA"** (español). |
| **KPI cards (dashboard)** | index.html | **Reuse** | 3 cards con ícono en chip de color, badge de tendencia (`+14.2%` / `trending_up`), valor grande, barra de progreso o mini-sparkline. Buen candidato a componente `KpiCard` con variante `progress` / `sparkline`. |
| **KPI cards (CRM)** | crm.html | **Adapt** | Grid 2x2 más simple (sin ícono, sin barra). Es visualmente otro componente aunque cumple el mismo rol. Definir **un solo** `KpiCard` con size `compact` / `full` en vez de mantener dos implementaciones. |
| **Funnel de ventas** | crm.html | **Reuse** | 4 etapas (Prospectos → Cotizando → Cierre → Ganados), % superpuesto y última barra con fondo oscuro. Portar tal cual como `SalesFunnel`, valores/labels como props (hoy están hardcodeados). |
| **Tabla CRM + sentimiento** | crm.html | **Reuse** | Fila con avatar+nombre+segmento, badge de estado, tipo de viaje, ícono+score de sentimiento, próxima acción, botón de acciones. Separar en `DataTable` + `StatusBadge` + `SentimentIndicator`. |
| **Badges de estado** | crm.html | **Reuse** | 3 variantes vistas: `Cotizando` (indigo claro), `Prospecto` (gris neutro), `Ganado` (verde sólido). Mapear a un solo componente `StatusBadge` con `variant` en vez de clases sueltas repetidas. |
| **Asistente IA flotante** | Ambos (casi idéntico, con ids distintos) | **Reuse** | Botón flotante + drawer glassmorphism con historial de chat e input. Está duplicado con markup ligeramente distinto entre páginas — consolidar en un solo `AiAssistantWidget` compartido. |
| **Mapa / tráfico en vivo** | index.html | **Drop (por ahora)** | Es una imagen estática con pines simulados vía `position: absolute`, no un mapa real. No migrar tal cual; si Sprint 2+ necesita mapa real, evaluar librería (Mapbox/Leaflet) en vez de portar este mock. |
| **Recomendaciones IA / Co-Piloto** | crm.html | **Reuse** | Card oscura con lista de sugerencias accionables (contactar, riesgo de churn, oportunidad). Buen patrón para `AiRecommendationCard`. |

## 3. Flujo auditado: Login → CRM → Lead detail → Task

El prototipo **no incluye** pantalla de Login, vista de detalle de lead, ni vista de tarea — el flujo que
pide el plan de Sprint 1 solo existe parcialmente en el shell:

- **Login:** no existe en el prototipo. Frontend necesita diseñar una pantalla simple reusando los mismos
  tokens (fondo `background`, card `surface-container-lowest`, botón `secondary`) — no hay HTML fuente que migrar.
- **CRM:** cubierto por `crm.html` (tabla + funnel + KPIs), listo para portar.
- **Lead detail:** no existe como pantalla. Cada fila de la tabla solo tiene un botón `more_horiz` sin
  destino definido. Hay que decidir con PO si es modal o página nueva antes de que Frontend la implemente.
- **Task:** no existe. Ninguna de las dos pantallas modela una tarea o "to-do" concreto — el "Nuevo Itinerario"
  es el CTA más cercano, pero abre un flujo distinto (itinerarios, no tareas).

**Acción:** escalar a Jerónimo (SM) / PO estos 3 gaps (Login, Lead detail, Task) antes de que Frontend/Backend
empiecen esas pantallas — no hay mockup que gobernar, se estaría diseñando desde cero.

## 4. Criterios de aceptación A11y para PRs de Frontend

Bloqueantes (no aprobar PR sin resolver):
- [ ] Todas las imágenes con contenido informativo usan `alt` real. **Bug detectado:** en `crm.html` los avatares
      de la tabla usan `data-alt="..."` en vez de `alt="..."` — eso equivale a no tener alt text. Verificar que
      esto no se replique en React.
- [ ] Botones solo-ícono (campana de notificaciones, cerrar drawer del chat, `more_horiz`, lupa de búsqueda)
      tienen `aria-label`.
- [ ] El input de búsqueda tiene un `<label>` asociado (visualmente oculto si se quiere); hoy solo tiene
      `placeholder`, que no es un label válido.
- [ ] El botón que abre/cierra el drawer del asistente IA expone `aria-expanded` y `aria-controls`.

No bloqueantes / revisar:
- [ ] Contraste de `on-primary-container` (`#7c839b`) sobre fondo `primary` (`#000000`) en el sidebar —
      validar con herramienta de contraste (parece bajo para texto pequeño).
- [ ] Los pines del mapa (`index.html`) comunican estado solo por color (sin texto ni patrón) — si se
      reemplaza por mapa real, agregar alternativa textual/iconográfica.
- [ ] Foco visible (`focus-visible`) en links del sidebar y filas de la tabla — no está definido explícitamente
      en el CSS del prototipo, Frontend debe añadirlo al migrar a React (no asumir que el navegador lo resuelve solo).

## 5. Handoff a Sprint 2

Pendiente de auditar con el mismo formato: `cotizador.html` (AI Quoter) e `itinerario.html` (Itinerary builder).
No se tocan en este sprint.
