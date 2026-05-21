# Portal Warranty Review / Sign Architecture Plan

Status: Implemented MVP / Architecture Reference
Doc Type: Architecture / Implementation Plan

This plan defines the customer-facing portal warranty document review and signature architecture for FloorConnector. The first MVP implementation now exists for project-linked warranty documents, and contractor-side provider-backed warranty review/sign email can now deliver the portal review link to requested customer signers. It does not authorize provider callbacks, portal-visible delivery proof, countersign, provider e-sign integration, service-ticket portal requests, billing automation, job-costing mutation, or contract signature migration.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

Warranty portal review/signing should extend the same customer-facing portal philosophy already used for estimates, contracts, invoices, and change orders: the portal is a constrained surface over canonical records, not a separate document, customer, project, or signature system.

The recommended first implementation should make issued warranty documents reviewable and signable by authenticated portal users who already have explicit access to the linked project. It should use canonical `warranty_documents`, generic `document_signers`, and immutable `document_signature_events`; it should not reuse contract-specific signer tables, mutate commercial readiness, send email, create stored PDFs, or expose internal service-ticket detail.

## Current Implemented Foundation

The current internal service/warranty chain already includes:

- canonical `service_tickets` tied to customer, optional project, and optional original job context
- linked canonical service jobs through `jobs.service_ticket_id`
- service/warranty clocking through canonical punch events and derived time cards
- dashboard, Project, Customer, and Job read-only service/warranty continuity
- warranty `document_templates` with platform seeds and contractor customization
- canonical `warranty_documents` tied to customer, optional project, optional job, optional service ticket, and template context
- contractor-side warranty document detail, issue/void, draft edits, re-render, and browser print/save
- generic `document_signers` and immutable `document_signature_events`, constrained to `warranty_document`
- internal signer management and `signature_requested` audit events

Implemented in the MVP:

- portal warranty document review at `/portal/warranty-documents/:id`
- portal warranty print/save at `/portal/warranty-documents/:id/print`
- portal Project Workspace warranty document visibility
- portal signer validation by authenticated portal email
- portal sign/decline actions over `document_signers`
- immutable `document_signature_events` for viewed/signed/declined activity
- signer status/timestamp updates
- warranty document `signed` status when all active customer signers sign

Deferred today:

- provider callbacks and bounce/open/click reconciliation
- portal-visible delivery proof UI
- countersign
- provider e-sign integration
- contract signature migration

## Portal Access Requirements

Portal warranty review should use the existing portal access model:

- authenticated Supabase-backed portal user
- active `portal_access_grants` row for the canonical customer
- active `portal_project_access` row for the linked project
- same-company customer/project/warranty document validation
- no portal-only warranty document copies

Recommended MVP rule: portal-visible warranty documents must be project-linked. Customer-only warranty documents should remain internal until a separate customer-scoped portal visibility rule is explicitly designed. This keeps the first slice aligned with existing portal project workspaces and avoids broad account-level document exposure.

## Customer-Safe Warranty Document Visibility Rules

A warranty document should be visible in the portal only when all of these are true:

- `warranty_documents.project_id` is present.
- The portal user has active project access for that project.
- The document belongs to the same company and customer as the active portal grant.
- The document status is customer-safe, such as `issued`, `sent`, `viewed`, or `signed`.
- The document is not `draft` or `void`.
- The rendered warranty content is safe for customer display and does not include internal service-ticket notes, internal resolution notes, internal signer-management copy, or dashboard attention language.

Service-ticket context should not be exposed by default. The portal may show customer-safe labels such as warranty title, project, warranty start/end dates, and signature state. Internal service ticket status, priority, crew/time evidence, billing classification, and resolution notes should stay contractor-only until a separate portal service-status plan is implemented.

## Signer Routing Model

Warranty portal signing should use `document_signers`:

- `subject_type = 'warranty_document'`
- `subject_id = warranty_documents.id`
- `signer_role = 'customer'` for customer-facing signature actions
- customer signer status values remain `pending`, `requested`, `viewed`, `signed`, `declined`, or `voided`

Recommended signer eligibility:

- Viewing requires project-scoped portal access.
- Signing requires project-scoped portal access and an active customer signer row.
- The portal user's authenticated email should match `document_signers.signer_email` for signing in MVP.
- If the portal grant is linked to a `customer_contact`, the signer email should also align with that contact email where available.
- If email does not match, the route may show read-only document visibility if access is valid, but signature actions should be disabled with customer-safe copy.

This keeps signature authority explicit without adding a new signer-access table.

## Portal Review Route Design

Recommended route:

- `/portal/warranty-documents/[warrantyDocumentId]`

The route should be linked from the portal project workspace when the warranty document is eligible. It should validate project access from the loaded warranty document rather than trusting URL context.

Future optional alias:

- `/portal/projects/[projectId]/warranty-documents/[warrantyDocumentId]`

The canonical route can remain document-centric while still showing a project back-link. A nested alias is useful only if it improves customer navigation without duplicating loaders or permission logic.

