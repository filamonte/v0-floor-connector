# Outbound Document Send Architecture For Provider-Backed Email

Status: Planning / warranty, estimate, invoice, and contract send slices implemented
Doc Type: Architecture / Product Plan

This plan defines provider-backed outbound document sending for estimates,
contracts, invoices, and warranty documents. It is now partially implemented for
warranty document review/sign email sends, estimate portal review email sends,
invoice portal review/payment email sends, and contract send-for-signature email
delivery. It does not authorize provider callbacks, resend/retry orchestration,
stored PDF generation, env var changes, payment/signature auto-mutation,
checkout start from email, or broad document-status automation.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

FloorConnector now has evidence-only `document_delivery_events` for estimates,
contracts, invoices, and warranty documents. That is the correct foundation
before provider-backed sending: document records already have a canonical place
to show contractor-facing proof, while provider mechanics can stay in the
notification/delivery layer.

The provider-backed send architecture should use three coordinated layers:

- document-specific workflow rules decide whether a document can be sent
- `notification_events` and `notification_deliveries` own communication intent,
  delivery attempts, provider IDs, errors, and callback telemetry
- `document_delivery_events` own normalized document-subject evidence visible on
  document workspaces

Provider email should help deliver canonical document links. It should not become
the source of truth for estimates, contracts, invoices, payments, warranty
documents, signatures, portal views, or project readiness.

## Existing Delivery And Evidence Foundation

Implemented evidence-only delivery proof currently includes:

- `document_delivery_events.subject_type` values for `estimate`, `contract`,
  `invoice`, and `warranty_document`
- tenant-scoped same-company subject validation
- immutable event rows after insert
- active-member read access and owner/admin/manager insertion
- manual/internal/print delivery evidence panels on supported document
  workspaces
- provider metadata fields for future use
- optional linkage to `notification_events`

Current delivery proof intentionally does not:

- process provider callbacks
- mutate document status
- mutate signature state
- mutate invoice payment state
- mirror contract signature events
- expose delivery proof to portal customers
- create stored PDF truth

Implementation checkpoint:

- Warranty Document detail can send a provider-backed review/sign email to a
  requested customer signer when the warranty document is project-linked,
  customer-visible, and the signer has active portal project access.
- The warranty send action creates `notification_events` communication intent,
  creates a `notification_deliveries` email attempt, appends
  `document_delivery_events.send_requested`, and then records `sent` or `failed`
  delivery evidence based on Postmark acceptance, activation lock state, missing
  configuration, or provider failure.
- The email contains a customer-safe portal warranty review/sign link and no
  stored PDF attachment.
- The send action does not update warranty document status, signer status,
  signature events, invoice/payment/job/service-ticket state, contract signature
  state, or estimate/invoice/contract delivery behavior.
- Estimate Workspace can now send a provider-backed portal review email for
  draft or rejected estimates to active project-scoped portal recipients. The
  action creates `notification_events` communication intent,
  `notification_deliveries` provider-attempt telemetry, appends
  `document_delivery_events.send_requested`, and records `sent` or `failed`
  evidence based on Postmark acceptance, activation lock state, missing
  configuration, or provider failure.
- Estimate provider email preserves approval/payment/signature boundaries:
  failed/no-send cases do not mark the estimate sent, and provider delivery does
  not approve/reject estimates, create contracts, create invoices, mutate
  payments, or touch contract/warranty signature state.
- Invoice Workspace can now send a provider-backed portal review/payment email
  for sent or partially paid invoices with an open balance to active
  project-scoped portal recipients. The action creates `notification_events`
  communication intent, `notification_deliveries` provider-attempt telemetry,
  appends `document_delivery_events.send_requested`, and records `sent` or
  `failed` evidence based on Postmark acceptance, activation lock state,
  missing configuration, or provider failure.
- Invoice provider email preserves payment boundaries: it does not start
  checkout, create payments, write `payment_events`, mark invoices paid or
  partially paid, or change invoice status.
- Contract send-for-signature now attempts provider-backed email delivery to the
  customer signer after the existing contract signature workflow succeeds. The
  existing contract flow still owns signer routing, sent-PDF snapshot metadata,
  readiness/lock/status changes, `contract_signature_events.signature_requested`,
  and project readiness sync.
