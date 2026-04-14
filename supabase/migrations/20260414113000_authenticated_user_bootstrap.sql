create or replace function public.bootstrap_authenticated_user()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  auth_user auth.users%rowtype;
  metadata jsonb;
  profile_full_name text;
  profile_avatar_url text;
  base_name text;
  company_name text;
  slug_base text;
  candidate_slug text;
  slug_suffix integer := 0;
  existing_membership public.company_memberships%rowtype;
  company_id uuid;
  owner_role_id uuid;
  membership_id uuid;
  created_company boolean := false;
  initialized boolean := false;
begin
  if current_user_id is null then
    raise exception 'Authenticated user context is required for bootstrap.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  select *
  into auth_user
  from auth.users
  where id = current_user_id;

  if not found then
    raise exception 'Authenticated user % was not found in auth.users.', current_user_id;
  end if;

  metadata := coalesce(auth_user.raw_user_meta_data, '{}'::jsonb);
  profile_full_name := nullif(
    trim(
      coalesce(
        metadata ->> 'full_name',
        metadata ->> 'name',
        metadata ->> 'user_name'
      )
    ),
    ''
  );
  profile_avatar_url := nullif(
    trim(
      coalesce(
        metadata ->> 'avatar_url',
        metadata ->> 'picture'
      )
    ),
    ''
  );

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
    auth_user.id,
    auth_user.email,
    profile_full_name,
    profile_avatar_url,
    auth_user.last_sign_in_at,
    coalesce(auth_user.created_at, timezone('utc', now())),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = timezone('utc', now());

  select *
  into existing_membership
  from public.company_memberships membership
  where membership.user_id = current_user_id
  order by
    case membership.membership_status
      when 'active' then 0
      when 'invited' then 1
      when 'inactive' then 2
      else 3
    end,
    case membership.membership_role
      when 'owner' then 0
      when 'admin' then 1
      when 'manager' then 2
      else 3
    end,
    membership.created_at asc
  limit 1;

  if found then
    return jsonb_build_object(
      'user_id', current_user_id,
      'company_id', existing_membership.company_id,
      'membership_id', existing_membership.id,
      'membership_role', existing_membership.membership_role,
      'membership_status', existing_membership.membership_status,
      'was_initialized', false,
      'created_company', false
    );
  end if;

  initialized := true;

  base_name := nullif(
    trim(
      coalesce(
        metadata ->> 'company_name',
        metadata ->> 'organization_name',
        metadata ->> 'business_name',
        profile_full_name,
        split_part(coalesce(auth_user.email, ''), '@', 1)
      )
    ),
    ''
  );

  company_name := coalesce(base_name, 'FloorConnector Organization');
  slug_base := nullif(
    trim(
      both '-'
      from regexp_replace(lower(company_name), '[^a-z0-9]+', '-', 'g')
    ),
    ''
  );
  candidate_slug := coalesce(slug_base, 'organization');

  loop
    begin
      insert into public.companies (
        slug,
        legal_name,
        display_name,
        primary_contact_user_id,
        created_by,
        updated_by
      )
      values (
        candidate_slug,
        company_name,
        company_name,
        current_user_id,
        current_user_id,
        current_user_id
      )
      returning id into company_id;

      created_company := true;
      exit;
    exception
      when unique_violation then
        slug_suffix := slug_suffix + 1;
        candidate_slug := coalesce(slug_base, 'organization') || '-' || slug_suffix::text;
    end;
  end loop;

  insert into public.roles (
    company_id,
    key,
    name,
    description,
    scope,
    is_system,
    created_by,
    updated_by
  )
  values (
    company_id,
    'owner',
    'Owner',
    'Bootstrap owner role for the initial company member.',
    'company',
    true,
    current_user_id,
    current_user_id
  )
  returning id into owner_role_id;

  insert into public.company_memberships (
    company_id,
    user_id,
    role_id,
    membership_role,
    membership_status,
    invitation_email,
    invited_at,
    accepted_at,
    last_active_at,
    created_by,
    updated_by
  )
  values (
    company_id,
    current_user_id,
    owner_role_id,
    'owner',
    'active',
    auth_user.email,
    timezone('utc', now()),
    coalesce(auth_user.last_sign_in_at, timezone('utc', now())),
    timezone('utc', now()),
    current_user_id,
    current_user_id
  )
  returning id into membership_id;

  return jsonb_build_object(
    'user_id', current_user_id,
    'company_id', company_id,
    'membership_id', membership_id,
    'membership_role', 'owner',
    'membership_status', 'active',
    'was_initialized', initialized,
    'created_company', created_company
  );
end;
$$;

comment on function public.bootstrap_authenticated_user() is 'Ensures the authenticated user has a canonical profile plus an initial company and owner membership when no membership exists yet.';
