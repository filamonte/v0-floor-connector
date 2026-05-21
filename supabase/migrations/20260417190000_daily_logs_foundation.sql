do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'daily_log_status'
  ) then
    create type public.daily_log_status as enum (
      'draft',
      'finalized'
    );
  end if;
end
$$;

create table if not exists public.daily_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  log_date date not null,
  status public.daily_log_status not null default 'draft',
  summary text,
  work_completed text,
  work_planned_next text,
  delays_or_blockers text,
  safety_notes text,
  weather_summary text,
  weather_conditions text,
  temperature_high_f integer,
  temperature_low_f integer,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_logs_temperature_order_check check (
    temperature_low_f is null or
    temperature_high_f is null or
    temperature_low_f <= temperature_high_f
  )
);

create unique index if not exists daily_logs_company_project_log_date_unique_idx
  on public.daily_logs (company_id, project_id, log_date);

create index if not exists daily_logs_company_id_idx
  on public.daily_logs (company_id);

create index if not exists daily_logs_company_project_log_date_idx
  on public.daily_logs (company_id, project_id, log_date desc);

create index if not exists daily_logs_company_job_log_date_idx
  on public.daily_logs (company_id, job_id, log_date desc)
  where job_id is not null;

create index if not exists daily_logs_company_status_log_date_idx
  on public.daily_logs (company_id, status, log_date desc);

drop trigger if exists set_daily_logs_updated_at on public.daily_logs;

create trigger set_daily_logs_updated_at
before update on public.daily_logs
for each row
execute function public.set_updated_at();

alter table public.daily_logs enable row level security;
alter table public.daily_logs force row level security;

drop policy if exists daily_logs_select_by_membership on public.daily_logs;
create policy daily_logs_select_by_membership
on public.daily_logs
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists daily_logs_insert_by_membership on public.daily_logs;
create policy daily_logs_insert_by_membership
on public.daily_logs
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists daily_logs_update_by_membership on public.daily_logs;
create policy daily_logs_update_by_membership
on public.daily_logs
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.daily_logs is 'Canonical organization-scoped project-day execution record for field reporting and daily execution visibility.';
comment on column public.daily_logs.project_id is 'Required project-level root so daily execution stays anchored to the canonical project workspace.';
comment on column public.daily_logs.job_id is 'Optional dominant job context when a project-day log is primarily associated with one job without becoming a job-only log model.';
comment on column public.daily_logs.log_date is 'One canonical daily log exists per organization project and date.';
comment on column public.daily_logs.delays_or_blockers is 'Free-text execution blocker summary until structured field notes arrive in the next execution slice step.';
