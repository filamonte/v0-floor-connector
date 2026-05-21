# Contracts Delivery-Proof Reconciliation Plan

Status: Partially Implemented
Doc Type: Architecture / Implementation Checkpoint

This plan defines how contract delivery proof should eventually coexist with
FloorConnector's existing contract signature/send workflow and the generic
`document_delivery_events` layer.

This started as planning and now includes the manual/evidence-only contract
delivery implementation checkpoint plus the guarded provider-backed
send-for-signature email slice. It does not authorize contract signature
migration, portal delivery proof, provider callbacks, automatic signature-event
mirroring, document status automation, or payment/signature mutation.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

Contracts are the highest-risk document type for delivery-proof expansion because
they already have a real contract-specific signature and send model:

- canonical `contracts`
- `contract_signers`
- immutable `contract_signature_events`
- contract send-for-signature action
- contract lock/readiness fields
- sent-PDF snapshot metadata
- portal review/sign/decline
- contractor-side onsite signature
- optional contractor countersign
- contract notification events
- project commercial-readiness synchronization

The generic `document_delivery_events` foundation now supports estimates,
invoices, and warranty documents for evidence-only manual/internal/print
delivery history. Contracts should join that layer only after the event
ownership boundary is explicit.

Recommended direction:

- add `contract` to `document_delivery_events` only for manual/internal/print
  delivery evidence in the first implementation slice
- do not mirror existing `contract_signature_events` into delivery events
- let contract send-for-signature append provider-backed delivery evidence only
  around the actual email attempt, after the existing signature workflow has
  created signer routing and `contract_signature_events.signature_requested`
- leave legal signature truth, signer routing, countersign, and contract status
  changes in the existing contract signature workflow
- expose contract delivery proof as a clearly labeled evidence panel separate
  from the signature timeline at first
- consider a merged "document activity" read model later, but only as projection,
  not as duplicate event rows

## Existing Contract Send/Sign Workflow Summary

Current contract signing is not just a send button.

The contractor-side send flow:

1. Validates authenticated contractor membership and production-action readiness.
2. Checks contract workflow gate state.
3. Blocks send when the contract is not draft-ready, internally approved where
   required, or already locked by signature activity.
4. Validates customer portal signer access and optional contractor countersigner.
5. Creates `contract_signers`.
6. Generates and stores sent-PDF snapshot metadata on the canonical contract.
7. Updates `contracts.status`, `sent_at`, `signature_started_at`,
   `signature_readiness_status`, `locked_at`, and `edit_lock_reason`.
8. Appends `contract_signature_events.signature_requested`.
9. Records a contract notification event with event type `sent`.
10. Creates a pre-signature contract revision.
11. Syncs project commercial readiness.

The portal review/sign flow:

1. Validates authenticated portal user.
2. Resolves active portal grant and project access.
3. Loads the same canonical contract.
4. Records signer view when the current portal user has a pending signer slot.
5. Appends `contract_signature_events.signer_viewed`.
6. Updates signer rows and contract view/readiness fields.
7. Allows sign/decline only through signer routing and contact permission checks.
8. Appends `signer_signed`, `signer_declined`, and `signature_completed` where
   applicable.
9. Updates canonical contract status and timestamps.
10. Records notification events for viewed/signed/declined milestones.
11. Syncs project commercial readiness.

The contractor-side onsite signature and countersign paths use the same
`contract_signers` and `contract_signature_events` machinery instead of creating
a separate signed-document model.

## Existing Contract Signature Event Model Summary

`contract_signature_events` is the signature lifecycle audit trail for canonical
contracts.

Current event types include:

- `signature_requested`
- `signer_viewed`
- `signer_signed`
- `signer_declined`
- `contractor_countersigned`
- `signature_completed`
- `signature_voided`
- `provider_sync`

Current actor types include:

- `portal_user`
- `organization_user`
- `provider`
- `system`

The table is immutable. It attaches to `contracts` and optionally to
`contract_signers`. It also carries optional provider event ids and payloads for
signature-provider support later.

This table should remain the legal/signature source of truth for contracts.
Delivery evidence must not reinterpret or replace it.

## Existing Notification/Send Behavior Summary

Contracts also write `notification_events` for contract milestones such as:

- sent
- viewed
- signed
- declined

Notification events are broader communication/notification evidence. They power
visibility, notifications, and operational cues. They do not replace contract
signature events.

