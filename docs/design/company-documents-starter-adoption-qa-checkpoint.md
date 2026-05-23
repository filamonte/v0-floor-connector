# Company Documents Starter Adoption QA Checkpoint

Status: Active
Doc Type: QA Checkpoint

## Purpose

This checkpoint verifies Company Documents Phase 1C-A Starter Document adoption
after implementation. The goal is to confirm that starter adoption stays safe,
tenant-scoped, permission-aware, and clearly separated from legal advice, AI
drafting, e-sign, acknowledgements, portal sharing, provider sending, stored
files, and platform-managed starter records.

This is a QA and documentation checkpoint only. It does not add new features,
schema, migrations, routes, server actions, platform-admin behavior, or
distribution behavior.

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
- `docs/design/company-documents-phase-1-qa-checkpoint.md`
- `docs/design/company-documents-phase-1c-starter-documents-plan.md`
- `docs/design/company-documents-phase-1c-a-starter-adoption.md`
- `docs/documentation-governance.md`
- `docs/operating-core-validation-checklist.md`

## Files Inspected

- `apps/web/lib/company-documents/starter-documents.ts`
- `apps/web/lib/company-documents/starter-documents.test.ts`
- `apps/web/lib/company-documents/actions.ts`
- `apps/web/lib/company-documents/data.ts`
- `apps/web/lib/company-documents/types.ts`
- `apps/web/app/(app)/settings/company-documents/page.tsx`
- `apps/web/app/(app)/settings/company-documents/[documentId]/page.tsx`
- `apps/web/app/(app)/settings/company-documents/[documentId]/pdf/page.tsx`
- `apps/web/lib/document-engine/print.ts`
- `supabase/migrations/20260523140000_company_documents_foundation.sql`
- `docs/README.md`
- `docs/chat-handoff.md`
- `docs/operating-core-validation-checklist.md`

## Starter Catalog Safety Findings

- Starter definitions are code-defined in
  `apps/web/lib/company-documents/starter-documents.ts`; there is no persisted
  platform starter table or platform-admin starter management.
- The catalog contains five starter examples: Employee Handbook Starter,
  Subcontractor Agreement Starter, Safety Plan Starter, Operations SOP Starter,
  and Warranty Service Policy Starter.
- Starter bodies are generic examples with placeholders such as
  `[Company Name]`, `[Review Date]`, and `[Responsible Role]`.
- Starter bodies and UI copy include the disclaimer that Starter Documents are
  examples only and are not legal advice.
- The inspected starter bodies do not claim AI generation, legal finalization,
  attorney review, e-sign, employee acknowledgement workflow, portal sharing,
  provider sending, delivery proof, public links, or stored PDF behavior.
- One starter references state requirements in general review language, but it
  does not make a jurisdiction-specific legal claim or promise compliance.

## Adoption Behavior Findings

- `adoptCompanyDocumentStarterAction` accepts only a `starterId` from the
  submitted form.
- The server action resolves the starter through
  `getCompanyDocumentStarter(starterId)` and builds the draft from server-owned
  starter data; it does not accept title, body, category, audience, document
  kind, company id, or organization id from the client.
- `createCompanyDocumentFromStarter` inserts a new `company_documents` row with
  `status: "draft"`, the active organization id from server context, and
  created/updated user metadata.
- Adoption copies title, category, document kind, audience, description, and
  body into the contractor-owned record. There is no live coupling,
  provenance/version tracking, or starter mutation.
- Multiple adopted copies are allowed because Phase 1C-A intentionally does not
  add provenance fields or duplicate prevention.
- Adopted records use the existing Company Documents edit, detail,
  archive/restore, and print/save routes.
- No platform starter persistence, storage upload, provider sending, or
  distribution behavior was added.

## Permission And Security Findings

- Adoption uses the same Company Documents scope helper as existing mutations.
  The scope is derived from `requireAuthenticatedUser` and
  `getActiveOrganizationContext`.
- `assertCanManage` limits creation/adoption/archive/restore mutations to
  owner, admin, and manager roles.
- List/detail/print reads remain scoped by `company_id` and the active
  organization context.
- The database migration still enforces tenant-owned `company_documents` rows,
  active-member select access, and owner/admin/manager insert/update policies.
- The settings UI passes `access.canManage` into the Starter Documents section.
  Manage-role users see adoption controls; view-only users see preview-only
  copy.
- No portal, customer, employee, public-link, storage, provider, payment,
  signature, estimate, invoice, or platform-admin exposure was found.

## UI And Browser QA Findings

- `/settings/company-documents` keeps the existing Document Library, filters,
  counts, list, and create/edit form intact.
- The page now includes a Starter Documents section with title, category,
  audience, description, preview controls, a visible disclaimer, and an
  `Adopt starter` button for manage-role users.
- The UI clearly labels adoption as creating a new draft copy.
- No adopted documents are displayed without a real submit creating a
  `company_documents` row.
- Detail and print/save routes display adopted content through the existing
  Company Documents read and Document Engine print boundaries.
- Browser QA used the saved local contractor auth state and checked:
  `/settings`, `/settings/company-documents`, and a mobile-width
  `/settings/company-documents` viewport. The Starter Documents section,
  preview controls, visible disclaimer, and five manage-role adoption buttons
  loaded successfully.
- Adoption was not submitted during browser QA to avoid creating a real draft
  row in the configured development data source.

## Tests Run

- `pnpm prettier --write docs/design/company-documents-starter-adoption-qa-checkpoint.md docs/chat-handoff.md docs/README.md docs/operating-core-validation-checklist.md`
- `pnpm prettier --check docs/design/company-documents-starter-adoption-qa-checkpoint.md docs/chat-handoff.md docs/README.md docs/operating-core-validation-checklist.md`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/starter-documents.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/types.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/company-documents-migration.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-engine/print.test.ts`
- `git diff --check`
- `git status --short --branch`

## Behavior Preserved

This checkpoint preserves:

- `company_documents` schema, migrations, and RLS policies
- existing Company Documents routes and server actions
- existing settings overview/navigation behavior
- owner/admin/manager mutation scope and active-member read scope
- contractor-side detail and browser print/save behavior
- no platform starter persistence or platform-admin starter management
- no AI drafting, legal advice, e-sign, employee acknowledgement, portal/customer
  sharing, stored file upload, provider sending, public links, or delivery proof
- no estimate, contract, invoice, warranty, payment, signature, auth, RLS,
  tenant, portal, or platform-admin behavior changes

## Follow-Up Candidates

1. Plan persisted platform starter records only after governance, publishing,
   preview, audit, retirement, and rollback rules are approved.
2. Add provenance/version tracking only when update notifications or duplicate
   handling become a real product need.
3. Add employee or subcontractor acknowledgement workflows only after People,
   vendor identity, notification, and retention rules are designed.
4. Add document upload/storage only after scanning, retention, access, and export
   rules are explicit.
5. For future QA, use a disposable local/dev organization if exercising the
   adoption submit path so test drafts can be safely removed.
