# Momento 2: Divergir — Competitive analysis (TravelOS AI)

Review of similar products to generate solution ideas for **TravelOS AI**.

Public sources: TravelJoy (pricing/features 2026), Travefy (product + PCI-DSS claims), and the broader category of tourism AI agents (WhatsApp/LLM). Where the exact tech stack is not published, it is marked as **inferred / undisclosed**.

## Comparison table

| Criteria | **TravelJoy** | **Travefy** | **Tourism AI agents** (standalone chatbots / copilots) |
|---|---|---|---|
| **Functionality** | Full CRM (contacts, tasks, Google/Outlook calendar sync, forms, contracts, invoices). Itinerary + Smart Proposals. Card payments/authorizations. AI Copilot + email automations. Groups. Add-ons: Zapier, SMS, email marketing, cruise booking. **Not** a native GDS (Sabre/Amadeus). | Drag-and-drop itinerary/proposal builder (core strength). CRM, invoices, commissions, agency reporting. Website/landing builder. Traveler mobile app (live flights, offline). AI Smart Import of confirmations. 200+ content suppliers. Strong on visual proposals + commission back office. | 24/7 chat/WhatsApp replies, FAQ, lead qualification, sometimes NL quoting. Rarely: real CRM pipeline, documents, finance, full traveler portal, deep white-label. Operates as a **conversational layer**, not an agency OS. |
| **UX** | Digital workspace for the advisor: trip flows, proposals, collections. Oriented to independent advisor / host-agency productivity. End client receives branded proposals/itineraries. | Highly visual: “wow” itineraries, option comparison, mobile-first for the traveler. Agencies value client-facing presentation. Low curve to build trips; denser on commissions/teams. | Chat UX: fast and familiar. Fragile when the user needs history, payments, docs, or trip changes — usually jumps to humans/Excel. |
| **Technologies** | **Cloud SaaS web** (front/back stack **not published**). Payments via **Stripe**. Integrations via **Zapier**. Embedded AI Copilot. Calendar sync. US/host-agency focus. Client delivery mainly **branded web**, not a documented first-party native app as the core product. | **Cloud SaaS web + client mobile apps**. AI document parsing (Smart Import). Content library + supplier integrations. **PCI-DSS compliant** (stated). Internal stack undisclosed (typical pattern: SPA + cloud API + object storage + mobile clients). | Typical pattern: **LLM** (OpenAI/Anthropic/Gemini) + orchestration (LangChain/n8n/custom) + **WhatsApp Cloud API / Instagram** + simple DB (Postgres/Mongo) + sometimes RAG. Front: web widget or messaging-only. Little factory “agency-grade” multi-tenancy. |
| **Architecture / data** | Multi-user per advisor; team seats as add-on. Data centered on the advisor’s trips/clients. Not positioned as full agency white-label OS (own logo/domain/AI per agency) as the product axis. | Built for advisor **and** agency seats (~US$20/seat). Commission/payout data at team level. Traveler portal/app tied to the trip. | Often **single-tenant or one bot account**. Short conversational memory. Risk of mixed contexts without `agencyId` / isolation design. |
| **Business model** | Subscription **per advisor**: Starter ~**US$19/mo** (12 trips/year, no AI). Pro ~**US$39/mo** or ~**US$32** annual. Premium ~**US$149/mo** (+ Zapier, SMS, marketing, cruises). **Payment take-rates**: Starter 5%+$0.30 card; Pro 3.5%+$0.30; cheaper ACH on Pro. 7-day trial. | Subscription per advisor/agency: New Agent ~**US$25/mo**; Core ~**US$39**; Premium ~**US$59**; Agency seats ~**US$20**/mo (annual). ~10-day trial. Monetizes software more than payment take-rate. | Flat subscription, **usage** (tokens/messages), or custom project. High software margins; variable LLM cost. Upsell by channel (WhatsApp fees + platform). |
| **Security** | Strong focus on collections (Stripe/PCI via processor). SaaS account auth, HTTPS. Forms/signatures/card authorizations. Fine-grained MFA/SSO is not the main public claim. | **PCI-DSS** stated, standard encryption, security team. Platform auth + protection of client/trip data. More explicit on payments/data compliance. | Highly **heterogeneous**. Good practice: OAuth, secrets in vault, encryption, PII redaction in prompts. Common failures: keys in frontend, logs with passport data, no RBAC or audit trail. |
| **Performance / scale** | Good for individual advisors / small–mid teams. Bottlenecks: AI automations and proposal PDFs under load. Not oriented to mass call-center or voice AI. | Strong itinerary edit/view and mobile sync. Smart Import can take **minutes** (async). Scales with agency seats; commission reporting is batch-heavy. | Latency dominated by **LLM** (1–15 s). WhatsApp spikes need queues. Cheap to start; unstable/expensive without cache, rate limits, and workers. |
| **Channels / LATAM fit** | Email + web + SMS (premium). US/host-agency market focus. WhatsApp is **not** the product center. | Web + traveler app + email. Less “WhatsApp-first” than LATAM agencies need day to day. | **WhatsApp-native** (regional advantage). Weak across the rest of the operating ecosystem. |
| **Gap vs TravelOS** | Excellent CRM + payments + advisor itinerary, but not a full **agency OS** (voice AI, per-agency learning, deep portal, LATAM omnichannel, full white-label). | Leader in visual itineraries and commissions; weaker as “24/7 AI sales agent + NL quoter + per-agency knowledge isolation” operating system. | Wins response speed; loses centralization, metrics, documents, finance, and knowledge retention. |

## Solution ideas for TravelOS (from this diverge)

1. **Explicit modern stack** (ours): Next.js + NestJS + PostgreSQL/Prisma + Redis/BullMQ + OpenAI + strict multi-tenancy — clearer academic/technical narrative than closed-stack competitors.
2. **WhatsApp-first + portal + CRM + quoter** in one product (close the TravelJoy/Travefy vs chatbot gap).
3. **AI with knowledge per `agencyId`** (tone/policies), not a generic copiloto.
4. **White-label** (logo, domain, app) as LATAM commercial differentiator.
5. **Async workers** for PDF/AI (avoid latency pain already visible in Smart Import / Copilot).

## References

- [TravelJoy](https://traveljoy.com/)
- [TravelJoy Premium](https://traveljoy.com/premium.html)
- [Travefy](https://travefy.com/)
- [Travefy Pro](https://www.travefy.com/pro)
