# Company Documents Phase 1B - View And Print

Status: Implemented
Doc Type: Implementation Checkpoint

## Purpose

Company Documents Phase 1B makes the Phase 1A Document Library more usable by
adding contractor-side read and browser print/save views for company documents.
The slice keeps Company Documents under Company Controls and uses the existing
Document Engine print conventions without creating files, sending documents, or
changing document state.

This phase is not AI generation, legal advice, e-sign, employee
acknowledgement, portal/customer distribution, file upload/storage, provider
sending, or delivery proof.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/company-documents-phase-1a-schema-settings-library.md`
- `docs/design/business-documents-phase-1-company-library-plan.md`
- `docs/design/company-documents-schema-readiness-audit.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2-plan.md`
- `docs/document-delivery-proof-architecture.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

Phase 1B reuses the `company_documents` table and the tenant-safe
`apps/web/lib/company-documents/data.ts` helpers from Phase 1A. The new routes
load existing company document fields only: title, category, document kind,
audience, status, effective/expiration dates, description, body, archive
timestamp, and created/updated timestamps.

No new schema, migrations, storage buckets, seed data, fake documents, or
provider records were added.

## Routes / UI Implemented

- `/settings/company-documents/[documentId]` now renders a contractor-side
  readable company document detail view.
- `/settings/company-documents/[documentId]/pdf` now renders a protected
  browser print/save view for the same company document.
- The Company Documents library list now links to View and Print / Save PDF
  actions for each listed document.
- The detail view shows metadata, description, body content, archive state when
  present, an Edit action for managers/owners/admins, a Print / Save PDF action,
  and a Back to Company Documents action.
- Empty document bodies render: "No document body has been added yet."

## Document Engine Print Behavior

The print route uses the shared Document Engine print view, organization
branding, print button, href helpers, export notice, and footer-note pattern.
The company document body is rendered as plain text from the stored record,
preserving whitespace without interpreting it as HTML.

The print view states that printing or saving does not send the document, sign
it, create delivery proof, or change document status. It also states that
Company Documents stores company document content and does not provide legal
advice.

## Access / Security Behavior

- Company document detail and print routes require an authenticated contractor
  user.
- Routes load documents through the existing company-document data helper,
  which scopes reads to the active organization/company context.
- Portal-only users are redirected away by the existing contractor auth
  boundary.
- Manage actions remain limited to the existing owner/admin/manager behavior.
- Archived documents remain readable and printable as read-only records.

## Behavior Preserved

This implementation does not change:

- `company_documents` schema, migration, or RLS policies
- Phase 1A create/edit/archive/restore server actions
- `document_templates`
- estimate, contract, invoice, warranty, or closeout print behavior
- Send Trail, delivery proof, signature, payment, estimate, or invoice state
- portal grants, customer portal routes, settings outside Company Documents, or
  platform-admin behavior

## Intentionally Not Implemented Yet

- AI drafting
- legal document generation or legal advice
- e-sign
- employee/subcontractor acknowledgements
- employee or customer portal distribution
- public links
- file upload/storage
- platform Starter Documents
- immutable document versioning
- stored PDF artifacts
- provider sending
- delivery proof from print/export

## Follow-Up Candidates

1. Add document versioning after publish/review rules are explicit.
2. Add platform Starter Documents with explicit tenant-copy adoption.
3. Add attachments only after storage, retention, scanning, and access rules are
   approved.
4. Add acknowledgement workflows only after People/vendor identity, notification,
   and retention policy are designed.
