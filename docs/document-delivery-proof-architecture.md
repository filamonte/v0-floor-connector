# Outbound Document Delivery + Delivery Proof Architecture

Status: Partially Implemented
Doc Type: Architecture / Product Plan

This plan defines a unified outbound document delivery and delivery-proof
architecture for estimates, contracts, invoices, and warranty documents. It is
partially implemented for warranty-document, estimate, invoice, and contract
evidence, including guarded provider-backed email sends for all four core
document subjects. Provider-backed outbound document send architecture lives in
[docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md).
This plan documents the delivery-proof evidence layer and the first guarded
provider-backed email slices. It does not authorize provider callbacks, document
status changes from delivery telemetry, payment mutations, signature mutations,
portal access changes, contract signature migration, or AI automation.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

FloorConnector now has several customer-facing document workflows:

- estimates can be reviewed and approved through the portal
- contracts can be sent, reviewed, signed, declined, and printed
- invoices can be reviewed, printed, and paid through the portal
- warranty documents can be reviewed, printed, signed, and declined through the
  portal

Those workflows already act on canonical records. The missing layer is a shared
way to prove outbound document delivery and customer interaction without letting
every document type grow its own send log, provider callback trail, and
customer-visible history.

The recommended architecture is an evidence-first delivery layer attached to
canonical document subjects. It should record send attempts, provider telemetry,
portal review events, and important downstream milestones as evidence while
leaving document status, signature truth, and payment truth owned by their
existing domain systems. Provider-backed email should route through the
notification/delivery foundation and then append normalized document-subject
evidence; it should not make provider logs the business source of truth.

## Current Implemented Document Flows

### Estimates

Implemented foundation:

- canonical estimates and estimate line items
- approved estimate snapshots and revision history
- portal estimate review and approval
- contractor and portal print/save routes
- project/customer continuity surfaces

Current delivery boundary:

- print/save renders the canonical estimate on demand
- immutable `document_delivery_events` can record internal/manual/print evidence
  for estimates
- provider-backed portal review email sends are implemented through the
  notification/delivery boundary and append `send_requested`, `sent`, or
  `failed` delivery evidence
- delivered, opened, bounced, clicked, and portal-visible proof are not
  implemented
- estimate approval remains estimate-domain truth

### Contracts

Implemented foundation:

- canonical contracts
- contract-specific `contract_signers`
- immutable `contract_signature_events`
- portal review/sign/decline
- contractor-side onsite signing
- contractor and portal print/save routes
- contract send/signature workflow

Current delivery boundary:

- contract signing is intentionally contract-specific
- contract signature events remain signature truth
- immutable `document_delivery_events` can record manual/internal/print evidence
  for contracts
- contract send-for-signature now records provider-backed email delivery proof
  after the existing signature workflow succeeds
- contract delivery proof does not replace or migrate contract signature events
  and is not automatically created from view/sign/decline/countersign actions
- contract delivery-proof reconciliation is documented in
  [docs/contracts-delivery-proof-reconciliation-plan.md](C:/FloorConnector/docs/contracts-delivery-proof-reconciliation-plan.md)

### Invoices

Implemented foundation:

- canonical invoices and invoice line items
- canonical payments
- immutable `payment_events`
- portal invoice review and payment initiation
- provider-backed payment webhook reconciliation
- contractor and portal print/save routes

Current delivery boundary:

- invoice payment events remain payment truth
- immutable `document_delivery_events` can record internal/manual/print evidence
  for invoices
- provider-backed portal review/payment email sends are implemented through the
  notification/delivery boundary and append `send_requested`, `sent`, or
  `failed` delivery evidence
- delivery proof may display payment milestones in a document history, but must
  not duplicate payment truth or mutate invoice/payment state from delivery
  telemetry

### Warranty Documents

Implemented foundation:

- `warranty` document template type
- platform-seeded warranty templates and contractor customization
- canonical `warranty_documents`
- contractor and portal print/save routes
- generic `document_signers` and immutable `document_signature_events` for
  `warranty_document` subjects
