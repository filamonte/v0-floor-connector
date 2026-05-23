# Company Documents Phase 1C-A - Starter Adoption

Status: Implemented
Doc Type: Implementation Checkpoint

## Purpose

Company Documents Phase 1C-A adds the first conservative Starter Documents
adoption slice. Contractor owners, admins, and managers can preview
code-defined Starter Documents and adopt them into their own editable Company
Documents library as draft copies.

This is not AI generation, legal advice, e-sign, employee acknowledgement,
portal/customer/employee distribution, platform-admin starter management, stored
file upload, provider sending, public links, or delivery proof.

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
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/documentation-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

This phase reuses the existing `company_documents` table, RLS policies, scoped
Company Documents data helpers, settings route, detail route, edit form, archive
behavior, and print/save route.

No schema, migrations, new tables, storage buckets, platform starter rows,
provenance fields, portal policies, or platform-admin surfaces were added.

## Starter Catalog Implemented

The first code-defined Starter Documents catalog lives in
`apps/web/lib/company-documents/starter-documents.ts`.

Implemented starters:

- Employee Handbook Starter
- Subcontractor Agreement Starter
- Safety Plan Starter
- Operations SOP Starter
- Warranty Service Policy Starter

Starter bodies are generic, clearly marked as starters, include placeholders
such as `[Company Name]`, `[Review Date]`, and `[Responsible Role]`, and include
the disclaimer: "Starter Documents are examples only and are not legal advice.
Review with qualified counsel or advisors before use."

## Adoption Behavior

The `/settings/company-documents` Document Library now includes a Starter
Documents section. Users can preview starter content before adoption. Users with
manage access can choose `Adopt starter`, which creates a new draft
`company_documents` row from server-owned starter data.

Adoption copies title, category, document kind, audience, description, and body.
It does not keep a live connection to the code-defined starter. Existing Company
Documents remain unchanged, and repeated adoption is allowed as another draft
copy.

After adoption, the draft appears in the existing Document Library and can be
edited, viewed, archived, restored, or printed through the already implemented
Company Documents behavior.

## Security And Permission Behavior

Adoption uses the existing active organization/company context from the server.
It never accepts a company or organization id from the client and never trusts
client-supplied starter content.

The adoption action uses the same owner/admin/manager manage scope as existing
Company Documents mutations. View-only members can preview starters, but they do
not see adoption controls.

## Legal And Safety Disclaimers

Starter Documents UI and starter bodies state that Starter Documents are
examples only and are not legal advice. Adopted documents remain drafts so the
contractor can review and customize them before use.

## Behavior Preserved

This implementation does not change:

- `company_documents` schema, migration, or RLS policies
- `document_templates`
- estimate, contract, invoice, warranty, payment, signature, or portal behavior
- Document Engine print/export behavior
- Send Trail, delivery proof, provider sending, public links, or storage
- auth, RLS, tenant logic, route protection, settings outside Company
  Documents, or platform-admin behavior

## What Is Intentionally Not Implemented Yet

- persisted platform starter documents
- platform-admin starter management
- starter update notifications
- provenance or version tracking
- duplicate prevention based on starter source
- employee acknowledgements
- portal/customer/employee sharing
- e-sign
- AI drafting
- legal review workflow
- document upload or storage

## Follow-Up Candidates

1. Add persisted platform starter records only after governance, publishing,
   preview, audit, and retirement rules are approved.
2. Add provenance fields only when update notifications or duplicate detection
   are needed.
3. Add employee or subcontractor acknowledgements only after People/vendor
   identity, notification, and retention rules are explicit.
4. Add document upload/storage only after retention, scanning, access, and export
   policy is approved.
