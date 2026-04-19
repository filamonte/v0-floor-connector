do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'compliance_subject_type'
  ) then
    create type public.compliance_subject_type as enum (
      'person',
      'vendor'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'compliance_record_type'
  ) then
    create type public.compliance_record_type as enum (
      'license',
      'insurance',
      'certification',
      'training',
      'background_check',
      'other'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'compliance_status'
  ) then
    create type public.compliance_status as enum (
      'valid',
      'expiring',
      'expired',
      'missing_information'
    );
  end if;
end
$$;

create table if not exists public.compliance_records (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type public.compliance_subject_type not null,
  subject_id uuid not null,
  record_type public.compliance_record_type not null,
  name text not null,
  issuing_authority text,
  reference_number text,
  issued_on date,
  expires_on date,
  status public.compliance_status not null default 'missing_information',
  document_file_id uuid,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint compliance_records_issue_expiry_check check (
    issued_on is null or expires_on is null or expires_on >= issued_on
  )
);

create index if not exists compliance_records_company_id_idx
  on public.compliance_records (company_id);

create index if not exists compliance_records_company_subject_idx
  on public.compliance_records (company_id, subject_type, subject_id);

create index if not exists compliance_records_company_record_type_idx
  on public.compliance_records (company_id, record_type);

create index if not exists compliance_records_company_status_idx
  on public.compliance_records (company_id, status);

create index if not exists compliance_records_company_expires_on_idx
  on public.compliance_records (company_id, expires_on)
  where expires_on is not null;

drop trigger if exists set_compliance_records_updated_at on public.compliance_records;

create trigger set_compliance_records_updated_at
before update on public.compliance_records
for each row
execute function public.set_updated_at();

alter table public.compliance_records enable row level security;
alter table public.compliance_records force row level security;

drop policy if exists compliance_records_select_by_membership on public.compliance_records;
create policy compliance_records_select_by_membership
on public.compliance_records
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists compliance_records_insert_by_membership on public.compliance_records;
create policy compliance_records_insert_by_membership
on public.compliance_records
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists compliance_records_update_by_membership on public.compliance_records;
create policy compliance_records_update_by_membership
on public.compliance_records
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.compliance_records is 'Canonical organization-scoped compliance and credential records for workforce people and vendor companies.';
comment on column public.compliance_records.subject_type is 'Polymorphic subject discriminator so one shared compliance table can attach to either people or vendors.';
comment on column public.compliance_records.subject_id is 'References the canonical people or vendors record identified by subject_type and validated in the application data layer.';
comment on column public.compliance_records.document_file_id is 'Reserved linkage hook for a future canonical document or file record without introducing a compliance-specific file silo yet.';
