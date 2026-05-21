create unique index if not exists opportunities_company_id_id_unique_idx
  on public.opportunities (company_id, id);

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'contact_kind'
  ) then
    create type public.contact_kind as enum (
      'customer_contact',
      'billing_contact',
      'portal_contact',
      'vendor_contact',
      'employee',
      'general_inquiry'
    );
  end if;
end
$$;

create table if not exists public.contacts (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  display_name text not null,
  company_name text,
  email text,
  phone text,
  contact_kind public.contact_kind not null default 'customer_contact',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists contacts_company_id_id_unique_idx
  on public.contacts (company_id, id);

create index if not exists contacts_company_id_idx
  on public.contacts (company_id);

create index if not exists contacts_company_display_name_idx
  on public.contacts (company_id, lower(display_name));

create index if not exists contacts_company_email_idx
  on public.contacts (company_id, lower(email))
  where email is not null;

drop trigger if exists set_contacts_updated_at on public.contacts;

create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

alter table public.contacts enable row level security;
alter table public.contacts force row level security;

drop policy if exists contacts_select_by_membership on public.contacts;
create policy contacts_select_by_membership
on public.contacts
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contacts_insert_by_membership on public.contacts;
create policy contacts_insert_by_membership
on public.contacts
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists contacts_update_by_membership on public.contacts;
create policy contacts_update_by_membership
on public.contacts
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create table if not exists public.customer_contacts (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  contact_id uuid not null,
  relationship_label text,
  is_primary boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint customer_contacts_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint customer_contacts_contact_company_fkey
    foreign key (company_id, contact_id)
    references public.contacts(company_id, id)
    on delete cascade
);

create unique index if not exists customer_contacts_company_customer_contact_unique_idx
  on public.customer_contacts (company_id, customer_id, contact_id);

create index if not exists customer_contacts_company_customer_idx
  on public.customer_contacts (company_id, customer_id);

create index if not exists customer_contacts_company_contact_idx
  on public.customer_contacts (company_id, contact_id);

drop trigger if exists set_customer_contacts_updated_at on public.customer_contacts;

create trigger set_customer_contacts_updated_at
before update on public.customer_contacts
for each row
execute function public.set_updated_at();

alter table public.customer_contacts enable row level security;
alter table public.customer_contacts force row level security;

drop policy if exists customer_contacts_select_by_membership on public.customer_contacts;
create policy customer_contacts_select_by_membership
on public.customer_contacts
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists customer_contacts_insert_by_membership on public.customer_contacts;
create policy customer_contacts_insert_by_membership
on public.customer_contacts
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists customer_contacts_update_by_membership on public.customer_contacts;
create policy customer_contacts_update_by_membership
on public.customer_contacts
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.opportunities
  add column if not exists primary_contact_id uuid,
  add column if not exists site_name text,
  add column if not exists job_type text,
  add column if not exists source_detail text;

alter table public.opportunities
  drop constraint if exists opportunities_primary_contact_company_fkey;

alter table public.opportunities
  add constraint opportunities_primary_contact_company_fkey
    foreign key (company_id, primary_contact_id)
    references public.contacts(company_id, id)
    on delete set null;

create index if not exists opportunities_primary_contact_id_idx
  on public.opportunities (company_id, primary_contact_id)
  where primary_contact_id is not null;

create table if not exists public.opportunity_measurements (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid not null,
  area_label text,
  measurement_type text not null,
  value_numeric numeric(12, 2) not null,
  unit text not null,
  quantity integer,
  capture_method text,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint opportunity_measurements_opportunity_company_fkey
    foreign key (company_id, opportunity_id)
    references public.opportunities(company_id, id)
    on delete cascade
);

create index if not exists opportunity_measurements_company_opportunity_idx
  on public.opportunity_measurements (company_id, opportunity_id, created_at asc);

drop trigger if exists set_opportunity_measurements_updated_at on public.opportunity_measurements;

create trigger set_opportunity_measurements_updated_at
before update on public.opportunity_measurements
for each row
execute function public.set_updated_at();

alter table public.opportunity_measurements enable row level security;
alter table public.opportunity_measurements force row level security;

drop policy if exists opportunity_measurements_select_by_membership on public.opportunity_measurements;
create policy opportunity_measurements_select_by_membership
on public.opportunity_measurements
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_measurements_insert_by_membership on public.opportunity_measurements;
create policy opportunity_measurements_insert_by_membership
on public.opportunity_measurements
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_measurements_update_by_membership on public.opportunity_measurements;
create policy opportunity_measurements_update_by_membership
on public.opportunity_measurements
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_measurements_delete_by_membership on public.opportunity_measurements;
create policy opportunity_measurements_delete_by_membership
on public.opportunity_measurements
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

create table if not exists public.opportunity_attachments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid not null,
  attachment_type text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  caption text,
  tag text,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint opportunity_attachments_opportunity_company_fkey
    foreign key (company_id, opportunity_id)
    references public.opportunities(company_id, id)
    on delete cascade
);

