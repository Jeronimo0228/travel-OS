# HU-12: Asignación de lead a asesor

**Issue:** #12  
**Historia:** Asignación de lead a asesor

## Criterios de aceptación

### AC-01
- **Dado** un gerente/admin y dos asesores
- **Cuando** asigna un lead al asesor X
- **Entonces** el lead queda con owner X

### AC-02
- **Dado** un lead asignado a X
- **Cuando** X lista 'mis leads'
- **Entonces** aparece el lead

### AC-03
- **Dado** reasignación
- **Cuando** se cambia owner a Y
- **Entonces** X deja de verlo en 'mis leads' y Y lo ve

## Casos de prueba

### CP-12-01 — Asignar lead
- **AC relacionado:** AC-01
- **Precondiciones:** Gerente + asesores
- **Pasos:** Asignar lead a X
- **Resultado esperado:** ownerId = X
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-12-02 — Mis leads
- **AC relacionado:** AC-02
- **Precondiciones:** Lead asignado a X
- **Pasos:** Login X; filtro mis leads
- **Resultado esperado:** Lead visible
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-12-03 — Reasignar
- **AC relacionado:** AC-03
- **Precondiciones:** Lead en X
- **Pasos:** Asignar a Y; verificar ambos listados
- **Resultado esperado:** Solo Y lo ve como propio
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

