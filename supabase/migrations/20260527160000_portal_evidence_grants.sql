create table if not exists public.portal_evidence_grants (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null,
  subject_type text not null,
  subject_id uuid not null,
  status text not null default 'shared',
  title_override text,
  customer_note text,
  shared_by uuid references public.users(id) on delete set null,
  shared_at timestamptz,
  revoked_by uuid references public.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint portal_evidence_grants_company_project_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint portal_evidence_grants_subject_type_check
    check (subject_type in ('execution_attachment')),
  constraint portal_evidence_grants_status_check
    check (status in ('shared', 'revoked')),
  constraint portal_evidence_grants_shared_at_check
    check (status <> 'shared' or shared_at is not null),
  constraint portal_evidence_grants_revoked_at_check
    check (status <> 'revoked' or revoked_at is not null),
  constraint portal_evidence_grants_project_subject_unique
    unique (company_id, project_id, subject_type, subject_id)
);

create index if not exists portal_evidence_grants_company_project_idx
  on public.portal_evidence_grants (company_id, project_id, status, updated_at desc);

create index if not exists portal_evidence_grants_company_subject_idx
  on public.portal_evidence_grants (company_id, subject_type, subject_id);

drop trigger if exists set_portal_evidence_grants_updated_at on public.portal_evidence_grants;

create trigger set_portal_evidence_grants_updated_at
before update on public.portal_evidence_grants
for each row
execute function public.set_updated_at();

alter table public.portal_evidence_grants enable row level security;
alter table public.portal_evidence_grants force row level security;

drop policy if exists portal_evidence_grants_select_by_scope on public.portal_evidence_grants;
create policy portal_evidence_grants_select_by_scope
on public.portal_evidence_grants
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (
    status = 'shared'
    and (select public.has_active_portal_project_access(company_id, project_id))
  )
);

drop policy if exists portal_evidence_grants_insert_by_membership on public.portal_evidence_grants;
create policy portal_evidence_grants_insert_by_membership
on public.portal_evidence_grants
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists portal_evidence_grants_update_by_membership on public.portal_evidence_grants;
create policy portal_evidence_grants_update_by_membership
on public.portal_evidence_grants
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.portal_evidence_grants is 'Explicit project-scoped customer visibility grants for selected evidence subjects. This is a sharing policy layer, not a duplicate file or portal document model.';
comment on column public.portal_evidence_grants.subject_type is 'Constrained shareable evidence subject type. The initial implementation supports execution_attachment only.';
comment on column public.portal_evidence_grants.subject_id is 'Canonical source-record id for the selected evidence subject; this table does not copy the file or document.';
comment on column public.portal_evidence_grants.status is 'Current portal visibility state for the selected evidence subject: shared or revoked.';
comment on column public.portal_evidence_grants.title_override is 'Optional contractor-provided customer-safe display title.';
comment on column public.portal_evidence_grants.customer_note is 'Optional contractor-provided customer-safe note displayed with shared evidence.';