Provider-backed email now creates `notification_events` /
`notification_deliveries` for send mechanics and appends linked
`document_delivery_events` for document-specific proof. It is intentionally not
backfilled into historical contracts and does not mirror contract signature
events.

## Existing Document Delivery Events Summary

`document_delivery_events` is currently implemented for:

- `warranty_document`
- `estimate`
- `invoice`
- `contract`

Implemented behavior:

- tenant-scoped immutable event rows
- same-company subject validation
- active-member read
- owner/admin/manager insert
- manual/internal/print delivery evidence
- provider-backed customer signer email evidence for the existing
  send-for-signature action
- Delivery History panels on supported document workspaces
- contract support does not mirror contract signature events

It does not:

- process provider callbacks
- update document status
- update signature status
- mutate payments
- create portal-visible delivery proof
- create delivery proof from historical sends or from view/sign/decline/
  countersign actions

## Overlap Map

| Event idea            | Current contract owner                                                                                                       | Delivery-event recommendation                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send requested        | `contract_signature_events.signature_requested` plus contract status fields                                                  | Provider-backed email send now appends linked `send_requested` delivery evidence after the existing signature workflow succeeds. Manual delivery evidence remains separate. |
| Signature requested   | `contract_signature_events.signature_requested`                                                                              | Keep in contract signature events. Delivery events should not create a second signature-request truth.                                                                      |
| Sent                  | `contracts.sent_at`, `contract_signature_events.signature_requested`, `notification_events.sent`, sent-PDF snapshot metadata | Provider-backed email acceptance appends linked `sent` delivery evidence. It does not become signature truth or alter readiness beyond the existing send flow.              |
| Viewed                | `contract_signature_events.signer_viewed`, signer `viewed_at`, contract `customer_viewed_at`, portal view evidence           | Keep contract view truth in signature/portal systems. Delivery history may later project view evidence without duplicating rows.                                            |
| Signed                | `contract_signature_events.signer_signed` / `signature_completed`, signer rows, contract signed fields                       | Keep in contract signature events and canonical contract state. Delivery events should not own signed truth.                                                                |
| Declined              | `contract_signature_events.signer_declined`, signer rows, contract decline fields                                            | Keep in contract signature events and canonical contract state. Delivery events should not void or decline contracts.                                                       |
| Voided                | `contract_signature_events.signature_voided`, contract status/void fields                                                    | Keep in contract signature events and canonical contract state. Manual delivery evidence may remain visible but never controls void state.                                  |
| Bounced/failed future | `notification_deliveries` / provider callback future                                                                         | Current provider-send failure appends `failed` evidence for config/provider failures. Callback-based bounce/failure reconciliation remains future.                          |

## Recommended Event Ownership

### Remains In `contract_signature_events`

- signer routing lifecycle evidence
- signature requested
- portal signer viewed
- signer signed
- signer declined
- contractor countersigned
- signature completed
- signature voided
- signature-provider sync events
- legal/signature audit metadata

### Belongs In `document_delivery_events`

- manual/offline contract delivery evidence
- internal "customer notified" notes that are evidence-only
- print/share evidence
- future normalized provider delivery telemetry when linked to a notification
  delivery or delivery attempt
- future document-specific delivery projection for contractor-facing history

### Belongs In `notification_events`

- notification intent and workflow visibility
- in-app notification events
- communication-level event categories
- subject-linked operational notification history
- future provider send orchestration intent where a document send action needs
  broader notification mechanics

### Belongs In `notification_deliveries`

- provider/channel delivery attempt mechanics
- provider message ids
- email/SMS delivery status updates
- delivery errors
- provider timestamps for sent/delivered/opened/clicked/failed where supported

### Belongs In `portal_record_views`

- portal-authenticated record view evidence
- first/recurring portal record access observation
- portal-scoped view audit independent of delivery send mechanics

Portal view evidence may appear in a future merged activity read model, but it
should not be copied into `document_delivery_events` without idempotent mapping
and a clear customer-safe policy.

## Should Contracts Use `document_delivery_events`?

Yes, but not as signature truth.

Contracts should eventually support `document_delivery_events.subject_type =
'contract'` for evidence-only delivery notes and provider delivery telemetry.
This lets contractors record that a contract was manually shared, printed, or
customer-notified without pretending that action is a legal signature event.

Contract support should start narrower than estimate/invoice support because
contracts already have workflow-significant send/sign state.

## Evidence-Only First

Contract delivery proof should start evidence-only.

