# HU-02: Login y sesión segura

**Issue:** #2  
**Historia:** Login y sesión segura

## Criterios de aceptación

### AC-01
- **Dado** un usuario activo con credenciales válidas
- **Cuando** inicia sesión
- **Entonces** obtiene sesión/JWT y accede a módulos autorizados

### AC-02
- **Dado** credenciales inválidas
- **Cuando** intenta login
- **Entonces** se niega el acceso sin revelar qué campo falló en exceso

### AC-03
- **Dado** una sesión activa
- **Cuando** cierra sesión
- **Entonces** el token/sesión queda inválido

### AC-04
- **Dado** un token expirado o manipulado
- **Cuando** llama un endpoint protegido
- **Entonces** responde 401

## Casos de prueba

### CP-02-01 — Login OK
- **AC relacionado:** AC-01
- **Precondiciones:** Usuario creado en tenant
- **Pasos:** Login con email/password correctos
- **Resultado esperado:** Acceso al panel; cookie/token presente
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-02-02 — Login fallido
- **AC relacionado:** AC-02
- **Precondiciones:** Usuario existe
- **Pasos:** Password incorrecto 3 veces
- **Resultado esperado:** Error genérico; sin sesión
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-02-03 — Logout
- **AC relacionado:** AC-03
- **Precondiciones:** Sesión activa
- **Pasos:** Click cerrar sesión; reintentar URL protegida
- **Resultado esperado:** Redirige a login; 401 en API
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-02-04 — Token inválido
- **AC relacionado:** AC-04
- **Precondiciones:** API arriba
- **Pasos:** Request con Bearer basura
- **Resultado esperado:** 401 Unauthorized
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