- Contract provider email creates `notification_events` communication intent,
  `notification_deliveries` provider-attempt telemetry, appends
  `document_delivery_events.send_requested`, and records `sent` or `failed`
  document evidence from Postmark acceptance, missing configuration, or provider
  failure.
- Provider email acceptance or failure does not mark any signer signed, create
  signed/declined/countersign events, alter contract readiness beyond the
  existing send-for-signature behavior, or replace `contract_signature_events`.

Closeout audit checkpoint:

- The warranty, estimate, invoice, and contract provider-send slices share the same
  evidence ladder: create communication intent in `notification_events`, create
  provider-attempt telemetry in `notification_deliveries`, append
  `document_delivery_events.send_requested`, then append `sent` only when the
  provider accepts or `failed` when the document-specific provider path records a
  configuration, activation, or provider IO block. Contract send still preserves
  the existing production-action gate before signature workflow creation.
- Failed/no-send paths are intentionally honest evidence. They do not mark
  estimates sent, do not start invoice checkout, do not create payments or
  `payment_events`, do not sign or decline warranty documents, and do not update
  signer state. Contract provider failure does not create signed events or move
  signer status to signed.
- Contract Workspace now has manual/internal/print and provider-send delivery
  evidence. Contract send/sign/view/decline and countersign truth remains in
  `contract_signature_events` and existing contract status/readiness fields.

## Existing Notification Event And Delivery Foundation

FloorConnector already has communication/provider mechanics:

- `notification_events` is the canonical notification activity stream for
  in-app and delivery-oriented communication signals.
- `notification_deliveries` is the channel/provider delivery ledger for a
  notification event. It records channel, provider, status, recipient details,
  provider message IDs, tracking token, timestamps, error message, and payload.
- Existing appointment and portal-invite email paths use the Postmark-backed
  integration boundary and record provider attempts through
  `notification_deliveries`.
- Existing communication messages can be linked to notification deliveries where
  a customer-facing message is the canonical communication record.

This layer is already the right place for provider attempts. It should not be
replaced by `document_delivery_events`; instead, document delivery events should
reference notification evidence when a provider-backed send involves a document.

## Email Provider Role

Postmark is the likely first provider because the current integration package
already exposes:

- `isPostmarkEmailConfigured`
- `sendPostmarkEmail`
- server-side configuration through centralized env access

The architecture should still remain provider-neutral:

- document send actions depend on an internal email-send service, not Postmark
  directly
- provider-specific request/response payloads stay in adapter or delivery
  metadata
- normalized statuses are stored in FloorConnector event rows
- a future SMS or portal-notification provider can fit without changing
  document-specific workflow truth

Provider metadata is evidence. It is not the canonical document workflow.

## Send Action Model

Provider-backed send actions should be explicit contractor actions. They should
not be background automation unless a later approved automation layer adds
human-confirmed rules.

### Estimate Send

Estimate send should:

- validate contractor user, organization, role, customer/project context, and
  customer-safe recipient
- prepare a portal review link
- create communication intent and provider delivery evidence
- append document delivery evidence
- preserve estimate approval/rejection truth in the estimate/portal workflow

Estimate email delivery should not approve, reject, revise, or snapshot the
estimate by itself.

### Contract Send / Signature Request

Contract send has the largest blast radius because contract signing is already
contract-specific. Contract send-for-signature should continue to own:

- signer routing
- contract readiness/locking
- contract status updates
- `contract_signature_events.signature_requested`
- portal contract review/sign/decline/countersign state

Provider-backed contract email adds delivery evidence around the existing
send-for-signature action, but it must not replace or duplicate contract
signature truth.

### Invoice Send / Payment Request

Invoice send should:

- validate invoice/customer/project context
- send a portal invoice review/payment link when payment is allowed
- create notification/delivery rows and document delivery evidence
- keep payment request, checkout, success, failure, and provider-sync truth in
  `payment_events` and canonical payment records

Provider email callbacks must never mark an invoice paid or mutate payment state.

### Warranty Document Send / Signature Request

Warranty document send should:

- validate project-scoped warranty document visibility
- validate customer-safe recipients and eligible signer routing where signing is
  requested
- send the portal warranty review/sign link
- append document delivery evidence
- keep customer signature truth in `document_signers` and
  `document_signature_events`

