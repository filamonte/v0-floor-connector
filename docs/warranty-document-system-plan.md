# Warranty Document + Signature System Plan

Status: Planning
Doc Type: Architecture / Product Plan

This plan defines the warranty document, template, PDF, send, and signature architecture for FloorConnector. It is planning only and does not authorize application code, schema, migrations, tests, PDF storage, portal changes, signature behavior, provider integration, or financial mutations.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

Warranty documents should behave like FloorConnector's canonical estimate, contract, and invoice document surfaces: printable, savable, attached to canonical records, sendable later, signable later, and versionable later.

Warranty PDFs must not become loose files floating outside the system. They should be generated from warranty templates and project/job/install context, attached to the customer/project/job/warranty record, and eventually routed through the same delivery-proof and signature foundations that protect contracts and customer-facing commercial documents.

## Why Warranty Documentation Matters For Flooring Contractors

Specialty flooring warranties are operational and legal memory. They explain:

- what was installed
- what period is covered
- what workmanship or material terms apply
- what exclusions apply
- what maintenance or use requirements the customer must follow
- how to request service
- which documents/photos/specs support the closeout package

For epoxy, resinous flooring, polishing, coatings, and surface-prep work, warranty language is often tied to substrate conditions, moisture, prep, product systems, traffic/use assumptions, and maintenance expectations.

## Relationship To Estimate/Contract/Invoice PDF Architecture

Current estimate, contract, and invoice print/save routes render canonical records for browser print/save. Warranty documents should follow the same philosophy:

- render from canonical records
- avoid duplicate portal-only copies
- avoid document files as independent source of truth
- support future stored versions/revisions
- support future send and delivery proof
- support future signatures

Warranty documents should reuse shared template/document infrastructure where possible.

Current service/warranty implementation checkpoint:

- Internal `service_tickets` now provide the first canonical service/warranty
  continuity record tied to customers, optional projects, and optional original
  jobs.
- Warranty document templates, canonical generated warranty records, and
  print/save rendering are now implemented as the first warranty document
  foundation.
- Portal warranty signatures, internal delivery evidence, and the first
  provider-backed warranty review/sign email send now exist for project-linked
  warranty documents. Provider callbacks, portal-visible delivery proof,
  countersign, provider e-sign, resend/retry orchestration, and versioned
  warranty document records remain future work.
- The implemented warranty document slice attaches generated warranty output to
  the same customer/project/job/service-ticket context rather than creating
  standalone PDFs.

Current warranty document implementation checkpoint:

- `document_templates` now supports `warranty`.
- A default specialty flooring warranty seed is available through
  `platform_template_seeds` and can be copied into contractor organizations as
  an editable tenant-owned template.
- `/settings/templates` includes warranty templates alongside estimate, invoice,
  and contract templates.
- `warranty_documents` stores canonical tenant-scoped warranty records tied to
  customer, optional project, optional job, optional service ticket, and optional
  warranty template context.
- Service Ticket detail can create and list linked warranty documents.
- Warranty Document detail supports draft review/edit/re-render, issue, void,
  connected-record context, internal signer management, portal-signing context,
  and evidence-only delivery history.
- `/warranty-documents/:id/print` provides the browser print/save view from the
  canonical warranty document record.
- Portal warranty review/signing now uses the generic warranty-only
  signer/event foundation, and contractor-side provider-backed warranty email
  can send the portal review/sign link through the notification/delivery
  boundary. Provider callbacks, portal-visible delivery proof, countersign, and
  provider e-sign remain future.

Current generalized signature foundation checkpoint:

- [docs/document-send-signature-architecture.md](C:/FloorConnector/docs/document-send-signature-architecture.md)
  now captures the contract-signature analysis, generic model, migration
  strategy, portal access strategy, delivery-proof strategy, and first safe
  warranty signature slice.
- `document_signers` and `document_signature_events` now exist as tenant-scoped
  generic signature groundwork constrained to `warranty_document` subjects only.
- Warranty Document detail now supports internal signer management and
  request-signature audit events using the generic signer/event foundation.
- Project, Customer, and Job Workspaces now show compact read-only warranty
  document continuity summaries with warranty dates, signer/request/signed
  counts, latest signature event summary, and links to the canonical warranty
  document and print/save surfaces. These panels do not load rendered warranty
  content or add send/sign actions.
- Dashboard Operational Cockpit now includes bounded read-only warranty document
  attention items for draft/issued warranty documents with missing or requested
  signer activity. These are links into Warranty Document or Service Ticket
  Workspaces only; they do not send email, expose delivery proof actions, or
  create provider-owned signature truth.
- Portal Project Workspace now shows eligible project-linked warranty documents,
  and `/portal/warranty-documents/:id` supports customer-safe review,
  print/save, sign, and decline for authenticated portal users whose email
  matches an eligible customer signer.
- Portal sign/decline appends immutable generic signature events and updates
  signer state. A warranty document moves to `signed` only after all active
  customer signers are signed.
- Existing contract signature behavior remains on `contracts`,
  `contract_signers`, and `contract_signature_events`; no contract migration was
  performed.
