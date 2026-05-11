do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'record_revision_subject_type'
  ) then
    create type public.record_revision_subject_type as enum (
      'estimate',
      'invoice',
      'contract',
      'change_order'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'record_revision_kind'
  ) then
    create type public.record_revision_kind as enum (
      'created',
      'edited',
      'sent',
      'status_change',
      'system_snapshot',
      'pre_signature',
      'pre_payment',
      'manual'
    );
  end if;
end
$$;

create table if not exists public.record_revisions (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type public.record_revision_subject_type not null,
  subject_id uuid not null,
  revision_number integer not null,
  is_current boolean not null default true,
  revision_reason text,
  revision_kind public.record_revision_kind not null default 'manual',
  snapshot jsonb not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint record_revisions_revision_number_positive_check
    check (revision_number > 0),
  constraint record_revisions_snapshot_object_check
    check (jsonb_typeof(snapshot) = 'object')
);

create unique index if not exists record_revisions_company_subject_revision_unique_idx
  on public.record_revisions (company_id, subject_type, subject_id, revision_number);

create unique index if not exists record_revisions_one_current_per_subject_idx
  on public.record_revisions (company_id, subject_type, subject_id)
  where is_current;

create index if not exists record_revisions_company_subject_idx
  on public.record_revisions (company_id, subject_type, subject_id);

create index if not exists record_revisions_company_subject_current_idx
  on public.record_revisions (company_id, subject_type, subject_id, is_current);

create index if not exists record_revisions_company_created_idx
  on public.record_revisions (company_id, created_at desc);

create or replace function public.prevent_record_revision_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and new.id = old.id
    and new.company_id = old.company_id
    and new.subject_type = old.subject_type
    and new.subject_id = old.subject_id
    and new.revision_number = old.revision_number
    and new.revision_reason is not distinct from old.revision_reason
    and new.revision_kind = old.revision_kind
    and new.snapshot = old.snapshot
    and new.created_by is not distinct from old.created_by
    and new.created_at = old.created_at
    and old.is_current = true
    and new.is_current = false
  then
    return new;
  end if;

  raise exception 'Record revisions are immutable and cannot be changed once created.';
end;
$$;

drop trigger if exists prevent_record_revision_update_delete
  on public.record_revisions;
create trigger prevent_record_revision_update_delete
before update or delete on public.record_revisions
for each row
execute function public.prevent_record_revision_mutation();

alter table public.record_revisions enable row level security;
alter table public.record_revisions force row level security;

drop policy if exists record_revisions_select_by_membership on public.record_revisions;
create policy record_revisions_select_by_membership
on public.record_revisions
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists record_revisions_insert_by_membership on public.record_revisions;
create policy record_revisions_insert_by_membership
on public.record_revisions
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists record_revisions_update_current_by_membership on public.record_revisions;
create policy record_revisions_update_current_by_membership
on public.record_revisions
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on type public.record_revision_subject_type is 'Canonical record types supported by the first-pass revision timeline.';
comment on type public.record_revision_kind is 'Small revision event classification used for first-pass revision history display.';
comment on table public.record_revisions is 'Immutable tenant-scoped revision snapshots attached to canonical estimate, invoice, contract, and change-order records. Revisions do not clone or replace the canonical business records; only is_current may move from true to false when the next revision is created.';
comment on column public.record_revisions.subject_id is 'Canonical record id for the selected subject type. Application utilities validate the subject table and tenant scope before insertion.';
comment on column public.record_revisions.revision_number is 'Monotonic revision number scoped to one organization, subject type, and canonical subject id.';
comment on column public.record_revisions.is_current is 'Marks the latest revision for display. Previous current rows are made non-current by the server-side revision creation flow.';
comment on column public.record_revisions.snapshot is 'Explicit JSON snapshot built by server utilities from selected durable fields and line-item/signature/payment summaries.';