create index if not exists opportunity_attachments_company_opportunity_idx
  on public.opportunity_attachments (company_id, opportunity_id, created_at desc);

drop trigger if exists set_opportunity_attachments_updated_at on public.opportunity_attachments;

create trigger set_opportunity_attachments_updated_at
before update on public.opportunity_attachments
for each row
execute function public.set_updated_at();

alter table public.opportunity_attachments enable row level security;
alter table public.opportunity_attachments force row level security;

drop policy if exists opportunity_attachments_select_by_membership on public.opportunity_attachments;
create policy opportunity_attachments_select_by_membership
on public.opportunity_attachments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_attachments_insert_by_membership on public.opportunity_attachments;
create policy opportunity_attachments_insert_by_membership
on public.opportunity_attachments
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_attachments_update_by_membership on public.opportunity_attachments;
create policy opportunity_attachments_update_by_membership
on public.opportunity_attachments
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_attachments_delete_by_membership on public.opportunity_attachments;
create policy opportunity_attachments_delete_by_membership
on public.opportunity_attachments
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

create table if not exists public.opportunity_observations (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid not null,
  observation_type text not null,
  title text not null,
  body text,
  severity text,
  related_attachment_id uuid,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint opportunity_observations_opportunity_company_fkey
    foreign key (company_id, opportunity_id)
    references public.opportunities(company_id, id)
    on delete cascade
);

alter table public.opportunity_observations
  drop constraint if exists opportunity_observations_related_attachment_fkey;

alter table public.opportunity_observations
  add constraint opportunity_observations_related_attachment_fkey
    foreign key (related_attachment_id)
    references public.opportunity_attachments(id)
    on delete set null;

create index if not exists opportunity_observations_company_opportunity_idx
  on public.opportunity_observations (company_id, opportunity_id, created_at asc);

drop trigger if exists set_opportunity_observations_updated_at on public.opportunity_observations;

create trigger set_opportunity_observations_updated_at
before update on public.opportunity_observations
for each row
execute function public.set_updated_at();

alter table public.opportunity_observations enable row level security;
alter table public.opportunity_observations force row level security;

drop policy if exists opportunity_observations_select_by_membership on public.opportunity_observations;
create policy opportunity_observations_select_by_membership
on public.opportunity_observations
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_observations_insert_by_membership on public.opportunity_observations;
create policy opportunity_observations_insert_by_membership
on public.opportunity_observations
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_observations_update_by_membership on public.opportunity_observations;
create policy opportunity_observations_update_by_membership
on public.opportunity_observations
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists opportunity_observations_delete_by_membership on public.opportunity_observations;
create policy opportunity_observations_delete_by_membership
on public.opportunity_observations
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

alter table public.projects
  add column if not exists operational_activated_at timestamptz;

create index if not exists projects_company_operational_activated_at_idx
  on public.projects (company_id, operational_activated_at desc)
  where operational_activated_at is not null;

create temporary table opportunity_contact_backfill on commit drop as
select
  opportunities.id as opportunity_id,
  opportunities.company_id,
  extensions.gen_random_uuid() as contact_id,
  opportunities.prospect_name as display_name,
  opportunities.prospect_company_name as company_name,
  opportunities.email,
  opportunities.phone,
  opportunities.created_by,
  opportunities.updated_by,
  opportunities.created_at,
  opportunities.updated_at
