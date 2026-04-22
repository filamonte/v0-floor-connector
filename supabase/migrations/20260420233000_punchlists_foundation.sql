do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'punchlist_status'
  ) then
    create type public.punchlist_status as enum (
      'open',
      'in_progress',
      'resolved',
      'closed'
    );
  end if;
end
$$;

create table if not exists public.punchlist_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  assignee_person_id uuid references public.people(id) on delete set null,
  title text not null,
  details text,
  due_date date,
  status public.punchlist_status not null default 'open',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists punchlist_items_company_id_idx
  on public.punchlist_items (company_id);

create index if not exists punchlist_items_company_project_idx
  on public.punchlist_items (company_id, project_id, created_at desc);

create index if not exists punchlist_items_company_job_idx
  on public.punchlist_items (company_id, job_id, created_at desc)
  where job_id is not null;

create index if not exists punchlist_items_company_assignee_idx
  on public.punchlist_items (company_id, assignee_person_id, created_at desc)
  where assignee_person_id is not null;

create index if not exists punchlist_items_company_status_idx
  on public.punchlist_items (company_id, status, due_date asc nulls last, created_at desc);

create index if not exists punchlist_items_company_due_date_idx
  on public.punchlist_items (company_id, due_date asc nulls last);

drop trigger if exists set_punchlist_items_updated_at on public.punchlist_items;

create trigger set_punchlist_items_updated_at
before update on public.punchlist_items
for each row
execute function public.set_updated_at();

alter table public.punchlist_items enable row level security;
alter table public.punchlist_items force row level security;

drop policy if exists punchlist_items_select_by_membership on public.punchlist_items;
create policy punchlist_items_select_by_membership
on public.punchlist_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists punchlist_items_insert_by_membership on public.punchlist_items;
create policy punchlist_items_insert_by_membership
on public.punchlist_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists punchlist_items_update_by_membership on public.punchlist_items;
create policy punchlist_items_update_by_membership
on public.punchlist_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.punchlist_items is 'Canonical organization-scoped project closeout and corrective-work items tied to the shared project and optional job execution chain.';
comment on column public.punchlist_items.project_id is 'Required project root so punchlist work stays on the same canonical execution chain as jobs, invoices, and closeout.';
comment on column public.punchlist_items.job_id is 'Optional job linkage when a punchlist item belongs to a specific execution record without becoming a separate job-only subsystem.';
comment on column public.punchlist_items.assignee_person_id is 'Optional responsible workforce person on the same canonical people model.';
comment on column public.punchlist_items.details is 'Durable corrective-work detail kept separate from daily-log narrative notes so project closeout items survive beyond a single project day.';
