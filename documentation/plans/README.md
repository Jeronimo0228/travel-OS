# Work plans by role and sprint

Each file is an operational brief: issues, tasks, files to change, and a paste-ready coding-agent prompt.

| Sprint | Focus | Folder |
|---|---|---|
| Sprint 1 | Foundation + CRM core | `sprint-1/` |
| Sprint 2 | AI quoter + itineraries | `sprint-2/` |
| Sprint 3 | Traveler portal + insights | `sprint-3/` |

Generic prompts: `prompts/`.

## Roles

| Role | Person | Typical paths |
|---|---|---|
| Scrum Master + DevSecOps | Jerónimo Restrepo | CI, Docker, auth guards, audit |
| Frontend Developer | Santiago Arboleda | `apps/web` + prototype HTML reuse |
| Backend Developer | Samuel Madrid | `apps/api`, Prisma |
| QA Engineer | Miguel Mercado | API/e2e tests, AC matrices |
| UX/UI Designer | Juan José Palacio | tokens, a11y, prototype governance |

## Prototype code (Frontend & UX)

→ [`MOCKUP-CODE-SOURCE.md`](./MOCKUP-CODE-SOURCE.md)  
→ https://github.com/nickamam08/TravelOS-AI-Ecosystem

## How to start (any role)

1. Open your `sprint-1/<role>.md`.
2. Copy the coding-agent prompt into Cursor.
3. Implement assigned Issues only.
4. Open a PR when AC + tests are done.
