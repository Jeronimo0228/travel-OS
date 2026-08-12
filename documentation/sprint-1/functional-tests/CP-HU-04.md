# HU-04: Branding básico de marca blanca

**Issue:** #4  
**Historia:** Branding básico de marca blanca

## Criterios de aceptación

### AC-01
- **Dado** un admin de agencia autenticado
- **Cuando** actualiza logo y color primario
- **Entonces** la UI de su tenant refleja el branding

### AC-02
- **Dado** branding configurado en tenant A
- **Cuando** un usuario de tenant B inicia sesión
- **Entonces** no ve el branding de A

### AC-03
- **Dado** archivo de logo inválido
- **Cuando** intenta subirlo
- **Entonces** se rechaza con validación

## Casos de prueba

### CP-04-01 — Actualizar branding
- **AC relacionado:** AC-01
- **Precondiciones:** Admin tenant A
- **Pasos:** Subir logo + color; recargar app
- **Resultado esperado:** UI muestra nuevos valores
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-04-02 — Sin fuga branding
- **AC relacionado:** AC-02
- **Precondiciones:** Tenants A y B
- **Pasos:** Login B tras cambiar A
- **Resultado esperado:** B mantiene su branding
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-04-03 — Logo inválido
- **AC relacionado:** AC-03
- **Precondiciones:** Admin
- **Pasos:** Subir .exe o > límite
- **Resultado esperado:** Error validación; branding previo intacto
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