The review page should show:

- contractor brand
- project/customer context
- warranty title
- warranty start/end dates
- warranty basis when customer-safe
- rendered customer-facing warranty content
- current signer state for the authenticated portal user
- signer timeline summary limited to customer-safe events
- `Print / save PDF`
- sign and decline actions only when the current portal user is eligible

## Portal Print/Save Behavior

Warranty portal print/save should follow the current good-enough document delivery model:

- browser print/save route
- render from the canonical warranty document record
- use safe contractor organization branding
- validate portal project access before rendering
- do not create stored PDFs
- do not create portal-only warranty copies
- do not mutate signature, delivery, payment, invoice, job, or service-ticket state

Recommended route:

- `/portal/warranty-documents/[warrantyDocumentId]/print`

## Customer Signature Action

The customer signature action should:

1. Authenticate the portal user.
2. Load the canonical warranty document.
3. Validate active customer grant and project access.
4. Validate the signer row belongs to the warranty document and company.
5. Require `signer_role = 'customer'`.
6. Require signer status `requested` or `viewed`.
7. Require signer email to match the authenticated portal user email for MVP.
8. Update the signer to `signed` and set `signed_at`.
9. Insert an immutable `document_signature_events` row with `event_type = 'signed'`.
10. Recompute whether all active customer signers are signed.
11. Update `warranty_documents.status` to `signed` only when the completion rule is satisfied.

The action must not mutate invoices, payments, contracts, jobs, service tickets, job costing, payroll, readiness gates, or provider state.

## Decline/Acknowledge Flow

Decline should be available when a customer signer can sign but does not agree to the warranty acknowledgement.

Recommended behavior:

- update signer status to `declined`
- set `declined_at`
- insert immutable `document_signature_events` with `event_type = 'declined'`
- keep `warranty_documents.status` unchanged unless a dedicated later status such as `declined` is added
- do not automatically void the warranty document
- route contractor follow-up through internal warranty document/service ticket workspaces

Acknowledgement without signature is not recommended for MVP unless the product needs a distinct "I reviewed this" action. Viewed events can cover review evidence without implying acceptance.

## Event/Audit Trail Behavior

`document_signature_events` should remain append-only signature evidence.

MVP events:

- `viewed`: optional and idempotent when the eligible signer first opens the portal review route
- `signed`: inserted when the portal user signs
- `declined`: inserted when the portal user declines

Existing internal events:

- `signature_requested`: created by contractor-side internal request action
- `voided`: created when signer routing is voided internally

Metadata should be minimal and non-secret. Useful MVP metadata:

- portal user id
- portal grant id if available
- customer contact id if available
- signer role
- signature source such as `portal`

Do not store raw invite tokens, auth secrets, provider secrets, or internal-only notes in signature event metadata.

## Warranty Document Status Behavior

Recommended status rule:

- `draft`: internal-only, not portal-visible
- `issued`: customer-visible if project access exists
- `sent`: future delivery-proof state when outbound send exists
- `viewed`: optional future document-level state, but signer-level `viewed` is enough for MVP
- `signed`: set only after all active required customer signers are signed
- `void`: contractor-controlled terminal state, not triggered by customer decline

For MVP, `document_signers` and `document_signature_events` are the signature truth. Updating `warranty_documents.status = 'signed'` is acceptable only as a derived document lifecycle marker after all required customer signers complete. If the current schema lacks document-level signed timestamps, do not add them in the portal MVP unless a schema slice explicitly approves that change; the event timestamps remain the audit truth.

## Relationship To Internal Signer Management

Internal signer management remains the contractor-side preparation surface:

- add customer signer
- edit signer before signing
- void unsigned signer routing
- request signature internally
- inspect signature events

Portal signing should only act on signer rows that internal users have prepared and requested. The portal should not let a customer add, edit, reassign, or void signer routing.

## Relationship To Existing Contract Portal Signing

Reusable contract patterns:

- project-scoped portal access validation
- customer-safe review route shape
- server-side loaders that validate access before admin-client detail reads
- immutable event philosophy
- signer state displayed beside document content
- sign/decline actions that act on canonical records
- print/save route over canonical document rendering

Do not reuse directly:

- `contract_signers`
- `contract_signature_events`
- contract readiness/lock fields
- contract status rules
- contractor countersign workflow
- contract notification/send workflow
- contract-specific permission flags without an explicit warranty permission decision

Contracts should remain untouched in the warranty portal MVP.

## Relationship To Service Tickets/Project/Customer Portal Workspaces

Portal project workspace should show eligible warranty documents as part of project history and follow-up. It should not show the internal service-ticket manager or internal ticket queue.

Recommended portal project workspace panel:

- title: `Warranty Documents`
- shows issued/signed customer-safe warranty documents linked to the project
- displays warranty date range and signer state
- links to portal warranty review and print/save
- uses compact empty state when no customer-visible warranty documents exist

Customer portal home may later summarize warranty documents across accessible projects, but project workspace should be the first location because existing access is project-scoped.

