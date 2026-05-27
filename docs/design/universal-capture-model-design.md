# Universal Capture Model Design

Status: Planned
Doc Type: Design

## Purpose And Problem

Manual Universal Capture is a future contractor-side operating pattern for
capturing lightweight intent from anywhere in FloorConnector before the user
knows the perfect destination record.

The problem is ordinary contractor friction:

- an existing customer calls and asks for a quote on new work
- the site is far enough away that the estimator wants to group visits by area
- someone needs a callback, reminder, follow-up, or onsite consultation
- office staff needs to capture an estimate need before all project context is
  known
- field, finance, or operations needs a small action tied back to a real record

The goal is capture first, organize second. FloorConnector should let the user
record the intent quickly, then attach it to canonical records whenever the
context is known or becomes known.

This is planning only. No schema, migrations, routes, UI, or runtime behavior
are implemented by this document.

## Core Principles

- Capture first, organize second.
- Attach to canonical records whenever possible.
- Keep the canonical lifecycle intact:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

- Treat Universal Capture as operational continuity infrastructure, not a
  standalone task app.
- Do not duplicate customers, opportunities, projects, jobs, appointments,
  communication threads, or Work Items.
- Do not create assistant-only customer, project, calendar, scheduler, or task
  truth.
- Do not take autonomous customer-facing action.
- Assistant-prepared actions must remain review-only until the contractor
  explicitly confirms the action through an approved workflow.

## Product Concept

Recommended product language:

- **Universal Capture**: the cross-app entry point for quick operational intent.
- **Capture Item**: the temporary or durable captured intent record, if a
  distinct record is needed.
- **Resolved Record**: the canonical record created or linked after the capture
  is organized.

Universal Capture should be a pattern over canonical records. It should not
mean every captured thing becomes a task. A callback may become a Work Item. A
new quote request may become an opportunity. A visit request may become an
appointment. A customer reply may become a communication draft. A route grouping
preference may remain internal scheduling intent until a real appointment is
confirmed.

## Candidate Record Model

The first implementation decision should be whether manual capture needs a new
small table or can initially route directly into existing records.

### Option A - Extend `work_items`

Use `work_items` as the V1 persistence layer for manual Universal Capture
items that are internal follow-through actions.

Pros:

- Reuses the existing tenant-scoped internal action foundation.
- Already supports title, description, status, priority, kind, due date,
  assigned person, source links, customer/project links, metadata, creator,
  updater, completion fields, and timestamps.
- Avoids a new task silo.

Limits:

- Not every capture is a Work Item.
- Estimate needs, site visits, appointments, and customer communication drafts
  can become awkward if flattened into generic tasks.
- Route/geographic grouping intent may need fields or metadata that should not
  pollute all Work Items.

### Option B - Add `capture_items`

Create a narrow `capture_items` table later for unresolved or multi-destination
intent.

Pros:

- Represents "captured but not fully organized yet" honestly.
- Can support route/geographic grouping, suggested destination, and assistant
  review metadata without overloading Work Items.
- Can resolve into a Work Item, opportunity, appointment, communication draft,
  schedule handoff, or project/customer note.

Limits:

- Adds a new operational record, so it must be tightly scoped and explicitly
  non-canonical for customer/project truth.
- Requires clear resolution rules so it does not become a second task system.

### Option C - No New Table First

Build Universal Capture as a smart Quick-Create launcher that routes directly
into existing create flows.

Pros:

- Lowest schema risk.
- Preserves existing canonical create paths.
- Good first slice if the product only needs fast manual capture for known
  destinations.

Limits:

- Weak for unresolved "park this until I know where it belongs" intent.
- Weak for route/geographic grouping and reminder-style follow-through that
  does not yet have a canonical destination.

### Recommendation

Use a two-step design:

1. V1 manual capture should route directly into existing canonical records when
   the destination is clear, especially Work Items, opportunities, appointments,
   communications, and schedule handoffs.
2. Add a narrow `capture_items` model only if unresolved, multi-destination, or
   route-grouping intent cannot be handled cleanly by existing records.

Do not rename Work Items into Universal Capture. Work Items remain the
canonical internal action/assignment concept. Universal Capture is the entry and
resolution layer above Work Items and other canonical records.

## Candidate Fields

If a future `capture_items` model is approved, it should stay small.

