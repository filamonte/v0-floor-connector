# AI Contractor Workflows

Status: target direction and planning guardrail only.

This document describes future contractor-side AI behavior. It does not describe implemented product behavior unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says that behavior exists.

Use this with:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)

## Principle

Contractor AI should help the contractor operate the existing FloorConnector system. It should not become a second CRM, estimator, calendar, inbox, project system, or billing system.

The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

AI can suggest and draft. Humans approve risky actions. Approved actions route through existing canonical workflows, permissions, tenant isolation, and server-side validation.

## Target Contractor AI Capabilities

### Natural-Language Lead Creation

Target direction:

- contractor enters or speaks a plain-language inquiry
- AI extracts likely contact, source, service type, location, requested timing, notes, and urgency
- AI drafts a canonical opportunity and suggested appointment context
- user confirms before any canonical opportunity or communication is created

No `ai_leads` model should exist. The accepted output should become or update a canonical opportunity.

### Project And Estimate Drafting

Target direction:

- AI can draft project scope notes, site assessment summaries, estimate titles, customer-facing scope language, exclusions, and internal prep notes
- AI can suggest catalog items, systems, quantities, or estimate structure where enough reviewed input exists
- generated estimate content must remain reviewable and explicitly approved before becoming customer-facing estimate content

AI must not bypass catalog/cost item behavior, estimate line item validation, tax logic, approved snapshot behavior, or downstream contract/invoice lineage.

### Appointment Scheduling

Target direction:

- AI can suggest site visit, sales appointment, job, crew, or follow-up windows
- suggestions should consider canonical appointments, jobs, crew/resource calendars, readiness blockers, PTO, holidays, and external busy blocks where available
- user confirmation is required before committing appointments, job schedule changes, crew assignments, or customer-facing confirmations

AI scheduling must use canonical appointments and jobs. It must not create an AI-only calendar.

### Customer Follow-Up Drafting

Target direction:

- AI drafts replies, estimate reminders, contract follow-ups, invoice/collection messages, and post-job check-ins
- drafts are based on canonical record status, communication history, customer context, and user intent
- consent, opt-out, quiet hours, linked-contact visibility, and portal permissions must be respected before sending

AI must not send provider-backed customer communications unless an approved send workflow allows it.

### Project Summaries

Target direction:

- AI summarizes project history, open blockers, estimate/contract/job/invoice/payment state, recent communications, and next recommended action
- summaries should link back to canonical records and should be treated as readable memory, not source-of-truth data

### Collections Assistance

Target direction:

- AI identifies open invoices, aging status, payment history, prior communication, and suggested next collection step
- AI drafts contractor-approved follow-up messages
- payment requests, checkout links, balance changes, voids, refunds, and reconciliation still route through canonical invoice/payment workflows

AI must not change invoice/payment status or initiate collection actions without the approved workflow path.

### Job And Readiness Warnings

Target direction:

- AI warns when a project appears not ready for scheduling, has missing contract/deposit/financing state, has crew/resource conflicts, or has execution blockers
- warnings should use the centralized readiness logic where implemented
- warnings should explain evidence and link back to the canonical records

AI must not bypass `assertProjectReadinessGate` or reinterpret readiness independently.

### What Should I Do Next Assistant

Target direction:

- user can ask what needs attention today
- AI ranks next actions across estimates, contracts, jobs, invoices, payments, communications, appointments, readiness blockers, and support tasks
- recommendations should stay tenant-scoped and role-aware

The assistant should route users into real Manager Pages, Record Workspaces, or approval queues. It should not become a separate task universe unless a canonical task system is implemented and approved.

### AI Action Approval Queue

Target direction:

- risky AI actions become approval-ready proposals
- proposal shows subject record, proposed action, evidence, generated draft, risk level, and required confirmation
- user can approve, edit, reject, or defer

Examples requiring approval:

- sending a customer message
- scheduling or rescheduling an appointment or job
- changing estimate content
- generating or sending a contract
- creating an invoice or payment request
- granting portal access or changing permissions
- committing to a customer-facing promise

Approval queue entries must attach to canonical records and call approved server-side actions. They should not own the business state.

## Safe Execution Rules

AI can:

- draft customer and internal copy
- summarize canonical history
- suggest next actions
- prepare form values
- classify communications
- identify likely duplicates or missing context
- propose schedule windows
- prepare approval-ready actions

Humans approve risky actions:

- customer-facing communication
- legal/commercial commitment
- price, tax, contract, invoice, payment, or deposit behavior
- scheduling commitments and crew/resource assignment
- permission or portal-access changes
- compliance-sensitive actions

AI actions must:

- route through canonical server-side workflows
- use validated inputs
- respect tenant isolation and role-aware permissions
- preserve canonical record lineage
- log or attach the result to the canonical subject where appropriate

## Explicit Prohibitions

Do not plan or implement:

- `ai_leads`
- `ai_customers`
- `ai_projects`
- `ai_estimates`
- AI-only calendars
- AI-only communication logs
- AI-only invoice or payment records
- AI-only project notes that become the source of truth
- AI actions that mutate workflow state outside approved server actions

AI should operate around canonical FloorConnector records, not beside them.
