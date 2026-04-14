do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'membership_role'
  ) then
    create type public.membership_role as enum (
      'owner',
      'admin',
      'manager',
      'member'
    );
  end if;
end
$$;

alter table public.company_memberships
  add column if not exists membership_role public.membership_role;

update public.company_memberships membership
set membership_role = case
  when lower(role.key) in ('owner', 'company_owner') then 'owner'::public.membership_role
  when lower(role.key) in ('admin', 'company_admin') then 'admin'::public.membership_role
  when lower(role.key) in ('manager', 'project_manager') then 'manager'::public.membership_role
  else 'member'::public.membership_role
end
from public.roles role
where membership.role_id = role.id
  and membership.membership_role is null;

update public.company_memberships
set membership_role = 'member'::public.membership_role
where membership_role is null;

alter table public.company_memberships
  alter column membership_role set default 'member'::public.membership_role;

alter table public.company_memberships
  alter column membership_role set not null;

create index if not exists company_memberships_membership_role_idx
  on public.company_memberships (company_id, membership_role);

create index if not exists company_memberships_status_user_idx
  on public.company_memberships (user_id, membership_status);

create or replace function public.sync_user_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name_value text := nullif(
    trim(
      coalesce(
        metadata ->> 'full_name',
        metadata ->> 'name',
        metadata ->> 'user_name'
      )
    ),
    ''
  );
  avatar_url_value text := nullif(
    trim(
      coalesce(
        metadata ->> 'avatar_url',
        metadata ->> 'picture'
      )
    ),
    ''
  );
begin
  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    full_name_value,
    avatar_url_value,
    new.last_sign_in_at,
    coalesce(new.created_at, timezone('utc', now())),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

comment on function public.sync_user_profile_from_auth() is 'Keeps the canonical application profile table in sync with auth.users for both OAuth and email/password accounts.';

drop trigger if exists sync_user_profile_from_auth on auth.users;

create trigger sync_user_profile_from_auth
after insert or update on auth.users
for each row
execute function public.sync_user_profile_from_auth();

insert into public.users (
  id,
  email,
  full_name,
  avatar_url,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  auth_user.id,
  auth_user.email,
  nullif(
    trim(
      coalesce(
        auth_user.raw_user_meta_data ->> 'full_name',
        auth_user.raw_user_meta_data ->> 'name',
        auth_user.raw_user_meta_data ->> 'user_name'
      )
    ),
    ''
  ),
  nullif(
    trim(
      coalesce(
        auth_user.raw_user_meta_data ->> 'avatar_url',
        auth_user.raw_user_meta_data ->> 'picture'
      )
    ),
    ''
  ),
  auth_user.last_sign_in_at,
  coalesce(auth_user.created_at, timezone('utc', now())),
  timezone('utc', now())
from auth.users auth_user
left join public.users profile
  on profile.id = auth_user.id
where profile.id is null;

alter table public.users enable row level security;
alter table public.users force row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self
on public.users
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists users_update_self on public.users;
create policy users_update_self
on public.users
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select membership.company_id
  from public.company_memberships membership
  where membership.user_id = (select auth.uid())
    and membership.membership_status = 'active'
  order by case membership.membership_role
    when 'owner' then 1
    when 'admin' then 2
    when 'manager' then 3
    else 4
  end,
  membership.created_at asc
  limit 1
$$;

comment on function public.current_company_id() is 'Returns the authenticated user''s primary active company based on membership role priority.';

create or replace function public.current_company_membership_role(
  target_company_id uuid
)
returns public.membership_role
language sql
stable
security definer
set search_path = ''
as $$
  select membership.membership_role
  from public.company_memberships membership
  where membership.company_id = target_company_id
    and membership.user_id = (select auth.uid())
    and membership.membership_status = 'active'
  order by membership.created_at asc
  limit 1
$$;

comment on function public.current_company_membership_role(uuid) is 'Returns the authenticated user''s active membership role for a company.';

comment on table public.users is 'Canonical profile extension table aligned one-to-one with auth.users for both Google OAuth and email/password accounts.';
comment on table public.companies is 'Canonical organization or company-account tenant table.';
comment on table public.company_memberships is 'Canonical membership table linking a profile to an organization/company account with a simple role and membership status.';
comment on column public.company_memberships.membership_role is 'Role-safe tenant membership value used by the app foundation: owner, admin, manager, or member.';