Allowed first slice:

- `subject_type = contract`
- same-company contract validation
- list delivery events for a contract
- append manual/internal/print delivery evidence
- Delivery History panel on Contract Workspace
- copy stating that the panel records evidence only and does not send email,
  change signature state, change contract status, or affect readiness

Not allowed in the first slice:

- automatic event creation from send-for-signature
- automatic event creation from portal view/sign/decline
- contract status updates from delivery events
- signer status updates from delivery events
- project readiness sync from delivery events
- portal-visible delivery history
- provider callbacks
- contract signature migration

## Should Contract Send Append Delivery Events?

Not in the first implementation.

Reason:

- current send already updates contract status/readiness
- current send creates signer routing
- current send creates the sent-PDF snapshot metadata
- current send appends `contract_signature_events.signature_requested`
- current send records `notification_events.sent`
- current send creates a pre-signature revision
- current send syncs project commercial readiness

Adding an automatic `document_delivery_events.send_requested` row now would
create an ambiguous duplicate unless the system defines whether the row means
"signature workflow requested", "email sent", "portal link made available", or
"manual evidence recorded".

Future direction:

- provider-backed send should create one correlated delivery attempt
- notification event/delivery rows should own provider/channel mechanics
- document delivery event should normalize document-specific proof and link to
  the notification/delivery attempt
- contract signature event should still own signature readiness and signer state

## Portal View Projection

Contract portal view should remain in contract signature and portal view evidence
for now.

Do not automatically insert `document_delivery_events.viewed` when a portal
contract page loads. The current portal review action may update signer view
state and contract readiness, which is signature behavior. Delivery proof should
not duplicate that state.

Future read model:

- show portal view evidence in a merged Contract Activity timeline
- label it as "Portal view" or "Signer viewed"
- source it from `contract_signature_events` and/or `portal_record_views`
- avoid creating new delivery rows for historical views

## Delivery History UX

First implementation should keep delivery evidence separate from the signature
timeline.

Recommended Contract Workspace sections:

- Signer Routing / Signature History: existing contract signature truth
- Delivery History: manual/internal/print delivery evidence only

Avoid a merged timeline until the product has enough event correlation to
prevent duplicates. A merged timeline can come later as a read-model projection
with source labels:

- Contract signature
- Delivery evidence
- Notification
- Portal view
- Payment or downstream milestone where relevant

## Avoiding Duplicate `signature_requested`

Rule:

- `contract_signature_events.signature_requested` means the contract signature
  workflow opened.
- `document_delivery_events.send_requested` should mean a delivery attempt or
  delivery evidence was requested/recorded.

For contract MVP, the manual delivery action should probably default to
`delivery_recorded`, not `send_requested`, unless the UI copy makes it explicit
that "send requested" is an internal evidence note and does not send anything or
alter signature workflow.

Do not create a delivery event named `signature_requested` for contracts.

## Countersign Events

Contractor countersign remains contract signature behavior.

`contract_signature_events.contractor_countersigned` should remain the event
truth. Delivery proof may later project countersign completion into document
activity for readability, but it should not create a duplicate delivery event
or control signed state.

## Provider Email Callbacks Later

Provider email callbacks should not update contracts directly.

Recommended future flow:

1. Contract send action or document send action creates a notification event and
   notification delivery attempt.
2. Provider callback updates or appends provider delivery evidence through
   `notification_deliveries`.
3. A normalized `document_delivery_events` row may be appended for
   document-specific proof, linked to notification/delivery ids.
4. Contract signature readiness remains unchanged unless the customer acts
   through the contract signature workflow.

Provider delivered/opened/clicked does not mean signed, viewed in portal,
accepted, or ready for scheduling.

## Manual/Offline Contract Delivery Evidence

Manual/offline evidence is useful for contracts because contractors sometimes:

- hand a printed contract to a customer
- send a contract link manually outside provider email
- discuss the contract onsite
- note that the customer was notified by phone or in person

That evidence should be allowed, but it should stay clearly separate from
signature truth.

Recommended event types for first slice:

- `delivery_recorded`
- optionally `send_requested` only if copy is unambiguous

Recommended channels:

- `internal`
- `manual`
- `print`

## Historical Contracts

Do not backfill delivery events for historical contract signature events in the
first slice.

Historical display should continue reading:

- contract fields
- contract signer rows
- contract signature events
- notification events
- sent-PDF snapshot metadata