- internal signer management and signature-request audit
- portal warranty review/sign/decline through project-scoped access

Current delivery boundary:

- portal warranty signing exists
- immutable `document_delivery_events` exist for warranty-document evidence
- Warranty Document detail can record manual/internal/print delivery evidence
  and can send the first provider-backed warranty review/sign email through the
  notification delivery layer
- provider callbacks, resend/retry orchestration, and portal-visible delivery
  proof are not implemented
- generic warranty signature events remain signature truth, not provider delivery
  truth

## Implementation Checkpoint

The delivery-proof foundation is implemented as evidence-only delivery history
for warranty documents, estimates, invoices, and contracts:

- `document_delivery_events` is tenant-scoped and constrained to
  `subject_type in ('warranty_document', 'estimate', 'invoice', 'contract')`.
- Database validation requires the referenced warranty document, estimate,
  invoice, or contract row to belong to the same company.
- Rows are immutable after insert.
- Active company members can read events; owner/admin/manager users can insert
  events.
- Initial normalized event vocabulary supports `delivery_recorded`,
  `send_requested`, `sent`, `viewed`, `failed`, `bounced`, `opened`, and
  `clicked`, but the contractor UI only records evidence-only
  `delivery_recorded` / `send_requested` activity through internal, manual, or
  print channels.
- Warranty Document, Estimate, Invoice, and Contract detail workspaces show
  bounded Delivery History panels and internal record-evidence forms.
- Warranty Document detail also has the first guarded provider-backed email send
  action for requested customer signers. It writes `send_requested`, `sent`, and
  `failed` document delivery evidence while keeping provider attempt telemetry
  in `notification_deliveries`.
- Estimate Workspace now has the same guarded provider-backed portal review
  email pattern for draft/rejected estimates and active project-scoped portal
  recipients. It writes `send_requested`, then `sent` or `failed` evidence, and
  only uses the existing estimate sent/customer-event tracking after provider
  acceptance.
- Invoice Workspace now has a guarded provider-backed portal review/payment
  email pattern for sent or partially paid invoices with an open balance and
  active project-scoped portal recipients. It writes `send_requested`, then
  `sent` or `failed` evidence, while keeping checkout, payments,
  `payment_events`, invoice paid/partial status, and invoice status transitions
  out of the email-delivery path.
- Contract send-for-signature now has guarded provider-backed portal
  review/sign email delivery for the customer signer. It writes
  `send_requested`, then `sent` or `failed` evidence after the existing
  contract signature workflow creates signer routing, contract status/readiness
  changes, `contract_signature_events.signature_requested`, sent-PDF metadata,
  and the pre-signature revision.
- Contract delivery evidence does not mark signers signed, create signed,
  declined, countersign, or completion events, change readiness beyond the
  existing send-for-signature workflow, process provider callbacks, or replace
  `contract_signature_events`.

This implementation does not process provider callbacks, update document status,
update signature status, create portal-visible delivery proof, migrate contract
signatures, mutate invoices/payments, mutate estimate approval, mirror contract
signature events, or create stored PDF truth. Provider-backed send now covers
warranty documents, estimates, invoices, and the guarded contract
send-for-signature email path.

## Current Send/Proof Gaps

Current gaps:

- provider-backed outbound document send is limited to warranty document
  review/sign email, estimate portal review email, invoice portal
  review/payment email, and the guarded contract send-for-signature customer
  email path
- no consistent resend/retry attempt trail
- no provider callback association model for bounced, failed, delivered, opened,
  or clicked events
- no customer-safe delivery-proof policy for portal pages
- no provider-send UI that connects `notification_events`,
  `notification_deliveries`, and `document_delivery_events`
- no shared rule for whether a human send action may update document status for
  each document type
- no stored generated-PDF/version policy beyond current browser print/save

The important risk is duplicated event trails. A delivery-proof layer should
coordinate with existing events rather than become the fifth source of truth for
the same customer action.

