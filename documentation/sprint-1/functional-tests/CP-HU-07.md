# HU-07: Crear y editar leads

**Issue:** #7  
**Historia:** Crear y editar leads

## Criterios de aceptación

### AC-01
- **Dado** un asesor autenticado
- **Cuando** crea un lead con datos mínimos válidos
- **Entonces** el lead queda en su tenant y aparece en el listado

### AC-02
- **Dado** un lead existente
- **Cuando** edita nombre/contacto/etapa
- **Entonces** los cambios persisten

### AC-03
- **Dado** datos inválidos
- **Cuando** intenta crear lead
- **Entonces** validación impide el guardado

### AC-04
- **Dado** lead del tenant A
- **Cuando** usuario del tenant B intenta editarlo
- **Entonces** 403/404

### AC-05
- **Dado** un lead creado
- **Cuando** se consulta su detalle
- **Entonces** muestra campos acordados (nombre, contacto, origen, stage)

### AC-06 — Eliminar lead
- **Dado** un lead del propio tenant (y alcance RBAC del actor)
- **Cuando** lo elimina
- **Entonces** responde 204 y el lead desaparece del listado; queda auditado como `LEAD_DELETE`
- **Y** un usuario de otro tenant recibe 403/404 y el lead no se borra

## Casos de prueba

### CP-07-01 — Crear lead
- **AC relacionado:** AC-01
- **Precondiciones:** Asesor login
- **Pasos:** Nuevo lead; guardar
- **Resultado esperado:** Lead en listado del tenant
- **Resultado ejecución:** ✅ 2026-09-08

### CP-07-02 — Editar lead
- **AC relacionado:** AC-02
- **Precondiciones:** Lead existe
- **Pasos:** Cambiar teléfono; guardar; recargar
- **Resultado esperado:** Valor actualizado
- **Resultado ejecución:** ✅ 2026-09-08

### CP-07-03 — Validación
- **AC relacionado:** AC-03
- **Precondiciones:** Formulario
- **Pasos:** Guardar sin nombre
- **Resultado esperado:** Error; no create
- **Resultado ejecución:** ✅ 2026-09-08

### CP-07-04 — Aislamiento lead
- **AC relacionado:** AC-04
- **Precondiciones:** Lead en A
- **Pasos:** API edit desde B
- **Resultado esperado:** 403/404
- **Resultado ejecución:** ✅ 2026-09-08

### CP-07-05 — Detalle lead
- **AC relacionado:** AC-05
- **Precondiciones:** Lead creado
- **Pasos:** Abrir detalle
- **Resultado esperado:** Campos visibles correctos
- **Resultado ejecución:** ✅ 2026-09-08

### CP-07-06 — Eliminar lead (owner)
- **AC relacionado:** AC-06
- **Precondiciones:** Lead propio
- **Pasos:** DELETE /api/leads/:id (o botón Eliminar en CRM)
- **Resultado esperado:** 204; lead ausente; audit LEAD_DELETE
- **Resultado ejecución:** ✅ 2026-09-08

### CP-07-07 — Eliminar lead (cross-tenant)
- **AC relacionado:** AC-06
- **Precondiciones:** Lead en tenant A
- **Pasos:** DELETE desde tenant B
- **Resultado esperado:** 403/404; lead intacto
- **Resultado ejecución:** ✅ 2026-09-08

