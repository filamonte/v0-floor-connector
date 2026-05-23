# Company Documents Schema Readiness Audit

Status: Active
Doc Type: Planning / Schema Readiness

## Purpose

This audit prepares a future Company Document Library implementation without
changing schema or app behavior. It builds on
[docs/design/business-documents-phase-1-company-library-plan.md](C:/FloorConnector/docs/design/business-documents-phase-1-company-library-plan.md)
and confirms that Company Documents need an explicit tenant-owned model instead
of being forced into the current commercial document-template or warranty
document foundations.

This pass is planning only. It does not create migrations, app routes, UI,
server actions, storage behavior, provider sending, portal exposure, e-sign,
AI generation, legal advice generation, or employee/customer distribution.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/business-documents-phase-1-company-library-plan.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2-plan.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`

## Existing Models Inspected

- `supabase/migrations/20260414223000_shared_template_foundation.sql`
- `supabase/migrations/20260519184400_warranty_template_type.sql`
- `supabase/migrations/20260519184500_warranty_document_foundation.sql`
- `supabase/migrations/20260417200000_execution_attachments_foundation.sql`
- `supabase/migrations/20260417170000_compliance_records_foundation.sql`
- `supabase/migrations/20260418110000_portal_access_foundation.sql`
- `supabase/migrations/20260418113000_portal_record_review_access.sql`
- `supabase/migrations/20260427100000_customer_contact_portal_permissions.sql`
- `supabase/migrations/20260410000500_platform_core_rls.sql`
- `supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql`
- `supabase/migrations/20260506223000_platform_starter_packs.sql`
- `apps/web/lib/templates/*`
- `apps/web/lib/document-engine/*`
- `apps/web/lib/proofcenter/*`
- `apps/web/lib/servicecenter/*`
- `apps/web/lib/organizations/*`
- `apps/web/lib/settings/*`
- `apps/web/app/(app)/settings/**/*`
- template type definitions in `packages/types` and `packages/domain`

## Model Fit Analysis

### `document_templates`

Current fit:

- Organization-owned template rows for supported output workflows.
- `template_type` currently supports `estimate`, `invoice`, `contract`, and
  `warranty`.
- Platform seed adoption copies `platform_template_seeds` into
  organization-owned `document_templates`.
- Settings UI and helper code treat these as output templates for commercial
  and warranty records.

Why it should not be overloaded:

- Company Documents are business administration library records, not merely
  merge templates for estimates, invoices, contracts, or warranties.
- Adding broad categories to `template_type` would leak admin document concepts
  into platform-admin starter templates, settings templates, merge-data
  workflows, and commercial output logic.
- The existing default-template rules, workflow-specific merge fields, and
  `is_default` semantics do not match policy documents, handbooks, SOPs, or
  training documents.

Future relationship:

- Company Documents may later reference a document template or starter document
  as a source, but the company document should remain the library record.

### `warranty_documents`

Current fit:

- Tenant-scoped warranty document records linked to customer, project, job, or
  service-ticket context.
- They validate relationships to canonical operational records.
- They have warranty-specific statuses and issued/signed lifecycle fields.

Why it should not be overloaded:

- Company Documents are often company-only and may not have a customer,
  project, job, service ticket, warranty date range, or signer lifecycle.
- Warranty statuses such as `issued`, `sent`, `viewed`, `signed`, and `void`
  are customer-facing workflow states, not general policy-library states.

Future relationship:

- Warranty/service company documents can be associated later through explicit
  links, but warranty documents should remain customer/project/service outputs.

### `execution_attachments`

Current fit:

- Lightweight attachment linkage for daily logs and field notes.
- Stores file metadata and storage path for field execution evidence.

Why it should not be overloaded:

- It is intentionally constrained to field execution subjects.
- It has no category, lifecycle, audience, review date, version, or admin
  library semantics.
- It is an attachment/evidence layer, not a document library.

Future relationship:

- Company Documents may later attach files through an approved storage/file
  policy, but should not use execution attachments as the library model.

### `compliance_records`

Current fit:

- Organization-scoped compliance/credential records for people and vendors.
- Supports record type, status, issuing authority, dates, and a reserved
  `document_file_id` hook.

Why it should not be overloaded:

- Compliance records are subject-specific credentials, not general company
  documents.
- Their statuses and subject fields are built around person/vendor compliance.

Future relationship:

- A safety policy, training document, or credential document can later be linked
  to Compliance through an explicit association. Compliance should not own the
  whole Company Document Library.

### Portal access and customer-facing models

Current fit:

- `portal_access_grants` and `portal_project_access` give customer contacts
  scoped access to explicitly granted customer/project records.
- Portal record visibility has deliberate customer-safe policies.

Why they should not be involved by default:

- Company Documents are contractor administration documents by default.
- Portal users should not see internal handbooks, SOPs, employee documents,
  subcontractor documents, or safety policies unless a later phase creates an
  explicit, audited customer-sharing model.

## Proposed Future Schema

Recommended Phase 1A table: `company_documents`.

Use text check constraints first unless the team explicitly wants enum
migrations. Check constraints keep early category/status iteration simpler while
still preventing arbitrary values.

Draft fields:

| Field                                                                        | Phase | Notes                                                                                                                      |
| ---------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| `id uuid primary key default extensions.gen_random_uuid()`                   | 1A    | Standard tenant-owned row identity.                                                                                        |
| `company_id uuid not null references public.companies(id) on delete cascade` | 1A    | Organization ownership anchor.                                                                                             |
| `title text not null`                                                        | 1A    | Required display title, with nonblank check.                                                                               |
| `category text not null`                                                     | 1A    | Controlled values listed below.                                                                                            |
| `document_kind text not null default 'general'`                              | 1A    | Flexible subtype for `policy`, `agreement`, `sop`, `handbook`, `plan`, `checklist`, `template`, or `other`.                |
| `status text not null default 'draft'`                                       | 1A    | Controlled values: `draft`, `active`, `archived`.                                                                          |
| `audience text not null default 'internal'`                                  | 1A    | Controlled values: `internal`, `employee`, `subcontractor`, `customer_service`, `mixed`. This is a label only in 1A.       |
| `description text`                                                           | 1A    | Library summary.                                                                                                           |
| `body text`                                                                  | 1A    | Optional inline editable content if approved for Phase 1A. Keep plain text or trusted markdown, not arbitrary unsafe HTML. |
| `source_type text not null default 'manual'`                                 | 1A    | `manual`, `platform_starter`, `imported`, `template`.                                                                      |
| `source_template_id uuid`                                                    | Later | Optional reference only after source rules are approved. Avoid forcing `document_templates` in 1A.                         |
| `version_number integer not null default 1`                                  | 1A    | Simple display/version marker without a separate version table.                                                            |
| `effective_date date`                                                        | 1A    | For policies or agreements.                                                                                                |
| `expires_at date`                                                            | 1A    | Optional review/expiry style date.                                                                                         |
| `archived_at timestamptz`                                                    | 1A    | Required when status is archived.                                                                                          |
| `created_by uuid references public.users(id) on delete set null`             | 1A    | Audit metadata.                                                                                                            |
| `updated_by uuid references public.users(id) on delete set null`             | 1A    | Audit metadata.                                                                                                            |
| `created_at timestamptz not null default timezone('utc', now())`             | 1A    | Standard timestamp.                                                                                                        |
| `updated_at timestamptz not null default timezone('utc', now())`             | 1A    | Standard timestamp with `set_updated_at` trigger.                                                                          |

Recommended Phase 1A indexes:

- `(company_id)`
- `(company_id, status)`
- `(company_id, category, status)`
- `(company_id, updated_at desc)`
- optional `(company_id, lower(title))` if duplicate title warnings are needed

Recommended Phase 1A constraints:

- nonblank `title`
- category check
- document kind check
- status check
- audience check
- source type check
- `version_number >= 1`
- `expires_at is null or effective_date is null or expires_at >= effective_date`
- `status <> 'archived' or archived_at is not null`

### Category proposal

Use these initial categories:

- `agreement`
- `employee_document`
- `subcontractor_document`
- `safety_compliance`
- `operations_sop`
- `training`
- `customer_service`
- `warranty_service`
- `other`

Use `safety_compliance` rather than `safety_and_compliance` to match the latest
prompt and keep the value compact.

### Status proposal

Phase 1A statuses:

- `draft`
- `active`
- `archived`

Future statuses:

- `pending_review`
- `superseded`

Keep future states out of Phase 1A unless review/version workflow is being
implemented at the same time.

## Optional Future Tables

### `company_document_versions`

Defer until the product needs immutable or reviewable version history.

Candidate later fields:

- `id`
- `company_id`
- `company_document_id`
- `version_number`
- `title`
- `category`
- `document_kind`
- `audience`
- `description`
- `body`
- `storage_object_path`
- `created_by`
- `created_at`

Only add this when version behavior is real. Do not add a version table just to
look mature.

### `platform_starter_company_documents`

Defer until starter/adoption behavior is approved.

Candidate later fields:

- `id`
- `starter_key`
- `title`
- `category`
- `document_kind`
- `audience`
- `description`
- `body`
- `status`
- `segment_key`
- `metadata`
- `created_at`
- `updated_at`

Future adoption should copy a platform starter into `company_documents` as a
company-owned row. It should not let tenants mutate platform starters directly.

### `company_document_acknowledgements`

Defer until employee/subcontractor distribution and read/signoff policy are
approved.

Candidate later fields:

- `id`
- `company_id`
- `company_document_id`
- `person_id`
- `vendor_id`
- `user_id`
- `acknowledgement_status`
- `requested_at`
- `acknowledged_at`
- `declined_at`
- `created_by`
- `created_at`
- `updated_at`

This should not be implemented until People, vendor, notification, and
permission rules are explicit.

## RLS And Security Plan

Phase 1A should be contractor-only and organization-scoped:

- Enable and force RLS on `company_documents`.
- Select policy: active company members can view company documents.
- Insert/update policy: prefer owner/admin/manager roles if using the
  membership-role pattern already used by warranty/service manager policies.
  If the first implementation matches Settings admin behavior, require the same
  owner/admin scope in app code and use an RLS policy at least as strict as
  active membership.
- Delete policy: avoid hard delete in Phase 1A. Use archive only. If delete is
  allowed later, restrict it to owner/admin and document retention impact.
- Portal users should have no default access. Do not add portal policies for
  `company_documents` in Phase 1A.
- Platform starters, when added, should be readable to authenticated contractor
  admins for adoption and writable only through platform-admin controlled paths.

Recommended future RLS shape:

```sql
alter table public.company_documents enable row level security;
alter table public.company_documents force row level security;

