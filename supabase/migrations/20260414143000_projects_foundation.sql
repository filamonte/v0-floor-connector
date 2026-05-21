do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'project_status'
  ) then
    create type public.project_status as enum (
      'lead',
      'estimating',
      'approved',
      'scheduled',
      'in_progress',
      'completed'
    );
  end if;
end
$$;

create unique index if not exists customers_company_id_id_unique_idx
  on public.customers (company_id, id);

create table if not exists public.projects (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  name text not null,
  status public.project_status not null default 'lead',
  description text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint projects_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict
);

create index if not exists projects_company_id_idx
  on public.projects (company_id);

create index if not exists projects_customer_id_idx
  on public.projects (customer_id);

create index if not exists projects_status_idx
  on public.projects (company_id, status);

create index if not exists projects_name_idx
  on public.projects (company_id, lower(name));

drop trigger if exists set_projects_updated_at on public.projects;

create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.projects force row level security;

drop policy if exists projects_select_by_membership on public.projects;
create policy projects_select_by_membership
on public.projects
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists projects_insert_by_membership on public.projects;
create policy projects_insert_by_membership
on public.projects
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists projects_update_by_membership on public.projects;
create policy projects_update_by_membership
on public.projects
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.projects is 'Canonical organization-scoped project table linked to customers for contractor workflows.';
comment on column public.projects.customer_id is 'Customer associated with the project within the same organization.';
comment on column public.projects.description is 'Starter project description or scope notes.';
