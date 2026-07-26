# AGENTS.md — TravelOS AI

You are a coding agent on **Integrative Project 2 / TravelOS AI**.

## Product canon

- Wiki: https://github.com/Jeronimo0228/travel-OS/wiki
- Issues: https://github.com/Jeronimo0228/travel-OS/issues
- Role plans: `documentation/plans/`
- Vision: `documentation/sprint-0/VISION.md`

## Stack

| App | Path | Tech |
|---|---|---|
| Agency web | `apps/web` | Next.js 15, React 19, TS, Tailwind |
| API | `apps/api` | NestJS, Prisma, PostgreSQL |
| Shared | `packages/shared` | Zod schemas, roles |
| Local infra | `docker-compose.yml` | Postgres 16 + Redis 7 |

## Non-negotiable rules

1. Multi-tenant: always filter by authenticated `agencyId`. Never trust client-supplied `agencyId` without membership checks.
2. No secrets in git. Use `.env` / `.env.local` from `.env.example`.
3. Validate inputs with Zod (`@travelos/shared`) or `class-validator`.
4. Clean code: small functions, clear names, no obvious comments, no dead code.
5. Every merged story needs: AC met, minimal tests, green CI.
6. Commits: team developer author only (no tool co-authors).
7. UI must reuse the prototype codebase (see below), aligned to TravelOS look.

## UI / mockup code reuse (Frontend & UX)

Prototype is already implemented as HTML + Tailwind:

- https://github.com/nickamam08/TravelOS-AI-Ecosystem
- Guide: `documentation/plans/MOCKUP-CODE-SOURCE.md`
- Migrate HTML/Tailwind → React components in `apps/web`. Screenshots only validate.

## How to work a user story

1. Read the Issue + your role plan under `documentation/plans/sprint-X/`.
2. Implement only that story’s scope.
3. Add/update tests.
4. Open a PR using the DoD checklist in `.cursor/rules/pr-review.mdc`.

## Commands

```bash
pnpm install
pnpm db:up
cp .env.example apps/api/.env
pnpm --filter @travelos/api prisma:migrate
pnpm dev
```
