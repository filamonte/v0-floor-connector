# Company Documents Phase 1C Starter Documents Plan

Status: planning/specification only.

Date: 2026-05-23.

This pass defines the safest next model for Company Documents Starter Documents.
It does not implement application code, migrations, schema, starter data,
platform-admin UI, AI drafting, legal advice, e-sign, employee
acknowledgements, portal/customer/employee distribution, or behavior changes.

## Purpose

Company Documents now has:

- Phase 1A: tenant-owned `company_documents` schema, RLS, settings library, and
  server actions.
- Phase 1B: contractor-side detail view and protected browser print/save route.
- Phase 1 QA: static verification of schema/RLS, actions, routes, copy, and the
  Document Engine boundary.

Phase 1C should plan Starter Documents before any implementation because starter
content touches platform defaults, contractor adoption, tenant-owned copies,
legal-risk copy, and future provenance/version behavior. The goal is to avoid a
second template universe while preserving Company Documents as contractor-owned
administration documents.

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
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/documentation-governance.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/starter-pack-provisioning-review.md`

## Existing Patterns Inspected

- `supabase/migrations/20260523140000_company_documents_foundation.sql`
- `supabase/migrations/20260414223000_shared_template_foundation.sql`
- `supabase/migrations/20260416143000_modular_settings_platform_admin_foundation.sql`
- `supabase/migrations/20260506223000_platform_starter_packs.sql`
- `supabase/migrations/20260506224500_platform_starter_pack_assignments.sql`
- `supabase/migrations/20260507025730_starter_pack_provisioning_execution.sql`
- `apps/web/lib/company-documents/actions.ts`
- `apps/web/lib/company-documents/data.ts`
- `apps/web/lib/company-documents/types.ts`
- `apps/web/app/(app)/settings/company-documents/page.tsx`
- `apps/web/app/(app)/settings/company-documents/[documentId]/page.tsx`
- `apps/web/app/(app)/settings/company-documents/[documentId]/pdf/page.tsx`
- `apps/web/lib/templates/data.ts`
- `apps/web/app/(app)/settings/templates/page.tsx`
- `apps/web/lib/catalogs/data.ts`
- `apps/web/components/catalog-item-settings-card.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- platform starter-pack provisioning docs and migrations

Relevant existing patterns:

- `platform_template_seeds` and `platform_catalog_item_seeds` are platform-owned
  seed sources.
- `document_templates` and `catalog_items` receive organization-owned copies
  with source lineage fields.
- Contractor settings surfaces show available platform seeds, then adopt them
  through scoped server actions into tenant-owned editable rows.
- Platform starter packs group existing seed types and can provision
  contractor-owned template/catalog copies through a guarded platform-admin
  workflow, but they are not contractor self-service Company Documents.
- Company Documents currently has no starter provenance columns. It stores
  tenant-owned document metadata/content only.

## Starter Model Options

### Option 1: Separate Platform Starter Company Documents Source

Create a future platform-owned starter source, either as a table such as
`platform_starter_company_documents` or as a code-defined registry for the first
small slice. Contractors preview starters and adopt them into
`company_documents` as tenant-owned copies.

Pros:

- Preserves `company_documents` as tenant-owned operational truth.
- Avoids overloading `document_templates`, which is for estimate, invoice,
  contract, and warranty output templates.
- Keeps platform starter content read-only to contractors.
- Makes the copy boundary explicit: adoption creates an editable local document.
- Allows platform updates without silently mutating contractor records.

Cons:

- A persisted table later needs schema, RLS/grant, platform-admin management,
  provenance, and content governance design.
- A code-defined first slice can be simpler, but it will not support runtime
  platform editing or durable "update available" behavior without later
  provenance fields.

### Option 2: Platform-Owned Records Inside `company_documents`

Store starter rows in `company_documents` with a platform or null company owner.

Pros:

- Reuses the existing document shape.
- Reduces the number of tables.

Cons:

- Blurs tenant-owned data with platform-owned defaults.
- Conflicts with current RLS and `company_id` assumptions.
- Risks cross-tenant exposure mistakes.
- Makes delete/archive lifecycle ambiguous.
- Encourages treating platform starters as real contractor documents before
  adoption.

This option should not be used.

### Option 3: Use `document_templates`

Represent Starter Documents as `document_templates`.

Pros:

- Existing seed/adoption lineage exists.
- Existing platform-template settings patterns are mature.

Cons:

- `document_templates` is the canonical output-template system for estimate,
  invoice, contract, and warranty generation.
- Company Documents are business administration records, not commercial output
  templates.
- This would create terminology and workflow confusion, especially around
  future document generation.

This option should not be used.

### Option 4: Seed SQL Into `company_documents`

Insert starter rows directly into each organization through migrations or seed
SQL.

Pros:

- Simple to execute for one known tenant.
- No contractor adoption UI required.

Cons:

- Creates real tenant documents without explicit contractor choice.
- Does not preserve the preview/adopt boundary.
- Risks fake/default documents appearing as contractor-owned truth.
- Does not scale cleanly across organizations.