Provider send can request review/signing, but provider delivery callbacks do not
sign or decline the warranty document.

## Recipient Model

Document sends should prefer canonical recipient sources:

- customer contact
- portal user/contact
- signer
- billing contact
- custom one-off email recipient

Recipient rules:

- canonical contacts should be used when available
- portal users must be scoped through existing access foundations before sending
  portal links
- signer recipients must match the document/signature model for that document
  type
- custom one-off recipients may be allowed as a delivery snapshot only; they
  should not create duplicate customers or contacts
- recipient name/email/role should be copied into delivery evidence at send time
  so the historical proof survives later contact edits

## Delivery Event Mapping

Recommended normalized document delivery event types:

| Event type       | Meaning                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `send_requested` | A contractor requested a document send or send-for-review action.        |
| `queued`         | The internal send service accepted the outbound attempt for provider IO. |
| `sent`           | Provider accepted the message or the system recorded a successful send.  |
| `delivered`      | Provider reports successful delivery to recipient infrastructure.        |
| `opened`         | Provider open-tracking signal was received.                              |
| `clicked`        | Provider click-tracking signal was received.                             |
| `bounced`        | Provider reports bounce/non-delivery.                                    |
| `failed`         | Provider or internal send attempt failed.                                |
| `suppressed`     | Provider suppressed sending due to suppression policy.                   |
| `complained`     | Provider reports spam complaint when supported.                          |

Current implemented event values are narrower. Expanding event vocabulary should
be a small schema/types slice before provider callbacks rely on those statuses.

Open/click tracking is useful signal, not legal certainty. Authenticated portal
views remain stronger customer action evidence.

## Relationship Between Event Systems

### `document_delivery_events`

Owns normalized, document-subject delivery proof for contractor workspaces.
Events answer: "What delivery evidence exists for this estimate, contract,
invoice, or warranty document?"

### `notification_events`

Owns communication intent and application notification history. A provider-backed
document send should create a notification event describing the send request or
communication event.

### `notification_deliveries`

Owns channel/provider delivery attempts. It should store provider name, provider
message ID, attempt status, error details, callback-derived timestamps, and
provider payload snapshots.

### `contract_signature_events`

Owns contract signature lifecycle truth. Contract send/sign/view/decline/
countersign events stay here. Delivery proof can link to or display alongside
these events later, but it must not replace them.

### `document_signature_events`

Owns warranty document signature lifecycle truth. Warranty sign/decline/view
activity stays here. Delivery events may show that an email was sent, opened, or
failed, but signing remains a signature event.

### `payment_events`

Owns invoice payment workflow truth. Payment-request, checkout-started,
payment-succeeded, payment-failed, and provider-sync state stay here. Delivery
events never mark payments paid.

### `portal_record_views`

Owns authenticated portal view evidence. Provider `opened` or `clicked` events
should not be treated as the same as an authenticated portal view.

## Status Mutation Policy

Provider-backed send actions may update owning records only when an existing
document-specific workflow explicitly permits it.

Allowed examples:

- estimate send may mark an estimate sent only if the current estimate workflow
  already treats send as the status transition
- contract send-for-signature may continue updating contract/signature readiness
  through the existing contract-specific action
- invoice send/payment request may create payment-request evidence only through
  the existing invoice/payment workflow boundary
- warranty send-for-signature may update document signer state only through the
  generic warranty signer workflow, not from provider telemetry

Provider callbacks must not:

- approve estimates
- sign, decline, countersign, void, or lock contracts
- mark invoices paid
- sign or decline warranty documents
- update project/job readiness
- mutate service tickets
- mutate job costing, payroll, or financial ledgers

Provider callbacks can:

- update `notification_deliveries` provider telemetry
- append normalized `document_delivery_events` when idempotent correlation is
  trusted
- surface failed/bounced warnings for human review

## Idempotency Model

Provider-backed send needs idempotency at three levels:

- send request idempotency so double-clicks do not create duplicate provider
  sends
- provider message idempotency so provider responses and callbacks attach to the
  correct attempt
- provider event idempotency so callbacks are processed once

Recommended keys:

- `notification_deliveries.id` as the internal delivery attempt ID
- `provider_message_id` for provider message correlation
- `provider_event_id` for callback event dedupe
- `document_delivery_events.provider_message_id` and `provider_event_id` for
  normalized document evidence