create policy company_documents_select_by_membership
on public.company_documents
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

create policy company_documents_insert_by_manager
on public.company_documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = company_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

create policy company_documents_update_by_manager
on public.company_documents
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = company_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = company_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);
```

If Phase 1A is placed under Settings, app-level access should use
`requireOrganizationAdminScope` or a clearly equivalent manager/admin helper.
Do not allow portal grants, customer contacts, public links, or employee
acknowledgement rows to widen access in Phase 1A.

## Route And UX Plan

Recommended first route:

- `/settings/company-documents`

Settings integration:

- Add a Company Documents card to `/settings`.
- Add a settings navigation item under Company Controls.
- Use `Company Documents`, `Document Library`, and `Starter Documents` language
  already approved in `docs/product-language.md`.

Phase 1A page sections:

- Agreements
- Employee documents
- Subcontractor documents
- Safety and compliance
- Operations and SOPs
- Training
- Customer/service documents
- Warranty/service documents
- Archived documents

Phase 1A actions:

- list
- view
- create
- edit metadata/body
- archive

Do not add:

- AI drafting
- legal advice copy
- e-sign
- portal exposure
- employee distribution
- provider sending
- public links
- stored PDFs
- upload/storage behavior unless explicitly approved

## Relationship To Existing Systems

### Document Engine

Document Engine can later provide print/save rendering for Company Documents
after content strategy is approved. Phase 1A should not add print routes unless
inline content rendering is included and the export notice clearly says printing
does not send, sign, distribute, or create delivery proof.

### Proof Center

Proof Center should not list Company Documents by default. Future explicit
associations may let safety plans, warranty/service policies, or closeout SOPs
support project proof, but that should be association-driven rather than a broad
company-library leak into project proof.

### Send Trail

Send Trail should not receive Company Document activity in Phase 1A. Sending,
sharing, or delivery proof for Company Documents requires a future distribution
policy and provider boundary.

### People and Employee/Worker Context

Employee documents and training docs can later link to People. Phase 1A should
remain a company library, not an employee distribution or acknowledgement
system.

### Compliance

Safety/compliance documents may later support compliance records, but
`compliance_records` should remain the credential/status table. Company
Documents can become supporting library content through explicit links later.

### Portal

Portal users should not see Company Documents by default. Any future customer
sharing must go through explicit customer/project/customer-contact access rules
and a customer-safe document category.

### Service Center

Warranty/service documents can later help service workflows as internal SOPs or
customer-service templates. Phase 1A should not expose them to service tickets
or customers unless a future association policy is approved.

## Implementation Phases

### Phase 1A: Schema and Settings Library

Smallest safe implementation slice:

- Add `company_documents` schema with RLS, indexes, constraints, and updated
  generated/shared types if applicable.
- Add tenant-safe data helpers.
- Add `/settings/company-documents` list/read/create/edit/archive UI under
  Company Controls.
- Keep records text/metadata based. No file upload, storage changes, starter
  adoption, portal exposure, e-sign, or AI.
- Add focused migration/RLS shape tests and helper tests.

### Phase 1B: Starter document adoption

- Add platform starter document rows or a starter seed table.
- Add adoption that copies platform starter content into tenant-owned
  `company_documents`.
- Keep platform starters platform-owned and tenant copies editable.

### Phase 1C: Print/export through Document Engine

- Add contractor-only print/save rendering for company documents.
- Preserve the export boundary: printing does not send, sign, acknowledge, or
  create delivery proof.

### Phase 1D: Acknowledgements and employee distribution

- Add explicit acknowledgement records and People/vendor links.
- Define who can request acknowledgement, who can acknowledge, notification
  boundaries, and retention.

### Phase 1E: AI-assisted drafting

- Only after disclaimers, legal-review policy, source controls, and approval
  boundaries exist.
- AI must draft suggestions, not legal advice or automatically active policies.

## Risks And Guardrails

- Do not extend `template_type` with broad business document values until the
  model split between templates, library records, starters, and generated output
  is explicit.
- Do not treat a company document as legal advice.
- Do not add e-sign or acknowledgements without People/vendor identity and
  notification policy.
- Do not add portal access without explicit customer-safe sharing rules.
- Do not create stored PDFs or storage objects before retention, access,
  malware scanning, and export policy are approved.
- Do not create duplicate customer, project, service, compliance, or template
  models for documents.

## Future Phase 1A Codex Prompt

Do not run this prompt until the user explicitly approves implementation.

```text
Chat: Company Documents Phase 1A - Schema and Settings Library

