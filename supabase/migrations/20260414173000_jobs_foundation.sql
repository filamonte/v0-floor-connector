do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'job_status'
  ) then
    create type public.job_status as enum (
      'unscheduled',
      'scheduled',
      'in_progress',
      'completed',
      'canceled'
    );
  end if;
end
$$;

create table if not exists public.jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  estimate_id uuid,
  status public.job_status not null default 'unscheduled',
  scheduled_date date,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint jobs_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint jobs_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint jobs_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete set null
);

create index if not exists jobs_company_id_idx
  on public.jobs (company_id);

create index if not exists jobs_project_id_idx
  on public.jobs (project_id);

create index if not exists jobs_customer_id_idx
  on public.jobs (customer_id);

create index if not exists jobs_estimate_id_idx
  on public.jobs (estimate_id);

create index if not exists jobs_status_idx
  on public.jobs (company_id, status);

create index if not exists jobs_scheduled_date_idx
  on public.jobs (company_id, scheduled_date);

drop trigger if exists set_jobs_updated_at on public.jobs;

create trigger set_jobs_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

alter table public.jobs enable row level security;
alter table public.jobs force row level security;

drop policy if exists jobs_select_by_membership on public.jobs;
create policy jobs_select_by_membership
on public.jobs
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists jobs_insert_by_membership on public.jobs;
create policy jobs_insert_by_membership
on public.jobs
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists jobs_update_by_membership on public.jobs;
create policy jobs_update_by_membership
on public.jobs
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.jobs is 'Canonical organization-scoped work order table that connects sold project work to operational execution.';
comment on column public.jobs.estimate_id is 'Optional approved estimate that originated the job when sold work is converted into execution.';
comment on column public.jobs.scheduled_date is 'Optional first scheduled service date for the job foundation before full calendar scheduling exists.';
