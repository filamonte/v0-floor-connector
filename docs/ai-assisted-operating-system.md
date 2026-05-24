# AI-Assisted Operating System

Status: target direction and planning guardrail only.

This document describes FloorConnector's long-term AI-assisted operating system direction. It does not describe implemented product behavior unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says that behavior exists.

Related focused docs:

- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md): contractor-facing AI workflow direction
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md): unified communications, intake, website chat, voice, and human handoff direction
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md): calendar, scheduling, resource, and external calendar integration direction
- [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md): FloorConnector-facing marketing, sales, onboarding, activation, and support AI direction

Ownership note: this document describes broad AI-assisted operating-system
planning. [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md)
owns the umbrella long-term agentic strategy and governance posture.

## Core Principle

AI is an operating layer, not a parallel system.

AI may draft, suggest, summarize, prepare, classify, route, and orchestrate work. It must not create duplicate business models, bypass canonical workflows, or become a separate source of truth.

The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Future AI behavior must route through the same canonical records, tenant-scoped permissions, validated server-side actions, readiness gates, and human confirmation where risk exists.

AI-specific duplicate models are not desired. Do not plan `ai_leads`, `ai_customers`, `ai_estimates`, AI-only calendars, AI-only communication logs, AI-only projects, or separate AI workflow chains. AI outputs should be drafts, recommendations, summaries, or approval-ready action proposals attached to canonical records.

## Two AI Audiences

FloorConnector has two distinct AI audiences.

### Contractor-Facing AI

Contractor-facing AI helps specialty surface contractors operate their own business.

Target uses include:

- capturing or drafting opportunities from natural language
- preparing estimate, project, or site-assessment drafts
- summarizing customer conversations and project history
- suggesting appointment times, readiness blockers, and next best actions
- drafting customer follow-ups, collections messages, and internal handoff notes
- warning about scheduling, billing, readiness, or compliance risk
- preparing action proposals for contractor approval

This AI operates inside the contractor app and future portal-adjacent workflows. It acts on the contractor organization's canonical tenant records and must preserve tenant isolation.

### FloorConnector-Facing AI

FloorConnector-facing AI helps FloorConnector market, sell, onboard, activate, support, and retain contractor customers.

Target uses include:

- public website Q&A and demo qualification
- signup and setup assistance
- module or plan recommendation
- activation guidance through first project, first estimate, and first successful workflow
- support triage and documentation answers
- import or migration guidance
- sales and success team summaries

This AI is separate from contractor operations AI. It may help FloorConnector understand a prospect or account journey, but it should still respect the same safety rules: canonical records stay authoritative, provider data is not the business source of truth, and risky actions require human confirmation.

## Long-Term AI Layers

### Contractor AI Copilot

Target direction:

- contextual assistant available from the contractor app
- understands the current record, tenant, permissions, and workflow stage
- can answer "what should I do next?" using canonical project, estimate, contract, job, invoice, payment, schedule, communication, and readiness context
- proposes action plans that route through existing workflows

Not implemented unless current-state says otherwise.

### Unified Communications

Target direction:

- email, SMS, portal messages, app messages, manual phone logs, voicemail notes, missed-call text-back, and customer replies attach to canonical communication threads and messages
- AI can classify, summarize, draft replies, identify open questions, and suggest follow-up timing
- provider delivery events enrich FloorConnector communication history but do not replace canonical communication records

Not implemented at full depth unless current-state says otherwise.

### Calendar And Scheduling Intelligence

Target direction:

- FloorConnector owns the canonical schedule for jobs, appointments, crews, users, resources, PTO, holidays, and equipment reservations
- Google Calendar and Outlook/Microsoft 365 are sync and availability integrations, not sources of truth
- AI can suggest times, detect conflicts, explain blockers, and prepare schedule changes for approval

Not implemented at full depth unless current-state says otherwise.

### AI Website Chat And Intake

Target direction:

- public website assistant can answer product, pricing, fit, and demo questions
- qualified inquiries route into canonical intake/opportunity workflows
- AI may draft qualification notes and recommended next steps
- human sales or contractor confirmation is required before commitments or customer-facing promises

Not implemented unless current-state says otherwise.

### AI Receptionist / Voice

Target direction:

- voice assistant can answer calls, capture inquiry details, detect urgency, summarize voicemail, and prepare callbacks
- missed-call text-back can route into the same canonical communication history
- human escalation handles urgent, unclear, sensitive, or high-value cases
- call recording and consent requirements must be planned before implementation

Not implemented unless current-state says otherwise.

### Onboarding And Setup Assistant

Target direction:

- guide new contractors from visitor to signup, setup, activation, first project, first estimate, and first successful workflow
- recommend configuration based on company type, trade, size, and operating model
- explain module readiness and setup gaps
- avoid fake setup records, sandbox-only data, or duplicate onboarding models

Not implemented unless current-state says otherwise.

### Support Assistant

Target direction:

- answer how-to questions from docs and implemented product state
- summarize account context for support and success teams
- draft troubleshooting steps or operator notes
- escalate to a human when confidence is low or a real account action is required

Not implemented unless current-state says otherwise.

### Operational Intelligence

Target direction:

- summarize pipeline, readiness, scheduling, collections, and production risk across canonical records
- highlight blocked jobs, aging estimates, open invoices, stale customer replies, and over-capacity windows
- prepare recommendations without mutating records automatically

Not implemented unless current-state says otherwise.

### Human Escalation And Approval Queues

Target direction:

- AI-generated actions should land in approval queues when they affect customer commitments, money, legal state, scheduling commitments, permissions, or compliance
- approval records should point back to the canonical subject and proposed action
- humans approve, reject, revise, or delegate the action

Approval queues are an operating pattern, not a second business model.

## Safety And Execution Rules

Future AI actions must:

- use canonical server-side workflows and validated inputs
- preserve tenant isolation and role-aware permissions
- attach communication, schedule, and action context to canonical records
- respect project readiness gates and workflow blockers
- keep contractor app and portal as two surfaces on the same records
- treat external providers as adapters or delivery/sync surfaces
- require human confirmation for risky actions unless explicit configuration later allows low-risk automation

Future AI must not:

- bypass pricing, estimate approval, contracts, signatures, billing, payments, customer commitments, scheduling readiness, permissions, or compliance
- create separate AI business records that compete with canonical entities
- send customer-facing messages, schedule appointments, change prices, generate contracts, invoice customers, or collect payments without the approved workflow path and required human confirmation
- present target-only capabilities as implemented behavior

## Planning Sequence

Recommended sequence:

1. Documentation and architecture planning.
2. First vertical slice: lead communication plus appointment scheduling foundation.
3. Communication timeline and unified inbox.
4. External calendar integrations.
5. AI-assisted drafting and summaries.
6. Website chat and onboarding assistant.
7. AI voice/receptionist.
8. Operational intelligence.

Each slice should extend the canonical lifecycle and current implemented foundations rather than creating a parallel AI product.