from public.opportunities
where opportunities.primary_contact_id is null
  and nullif(btrim(opportunities.prospect_name), '') is not null;

insert into public.contacts (
  id,
  company_id,
  display_name,
  company_name,
  email,
  phone,
  contact_kind,
  created_by,
  updated_by,
  created_at,
  updated_at
)
select
  contact_id,
  company_id,
  display_name,
  company_name,
  email,
  phone,
  'customer_contact',
  created_by,
  updated_by,
  created_at,
  updated_at
from opportunity_contact_backfill;

update public.opportunities
set primary_contact_id = backfill.contact_id
from opportunity_contact_backfill as backfill
where public.opportunities.id = backfill.opportunity_id;

insert into public.customer_contacts (
  company_id,
  customer_id,
  contact_id,
  relationship_label,
  is_primary,
  created_by,
  updated_by,
  created_at,
  updated_at
)
select
  opportunities.company_id,
  opportunities.customer_id,
  opportunities.primary_contact_id,
  'primary_opportunity_contact',
  true,
  opportunities.created_by,
  opportunities.updated_by,
  opportunities.created_at,
  opportunities.updated_at
from public.opportunities
where opportunities.customer_id is not null
  and opportunities.primary_contact_id is not null
on conflict (company_id, customer_id, contact_id) do nothing;

insert into public.opportunity_observations (
  company_id,
  opportunity_id,
  observation_type,
  title,
  body,
  created_by,
  updated_by,
  created_at,
  updated_at
)
select
  opportunities.company_id,
  opportunities.id,
  'requirements_summary',
  'Requirements summary',
  opportunities.requirements_summary,
  opportunities.created_by,
  opportunities.updated_by,
  opportunities.created_at,
  opportunities.updated_at
from public.opportunities
where nullif(btrim(opportunities.requirements_summary), '') is not null;

insert into public.opportunity_observations (
  company_id,
  opportunity_id,
  observation_type,
  title,
  body,
  created_by,
  updated_by,
  created_at,
  updated_at
)
select
  opportunities.company_id,
  opportunities.id,
  'internal_note',
  'Internal note',
  opportunities.notes,
  opportunities.created_by,
  opportunities.updated_by,
  opportunities.created_at,
  opportunities.updated_at
from public.opportunities
where nullif(btrim(opportunities.notes), '') is not null;

update public.projects
set operational_activated_at = signed_contracts.signed_at
from (
  select
    company_id,
    project_id,
    min(coalesce(signed_at, updated_at, created_at)) as signed_at
  from public.contracts
  where status = 'signed'
  group by company_id, project_id
) as signed_contracts
where public.projects.company_id = signed_contracts.company_id
  and public.projects.id = signed_contracts.project_id
  and public.projects.operational_activated_at is null;

comment on table public.contacts is 'Canonical organization-scoped contact identity records shared across customer, opportunity, portal, and future mobile intake flows.';
comment on table public.customer_contacts is 'Joins customer accounts to shared contact identities without collapsing accounts and people into a single model.';
comment on column public.opportunities.primary_contact_id is 'Primary durable contact identity for this pre-sale opportunity. Opportunity no longer owns person identity directly.';
comment on column public.opportunities.site_name is 'Optional human-friendly site label for the primary pre-sale location.';
comment on column public.opportunities.job_type is 'Structured request or job context describing the type of work being requested.';
comment on column public.opportunities.source_detail is 'Optional more specific intake source detail such as campaign, referrer, or channel note.';
comment on table public.opportunity_measurements is 'Structured and queryable pre-sale measurement facts linked to a canonical opportunity.';
comment on table public.opportunity_attachments is 'Linked pre-sale photos and files for a canonical opportunity intake record.';
comment on table public.opportunity_observations is 'Structured pre-sale observations captured during intake, qualification, or site assessment.';
comment on column public.projects.operational_activated_at is 'Timestamp marking when the project became operational after contract signature and lifecycle gating.';
