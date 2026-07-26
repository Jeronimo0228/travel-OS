# Sprint 1 Planning — Fundación + CRM núcleo

## Meta del sprint

Dejar la plataforma autenticada multi-tenant operativa y el CRM básico usable por un asesor (crear leads, pipeline, tareas).

## Capacidad

- Historias: 11
- Story points: 42
- Duración objetivo: 2 semanas (ajustable al calendario del curso)

## HU-01 — Registro de agencia (tenant)

**Historia:** Como dueño de agencia, quiero registrar mi agencia en TravelOS, para operar en un espacio aislado multi-tenant.

**Épica:** E1 · **Esfuerzo:** 5 sp · **Responsable:** Samuel Madrid Ossa

### Tareas
- [ ] Modelo Agency/User en Prisma
- [ ] Endpoint POST /agencies
- [ ] Seed tenant demo
- [ ] Validación Zod

### Criterios de aceptación
- Puedo registrar agencia con nombre y NIT/email
- Se crea tenant_id único
- Datos de agencia A no son visibles en sesión de agencia B

### Casos de prueba
- API crea agency 201
- Duplicado de slug rechazado
- Aislamiento cross-tenant en GET

---

## HU-02 — Login y sesión segura

**Historia:** Como usuario de agencia, quiero autenticarme de forma segura, para acceder a mis módulos autorizados.

**Épica:** E1 · **Esfuerzo:** 5 sp · **Responsable:** Samuel Madrid Ossa

### Tareas
- [ ] Auth credentials/email
- [ ] Sesión JWT/cookie httpOnly
- [ ] Pantalla login Next.js
- [ ] Logout

### Criterios de aceptación
- Login con credenciales válidas entra al panel
- Credenciales inválidas muestran error
- Rutas protegidas redirigen a login

### Casos de prueba
- Login OK
- Login fail
- Guard de ruta autenticada

---

## HU-03 — RBAC (gerente, asesor, admin)

**Historia:** Como admin, quiero asignar roles, para controlar permisos por función.

**Épica:** E1 · **Esfuerzo:** 5 sp · **Responsable:** Samuel Madrid Ossa

### Tareas
- [ ] Enum roles
- [ ] Middleware RBAC NestJS
- [ ] UI asignación rol (admin)
- [ ] Tests de autorización

### Criterios de aceptación
- Admin asigna rol asesor/gerente
- Asesor no puede cambiar roles
- Endpoints respetan RBAC

### Casos de prueba
- 403 asesor en /roles
- 200 admin en /roles

---

## HU-04 — Branding básico de marca blanca

**Historia:** Como gerente, quiero cargar logo y color primario, para ver la app con la identidad de mi agencia.

**Épica:** E1 · **Esfuerzo:** 3 sp · **Responsable:** Santiago Arboleda Giraldo

### Tareas
- [ ] Upload logo a R2/local
- [ ] Campos theme en Agency
- [ ] Aplicar CSS variables en layout

### Criterios de aceptación
- Logo visible en sidebar tras guardar
- Color primario aplica a botones
- Fallback si no hay logo

### Casos de prueba
- Upload válido
- Rechazo archivo >2MB

---

## HU-05 — Auditoría de acciones sensibles

**Historia:** Como DevSecOps, quiero registrar auditoría de login y cambios de rol, para trazabilidad de seguridad.

**Épica:** E1 · **Esfuerzo:** 3 sp · **Responsable:** Jerónimo Restrepo Ángel

### Tareas
- [ ] Tabla audit_log
- [ ] Interceptor login/rol
- [ ] Vista mínima admin de logs

### Criterios de aceptación
- Login queda registrado con timestamp/ip hash
- Cambio de rol genera evento
- Logs solo visibles a admin/gerente

### Casos de prueba
- Evento login creado
- Evento role_change creado

---

## HU-06 — Healthcheck y CI base

**Historia:** Como DevSecOps, quiero pipeline CI (lint/test/build) y healthcheck, para asegurar calidad desde Sprint 1.

**Épica:** E1 · **Esfuerzo:** 3 sp · **Responsable:** Jerónimo Restrepo Ángel

### Tareas
- [ ] GitHub Actions workflow
- [ ] ESLint+tests
- [ ] GET /health
- [ ] Badge CI en README

### Criterios de aceptación
- PR ejecuta CI
- Health fallback 200
- Build falla si lint/test fallan

### Casos de prueba
- Workflow green en main
- Healthcheck contract

---

## HU-07 — Crear y editar leads

**Historia:** Como asesor, quiero crear y editar leads, para centralizar prospectos.

**Épica:** E2 · **Esfuerzo:** 5 sp · **Responsable:** Samuel Madrid Ossa

### Tareas
- [ ] CRUD Lead API
- [ ] Formulario crear/editar
- [ ] Validaciones teléfono/email
- [ ] Pertenencia a tenant

### Criterios de aceptación
- Crear lead con nombre y contacto
- Editar lead existente
- Lead pertenece al tenant del usuario

### Casos de prueba
- CRUD happy path
- No acceso cross-tenant

---

## HU-08 — Pipeline visual por stages

**Historia:** Como asesor, quiero mover leads entre stages del embudo, para ver el estado de ventas.

**Épica:** E2 · **Esfuerzo:** 5 sp · **Responsable:** Santiago Arboleda Giraldo

### Tareas
- [ ] Stages configurables seed
- [ ] PATCH stage
- [ ] UI kanban/embudo
- [ ] Optimistic UI

### Criterios de aceptación
- Mover lead cambia stage persistido
- Embudo muestra conteos
- Stage inválido rechazado

### Casos de prueba
- Cambio stage OK
- Conteos coherentes

---

## HU-09 — Tareas y recordatorios

**Historia:** Como asesor, quiero crear tareas/recordatorios en un lead, para no perder seguimientos.

**Épica:** E2 · **Esfuerzo:** 3 sp · **Responsable:** Santiago Arboleda Giraldo

### Tareas
- [ ] Modelo Task
- [ ] CRUD tareas
- [ ] UI recordatorios en lead
- [ ] Flag vencida

### Criterios de aceptación
- Crear tarea con fecha
- Marcar tarea hecha
- Listar tareas del lead

### Casos de prueba
- CRUD task
- Filtro vencidas

---

## HU-11 — Listado y filtros de clientes

**Historia:** Como asesor, quiero filtrar leads por stage/destino/asesor, para organizar mi trabajo diario.

**Épica:** E2 · **Esfuerzo:** 3 sp · **Responsable:** Santiago Arboleda Giraldo

### Tareas
- [ ] Query params filtros
- [ ] UI filtros
- [ ] Paginación

### Criterios de aceptación
- Filtrar por stage
- Filtrar por asesor
- Combinar filtros

### Casos de prueba
- Filtro stage
- Filtro assignee

---

## HU-12 — Asignación de lead a asesor

**Historia:** Como gerente, quiero asignar leads a asesores, para distribuir la carga comercial.

**Épica:** E2 · **Esfuerzo:** 2 sp · **Responsable:** Samuel Madrid Ossa

### Tareas
- [ ] Campo assignee_id
- [ ] Endpoint assign
- [ ] UI select asesor

### Criterios de aceptación
- Gerente asigna lead
- Asesor ve solo/prioriza los suyos según filtro
- Reasignación queda auditada

### Casos de prueba
- Assign OK
- Permiso asesor limitado

---

## QA — estrategia Sprint 1

- Miguel Mercado define casos Gherkin mínimos por HU.
- Pruebas API con Supertest/Jest + smoke e2e login/CRM.
- Checklist multi-tenant en cada HU de datos.