You are working in the FloorConnector repo.

Goal:
Implement the first persisted Company Document Library foundation under Company
Controls using an explicit `company_documents` model.

This is a guarded schema + settings-library slice.

Read first:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/chat-handoff.md
- docs/product-language.md
- docs/design/business-documents-phase-1-company-library-plan.md
- docs/design/company-documents-schema-readiness-audit.md
- docs/operating-core-validation-checklist.md

Hard guardrails:
- Do not use `document_templates` as the Company Document Library model.
- Do not add AI generation, legal advice, e-sign, employee acknowledgements,
  customer portal exposure, public links, provider sending, stored PDFs, or
  storage bucket changes.
- Do not change estimate, contract, invoice, warranty, payment, signature,
  portal grant, settings, platform-admin, auth/RLS, tenant logic, or server
  action behavior outside the approved Company Documents slice.

Implementation scope:
1. Add a Supabase migration for `company_documents` only:
   - uuid id
   - company_id
   - title
   - category
   - document_kind
   - status
   - audience
   - description
   - body
   - source_type
   - version_number
   - effective_date
   - expires_at
   - archived_at
   - created_by
   - updated_by
   - created_at
   - updated_at
   - indexes, constraints, updated_at trigger, RLS
2. Use organization-scoped RLS:
   - active members can select
   - owner/admin/manager can insert/update
   - no portal policies
   - archive instead of hard delete
3. Add tenant-safe data helpers under `apps/web/lib/company-documents/`.
4. Add `/settings/company-documents` and settings navigation/card integration.
5. Add create/edit/archive server actions only for Company Documents.
6. Add focused tests:
   - migration/RLS shape
   - category/status/audience mapping
   - list grouping
   - archive behavior
7. Update docs:
   - docs/current-state.md
   - docs/chat-handoff.md
   - docs/README.md
   - docs/product-language.md only if wording changes

Validation:
- focused Prettier write/check on touched files
- pnpm.cmd --filter @floorconnector/web typecheck
- pnpm.cmd --filter @floorconnector/web lint
- focused Company Documents tests
- git diff --check
- git status --short --branch

Commit:
feat: add Company Document Library foundation
```

## What Was Intentionally Not Changed

This audit did not change:

- schema
- migrations
- app code
- routes
- UI
- server actions
- auth/RLS or tenant logic
- portal grants
- settings or platform-admin behavior
- storage buckets or file handling
- provider sending
- Document Engine, Proof Center, Send Trail, Service Center, or portal behavior
- payment, signature, estimate, invoice, contract, warranty, or service-ticket
  behavior
- AI generation, legal advice, employee distribution, e-sign, public links, or
  fake documents
