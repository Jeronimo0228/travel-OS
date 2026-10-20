# Sprint 3 — Backend (Samuel)

## Issues

| Issue | Story | Role |
|---|---|---|
| #21 | Portal chat | Owner |
| #23 | Follow-up automation | Owner |
| #19/#20 | Portal itinerary/docs APIs | Support |
| #22 | Dashboard metrics | Support |

## Files

```
apps/api/src/portal/**
apps/api/src/chat/**
apps/api/src/automations/**
apps/api/src/metrics/**
```

## Coding-agent prompt

```
Backend TravelOS Sprint 3. Issues #21 #23 + portal/metrics APIs.
Traveler magic-link/token scoped to reservation; automations via BullMQ.
Plan: documentation/plans/sprint-3/backend.md
```

## API contract delivered

- `POST /reservations` creates a trip for an agency-owned lead; `GET /reservations` and `GET /reservations/:id` list and read trips.
- Staff can add itinerary entries and document metadata at `POST /reservations/:id/itinerary` and `POST /reservations/:id/documents`.
- `POST /reservations/:id/portal-access` issues a 24-hour bearer token. Only its SHA-256 hash is stored, and issuing a new token revokes the previous token for that reservation. The caller is responsible for delivering the token to the traveler.
- Travelers use that token with `GET /portal/reservation`, `/portal/itinerary`, `/portal/documents`, and `/portal/messages`; `POST /portal/messages` adds a traveler message. Staff can read/reply at `/reservations/:id/messages`.
- BullMQ checks overdue incomplete tasks every five minutes and stores deduplicated in-app reminders. `GET /tasks/reminders` lists reminders and `PATCH /tasks/reminders/:id/read` marks one read. No email/SMS provider is configured.
- `GET /metrics` is limited to managers and admins. Sales means won leads; conversion is won leads divided by all leads. Advisor and destination breakdowns include lead and won-lead counts.

All staff routes scope data to the authenticated agency; advisor reservation access is further limited to assigned leads. The migration `20261020120000_sprint3_backend` is incremental: it only adds the reservation, itinerary, document, portal token, chat and task reminder objects on top of the Sprint 2 schema. Apply it with `pnpm --filter @travelos/api prisma:migrate` (or `prisma migrate deploy`).
