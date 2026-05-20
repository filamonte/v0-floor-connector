# Generalized Document Send + Signature Architecture

Status: Architecture + first foundation slice
Doc Type: Architecture / Implementation Checkpoint

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

FloorConnector's contract signing flow is production-useful but contract-specific. It ties signer routing, portal signature actions, contract lock state, commercial readiness, notifications, and contract status updates directly to `contracts`, `contract_signers`, and `contract_signature_events`.

Warranty documents need the same audit philosophy without being forced into contract tables or creating a second one-off warranty signature system. The recommended path is a generic document-signature foundation that starts with `warranty_document` as the only supported subject, leaves contract behavior untouched, and creates a later migration path for contracts only after generic portal access, send, and readiness semantics are proven.

## Existing Contract Signature Model Summary

Current contract signing uses:

- `contracts` as the canonical commercial document and readiness source.
- `contract_signers` for customer and contractor signer routing.
- `contract_signature_events` for immutable signature audit events.
- Contract-specific timestamps on `contracts`, including customer viewed/signed, contractor countersigned, declined, voided, and signature-started fields.
- Contract-specific readiness fields such as `signature_readiness_status`, `locked_at`, and `edit_lock_reason`.
- Portal contract review/sign/decline routes that act on the canonical contract record.
- Notification and workflow hooks that treat contract signature state as part of commercial readiness.

This model is strong for contracts because contract signature state drives scheduling readiness and downstream commercial workflow. That same tight coupling makes it unsafe to reuse as-is for warranty documents.

## Warranty Document Needs

Warranty documents need:

- signer routing tied to canonical `warranty_documents`
- append-only signature lifecycle evidence
- customer signer and future contractor countersign support
- delivery proof and portal review later
- no invoice, payment, contract, job-costing, or service-ticket mutation
- no detached signed PDFs as the source of truth
- tenant isolation through `company_id` and same-company subject validation

Warranty signing should update warranty document state only when a future explicit action safely supports that transition.

## Reusable Pieces

Reusable design ideas from contracts:

- signer records separate from the signed subject
- immutable event rows for signature activity
- customer and contractor signer roles
- pending/viewed/signed/declined/voided style signer states
- portal access must be resolved before customer-visible review/sign routes
- provider telemetry belongs in audit metadata and must not become business truth
- human-confirmed send/sign actions, not automatic legal workflow mutation

## Contract-Specific Pieces

The current contract signing implementation is contract-specific in these areas:

- `contract_id` columns and contract-only foreign keys
- contract signature enums and contract-only status/event names
- updates to `contracts.status`, `signature_readiness_status`, lock fields, and commercial readiness timestamps
- portal route assumptions around project-scoped contract review
- signer selection based on portal contact access for contract signing permissions
- contractor countersign behavior tied to the contract's final signed state
- notification events and project readiness language that assume a contract

These should not be imported into warranty documents wholesale.

## Recommended Generalized Model

The recommended model is:

- `document_signers`
- `document_signature_events`

The first implemented subject is intentionally constrained to:

- `warranty_document`

This gives warranty documents a real signature/audit foundation without migrating existing contract signing. Contracts should continue using the existing contract-specific tables until a later explicit migration proves parity.

## First Foundation Slice

Implemented in this slice:

- `document_signers`
- `document_signature_events`
- `subject_type = 'warranty_document'` only
- same-company validation against `warranty_documents`
- signer/event subject consistency validation
- immutable event rows
- active-member read RLS
- owner/admin/manager insert/update RLS for signer routing and event creation
- shared TypeScript/domain constants for the generic document signature vocabulary

Current internal signer-management checkpoint:

- Warranty Document detail can list warranty document signers and recent
  signature events.
- Owner/admin/manager users can add or update signer name, email, and
  customer/contractor role.
- Unsigned signers can be voided rather than deleted so signer routing remains
  auditable.
- Internal request-signature actions update eligible signers to `requested` and
  append an immutable `signature_requested` event.
- Requesting signature is explicitly internal audit evidence only. It does not
  send email, expose a portal link, create delivery proof, mutate warranty
  document signed state, or touch invoices, payments, contracts, jobs, or
  service tickets.
- Project, Customer, and Job Workspaces now show read-only signer/request
  summaries for linked warranty documents. The summaries include signer count,
  requested signer count, signed signer count, and latest signature event
  type/date, but they do not add send, portal signing, email, countersign, or
  document-status automation.

Not implemented in this slice:

- contract migration
- warranty portal review/sign routes
- outbound send/email behavior
- delivery proof UI
- countersign workflow
- provider e-sign integration
- warranty document status mutation from signatures

## Migration Strategy

Recommended phased migration:

1. Use generic tables for warranty documents only.
2. Add internal warranty signer management and request-signature actions.
3. Add customer-safe portal warranty review with existing portal grants/project access.
4. Add delivery proof and notifications through shared communication foundations.
5. Add countersign only after customer signature is stable.
6. Evaluate whether contracts should remain specialized or be adapted behind a generic document-signature read interface.
7. Migrate contracts only if generic parity is proven with contract signature E2E coverage and readiness gates preserved.

Contract data should not be moved in-place until the generic model can support current contract behavior, including portal signing, decline, countersign, lock/readiness state, notifications, and regression tests.

## Portal Access Strategy

Portal warranty signing should use existing portal access foundations:

- authenticated portal user
- active customer access grant
- project access when the warranty document is project-linked
- same-company warranty document context
- no portal-only warranty document copies

If a warranty document is not project-linked, the portal visibility rule needs an explicit customer-scoped access decision before implementation.

## Send And Delivery Proof Strategy

Send should eventually be a controlled workflow:

- create or update signer routing
- record a signature-requested event
- create delivery proof through a shared communication/notification path
- expose a portal-safe review URL only after access is scoped
- avoid external provider sending until provider adapters and staging proof exist

No external email/provider send was implemented in this slice.

## Signature Event Strategy

Generic document signature events should be append-only evidence. Initial event types are:

- `signature_requested`
- `viewed`
- `signed`
- `declined`
- `voided`

Provider payloads can be stored as metadata later, but provider status must support the canonical document record rather than replace it.

## Countersign Strategy

Contractor countersign is future. It should reuse the same generic signer/event tables, but warranty document status rules should be separate from contract readiness. A customer-signed warranty does not imply a signed contract, invoice eligibility, payment state, or job-costing state.

## Audit And History Strategy

Signature events provide signature lifecycle audit evidence. Warranty document versions/revisions remain separate future work. A future signed warranty version should preserve the rendered content that was sent and signed without turning a PDF file into the only source of truth.

## Risks And Guardrails

- Do not migrate contracts until parity is proven.
- Do not make warranty signing mutate contracts, invoices, payments, or service-ticket billing state.
- Do not create portal-only warranty records.
- Do not store provider-owned signature state as business truth.
- Do not build a second module-specific warranty signer table.
- Do not expose customer-facing warranty signing until portal access and delivery proof are scoped.

## Recommended Next Implementation Slice

Plan portal warranty review/signing after internal visibility:

- keep the internal signer/audit panel narrow and production-tested
- use the Project/Customer/Job visibility panels as the contractor-side context
  for linked warranty documents and signer request state
- plan portal warranty review/signing with scoped portal access before any
  customer-facing action is implemented
- keep external delivery deferred until delivery proof and provider adapter
  boundaries are explicit
