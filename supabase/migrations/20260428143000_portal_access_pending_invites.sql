alter table public.portal_access_grants
  alter column user_id drop not null;

alter table public.portal_access_grants
  add column if not exists invite_token_hash text,
  add column if not exists invite_expires_at timestamptz,
  add column if not exists invite_accepted_at timestamptz;

create unique index if not exists portal_access_grants_invite_token_hash_unique_idx
  on public.portal_access_grants (invite_token_hash)
  where invite_token_hash is not null;

create index if not exists portal_access_grants_company_invite_status_idx
  on public.portal_access_grants (company_id, status, invite_expires_at)
  where invite_token_hash is not null;

create or replace function public.get_portal_invite_preview(target_token_hash text)
returns table (
  portal_access_grant_id uuid,
  company_id uuid,
  customer_id uuid,
  customer_name text,
  customer_company_name text,
  project_id uuid,
  project_name text,
  invited_email text,
  status text,
  expires_at timestamptz,
  accepted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    grant_record.id as portal_access_grant_id,
    grant_record.company_id,
    grant_record.customer_id,
    customer_record.name as customer_name,
    customer_record.company_name as customer_company_name,
    project_record.id as project_id,
    project_record.name as project_name,
    grant_record.invited_email,
    grant_record.status::text,
    grant_record.invite_expires_at as expires_at,
    grant_record.invite_accepted_at as accepted_at
  from public.portal_access_grants grant_record
  join public.customers customer_record
    on customer_record.company_id = grant_record.company_id
   and customer_record.id = grant_record.customer_id
  join public.portal_project_access project_access
    on project_access.company_id = grant_record.company_id
   and project_access.portal_access_grant_id = grant_record.id
  join public.projects project_record
    on project_record.company_id = project_access.company_id
   and project_record.id = project_access.project_id
  where grant_record.invite_token_hash = target_token_hash
    and grant_record.status <> 'revoked'
  order by project_access.created_at asc
  limit 1
$$;

create or replace function public.accept_portal_invite(target_token_hash text)
returns table (
  accepted boolean,
  project_id uuid,
  message text
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := (select auth.uid());
  authenticated_email text;
  invite_record public.portal_access_grants%rowtype;
  active_project_id uuid;
begin
  if authenticated_user_id is null then
    return query select false, null::uuid, 'Sign in before accepting this portal invite.';
    return;
  end if;

  select lower(trim(user_record.email))
    into authenticated_email
  from public.users user_record
  where user_record.id = authenticated_user_id
    and user_record.lifecycle_state = 'active';

  if authenticated_email is null then
    return query select false, null::uuid, 'Your account is not active yet. Sign out and sign back in, then retry the invite.';
    return;
  end if;

  select *
    into invite_record
  from public.portal_access_grants
  where invite_token_hash = target_token_hash
  for update;

  if invite_record.id is null then
    return query select false, null::uuid, 'This portal invite is invalid or has already been removed.';
    return;
  end if;

  select project_access.project_id
    into active_project_id
  from public.portal_project_access project_access
  where project_access.company_id = invite_record.company_id
    and project_access.portal_access_grant_id = invite_record.id
    and project_access.status = 'active'
  order by project_access.created_at asc
  limit 1;

  if active_project_id is null then
    return query select false, null::uuid, 'This invite no longer has active project access. Ask your contractor to reissue portal access.';
    return;
  end if;

  if invite_record.status = 'revoked' then
    return query select false, active_project_id, 'This portal invite was revoked by the contractor.';
    return;
  end if;

  if invite_record.status <> 'active'
    and invite_record.invite_expires_at is not null
    and invite_record.invite_expires_at < timezone('utc', now())
  then
    return query select false, active_project_id, 'This portal invite has expired. Ask your contractor for a fresh invite.';
    return;
  end if;

  if lower(trim(coalesce(invite_record.invited_email, ''))) <> authenticated_email then
    return query select false, active_project_id, 'This invite belongs to a different email address. Sign in with the invited customer email.';
    return;
  end if;

  if invite_record.user_id is not null and invite_record.user_id <> authenticated_user_id then
    return query select false, active_project_id, 'This invite has already been accepted by the invited customer account.';
    return;
  end if;

  update public.portal_access_grants
  set
    user_id = authenticated_user_id,
    status = 'active',
    activated_at = coalesce(activated_at, timezone('utc', now())),
    invite_accepted_at = coalesce(invite_accepted_at, timezone('utc', now())),
    invited_email = authenticated_email
  where id = invite_record.id;

  return query select true, active_project_id, 'Portal invite accepted.';
end
$$;

grant execute on function public.get_portal_invite_preview(text) to anon, authenticated;
grant execute on function public.accept_portal_invite(text) to authenticated;

comment on column public.portal_access_grants.user_id is 'Authenticated application user receiving portal access to the selected canonical customer. Null means this is a pending contractor-created invite that has not been accepted yet.';
comment on column public.portal_access_grants.invite_token_hash is 'Server-generated hash of the pending portal invite token. The raw token is shown only when the contractor creates the invite link.';
comment on column public.portal_access_grants.invite_expires_at is 'Expiration timestamp for pending contractor-created portal invites.';
comment on column public.portal_access_grants.invite_accepted_at is 'Timestamp when the invited authenticated customer accepted and activated this portal grant.';
comment on function public.get_portal_invite_preview(text) is 'Returns customer-safe portal invite context for a hashed invite token without exposing raw portal access rows.';
comment on function public.accept_portal_invite(text) is 'Activates a pending portal access grant for the authenticated user when the invite token and email match.';