Required fields:

- `id`
- `company_id`
- `title`
- `capture_type`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Recommended optional fields:

- `notes`
- `priority`
- `due_at`
- `owner_person_id`
- `assignee_person_id`
- `source_context_type`
- `source_context_id`
- `source_route`
- `source_label`
- `customer_id`
- `opportunity_id`
- `project_id`
- `estimate_id`
- `contract_id`
- `invoice_id`
- `job_id`
- `daily_log_id`
- `field_note_id`
- `communication_thread_id`
- `appointment_id`
- `resolved_record_type`
- `resolved_record_id`
- `resolved_at`
- `resolved_by`
- `dismissed_at`
- `dismissed_by`
- `route_grouping_intent`
- `service_area_label`
- `target_location_text`
- `target_address_snapshot`
- `target_latitude`
- `target_longitude`
- `preferred_time_window`
- `metadata`
- `assistant_metadata`

Reserved later fields should stay inert until approved:

- assistant confidence
- assistant extracted entities
- assistant suggested destination
- assistant draft customer copy
- assistant policy/approval reason
- external send eligibility
- external booking eligibility

## Capture Types

Initial candidate types:

- `callback`
- `reminder`
- `follow_up`
- `site_visit`
- `onsite_consultation`
- `estimate_need`
- `customer_request`
- `internal_task`
- `schedule_intent`
- `field_follow_up`
- `finance_follow_up`

Capture type should describe the user's intent, not force the storage
destination. For example, `site_visit` may resolve to an appointment,
opportunity, project note, or Work Item depending on available context.

## Status Model

Use a small lifecycle:

- `open`: captured and still needs action or organization
- `planned`: reviewed and waiting on a planned next step
- `scheduled`: converted into or linked to a scheduled appointment/job context
- `completed`: finished or resolved
- `canceled`: intentionally not pursued

Avoid a broad workflow state machine in V1. Source records still own their own
state. A capture item should not become a second appointment status, project
status, job status, invoice status, or opportunity pipeline.

## Canonical Link Rules

Universal Capture should prefer the most specific safe link:

- Customer known, no sales record yet: link customer and suggest an opportunity
  or callback Work Item.
- Opportunity known: link opportunity and optionally customer/project if already
  present.
- Project known: link project and derived customer.
- Job known: link job, project, and customer.
- Estimate/contract/invoice known: link the source record plus project/customer.
- Daily Log or Field Note known later: link the field record and its
  project/job context.
- Communication context known: link the thread/source record and keep
  customer-visible messaging in canonical communications.

If the capture cannot be linked safely, keep it organization-scoped,
internal-only, and unresolved until a user chooses the correct customer,
opportunity, project, or source record.

## UX Rules

Manual Universal Capture should follow these rules:

- Entry can appear in the shell universal create/capture control.
- Context-aware defaults should come from the current page.
- Minimum required fields should be title and capture type, plus customer or
  project when the source context requires it.
- A global capture should not force full project creation if the user only knows
  "call this customer back."
- A project capture should auto-link the project and derived customer.
- A customer capture should prefer customer context and ask whether this is a
  follow-up, new opportunity, site visit, or general internal action.
- A job capture should preserve job/project/customer context.
- The capture form should stay short; deeper work belongs in the resolved
  Record Workspace.
- Dashboard should surface unresolved/open captures and due follow-ups.
- Related Record Workspaces should show captures linked to that record.
- Mobile-friendly quick capture should be a later UX slice after the core model
  is approved.

## Relationship To Work Items

Work Items are already the canonical internal task/assignment concept.
Universal Capture should use Work Items when the captured intent is an internal
action:

- "Call Sue Friday."
- "Measure west wall before quoting."
- "Ask field lead for photos."
- "Follow up on overdue deposit."
- "Check whether the garage needs moisture mitigation."

Universal Capture should not use Work Items as a dumping ground for everything.
These should prefer other destinations:

- New quote request: opportunity or estimate-start handoff.
- Onsite consultation: appointment/site-visit scheduling handoff.
- Customer-visible reply: communication draft or message workflow.
- Scheduled production work: job and schedule workflow.
- Field narrative: Daily Log or Field Note.
- Evidence/photo proof: existing or future evidence attachment model.

Recommended V1 relationship:

