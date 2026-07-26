# TravelOS AI

Sistema Operativo Inteligente para Agencias de Viajes — **Proyecto Integrador 2 (EAFIT)**.

## Enlaces

| Recurso | URL |
|---|---|
| Wiki | https://github.com/Jeronimo0228/travel-OS/wiki |
| Issues / Backlog | https://github.com/Jeronimo0228/travel-OS/issues |
| Planes por rol | [`documentacion/planes/`](./documentacion/planes/) |
| Reglas agentes | [`AGENTS.md`](./AGENTS.md) · [`.cursor/rules/`](./.cursor/rules/) |

## Monorepo

```
apps/web          Next.js 15 (UI agencia / portal)
apps/api          NestJS + Prisma (API)
packages/shared   Zod schemas + roles
documentacion/    Actas, mockups, planes de trabajo
```

## Quick start

```bash
pnpm install
pnpm db:up
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local   # ajustar NEXT_PUBLIC_API_URL
pnpm --filter @travelos/shared build
pnpm --filter @travelos/api prisma:generate
pnpm --filter @travelos/api exec prisma migrate dev --name init
pnpm --filter @travelos/api prisma:seed
pnpm dev
```

- Web: http://localhost:3000  
- API health: http://localhost:4000/api/health  

## Stack

Next.js 15 · NestJS · PostgreSQL/Prisma · Redis · Zod · Tailwind · GitHub Actions · (OpenAI desde Sprint 2)

## Equipo

| Rol | Persona |
|---|---|
| SM + DevSecOps | Jerónimo Restrepo Ángel |
| Frontend | Santiago Arboleda Giraldo |
| Backend | Samuel Madrid Ossa |
| QA | Miguel Mercado Mercado |
| UX/UI | Juan José Palacio Zuluaga |
| PO | Juan Manuel Restrepo Molina (Punto D' Partida) |

Cada quien trabaja su brief en `documentacion/planes/sprint-N/<rol>.md` (incluye prompt para agente de coding).