- Outbound document delivery and delivery-proof architecture now lives in
  [docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md).
  It defines the shared evidence layer for estimates, contracts, invoices, and
  warranty documents while keeping signature and payment truth in their owning
  event systems.
- `document_delivery_events` now provides immutable evidence-only delivery
  history for warranty documents, estimates, invoices, and manual contract
  evidence. Warranty Document detail can record internal, manual, or print
  delivery evidence; it does not send email, run provider callbacks, change
  warranty status, change signature state, or expose delivery proof to portal
  customers.
- Provider-backed outbound document send architecture now lives in
  [docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md).
  It recommends warranty documents as the first safe provider-backed send MVP
  because warranty already uses the shared template, delivery, portal review,
  and generic signature foundations while avoiding contract-signature and
  invoice-payment blast radius.
- Warranty Document detail can now send a guarded provider-backed review/sign
  email to a requested customer signer when the signer has active portal project
  access. The send action records notification intent, notification delivery
  telemetry, and `document_delivery_events.send_requested` / `sent` / `failed`
  evidence. It does not update signer status, create signature events, mutate
  warranty status, attach a stored PDF, process callbacks, or touch contracts,
  estimates, invoices, payments, jobs, or service tickets.
- Provider callbacks, portal-visible delivery proof, countersign, provider
  e-sign integration, resend/retry orchestration, and contract signature
  migration remain future work.

## Warranty Template Model

Warranty templates should define reusable terms and output structure. They may include:

- title
- warranty type
- default duration
- coverage language
- exclusions
- maintenance requirements
- claim/request instructions
- contractor contact information tokens
- project/customer/job/install tokens
- signature block configuration

Templates are configuration. They are not warranty records by themselves.

## Default Seeded Warranty Templates From Super Admin

Super Admin should seed platform warranty templates for common specialty flooring scenarios, such as:

- standard workmanship warranty
- epoxy flake system warranty
- polished concrete workmanship warranty
- coating/urethane cement warranty
- manufacturer-materials-limited warranty language placeholder
- maintenance-guideline addendum

Platform defaults should be copied into contractor-owned templates when adopted. Platform changes should not silently mutate contractor local copies.

## Contractor-Level Warranty Customization

Contractors should be able to customize:

- template language
- default durations
- exclusions
- maintenance instructions
- brand/company details
- signature requirements later
- default template selection by service/system type later

Customization belongs in tenant-owned settings/template records, not in one-off PDF files.

## Warranty PDF Generation Flow

Recommended flow:

1. Select warranty template from project/job/warranty context.
2. Resolve tokens from canonical customer, project, job, contractor, contract/invoice, and installed-system/material context where available.
3. Render a customer-facing warranty document.
4. Allow contractor review before send/signature.
5. Print/save PDF from the canonical rendering.
6. Store version/revision evidence later, when document versioning is implemented.

The PDF should be output evidence, not the only source of warranty truth.

## Warranty Send/Review/Sign Workflow

The future send workflow should:

- send warranty document to the customer through a controlled delivery path
- record delivery/audit events
- allow portal review where customer has project access
- collect signature when required
- update warranty document status on canonical records

It should reuse or extend existing communication/delivery-proof and signature patterns. It should not create a separate e-sign subsystem.

## Customer Signature Flow

Customer signature may be required for:

- warranty acknowledgement
- maintenance obligation acknowledgement
- closeout acceptance
- limited warranty terms
- service/warranty resolution signoff later

Signature should attach to the warranty document/warranty record and project context. It must not be stored as a detached signed PDF with no canonical lineage.

## Contractor Countersign Future Support

Contractor countersign may be useful for formal warranties. It should follow the same signer routing/audit philosophy as contract signatures, with a clear distinction between customer acknowledgement and contractor countersign.

Countersign is future and should not block MVP warranty document rendering.

## Relationship To Project

Project is the primary warranty document hub. The Project Workspace should show warranty documents, effective dates, status, linked service/warranty tickets, and closeout evidence.

## Relationship To Job

Job context supports completed work dates, crew/execution history, daily logs, field notes, photos, and installed scope. Job-level warranty periods may differ for multi-phase projects.

## Relationship To Installed Systems/Materials

Installed system/material context should eventually drive warranty language and duration. Until that system is implemented, warranty docs can reference estimate/contract/job/material context conservatively.

## Relationship To Customer

Customer context supplies account information and customer contacts. Portal visibility should remain contact/project scoped through existing portal access foundations.

## Relationship To Invoices/Contracts

Contracts and invoices provide commercial/legal/financial context. Warranty documents may reference contract date, completion, invoice, or paid status where appropriate, but should not mutate those records.

## Warranty Effective/Start/End Dates

Warranty dates may derive from:

- project completion
- job completion
- substantial completion
- invoice paid date, if contractor policy says warranty starts after payment
- manual effective date selected by contractor

The architecture should support explicit review rather than hidden automatic dates.

## Warranty Duration Tracking

Warranty duration should be visible at project, job, and system/material levels where available. It should support:

- start date
- end date
- duration
- coverage type
- status: draft, active, expired, voided/superseded later
- related service/warranty tickets

## Warranty Version/Revision Concepts

Warranty document versions should behave like canonical document evidence:

- initial draft
- sent version
- signed version
- revised/superseded version later

Versioning should preserve what the customer received and signed. Do not mutate historical warranty evidence silently.

## Delivery Proof/Audit Trail

Delivery proof should follow
[docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md).
Provider-backed warranty email send should follow
[docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md).
For warranty documents, the future delivery layer should capture:

- created by
- sent to
- delivery method
- sent timestamp
- viewed/opened when provider supports it
- signature events
- declined/voided/superseded states later

Provider telemetry should support the record; it should not become the business source of truth.
Delivery proof should remain evidence-only by default and should not mutate
signer status, warranty document status, invoice/payment state, service-ticket
state, or project/job state unless a later document-specific workflow explicitly
approves that transition.

The first provider-backed warranty send now delivers a portal review/sign link,
creates notification intent and delivery-attempt rows, appends
`document_delivery_events.send_requested` / `sent` / `failed` evidence, and
avoids stored PDFs, provider callbacks, countersign, billing automation, or
automatic signature/status changes.

## Portal/Customer Visibility

Portal customers can now see issued/sent/viewed/signed warranty documents for shared projects through `/portal/warranty-documents/:id` and `/portal/warranty-documents/:id/print`. Visibility uses existing portal grants and project access, requires a project-linked warranty document, and does not create warranty copies or support-only records.

The portal warranty review/signing architecture is captured in [docs/portal-warranty-review-sign-plan.md](C:/FloorConnector/docs/portal-warranty-review-sign-plan.md). The first customer-facing slice now implements project-scoped portal warranty review, portal print/save, eligible customer signer validation by authenticated portal email, signer status updates, immutable generic signature events, and `warranty_documents.status = signed` only when all active customer signers are signed. Contractor-side provider-backed warranty email can now send the portal review/sign link to requested signers. Provider callbacks, portal-visible delivery proof, countersign, provider e-sign, and service-ticket portal visibility remain deferred.

## Template/Token System Concepts

Useful tokens may include:

- contractor legal/display name
- contractor contact details
- customer name and contact
- project name/address
- job name/dates
- contract number/date
- invoice number/date
- installed system/spec/product
- warranty start/end date
- service request instructions
- signature blocks

Token resolution should be server-side and validated to prevent broken customer-facing documents.

## AI-Assisted Drafting Future

AI may later draft warranty language from project context, installed system, product data, and contractor preferences. AI output must remain a draft for human review and must not become customer-facing warranty terms automatically.

No AI should create, send, sign, or revise warranty documents without human confirmation.

## Anti-Silo Guardrails

- Warranty docs attach to canonical customer/project/job/warranty context.
- No loose standalone warranty PDFs as source of truth.
- No portal-only document copies.
- No duplicate signature system.
- No duplicate template system.
- Super Admin seeds defaults; contractors own local copies.
- Warranty docs do not mutate invoices, payments, contracts, or project readiness automatically.
- AI drafts only; humans confirm legal/customer-facing output.

## MVP Implementation Slice

Implemented MVP foundation:

- warranty template architecture review using existing document-template foundations
- seeded default template definitions from Super Admin
- contractor-owned template copy/customization plan
- warranty document render from project/job/customer/service-ticket context
- contractor and portal print/save render paths
- canonical warranty document metadata attached to customer/project/job/service-ticket
  context
- project-scoped portal review/sign/decline over generic signer/event tables

MVP exclusions:

- provider callbacks and portal-visible delivery proof
- provider e-sign integration
- customer portal service request intake
- contractor countersign
- stored version/revision system if not already ready
- automated warranty activation from payment
- AI drafting

## Phase 2/3 Expansion

Phase 2:

- provider callback reconciliation and resend/retry behavior
- portal-visible delivery proof policy
- warranty date tracking
- project/job warranty status surfaces
- portal home/account-level warranty summaries beyond the first project
  workspace panel

Phase 3:

- contractor countersign
- warranty revisions/supersession
- installed-system/material-driven warranty templates
- service/warranty ticket linkage
- AI-assisted drafts

## Testing/QA Strategy

Future implementation should include:

- template token resolution tests
- tenant isolation tests for contractor-owned templates
- render tests for warranty PDFs
- signature/delivery audit tests when send/signature exists
- portal access tests before customer visibility
- regression checks proving estimate/contract/invoice PDFs, contract signatures, portal access, invoices, payments, readiness gates, and document templates remain unchanged

## Open Questions

- Should warranty start date default to job completion, project closeout, or manual review?
- Which seeded warranty templates are required first?
- Should warranty acknowledgement use the contract signature subsystem or a separate generalized document-signature subject?
- What is the first installed-system/material context reliable enough for warranty tokens?
- Should warranty PDFs be generated before service/warranty tickets exist or only after warranty records exist?
- Which warranty documents should be visible in portal MVP?
