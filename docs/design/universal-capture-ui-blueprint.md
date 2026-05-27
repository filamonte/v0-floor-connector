# Universal Capture UI Blueprint

Status: Planned
Doc Type: Design

## Purpose

Universal Capture is the future contractor-side UX pattern for recording
operational intent before the user knows the perfect destination record. It
should make FloorConnector feel like a reliable operating memory: quick enough
for a phone call, structured enough to resolve into canonical work, and safe
enough to avoid hidden customer-facing commitments.

This is a UX and system-design blueprint only. It does not implement schema,
migrations, routes, components, server actions, runtime behavior, assistant
actions, notifications, or portal behavior.

## UX Philosophy

Universal Capture should feel like low-friction operational memory capture, not
a project-management app inside FloorConnector.

The product rule is:

1. Capture first.
2. Organize second.
3. Resolve into canonical records whenever possible.

The contractor mental model is ordinary and urgent:

- "I need to remember this."
- "I need to follow up."
- "We should quote this later."
- "Group this with nearby estimates."
- "Remind me when I am near this area."
- "Need to call the customer back."

The UI should keep that mental model intact. It should not ask the contractor to
complete a full project, estimate, appointment, Work Item, communication, or
schedule workflow when they only need to capture the next operational intention.

Universal Capture is not:

- a disconnected task app
- a second CRM
- a second opportunity/project model
- a giant form workflow
- an AI-only inbox
- a customer-facing booking tool

## Universal Entry Points

Universal Capture should eventually be available anywhere a contractor can lose
context:

- top shell universal create/capture control
- dashboard
- Customer Workspace
- Project Workspace
- Opportunity Workspace
- Estimate Workspace
- Contract Workspace
- Invoice Workspace
- Jobs Manager Page and Job Workspace
- CrewBoard / schedule surfaces
- Communications Layer later
- mobile quick capture later

The entry point should preserve source context. Opening capture from a Project
Workspace should feel different from opening it globally because the project,
customer, and likely work type are already known.

## Context-Aware Behavior

The capture sheet should prefill only what can be inferred safely:

- current record auto-linked as source context
- customer/project derived from the current record where available
- job linked when capture starts from Job Workspace or schedule context
- estimate, contract, invoice, opportunity, or communication thread linked
  when capture starts from those records
- location or service area inferred from customer/project/job address where
  available
- assignee defaulted from the current user, record owner, responsible person,
  or role strategy only when that mapping is explicit
- suggested capture type based on page context

Suggested defaults should remain editable. A user should be able to change
"finance follow-up" to "callback" without losing the invoice link, or change
"field follow-up" to "site visit" without creating a job mutation.

## Capture Modal / Sheet Blueprint

V1 should be a compact modal or side sheet, not a full workspace. The ideal
shape is a fast composer with progressive disclosure.

Visible V1 fields:

- Title
- Short note
- Capture type
- Due date or review date
- Assignee
- Linked record
- Priority
- Geographic grouping / route intent
- Optional scheduling intent

Required fields:

- Title
- Capture type, defaulted when launched from a context where the type is clear

Conditionally required fields:

- Customer, project, or source record when the selected destination requires a
  canonical link
- Assignee only when the selected resolution is a Work Item assignment

Optional fields:

- Short note
- Due date
- Priority
- Route/area note
- Preferred time window
- Convert/create related record later
- Suggested resolution destination

Advanced fields should stay behind disclosure:

- additional canonical links
- route/area tags
- source route/source label
- conversion target such as Work Item, opportunity, appointment, communication
  draft, or schedule handoff
- assistant-prepared metadata later
- internal visibility/audit context later

V1 should not include:

- file upload
- comments
- recurring reminders
- notification automation
- provider email/SMS sends
- map routing UI
- route optimization
- bulk scheduling
- portal sharing
- AI-autonomous actions
- full project or estimate creation wizard

The sheet copy should reinforce the boundary: capture is internal by default,
and customer-facing action requires a later explicit workflow.

## Contextual Smart Defaults

Examples:

- From Customer Workspace: "Callback" auto-links the customer and offers
  follow-up, estimate need, site visit, and internal task as likely types.
- From Project Workspace: "Field follow-up" auto-links project and derived
  customer, and can suggest Work Item or job-linked follow-up when a job is in
  context.
- From Job Workspace: "Field follow-up" or "schedule intent" preserves job,
  project, and customer context without changing job status.
- From Invoice Workspace: "Finance follow-up" or "collections follow-up" is
  suggested with the invoice, project, and customer linked.
- From Estimate Workspace: "Estimate follow-up" or "site visit" is suggested
  with opportunity/project/customer context where present.
- From CrewBoard: "Need estimate in nearby town" can suggest route grouping or
  schedule intent instead of creating a committed appointment.
- From Communications later: a customer message can become a reply draft,
  callback, Work Item, or opportunity handoff depending on the reviewed intent.

## Relationship To Work Items

Work Items remain the canonical internal action and assignment concept.
Universal Capture is the entry and resolution layer above Work Items and other
records.

Universal Capture should create or link a Work Item when the captured intent is
an internal action:

- call a customer back
- measure a wall before quoting
- inspect a coating failure
- collect current-condition photos
- follow up on an overdue deposit
- ask a field lead for completion evidence

Universal Capture should remain lightweight or unresolved when:

- the user only knows there is something to remember
- the destination record is ambiguous
- the intent is route/geographic grouping rather than an assignment
- the user needs to review whether to create an opportunity, appointment, or
  Work Item

