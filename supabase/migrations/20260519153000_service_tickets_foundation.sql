create table if not exists public.service_tickets (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  source_type text not null default 'internal',
  ticket_type text not null default 'warranty',
  status text not null default 'open',
  priority text not null default 'normal',
  title text not null,
  description text,
  reported_on date not null default current_date,
  warranty_start_date date,
  warranty_end_date date,
  warranty_basis text,
  resolution_summary text,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint service_tickets_source_type_check check (
    source_type in (
      'internal',
      'closeout_follow_up',
      'punchlist_conversion',
      'customer_reported_future',
      'other'
    )
  ),
  constraint service_tickets_ticket_type_check check (
    ticket_type in ('warranty', 'service', 'callback', 'inspection', 'other')
  ),
  constraint service_tickets_status_check check (
    status in ('open', 'scheduled', 'in_progress', 'resolved', 'closed', 'canceled')
  ),
  constraint service_tickets_priority_check check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  constraint service_tickets_title_check check (length(trim(title)) > 0),
  constraint service_tickets_warranty_date_order_check check (
    warranty_start_date is null or warranty_end_date is null or warranty_end_date >= warranty_start_date
  ),
  constraint service_tickets_resolved_at_check check (
    status not in ('resolved', 'closed') or resolved_at is not null
  ),
  constraint service_tickets_closed_at_check check (
    status <> 'closed' or closed_at is not null
  )
);

create index if not exists service_tickets_company_id_idx
  on public.service_tickets (company_id);

create index if not exists service_tickets_company_status_idx
  on public.service_tickets (company_id, status);

create index if not exists service_tickets_company_ticket_type_idx
  on public.service_tickets (company_id, ticket_type);

create index if not exists service_tickets_company_priority_idx
  on public.service_tickets (company_id, priority);

create index if not exists service_tickets_company_customer_idx
  on public.service_tickets (company_id, customer_id);

create index if not exists service_tickets_company_project_idx
  on public.service_tickets (company_id, project_id)
  where project_id is not null;

create index if not exists service_tickets_company_job_idx
  on public.service_tickets (company_id, job_id)
  where job_id is not null;

create index if not exists service_tickets_company_reported_on_idx
  on public.service_tickets (company_id, reported_on desc);

drop trigger if exists set_service_tickets_updated_at on public.service_tickets;

create trigger set_service_tickets_updated_at
before update on public.service_tickets
for each row
execute function public.set_updated_at();

create or replace function public.validate_service_ticket_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_company_id uuid;
  project_company_id uuid;
  project_customer_id uuid;
  job_company_id uuid;
  job_project_id uuid;
begin
  select customer.company_id
    into customer_company_id
  from public.customers customer
  where customer.id = new.customer_id;

  if customer_company_id is null or customer_company_id <> new.company_id then
    raise exception 'Service ticket customer must belong to the same company.';
  end if;

  if new.project_id is not null then
    select project.company_id, project.customer_id
      into project_company_id, project_customer_id
    from public.projects project
    where project.id = new.project_id;

    if project_company_id is null or project_company_id <> new.company_id then
      raise exception 'Service ticket project must belong to the same company.';
    end if;

    if project_customer_id <> new.customer_id then
      raise exception 'Service ticket project must belong to the selected customer.';
    end if;
  end if;

  if new.job_id is not null then
    select job.company_id, job.project_id
      into job_company_id, job_project_id
    from public.jobs job
    where job.id = new.job_id;

    if job_company_id is null or job_company_id <> new.company_id then
      raise exception 'Service ticket job must belong to the same company.';
    end if;

    if new.project_id is not null and job_project_id <> new.project_id then
      raise exception 'Service ticket job must belong to the selected project.';
    end if;

    if new.project_id is null then
      new.project_id := job_project_id;
    end if;
  end if;

  if new.project_id is not null then
    select project.company_id, project.customer_id
      into project_company_id, project_customer_id
    from public.projects project
    where project.id = new.project_id;

    if project_company_id is null or project_company_id <> new.company_id then
      raise exception 'Service ticket project must belong to the same company.';
    end if;

    if project_customer_id <> new.customer_id then
      raise exception 'Service ticket project must belong to the selected customer.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_service_ticket_relationships_trigger on public.service_tickets;

create trigger validate_service_ticket_relationships_trigger
before insert or update on public.service_tickets
for each row
execute function public.validate_service_ticket_relationships();

alter table public.service_tickets enable row level security;
alter table public.service_tickets force row level security;

drop policy if exists service_tickets_select_by_membership on public.service_tickets;
create policy service_tickets_select_by_membership
on public.service_tickets
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists service_tickets_insert_by_manager on public.service_tickets;
create policy service_tickets_insert_by_manager
on public.service_tickets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = service_tickets.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

drop policy if exists service_tickets_update_by_manager on public.service_tickets;
create policy service_tickets_update_by_manager
on public.service_tickets
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = service_tickets.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = service_tickets.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

comment on table public.service_tickets is 'Canonical tenant-scoped service and warranty tickets tied to customers, projects, and jobs. Not a detached helpdesk.';
comment on column public.service_tickets.source_type is 'Internal source classification. Future portal customer reports should still create shared service tickets, not portal-only records.';
comment on column public.service_tickets.ticket_type is 'Classifies warranty, service, callback, inspection, or other post-installation continuity work.';
comment on column public.service_tickets.warranty_basis is 'Human-readable warranty basis or coverage note. Warranty PDFs/signatures are future records.';
