# HU-05: Auditoría de acciones sensibles

**Issue:** #5  
**Historia:** Auditoría de acciones sensibles

## Criterios de aceptación

### AC-01
- **Dado** un usuario autenticado
- **Cuando** realiza una acción sensible (login fail masivo, cambio rol, delete lead)
- **Entonces** queda un registro de auditoría con actor, acción, timestamp y agencyId

### AC-02
- **Dado** registros de auditoría del tenant A
- **Cuando** un usuario del tenant B consulta auditoría
- **Entonces** no ve eventos de A

### AC-03
- **Dado** un admin
- **Cuando** lista auditoría filtrada por tipo
- **Entonces** obtiene resultados coherentes

## Casos de prueba

### CP-05-01 — Evento auditado
- **AC relacionado:** AC-01
- **Precondiciones:** Usuario autenticado
- **Pasos:** Ejecutar acción sensible; consultar audit log
- **Resultado esperado:** Evento presente con metadata mínima
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-05-02 — Aislamiento audit
- **AC relacionado:** AC-02
- **Precondiciones:** Eventos en A y B
- **Pasos:** Listar audit como B
- **Resultado esperado:** Solo eventos B
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-05-03 — Filtro audit
- **AC relacionado:** AC-03
- **Precondiciones:** Varios tipos de evento
- **Pasos:** Filtrar por action=ROLE_CHANGE
- **Resultado esperado:** Solo ese tipo
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

