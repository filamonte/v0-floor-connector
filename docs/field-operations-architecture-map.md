# Field Operations Architecture Map

Status: Planning
Doc Type: Architecture Map

This map connects the next operational depth layers for FloorConnector: clocking, equipment, service/warranty, daily logs, jobs, schedule, people, vendors, documents, future job costing, and dashboard guidance. It is planning only and does not authorize application code, schema, migrations, tests, provider calls, AI actions, portal changes, or financial mutations.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

The next field-operations layer should make FloorConnector deeper without making it fragmented. Clocking, equipment, service/warranty, daily logs, documents, and future costing should all attach to the same project/job/customer record graph.

The key design stance is:

- canonical records own truth
- derived summaries explain state
- advisory guidance helps humans act
- risky actions remain human-confirmed
- AI assists over canonical evidence later
- no module becomes a detached mini-product

## System Connection Map

```text
People/Vendors
  -> job assignments
  -> clocking / time punch events
  -> time cards
  -> daily logs
  -> service/warranty labor
  -> future labor costing

Equipment
  -> equipment assets
  -> job equipment requirements
  -> equipment assignments
  -> maintenance records later
  -> usage entries later
  -> service/warranty equipment usage
  -> future equipment costing

Jobs/Schedule
  -> canonical jobs
  -> job assignments
  -> schedule windows
  -> required equipment
  -> crew/time expectations
  -> daily logs and field evidence
  -> service visits later

Service/Warranty
  -> original customer/project/job/install context
  -> service_tickets now
  -> warranty/service time via canonical clocking now
  -> materials/equipment usage later
  -> documents/photos
  -> billability decision
  -> future service invoice only through approved billing workflow

Documents/Evidence
  -> project/job/daily-log/field-note attachments now
  -> warranty document print/save rendering now
  -> equipment maintenance documents later
  -> closeout/service proof later
  -> shared multi-record evidence layer future

Dashboard/Project Guidance
  -> derived attention over canonical records
  -> schedule, crew, equipment, time, warranty, document, billing cues
  -> human-confirmed route into the owning workspace
```

## Canonical Truth Ownership

| Area                  | Canonical truth owner                                                                                        | Notes                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Project continuity    | `projects` plus linked canonical records                                                                     | Project is the operational hub, not a duplicate workflow engine.                                             |
| Job execution         | `jobs`, `job_assignments`, schedule context                                                                  | Jobs own production/service execution context.                                                               |
| Workforce identity    | `people`, memberships, vendors where linked                                                                  | Do not create payroll-only or service-only workers.                                                          |
| Time audit            | time punch events                                                                                            | Punch events are the labor audit truth.                                                                      |
| Time review           | time cards                                                                                                   | Time cards are reviewed/approved summaries.                                                                  |
| Equipment assets      | `equipment_assets`                                                                                           | Physical resource registry, not catalog items.                                                               |
| Equipment readiness   | job equipment requirements + equipment assignments + derived summary                                         | Advisory unless explicitly approved as a hard gate later.                                                    |
| Daily field narrative | daily logs and field notes                                                                                   | They summarize field work but do not replace time truth.                                                     |
| Service/warranty      | `service_tickets` tied to original customer/project/job context                                              | Not a helpdesk silo; installed-system depth is future.                                                       |
| Service visits        | linked canonical jobs through `jobs.service_ticket_id`                                                       | Follow-up visits use the existing job/schedule/crew/time spine.                                              |
| Service/warranty time | `time_punch_events.service_ticket_id` -> derived `time_cards.service_ticket_id`                              | Reuses punch audit truth; not a separate service timesheet.                                                  |
| Warranty documents    | `warranty_documents` + warranty `document_templates` attached to customer/project/job/service-ticket context | Not standalone PDFs; portal review/signing and internal delivery evidence now exist for project-linked docs. |
| Document signatures   | `document_signers` + immutable `document_signature_events` for `warranty_document` subjects only             | Warranty portal signing now; no contract migration, email, or provider e-sign.                               |
| Financial truth       | invoices, payments, payment events, approved snapshots                                                       | Time/equipment/service never mutate this automatically.                                                      |
| Documents/evidence    | current attachments plus future shared evidence layer                                                        | Link to canonical records; no file island.                                                                   |

## Derived Summaries

Derived summaries should remain read models, not business truth:

- current punch state
- time-card totals
- service/warranty time summaries
- equipment readiness warnings
- dashboard operational guidance
- project/job readiness summaries
- daily-log labor summaries
- warranty/service open-item counts
- future job-costing rollups

If a summary is wrong, the fix should usually be in the canonical record or derivation rule, not manual editing of the summary.

## Advisory Vs Enforced Behaviors

Enforced today or already treated as hard:

- tenant isolation
- protected-route access
- project readiness gates for execution workflows where implemented
- financial correctness and payment/signature rules
- portal access scope

Advisory until a future explicit slice says otherwise:

- equipment readiness warnings
- time/schedule mismatch warnings
- maintenance due warnings
- warranty/service triage guidance
- AI suggestions
- future job-costing insights

Advisory guidance should be clear and actionable, but should not silently block or mutate workflows.

## Human-Confirmed Workflows

Human confirmation is required for:

- schedule/reschedule actions
- clock correction
- time-card approval
- equipment assignment or override
- maintenance completion
- warranty coverage decisions
- service visit scheduling
- billable service invoice creation
- warranty document send/signature
- AI-prepared customer-facing, financial, legal, scheduling, permission, or compliance actions

## Future AI Assist Opportunities

AI can later help with:

- summarizing labor exceptions
- explaining equipment conflicts
- drafting maintenance notes
- summarizing warranty/project history
- preparing service response drafts
- suggesting warranty coverage categories for human review
- drafting warranty document language for review
- identifying recurring issue patterns
- explaining future job-costing variance

AI must not:

- create AI-only records
- auto-send customer communications
- approve time cards
- decide warranty coverage
- auto-assign equipment
- auto-reschedule jobs
- mutate invoices/payments
- bypass portal access, readiness, financial, signature, or tenant rules

## What Must Never Become Detached Modules

- Clocking must not become a payroll-only silo.
- Equipment must not become a disconnected asset calendar or accounting ledger.
- Warranty must not become a helpdesk detached from project/job/install history.
- Documents must not become a Dropbox clone.
- Dashboard must not own operational truth.
- Job costing must not become a shadow financial ledger.
- AI must not become a parallel operating system.
- Portal must not create customer/project/warranty copies.
- Work items/follow-ups must remain tied to records, modules, or business functions.

## Cross-System MVP Recommendations

Clocking:

- first MVP slice is implemented for single-worker clock-in/out, break start/end, project/job attribution, current session visibility, recent punch audit visibility, transition validation, and derived time-card review visibility over punch events.
- review hardening is implemented with crew clock-in, derived exception queues, approve/reject review state, and Time Card Workspace review actions over punch-event-derived summaries.
- service/warranty ticket attribution is implemented as optional context on punch events and derived time cards, with `/time` and Service Ticket detail routing through the same clocking foundation.
- next hardening should add admin correction events/UI, crew break/clock-out bulk actions, overtime/pay-period policy, and deeper review workflow without turning time into a payroll-only silo.

Equipment:

- add maintenance records, downtime, rental return, and usage-entry foundations after current assignment warnings remain stable.

Service/warranty:

- first ticket foundation now exists around original customer/project/job
  context, Project/Customer/Job Workspaces now show compact read-only continuity
  panels for linked tickets, warranty documents, signer/request state, linked
  service jobs, and service/warranty time now reuses canonical clocking.
  Service visit scheduling now starts as unscheduled canonical jobs linked by
  `jobs.service_ticket_id`; deeper dispatch-grade service workflow remains
  future without creating helpdesk, portal-only, billing, or timesheet copies.

Warranty documents:

- first template/record/print foundation now exists, and the generalized signature groundwork now supports internal signer management, request-signature audit, Project/Customer/Job read-only visibility summaries, and project-scoped portal review/signing for warranty document subjects only.
- portal warranty review/signing uses existing portal project access, customer-safe warranty rendering, signer email validation, immutable generic signature events, signer status updates, and signed document status only after all active customer signers sign.
- immutable `document_delivery_events` now provide evidence-only warranty
  document, estimate, invoice, and manual contract delivery history for
  internal/manual/print recording, and warranty documents now have the first
  guarded provider-backed review/sign email send through the shared notification
  delivery path. Provider callbacks, portal-visible delivery proof, countersign,
  provider e-sign, resend/retry orchestration, and contract signature migration
  remain future.

Documents/evidence:

- keep near-term links focused; avoid building a broad document manager before the warranty/equipment/service evidence use cases are clear.
- outbound document delivery and delivery proof now has a dedicated plan at
  [docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md).
  It now provides evidence over warranty document, estimate, invoice, and
  manual contract subjects without replacing notification, signature, payment,
  portal-view, or document truth.
- provider-backed outbound document send architecture now has a dedicated plan
  at
  [docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md).
  It keeps provider/email attempts in the notification delivery layer, keeps
  document-facing proof in `document_delivery_events`, and the first
  provider-backed implementation now starts with warranty document email send
  before estimates, invoices, and contracts.

Dashboard/project guidance:

- Dashboard Operational Cockpit now surfaces bounded read-only service/warranty
  attention signals for high-priority/stale tickets, tickets missing linked
  service jobs, unscheduled/upcoming/in-progress service jobs, and warranty
  documents needing internal signer/request attention.
- continue routing to owning Service Ticket, Warranty Document, Job, Schedule,
  Project, and Customer Workspaces; do not add dashboard-owned mutation flows,
  billing actions, signature actions, delivery actions, or cue-state mutation
  first.

## Dependency Map

Recommended order:

1. Admin time correction workflow, because review state and exception visibility now exist but corrections still need explicit audit evidence.
2. Equipment maintenance/utilization MVP, because registry + assignment now need lifecycle depth and cost inputs.
3. Estimate/invoice provider-backed document send expansion, after the warranty
   document send path proves the shared evidence, notification, portal review,
   and provider guardrails.
4. Job-costing input map, after labor, equipment, materials, POs/AP, invoices, and payments have reliable inputs.

## Testing/QA Themes

Across all future implementation:

- validate tenant isolation and same-company links
- prove source records remain canonical
- test derived warning/summary behavior separately
- use Playwright smoke for the owning workspaces
- verify no invoice/payment/signature/portal/readiness behavior changed unless explicitly scoped
- keep provider integrations out until adapter boundaries and staging proof exist

## Open Questions

- Should service visits reuse `jobs` immediately or start with visit records under a service/warranty ticket?
- Which clocking roles should be allowed for field crews and subcontractor workers?
- Which equipment maintenance statuses should warn versus block later?
- Which warranty documents need customer signature versus contractor-issued delivery proof only?
- What is the first shared document/evidence abstraction that avoids file islands without overbuilding?
- When does dashboard cue state become necessary for time/equipment/warranty items?