Service tickets should remain internal in MVP. A later portal service-status plan can decide which ticket states, service appointments, or resolution summaries are customer-safe.

## Delivery Proof And Outbound Email Future Path

Outbound send and delivery proof are now partially implemented on the
contractor side for warranty documents only.

Implemented send does:

- require an existing requested customer signer
- require a project-linked customer-visible warranty document
- require active portal project access for the signer email
- create notification intent and provider-attempt telemetry
- append delivery evidence for `send_requested`, `sent`, or `failed`
- send a portal review/sign link when Postmark is configured and activation
  allows external sends

Future send should still:

- create or update signer routing
- create `signature_requested` event
- add callbacks, retries, delivery proof presentation, and future delivery
  attempt grouping only after idempotency is designed
- avoid provider-owned signature truth

Portal signing continues to rely on project access and signer email match. Email
delivery does not sign, decline, view, or otherwise mutate warranty signature
truth.

## Security/RLS/Admin-Read Considerations

Security requirements:

- Authenticate portal user before loading sensitive warranty content.
- Resolve portal grants from the authenticated user, not from URL parameters.
- Validate active project access before loading warranty content.
- Use server-side same-company checks on warranty document, project, customer, signer, and event rows.
- Keep internal service-ticket fields out of portal loaders.
- Do not expose draft or void warranty documents.
- Do not expose signer rows for other projects or tenants.
- Use admin-client reads only after portal scope is validated, matching the contract/payment-event pattern where RLS would otherwise hide supporting rows from the portal user.
- Keep signature events immutable.
- Keep event metadata free of secrets and raw tokens.

Testing should include unauthorized project denial, cross-tenant denial, wrong-signer email denial, draft/void invisibility, and regression coverage that contract portal signing still passes.

## UX Copy Boundaries: Customer-Safe Vs Internal

Customer-safe copy may say:

- `Review your warranty document for this project.`
- `This warranty is tied to the project your contractor shared with you.`
- `Your signature records acknowledgement of the warranty terms.`
- `Declining sends this back to your contractor for follow-up.`

Avoid exposing internal copy such as:

- service ticket priority
- internal resolution notes
- labor/time cost
- dashboard attention labels
- warranty coverage judgment notes
- internal signer-management caveats
- billing/manufacturer-claim classifications

Portal pages should stay calm and action-oriented.

## Testing/QA Strategy

Recommended MVP tests:

- portal warranty loader denies unauthenticated users
- portal warranty loader denies users without project access
- portal warranty loader denies draft/void documents
- portal warranty loader returns customer-safe issued document content
- portal project workspace lists eligible warranty documents only
- sign action requires matching signer email and project access
- sign action updates signer status and appends `signed` event
- all-customer-signer completion marks warranty document signed only when safe
- decline action updates signer status and appends `declined` event without voiding the document
- wrong tenant and wrong project cannot sign
- existing portal contract sign/decline tests still pass
- print/save route loads without mutating signature state

Browser smoke should be added only after stable portal warranty fixtures exist.

## MVP Implementation Slice

Smallest safe MVP:

1. Add portal read-model helpers for eligible warranty documents by project.
2. Add portal warranty review route.
3. Add portal warranty print/save route.
4. Add customer-safe warranty document panel to portal project workspace.
5. Add portal sign action for eligible customer signer.
6. Add portal decline action for eligible customer signer.
7. Append immutable signature events.
8. Update signer status.
9. Mark warranty document `signed` only when all active customer signers are complete and the existing status model supports it safely.
10. Add focused portal/signature tests.

MVP exclusions:

- outbound email
- delivery proof UI
- provider e-sign
- countersign
- service ticket portal request/status workflow
- warranty billing
- manufacturer claims
- warranty time clocking changes
- contract signature migration
- stored PDFs or versioned signed PDF snapshots

## Phase 2/3 Expansion

Phase 2:

- outbound warranty send through shared communications/notification foundations
- delivery proof timeline
- portal home warranty summary across accessible projects
- idempotent viewed event tracking if not in MVP
- contractor-side delivery/request status polish
- warranty document revision/versioning plan

Phase 3:

- contractor countersign
- provider e-sign adapter
- signed warranty version snapshots
- portal service request/status workflow
- closeout package and warranty bundle
- manufacturer claim attachments and customer-safe status

## Risks And Open Questions

- Should warranty signing require a new linked-contact permission flag, or is project access plus signer email enough for MVP?
- Should customer-level legacy grants be allowed to sign if signer email matches, or should linked-contact grants be required?
- Should `warranty_documents.status = 'viewed'` be used, or should viewed remain signer/event-only?
- Should a customer decline create a contractor work item or leave follow-up to existing dashboard/service-ticket attention?
- Should customer-only warranty documents ever be portal-visible without project access?
- When should signed warranty document content become immutable or revisioned?
- Should contractor countersign be required for formal warranties, or is customer acknowledgement enough for the first customer-facing release?
- Which service ticket fields are safe enough for portal service-status display later?
