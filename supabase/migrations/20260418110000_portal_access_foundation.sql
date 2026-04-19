do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'portal_access_grant_status'
  ) then
    create type public.portal_access_grant_status as enum (
      'invited',
      'active',
      'revoked'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'portal_project_access_status'
  ) then
    create type public.portal_project_access_status as enum (
      'active',
      'revoked'
    );
  end if;
end
$$;

create unique index if not exists projects_company_id_id_unique_idx
  on public.projects (company_id, id);

create table if not exists public.portal_access_grants (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  user_id uuid not null references public.users(id) on delete cascade,
  status public.portal_access_grant_status not null default 'invited',
  invited_email text,
  invited_by uuid references public.users(id) on delete set null,
  activated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint portal_access_grants_company_customer_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint portal_access_grants_company_customer_user_unique
    unique (company_id, customer_id, user_id),
  constraint portal_access_grants_activated_at_check check (
    status <> 'active' or activated_at is not null
  ),
  constraint portal_access_grants_revoked_at_check check (
    status <> 'revoked' or revoked_at is not null
  )
);

create unique index if not exists portal_access_grants_company_id_id_unique_idx
  on public.portal_access_grants (company_id, id);

create index if not exists portal_access_grants_company_customer_idx
  on public.portal_access_grants (company_id, customer_id);

create index if not exists portal_access_grants_company_user_idx
  on public.portal_access_grants (company_id, user_id);

create index if not exists portal_access_grants_user_status_idx
  on public.portal_access_grants (user_id, status);

create index if not exists portal_access_grants_company_invited_email_idx
  on public.portal_access_grants (company_id, lower(invited_email))
  where invited_email is not null;

drop trigger if exists set_portal_access_grants_updated_at on public.portal_access_grants;

create trigger set_portal_access_grants_updated_at
before update on public.portal_access_grants
for each row
execute function public.set_updated_at();

create table if not exists public.portal_project_access (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  portal_access_grant_id uuid not null,
  project_id uuid not null,
  status public.portal_project_access_status not null default 'active',
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint portal_project_access_company_grant_fkey
    foreign key (company_id, portal_access_grant_id)
    references public.portal_access_grants(company_id, id)
    on delete cascade,
  constraint portal_project_access_company_project_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint portal_project_access_grant_project_unique
    unique (portal_access_grant_id, project_id),
  constraint portal_project_access_revoked_at_check check (
    status <> 'revoked' or revoked_at is not null
  )
);

create index if not exists portal_project_access_company_grant_idx
  on public.portal_project_access (company_id, portal_access_grant_id);

create index if not exists portal_project_access_company_project_idx
  on public.portal_project_access (company_id, project_id);

create index if not exists portal_project_access_status_idx
  on public.portal_project_access (company_id, status);

drop trigger if exists set_portal_project_access_updated_at on public.portal_project_access;

create trigger set_portal_project_access_updated_at
before update on public.portal_project_access
for each row
execute function public.set_updated_at();

create or replace function public.has_active_portal_customer_access(
  target_company_id uuid,
  target_customer_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_access_grants grant_record
    where grant_record.company_id = target_company_id
      and grant_record.customer_id = target_customer_id
      and grant_record.user_id = (select auth.uid())
      and grant_record.status = 'active'
  )
$$;

comment on function public.has_active_portal_customer_access(uuid, uuid) is 'Returns whether the authenticated portal user has active customer-scoped portal access for the selected tenant customer record.';

create or replace function public.has_active_portal_project_access(
  target_company_id uuid,
  target_project_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_project_access project_access
    join public.portal_access_grants grant_record
      on grant_record.id = project_access.portal_access_grant_id
     and grant_record.company_id = project_access.company_id
    where project_access.company_id = target_company_id
      and project_access.project_id = target_project_id
      and project_access.status = 'active'
      and grant_record.status = 'active'
      and grant_record.user_id = (select auth.uid())
  )
$$;

comment on function public.has_active_portal_project_access(uuid, uuid) is 'Returns whether the authenticated portal user has active project-scoped portal access for the selected tenant project record.';

alter table public.portal_access_grants enable row level security;
alter table public.portal_access_grants force row level security;

drop policy if exists portal_access_grants_select_by_scope on public.portal_access_grants;
create policy portal_access_grants_select_by_scope
on public.portal_access_grants
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or user_id = (select auth.uid())
);

drop policy if exists portal_access_grants_insert_by_membership on public.portal_access_grants;
create policy portal_access_grants_insert_by_membership
on public.portal_access_grants
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists portal_access_grants_update_by_membership on public.portal_access_grants;
create policy portal_access_grants_update_by_membership
on public.portal_access_grants
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.portal_project_access enable row level security;
alter table public.portal_project_access force row level security;

drop policy if exists portal_project_access_select_by_scope on public.portal_project_access;
create policy portal_project_access_select_by_scope
on public.portal_project_access
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or exists (
    select 1
    from public.portal_access_grants grant_record
    where grant_record.company_id = portal_project_access.company_id
      and grant_record.id = portal_project_access.portal_access_grant_id
      and grant_record.user_id = (select auth.uid())
      and grant_record.status = 'active'
  )
);

drop policy if exists portal_project_access_insert_by_membership on public.portal_project_access;
create policy portal_project_access_insert_by_membership
on public.portal_project_access
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists portal_project_access_update_by_membership on public.portal_project_access;
create policy portal_project_access_update_by_membership
on public.portal_project_access
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.portal_access_grants is 'Canonical customer-anchored portal access grants connecting authenticated users to tenant customer records without duplicating customer identities.';
comment on table public.portal_project_access is 'Canonical project-level visibility grants beneath a customer portal access grant so portal users only see explicitly granted tenant projects.';
comment on column public.portal_access_grants.customer_id is 'Canonical customer anchor for the portal user within the same tenant organization.';
comment on column public.portal_access_grants.user_id is 'Authenticated application user receiving portal access to the selected canonical customer.';
comment on column public.portal_access_grants.invited_email is 'Optional invited email captured for audit and contractor-side access management before or during activation.';
comment on column public.portal_project_access.portal_access_grant_id is 'Parent customer-scoped portal access grant that owns this project visibility record.';
comment on column public.portal_project_access.project_id is 'Explicitly granted canonical project visible to the portal user beneath the customer-scoped grant.';