If a future migration or projection creates a unified activity timeline, it
should be a read-model projection first. Backfill rows should require a separate
plan with idempotency, source labels, and duplicate prevention.

## Security, RLS, And Tenant Rules

Future contract delivery-event support should preserve the existing
`document_delivery_events` posture:

- active company members can read contractor-side evidence
- owner/admin/manager users can insert manual evidence
- subject validation requires the contract to belong to the same company
- delivery events are immutable after insert
- no portal loaders expose delivery evidence until a customer-safe policy exists
- delivery metadata must not store secrets, portal invite links, payment
  secrets, raw provider payloads, or unrelated recipient data

Contract delivery proof must not weaken:

- contract signature gates
- portal signer permissions
- project-scoped portal access
- contract edit locking
- commercial readiness
- project readiness synchronization

## MVP Implementation Recommendation

Implementation checkpoint:

- `document_delivery_events.subject_type` now supports `contract`.
- Database validation requires the referenced contract to belong to the same
  company as the delivery event.
- Shared delivery utilities/actions can list and append manual/internal/print
  evidence for contracts.
- Contract Workspace now includes a separate Delivery History panel with copy
  stating that contract signature status and signer history remain separate.
- Recording contract delivery evidence does not send email, create
  `contract_signature_events`, update `contract_signers`, update contract
  status/readiness, mirror portal view/sign/decline/countersign activity, or
  expose delivery proof to portal customers.

Smallest safe implementation:

1. Add `contract` as a supported `document_delivery_events.subject_type`.
2. Add database validation that the referenced `contracts` row belongs to the
   same company.
3. Add contract to the shared subject type vocabulary.
4. Extend shared delivery utilities to load/append contract delivery evidence.
5. Add a Contract Workspace Delivery History panel.
6. Keep manual action copy explicit:
   "This records delivery evidence only. Contract signature status and signer
   history remain separate."
7. Provider-backed email may wrap the existing send-for-signature action only;
   it must not change portal sign/decline/view, countersign, notification
   ownership, or readiness logic beyond the existing send path.

Testing should prove:

- unsupported subject types still fail
- contract subject validation is same-company scoped
- manual delivery evidence does not mutate contract status
- send/sign/decline/countersign behavior remains unchanged
- existing contract signature tests still pass

## Phase 2/3 Expansion

Phase 2:

- read-only contract delivery history on Project/Customer history surfaces
- optional bounded dashboard attention for failed delivery only after provider
  events exist
- merged document activity read model with source labels and no duplicated rows

Phase 3:

- notification/delivery attempt correlation
- provider callback normalization
- customer-safe portal delivery evidence policy
- external e-sign provider adapter reconciliation

## Risks And Open Questions

- Should contract manual delivery evidence allow `send_requested`, or only
  `delivery_recorded`?
- Should Contract Workspace show Delivery History near Workflow Actions or near
  Signature History?
- Should sent-PDF snapshot metadata be referenced from delivery events once
  contract support is added?
- Provider-backed contract send now uses the existing contract send action; a
  separate parallel document-send action should remain avoided unless a later
  refactor proves it can preserve signature readiness semantics.
- How should future resend attempts avoid confusion with the one-time signer
  routing rule?
- Should portal contract review eventually show customer-safe delivery evidence,
  or is the current signature state enough for customers?
- Should a future merged activity read model include notification events and
  portal views by projection only?
- How much provider metadata is useful without storing raw email payloads?

## Testing / QA Strategy

Future implementation should include:

- migration shape test for `contract` subject support and same-company
  validation
- unsupported-subject regression test
- contract delivery utility/action validation test
- existing contract send-for-signature regression coverage
- existing portal contract sign/decline regression coverage
- countersign regression coverage
- diff/check validation proving no contract status, signer, notification, or
  readiness logic changed
- provider-send regression coverage proving email delivery evidence does not
  create signed events or make provider acceptance signature truth

Browser smoke is optional for the first implementation if existing protected
fixtures are stable. Unit/migration/action-helper tests are more important than
heavy portal browser setup for manual evidence.

## Anti-Silo Guardrails

- No duplicate signature truth.
- No contract signature migration in the first implementation.
- No provider-owned contract state.
- No portal-only contract copies.
- No document delivery event should change contract status.
- No delivery event should update signer state.
- No delivery event should sync project readiness.
- No backfill without an explicit idempotent migration plan.
- No merged activity timeline until source ownership is visible and duplicate
  rows are prevented.
