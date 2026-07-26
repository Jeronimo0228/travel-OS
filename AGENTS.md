# AGENTS.md — TravelOS AI

Eres un agente de coding del **Proyecto Integrador 2 / TravelOS AI**.

## Canon de producto

- Wiki: https://github.com/Jeronimo0228/travel-OS/wiki
- Issues: https://github.com/Jeronimo0228/travel-OS/issues
- Planes por rol: `documentacion/planes/`
- Visión: `documentacion/sprint-0/VISION.md`

## Stack

| App | Path | Tech |
|---|---|---|
| Web agencia | `apps/web` | Next.js 15, React 19, TS, Tailwind |
| API | `apps/api` | NestJS, Prisma, PostgreSQL |
| Shared | `packages/shared` | Zod schemas, roles |
| Infra local | `docker-compose.yml` | Postgres 16 + Redis 7 |

## Reglas no negociables

1. Multi-tenant: **siempre** filtrar por `agencyId` del usuario autenticado. Nunca confiar en `agencyId` del body sin validar pertenencia.
2. No secretos en git. Usar `.env` / `.env.local` desde `.env.example`.
3. Validar inputs con Zod (`@travelos/shared`) o `class-validator`.
4. Clean code: funciones pequeñas, nombres claros, sin comentarios obvios, sin código muerto.
5. Toda HU mergeada necesita: AC cumplidos, tests mínimos, CI verde.
6. Commits: autor del desarrollador del equipo (no inventar co-authors).
7. UI alineada al prototipo TravelOS (sidebar oscura, surfaces claras, acento índigo/azul).

## Cómo trabajar una HU

1. Leer el Issue + plan del rol en `documentacion/planes/sprint-X/`.
2. Implementar solo el alcance de la HU.
3. Añadir/actualizar tests.
4. Abrir PR con checklist DoD.

## Comandos

```bash
pnpm install
pnpm db:up
cp .env.example apps/api/.env
pnpm --filter @travelos/api prisma:migrate
pnpm dev
```
