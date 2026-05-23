# Company Documents Phase 1 QA Checkpoint

Status: Active
Doc Type: QA Checkpoint

## Purpose

This checkpoint verifies Company Documents Phase 1A and Phase 1B as a safe
contractor-side foundation before any Starter Documents, versioning, storage,
AI drafting, legal review, e-sign, acknowledgements, portal sharing, provider
sending, or delivery-proof work is considered.

Phase 1A added the tenant-owned `company_documents` table, RLS, data helpers,
server actions, and Company Controls library surface. Phase 1B added
contractor-side detail and browser print/save routes.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/business-documents-phase-1-company-library-plan.md`
- `docs/design/company-documents-schema-readiness-audit.md`
- `docs/design/company-documents-phase-1a-schema-settings-library.md`
- `docs/design/company-documents-phase-1b-view-print.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/documentation-governance.md`
- `docs/operating-core-validation-checklist.md`
- `docs/README.md`

## Files Inspected

- `supabase/migrations/20260523140000_company_documents_foundation.sql`
- `apps/web/lib/company-documents/actions.ts`
- `apps/web/lib/company-documents/data.ts`
- `apps/web/lib/company-documents/types.ts`
- `apps/web/lib/company-documents/types.test.ts`
- `apps/web/lib/company-documents/company-documents-migration.test.ts`
- `apps/web/app/(app)/settings/company-documents/page.tsx`
- `apps/web/app/(app)/settings/company-documents/[documentId]/page.tsx`
- `apps/web/app/(app)/settings/company-documents/[documentId]/pdf/page.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/lib/settings/navigation.ts`
- `apps/web/components/customer-document-print-view.tsx`
- `apps/web/lib/document-engine/print.ts`
- `apps/web/lib/document-engine/print.test.ts`

## Schema/RLS Findings

- `company_documents` is scoped by `company_id` and references
  `public.companies(id)`.
- RLS is enabled and forced.
- Active company members can read through `is_active_company_member(company_id)`.
- Owner, admin, and manager memberships can insert and update.
- No delete policy exists; archive/restore remains the lifecycle path.
- No portal/customer policies exist.
- No platform-admin cross-tenant policy or management route was introduced.
- The migration does not touch `document_templates`, storage buckets,
  signatures, delivery events, provider tables, payments, estimates, invoices,
  contracts, warranty documents, or portal access tables.

## Data/Action Findings

- Read helpers scope every list/detail query by the active organization
  context and `company_id`.
- Mutations derive company scope from the authenticated active organization;
  they do not accept client-supplied organization or company ids.
- Server-side Zod validation controls category, status, audience, title,
  document kind, body length, and expiration date shape.
- Archive and restore update only the scoped document row and preserve the
  no-delete lifecycle.
- QA hardening changed action redirect errors to generic user-safe messages
  instead of exposing lower-level database/helper messages in the UI.

## UI/Route Findings

- `/settings/company-documents` is presented as a Company Controls Document
  Library surface.
- The detail route loads the company document through the tenant-scoped helper
  and returns not found when the scoped row does not exist.
- The print route is authenticated, loads through the same scoped helper, and
  uses the active organization brand for the print view.
- List, detail, and print views do not expose customer portal distribution,
  employee acknowledgements, e-sign, public links, provider sends, or fake
  Company Documents.
- Members without manage access see view-only copy instead of create/edit
  controls.
- Empty description/body states are explicit and useful.

## Product Language Findings

- User-facing copy uses `Company Documents`, `Document Library`, and
  `Company Controls` consistently.
- The UI states that Company Documents does not provide legal advice.
- The inspected surfaces do not claim AI generation, e-sign, employee
  acknowledgement, customer/portal sharing, stored PDFs, provider sending, or
  print/export delivery proof.

## Document Engine Boundary Findings

- Company document print/save is an HTML browser print route only.
- Print/save does not write events, create Send Trail proof, create stored
  PDFs, send through providers, mutate signatures, mutate status, or expose
  portal/customer download behavior.
- The print view renders stored body text as plain text with whitespace
  preserved; it does not interpret body content as HTML.
- The export notice and footer preserve the no-send, no-sign, no-delivery-proof,
  no-stored-PDF, and no-legal-advice boundary.

## Tests Run

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/types.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/company-documents-migration.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-engine/print.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- focused Prettier check/write for touched docs and code
- `git diff --check`

## Browser QA Checked/Skipped

Browser QA was skipped for this checkpoint because no saved contractor auth
state was found locally. Protected contractor routes require a usable local
authenticated contractor session, and this pass did not hammer Supabase Auth or
invent browser results. Treat this checkpoint as statically verified with
browser QA blocked, not as route-verified.

Minimum browser routes for the next authenticated pass:

- `/settings`
- `/settings/company-documents`
- `/settings/company-documents/[documentId]`
- `/settings/company-documents/[documentId]/pdf`
- a mobile-width check of `/settings/company-documents`

## Behavior Preserved

This checkpoint preserves:

- `company_documents` schema and RLS shape
- tenant-scoped active organization reads and writes
- owner/admin/manager mutation scope
- active-member read access
- archive/restore instead of delete
- no portal/customer exposure
- no employee acknowledgement flow
- no AI drafting or legal advice
- no e-sign, provider send, stored PDF, public link, storage upload, or
  delivery-proof behavior
- no estimate, contract, invoice, warranty, payment, signature, portal grant,
  settings, platform-admin, auth, RLS, tenant, route, or server-action behavior
  outside the Company Documents action error-copy hardening

## Follow-Up Candidates

1. Run authenticated browser QA with a known-good contractor session and at
   least one safe local/dev company document.
2. Plan Starter Documents as a design pass before adding platform/default
   records or adoption behavior.
3. Plan versioning separately from the current editable library record.
4. Plan file attachments only after storage, retention, scanning, export, and
   access rules are explicit.
5. Plan acknowledgements only after People/vendor identity, notification, and
   retention rules are designed.
