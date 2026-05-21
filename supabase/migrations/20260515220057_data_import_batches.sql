create table if not exists public.data_import_batches (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  requested_by uuid not null references public.users(id) on delete restrict,
  import_type text not null,
  source_filename text,
  status text not null default 'review_ready',
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  warning_rows integer not null default 0,
  error_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  mapping_version text not null,
  schema_version text not null,
  safe_summary jsonb,
  approved_at timestamptz,
  approved_by uuid references public.users(id) on delete restrict,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint data_import_batches_import_type_check
    check (import_type in ('customer_contacts')),
  constraint data_import_batches_status_check
    check (
      status in (
        'dry_run',
        'review_ready',
        'approved_pending_write',
        'completed',
        'failed',
        'canceled',
        'rolled_back'
      )
    ),
  constraint data_import_batches_nonnegative_counts_check
    check (
      total_rows >= 0
      and valid_rows >= 0
      and warning_rows >= 0
      and error_rows >= 0
      and duplicate_rows >= 0
    ),
  constraint data_import_batches_source_filename_not_blank
    check (source_filename is null or length(btrim(source_filename)) > 0),
  constraint data_import_batches_mapping_version_not_blank
    check (length(btrim(mapping_version)) > 0),
  constraint data_import_batches_schema_version_not_blank
    check (length(btrim(schema_version)) > 0),
  constraint data_import_batches_safe_summary_object_check
    check (safe_summary is null or jsonb_typeof(safe_summary) = 'object'),
  constraint data_import_batches_approval_pair_check
    check (
      (approved_at is null and approved_by is null)
      or (approved_at is not null and approved_by is not null)
    ),
  constraint data_import_batches_company_id_id_unique
    unique (company_id, id)
);

create table if not exists public.data_import_rows (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  batch_id uuid not null,
  row_number integer not null,
  normalized_preview jsonb not null,
  validation_status text not null,
  proposed_decision text not null,
  user_decision text,
  duplicate_candidates jsonb,
  errors jsonb,
  warnings jsonb,
  created_record_refs jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint data_import_rows_batch_company_fkey
    foreign key (company_id, batch_id)
    references public.data_import_batches(company_id, id)
    on delete cascade,
  constraint data_import_rows_row_number_positive_check
    check (row_number > 0),
  constraint data_import_rows_normalized_preview_object_check
    check (jsonb_typeof(normalized_preview) = 'object'),
  constraint data_import_rows_validation_status_check
    check (validation_status in ('valid', 'warning', 'error', 'duplicate', 'needs_review')),
  constraint data_import_rows_proposed_decision_check
    check (
      proposed_decision in (
        'create_customer',
        'create_contact',
        'link_contact',
        'skip',
        'needs_review',
        'invalid'
      )
    ),
  constraint data_import_rows_user_decision_check
    check (
      user_decision is null
      or user_decision in (
        'create_customer',
        'create_contact',
        'link_contact',
        'skip',
        'needs_review',
        'invalid'
      )
    ),
  constraint data_import_rows_duplicate_candidates_object_check
    check (duplicate_candidates is null or jsonb_typeof(duplicate_candidates) = 'object'),
  constraint data_import_rows_errors_array_check
    check (errors is null or jsonb_typeof(errors) = 'array'),
  constraint data_import_rows_warnings_array_check
    check (warnings is null or jsonb_typeof(warnings) = 'array'),
  constraint data_import_rows_created_record_refs_null_check
    check (created_record_refs is null),
  constraint data_import_rows_company_batch_row_unique
    unique (company_id, batch_id, row_number)
);

create index if not exists data_import_batches_company_created_idx
  on public.data_import_batches (company_id, created_at desc);

create index if not exists data_import_batches_company_status_created_idx
  on public.data_import_batches (company_id, status, created_at desc);

create index if not exists data_import_rows_company_batch_idx
  on public.data_import_rows (company_id, batch_id, row_number);

create index if not exists data_import_rows_company_status_idx
  on public.data_import_rows (company_id, validation_status, created_at desc);

drop trigger if exists set_data_import_batches_updated_at on public.data_import_batches;

create trigger set_data_import_batches_updated_at
before update on public.data_import_batches
for each row
execute function public.set_updated_at();

alter table public.data_import_batches enable row level security;
alter table public.data_import_batches force row level security;

alter table public.data_import_rows enable row level security;
alter table public.data_import_rows force row level security;

drop policy if exists data_import_batches_select_by_admin_scope
  on public.data_import_batches;
create policy data_import_batches_select_by_admin_scope
on public.data_import_batches
for select
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_batches.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists data_import_batches_insert_by_admin_scope
  on public.data_import_batches;
create policy data_import_batches_insert_by_admin_scope
on public.data_import_batches
for insert
to authenticated
with check (
  requested_by = (select auth.uid())
  and exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_batches.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists data_import_batches_update_by_admin_scope
  on public.data_import_batches;
create policy data_import_batches_update_by_admin_scope
on public.data_import_batches
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_batches.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_batches.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists data_import_rows_select_by_admin_scope
  on public.data_import_rows;
create policy data_import_rows_select_by_admin_scope
on public.data_import_rows
for select
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_rows.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists data_import_rows_insert_by_admin_scope
  on public.data_import_rows;
create policy data_import_rows_insert_by_admin_scope
on public.data_import_rows
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_rows.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists data_import_rows_update_by_admin_scope
  on public.data_import_rows;
create policy data_import_rows_update_by_admin_scope
on public.data_import_rows
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_rows.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_import_rows.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

grant select, insert, update
on public.data_import_batches
to authenticated;

grant select, insert, update
on public.data_import_rows
to authenticated;

comment on table public.data_import_batches is
  'Tenant-scoped import review batches for Data Import readiness. Stores safe review metadata only; does not write canonical customer, contact, portal, auth, payment, invoice, job, estimate, or contract records.';

comment on table public.data_import_rows is
  'Tenant-scoped row-level import preview and decision records. Stores normalized preview values and review state only; not raw uploaded files, not raw CSV dumps, and not canonical business records.';

comment on column public.data_import_batches.source_filename is
  'Original uploaded filename only. Raw uploaded file contents are not stored.';

comment on column public.data_import_batches.safe_summary is
  'Safe summary counts and workflow metadata only. Do not store secrets, token material, raw rows, provider payloads, payment details, or private auth data.';

comment on column public.data_import_rows.normalized_preview is
  'Allowlisted normalized customer/contact preview fields from the dry run. Do not store raw source rows, auth data, portal tokens, payment details, provider payloads, or file contents.';

comment on column public.data_import_rows.created_record_refs is
  'Reserved for a future approved import-write phase. Constrained to null in this phase so review batches cannot claim canonical record writes.';