## Delivery Evidence Model

Recommended direction:

- introduce a generic delivery evidence layer such as
  `document_delivery_events`
- optionally add `document_delivery_attempts` later if resend/retry grouping
  needs first-class attempt records
- keep delivery events evidence-only even when provider sends are recorded
- expand supported subject types deliberately, with contract signature truth and
  invoice payment truth kept in their owning systems
- preserve existing domain events as their own source of truth

Conceptual fields for `document_delivery_events`:

- `id`
- `company_id`
- `subject_type`
- `subject_id`
- `event_type`
- `channel`
- `recipient_type`
- `recipient_id`
- `recipient_name_snapshot`
- `recipient_email_snapshot`
- `delivery_group_id` or `attempt_id` when attempt grouping exists
- `provider`
- `provider_message_id`
- `provider_event_id`
- `notification_event_id`
- `notification_delivery_id`
- `portal_user_id`
- `actor_user_id`
- `occurred_at`
- `metadata`
- `created_at`

The event row should answer:

- which canonical document was involved
- which recipient or address was targeted
- what happened
- through which channel
- whether the event came from a contractor action, provider callback, portal
  action, or internal system observation

Provider metadata should support evidence. It must not become the canonical
business source of truth.

## Subject Model

Implemented subject candidates:

- `estimate`
- `invoice`
- `warranty_document`
- `contract`

Future subject candidates:

- `change_order`
- `document_packet`
- `submittal`
- `closeout_packet`
- `project_document`

Subject rules:

- every subject must belong to the same `company_id`
- the event layer must validate subject ownership server-side and, where
  possible, database-side
- subject-specific domain status remains owned by the subject workflow
- delivery evidence should project into timelines and workspace panels without
  creating copied document records

## Recipient Model

Recipient types should prefer canonical relationships:

- customer contact
- portal user
- signer
- billing contact
- custom email recipient

Recipient rules:

- use canonical contact, portal grant, signer, or billing-contact references
  where available
- store recipient name/email snapshots for audit readability because contact
  details can change later
- allow custom email recipients only as delivery recipients, not as new customer
  records
- do not create duplicate customer/contact models for send workflows
- do not expose unrelated recipients or internal routing notes in portal views

## Event Types

Recommended normalized event types:

- `send_requested`
- `queued`
- `sent`
- `delivered`
- `opened`
- `viewed`
- `bounced`
- `failed`
- `clicked`
- `signed`
- `declined`
- `payment_started`
- `payment_completed`
- `voided`

Interpretation:

- `send_requested`: human or system requested outbound delivery
- `queued`: delivery adapter accepted the request for processing
- `sent`: provider accepted or transmitted the message
- `delivered`: provider reports delivery
- `opened`: provider reports open tracking
- `viewed`: portal-authenticated view or in-app document review
- `bounced` / `failed`: delivery failure evidence
- `clicked`: provider reports tracked link click
- `signed` / `declined`: projected signature milestone from the relevant
  signature event system
- `payment_started` / `payment_completed`: projected invoice/payment milestone
  from the payment event system
- `voided`: delivery/signature/document route was voided where the owning domain
  explicitly supports that state

Open and click events should be treated as useful signals, not perfect legal
certainty.

## Relationship To Existing Event Systems

### `notification_events`

Notification events should remain communication/notification workflow evidence.
They may own notification intent, template, channel, and provider dispatch
context for broader notifications.

Delivery proof should not replace notifications. A document send action may
create both:

- a notification event/delivery row for provider/channel execution
- a document delivery event for canonical document-subject evidence

The delivery event should link to notification rows where available.

### `notification_deliveries`

Notification deliveries are provider/channel delivery mechanics. Delivery proof
should reference them rather than duplicate every provider field.

Recommended relationship:

- notification delivery rows handle provider status for a message
- document delivery events normalize the document-specific evidence contractors
  need to see beside estimates, contracts, invoices, and warranties

### `contract_signature_events`

