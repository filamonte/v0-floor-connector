create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

create or replace function public.is_active_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = target_company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
  );
$$;

create or replace function public.can_access_company_membership(
  target_company_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    target_user_id = (select auth.uid())
    or public.is_active_company_member(target_company_id)
$$;

comment on function public.current_user_id() is 'Returns the authenticated Supabase user UUID for policy reuse.';
comment on function public.is_active_company_member(uuid) is 'Checks whether the authenticated user has an active membership in the target company.';
comment on function public.can_access_company_membership(uuid, uuid) is 'Allows a user to see their own membership row or any membership inside a company where they are already active.';

alter table public.companies enable row level security;
alter table public.companies force row level security;

alter table public.locations enable row level security;
alter table public.locations force row level security;

alter table public.company_memberships enable row level security;
alter table public.company_memberships force row level security;

alter table public.roles enable row level security;
alter table public.roles force row level security;

alter table public.feature_flags enable row level security;
alter table public.feature_flags force row level security;

alter table public.company_subscriptions enable row level security;
alter table public.company_subscriptions force row level security;

drop policy if exists companies_select_by_membership on public.companies;
create policy companies_select_by_membership
on public.companies
for select
to authenticated
using ((select public.is_active_company_member(id)));

drop policy if exists locations_select_by_membership on public.locations;
create policy locations_select_by_membership
on public.locations
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists company_memberships_select_by_membership on public.company_memberships;
create policy company_memberships_select_by_membership
on public.company_memberships
for select
to authenticated
using ((select public.can_access_company_membership(company_id, user_id)));

drop policy if exists roles_select_by_membership on public.roles;
create policy roles_select_by_membership
on public.roles
for select
to authenticated
using (
  company_id is not null
  and (select public.is_active_company_member(company_id))
);

drop policy if exists feature_flags_select_by_membership on public.feature_flags;
create policy feature_flags_select_by_membership
on public.feature_flags
for select
to authenticated
using (
  company_id is not null
  and (select public.is_active_company_member(company_id))
);

drop policy if exists company_subscriptions_select_by_membership on public.company_subscriptions;
create policy company_subscriptions_select_by_membership
on public.company_subscriptions
for select
to authenticated
using ((select public.is_active_company_member(company_id)));
