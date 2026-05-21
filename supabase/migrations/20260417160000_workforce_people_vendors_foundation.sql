do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'workforce_person_type'
  ) then
    create type public.workforce_person_type as enum (
      'employee',
      'subcontractor_worker'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'vendor_type'
  ) then
    create type public.vendor_type as enum (
      'subcontractor',
      'supplier',
      'other'
    );
  end if;
end
$$;

create table if not exists public.vendors (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  vendor_type public.vendor_type not null default 'subcontractor',
  is_labor_provider boolean not null default false,
  primary_contact_name text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text,
  tax_identifier_last4 text,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vendors_tax_identifier_last4_check check (
    tax_identifier_last4 is null or tax_identifier_last4 ~ '^[0-9]{4}$'
  )
);

create table if not exists public.people (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  membership_user_id uuid references public.users(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  person_type public.workforce_person_type not null default 'employee',
  display_name text not null,
  first_name text,
  last_name text,
  email text,
  phone text,
  job_title text,
  trade text,
  classification text,
  is_assignable boolean not null default true,
  is_active boolean not null default true,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint people_vendor_type_check check (
    (person_type = 'employee' and vendor_id is null) or
    (person_type = 'subcontractor_worker' and vendor_id is not null)
  )
);

create unique index if not exists vendors_company_name_unique_idx
  on public.vendors (company_id, lower(name));

create index if not exists vendors_company_id_idx
  on public.vendors (company_id);

create index if not exists vendors_company_vendor_type_idx
  on public.vendors (company_id, vendor_type);

create index if not exists vendors_company_is_active_idx
  on public.vendors (company_id, is_active);

create index if not exists vendors_company_is_labor_provider_idx
  on public.vendors (company_id, is_labor_provider);

create index if not exists vendors_company_email_idx
  on public.vendors (company_id, lower(email))
  where email is not null;

create unique index if not exists people_company_membership_user_unique_idx
  on public.people (company_id, membership_user_id)
  where membership_user_id is not null;

create index if not exists people_company_id_idx
  on public.people (company_id);

create index if not exists people_company_person_type_idx
  on public.people (company_id, person_type);

create index if not exists people_company_vendor_id_idx
  on public.people (company_id, vendor_id)
  where vendor_id is not null;

create index if not exists people_company_is_active_idx
  on public.people (company_id, is_active);

create index if not exists people_company_is_assignable_idx
  on public.people (company_id, is_assignable);

create index if not exists people_company_display_name_idx
  on public.people (company_id, lower(display_name));

create index if not exists people_company_email_idx
  on public.people (company_id, lower(email))
  where email is not null;

drop trigger if exists set_vendors_updated_at on public.vendors;

create trigger set_vendors_updated_at
before update on public.vendors
for each row
execute function public.set_updated_at();

drop trigger if exists set_people_updated_at on public.people;

create trigger set_people_updated_at
before update on public.people
for each row
execute function public.set_updated_at();

alter table public.vendors enable row level security;
alter table public.vendors force row level security;

drop policy if exists vendors_select_by_membership on public.vendors;
create policy vendors_select_by_membership
on public.vendors
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists vendors_insert_by_membership on public.vendors;
create policy vendors_insert_by_membership
on public.vendors
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists vendors_update_by_membership on public.vendors;
create policy vendors_update_by_membership
on public.vendors
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.people enable row level security;
alter table public.people force row level security;

drop policy if exists people_select_by_membership on public.people;
create policy people_select_by_membership
on public.people
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists people_insert_by_membership on public.people;
create policy people_insert_by_membership
on public.people
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists people_update_by_membership on public.people;
create policy people_update_by_membership
on public.people
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.vendors is 'Canonical organization-scoped vendor and subcontractor company table for external workforce and supplier relationships.';
comment on table public.people is 'Canonical organization-scoped workforce person table for internal employees and vendor-linked subcontractor workers.';
comment on column public.vendors.is_labor_provider is 'Flags vendor companies that can supply labor participants and future project or job assignments.';
comment on column public.people.membership_user_id is 'Optional linked application user when a workforce person also has a platform login.';
comment on column public.people.vendor_id is 'Required for subcontractor workers and null for internal employees so one people model can cover both workforce types.';
comment on column public.people.is_assignable is 'Foundation flag for future project, job, crew, and time-entry assignment flows.';
