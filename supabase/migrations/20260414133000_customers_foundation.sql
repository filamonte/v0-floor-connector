create table if not exists public.customers (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  company_name text,
  phone text,
  email text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customers_company_id_idx
  on public.customers (company_id);

create index if not exists customers_company_name_idx
  on public.customers (company_id, lower(company_name))
  where company_name is not null;

create index if not exists customers_name_idx
  on public.customers (company_id, lower(name));

create index if not exists customers_email_idx
  on public.customers (company_id, lower(email))
  where email is not null;

drop trigger if exists set_customers_updated_at on public.customers;

create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.customers force row level security;

drop policy if exists customers_select_by_membership on public.customers;
create policy customers_select_by_membership
on public.customers
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists customers_insert_by_membership on public.customers;
create policy customers_insert_by_membership
on public.customers
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists customers_update_by_membership on public.customers;
create policy customers_update_by_membership
on public.customers
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.customers is 'Canonical organization-scoped customer table for contractor-managed customer records.';
comment on column public.customers.company_id is 'Owning organization/company tenant for the customer record.';
comment on column public.customers.company_name is 'Optional company or business name associated with the customer.';
comment on column public.customers.notes is 'Freeform internal notes about the customer.';
