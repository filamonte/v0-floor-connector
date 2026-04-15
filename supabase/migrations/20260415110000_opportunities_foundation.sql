do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'opportunity_status'
  ) then
    create type public.opportunity_status as enum (
      'new',
      'contacted',
      'qualified',
      'site_assessment_scheduled',
      'site_assessment_complete',
      'estimating',
      'proposal_sent',
      'won',
      'lost',
      'converted'
    );
  end if;
end
$$;

create unique index if not exists projects_company_id_id_unique_idx
  on public.projects (company_id, id);

create table if not exists public.opportunities (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid,
  project_id uuid,
  status public.opportunity_status not null default 'new',
  title text not null,
  source text,
  service_type text,
  prospect_name text not null,
  prospect_company_name text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text,
  notes text,
  qualified_at timestamptz,
  converted_at timestamptz,
  lost_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint opportunities_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete set null,
  constraint opportunities_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete set null
);

create index if not exists opportunities_company_id_idx
  on public.opportunities (company_id);

create index if not exists opportunities_status_idx
  on public.opportunities (company_id, status);

create index if not exists opportunities_customer_id_idx
  on public.opportunities (customer_id)
  where customer_id is not null;

create index if not exists opportunities_project_id_idx
  on public.opportunities (project_id)
  where project_id is not null;

create index if not exists opportunities_title_idx
  on public.opportunities (company_id, lower(title));

create index if not exists opportunities_prospect_name_idx
  on public.opportunities (company_id, lower(prospect_name));

drop trigger if exists set_opportunities_updated_at on public.opportunities;

create trigger set_opportunities_updated_at
before update on public.opportunities
for each row
execute function public.set_updated_at();

alter table public.opportunities enable row level security;
alter table public.opportunities force row level security;

drop policy if exists opportunities_select_by_membership on public.opportunities;
create policy opportunities_select_by_membership
on public.opportunities
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists opportunities_insert_by_membership on public.opportunities;
create policy opportunities_insert_by_membership
on public.opportunities
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunities_update_by_membership on public.opportunities;
create policy opportunities_update_by_membership
on public.opportunities
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.opportunities is 'Canonical organization-scoped opportunity table for pre-project sales intake and conversion into project and estimate workflows.';
comment on column public.opportunities.customer_id is 'Optional linked canonical customer created or attached during opportunity qualification.';
comment on column public.opportunities.project_id is 'Optional linked canonical project created when the opportunity moves into estimating or active delivery.';
comment on column public.opportunities.converted_at is 'Timestamp for when the opportunity first created or linked the canonical project/customer chain used by downstream workflows.';
