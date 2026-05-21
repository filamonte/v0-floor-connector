do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'estimate_status'
  ) then
    create type public.estimate_status as enum (
      'draft',
      'sent',
      'approved',
      'rejected'
    );
  end if;
end
$$;

create unique index if not exists projects_company_id_id_unique_idx
  on public.projects (company_id, id);

create or replace function public.generate_estimate_reference_number(
  target_company_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_number integer;
  candidate text;
begin
  perform pg_advisory_xact_lock(hashtextextended(target_company_id::text, 0));

  select count(*)::integer + 1
  into next_number
  from public.estimates
  where company_id = target_company_id;

  loop
    candidate := 'EST-' || lpad(next_number::text, 4, '0');

    exit when not exists (
      select 1
      from public.estimates
      where company_id = target_company_id
        and lower(reference_number) = lower(candidate)
    );

    next_number := next_number + 1;
  end loop;

  return candidate;
end;
$$;

create table if not exists public.estimates (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  reference_number text not null,
  status public.estimate_status not null default 'draft',
  subtotal_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint estimates_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint estimates_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint estimates_amounts_nonnegative_check
    check (
      subtotal_amount >= 0
      and tax_amount >= 0
      and discount_amount >= 0
      and total_amount >= 0
    )
);

create unique index if not exists estimates_company_reference_unique_idx
  on public.estimates (company_id, lower(reference_number));

create index if not exists estimates_company_id_idx
  on public.estimates (company_id);

create index if not exists estimates_project_id_idx
  on public.estimates (project_id);

create index if not exists estimates_customer_id_idx
  on public.estimates (customer_id);

create index if not exists estimates_status_idx
  on public.estimates (company_id, status);

create or replace function public.assign_estimate_reference_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reference_number is null or btrim(new.reference_number) = '' then
    new.reference_number := public.generate_estimate_reference_number(new.company_id);
  end if;

  return new;
end;
$$;

drop trigger if exists assign_estimate_reference_number on public.estimates;

create trigger assign_estimate_reference_number
before insert on public.estimates
for each row
execute function public.assign_estimate_reference_number();

drop trigger if exists set_estimates_updated_at on public.estimates;

create trigger set_estimates_updated_at
before update on public.estimates
for each row
execute function public.set_updated_at();

alter table public.estimates enable row level security;
alter table public.estimates force row level security;

drop policy if exists estimates_select_by_membership on public.estimates;
create policy estimates_select_by_membership
on public.estimates
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimates_insert_by_membership on public.estimates;
create policy estimates_insert_by_membership
on public.estimates
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimates_update_by_membership on public.estimates;
create policy estimates_update_by_membership
on public.estimates
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.estimates is 'Canonical organization-scoped estimate table linked to projects and customers for contractor estimating workflows.';
comment on column public.estimates.reference_number is 'Organization-scoped estimate reference assigned automatically when not provided.';