- future `related_notification_delivery_id` if direct delivery-attempt linkage is
  needed

Callbacks should first resolve the notification delivery. Only then should they
append or skip document delivery evidence based on a normalized mapping and
dedupe rules.

## Delivery Attempts Vs Delivery Events

For the first provider-backed MVP, `notification_deliveries` can act as the
delivery attempt row. A new `document_delivery_attempts` table is not required
unless future workflows need to group:

- multiple recipients under one document send batch
- resend attempts under one delivery campaign
- email and SMS attempts under one send request
- provider retries separate from contractor resends
- document packets containing multiple canonical records

If those needs become real, `document_delivery_attempts` can be introduced as a
grouping layer between document subjects and notification deliveries. It should
not replace immutable event rows.

## Template And Rendering Strategy

MVP sends should prefer portal links over attachments:

- links keep review/sign/pay actions scoped through portal access
- links avoid treating a generated file as the source of truth
- links allow customer-safe route validation at click time

PDF attachments should remain future unless a legal/audit requirement proves
they are required for a specific document flow.

Current browser print/save routes remain useful output views, but they are not
stored immutable PDFs. Future stored PDFs should be versioned snapshots tied to
canonical document state and delivery evidence, especially for signed contracts,
signed warranty documents, document packets, submittals, and closeout packages.

## Security And Tenant Isolation

Provider-backed sends must enforce:

- authenticated contractor user
- active organization membership
- owner/admin/manager permission unless a narrower role policy is approved
- same-company subject validation
- customer/project/job linkage validation where applicable
- customer-safe recipient selection
- portal access validation before any portal route is sent
- activation/provider-send guardrails before external email
- no raw access tokens in notification payloads or delivery metadata
- no provider secrets in event payloads
- signed/provider-authenticated webhook callbacks
- idempotent callback processing

Portal links should be scoped links into existing portal access flows, not
unguarded public document URLs.

## Provider Webhook Strategy

Provider callbacks should be a separate implementation slice after the first
send action is stable.

Recommended flow:

1. Verify provider webhook signature or equivalent provider authenticity.
2. Normalize provider event type.
3. Locate `notification_deliveries` by provider and `provider_message_id`.
4. Deduplicate by provider event ID where available.
5. Update the delivery attempt telemetry.
6. Append a normalized `document_delivery_events` row only when the delivery
   attempt is confidently linked to a supported document subject.
7. Do not mutate document, signature, payment, project, job, or service-ticket
   workflow state from the callback.

Webhook raw payloads should be stored sparingly and scrubbed of secrets or
unnecessary personal data.

## UI/UX

Send UI should be explicit about what happens:

- "Send estimate for review"
- "Send invoice/payment link"
- "Send warranty for review/signature"
- "Send contract for signature"

Copy should distinguish:

- send request
- email/provider delivery
- portal view
- signature
- payment

Delivery History panels should show:

- send requested
- sent/delivered/opened/clicked/failed/bounced where provider data exists
- recipient snapshot
- provider/channel
- linked notification/delivery context where useful
- failures with a clear human next step

Resend controls should wait until idempotency and attempt grouping are explicit.

## Portal And Customer Visibility

Portal customers should initially see canonical documents and their own workflow
actions, not the contractor's internal provider ledger.

Future customer-visible delivery proof may show limited facts such as:

- document was sent
- document was viewed in portal
- document was signed or declined
- invoice payment was started or completed

Internal-only fields should remain hidden:

- provider payloads
- bounce/error internals
- staff notes
- unrelated recipients
- internal delivery attempts
- other signers' sensitive routing data

## Testing And QA Strategy

Provider-backed send implementation should include:

- same-company subject validation tests
- recipient selection and email normalization tests
- provider-not-configured guardrail tests
- notification event/delivery creation tests
- document delivery event append tests
- no document status mutation tests where send is evidence-only
- contract regression tests proving signature send/sign/decline/countersign
  behavior is unchanged
- invoice tests proving payment state does not change from email delivery
- warranty tests proving email delivery does not sign/decline the document
- provider failure tests that record failure evidence without partial workflow
  mutation
- idempotency tests for repeated send requests or provider callbacks

Browser smoke should come after deterministic action/helper coverage.

