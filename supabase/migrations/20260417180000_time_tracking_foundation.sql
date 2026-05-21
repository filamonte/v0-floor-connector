do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'time_punch_event_type'
  ) then
    create type public.time_punch_event_type as enum (
      'punch_in',
      'punch_out',
      'break_start',
      'break_end'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'time_punch_source'
  ) then
    create type public.time_punch_source as enum (
      'web',
      'mobile',
      'admin_adjustment'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'time_location_capture_method'
  ) then
    create type public.time_location_capture_method as enum (
      'gps',
      'network',
      'manual',
      'unknown'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'time_card_status'
  ) then
    create type public.time_card_status as enum (
      'open',
      'completed',
      'edited',
      'flagged'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'time_card_entry_mode'
  ) then
    create type public.time_card_entry_mode as enum (
      'derived_from_punches',
      'manual',
      'adjusted'
    );
  end if;
end
$$;

create table if not exists public.time_punch_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  event_type public.time_punch_event_type not null,
  occurred_at timestamptz not null,
  source public.time_punch_source not null default 'web',
  latitude double precision,
  longitude double precision,
  accuracy_meters integer,
  location_capture_method public.time_location_capture_method not null default 'unknown',
  geofence_snapshot jsonb,
  supersedes_event_id uuid references public.time_punch_events(id) on delete set null,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint time_punch_events_latitude_check check (
    latitude is null or (latitude >= -90 and latitude <= 90)
  ),
  constraint time_punch_events_longitude_check check (
    longitude is null or (longitude >= -180 and longitude <= 180)
  ),
  constraint time_punch_events_location_pair_check check (
    (latitude is null and longitude is null) or
    (latitude is not null and longitude is not null)
  ),
  constraint time_punch_events_accuracy_check check (
    accuracy_meters is null or accuracy_meters >= 0
  )
);

create table if not exists public.time_cards (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  work_date date not null,
  source_punch_in_event_id uuid not null references public.time_punch_events(id) on delete cascade,
  source_punch_out_event_id uuid references public.time_punch_events(id) on delete set null,
  punch_in_at timestamptz not null,
  punch_out_at timestamptz,
  break_minutes integer not null default 0,
  worked_minutes integer not null default 0,
  status public.time_card_status not null default 'open',
  entry_mode public.time_card_entry_mode not null default 'derived_from_punches',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint time_cards_break_minutes_check check (break_minutes >= 0),
  constraint time_cards_worked_minutes_check check (worked_minutes >= 0),
  constraint time_cards_punch_order_check check (
    punch_out_at is null or punch_out_at >= punch_in_at
  )
);

create unique index if not exists time_cards_source_punch_in_event_unique_idx
  on public.time_cards (source_punch_in_event_id);

create unique index if not exists time_cards_source_punch_out_event_unique_idx
  on public.time_cards (source_punch_out_event_id)
  where source_punch_out_event_id is not null;

create index if not exists time_punch_events_company_id_idx
  on public.time_punch_events (company_id);

create index if not exists time_punch_events_company_person_occurred_idx
  on public.time_punch_events (company_id, person_id, occurred_at);

create index if not exists time_punch_events_company_project_idx
  on public.time_punch_events (company_id, project_id)
  where project_id is not null;

create index if not exists time_punch_events_company_job_idx
  on public.time_punch_events (company_id, job_id)
  where job_id is not null;

create index if not exists time_punch_events_company_event_type_idx
  on public.time_punch_events (company_id, event_type);

create index if not exists time_cards_company_id_idx
  on public.time_cards (company_id);

create index if not exists time_cards_company_person_work_date_idx
  on public.time_cards (company_id, person_id, work_date desc);

create index if not exists time_cards_company_project_work_date_idx
  on public.time_cards (company_id, project_id, work_date desc)
  where project_id is not null;

create index if not exists time_cards_company_job_work_date_idx
  on public.time_cards (company_id, job_id, work_date desc)
  where job_id is not null;

create index if not exists time_cards_company_status_idx
  on public.time_cards (company_id, status);

drop trigger if exists set_time_punch_events_updated_at on public.time_punch_events;

create trigger set_time_punch_events_updated_at
before update on public.time_punch_events
for each row
execute function public.set_updated_at();

drop trigger if exists set_time_cards_updated_at on public.time_cards;

create trigger set_time_cards_updated_at
before update on public.time_cards
for each row
execute function public.set_updated_at();

alter table public.time_punch_events enable row level security;
alter table public.time_punch_events force row level security;

drop policy if exists time_punch_events_select_by_membership on public.time_punch_events;
create policy time_punch_events_select_by_membership
on public.time_punch_events
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists time_punch_events_insert_by_membership on public.time_punch_events;
create policy time_punch_events_insert_by_membership
on public.time_punch_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists time_punch_events_update_by_membership on public.time_punch_events;
create policy time_punch_events_update_by_membership
on public.time_punch_events
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.time_cards enable row level security;
alter table public.time_cards force row level security;

drop policy if exists time_cards_select_by_membership on public.time_cards;
create policy time_cards_select_by_membership
on public.time_cards
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists time_cards_insert_by_membership on public.time_cards;
create policy time_cards_insert_by_membership
on public.time_cards
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists time_cards_update_by_membership on public.time_cards;
create policy time_cards_update_by_membership
on public.time_cards
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.time_punch_events is 'Canonical organization-scoped time punch event log for workforce time tracking.';
comment on table public.time_cards is 'Derived organization-scoped operational summary table built from canonical time punch events.';
comment on column public.time_punch_events.geofence_snapshot is 'Optional future-ready geofence context snapshot captured at punch time without enforcing geofence rules yet.';
comment on column public.time_cards.entry_mode is 'Indicates whether the time card was derived from punch events or created through a future manual or adjusted flow.';
