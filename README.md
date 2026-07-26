# TravelOS AI

**Sistema Operativo Inteligente para Agencias de Viajes** — Proyecto Integrador 2 (EAFIT).

| Campo | Valor |
|---|---|
| Producto | TravelOS AI |
| Equipo | Grupo 2 (miércoles 6–9 am) |
| Product Owner / Cliente | Juan Manuel Restrepo Molina — CEO, Punto D' Partida |
| Repositorio | https://github.com/Jeronimo0228/travel-OS |
| Gestión | Wiki + Issues + Milestones (este repo) |

## Qué es

Plataforma SaaS multi-tenant con IA que centraliza la operación comercial, administrativa y de atención al cliente de una agencia de viajes (CRM + cotizador + itinerarios + portal del viajero + inteligencia gerencial), orientada a un **MVP estable** para pruebas piloto y futura comercialización.

## Sprint 0 (estado actual)

Entrega de **definición de producto** (sin desarrollo de features productivas aún):

- [Wiki del proyecto](./wiki/Home.md)
- [Definición del producto](./wiki/01-Definicion-del-Producto.md)
- [Arquitectura y stack](./wiki/05-Arquitectura.md)
- [Mockups / prototipo](./wiki/06-Diseno-de-Interfaces.md)
- [Backlog y épicas](./backlog/product-backlog.md)
- [Sprint 1 Planning](./backlog/sprint-1-planning.md)
- [Ceremonias](./docs/ceremonias/)
- [Presentación / sustentación](./wiki/09-Presentacion-Sustentacion.md)

## Stack propuesto (MVP)

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | NestJS + TypeScript |
| Datos | PostgreSQL + Prisma |
| Cache / colas | Redis + BullMQ |
| Auth | Auth.js (NextAuth) + JWT / sesiones |
| IA | OpenAI API (cotización, copiloto CRM, embeddings por agencia) |
| Storage | Cloudflare R2 / S3 |
| Mensajería (post-MVP) | Meta WhatsApp Cloud API |
| Infra | Docker + GitHub Actions + Vercel (web) + Railway/Fly (API) |
| Observabilidad | Sentry + OpenTelemetry |

Prototipo visual actual (reutilizable): clon externo `TravelOS-AI-Ecosystem` (Vite + HTML + Tailwind). Screenshots en [`docs/mockups/screenshots`](./docs/mockups/screenshots/).

## Equipo

| Integrante | Correo | Rol |
|---|---|---|
| Jerónimo Restrepo Ángel | jrestrepoa@eafit.edu.co | Scrum Master + DevSecOps |
| Santiago Arboleda Giraldo | sarboledag@eafit.edu.co | Frontend Developer |
| Samuel Madrid Ossa | smadrido@eafit.edu.co | Backend Developer |
| Miguel Mercado Mercado | mamercado@eafit.edu.co | QA Engineer |
| Juan José Palacio Zuluaga | jjpalacioz@eafit.edu.co | UX/UI Designer |

## Cómo navegar la entrega académica

1. Abre la [Wiki](./wiki/Home.md) — espejo de entregables por sprint.
2. Revisa Issues etiquetados por épica/sprint (tras ejecutar bootstrap).
3. Revisa [Milestones](./wiki/11-Milestones-y-Estado-MVP.md).

```bash
# Bootstrap de labels, milestones e issues (requiere gh autenticado como Jeronimo0228)
./scripts/bootstrap-github-project.sh
```

## Licencia

Uso académico / Proyecto Integrador 2 — EAFIT. Derechos del producto alineados con acuerdos con Punto D' Partida.