## MVP Implementation Recommendation

The safest first provider-backed implementation slice should be warranty
documents.

Why warranty first:

- warranty documents already use the generic template, delivery, and signature
  foundations
- portal warranty review/sign routes already exist
- warranty signing is lower blast radius than contract signature readiness or
  invoice payment state
- it avoids contract migration and payment mutation risk
- it proves the generic provider-send path on a document type built for it

Implemented warranty-send MVP:

1. Add customer-safe warranty email content builder.
2. Add a guarded send action on Warranty Document detail.
3. Validate organization role, warranty document, project/portal visibility, and
   selected recipient/signer.
4. Create `notification_events` communication intent.
5. Create `notification_deliveries` email attempt with pending/queued state.
6. Append `document_delivery_events.send_requested`.
7. Call the provider only when Postmark is configured and the organization is
   allowed to send externally.
8. On provider success, update delivery attempt and append `sent`.
9. On provider failure, update delivery attempt and append `failed`.
10. Do not update warranty document status, signer status, or signature events
    unless the explicit warranty signature-request workflow is invoked in the
    same human-confirmed action.

Second implementation candidate:

- estimates, using the same send service and portal review link pattern. This is
  now implemented for draft/rejected estimates with project-scoped portal
  recipients and no approval/payment/signature side effects from delivery.

Third implementation candidate:

- invoices, using the same provider boundary and delivery-evidence ladder. This
  is now implemented for sent or partially paid invoices with an open balance
  and project-scoped portal recipients. It sends a portal review/payment link
  without starting checkout, creating payments, writing `payment_events`, or
  changing invoice status.

Implemented contract-send MVP:

1. Wrap the existing contract send-for-signature action instead of adding a
   parallel document-send action.
2. Let the existing contract workflow validate readiness, create signer routing,
   generate sent-PDF metadata, update contract status/readiness/lock fields,
   append `contract_signature_events.signature_requested`, record the contract
   milestone notification, sync project readiness, and create the pre-signature
   revision.
3. Create `notification_events` communication intent for the email attempt.
4. Create `notification_deliveries` email attempt telemetry.
5. Append `document_delivery_events.send_requested`.
6. Call Postmark only when configured.
7. On provider success, update delivery attempt and append `sent`.
8. On provider/config failure, update delivery attempt and append `failed`.
9. Do not mark signers signed, create signed/declined/countersign events, change
   payment state, migrate contract signatures, or make provider delivery the
   source of signature truth.

## Phase 2/3 Expansion

Phase 2:

- provider webhook callback ingestion
- delivery failure dashboard/read-model warnings
- resend controls after idempotency is proven

Phase 3:

- customer-visible delivery summaries where appropriate
- stored PDF/version snapshot strategy
- document packets and closeout/submittal sends
- SMS or portal notification channels
- merged document activity timelines that project owning-domain events without
  duplicating truth

## Risks And Open Questions

- Should `document_delivery_events` gain `queued`, `delivered`, `suppressed`,
  and `complained` before the first provider send, or should provider MVP map
  only to the existing values?
- Should `document_delivery_events` link directly to `notification_deliveries`
  in addition to `notification_events`?
- Which organization activation guard should govern external document sends?
- Should custom one-off recipients be allowed for legal documents, or only for
  estimates/warranties?
- Should invoice sends create a payment-request event every time, or only when
  explicitly sending a payment request?
- Should warranty send and warranty signature request be one combined action or
  two separate actions?
- How much provider payload should be retained for audit without overexposing
  personal data?
- When should stored PDF snapshots become required for sent/signed documents?

## First Safe Implementation Slice

Implementation closeout checkpoint:

The provider-send final regression audit now confirms the shared evidence
ladder across warranty documents, estimates, invoices, and contracts:
`notification_events` owns communication intent, `notification_deliveries` owns
provider-attempt telemetry, and `document_delivery_events` owns contractor-facing
document proof. Focused tests cover provider email rendering, send evidence
vocabulary, migration shape, failed/no-send evidence, and source-level boundary
guards proving provider delivery does not become approval, payment, or signature
truth.

Next send-adjacent work should be planned before implementation: provider
callbacks, resend orchestration, portal-visible proof, stored PDF delivery, and
broader communication workflows all need idempotency and source-ownership rules
before they go live.
