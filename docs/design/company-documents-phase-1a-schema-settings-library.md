# Company Documents Phase 1A - Schema And Settings Library

Status: Implemented
Doc Type: Implementation Checkpoint

## Purpose

Company Documents Phase 1A adds the first contractor-owned Company Document
Library foundation under Company Controls. The slice creates a persisted
company document model and a settings surface for business administration
documents such as SOPs, policies, agreements, safety plans, onboarding notes,
training documents, and internal operations documentation.

This phase is not document generation, AI drafting, legal advice, e-sign,
employee/customer portal distribution, public file sharing, provider sending,
storage upload, or Starter Documents.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/product-language.md`
- `docs/design/business-documents-phase-1-company-library-plan.md`
- `docs/design/company-documents-schema-readiness-audit.md`
- `docs/design/company-documents-migration-readiness-audit.md`
- `docs/documentation-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Models Inspected

- Supabase migrations for `companies`, `company_memberships`,
  `document_templates`, `warranty_documents`, `compliance_records`,
  `execution_attachments`, service tickets, document signatures, and document
  delivery events.
- Settings routes, layout, navigation, cards, and server-action patterns under
  `apps/web/app/(app)/settings`, `apps/web/components/settings-*`, and
  `apps/web/lib/settings`.
- Existing document template data helpers and warranty document migration tests.

The repo uses `companies` / `company_id` / `company_memberships` for tenant
scope, so Phase 1A follows that established database convention while mapping
to organization language in app-facing code.

## Migration / Table Implemented

Added `supabase/migrations/20260523140000_company_documents_foundation.sql`.

The new `company_documents` table includes:

- `company_id` tenant ownership
- title, category, document kind, status, audience, description, and optional
  body content
- effective and expiration dates
- archive timestamp
- created/updated user references
- created/updated timestamps and the standard updated-at trigger
- check constraints for category, status, audience, non-empty title, non-empty
  document kind, and archive consistency
- list/filter indexes by company, status, category, updated time, and archived
  time

## RLS / Security Decisions

- RLS is enabled and forced.
- Active company members can select company documents.
- Owner/admin/manager memberships can insert and update company documents.
- No delete policy was added.
- No portal policies were added.
- No platform-admin management path was added.
- No storage bucket, public link, provider, signature, or payment behavior was
  added.

## Settings Route / UI Implemented

Added `/settings/company-documents` under Company Controls.

The surface supports:

- list and filter by status/category
- create company document
- edit metadata and body content
- archive
- restore archived documents to draft
- basic library counts

The `/settings` overview and settings navigation now link to Company Documents.
User-facing copy uses Company Documents, Document Library, and Company Controls
language, with a clear non-legal disclaimer.

## Behavior Preserved

This implementation does not change:

- `document_templates` behavior
- estimate, contract, invoice, or warranty template behavior
- Document Engine print/export routes
- Proof Center, Send Trail, or portal shared-document behavior
- payments, signatures, provider sends, portal grants, estimate math, invoice
  math, settings outside the new Company Documents surface, or platform-admin
  behavior

## Intentionally Not Implemented Yet

- AI generation or drafting
- legal advice or legal review
- e-sign
- employee/subcontractor acknowledgements
- customer or employee portal distribution
- public links
- file upload/storage buckets
- provider sending
- Starter Documents or platform starter adoption
- Document Engine print/save rendering for company documents
- immutable document versioning

## Follow-Up Candidates

1. Add Starter Documents as platform-owned records with explicit tenant-copy
   adoption.
2. Add immutable document versions after review/publishing rules are approved.
3. Add file attachments only after storage, retention, malware-scanning, export,
   and access rules are explicit.
4. Add Document Engine print/save for company documents only after rendering
   boundaries are approved.
5. Add employee/subcontractor acknowledgement workflows after People/vendor
   identity, notification, and retention policy are designed.
