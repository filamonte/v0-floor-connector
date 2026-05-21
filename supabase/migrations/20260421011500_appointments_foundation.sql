do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'appointment_type'
  ) then
    create type public.appointment_type as enum (
      'site_visit',
      'customer_meeting',
      'estimate_appointment',
      'follow_up',
      'internal'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'appointment_status'
  ) then
    create type public.appointment_status as enum (
      'scheduled',
      'completed',
      'canceled',
      'no_show'
    );
  end if;
end
$$;

create table if not exists public.appointments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  assigned_person_id uuid references public.people(id) on delete set null,
  title text not null,
  appointment_type public.appointment_type not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  notes text,
  status public.appointment_status not null default 'scheduled',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists appointments_company_id_idx
  on public.appointments (company_id);

create index if not exists appointments_company_starts_at_idx
  on public.appointments (company_id, starts_at asc);

create index if not exists appointments_company_status_starts_at_idx
  on public.appointments (company_id, status, starts_at asc);

create index if not exists appointments_company_opportunity_idx
  on public.appointments (company_id, opportunity_id, starts_at asc)
  where opportunity_id is not null;

create index if not exists appointments_company_customer_idx
  on public.appointments (company_id, customer_id, starts_at asc)
  where customer_id is not null;

create index if not exists appointments_company_project_idx
  on public.appointments (company_id, project_id, starts_at asc)
  where project_id is not null;

create index if not exists appointments_company_assigned_person_idx
  on public.appointments (company_id, assigned_person_id, starts_at asc)
  where assigned_person_id is not null;

drop trigger if exists set_appointments_updated_at on public.appointments;

create trigger set_appointments_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();

alter table public.appointments enable row level security;
alter table public.appointments force row level security;

drop policy if exists appointments_select_by_membership on public.appointments;
create policy appointments_select_by_membership
on public.appointments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists appointments_insert_by_membership on public.appointments;
create policy appointments_insert_by_membership
on public.appointments
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists appointments_update_by_membership on public.appointments;
create policy appointments_update_by_membership
on public.appointments
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.appointments is 'Canonical organization-scoped commercial and operational appointments that stay connected to the shared opportunity, customer, and project chain without becoming a second job scheduler.';
comment on column public.appointments.opportunity_id is 'Optional lead linkage so site visits and estimate appointments stay attached to the upstream commercial record when one exists.';
comment on column public.appointments.customer_id is 'Optional customer linkage for relationship continuity and for internal/customer meetings that are not yet tied to a single project.';
comment on column public.appointments.project_id is 'Optional project linkage so project-root continuity stays visible when appointments support downstream operational or customer coordination.';
comment on column public.appointments.assigned_person_id is 'Optional responsible internal person on the shared workforce model.';
comment on column public.appointments.appointment_type is 'Distinguishes appointments as meetings, visits, or planning blocks so they do not replace canonical execution jobs.';
