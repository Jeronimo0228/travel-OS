# HU-06: Healthcheck y CI base

**Issue:** #6  
**Historia:** Healthcheck y CI base

## Criterios de aceptación

### AC-01
- **Dado** la API en ejecución
- **Cuando** se consulta /health
- **Entonces** responde 200 con estado ok (y dependencia DB si aplica)

### AC-02
- **Dado** un pull request al repo
- **Cuando** se dispara GitHub Actions
- **Entonces** el pipeline lint/test/build corre

### AC-03
- **Dado** el pipeline en rojo
- **Cuando** se intenta mergear a main sin bypass
- **Entonces** el merge queda bloqueado por branch protection (si configurado) o se reporta fallo visible

## Casos de prueba

### CP-06-01 — Health OK
- **AC relacionado:** AC-01
- **Precondiciones:** API + Postgres up
- **Pasos:** GET /health
- **Resultado esperado:** 200 { status: ok ... }
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-06-02 — CI en PR
- **AC relacionado:** AC-02
- **Precondiciones:** PR abierto
- **Pasos:** Ver Checks en GitHub
- **Resultado esperado:** Workflow CI ejecutado
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-06-03 — Fallo visible
- **AC relacionado:** AC-03
- **Precondiciones:** Cambio que rompe lint (en rama de prueba)
- **Pasos:** Abrir PR
- **Resultado esperado:** Check rojo; no se considera listo para merge
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

