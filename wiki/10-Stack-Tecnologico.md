# Stack Tecnológico Propuesto

## Resumen ejecutivo

Stack **TypeScript-first**, cloud-friendly, alineado al prototipo Tailwind existente y a un MVP multi-tenant con IA.

## Decisión por capa

### Frontend
- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS + shadcn/ui + Lucide**
- **TanStack Query** (datos servidor)
- **Zod** (validación compartida)
- **Recharts** (dashboard)
- Base visual: prototipo Vite `TravelOS-AI-Ecosystem`

### Backend
- **NestJS 10+ / TypeScript**
- **Prisma ORM + PostgreSQL 16**
- **Passport/Auth.js** + RBAC
- **OpenAPI** (Swagger) generado
- **BullMQ + Redis** para PDF, IA, emails

### IA
- **OpenAI** (chat + embeddings)
- Vector store inicial: **pgvector** en Postgres (simple para MVP)
- Knowledge base por `agency_id`

### Infra & DevSecOps
- Docker Compose (local)
- GitHub Actions (lint, test, build)
- Vercel (frontends) + Railway/Fly.io (API/workers)
- Sentry
- Secrets en GitHub Environments / plataformas (nunca en git)
- Dependabot + scanning básico

### Integraciones MVP vs post-MVP
| Integración | MVP | Post |
|---|---|---|
| Email transaccional (Resend/Plunk) | Sí | — |
| Object storage | Sí | — |
| WhatsApp Cloud API | Stub/webhook ready | Sí |
| Pasarela (Wompi/Stripe) | Stub | Sí |
| Providers hoteles/vuelos | Catálogo seed / mock | APIs reales |

## Alternativas evaluadas

| Opción | Por qué no (MVP) |
|---|---|
| Django monolito | Menos alineado al prototipo React/Tailwind del equipo |
| Firebase only | Debilidad en consultas relacionales complejas CRM/finanzas |
| Laravel | Válido, pero el equipo prioriza TS full-stack |
