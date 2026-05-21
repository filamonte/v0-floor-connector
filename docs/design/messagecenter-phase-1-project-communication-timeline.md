# MessageCenter Phase 1 - Project Communication Timeline

Status: Active
Doc Type: Implementation Note

## Purpose

MessageCenter Phase 1 adds a read-only project communication history layer over
existing communication, document delivery, signature, payment, and Customer
Access records. It helps contractors see what was said, sent, signed, paid, or
needs follow-up without creating a separate inbox or duplicate message model.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Canonical Data Used

MessageCenter reads existing records only:

- `projects`
- `customers`
- `communication_threads`
- `communication_messages`
- `document_delivery_events`
- `contract_signature_events`
- `payment_events`
- `portal_access_grants` and `portal_project_access` through existing Customer
  Access helpers
- existing project, communication, estimate, contract, invoice, payment, and
  Customer Access links

No new message, thread, notification, delivery, inbox, or portal-copy table was
added.

## Project / Record Surfaces Changed

- Project Workspace now includes a MessageCenter section inside the Operations
  Hub.
- The existing related-conversations side card now points at the broader
  project-and-record communication thread set for the project.
- No route paths were added or renamed.

## MessageCenter Summary Implemented

The Project Workspace MessageCenter summary shows:

- communication thread count
- stored message count
- Send Trail event count
- Signature Trail event count
- Payment Trail event count
- latest activity context
- Customer Access count as project visibility context
- Next Move link to review follow-up, latest activity, or the communications
  workspace

## MessageCenter Timeline Implemented

The Project Workspace timeline lists recent real activity from:

- project and related-record communication messages
- document Send Trail events for related estimates, contracts, and invoices
- contract Signature Trail events
- invoice Payment Trail events

The timeline links back to the existing communications workspace or the owning
estimate, contract, or invoice. It does not create generic activity rows or fake
events.

## Existing Behavior Preserved

MessageCenter is read-only on Project Workspace. Existing behavior remains owned
by existing surfaces and helpers:

- communication reply and notification triage actions
- document delivery evidence and provider-send behavior
- contract signature request, customer signature, decline, countersign, and void
  behavior
- invoice payment request, checkout, payment, and payment-event behavior
- Customer Access and portal visibility behavior

## Intentionally Not Implemented Yet

- standalone inbox overhaul
- external email or SMS provider sending changes
- automated reminders
- AI reply drafting
- customer chat
- new read receipt behavior beyond existing records
- advanced notification rules
- communication templates
- thread assignment
- SLA or escalation workflows

## Follow-Up Candidates

- Add compact Signature Trail / Send Trail summaries on Contract Workspace once
  the project panel proves the right shape.
- Add compact Payment Trail / Send Trail summaries on Invoice Workspace if it
  reduces billing follow-up friction.
- Add customer-safe portal communication history only after visibility and
  redaction rules are explicitly scoped.
