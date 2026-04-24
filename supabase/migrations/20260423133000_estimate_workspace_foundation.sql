alter table public.estimates
  add column if not exists title text,
  add column if not exists estimate_date date,
  add column if not exists expiration_date date,
  add column if not exists project_type text,
  add column if not exists sector text,
  add column if not exists content jsonb not null default '{}'::jsonb;

comment on column public.estimates.title is 'User-facing estimate title used by the estimate workspace and downstream document generation.';
comment on column public.estimates.estimate_date is 'Operational estimate date selected in the estimate workspace.';
comment on column public.estimates.expiration_date is 'Date after which the estimate should be considered expired.';
comment on column public.estimates.project_type is 'Operational estimate/project type selected in the estimate workspace.';
comment on column public.estimates.sector is 'Operational market sector selected in the estimate workspace.';
comment on column public.estimates.content is 'Structured estimate workspace content for terms, inclusions, exclusions, notes, and scope of work.';

create table if not exists public.estimate_attachments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  estimate_id uuid not null,
  attachment_type text not null default 'file',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint,
  caption text,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint estimate_attachments_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete cascade
);

create index if not exists estimate_attachments_company_id_idx
  on public.estimate_attachments (company_id);

create index if not exists estimate_attachments_company_estimate_idx
  on public.estimate_attachments (company_id, estimate_id, created_at desc);

drop trigger if exists set_estimate_attachments_updated_at on public.estimate_attachments;

create trigger set_estimate_attachments_updated_at
before update on public.estimate_attachments
for each row
execute function public.set_updated_at();

alter table public.estimate_attachments enable row level security;
alter table public.estimate_attachments force row level security;

drop policy if exists estimate_attachments_select_by_membership on public.estimate_attachments;
create policy estimate_attachments_select_by_membership
on public.estimate_attachments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_attachments_insert_by_membership on public.estimate_attachments;
create policy estimate_attachments_insert_by_membership
on public.estimate_attachments
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_attachments_update_by_membership on public.estimate_attachments;
create policy estimate_attachments_update_by_membership
on public.estimate_attachments
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_attachments_delete_by_membership on public.estimate_attachments;
create policy estimate_attachments_delete_by_membership
on public.estimate_attachments
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on table public.estimate_attachments is 'Lightweight estimate-scoped attachment records used by the estimate workspace without introducing a broad document subsystem.';
comment on column public.estimate_attachments.storage_path is 'Storage path for a file attached directly to an estimate record.';
