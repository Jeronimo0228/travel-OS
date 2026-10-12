# Sprint 2 — Backend (Samuel)

## Issues

| Issue   | Story                     | Role           |
| ------- | ------------------------- | -------------- |
| #13     | NL quoting                | Owner          |
| #15     | Export PDF                | Owner          |
| #17     | Link quote to lead        | Owner          |
| #18     | Seed catalog              | Owner          |
| #10     | AI prioritization copilot | Owner          |
| #24     | Agency knowledge base     | Pair DevSecOps |
| #14/#16 | APIs for UI               | Support FE     |

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
Secrets only via GROQ_API_KEY in env. Strict multi-tenancy.
Plan: documentation/plans/sprint-2/backend.md | AGENTS.md
```

## Backend API delivered for Samuel's issues

- `GET /ai/leads/prioritized?take=20` ranks the authenticated user's visible leads with AI.
- `GET /catalog?kind=HOTEL&destination=Cartagena` lists only the caller agency's seeded catalog.
- `POST /quotes` accepts `{ "prompt": "...", "leadId": "optional-cuid" }` and returns
  two or three catalog-backed alternatives with estimated COP totals.
- `GET /quotes` and `GET /quotes/:id` list and retrieve quotes within the caller's agency.
- `PUT /quotes/:id/lead` accepts `{ "leadId": "cuid" }` after checking lead visibility.
- `POST /quotes/:id/pdf` enqueues asynchronous PDF generation; `GET /quotes/:id/pdf`
  returns the PDF when ready or the current PDF status while it is being generated.

Each newly registered agency receives its own idempotently seeded hotel/activity
catalog. Run `pnpm db:seed` after applying migrations to populate existing agencies.
AI-backed endpoints require `GROQ_API_KEY`; `GROQ_MODEL` defaults to
`openai/gpt-oss-120b`. PDF jobs use the configured `REDIS_URL`; generated PDF bytes are
stored with the agency-scoped quote for later download.

For local smoke tests, `pnpm db:seed` also creates three open demo leads and one
`[DEMO PDF]` Cartagena quote idempotently. The quote can exercise PDF generation
without calling Groq. PDF rendering uses PDFKit in the API's BullMQ worker and
requires Redis, but no external PDF service.
