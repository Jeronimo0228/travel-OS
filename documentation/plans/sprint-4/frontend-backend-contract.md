# Contrato Frontend ↔ Backend — pendientes para Samuel

Autor: Santiago Arboleda (Frontend) · Destinatario: Samuel Madrid (Backend)

El frontend ya está **construido y probado** para estas tres funciones, pero oculto detrás de banderas hasta que el API las entregue. Este documento dice exactamente qué espera el frontend, para que conectes sin tocar la UI.

| # | Función | Estado en el API | Bandera del frontend |
|---|---|---|---|
| 1 | Editar y borrar actividades del itinerario | No existe | `NEXT_PUBLIC_FEATURE_ITINERARY_EDIT` |
| 2 | Subir archivos como documentos del viaje | No existe (hoy solo URLs HTTPS) | `NEXT_PUBLIC_FEATURE_DOCUMENT_UPLOAD` |
| 3 | Enviar el enlace del portal por WhatsApp/correo | **Ya resuelto en el frontend** (`wa.me` y `mailto:`) | — |

Nada de esto cambia el comportamiento actual mientras las banderas estén apagadas.

## Reglas comunes (igual que el resto del API)

- Prefijo global `/api`, cookie `httpOnly` con `credentials: include`, `JwtAuthGuard`.
- Alcance por agencia: toda consulta filtra por `agencyId` del token. Una reserva de otra agencia responde **403** (`findAccessibleReservation`, mismo comportamiento que hoy).
- Un **ASESOR** solo opera reservas de leads que tiene asignados; GERENTE y ADMIN, todas las de su agencia.
- Validar con `ZodValidationPipe` y los esquemas de `@travelos/shared` (ya publicados en esta rama).
- Errores: 400 validación, 401 sin sesión, 403 fuera de alcance, 404 recurso inexistente dentro de la agencia.

## 1. Editar y borrar actividades del itinerario

### `PATCH /api/reservations/:id/itinerary/:itemId`

- Cuerpo: `updateItineraryItemSchema` (en `packages/shared/src/schemas/portal.ts`). **Todos los campos son opcionales, pero debe venir al menos uno.**
  - `title`: texto 1–200, **no** se puede borrar.
  - `details`, `location`, `startsAt`, `endsAt`: texto o fecha ISO con zona horaria, o `null` para **borrarlos**.
  - `position`: entero 0–10000.
  - Si vienen `startsAt` y `endsAt`, `endsAt` debe ser posterior (se compara como instante).
- Respuesta `200`: la actividad completa actualizada (misma forma que `POST /itinerary`).
- El frontend envía **solo los campos que cambiaron**. Mover una actividad de día u hora es solo cambiar `startsAt`; no hay endpoint de reordenar, porque dentro de un día el orden es por hora (y luego `position`).
- `404` si `itemId` no pertenece a `:id`.

### `DELETE /api/reservations/:id/itinerary/:itemId`

- Respuesta `204` sin cuerpo (igual que `DELETE /api/tasks/:id`).
- `404` si `itemId` no pertenece a `:id`.

### Auditoría sugerida
`ITINERARY_ITEM_UPDATE` y `ITINERARY_ITEM_DELETE`, con `{ reservationId, itemId }` en el detalle (mismo patrón que `LEAD_DELETE`).

### Pruebas e2e sugeridas (en `portal.e2e-spec.ts`)
1. Editar título y fecha; el viajero ve el cambio en `GET /api/portal/itinerary`.
2. Poner `details: null` y `startsAt: null` limpia los campos.
3. Cuerpo vacío `{}` → 400; `title: null` → 400; `endsAt` anterior a `startsAt` → 400.
4. Otra agencia → 403; actividad de otra reserva → 404.
5. Borrar → 204 y desaparece del itinerario del viajero.
6. Un asesor sin el lead asignado → 403.

## 2. Subir archivos como documentos

### `POST /api/reservations/:id/documents/upload`

- `multipart/form-data` con:
  - `file` (obligatorio): PDF, JPEG o PNG, **máximo 5 MB** (constante compartida `documentUploadLimits` en `@travelos/shared`; el frontend ya valida lo mismo antes de enviar).
  - `name` (opcional, ≤ 200): si falta, usar el nombre del archivo.
- El backend debe validar **el contenido real** (firma/magic bytes), no solo el `Content-Type` ni la extensión.
- Almacenamiento: guardar el archivo en el almacenamiento de objetos del proyecto (hoy Vercel; p. ej. Vercel Blob) y guardar en `ReservationDocument` la URL **HTTPS** resultante, de modo que el portal del viajero siga funcionando sin cambios (`documents` ya devuelve `url`).
- Respuesta `201`: el documento creado, con la misma forma que `POST /documents`: `{ id, reservationId, name, url, contentType, createdAt }`.
- `413` si supera el límite; `415` si el tipo no es permitido; `400` si falta `file`.
- Quien descarga debe poder abrir la URL; si el almacenamiento es privado, devolver una URL firmada de vida corta en `GET /reservations/:id` y `GET /portal/documents`.

### Auditoría sugerida
`RESERVATION_DOCUMENT_UPLOAD` con `{ reservationId, documentId, contentType, size }`.

### Pruebas e2e sugeridas
1. Subir un PDF válido → 201 y aparece en `GET /api/portal/documents`.
2. Un `.exe` renombrado a `.pdf` → 415.
3. Archivo de más de 5 MB → 413.
4. Sin `file` → 400.
5. Otra agencia → 403.

## 3. Enlace del portal por WhatsApp / correo

El frontend ya arma el mensaje y abre `https://wa.me/?text=…` y `mailto:…` con el enlace seguro que devuelve `POST /api/reservations/:id/portal-access`, sin pasar por el backend. No requiere cambios en el API.

Mejora opcional, si más adelante se quiere envío automático desde el servidor (con proveedor de correo/WhatsApp Business): `POST /api/reservations/:id/portal-access/send` con `{ "channel": "EMAIL" | "WHATSAPP" }`. El token solo debe salir en el mensaje; nunca debe quedar en logs (regla ya vigente).

## Cómo activar cada función cuando esté lista

1. Desplegar el endpoint y sus pruebas e2e.
2. En el proyecto web de Vercel, definir la variable y volver a desplegar el web (las variables `NEXT_PUBLIC_*` se incorporan en el build):
   - `NEXT_PUBLIC_FEATURE_ITINERARY_EDIT=true`
   - `NEXT_PUBLIC_FEATURE_DOCUMENT_UPLOAD=true`
3. En local: agregarlas a `apps/web/.env.local`.
4. Verificar en `/viajes/<id>`: aparecen «Editar» y «Eliminar» en cada actividad, y el bloque «Subir archivo» en Documentos.

## Qué ya está hecho y probado en el frontend

- Fetchers: `updateItineraryItem`, `deleteItineraryItem`, `uploadTripDocument` (`apps/web/src/lib/reservations.ts`).
- Lógica pura con pruebas: `lib/trip-editing.ts` (valores del formulario y cálculo de los campos que cambiaron), `lib/document-upload.ts` (validación de archivo), soporte de `FormData` en `api-client.ts`.
- Esquemas compartidos con pruebas: `updateItineraryItemSchema` y `documentUploadLimits` (`apps/api/src/portal/portal.schema.spec.ts`).
- Interfaz: `ItineraryItemActions` (editar/borrar con confirmación) y `DocumentUpload`.
