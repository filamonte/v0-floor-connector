create table if not exists public.organization_responsibility_role_defaults (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.companies(id) on delete cascade,
  role_key text not null,
  person_id uuid not null,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_responsibility_role_defaults_unique_role
    unique (organization_id, role_key),
  constraint organization_responsibility_role_defaults_role_key_check
    check (role_key in ('estimator', 'project_manager', 'billing_owner', 'scheduler')),
  constraint organization_responsibility_role_defaults_person_fkey
    foreign key (organization_id, person_id)
    references public.people(company_id, id)
    on delete cascade
);

create index if not exists organization_responsibility_role_defaults_org_idx
  on public.organization_responsibility_role_defaults(organization_id);

create index if not exists organization_responsibility_role_defaults_person_idx
  on public.organization_responsibility_role_defaults(organization_id, person_id);

drop trigger if exists set_organization_responsibility_role_defaults_updated_at
  on public.organization_responsibility_role_defaults;
create trigger set_organization_responsibility_role_defaults_updated_at
before update on public.organization_responsibility_role_defaults
for each row
execute function public.set_updated_at();

alter table public.organization_responsibility_role_defaults enable row level security;
alter table public.organization_responsibility_role_defaults force row level security;

drop policy if exists organization_responsibility_role_defaults_select_by_membership
  on public.organization_responsibility_role_defaults;
create policy organization_responsibility_role_defaults_select_by_membership
on public.organization_responsibility_role_defaults
for select
to authenticated
using ((select public.is_active_company_member(organization_id)));

drop policy if exists organization_responsibility_role_defaults_insert_by_admin_scope
  on public.organization_responsibility_role_defaults;
create policy organization_responsibility_role_defaults_insert_by_admin_scope
on public.organization_responsibility_role_defaults
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_responsibility_role_defaults.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists organization_responsibility_role_defaults_update_by_admin_scope
  on public.organization_responsibility_role_defaults;
create policy organization_responsibility_role_defaults_update_by_admin_scope
on public.organization_responsibility_role_defaults
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_responsibility_role_defaults.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_responsibility_role_defaults.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists organization_responsibility_role_defaults_delete_by_admin_scope
  on public.organization_responsibility_role_defaults;
create policy organization_responsibility_role_defaults_delete_by_admin_scope
on public.organization_responsibility_role_defaults
for delete
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_responsibility_role_defaults.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

grant select, insert, update, delete
on public.organization_responsibility_role_defaults
to authenticated;

comment on table public.organization_responsibility_role_defaults is
  'Tenant-owned People-first defaults that map built-in operational responsibility role strategies to active assignable people. These rows are role configuration only and do not create tasks, cue instances, or record assignments.';

comment on column public.organization_responsibility_role_defaults.role_key is
  'Built-in operational responsibility role key. Starter roles are estimator, project_manager, billing_owner, and scheduler.';

comment on column public.organization_responsibility_role_defaults.person_id is
  'Responsible workforce person for the role default. Active and assignable person validation is enforced by server helpers; linked app user resolution is derived from people.membership_user_id when present.';