Contract signature events remain contract-signature truth.

Delivery proof may project contract signature milestones into a unified delivery
history, but it should not migrate, replace, or reinterpret contract signature
events in the first slice.

### `document_signature_events`

Generic document signature events remain warranty-document signature truth.

Delivery proof may show `signed` or `declined` milestones from
`document_signature_events`, but the signature event remains the source event
for legal/audit interpretation.

### `payment_events`

Payment events remain payment truth.

Delivery proof may show invoice milestones such as `payment_started` and
`payment_completed` in a document history, but invoice balance, payment status,
and reconciliation must continue to derive from canonical payments and
`payment_events`.

### `portal_record_views`

Portal record views, where present, should remain portal access/view evidence.

Delivery proof can show a customer-safe `viewed` item by referencing or
projecting portal view evidence, but it should not copy every portal view into a
delivery table unless an explicit idempotent mapping is designed.

## Provider Abstraction

Provider adapters should translate external delivery events into normalized
delivery evidence without making the provider the source of truth.

Provider scope:

- Postmark/email provider
- future SMS provider
- future e-sign provider
- future customer portal notification

Adapter rules:

- provider-specific SDK calls belong behind integration wrappers
- provider callbacks must be idempotent
- provider callback association should use provider message ids, provider event
  ids, subject metadata, company ids, and internal delivery/notification ids
- provider metadata should be stored only when useful and non-secret
- raw payload storage should be minimized or redacted
- provider callback handling must not mutate invoices, payments, signatures, or
  document status unless the owning domain explicitly handles that event

## Delivery Proof UX

Contractor-facing UX should add delivery history where the contractor acts:

- Estimate Workspace
- Contract Workspace
- Invoice Workspace
- Warranty Document Workspace
- Project Workspace compact timeline or evidence panel
- Customer Workspace account history
- Dashboard Operational Cockpit only for bounded attention items

Useful contractor-facing items:

- who the document was sent to
- when it was sent
- whether it was delivered, bounced, failed, opened, viewed, signed, declined,
  or paid
- which channel was used
- whether a resend happened
- link back to the canonical document

Dashboard visibility should stay read-only and bounded:

- failed/bounced delivery
- requested but not sent
- sent but not viewed after configured threshold later
- signature/payment waiting state where existing domain logic supports it

No dashboard-owned persistence should be introduced by the delivery-proof UX.

## Portal Visibility

Portal visibility should be customer-safe and scoped:

- customers may see document status relevant to them, such as sent, viewed,
  signed, declined, or paid
- customers should not see provider diagnostics, internal failure notes,
  internal resend attempts, raw webhook payloads, internal recipient routing, or
  unrelated recipients
- portal access must remain project/contact scoped where that is the current
  access model
- no portal-only delivery records or document copies should be created

For MVP, portal delivery history should be minimal. Contractor-facing proof can
arrive first.

## Security And Tenant Isolation

Security requirements:

- every delivery event is tenant-scoped
- subject ownership must be validated for the same company
- recipient references must be same-company or explicitly snapshot-only custom
  recipients
- portal loaders must validate portal access before exposing delivery history
- provider callbacks must not trust provider metadata alone for tenant/subject
  assignment
- provider ids must be idempotency keys, not authorization proof
- tokens, secrets, invite links, payment secrets, and raw auth material must not
  be stored in delivery event metadata
- RLS should allow active company members to read contractor-side evidence and
  restrict mutation to approved server actions or owner/admin/manager policies
  depending on the final schema

## Retry/Resend Behavior

Resend should be represented as a new attempt, not an overwrite.

Recommended concepts:

- `delivery_group_id`: groups all attempts for one document/recipient/send
  intent
- `attempt_number`: increments for each resend
- `send_requested` event for the resend
- provider-specific sent/delivered/failed events tied to the new attempt

Past failures and bounces remain evidence. A successful resend should not erase
the first failed attempt.

## Idempotency And Provider Event Handling

