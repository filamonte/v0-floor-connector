do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'execution_attachment_subject_type'
  ) then
    create type public.execution_attachment_subject_type as enum (
      'daily_log',
      'field_note'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'execution_attachment_type'
  ) then
    create type public.execution_attachment_type as enum (
      'photo',
      'file'
    );
  end if;
end
$$;

create table if not exists public.execution_attachments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type public.execution_attachment_subject_type not null,
  subject_id uuid not null,
  attachment_type public.execution_attachment_type not null default 'file',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  caption text,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists execution_attachments_company_id_idx
  on public.execution_attachments (company_id);

create index if not exists execution_attachments_company_subject_idx
  on public.execution_attachments (company_id, subject_type, subject_id, created_at desc);

create index if not exists execution_attachments_company_type_idx
  on public.execution_attachments (company_id, attachment_type, created_at desc);

drop trigger if exists set_execution_attachments_updated_at on public.execution_attachments;

create trigger set_execution_attachments_updated_at
before update on public.execution_attachments
for each row
execute function public.set_updated_at();

alter table public.execution_attachments enable row level security;
alter table public.execution_attachments force row level security;

drop policy if exists execution_attachments_select_by_membership on public.execution_attachments;
create policy execution_attachments_select_by_membership
on public.execution_attachments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists execution_attachments_insert_by_membership on public.execution_attachments;
create policy execution_attachments_insert_by_membership
on public.execution_attachments
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists execution_attachments_update_by_membership on public.execution_attachments;
create policy execution_attachments_update_by_membership
on public.execution_attachments
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.execution_attachments is 'Canonical lightweight attachment linkage for field execution context on daily logs and field notes without introducing a full document subsystem.';
comment on column public.execution_attachments.subject_type is 'Restricts execution attachments to canonical daily logs or field notes in this slice.';
comment on column public.execution_attachments.subject_id is 'References the canonical subject record id selected by subject_type.';
comment on column public.execution_attachments.storage_path is 'Lightweight storage or file reference for the execution attachment, not a full managed file record.';
comment on column public.execution_attachments.file_name is 'Display-friendly file name for photos or files attached to field execution records.';
