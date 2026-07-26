# Sprint 2 — Backend (Samuel)

## Issues

| Issue | Story | Role |
|---|---|---|
| #13 | NL quoting | Owner |
| #15 | Export PDF | Owner |
| #17 | Link quote to lead | Owner |
| #18 | Seed catalog | Owner |
| #10 | AI prioritization copilot | Owner |
| #24 | Agency knowledge base | Pair DevSecOps |
| #14/#16 | APIs for UI | Support FE |

## Files

```
apps/api/src/quotes/**
apps/api/src/itineraries/**
apps/api/src/catalog/**
apps/api/src/ai/**
apps/api/src/knowledge/**
apps/api/prisma/schema.prisma
packages/shared/src/schemas/quote.ts
packages/shared/src/schemas/itinerary.ts
```

## Coding-agent prompt

```
Backend TravelOS Sprint 2. Issues #13 #15 #17 #18 #10 (API) and support #24.
Implement NL quoting + async PDF (BullMQ/Redis) + seed catalog + link to lead.
Secrets only via OPENAI_API_KEY in env. Strict multi-tenancy.
Plan: documentation/plans/sprint-2/backend.md | AGENTS.md
```