Provider callbacks should be idempotent.

Recommended idempotency keys:

- provider event id
- provider message id plus event type plus timestamp where event id is absent
- internal notification delivery id
- internal delivery attempt id

Callback handling should:

- verify provider signature where supported
- resolve to an internal notification/delivery attempt before canonical subject
  update
- append only one normalized event per provider event
- ignore unsupported event types safely
- refuse cross-tenant or mismatched subject references
- never infer payment completion, signature completion, or document acceptance
  from email delivery alone

## Attachment/PDF Strategy

Current state:

- estimates, contracts, invoices, and warranty documents render browser
  print/save views from canonical records
- stored generated PDFs are not the canonical source of truth
- portal print routes must validate record access before rendering

Future direction:

- generated/stored PDFs should be versioned evidence attached to canonical
  records
- document packets, submittals, and closeout packages may eventually collect
  multiple canonical documents and files into a deliverable bundle
- delivery proof should reference the delivered document version or render
  snapshot when that versioning exists
- until stored versions exist, delivery proof should point to the canonical
  record and record the rendered/template version context available at send time

PDF files should be evidence, not detached document truth.

Document Engine Phase 1 keeps print/save separate from delivery proof:

- estimate, contract, and invoice `/pdf` routes are browser print/save HTML
  views over current source records
- using those routes does not create `document_delivery_events`
- printing or saving a PDF is not provider delivery, customer viewing,
  signature activity, payment activity, or approval activity
- the route footer and export notice should keep this distinction visible to
  contractors and portal customers

## Template/Send Merge-Data Concerns

Send workflows should resolve merge data server-side.

Required inputs may include:

- organization display/legal name and contact details
- customer account and customer contact
- project/job labels and addresses
- estimate/contract/invoice/warranty document numbers and titles
- signer or billing-contact details
- portal review URL
- print/save URL where customer-safe

Rules:

- do not generate portal URLs until access is validated or provisioned
- do not expose internal cost, labor, service ticket notes, or provider metadata
  in customer-facing templates
- snapshot recipient and template identity for audit readability
- provider templates are delivery rendering, not document truth

## Audit/Legal Considerations

Delivery proof is evidence, not a guarantee of legal acceptance.

Legal/audit boundaries:

- signature events prove signature actions, not email delivery
- payment events prove payment actions, not email delivery
- delivery/open/click events prove provider or portal observations, not
  customer intent
- provider open/click tracking can be blocked by clients and should be labeled
  as a signal
- document versions eventually matter for legal certainty: what was sent should
  be identifiable
- retention, export, and deletion policy must be decided before broad provider
  payload storage

## Implementation Phases

Phase 1: Architecture and evidence-only foundation

- implemented for warranty documents, estimates, invoices, and contracts through
  immutable `document_delivery_events`
- subject/recipient/event vocabulary exists for the core document subjects
- internal append/read utilities exist for supported document subjects
- guarded provider email exists for warranty, estimate, invoice, and contract
  send-for-signature paths
- existing document statuses are not changed automatically

Phase 2: Contractor-facing delivery history

- Warranty Document, Estimate, Invoice, and Contract details now show delivery
  history for supported subjects
- add compact Project/Customer history projections
- add bounded dashboard attention only for failed or pending evidence

Phase 3: Provider-backed send

- implemented first Postmark-backed sends through the existing integration
  boundary for warranty documents, estimates, invoices, and contracts
- create notification events and delivery evidence together from guarded send
  actions
- handle provider callbacks idempotently
- keep resend attempts explicit

Phase 4: Cross-document expansion

- implemented expansion to estimates, invoices, and contracts after contract
  reconciliation in
  [docs/contracts-delivery-proof-reconciliation-plan.md](C:/FloorConnector/docs/contracts-delivery-proof-reconciliation-plan.md)
- contract delivery evidence does not mirror contract signature events
- keep contract signatures and payment events specialized
- expose customer-safe portal delivery history only after contractor evidence is
  stable

