# Sprint 3 — Pilot runbook (DevSecOps)

Owner: Jerónimo Restrepo (SM + DevSecOps). Scope: run the TravelOS pilot for Punto D' Partida with the Sprint 3 portal, KPIs and follow-up automation.

## Topology

| Piece | Where | Notes |
|---|---|---|
| Web (Next.js 15) | Vercel | `API_PROXY_TARGET` rewrites `/api/*` to the API, so auth cookies stay first-party. |
| API (NestJS) | Docker, `deploy/docker-compose.pilot.yml` | Bound to `127.0.0.1:4100`; only reachable through the tunnel. |
| PostgreSQL 16 + Redis 7 | Same compose project | No public ports. Redis runs the BullMQ follow-up worker every 5 min. |
| Tunnel | `cloudflared` container | Publishes the API over HTTPS. A quick tunnel gets a new URL when it restarts (see "Tunnel URL changed"). |

## Security controls delivered in Sprint 3

- **Portal tokens:** 32 random bytes (base64url), 24 h lifetime, only the SHA-256 hash is stored. Issuing a new link revokes the previous one.
- **Token in URL fragment:** links look like `/portal#t=<token>`. Browsers never send the fragment to servers, so the token does not land in Vercel or API access logs. The portal moves it to `sessionStorage` and clears the URL.
- **Brute-force limit:** more than 20 invalid portal tokens from one IP in 60 s returns `429`.
- **Audit:** `PORTAL_ACCESS_ISSUED` (who issued a link) and `PORTAL_DOCUMENTS_VIEWED` (when the traveler opened documents) are written to `AuditLog` and visible in *Configuración → Auditoría*.
- **Headers:** API uses `helmet` (CSP, HSTS, nosniff, frameguard). Web adds `X-Frame-Options: DENY`, HSTS, `Permissions-Policy`, and `Referrer-Policy: no-referrer` on `/portal`.
- **Structured logs:** one JSON line per request with `requestId`, method, path without query string, status and duration. `x-request-id` is echoed for support tickets.
- **Documents:** only HTTPS URLs without embedded credentials are accepted.
- **Multi-tenant:** every staff route filters by the authenticated `agencyId`; advisors only see reservations of their assigned leads; travelers only see their own reservation.

## First deploy

```bash
cd travel-OS/deploy
cp pilot.env.example .env.pilot      # fill JWT_SECRET (openssl rand -hex 32), WEB_ORIGIN, GROQ_API_KEY
export POSTGRES_PASSWORD=$(openssl rand -hex 24)   # keep it in the server's secret store
docker compose -f docker-compose.pilot.yml up -d --build
docker compose -f docker-compose.pilot.yml logs tunnel | grep trycloudflare.com
```

Then in Vercel (project `travelos`):

```bash
vercel env add API_PROXY_TARGET production      # https://<tunnel>.trycloudflare.com
vercel env add NEXT_PUBLIC_API_URL production   # https://<vercel production domain>
vercel deploy --prod
```

## Smoke test (2 minutes)

1. `curl https://<web>/api/health` → `{"status":"ok"}`.
2. Log in as `gerente@demo.travelos.local` → dashboard shows sales, conversion, trips and overdue follow-ups.
3. *Viajes y Portal* → open Cartagena → **Generar enlace del portal** → open it on a phone.
4. Send a chat message from the phone; it appears in the agency chat within 5 s. Reply from the agency.
5. Bell icon shows unread follow-up reminders; **Marcar leído** lowers the counter.
6. *Configuración → Auditoría* lists `PORTAL_ACCESS_ISSUED` and `PORTAL_DOCUMENTS_VIEWED`.

## Operations

| Situation | Action |
|---|---|
| Tunnel URL changed | `docker compose ... logs tunnel`, update `API_PROXY_TARGET` in Vercel, `vercel deploy --prod`. A named Cloudflare tunnel on a fixed hostname removes this step (post-pilot). |
| API unhealthy | `docker compose ... ps`, `logs api --tail 200`; restart with `up -d api`. Migrations run on boot. |
| Traveler says the link expired | Staff issues a new link from the trip; the old one is revoked automatically. |
| Suspected token leak | Issue a new link (revokes the old one) and review `AuditLog` for the reservation. |
| Backup | `docker compose ... exec postgres pg_dump -U travelos travelos > travelos-$(date +%F).sql` daily. |
| AI features return 503 | `GROQ_API_KEY` missing or invalid in `.env.pilot`. The portal, KPIs and reminders do not depend on AI. |

## Pilot checklist

- [x] Portal token hardening (hash, expiry, revocation, rate limit, fragment link)
- [x] Document-access audit
- [x] Security headers on web and API
- [x] Structured request logs with request id
- [x] Reproducible deploy (`deploy/api.Dockerfile`, `deploy/docker-compose.pilot.yml`)
- [x] Demo data for the pilot (`apps/api/prisma/seed-sprint3.ts`, only when `PILOT_SEED=true`)
- [ ] Fixed hostname for the API (named tunnel) — post-pilot
- [ ] Email delivery of portal links (no provider configured; staff copies the link) — Sprint 4
