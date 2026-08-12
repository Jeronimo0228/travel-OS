# HU-01: Registro de agencia (tenant)

**Issue:** #1  
**Historia:** Registro de agencia (tenant)

## Criterios de aceptación

### AC-01
- **Dado** un dueño de agencia no registrado
- **Cuando** completa el formulario de registro con datos válidos
- **Entonces** se crea un tenant aislado y puede iniciar el onboarding

### AC-02
- **Dado** un correo/NIT ya registrado
- **Cuando** intenta registrar la misma agencia
- **Entonces** el sistema rechaza el registro con mensaje claro

### AC-03
- **Dado** campos obligatorios vacíos
- **Cuando** envía el formulario
- **Entonces** se muestran errores de validación y no se crea tenant

### AC-04
- **Dado** un tenant recién creado
- **Cuando** consulta sus datos de agencia
- **Entonces** solo ve información de su propio agencyId

## Casos de prueba

### CP-01-01 — Registro exitoso
- **AC relacionado:** AC-01
- **Precondiciones:** API/web disponibles; DB limpia de ese NIT
- **Pasos:** 1) Abrir registro 2) Llenar razón social, NIT, email admin, password 3) Enviar
- **Resultado esperado:** Tenant creado; redirección a login o dashboard; registro en DB con agencyId único
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-01-02 — Duplicado rechazado
- **AC relacionado:** AC-02
- **Precondiciones:** Agencia ya existe
- **Pasos:** Repetir registro con mismo NIT/email
- **Resultado esperado:** HTTP 4xx / mensaje de conflicto; no segundo tenant
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-01-03 — Validación campos
- **AC relacionado:** AC-03
- **Precondiciones:** Formulario abierto
- **Pasos:** Enviar vacío o email inválido
- **Resultado esperado:** Errores visibles; sin create en backend
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-01-04 — Aislamiento tenant
- **AC relacionado:** AC-04
- **Precondiciones:** Dos tenants A y B
- **Pasos:** Login como A; intentar leer recurso de B
- **Resultado esperado:** 403/404; sin fuga de datos
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

