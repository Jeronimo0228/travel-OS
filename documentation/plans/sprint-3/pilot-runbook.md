# Sprint 3 — Runbook del piloto (DevSecOps)

Responsable: Jerónimo Restrepo (SM + DevSecOps). Alcance: operar el piloto de TravelOS para Punto D' Partida (portal del viajero, KPIs, automatización de seguimiento y cotizador con IA).

Toda la infraestructura es de PDP: el Vercel de la empresa (`devgrupovepormas`) y el cPanel de `pdpcomunica.com` (solo DNS). No se usa ningún servidor propio.

## Topología

| Pieza | Dónde | Notas |
|---|---|---|
| Web (Next.js 15) | Vercel, proyecto `travelos-pdp` (root `apps/web`) | `https://travel-os.pdpcomunica.com`. `API_PROXY_TARGET` reescribe `/api/*` hacia la API, así las cookies de sesión son first-party. |
| API (NestJS 11) | Vercel Functions, proyecto `travelos-api` (root `apps/api`) | `https://api.travel-os.pdpcomunica.com`. Entrada `apps/api/api/index.js` → `src/serverless.ts`; config en `apps/api/vercel.json`. |
| Base de datos | Neon Postgres (`travelos-db`), integración del marketplace de Vercel | Variables `DATABASE_URL` (pooled) y `DATABASE_URL_UNPOOLED` (migraciones) inyectadas por la integración. |
| Trabajos en segundo plano | En proceso (`JOBS_MODE=inline`) | Sin Redis: el PDF se genera en la misma petición y los recordatorios se barren al consultar `GET /tasks/reminders` (máx. 1 vez/min). Con `REDIS_URL` se vuelve a BullMQ. |
| IA | Google Gemini (`AI_PROVIDER=gemini`) | Cadena `GEMINI_MODEL=gemini-2.5-flash,gemini-2.5-flash-lite`: si un modelo responde 429/5xx se prueba el siguiente. Groq sigue soportado (`AI_PROVIDER=groq` + `GROQ_API_KEY`). |
| DNS | cPanel PDP, zona `pdpcomunica.com` | `travel-os` y `api.travel-os` son CNAME a Vercel; dos TXT `_vercel` verifican los dominios. |

## Variables de entorno (sin valores; nunca se versionan)

`travelos-api`: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (Neon), `JWT_SECRET`, `WEB_ORIGIN`, `JOBS_MODE=inline`, `AI_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL`, opcional `GROQ_API_KEY`/`GROQ_MODEL`. No definir `NODE_ENV` (rompe la instalación de devDependencies en el build; Vercel ya ejecuta en producción).

`travelos-pdp`: `API_PROXY_TARGET=https://api.travel-os.pdpcomunica.com`, `NEXT_PUBLIC_API_URL=https://travel-os.pdpcomunica.com`.

## Desplegar

```bash
# desde la raíz del repo (los proyectos tienen rootDirectory configurado)
vercel link --yes --project travelos-api && vercel deploy --prod
vercel link --yes --project travelos-pdp && vercel deploy --prod
```

Migraciones y datos demo (contra la conexión sin pooler):

```bash
vercel env pull /tmp/tapi.env --environment production --project travelos-api
set -a; . /tmp/tapi.env; set +a
export DATABASE_URL="$DATABASE_URL_UNPOOLED?connect_timeout=60"
pnpm --filter @travelos/api exec prisma migrate deploy
pnpm --filter @travelos/api exec tsx prisma/seed.ts
rm /tmp/tapi.env
```

## Verificación rápida

```bash
curl https://api.travel-os.pdpcomunica.com/api/health        # {"status":"ok"}
curl https://travel-os.pdpcomunica.com/api/health             # mismo JSON a través del proxy
```

Luego iniciar sesión como `gerente@demo.travelos.local` (agencia `demo-agencia`), crear una cotización con IA en `/cotizador` y abrir `/viajes` → portal.

## Incidentes

| Síntoma | Acción |
|---|---|
| Cotizador devuelve 503 | Ver logs de `travelos-api` en Vercel. 429/503 de Gemini: esperar o añadir otro modelo a `GEMINI_MODEL`. Sin clave: revisar `GEMINI_API_KEY`. Alternativa: `AI_PROVIDER=groq`. |
| Primer request lento | Arranque en frío de la función y de Neon (unos segundos). Abrir `/api/health` antes de la demo. |
| Login falla con 401 en todos los usuarios | `JWT_SECRET` cambió: es normal que las sesiones viejas caduquen; volver a iniciar sesión. |
| Dominio sin certificado | `vercel domains inspect travel-os.pdpcomunica.com`; revisar los CNAME/TXT en la zona del cPanel PDP. |

## Opción autoalojada

`deploy/docker-compose.pilot.yml` + `deploy/api.Dockerfile` levantan Postgres, Redis y la API en cualquier servidor con Docker (modo BullMQ). No se usa en la demo.

## Checklist de seguridad

- [x] Secretos solo en variables de Vercel; `.env*` y `.vercel` en `.gitignore`
- [x] HTTPS en web y API (certificados de Vercel)
- [x] Cabeceras de seguridad (helmet en la API, `next.config.ts` en la web)
- [x] Límite de intentos en el portal del viajero (429 tras 20 fallos/min)
- [x] Auditoría de accesos al portal
- [ ] Rotar la contraseña demo antes de datos reales (post-piloto)
