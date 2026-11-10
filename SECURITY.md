# Política de seguridad — Travel OS

## Reportar una vulnerabilidad

Escribe a **contacto@pdpcomunica.com** con el asunto «Seguridad Travel OS». Incluye los pasos para reproducir el problema y el impacto. Respondemos en máximo 3 días hábiles. No publiques el problema antes de que esté corregido.

## Versiones con soporte

Solo la versión en producción (`main`, desplegada en https://travel-os.pdpcomunica.com).

## Controles implementados

| Área | Control |
|---|---|
| Autenticación | JWT en cookie `httpOnly`, `Secure` y `SameSite=Lax`, validado contra la base en cada petición (usuario activo y `sessionVersion`); contraseñas con bcrypt; 10 intentos fallidos por IP y correo bloquean el login 15 minutos. |
| Cuentas | Invitaciones (7 días) y recuperación de contraseña (30 min) con tokens de un solo uso guardados como SHA-256; desactivar un usuario o cambiar su contraseña cierra sus sesiones. |
| Archivos | PDF, JPG y PNG de hasta 4 MB validados por su firma real, en Vercel Blob con ruta aleatoria por agencia. |
| Autorización | Roles ADMIN, GERENTE y ASESOR (`RolesGuard`); cada consulta filtra por `agencyId` (multiempresa). |
| Portal del viajero | Token aleatorio guardado solo como hash; vence en 24 h; generar uno nuevo invalida el anterior; 20 intentos inválidos por minuto bloquean. |
| Entrada | Validación con Zod en todos los endpoints; `ValidationPipe` con lista blanca. |
| Cabeceras | Helmet en la API; HSTS, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, `Referrer-Policy` y `Permissions-Policy` en la web. |
| IA | Ver [Arquitectura agéntica segura](documentation/sprint-3/agentic-architecture.md): llaves por agente, respaldo de proveedor, salida validada, límite por usuario, sin herramientas de escritura. |
| Secretos | Variables cifradas en Vercel; nunca en el repositorio (gitleaks en CI). |
| Dependencias | `pnpm audit` en CI (alta o crítica bloquea), Dependabot semanal. |
| Código | CodeQL (`security-extended`) en cada PR y cada semana. |
| Auditoría | Registro de acciones sensibles por agencia (`/settings/audit`). |

## Riesgos aceptados

Ninguno abierto. El último (GHSA-mrhx-c7xc-m3w5 de Zod 3) se cerró al migrar a Zod 4 (HU-32).
