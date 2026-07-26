# Sprint 2 — Backend (Samuel)

## Issues

| Issue | HU | Rol |
|---|---|---|
| #13 | Cotización NL | Owner |
| #15 | Export PDF | Owner |
| #17 | Vincular cotización a lead | Owner |
| #18 | Catálogo seed | Owner |
| #10 | Copiloto priorización | Owner |
| #24 | Knowledge base agencia | Pair DevSecOps |
| #14/#16 | APIs soporte UI | Support FE |

## Archivos

```
apps/api/src/quotes/**
apps/api/src/itineraries/**
apps/api/src/catalog/**
apps/api/src/ai/**              # orchestrator OpenAI
apps/api/src/knowledge/**
apps/api/prisma/schema.prisma   # Quote, QuoteOption, Itinerary, KnowledgeDoc, CatalogItem
packages/shared/src/schemas/quote.ts
packages/shared/src/schemas/itinerary.ts
```

## Prompt agente

```
Backend TravelOS Sprint 2. Issues #13 #15 #17 #18 #10 (API) y soporte #24.
Implementa cotización NL + PDF async (BullMQ/Redis) + catálogo seed + link a lead.
Secrets solo via OPENAI_API_KEY en env. Multi-tenant estricto.
Plan: documentacion/planes/sprint-2/backend.md | AGENTS.md
```
