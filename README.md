# TravelOS AI

Sistema Operativo Inteligente para Agencias de Viajes — **Proyecto Integrador 2 (EAFIT)**.

Este repositorio versiona el **código y artefactos de desarrollo**. La documentación académica de producto (definición, arquitectura narrativa, backlog vivo, etc.) vive en GitHub Wiki e Issues.

| Recurso | Ubicación |
|---|---|
| Wiki (entregables Sprint) | https://github.com/Jeronimo0228/travel-OS/wiki |
| Backlog / HU | https://github.com/Jeronimo0228/travel-OS/issues |
| Milestones | https://github.com/Jeronimo0228/travel-OS/milestones |
| Documentación local esencial | [`documentacion/`](./documentacion/) |

## Estructura del repositorio

```
travel-OS/
├── documentacion/     # Actas, evidencias, mockups, vision, checklist (no sustituye la Wiki)
├── scripts/           # Automatización DevOps / bootstrap GitHub
├── .github/           # Issue templates y futuros workflows CI
└── README.md
```

> El código de aplicación (`apps/`, `packages/`, etc.) se agregará a partir de Sprint 1.

## Stack previsto (MVP)

Next.js 15 · NestJS · PostgreSQL/Prisma · Redis/BullMQ · OpenAI · Auth.js · R2/S3 · GitHub Actions

Detalle: [Wiki → Stack](https://github.com/Jeronimo0228/travel-OS/wiki/10-Stack-Tecnologico) y [Arquitectura](https://github.com/Jeronimo0228/travel-OS/wiki/05-Arquitectura).

## Equipo

| Integrante | Rol |
|---|---|
| Jerónimo Restrepo Ángel | Scrum Master + DevSecOps |
| Santiago Arboleda Giraldo | Frontend Developer |
| Samuel Madrid Ossa | Backend Developer |
| Miguel Mercado Mercado | QA Engineer |
| Juan José Palacio Zuluaga | UX/UI Designer |

**PO / Cliente:** Juan Manuel Restrepo Molina — CEO, Punto D' Partida

## Scripts

```bash
# Recrear labels/milestones/issues (si hace falta)
./scripts/bootstrap-github-project.sh
```

## Prototipo UI de referencia

Mockups interactivos (externo): https://github.com/nickamam08/TravelOS-AI-Ecosystem  
Screenshots de entrega: [`documentacion/mockups/screenshots/`](./documentacion/mockups/screenshots/)
