do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'job_assignment_role'
  ) then
    create type public.job_assignment_role as enum (
      'lead',
      'crew',
      'subcontractor'
    );
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'status'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'dispatch_status'
  ) then
    alter table public.jobs
      rename column status to dispatch_status;
  end if;
end
$$;

alter table public.jobs
  add column if not exists scheduled_date date,
  add column if not exists scheduled_start_at timestamptz,
  add column if not exists scheduled_end_at timestamptz,
  add column if not exists schedule_notes text,
  add column if not exists crew_vendor_id uuid;

alter table public.jobs
  drop constraint if exists jobs_crew_vendor_company_fkey;

alter table public.jobs
  drop constraint if exists jobs_crew_vendor_id_fkey;

alter table public.jobs
  add constraint jobs_crew_vendor_id_fkey
    foreign key (crew_vendor_id)
    references public.vendors(id)
    on delete set null;

drop index if exists jobs_status_idx;
create index if not exists jobs_dispatch_status_idx
  on public.jobs (company_id, dispatch_status);

create index if not exists jobs_crew_vendor_id_idx
  on public.jobs (company_id, crew_vendor_id);

create index if not exists jobs_scheduled_start_at_idx
  on public.jobs (company_id, scheduled_start_at);

create table if not exists public.job_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null,
  person_id uuid,
  vendor_id uuid,
  role public.job_assignment_role not null default 'crew',
  assigned_start_at timestamptz,
  assigned_end_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint job_assignments_job_id_fkey
    foreign key (job_id)
    references public.jobs(id)
    on delete cascade,
  constraint job_assignments_person_id_fkey
    foreign key (person_id)
    references public.people(id)
    on delete cascade,
  constraint job_assignments_vendor_id_fkey
    foreign key (vendor_id)
    references public.vendors(id)
    on delete cascade,
  constraint job_assignments_subject_present_check
    check (
      (case when person_id is null then 0 else 1 end) +
      (case when vendor_id is null then 0 else 1 end) = 1
    ),
  constraint job_assignments_time_window_check
    check (
      assigned_end_at is null or
      assigned_start_at is null or
      assigned_end_at >= assigned_start_at
    )
);

create index if not exists job_assignments_company_job_idx
  on public.job_assignments (company_id, job_id);

create index if not exists job_assignments_company_person_idx
  on public.job_assignments (company_id, person_id);

create index if not exists job_assignments_company_vendor_idx
  on public.job_assignments (company_id, vendor_id);

create index if not exists job_assignments_company_role_idx
  on public.job_assignments (company_id, role);

drop trigger if exists set_job_assignments_updated_at on public.job_assignments;

create trigger set_job_assignments_updated_at
before update on public.job_assignments
for each row
execute function public.set_updated_at();

alter table public.job_assignments enable row level security;
alter table public.job_assignments force row level security;

drop policy if exists job_assignments_select_by_membership on public.job_assignments;
create policy job_assignments_select_by_membership
on public.job_assignments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists job_assignments_insert_by_membership on public.job_assignments;
create policy job_assignments_insert_by_membership
on public.job_assignments
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists job_assignments_update_by_membership on public.job_assignments;
create policy job_assignments_update_by_membership
on public.job_assignments
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists job_assignments_delete_by_membership on public.job_assignments;
create policy job_assignments_delete_by_membership
on public.job_assignments
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on column public.jobs.dispatch_status is 'Canonical operational scheduling and execution state for the job.';
comment on column public.jobs.scheduled_date is 'Primary scheduled service date for the current first-pass scheduling foundation.';
comment on column public.jobs.scheduled_start_at is 'Optional scheduled start timestamp for the current first-pass scheduling foundation.';
comment on column public.jobs.scheduled_end_at is 'Optional scheduled end timestamp for the current first-pass scheduling foundation.';
comment on column public.jobs.schedule_notes is 'Optional scheduler notes kept on the canonical job record.';
comment on column public.jobs.crew_vendor_id is 'Optional labor-provider vendor responsible for the assigned subcontract crew on the canonical job record.';

comment on table public.job_assignments is 'Canonical organization-scoped crew assignment rows tied to the existing job record.';
comment on column public.job_assignments.role is 'Assignment role for the person or vendor on the current job schedule.';
