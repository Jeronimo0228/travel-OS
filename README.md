# TravelOS AI

Sistema operativo para agencias de viajes y mayoristas: CRM, cotizador con IA sobre el catálogo propio, itinerarios, portal del viajero, tablero gerencial y tres agentes de IA con controles de seguridad. Proyecto Integrador 2 (EAFIT) y producto de PDP Comunica.

[![CI](https://github.com/Jeronimo0228/travel-OS/actions/workflows/ci.yml/badge.svg)](https://github.com/Jeronimo0228/travel-OS/actions/workflows/ci.yml) [![Security](https://github.com/Jeronimo0228/travel-OS/actions/workflows/security.yml/badge.svg)](https://github.com/Jeronimo0228/travel-OS/actions/workflows/security.yml)

## Aplicación en producción

| | URL |
|---|---|
| **Aplicación** | **https://travel-os.pdpcomunica.com** (botón «Entrar a la demo»: solo lectura, sin registro) |
| API | https://api.travel-os.pdpcomunica.com/api/health |
| Wiki (entregables académicos) | https://github.com/Jeronimo0228/travel-OS/wiki |
| Presentación final | [`documentation/presentation/sprint-3-final-deck.html`](documentation/presentation/sprint-3-final-deck.html) |
| Manual de usuario | En la app: `/ayuda` · [Wiki 23](https://github.com/Jeronimo0228/travel-OS/wiki/23-Manual-de-Usuario) |
| Despliegue | [Wiki 24](https://github.com/Jeronimo0228/travel-OS/wiki/24-Despliegue) · [runbook](documentation/plans/sprint-3/pilot-runbook.md) |
| Arquitectura agéntica | [`documentation/sprint-3/agentic-architecture.md`](documentation/sprint-3/agentic-architecture.md) |
| Seguridad | [`SECURITY.md`](SECURITY.md) |
| Backlog / milestones | [issues](https://github.com/Jeronimo0228/travel-OS/issues) · [milestones](https://github.com/Jeronimo0228/travel-OS/milestones) |
| Actas | [`documentation/ceremonies/`](documentation/ceremonies/) |

Usuario demo: `gerente@demo.travelos.local` / `TravelOS!demo1`, agencia `demo-agencia`.

## Calidad

- **271 pruebas en CI:** 96 unitarias de la API, 56 e2e contra PostgreSQL y Redis reales, y 119 de la web.
- **Seguridad en cada PR:** gitleaks, `pnpm audit` y CodeQL.
- **Prueba en vivo de los agentes:** `node scripts/agents-smoke.mjs`.
- **Recorrido visual en Chrome y iPhone:** `scripts/ui-walkthrough.mjs`.

## Operación

```bash
# Desplegar (API primero)
vercel link --yes --project travelos-api && vercel deploy --prod
vercel link --yes --project travelos-pdp && vercel deploy --prod
# Cargar llaves de IA por agente (pide las llaves sin mostrarlas)
./scripts/set-ai-keys.sh
```

## Monorepo

```
apps/web                 Next.js 15 (agency UI + traveler portal)
apps/api                 NestJS + Prisma API
packages/shared          Zod schemas + roles
documentation/           Local artifacts + role plans (English)
```

## Quick start

```bash
pnpm install
pnpm db:up
cp .env.example apps/api/.env
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > apps/web/.env.local
pnpm --filter @travelos/shared build
pnpm --filter @travelos/api prisma:generate
pnpm --filter @travelos/api exec prisma migrate dev
pnpm --filter @travelos/api prisma:seed
pnpm dev
```

- Web: http://localhost:3000  
- API health: http://localhost:4000/api/health  
- Demo seed: `admin@demo.travelos.local` / `TravelOS!demo1`

## Stack

Next.js 15 · NestJS · PostgreSQL/Prisma · Redis · Zod · Tailwind · GitHub Actions · Groq (Sprint 2+)

## Team — open your plan and code

| Role | Person | Sprint 1 brief |
|---|---|---|
| SM + DevSecOps | Jerónimo Restrepo Ángel | [`documentation/plans/sprint-1/devsecops.md`](./documentation/plans/sprint-1/devsecops.md) |
| Frontend | Santiago Arboleda Giraldo | [`documentation/plans/sprint-1/frontend.md`](./documentation/plans/sprint-1/frontend.md) |
| Backend | Samuel Madrid Ossa | [`documentation/plans/sprint-1/backend.md`](./documentation/plans/sprint-1/backend.md) |
| QA | Miguel Mercado Mercado | [`documentation/plans/sprint-1/qa.md`](./documentation/plans/sprint-1/qa.md) |
| UX/UI | Juan José Palacio Zuluaga | [`documentation/plans/sprint-1/ux.md`](./documentation/plans/sprint-1/ux.md) |

**PO / Client:** Juan Manuel Restrepo Molina — CEO, Punto D' Partida

Each brief includes assigned issues, files to touch, ordered tasks, and a ready-to-paste coding-agent prompt.