Phase 5: Packets and stored versions

- add generated/stored PDF version evidence
- add document packets, submittals, closeout packets, and package delivery proof

## MVP Implementation Slice

Implemented MVP:

- evidence-only `document_delivery_events` foundation
- supported subjects constrained to `warranty_document`, `estimate`, `invoice`,
  and `contract`
- internal utilities to append and list delivery events for supported document
  subjects
- explicit internal action for `delivery_recorded` / `send_requested` evidence
- read-only delivery history on Warranty Document, Estimate, Invoice, and
  Contract detail workspaces
- no provider callbacks, estimate/invoice/warranty status mutation, signature
  mutation from provider delivery, contract signature migration, automatic
  contract signature-event mirroring, payment mutation, portal delivery proof,
  or project/job mutation

Contracts delivery-proof reconciliation planning now lives in
[docs/contracts-delivery-proof-reconciliation-plan.md](C:/FloorConnector/docs/contracts-delivery-proof-reconciliation-plan.md).
The first contract implementations added `contract` support for
manual/internal/print evidence and guarded provider-backed send-for-signature
email evidence. Contract Workspace shows delivery proof as a separate panel and
leaves send/sign/view/decline/countersign truth in `contract_signature_events`.

## Risks And Open Questions

- Should resend/retry need separate delivery attempts, or can it remain event
  metadata for the first provider-backed slice?
- How should contracts coexist with generic delivery events without replacing
  contract-specific send/signature event truth?
- Should document delivery events link directly to `notification_events`, to
  `notification_deliveries`, or to both? The provider-send plan recommends
  `notification_deliveries` as the attempt layer and `document_delivery_events`
  as the normalized document-subject evidence layer, with direct delivery-row
  linkage added only when implementation proves it necessary.
- Should portal view evidence stay in `portal_record_views` with read-model
  projection, or should selected views also create delivery events?
- How much provider metadata should be retained for legal/support usefulness
  without storing raw provider payloads?
- Which document status changes are allowed on send for each document type?
- Should invoice payment milestones appear in delivery history through projection
  only, or should key payment events create linked delivery timeline entries?
- What is the final customer-safe portal delivery-history policy?
- When should stored PDF/version snapshots become required for sent documents?
- How should resend throttling, bounce suppression, and recipient opt-out
  integrate with communication preferences later?

## Anti-Silo Guardrails

- No portal-only document copies.
- No provider-only source of truth.
- No duplicate estimate, contract, invoice, warranty, signer, payment, customer,
  project, or job models.
- No automatic financial/payment/signature mutation from delivery telemetry.
- No contract signature migration in the first delivery slice.
- Provider-backed email send is limited to the guarded warranty, estimate,
  invoice, and contract send-for-signature slices; no provider callbacks, resend
  orchestration, or provider-owned workflow truth is implemented.
- No dashboard-owned delivery state.
- No AI-sent customer communications without explicit future approval gates.

## Provider-Backed Send Planning Checkpoint

Provider-backed outbound document send architecture now lives in
[docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md).
It recommends using `notification_events` for communication intent,
`notification_deliveries` for provider/channel attempts and callback telemetry,
and `document_delivery_events` for contractor-facing document proof. The first
safe implementation path started with warranty document email send over a portal
review/sign link and now includes estimate portal review email, invoice portal
review/payment email, and guarded contract send-for-signature email. The
closeout audit plus contract implementation preserve approval, payment, and
signature boundaries while keeping contract send/sign/view/decline/countersign
truth in the existing contract workflow.

## Send Trail Visibility Checkpoint

[docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md](C:/FloorConnector/docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md)
records the first read-only UI summary layer over this foundation. It adds a
pure Send Trail helper and compact source-record delivery proof summaries for
Estimate, Contract, and Invoice Workspaces.

That visibility slice does not add schema, routes, server actions, provider
sends, provider callbacks, fake events, portal-only copies, payment/signature
behavior, estimate/invoice math changes, automation, or AI.
