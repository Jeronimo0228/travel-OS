# Política de seguridad — Travel OS

## Reportar una vulnerabilidad

Escribe a **contacto@pdpcomunica.com** con el asunto «Seguridad Travel OS». Incluye los pasos para reproducir el problema y el impacto. Respondemos en máximo 3 días hábiles. No publiques el problema antes de que esté corregido.

## Versiones con soporte

Solo la versión en producción (`main`, desplegada en https://travel-os.pdpcomunica.com).

## Controles implementados

| Área | Control |
|---|---|
| Autenticación | JWT en cookie `httpOnly`, `Secure` y `SameSite=Lax`; contraseñas con bcrypt; 10 intentos fallidos por IP y correo bloquean el login 15 minutos. |
| Autorización | Roles ADMIN, GERENTE y ASESOR (`RolesGuard`); cada consulta filtra por `agencyId` (multiempresa). |
| Portal del viajero | Token aleatorio guardado solo como hash; vence en 24 h; generar uno nuevo invalida el anterior; 20 intentos inválidos por minuto bloquean. |
| Entrada | Validación con Zod en todos los endpoints; `ValidationPipe` con lista blanca. |
| Cabeceras | Helmet en la API; HSTS, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, `Referrer-Policy` y `Permissions-Policy` en la web. |
| IA | Ver [Arquitectura agéntica segura](documentation/sprint-3/agentic-architecture.md): llaves por agente, respaldo de proveedor, salida validada, límite por usuario, sin herramientas de escritura. |
| Secretos | Variables cifradas en Vercel; nunca en el repositorio (gitleaks en CI). |
| Dependencias | `pnpm audit` en CI (alta o crítica bloquea), Dependabot semanal. |
| Código | CodeQL (`security-extended`) en cada PR y cada semana. |
| Auditoría | Registro de acciones sensibles por agencia (`/settings/audit`). |

## Riesgo aceptado

- `GHSA-mrhx-c7xc-m3w5` (Zod 3: memoria con colecciones muy grandes). Mitigado porque el cuerpo de cada petición está limitado a 100 kB y todos los arreglos tienen `max()`. Se cierra al migrar a Zod 4.
