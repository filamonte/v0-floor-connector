do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'field_note_type'
  ) then
    create type public.field_note_type as enum (
      'general',
      'labor',
      'material',
      'equipment',
      'blocker',
      'issue',
      'punch_list'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'field_note_status'
  ) then
    create type public.field_note_status as enum (
      'open',
      'noted',
      'resolved'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'field_note_visibility'
  ) then
    create type public.field_note_visibility as enum (
      'internal'
    );
  end if;
end
$$;

create table if not exists public.field_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,
  time_card_id uuid references public.time_cards(id) on delete set null,
  note_type public.field_note_type not null default 'general',
  title text not null,
  body text,
  status public.field_note_status not null default 'open',
  visibility public.field_note_visibility not null default 'internal',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists field_notes_company_id_idx
  on public.field_notes (company_id);

create index if not exists field_notes_company_daily_log_idx
  on public.field_notes (company_id, daily_log_id, created_at desc);

create index if not exists field_notes_company_project_idx
  on public.field_notes (company_id, project_id, created_at desc);

create index if not exists field_notes_company_job_idx
  on public.field_notes (company_id, job_id, created_at desc)
  where job_id is not null;

create index if not exists field_notes_company_person_idx
  on public.field_notes (company_id, person_id, created_at desc)
  where person_id is not null;

create index if not exists field_notes_company_time_card_idx
  on public.field_notes (company_id, time_card_id, created_at desc)
  where time_card_id is not null;

create index if not exists field_notes_company_note_type_idx
  on public.field_notes (company_id, note_type, created_at desc);

create index if not exists field_notes_company_status_idx
  on public.field_notes (company_id, status, created_at desc);

drop trigger if exists set_field_notes_updated_at on public.field_notes;

create trigger set_field_notes_updated_at
before update on public.field_notes
for each row
execute function public.set_updated_at();

alter table public.field_notes enable row level security;
alter table public.field_notes force row level security;

drop policy if exists field_notes_select_by_membership on public.field_notes;
create policy field_notes_select_by_membership
on public.field_notes
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists field_notes_insert_by_membership on public.field_notes;
create policy field_notes_insert_by_membership
on public.field_notes
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists field_notes_update_by_membership on public.field_notes;
create policy field_notes_update_by_membership
on public.field_notes
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.field_notes is 'Canonical organization-scoped execution notes attached to daily logs for field observations, blockers, issues, and punch-list-ready scaffolding.';
comment on column public.field_notes.daily_log_id is 'Required canonical parent so field execution notes stay attached to a project-day log instead of becoming a standalone subsystem.';
comment on column public.field_notes.note_type is 'Structured execution note category used instead of separate issue, blocker, or punch-list tables in the foundation slice.';
comment on column public.field_notes.visibility is 'Currently internal-only to preserve one canonical field note model before customer-facing execution reporting exists.';
