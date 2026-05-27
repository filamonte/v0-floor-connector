# Communications V1 Record-Linked Workspace

Status: Implemented
Doc Type: Implementation Note

## Purpose

Communications v1 turns the contractor-side `/communications` route into a
record-linked communication control room. It helps contractors review customer,
project, commercial, finance, closeout/evidence, and internal communication
continuity without creating a disconnected inbox product.

It is not Slack, email sync, SMS sync, a provider inbox, a portal chat product,
or an automation/reminder engine.

## Source Records Used

The workspace derives from existing canonical records only:

- `communication_threads`
- `communication_messages`
- per-user `notifications` for communication unread/needs-response state
- `document_delivery_events`
- `portal_evidence_delivery_events`
- canonical customer, project, estimate, contract, invoice, change-order, and
  payment links already attached to communication threads

No schema changed in this pass.

## Read Model

The shared helper lives in
[apps/web/lib/communications/workspace-summary.ts](C:/FloorConnector/apps/web/lib/communications/workspace-summary.ts).

It derives:

- customer, project, commercial, finance, closeout/evidence, and internal lanes
- follow-up signals for customer replies, unread activity, stale open threads,
  and delivery issues
- customer-visible versus internal-only thread counts
- finance and closeout/evidence context counts
- latest customer activity and latest record-linked context
- recent document delivery and shared-evidence proof context

## UX Behavior

`/communications` now opens with:

- a workspace status summary
- operating lanes back to filtered communication queues
- follow-up intelligence
- delivery and shared-evidence context
- existing thread queue, selected-thread detail, reply form, and notification
  triage

Project MessageCenter now shows customer-visible/internal message counts.
Related conversation cards on record workspaces now show customer-visible,
internal-only, and open thread counts while still routing replies back to
`/communications`.

## Internal / Customer Boundary

Internal messages remain internal. The portal is not expanded in this pass.
Portal users do not see contractor-only notes, FieldTrail, Proof Center,
Daily Log bodies, Job Note bodies, provider diagnostics, raw storage paths, or
unshared evidence.

Customer-visible communication rows are only summarized in contractor-side
workspaces unless an existing portal surface already has scoped access to the
record through its own rules.

## Send / Provider Boundary

This pass does not send email or SMS. It does not call Postmark, Stripe, AI, or
any provider. Document delivery events and portal evidence delivery events are
shown as communication context only; they are not converted into message rows.

## Non-Goals

- no disconnected inbox product
- no portal-only message copies
- no new communication schema
- no provider sync or real outbound sends
- no fake messages or demo data
- no automation/reminders engine
- no portal chat or customer reply expansion
- no internal note exposure to portal users
- no mutation of contracts, invoices, payments, evidence grants, or closeout
  records

## Future Work

Future slices can add:

- safer thread creation from project/customer contexts
- broader portal messaging after explicit access and visibility design
- provider-backed email/SMS send workflows through existing adapters
- communication delivery retries and provider callbacks
- record-level reply composers where source validation is mature
- communication metrics and response-time reporting
- AI drafting only as review-first assistance over canonical threads
