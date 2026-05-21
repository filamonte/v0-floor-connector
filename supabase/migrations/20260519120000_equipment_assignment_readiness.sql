create table if not exists public.job_equipment_requirements (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  equipment_type text not null,
  quantity integer not null default 1,
  required boolean not null default true,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint job_equipment_requirements_quantity_check check (quantity > 0),
  constraint job_equipment_requirements_equipment_type_check check (
    equipment_type in (
      'grinder',
      'polisher',
      'vacuum',
      'dust_collector',
      'shot_blaster',
      'scarifier',
      'scraper',
      'mixer',
      'sprayer',
      'trailer',
      'truck',
      'generator',
      'moisture_meter',
      'testing_tool',
      'coating_tool',
      'burnisher',
      'hand_tool',
      'kit',
      'other'
    )
  )
);

create table if not exists public.equipment_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  equipment_asset_id uuid not null references public.equipment_assets(id) on delete restrict,
  job_id uuid not null references public.jobs(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  assigned_date date,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  assignment_status text not null default 'planned',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint equipment_assignments_status_check check (
    assignment_status in ('planned', 'assigned', 'in_use', 'returned', 'canceled')
  ),
  constraint equipment_assignments_time_window_check check (
    scheduled_end_at is null
    or scheduled_start_at is null
    or scheduled_end_at >= scheduled_start_at
  )
);

create index if not exists job_equipment_requirements_company_id_idx
  on public.job_equipment_requirements(company_id);

create index if not exists job_equipment_requirements_company_job_idx
  on public.job_equipment_requirements(company_id, job_id);

create index if not exists job_equipment_requirements_company_equipment_type_idx
  on public.job_equipment_requirements(company_id, equipment_type);

create index if not exists equipment_assignments_company_id_idx
  on public.equipment_assignments(company_id);

create index if not exists equipment_assignments_company_job_idx
  on public.equipment_assignments(company_id, job_id);

create index if not exists equipment_assignments_company_asset_idx
  on public.equipment_assignments(company_id, equipment_asset_id);

create index if not exists equipment_assignments_company_status_idx
  on public.equipment_assignments(company_id, assignment_status);

create index if not exists equipment_assignments_company_assigned_date_idx
  on public.equipment_assignments(company_id, assigned_date);

create index if not exists equipment_assignments_company_schedule_window_idx
  on public.equipment_assignments(company_id, scheduled_start_at, scheduled_end_at);

create or replace function public.enforce_job_equipment_requirement_scope()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  job_company_id uuid;
begin
  select jobs.company_id
    into job_company_id
  from public.jobs
  where jobs.id = new.job_id;

  if job_company_id is null then
    raise exception 'Equipment requirement job does not exist.';
  end if;

  if job_company_id <> new.company_id then
    raise exception 'Equipment requirement job must belong to the same company.';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_equipment_assignment_scope()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  asset_company_id uuid;
  job_company_id uuid;
  job_project_id uuid;
begin
  select equipment_assets.company_id
    into asset_company_id
  from public.equipment_assets
  where equipment_assets.id = new.equipment_asset_id;

  if asset_company_id is null then
    raise exception 'Equipment assignment asset does not exist.';
  end if;

  if asset_company_id <> new.company_id then
    raise exception 'Equipment assignment asset must belong to the same company.';
  end if;

  select jobs.company_id, jobs.project_id
    into job_company_id, job_project_id
  from public.jobs
  where jobs.id = new.job_id;

  if job_company_id is null then
    raise exception 'Equipment assignment job does not exist.';
  end if;

  if job_company_id <> new.company_id then
    raise exception 'Equipment assignment job must belong to the same company.';
  end if;

  if new.project_id is not null and new.project_id <> job_project_id then
    raise exception 'Equipment assignment project must match the job project.';
  end if;

  if new.project_id is null then
    new.project_id := job_project_id;
  end if;

  return new;
end;
$$;

drop trigger if exists job_equipment_requirements_scope on public.job_equipment_requirements;
create trigger job_equipment_requirements_scope
before insert or update of company_id, job_id on public.job_equipment_requirements
for each row
execute function public.enforce_job_equipment_requirement_scope();

drop trigger if exists equipment_assignments_scope on public.equipment_assignments;
create trigger equipment_assignments_scope
before insert or update of company_id, equipment_asset_id, job_id, project_id on public.equipment_assignments
for each row
execute function public.enforce_equipment_assignment_scope();

drop trigger if exists job_equipment_requirements_set_updated_at on public.job_equipment_requirements;
create trigger job_equipment_requirements_set_updated_at
before update on public.job_equipment_requirements
for each row
execute function public.set_updated_at();

drop trigger if exists equipment_assignments_set_updated_at on public.equipment_assignments;
create trigger equipment_assignments_set_updated_at
before update on public.equipment_assignments
for each row
execute function public.set_updated_at();

alter table public.job_equipment_requirements enable row level security;
alter table public.job_equipment_requirements force row level security;

alter table public.equipment_assignments enable row level security;
alter table public.equipment_assignments force row level security;

drop policy if exists job_equipment_requirements_select_by_membership on public.job_equipment_requirements;
create policy job_equipment_requirements_select_by_membership
on public.job_equipment_requirements
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists job_equipment_requirements_insert_by_manager_scope on public.job_equipment_requirements;
create policy job_equipment_requirements_insert_by_manager_scope
on public.job_equipment_requirements
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = job_equipment_requirements.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
  and (created_by is null or created_by = (select auth.uid()))
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists job_equipment_requirements_update_by_manager_scope on public.job_equipment_requirements;
create policy job_equipment_requirements_update_by_manager_scope
on public.job_equipment_requirements
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = job_equipment_requirements.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = job_equipment_requirements.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists job_equipment_requirements_delete_by_manager_scope on public.job_equipment_requirements;
create policy job_equipment_requirements_delete_by_manager_scope
on public.job_equipment_requirements
for delete
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = job_equipment_requirements.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

drop policy if exists equipment_assignments_select_by_membership on public.equipment_assignments;
create policy equipment_assignments_select_by_membership
on public.equipment_assignments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists equipment_assignments_insert_by_manager_scope on public.equipment_assignments;
create policy equipment_assignments_insert_by_manager_scope
on public.equipment_assignments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = equipment_assignments.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
  and (created_by is null or created_by = (select auth.uid()))
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists equipment_assignments_update_by_manager_scope on public.equipment_assignments;
create policy equipment_assignments_update_by_manager_scope
on public.equipment_assignments
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = equipment_assignments.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = equipment_assignments.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
  and (updated_by is null or updated_by = (select auth.uid()))
);

grant select, insert, update, delete on public.job_equipment_requirements to authenticated;
grant select, insert, update on public.equipment_assignments to authenticated;

comment on table public.job_equipment_requirements is
  'Tenant-scoped advisory job equipment requirement rows. These feed derived warnings only and do not alter project readiness gates.';

comment on table public.equipment_assignments is
  'Tenant-scoped equipment-to-job assignment rows. Conflicts and availability are derived as warnings; no separate equipment calendar is created.';
