# TravelOS AI

Intelligent Operating System for Travel Agencies — **Integrative Project 2 (EAFIT)**.

**Status:** scaffolding complete. The team only needs to implement the user stories.

## Start here

| What | Where |
|---|---|
| Agent rules | [`AGENTS.md`](./AGENTS.md) · [`.cursor/rules/`](./.cursor/rules/) |
| Role / sprint work plans | [`documentation/plans/`](./documentation/plans/) |
| UI code to reuse (FE/UX) | [`documentation/plans/MOCKUP-CODE-SOURCE.md`](./documentation/plans/MOCKUP-CODE-SOURCE.md) |
| Product wiki (academic) | https://github.com/Jeronimo0228/travel-OS/wiki |
| Backlog / issues | https://github.com/Jeronimo0228/travel-OS/issues |
| Milestones | https://github.com/Jeronimo0228/travel-OS/milestones |

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

Next.js 15 · NestJS · PostgreSQL/Prisma · Redis · Zod · Tailwind · GitHub Actions · OpenAI (Sprint 2+)

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
