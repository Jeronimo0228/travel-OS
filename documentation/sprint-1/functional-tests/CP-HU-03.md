# HU-03: RBAC (gerente, asesor, admin)

**Issue:** #3  
**Historia:** RBAC (gerente, asesor, admin)

## Criterios de aceptación

### AC-01
- **Dado** usuarios con roles distintos en el mismo tenant
- **Cuando** acceden a módulos restringidos
- **Entonces** solo el rol autorizado puede ejecutar la acción

### AC-02
- **Dado** un admin de agencia
- **Cuando** asigna rol asesor a un usuario
- **Entonces** los permisos del usuario cambian en la siguiente sesión/request

### AC-03
- **Dado** un asesor
- **Cuando** intenta una acción de admin (p.ej. cambiar branding global)
- **Entonces** recibe 403

### AC-04
- **Dado** un gerente
- **Cuando** consulta dashboard/CRM permitidos
- **Entonces** accede según matriz de permisos documentada

## Casos de prueba

### CP-03-01 — Matriz permisos básica
- **AC relacionado:** AC-01
- **Precondiciones:** Users admin/gerente/asesor
- **Pasos:** Probar endpoint sensible con cada rol
- **Resultado esperado:** Solo roles permitidos → 200; otros → 403
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-03-02 — Cambio de rol
- **AC relacionado:** AC-02
- **Precondiciones:** Admin logueado
- **Pasos:** Cambiar rol de usuario; re-login
- **Resultado esperado:** Nuevos permisos aplicados
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-03-03 — Asesor bloqueado en admin
- **AC relacionado:** AC-03
- **Precondiciones:** Sesión asesor
- **Pasos:** PUT branding / admin users
- **Resultado esperado:** 403
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-03-04 — Gerente acceso CRM
- **AC relacionado:** AC-04
- **Precondiciones:** Sesión gerente
- **Pasos:** Abrir CRM y listar leads
- **Resultado esperado:** 200 y datos de su tenant
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

