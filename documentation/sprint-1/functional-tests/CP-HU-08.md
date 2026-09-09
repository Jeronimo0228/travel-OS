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
- **Cuando** lo mueve (drag-and-drop) a Cotización
- **Entonces** el stage persiste vía `PUT /api/leads/:id` y se refleja en UI

### AC-03
- **Dado** pipeline del tenant A
- **Cuando** usuario B lo consulta
- **Entonces** no ve leads de A

## Casos de prueba

### CP-08-01 — Ver pipeline
- **AC relacionado:** AC-01
- **Precondiciones:** Leads en ≥2 stages
- **Pasos:** Abrir CRM → Pipeline por etapas
- **Resultado esperado:** Columnas visibles con conteos y cards
- **Resultado ejecución:** ✅ 2026-09-08

### CP-08-02 — Mover stage (DnD)
- **AC relacionado:** AC-02
- **Precondiciones:** Lead en Prospecto
- **Pasos:** Arrastrar card a columna Cotizando; refresh
- **Resultado esperado:** Stage actualizado
- **Resultado ejecución:** ✅ 2026-09-08

### CP-08-03 — Aislamiento pipeline
- **AC relacionado:** AC-03
- **Precondiciones:** Tenants A/B
- **Pasos:** Login B
- **Resultado esperado:** Sin leads A
- **Resultado ejecución:** ✅ 2026-09-08
