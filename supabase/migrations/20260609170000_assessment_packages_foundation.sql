create table if not exists public.assessment_packages (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'draft',
  title text not null,
  assessment_date date,
  site_contact_name text,
  site_contact_phone text,
  access_notes text,
  parking_notes text,
  site_notes text,
  customer_goals text,
  current_conditions_summary text,
  recommended_system_summary text,
  risk_summary text,
  estimate_handoff_summary text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint assessment_packages_status_check check (
    status in ('draft', 'in_progress', 'ready_for_estimate', 'archived')
  ),
  constraint assessment_packages_title_check check (length(trim(title)) > 0)
);

create index if not exists assessment_packages_company_id_idx
  on public.assessment_packages (company_id);

create index if not exists assessment_packages_company_project_idx
  on public.assessment_packages (company_id, project_id);

create index if not exists assessment_packages_company_status_idx
  on public.assessment_packages (company_id, status);

create index if not exists assessment_packages_project_updated_at_idx
  on public.assessment_packages (project_id, updated_at desc);

drop trigger if exists set_assessment_packages_updated_at on public.assessment_packages;

create trigger set_assessment_packages_updated_at
before update on public.assessment_packages
for each row
execute function public.set_updated_at();

create or replace function public.validate_assessment_package_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_company_id uuid;
begin
  select project.company_id
    into project_company_id
  from public.projects project
  where project.id = new.project_id;

  if project_company_id is null or project_company_id <> new.company_id then
    raise exception 'Assessment package project must belong to the same company.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_assessment_package_relationships_trigger
  on public.assessment_packages;

create trigger validate_assessment_package_relationships_trigger
before insert or update on public.assessment_packages
for each row
execute function public.validate_assessment_package_relationships();

alter table public.assessment_packages enable row level security;
alter table public.assessment_packages force row level security;

drop policy if exists assessment_packages_select_by_membership
  on public.assessment_packages;
create policy assessment_packages_select_by_membership
on public.assessment_packages
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists assessment_packages_insert_by_membership
  on public.assessment_packages;
create policy assessment_packages_insert_by_membership
on public.assessment_packages
for insert
to authenticated
with check (
  (select public.is_active_company_member(company_id))
  and (created_by is null or created_by = (select auth.uid()))
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists assessment_packages_update_by_membership
  on public.assessment_packages;
create policy assessment_packages_update_by_membership
on public.assessment_packages
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check (
  (select public.is_active_company_member(company_id))
  and (updated_by is null or updated_by = (select auth.uid()))
);

comment on table public.assessment_packages is 'Canonical tenant-scoped assessment package foundation attached to projects for estimator handoff. It does not duplicate project, customer, estimate, job, material, field, or workflow truth.';
comment on column public.assessment_packages.project_id is 'Canonical project that owns the assessment package context.';
comment on column public.assessment_packages.estimate_handoff_summary is 'Human-authored summary for estimator review. Estimates consume this context but remain canonical estimate records.';
