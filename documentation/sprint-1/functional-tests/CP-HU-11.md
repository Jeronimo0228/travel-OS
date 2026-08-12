# HU-11: Listado y filtros de clientes

**Issue:** #11  
**Historia:** Listado y filtros de clientes

## Criterios de aceptación

### AC-01
- **Dado** varios clientes/leads en el tenant
- **Cuando** el asesor abre el listado
- **Entonces** ve resultados paginados o scroll según diseño

### AC-02
- **Dado** listado con muchos registros
- **Cuando** aplica filtro por nombre/stage/asesor
- **Entonces** solo ve coincidencias

### AC-03
- **Dado** filtro sin resultados
- **Cuando** aplica criterio imposible
- **Entonces** estado vacío claro

## Casos de prueba

### CP-11-01 — Listar clientes
- **AC relacionado:** AC-01
- **Precondiciones:** ≥5 leads
- **Pasos:** Abrir listado
- **Resultado esperado:** Lista renderizada del tenant
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-11-02 — Filtrar
- **AC relacionado:** AC-02
- **Precondiciones:** Datos variados
- **Pasos:** Filtrar por stage=Cotización
- **Resultado esperado:** Solo ese stage
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-11-03 — Vacío
- **AC relacionado:** AC-03
- **Precondiciones:** Filtro sin match
- **Pasos:** Buscar texto inexistente
- **Resultado esperado:** Empty state
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