This option should not be used for product Starter Documents.

### Option 5: Static Code-Defined Starters

Define a small starter registry in application code and copy selected starters
into `company_documents` through a normal tenant-scoped action.

Pros:

- Smallest safe Phase 1C-A implementation path.
- No schema required if update tracking is deferred.
- Clear preview/adopt workflow.
- Easy to review starter copy in code.

Cons:

- No platform-admin content management.
- No durable source id/version unless a later schema slice adds provenance.
- "Already adopted" detection is limited unless future provenance is added.

This is acceptable only as the first narrow adoption slice.

## Recommendation

Use a separate Starter Documents source concept, not `document_templates` and not
platform-owned rows inside `company_documents`.

Recommended sequencing:

1. Phase 1C-A: code-defined Starter Documents registry plus contractor adoption
   UI and scoped server action.
2. Later Phase 1C-B: add a persisted `platform_starter_company_documents` table
   and optional `company_documents` provenance fields if runtime platform
   management, versioning, duplicate detection, or "update available" behavior is
   needed.
3. Later platform-admin slice: manage starter content after governance, preview,
   publishing, audit, and rollback/retirement rules are designed.

The important product rule is that adoption creates a tenant-owned
`company_documents` copy. After adoption, the copy is editable, archivable, and
printable by the contractor and is not live-coupled to platform starter changes.

## Adoption Workflow

Future contractor workflow:

1. Contractor opens `/settings/company-documents`.
2. The Document Library remains the existing tenant-owned library.
3. A Starter Documents section or tab lists platform-provided starter examples.
4. Contractor previews a starter before adoption.
5. Owner/admin/manager chooses "Adopt starter" from the preview/list.
6. The server action validates the starter key/source server-side.
7. The server action uses the active organization from session context, not from
   client-provided organization ids.
8. The action creates a new `company_documents` row scoped to the active
   organization.
9. The adopted copy starts as `draft`.
10. The contractor edits, archives/restores, and prints the copy through the
    existing Company Documents behavior.

Adoption must not:

- mutate the platform starter source;
- update existing tenant documents silently;
- mark the document active by default;
- publish or distribute the document;
- create portal access;
- create employee acknowledgement state;
- create e-sign/signature state;
- create delivery proof;
- create stored PDFs or provider sends.

Duplicate handling for Phase 1C-A should be conservative. If no provenance
fields exist yet, the first implementation can either allow multiple adopted
draft copies with clear naming or use a server-side normalized title/category
warning. It should not rely on fragile title matching as if it were durable
lineage.

## Legal/Safety Boundaries

Starter Documents copy and UI must say:

- Starter Documents are examples/templates.
- Contractors are responsible for review and customization.
- Contractors should consult qualified professionals when needed.
- FloorConnector does not provide legal advice.
- Adoption creates a local company-owned draft.

Starter Documents copy and UI must not say or imply:

- legal advice;
- attorney review;
- compliance guarantee;
- AI drafting or generation;
- e-sign;
- employee acknowledgement;
- portal/customer sharing;
- document delivery proof;
- stored official PDF;
- automatic policy distribution;
- final legal document ready for use.

The phrase "template" is acceptable in plain language when paired with example
and review disclaimers, but the product term should remain Starter Documents to
avoid confusion with `document_templates`.

## Category/Content Starter Set

Initial recommended Starter Documents:

- Employee agreement starter
- Subcontractor agreement starter
- Safety plan starter
- Employee handbook starter
- Operations SOP starter
- Training checklist starter
- Warranty/service policy starter
- Customer service policy starter

Recommended mapping to existing Company Documents categories:

| Starter                         | Category                 | Audience           | Default status |
| ------------------------------- | ------------------------ | ------------------ | -------------- |
| Employee agreement starter      | `employee_document`      | `employee`         | `draft`        |
| Subcontractor agreement starter | `subcontractor_document` | `subcontractor`    | `draft`        |
| Safety plan starter             | `safety_compliance`      | `internal`         | `draft`        |
| Employee handbook starter       | `employee_document`      | `employee`         | `draft`        |
| Operations SOP starter          | `operations_sop`         | `internal`         | `draft`        |
| Training checklist starter      | `training`               | `employee`         | `draft`        |
| Warranty/service policy starter | `warranty_service`       | `customer_service` | `draft`        |
| Customer service policy starter | `customer_service`       | `customer_service` | `draft`        |

These are starter examples, not final legal or compliance documents.

## Platform-Admin Implications

Do not add super-admin Starter Documents management in the first implementation
slice.

The safest first slice is:

- code-defined or seed-source starters;
- contractor preview/adoption;
- tenant-owned draft copies;
- no platform-admin editing UI;
- no assignment/provisioning automation;
- no starter packs for Company Documents yet.

Later platform-admin management should be separate because it needs content
governance:

- draft/published/archived starter status;
- starter key uniqueness;
- starter category/audience validation;
- publish review;
- changelog/versioning;
- safe retirement behavior;
- audit of platform content changes;
- no automatic mutation of adopted contractor copies.

