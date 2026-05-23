# Company Documents Migration Readiness Audit

Status: Active
Doc Type: Planning / Migration Readiness

## Purpose

This audit checks Supabase migration and RLS readiness before any future
Company Document Library build. It follows
[docs/design/business-documents-phase-1-company-library-plan.md](C:/FloorConnector/docs/design/business-documents-phase-1-company-library-plan.md)
and
[docs/design/company-documents-schema-readiness-audit.md](C:/FloorConnector/docs/design/company-documents-schema-readiness-audit.md).

This is an audit/planning pass only. It does not create migrations, apply
migrations, alter schema, change RLS, touch production data, add routes, add UI,
or change app behavior.

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
- `docs/design/business-documents-phase-1-company-library-plan.md`
- `docs/design/company-documents-schema-readiness-audit.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2-plan.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## Migrations Inspected

The full `supabase/migrations` directory was inventoried with focused reads of
the migration families most relevant to a future `company_documents` table:

- organization, membership, platform roles, and base RLS:
  - `20260409233000_platform_core_foundation.sql`
  - `20260410000500_platform_core_rls.sql`
  - `20260413011000_auth_identity_membership_foundation.sql`
- document templates and starter template records:
  - `20260414223000_shared_template_foundation.sql`
  - `20260519184400_warranty_template_type.sql`
- warranty, service, signature, delivery, and proof-adjacent records:
  - `20260519153000_service_tickets_foundation.sql`
  - `20260519184500_warranty_document_foundation.sql`
  - `20260519193000_document_signature_foundation.sql`
  - `20260520110000_document_delivery_events.sql`
  - `20260520125000_document_delivery_events_estimates_invoices.sql`
  - `20260520130000_document_delivery_events_contracts.sql`
- field, compliance, and storage-adjacent models:
  - `20260417170000_compliance_records_foundation.sql`
  - `20260417200000_execution_attachments_foundation.sql`
  - `20260423201000_documents_bucket_and_storage_policies.sql`
- portal access and portal record visibility:
  - `20260418110000_portal_access_foundation.sql`
  - `20260418113000_portal_record_review_access.sql`
  - `20260426223100_portal_access_grants_customer_contact_link.sql`
  - `20260427100000_customer_contact_portal_permissions.sql`
- settings, import/export, starter, and admin-governed patterns:
  - `20260506223000_platform_starter_packs.sql`
  - `20260507025730_starter_pack_provisioning_execution.sql`
  - `20260515204452_data_export_events.sql`
  - `20260515220057_data_import_batches.sql`
  - `20260518120000_equipment_assets_registry.sql`

Related implementation patterns inspected:

- `supabase/README.md`
- `supabase/schema-notes/platform-core-rls.md`
- `packages/db/*`
- `packages/types/src/index.ts`
- `packages/domain/src/index.ts`
- `apps/web/lib/templates/*`
- `apps/web/lib/settings/*`
- `apps/web/lib/organizations/*`
- `apps/web/lib/features/*` where present
- migration-shape tests under `apps/web/lib/**`

## Migration Pattern Inventory

### Naming and order

Migrations use timestamped filenames:

```text
YYYYMMDDHHMMSS_descriptive_name.sql
```

The future Company Documents migration should follow this pattern and land
after the current latest migration. Use a descriptive name such as:

```text
YYYYMMDDHHMMSS_company_documents_foundation.sql
```

### Table creation style

Tenant-owned tables generally use:

- `create table if not exists public.<table_name>`
- `id uuid primary key default extensions.gen_random_uuid()`
- `company_id uuid not null references public.companies(id) on delete cascade`
- `created_by` and `updated_by` as nullable references to `public.users(id) on
delete set null`
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`

This is the right shape for `company_documents`.

### Enum vs check constraint style

The repo uses both patterns:

- Older/core workflow values often use Postgres enums, such as
  `membership_role`, `estimate_status`, `payment_status`, and `template_type`.
- Newer feature-slice tables often use text columns plus check constraints, as
  seen in service tickets, equipment assets, document signers, document delivery
  events, data import batches, and GateKeeper tables.

For `company_documents`, text columns plus check constraints are the better
Phase 1A fit because document categories, audience labels, and source types are
likely to iterate. Avoid enum churn until the model is stable.

### Timestamp trigger style

Tables with `updated_at` use:

```sql
drop trigger if exists <table>_set_updated_at on public.<table>;
create trigger <table>_set_updated_at
before update on public.<table>
for each row
execute function public.set_updated_at();
```

Some older names use `set_<table>_updated_at`; both exist. For a new table,
prefer the clearer `<table>_set_updated_at` style used in newer migrations.

### RLS enablement style

Tenant-owned tables enable and force RLS:

```sql
alter table public.<table> enable row level security;
alter table public.<table> force row level security;
```

Future `company_documents` should do both in the same migration that creates
the table.

### Policy naming style

Common policy names include:

- `<table>_select_by_membership`
- `<table>_insert_by_membership`
- `<table>_update_by_membership`
- `<table>_insert_by_manager`
- `<table>_update_by_manager`
- `<table>_select_by_admin_scope`

For Company Documents, prefer:

- `company_documents_select_by_membership`
- `company_documents_insert_by_manager`
- `company_documents_update_by_manager`

Do not add a delete policy in Phase 1A unless hard delete is explicitly
approved.

### Index and uniqueness style

Tenant-owned tables usually include:

- `(company_id)`
- `(company_id, status)`
- `(company_id, <category/type>)`
- `(company_id, <foreign_key>) where <foreign_key> is not null`
- `(company_id, created_at desc)` or `(company_id, updated_at desc)` for
  manager lists
- unique `(company_id, id)` indexes when composite foreign keys need tenant
  scope

Company Documents should start with list/filter indexes and no uniqueness rule
on title. Duplicate titles are possible across policy versions and categories.

### Foreign key and cascade behavior

Current tenant-owned operational records usually cascade on company deletion and
use `on delete set null` for optional user/source metadata. Project/customer/job
relationship tables use stricter relationship validation when cross-record
scope matters.

Company Documents Phase 1A should only need:

- `company_id` cascade with the company
- `created_by` / `updated_by` set null

Optional starter/source/template relationships should be deferred until their
behavior is explicit.

### Comments and auditability

Recent migrations include `comment on table` and `comment on column` statements
to capture boundaries. The future migration should document that Company
Documents are contractor business-administration records, not customer portal
records, not legal advice, not provider sends, and not stored generated PDFs.

## RLS Pattern Inventory

### Base tenant membership

The core reusable helper is:

```sql
public.is_active_company_member(company_id)
```

It checks authenticated active company membership through a security-definer
function to avoid recursive RLS issues.

### General tenant-owned tables

Many canonical tables allow active members to select, insert, or update. This
was suitable for broad operational records early in the app, but newer
admin/sensitive areas are more role-aware.

### Manager-gated operational tables

Newer workflow tables such as `service_tickets`, `equipment_assets`,
`document_signers`, and `document_delivery_events` use active membership plus
role gates:

```sql
membership.membership_role in ('owner', 'admin', 'manager')
```

Company Documents should follow this for create/update because handbooks,
agreements, SOPs, and safety policies are administrative content.

### Admin-only settings/import patterns

Settings/import/export review records use stricter owner/admin scope in some
places. If Company Documents are kept exclusively under Settings, the app route
can require owner/admin scope. The RLS policy can still allow manager writes if
the product wants operations managers to maintain SOPs. The implementation
should choose one role stance before migration.

Recommended Phase 1A stance:

- View: active company members.
- Manage: owner/admin/manager.
- Route access: under Settings/Company Controls; app can be owner/admin first
  if no manager settings pattern exists yet, but the migration should be ready
  for manager maintenance unless the owner chooses stricter admin-only control.

### Platform-admin patterns

Platform-admin tables and starter-pack governance use separate platform/admin
boundaries. Platform admins should not manage tenant Company Documents in
contractor settings. Starter Documents should be platform-owned later and
adopted into tenant-owned Company Documents, not edited in place by tenants.

### Portal access patterns

Portal visibility is explicit and project/customer scoped through
`portal_access_grants`, `portal_project_access`, and portal-specific policies on
shared records. Company Documents should not have portal policies in Phase 1A.
Portal access must remain a later explicit sharing model, not a byproduct of
being in the same organization.

### Service-role behavior

Service-role clients exist for admin/server workflows, but this audit does not
recommend any service-role Company Documents behavior. Phase 1A should be
normal authenticated contractor app access through RLS and server-side scope
helpers.

## Future `company_documents` Migration Outline

Do not apply this SQL in this pass. This is a docs-only outline for a future
approved migration.

```sql
create table if not exists public.company_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  category text not null,
  document_kind text not null default 'general',
  status text not null default 'draft',
  audience text not null default 'internal',
  description text,
  body text,
  source_type text not null default 'manual',
  version_number integer not null default 1,
  effective_date date,
  expires_at date,
  archived_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint company_documents_title_check check (length(btrim(title)) > 0),
  constraint company_documents_category_check check (
    category in (
      'agreement',
      'employee_document',
      'subcontractor_document',
      'safety_compliance',
      'operations_sop',
      'training',
      'customer_service',
      'warranty_service',
      'other'
    )
  ),
  constraint company_documents_document_kind_check check (
    document_kind in (
      'general',
      'policy',
      'agreement',
      'sop',
      'handbook',
      'plan',
      'checklist',
      'template',
      'other'
    )
  ),
  constraint company_documents_status_check check (
    status in ('draft', 'active', 'archived')
  ),
  constraint company_documents_audience_check check (
    audience in (
      'internal',
      'employee',
      'subcontractor',
      'customer_service',
      'mixed'
    )
  ),
  constraint company_documents_source_type_check check (
    source_type in ('manual', 'platform_starter', 'imported', 'template')
  ),
  constraint company_documents_version_number_check check (version_number >= 1),
  constraint company_documents_date_order_check check (
    effective_date is null or expires_at is null or expires_at >= effective_date
  ),
  constraint company_documents_archived_at_check check (
    status <> 'archived' or archived_at is not null
  )
);

create index if not exists company_documents_company_id_idx
  on public.company_documents (company_id);

create index if not exists company_documents_company_status_idx
  on public.company_documents (company_id, status);

create index if not exists company_documents_company_category_status_idx
  on public.company_documents (company_id, category, status);

create index if not exists company_documents_company_updated_idx
  on public.company_documents (company_id, updated_at desc);

drop trigger if exists company_documents_set_updated_at
  on public.company_documents;
create trigger company_documents_set_updated_at
before update on public.company_documents
for each row
execute function public.set_updated_at();

alter table public.company_documents enable row level security;
alter table public.company_documents force row level security;

drop policy if exists company_documents_select_by_membership
  on public.company_documents;
create policy company_documents_select_by_membership
on public.company_documents
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists company_documents_insert_by_manager
  on public.company_documents;
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
  and (created_by is null or created_by = (select auth.uid()))
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists company_documents_update_by_manager
  on public.company_documents;
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
  and (updated_by is null or updated_by = (select auth.uid()))
);

comment on table public.company_documents is
  'Tenant-scoped contractor business administration documents such as policies, agreements, SOPs, safety plans, onboarding, and training documents. Not customer portal documents, delivery proof, e-sign records, legal advice, or stored generated PDFs.';
```

Optional future tables explicitly not included in Phase 1A:

- `company_document_versions`
- `platform_starter_company_documents`
- `company_document_acknowledgements`
- document/file association table
- portal sharing table
- send/delivery event expansion
- signature/e-sign expansion

## Security, Portal, And Access Decisions

- Organization ownership should use `company_id`, matching the existing
  `companies` and `company_memberships` foundation.
- Active company members can view Phase 1A documents by default.
- Owner/admin/manager should manage records if the product wants operations
  managers to own SOPs and safety docs. If the UI stays under Settings
  owner/admin only, app-level route guards can be stricter than RLS.
- Portal users should see nothing in Phase 1A.
- Platform admins should not manage tenant Company Documents from contractor
  settings.
- Starter Documents should be separate platform-owned records in a later phase
  and should copy into tenant-owned `company_documents` on adoption.
- Storage should not be assumed in Phase 1A. If files are added later, use the
  existing `documents` bucket policy shape or a deliberately designed storage
  association, not execution attachments.

## Future Type And Data-Helper Implications

After an approved migration, likely app work includes:

- update shared/manual types in `packages/types` if this repo continues using
  hand-authored domain types for app-facing records
- update any generated database type workflow if one is introduced before the
  build
- add `apps/web/lib/company-documents/` data helpers and schemas
- add create/edit/archive server actions scoped to Company Documents only
- add `/settings/company-documents` under Company Controls
- add a settings overview card and nav item
- add focused pure helper tests for category grouping and archive behavior
- add migration-shape tests similar to warranty/service/equipment migration
  tests
- update `docs/current-state.md`, `docs/chat-handoff.md`, and `docs/README.md`

## Risks And Guardrails

- Constraint drift: use check constraints for Phase 1A categories/statuses so
  early document taxonomy can evolve without enum churn.
- RLS mismatch: do not accidentally use broad membership write policies if the
  UI is intended to be admin/manager controlled.
- Storage assumptions: do not store files, generated PDFs, or storage object
  paths until retention, malware scanning, signed URLs, and export behavior are
  approved.
- Portal exposure: do not add portal policies, portal loaders, or Customer
  Access links in Phase 1A.
- Duplicate document/template models: do not extend `document_templates` as the
  Company Document Library.
- Versioning too early: keep `version_number` simple; defer immutable versions
  until real version workflow exists.
- Legal/AI scope creep: do not generate legal content, legal advice, or
  AI-drafted active policies in the schema foundation.
- Acknowledgement scope creep: employee/subcontractor acknowledgements require
  People/vendor identity, notification, retention, and permissions policy first.

## Future Implementation Prompt

Do not run this prompt until the user explicitly approves implementation.

```text
Chat: Company Documents Phase 1A - Schema and Settings Library

You are working in the FloorConnector repo.

Goal:
Implement the first persisted Company Document Library foundation under Company
Controls using an explicit `company_documents` model.

This is a guarded schema + settings-library slice.

Required first step:
- git status --short --branch
- git log --oneline -10
- confirm the branch is clean/aligned or report the exact local state before
  editing.

Read first:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/chat-handoff.md
- docs/product-language.md
- docs/design/business-documents-phase-1-company-library-plan.md
- docs/design/company-documents-schema-readiness-audit.md
- docs/design/company-documents-migration-readiness-audit.md
- docs/operating-core-validation-checklist.md
- supabase/README.md
- supabase/schema-notes/platform-core-rls.md

Hard guardrails:
- Do not use `document_templates` as the Company Document Library model.
- Do not add AI generation, legal advice, e-sign, employee acknowledgements,
  customer portal exposure, public links, provider sending, stored PDFs, or
  storage bucket changes.
- Do not change estimate, contract, invoice, warranty, payment, signature,
  portal grant, settings, platform-admin, auth/RLS, tenant logic, or server
  action behavior outside the approved Company Documents slice.

Implementation scope:
1. Add one Supabase migration:
   - `company_documents`
   - company ownership
   - check constraints for category/status/audience/source/document_kind
   - indexes
   - updated_at trigger
   - forced RLS
   - select by active membership
   - insert/update by owner/admin/manager
   - no portal policies
   - no delete policy unless explicitly approved
2. Update shared/manual types if the repo pattern requires it.
3. Add tenant-safe helpers under `apps/web/lib/company-documents/`.
4. Add `/settings/company-documents` with list, read, create, edit, and archive.
5. Add settings navigation and overview card integration.
6. Add server actions only for Company Documents.
7. Add focused tests:
   - migration/RLS shape
   - schema/category/status/audience validation
   - list grouping
   - archive behavior
8. Update docs:
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

- migrations or schema
- RLS policies
- app code
- routes or UI
- server actions
- generated/shared runtime types
- production data
- auth, payments, signatures, estimates, invoices, portal grants, settings, or
  platform-admin behavior
- storage buckets or file handling
- provider sending
- AI generation
- legal-document behavior
