# GateKeeper System Vision

Status: Planned
Doc Type: Architecture Doctrine

GateKeeper is the planned operational intelligence and communications layer for FloorConnector. It is target architecture only until [docs/current-state.md](C:/FloorConnector/docs/current-state.md) explicitly records implemented behavior.

Use this with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)
- [docs/gatekeeper-controlled-action-bridge.md](C:/FloorConnector/docs/gatekeeper-controlled-action-bridge.md)

Ownership note: GateKeeper docs own operational memory, source-adapter,
review-queue, and controlled-action bridge doctrine. For the umbrella long-term
agentic AI strategy, see
[docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

## 1. GateKeeper Vision

GateKeeper is not a standalone chatbot, AI receptionist, or assistant tab. It is the planned system layer that helps FloorConnector remember, interpret, and reinforce operational work across the contractor lifecycle.

GateKeeper exists because specialty surface contractors lose time and money when important details live in scattered calls, texts, emails, notes, PDFs, calendars, and human memory. FloorConnector already treats the canonical workflow as one connected chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

GateKeeper extends that philosophy into communications, operational memory, workflow guidance, and future intelligence. Its job is to make the system easier to run without creating a second source of truth.

Target outcome:

- customer and internal communication becomes readable operational memory
- work stays attached to the right customer, project, and canonical record
- follow-up, scheduling readiness, collection risk, and field handoffs become harder to forget
- contractors receive guidance at the point of work instead of hunting through disconnected tools
- AI prepares, summarizes, extracts, and recommends, while humans approve risky actions

The contractor should not have to remember every loose detail. The system should remember context, surface the next important step, and make the healthy workflow easier to follow.

## 2. Architectural Principles

### Canonical Continuity

GateKeeper must attach to the existing canonical graph. Communications, summaries, tasks, proposed actions, transcripts, scheduling suggestions, payment reminders, and operational warnings should link to real FloorConnector records where appropriate:

- opportunity
- customer
- project
- estimate
- contract
- change order
- job
- invoice
- payment
- communication
- workflow event

GateKeeper must not create duplicate leads, customers, projects, jobs, invoices, calendars, communication logs, or AI-only business records.

### No Disconnected AI Memory Silos

AI memory must not become a private knowledge base that competes with FloorConnector records. AI-generated summaries and recommendations may become reviewable annotations, communication history, proposed actions, or derived insights, but the underlying business truth remains the canonical record chain.

### No Disconnected Communication Databases

Calls, SMS, voicemail, email, web chat, portal messages, app messages, and manual logs should resolve into canonical communication records and timelines. Provider systems are adapters and telemetry sources, not the business source of truth.

### Multi-Line Communications Without Silos

FloorConnector should not assume one company has only one phone number or that all voice/SMS ownership belongs to the owner. Contractors may need company main lines, owner lines, sales rep lines, account manager lines, estimator lines, office/admin lines, department or team lines, after-hours assistant lines, campaign or tracking numbers, branch/location numbers, and later project-specific or temporary numbers.

Principle: **Bring your numbers. Keep your numbers. Leave with your numbers. Route them to the right people.**

Every managed line should remain tenant-owned/configured and should feed the same canonical communications and GateKeeper memory layer. A line may be assigned to a person, team, department, location, campaign, or assistant workflow, but it must not create a sales-rep-only CRM, account-manager inbox silo, or separate per-user communication truth.

### Human-Governed Operational Intelligence

GateKeeper may extract, suggest, identify, prepare, recommend, and escalate. It must not silently make customer-facing, financial, legal, scheduling, permission, compliance, or contract decisions.

Human approval is required before risky actions affect canonical records or customer commitments unless a later approved workflow explicitly configures narrow low-risk automation.

For scheduling, the first controlled execution should preserve canonical ownership: opportunity assessment state belongs to Opportunities, real appointments belong to Schedule/Appointments, and jobs belong to Jobs/Schedule. GateKeeper should prepare and audit intent, not bypass those owners.

### Workflow Reinforcement

GateKeeper should reinforce healthy contractor behavior:

- follow up on stale estimates
- identify unsigned contracts
- call out unpaid deposits
- find approved work that is not scheduled
- highlight missing crew or equipment readiness
- surface forgotten callbacks
- warn about collection or schedule risk

This is guidance and habit formation, not punishment.

### Shared Operational Timeline

GateKeeper should support a readable operational memory stream across customer, project, opportunity, and record workspaces. Timeline entries should summarize important communication and workflow events without replacing the source records that created them.

### Assistant Layers

GateKeeper should eventually support three related assistant layers:

- contractor assistant: helps the contractor operate their business
- customer-facing assistant: supports intake, communication, and safe customer answers
- platform/success assistant: helps FloorConnector onboard, support, activate, and retain contractors

These layers share the same anti-silo rules.

## 3. GateKeeper System Domains

### GateKeeper Voice

GateKeeper Voice is the planned customer-facing communication layer for phone and voice-adjacent workflows.

Target capabilities:

- inbound call handling
- missed-call text-back
- after-hours answering
- voicemail capture and summaries
- appointment request intake
- estimate follow-up support
- payment reminder support
- customer FAQ handling
- outbound confirmations
- SMS continuity
- web chat continuity where applicable

Future enhancements may include multilingual support, sentiment detection, escalation routing, urgency classification, and priority scoring.

Boundary:

- Voice does not own customer truth.
- Voice does not commit final pricing, contracts, payments, or schedule changes by itself.
- Voice outputs should become transcripts, summaries, proposed actions, or communication entries linked to canonical records.

### GateKeeper Ops

GateKeeper Ops is the planned internal operations assistant for contractor teams.

Target capabilities:

- workflow reminders
- stalled-project detection
- missing-step identification
- readiness enforcement support
- operational summaries
- task extraction
- follow-up enforcement
- scheduling continuity
- project health monitoring

Examples:

- unsigned contracts
- unscheduled approved work
- unpaid deposits
- stale estimates
- crew conflicts
- forgotten callbacks
- missing closeout evidence

Boundary:

- Ops does not bypass readiness gates.
- Ops does not create autonomous workflow mutations.
- Ops should route users to canonical workspaces and approval flows.

### GateKeeper Intelligence

GateKeeper Intelligence is the planned business understanding layer.

Target capabilities:

- estimating accuracy analysis
- close-rate analysis
- labor efficiency visibility
- margin leakage detection
- schedule delay analysis
- payment pattern analysis
- crew performance visibility
- communication quality review
- project profitability analysis
- operational bottleneck detection

Example insights:

- prep labor is regularly underestimated for a certain system type
- follow-up timing correlates with lost opportunities
- recurring schedule delays cluster around a crew, region, phase, or missing readiness step
- collections risk increases when payment requests are not sent promptly after milestone completion

Boundary:

- Intelligence produces analysis and recommendations.
- It must not rewrite historical records or claim certainty where data is incomplete.
- Benchmarks must be tenant-safe, permissioned, and carefully aggregated before any cross-organization comparison exists.

### GateKeeper Success

GateKeeper Success is the planned FloorConnector onboarding, training, support, and adoption layer.

Target capabilities:

- onboarding assistance
- setup guidance
- workflow education
- configuration help
- troubleshooting
- feature education
- operational coaching
- adoption reinforcement

This layer should help contractors succeed with FloorConnector without creating fake setup data, bypassing activation rules, or pretending target-only features are implemented.

## 4. Communication Layer Direction

GateKeeper should deepen FloorConnector communications as a canonical memory layer.

Future source ingestion boundaries are defined in [docs/gatekeeper-source-adapters.md](C:/FloorConnector/docs/gatekeeper-source-adapters.md). That adapter document keeps future manual, phone, voice-agent, transcription, chat, SMS, email, portal, internal-note, and support/onboarding sources provider-neutral before any real vendor integration is added.

Target channels:

- calls
- SMS
- voicemail
- web chat
- email
- portal messages
- app messages
- manual logs

Target communication behavior:

- capture or link call recordings where legally and operationally appropriate
- transcribe calls and voicemail where consent and retention rules allow
- summarize conversations into reviewable operational notes
- extract proposed tasks, callbacks, appointment requests, and follow-up needs
- identify the likely customer, opportunity, project, estimate, invoice, job, or payment context
- create or update canonical communication entries only through approved workflows
- route uncertain matches to human review instead of guessing
- preserve provider events as telemetry, not business truth

### Contractor Number Strategy

FloorConnector should eventually support multiple managed numbers across the same organization, not only one primary company line. Future number patterns may include:

- company main line
- owner line
- sales rep lines
- account manager lines
- estimator lines
- office/admin line
- department/team lines
- after-hours assistant line
- campaign/tracking numbers
- location/branch numbers
- temporary project/event numbers later if useful

Each number should be configurable for assigned user or team, inbound routing, business hours, after-hours GateKeeper behavior, voicemail/transcription, SMS ownership, call recording settings, live assist permissions, escalation rules, fallback/forwarding behavior, and visibility in customer/project timelines.

A contractor should be able to port in or forward multiple existing numbers, not just one primary line. A contractor should also be able to port out individual numbers when appropriate, subject to security, authorization, and audit rules. Number ownership should be trust-oriented: bring your numbers, keep your numbers, leave with your numbers.

Number configuration must not fork communication truth. Whether a call arrives through a company main line, individual sales rep line, campaign number, branch number, or assistant line, it should still resolve into canonical communications, GateKeeper artifacts, reviewable suggestions, and the relevant opportunity/customer/project timeline when context is known.

### Number Port-In Planning

Future port-in planning should support:

- multi-number port orders
- single-number port-in for owner, sales, account manager, estimator, office/admin, or department lines
- bulk/location-based port-in later
- pre-port mapping so each number has a planned destination before cutover
- assigning each ported number to a user, team, location, campaign, or workflow after port completion
- cutover checks for every number, not only the main company line
- per-number call/SMS readiness status
- per-number consent, recording, assistant, voicemail, transcription, escalation, and visibility settings

### Number Port-Out Planning

Future port-out should work per number, not only as part of full account cancellation. Admins should be able to see which user, team, workflow, campaign, routing rule, customer communication path, and GateKeeper history depend on a number before releasing it.

Port-out should warn about affected call routing, SMS ownership, automations, campaign tracking, customer communications, timeline visibility, and GateKeeper history. Number release should require appropriate admin authorization and audit history.

### Forwarding Number Strategy

Forwarding should be treated as a lower-risk adoption bridge before porting. Each sales rep, account manager, estimator, office/admin user, or department/team may forward an existing line to a FloorConnector-managed routing number. Forwarding may be per-user, per-team, branch/location-specific, campaign-specific, or after-hours only.

Limitations should be explicit: SMS forwarding is not the same as voice forwarding, outbound identity may differ, provider analytics may be limited, and caller ID behavior depends on carrier/provider rules. Forwarded activity should still feed canonical communications and GateKeeper memory where legally and technically available.

### FloorConnector-Provisioned Number Strategy

Future provisioned numbers may be created for individuals, roles, departments, teams, locations, campaigns, or assistant workflows. The model should support direct-assigned numbers for sales reps/account managers, shared team numbers for office/sales/service, after-hours assistant numbers, and pooled marketing attribution numbers later.

Each provisioned number should have routing, permissions, recording, assistant, escalation, fallback, SMS ownership, and visibility settings. Provisioned numbers must not become separate provider-side inboxes detached from customers, opportunities, projects, or canonical communication timelines.

Communication timelines should eventually appear where they help users understand context:

- project timeline
- customer timeline
- opportunity timeline
- relevant record timelines for estimates, contracts, invoices, jobs, payments, and workflow events

The timeline is the readable memory stream. It is not a replacement CRM, inbox, task manager, or event-sourcing system.

## 5. Operational Intelligence Direction

GateKeeper should eventually analyze operational patterns over canonical data.

Target future capabilities:

- estimate quality review
- estimate accuracy analysis against job, time, material, and margin outcomes
- workflow drift detection
- schedule readiness intelligence
- collection risk intelligence
- operational benchmarking
- margin leakage detection
- labor efficiency visibility
- project risk detection
- communication responsiveness analysis
- customer follow-up timing analysis
- job closeout completeness review

GateKeeper may also support future AI QA and compliance review:

- estimate completeness
- contract completeness
- missing clauses or missing required fields
- invoice inconsistencies
- forgotten scope or change-order linkage
- missing signatures
- missing readiness steps

Initial behavior should be review and flagging. GateKeeper should not auto-correct canonical records without human approval.

## 6. Workflow Reinforcement Philosophy

GateKeeper should make the desired operating behavior easier to follow.

Target reinforcement patterns:

- reminders tied to real records
- next-best-action guidance inside workspaces
- workflow correction when teams skip important steps
- readiness enforcement support before scheduling, billing, or execution
- human approval queues for proposed customer-facing or operational actions
- operational coaching that explains why a step matters
- habit formation through repeated, contextual guidance

Examples:

- A project has an approved estimate but no contract: GateKeeper points users toward contract generation or explains why the next step is blocked.
- A contract is signed but the required deposit invoice is unpaid: GateKeeper highlights collection readiness before scheduling.
- A customer left a voicemail asking to move an appointment: GateKeeper prepares the summary and proposed schedule action, then asks for approval.
- A crew repeatedly starts work without complete closeout evidence: GateKeeper surfaces drift and links back to the field workflow.

The tone should be operational and direct. GateKeeper should reduce memory burden without turning the product into a nagging system.

## 7. Future Multi-Agent Direction

Long term, GateKeeper may coordinate specialized assistants under one canonical orchestration model.

Possible future agents:

- Voice agent
- Scheduling agent
- Collections agent
- Estimating assistant
- Field assistant
- Support assistant
- Success/onboarding assistant

GateKeeper Core should coordinate those agents by:

- resolving tenant, user, permission, and record context
- routing proposed actions through approved server-side workflows
- maintaining canonical record links
- requiring approval for risky actions
- preventing agents from creating private business truth
- keeping communication and workflow history readable

This is a future orchestration direction only. It should not be implemented as broad autonomous workflow control in early phases.

## 8. Phased Rollout Plan

### Phase 1: Operational Memory Foundation

Create the memory substrate before autonomy:

- communication schema and canonical record linkage
- communication timeline direction
- call recording linkage planning
- transcription planning
- AI summary planning
- task extraction planning
- review queues
- workflow extraction
- customer/project linkage rules
- consent, opt-out, retention, and provider-payload boundaries

Phase 1 should prioritize accurate capture, linkage, review, and human approval over realtime autonomy.

Implemented foundation slice:

- existing canonical `communication_threads` and `communication_messages` are extended with provider-neutral category, channel, direction, source, and occurrence fields
- `gatekeeper_artifacts` stores reviewable memory artifacts linked to communication threads, messages, and optional canonical subjects
- `gatekeeper_action_suggestions` stores human-governed proposed actions with no execution behavior
- current utilities support creating, listing, and reviewing memory artifacts and suggestions only
- `/gatekeeper` provides the first contractor-facing review queue for memory artifacts and action suggestions
- review actions update only GateKeeper review/status fields; approve-review does not execute the proposed action or mutate canonical records
- `/gatekeeper` also includes a manual intake simulation path that lets contractor users seed provider-neutral memory artifacts and proposed suggestions from manually entered summaries
- manual simulation is now formalized as the first deterministic source-adapter implementation; it normalizes manual input into the provider-neutral adapter contract before persistence and remains review-only
- static demo examples can seed representative GateKeeper review flows for new inquiries, scheduling requests, missed-call follow-up, and internal workflow observations; these fixtures are QA/demo scaffolding only
- `apps/web/lib/gatekeeper/source-adapters.ts` defines a lightweight provider-neutral source-event interface and adapter-result shape for future ingestion planning only
- `apps/web/lib/gatekeeper/manual-source-adapter.ts` implements the manual adapter pattern without providers, AI, webhooks, background workers, outbound communication, or execution behavior
- Project, Customer, and Lead/Opportunity workspaces now show GateKeeper operational memory panels for subject-linked artifacts, suggestions, and communication evidence
- `apps/web/lib/gatekeeper/internal-note-adapter.ts` lets those workspaces add contractor-only internal notes through the same provider-neutral adapter contract; the notes create reviewable memory and optional review-only suggestions without execution
- `docs/gatekeeper-source-adapters.md` documents the adapter boundary, idempotency, metadata, privacy, human-governance, anti-drift, and sequencing rules for future source adapters
- `docs/gatekeeper-controlled-action-bridge.md` and `apps/web/lib/gatekeeper/action-bridge.ts` define the planning-only boundary for future controlled execution previews; review approval still does not execute suggestions
- `apps/web/lib/gatekeeper/execution-preview.ts` and `/gatekeeper` suggestion cards now show non-mutating future-action previews with owner, risk, validation, display-only payload, and blocked execution status
- no provider integration, AI runtime, worker, transcription, telephony, SMS/email send, autonomous workflow execution, or portal access is implemented by this slice

### Phase 2: Workflow Reinforcement

Use the memory layer to strengthen operations:

- deterministic reminders and cue expansion
- workflow drift detection
- readiness and blocker explanations
- approval-ready task and follow-up suggestions
- human-governed action queues
- record-workspace guidance

### Phase 3: AI Front Desk

Add customer-facing communication assistance only after memory, consent, and approval boundaries exist:

- voice intake
- missed-call text-back
- voicemail summaries
- web chat continuity
- appointment request preparation
- safe FAQ answers
- escalation routing

### Phase 4: Operational Co-Pilot

Deepen contractor-facing assistance:

- project summaries
- collections assistance
- scheduling suggestions
- estimate and scope review
- field handoff summaries
- support for internal operating questions

### Phase 5: Predictive Operational Intelligence

Add higher-level intelligence after enough reliable canonical data exists:

- forecasting
- benchmarking
- margin leakage detection
- labor efficiency analysis
- operational bottleneck detection
- project risk scoring
- organization-level operating health

## 9. Anti-Drift Rules

GateKeeper must never become:

- a disconnected chatbot product
- a duplicate CRM
- a separate AI memory silo
- an isolated communication database
- a portal-only communication copy
- an AI-controlled source of canonical truth
- a separate scheduling, collections, estimating, or support product
- an autonomous workflow engine that bypasses human approvals and server-side guardrails

GateKeeper must not:

- create AI-only leads, customers, projects, estimates, jobs, invoices, payments, calendars, or communication logs
- let provider payloads become business truth
- create per-user phone silos disconnected from canonical communications
- create sales-rep-only or account-manager-only inboxes that hide customer, opportunity, or project context
- create campaign tracking numbers disconnected from the customer/opportunity/project chain
- trap contractors in a number ownership model that prevents legitimate port-out
- send risky customer-facing messages without approved workflow boundaries
- commit pricing, discounts, dates, contract terms, payment requests, permission changes, or compliance actions without human approval
- describe planned capabilities as implemented

GateKeeper should strengthen the FloorConnector doctrine:

- one canonical workflow chain
- one shared data model
- multiple surfaces on the same records
- AI and communications as operating layers
- humans accountable for business commitments

## 10. Implementation Warnings

Do not start GateKeeper with realtime autonomous calls, autonomous dispatch, or broad agentic workflow mutation.

Start with operational memory infrastructure:

- canonical communication records
- timeline and linkage rules
- transcript/summary retention rules
- review queues
- proposed action records or patterns
- consent and recording policy
- provider adapter boundaries
- tenant isolation and RLS design
- human approval rules

Provider candidates such as telephony, voice AI, SMS, email, and realtime AI services should remain adapters. Their IDs, transcripts, call recordings, delivery events, and tool outputs should enrich FloorConnector records without owning the business workflow.

Any future schema or integration work must come through a dedicated implementation plan, migrations, RLS review, env-var documentation, test coverage, and explicit approval.