Existing platform starter-pack provisioning is platform-admin and operator
controlled. Company Documents Starter Documents should begin as contractor
self-service adoption, not platform-admin provisioning into tenants.

## Future Schema/Data Implications

Current `company_documents` fields are sufficient to store adopted content as
tenant-owned drafts, but not sufficient for durable source lineage or update
tracking.

Future persisted starter source outline, if approved later:

```sql
create table public.platform_starter_company_documents (
  id uuid primary key,
  starter_key text not null unique,
  title text not null,
  category text not null,
  document_kind text not null,
  audience text not null,
  description text,
  body text,
  version_number integer not null default 1,
  status text not null default 'draft',
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
```

Future `company_documents` provenance fields, if update-available behavior or
duplicate detection is required:

```sql
alter table public.company_documents
  add column source_starter_id uuid null,
  add column source_starter_key text null,
  add column source_starter_version integer null;
```

Future RLS/grant posture:

- platform starter rows are readable to authenticated contractor users only when
  published/active;
- only platform-admin paths can manage platform starter rows;
- tenant-owned adopted copies remain governed by `company_documents` RLS;
- adoption server actions must require the same manage scope as Company
  Documents mutations.

Do not add this schema during the planning pass.

## Future Implementation Prompt

```text
Chat: Company Documents Phase 1C-A - Starter Document Adoption

You are working in the FloorConnector repo.

Goal:
Implement the first conservative Company Documents Starter Documents adoption
slice.

This is a contractor self-service adoption slice, not AI generation, not legal
advice, not e-sign, not platform-admin management, and not portal/customer or
employee distribution.

Required first step:
- git status --short --branch
- git log --oneline -10
- confirm the Phase 1C planning doc exists:
  docs/design/company-documents-phase-1c-starter-documents-plan.md

Read first:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/product-language.md
- docs/design/company-documents-phase-1c-starter-documents-plan.md
- docs/design/company-documents-phase-1-qa-checkpoint.md
- docs/design/company-documents-phase-1b-view-print.md
- docs/design/company-documents-phase-1a-schema-settings-library.md
- docs/design/company-documents-schema-readiness-audit.md
- docs/design/document-engine-phase-1-pdf-export-foundations.md

Implementation constraints:
- Do not add AI drafting.
- Do not add legal advice.
- Do not add e-sign.
- Do not add employee acknowledgements.
- Do not add portal/customer/employee distribution.
- Do not add stored PDFs, provider sends, public links, or delivery proof.
- Do not add platform-admin management.
- Do not overload `document_templates`.
- Do not create platform-owned rows in `company_documents`.
- Do not trust client-provided organization/company ids.
- Preserve owner/admin/manager manage scope.

Recommended implementation:
- Add a small code-defined Starter Documents registry under
  `apps/web/lib/company-documents/`.
- Add server-side validation for starter keys, categories, statuses, and
  audiences.
- Add an adoption server action that creates a draft tenant-owned
  `company_documents` copy using the active organization context.
- Add a Starter Documents section to `/settings/company-documents` with preview
  and adopt controls.
- Adopted copies must appear in the existing Document Library and use existing
  edit/archive/restore/detail/print behavior.
- Include visible copy that starters are examples/templates, not legal advice,
  and contractors are responsible for review.

Schema:
- Prefer no schema change for Phase 1C-A unless duplicate prevention or durable
  lineage is explicitly approved in the task.
- If schema is added, document why the first code-defined/no-schema path is not
  sufficient and keep it limited to starter provenance.

Tests:
- starter registry validation
- adoption creates tenant-owned draft copy
- adoption uses active organization scope
- member without manage permission cannot adopt
- category/status/audience validation remains enforced
- platform starter content is not mutated by adoption
- no portal/customer/employee distribution state is created

Validation:
- focused tests for Company Documents starter adoption
- company-documents validation/types tests
- migration tests only if a migration is added
- pnpm.cmd --filter @floorconnector/web typecheck
- pnpm.cmd --filter @floorconnector/web lint
- git diff --check
- git status --short --branch

Commit:
feat: add Company Documents starter adoption

Final response:
Report files changed, model used, adoption behavior, tests run, browser QA
checked/skipped, commit hash, and explicit confirmation no unrelated schema,
routes, server actions, auth/RLS, tenant logic, payments, signatures, portal,
settings, or platform-admin behavior changed.
```

## What Is Intentionally Not Implemented Yet

- No Starter Documents registry.
- No Starter Documents UI.
- No adoption action.
- No starter data.
- No migrations.
- No `platform_starter_company_documents` table.
- No provenance fields on `company_documents`.
- No platform-admin starter management.
- No starter-pack integration for Company Documents.
- No AI drafting or generation.
- No legal advice.
- No attorney review or compliance guarantee.
- No e-sign or signature workflow.
- No employee acknowledgements.
- No portal/customer/employee distribution.
- No stored PDFs, file storage, provider sends, public links, or delivery proof.
- No behavior changes to existing Company Documents.