- Universal Capture is the entry pattern.
- Work Items are one possible resolved destination.
- `capture_type = internal_task`, `field_follow_up`, `finance_follow_up`, and
  some `callback` / `follow_up` items can resolve to Work Items.
- `site_visit`, `onsite_consultation`, `estimate_need`, and `schedule_intent`
  should usually resolve to opportunity, appointment, or scheduling workflows.

## Relationship To Assistant

Assistant-driven capture should come after manual capture is proven.

Future flow:

1. User states intent in plain language.
2. Assistant extracts a structured draft.
3. Assistant finds likely canonical records, such as customer, opportunity,
   project, or job.
4. Assistant proposes the capture type, notes, destination, due date, assignee,
   route/geographic intent, and customer communication draft when useful.
5. User reviews and edits the proposed action.
6. User confirms.
7. Only then does the system create or update records or initiate an approved
   communication/scheduling workflow.

The assistant should not:

- create hidden records
- send customer communication
- book appointments
- mutate project/job/financial state
- create AI-only customer/project/calendar truth
- bypass tenant permissions or readiness gates

## Route / Geographic Grouping

The specific contractor use case:

> Existing customer asks for new work, but the site is over an hour away. The
> contractor wants to remember the estimate need and schedule the onsite
> consultation when other visits are grouped nearby.

Universal Capture should support:

- target service area or area label
- target address snapshot from customer/project context
- rough location text when no canonical address is selected yet
- route grouping note such as "group with Westfield estimate visits"
- preferred deadline or review date
- reminder due date such as "check by Friday if nothing is grouped"
- internal scheduling note that is not visible to the customer

This should not become route optimization in V1. It is internal scheduling
intent. A real appointment, customer communication, or calendar commitment
should happen only after contractor confirmation.

Example capture:

- Type: `estimate_need`
- Title: `Quote Sue garage coating`
- Customer: Sue's existing customer record
- Notes: `Customer wants us back out for garage coating. Check west wall and
coating failure.`
- Route grouping intent: `Group with Westfield or north-side estimate visits.`
- Due: Friday review
- Suggested resolution: create opportunity plus site-visit appointment draft

## Manual V1 Scope

Recommended first implementation slice later:

1. Product copy and route-level IA for Universal Capture entry.
2. Destination picker over existing records: Work Item, opportunity follow-up,
   appointment/site visit, communication draft, schedule intent.
3. Context-aware prefill from current page.
4. No new table if direct destinations are enough.
5. If unresolved intent is necessary, add `capture_items` with strict tenant
   RLS, internal-only visibility, and explicit resolution fields.
6. Dashboard and related-record read models for unresolved/open captures.
7. Tests for tenant scoping, destination validation, source context linking,
   no portal leakage, and no hidden source-record mutation.

## Guardrails

- No disconnected task app.
- No duplicate CRM/project/opportunity records.
- No duplicate Work Item system.
- No assistant-only scheduler.
- No autonomous sends or bookings.
- No hidden workflow mutations.
- No portal/customer visibility by default.
- No schema, migrations, routes, UI, server actions, or runtime behavior in
  this planning pass.
- No direct mutation of opportunity, appointment, project, job, invoice,
  payment, contract, communication, Daily Log, or Field Note state from merely
  capturing intent.
- No fake data or local-only persistence.

## Open Decisions Before Build

- Is direct-to-existing-record capture enough for V1, or is an unresolved
  `capture_items` table needed?
- Should `route_grouping_intent` begin as metadata or typed fields?
- Which destination types should be available in the first manual UI?
- Should callback/reminder behavior start as Work Items, capture items, or
  existing opportunity follow-up fields?
- Should schedule intent resolve into appointments first, or stay as internal
  capture until a scheduling workspace slice exists?
- Which roles can create, assign, resolve, or dismiss captures?
- What read model owns dashboard surfacing without creating another queue?

## Explicit Non-Goals

- No implementation in this pass.
- No schema or migration in this pass.
- No Universal Capture Manager Page.
- No assistant execution.
- No provider AI calls.
- No customer email/SMS.
- No appointment booking.
- No route optimization.
- No portal exposure.
- No direct attachments.
- No replacement for Work Items, opportunities, appointments, communications,
  jobs, schedules, Daily Logs, Field Notes, or existing Quick-Create flows.