Universal Capture should create or prepare canonical records directly when the
destination is clear and the user confirms:

- new quote request becomes an opportunity or estimate-start handoff
- onsite consultation becomes an appointment/site-visit scheduling handoff
- customer reply becomes a communication draft or message workflow
- production work stays on jobs and scheduling

Escalation to a fuller workflow should happen after capture, not inside the
quick sheet. The quick sheet should route the user to the proper Record
Workspace or Quick-Create flow when the work needs real authoring.

## Dashboard And Queue Visibility

Future visibility should help teams find captured intent without creating a
standalone task world.

Candidate queues:

- My Follow-Ups
- Upcoming Site Visits
- Estimate Needs By Area
- Waiting On Customer
- Grouped Estimate Opportunities
- Needs Scheduling
- Overdue Operational Follow-Ups

Every queue row should show the canonical context first: customer, project,
job, opportunity, invoice, estimate, or communication thread where known. The
queue is a lens over source-linked intent and resolved records, not a separate
source of truth.

Dashboard visibility should answer:

- what needs action
- who owns it
- when it needs review
- what canonical record it is attached to
- where the user should go next

## Geographic / Route Grouping UX

Route grouping is a core contractor use case, not decoration.

Typical flow:

1. An existing customer requests a quote for new work.
2. The site is far away.
3. The contractor does not want to commit to a visit immediately.
4. The contractor captures the estimate need with regional intent.
5. Later, the schedule or assistant layer can suggest grouping nearby estimate
   visits.
6. The contractor confirms the actual customer communication or appointment.

The capture UI should support:

- area label such as "Westfield" or "north side"
- target address snapshot from known customer/project context
- rough location text when no canonical address exists
- route grouping note such as "group with nearby estimate visits"
- preferred time window
- review date such as "check by Friday"
- internal scheduling note that is not visible to the customer

Later UX possibilities:

- service-area chips
- map preview inside schedule planning
- route batch suggestions
- "estimate route" queue by area
- assistant-supported grouping across open estimate needs

V1 should not attempt route optimization. It should store or prepare the
contractor's intent so a later scheduling surface can use it safely.

## Assistant Interaction UX

Assistant interaction should use the same capture model after manual capture is
proven.

Example prompts:

- "Remind me to call Sue Friday."
- "Schedule estimate next time I am near Hartford."
- "Create follow-up for unpaid deposit."
- "Group these three estimate visits together."

Future assistant flow:

1. User states intent.
2. Assistant drafts a structured action.
3. Assistant proposes linked records, type, note, due date, assignee, route
   intent, and destination.
4. Contractor reviews and edits.
5. Contractor confirms.
6. Only then does FloorConnector create records, update approved records, draft
   communication, or prepare scheduling handoff.

Explicit prohibitions:

- no autonomous booking
- no autonomous customer messaging
- no hidden workflow mutations
- no AI-only scheduler
- no AI-only customer, project, task, or communication truth

## Mobile Direction

Mobile quick capture should become field-safe and faster than desktop capture.

Principles:

- one-tap entry from mobile shell or record header
- title-first capture
- fast note entry
- voice input later
- minimal fields on first open
- clear linked-record chip
- due/review date shortcut controls
- route-aware suggestions later
- no dense management grid on mobile

Mobile capture should help a contractor preserve context while walking a job,
driving between estimates, or leaving a customer call. It should not require a
full workflow decision before saving the memory.

## Relationship To FloorConnector Architecture

Universal Capture should extend existing FloorConnector architecture:

- Quick-Create philosophy: fast entry, canonical handoff.
- Manager Page system: capture can start from Manager Pages, but resolved work
  should route into Record Workspaces.
- Project-centered continuity: project context should be preserved whenever it
  exists.
- Operational guidance: capture can feed future cues and follow-up surfaces
  without becoming a duplicate cue system.
- Canonical workflow chain: accepted actions must route through the same
  lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

- Assistant-reviewed actions: AI can prepare, but the contractor confirms.

The capture UI should feel like a small operating layer on top of the existing
system, not a new module with its own worldview.

## Guardrails

- No disconnected task silo.
- No duplicate customer, opportunity, project, job, schedule, invoice, or
  communication models.
- No giant project-management app drift.
- No replacement for Work Items.
- No replacement for Quick-Create.
- No replacement for canonical lifecycle records.
- No parallel scheduling system.
- No AI-autonomous workflow execution.
- No customer-facing sends or bookings without contractor confirmation.
- No portal visibility by default.
- No hidden mutations to projects, jobs, invoices, payments, contracts,
  estimates, communication threads, Daily Logs, or Field Notes.

## Open UX Decisions Before Build

- Should the first UI slice be direct-to-destination only, or should it include
  unresolved capture items?
- Which capture types should be visible in the first quick sheet?
- Does route/geographic intent start as a freeform note, area tag, or typed
  location fields?
- Which pages should launch Universal Capture first?
- Which dashboard queues matter most for V1?
- How should assignee defaults work when a user account is not linked to a
  Person record?
- When should the capture sheet route to an existing Quick-Create flow instead
  of saving a lightweight capture?

## Explicit Non-Goals

- No code implementation.
- No schema or migration.
- No route or component.
- No runtime behavior.
- No provider sends.
- No customer portal exposure.
- No AI execution.
- No mobile build.
- No route optimization.
- No replacement for Work Items, opportunities, appointments, communications,
  jobs, schedules, Daily Logs, Field Notes, or existing Quick-Create flows.
