# HU-08: Pipeline visual por stages

**Issue:** #8  
**Historia:** Pipeline visual por stages

## Criterios de aceptación

### AC-01
- **Dado** leads en distintas etapas
- **Cuando** el asesor abre el pipeline
- **Entonces** ve columnas/stages con sus leads

### AC-02
- **Dado** un lead en stage Prospecto
- **Cuando** lo mueve a Cotización
- **Entonces** el stage persiste y se refleja en UI

### AC-03
- **Dado** pipeline del tenant A
- **Cuando** usuario B lo consulta
- **Entonces** no ve leads de A

## Casos de prueba

### CP-08-01 — Ver pipeline
- **AC relacionado:** AC-01
- **Precondiciones:** Leads en ≥2 stages
- **Pasos:** Abrir vista pipeline
- **Resultado esperado:** Stages visibles con conteos
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-08-02 — Mover stage
- **AC relacionado:** AC-02
- **Precondiciones:** Lead en Prospecto
- **Pasos:** Drag/select a Cotización; refresh
- **Resultado esperado:** Stage actualizado
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-08-03 — Aislamiento pipeline
- **AC relacionado:** AC-03
- **Precondiciones:** Tenants A/B
- **Pasos:** Login B
- **Resultado esperado:** Sin leads A
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

