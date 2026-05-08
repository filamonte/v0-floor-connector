create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.contractor_group_status_audit_event_type(
  p_old_status text,
  p_new_status text
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_old_status is null then 'group_created'
    when p_old_status is distinct from p_new_status and p_new_status = 'active' then 'group_activated'
    when p_old_status is distinct from p_new_status and p_new_status = 'inactive' then 'group_deactivated'
    when p_old_status is distinct from p_new_status and p_new_status = 'archived' then 'group_archived'
    else 'group_updated'
  end;
$$;

create or replace function private.upsert_contractor_group_with_audit(
  p_contractor_group_id uuid,
  p_group_key text,
  p_name text,
  p_description text,
  p_status text,
  p_group_type text,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.contractor_groups%rowtype;
  v_group public.contractor_groups%rowtype;
  v_event_type text;
  v_now timestamptz := timezone('utc', now());
begin
  if p_group_key !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Contractor group key must use lowercase letters, numbers, and hyphens.';
  end if;

  if p_status not in ('active', 'inactive', 'archived') then
    raise exception 'Select a valid contractor group status.';
  end if;

  if p_group_type not in (
    'trade_segment',
    'onboarding',
    'beta',
    'internal',
    'future_plan',
    'future_entitlement',
    'regional',
    'custom'
  ) then
    raise exception 'Select a valid contractor group type.';
  end if;

  if p_contractor_group_id is null then
    insert into public.contractor_groups (
      group_key,
      name,
      description,
      status,
      group_type,
      created_by,
      updated_by
    ) values (
      p_group_key,
      p_name,
      p_description,
      p_status,
      p_group_type,
      p_actor_id,
      p_actor_id
    )
    returning * into v_group;

    v_event_type := 'group_created';
  else
    select *
    into v_existing
    from public.contractor_groups
    where id = p_contractor_group_id
    for update;

    if not found then
      raise exception 'Select a valid contractor group.';
    end if;

    update public.contractor_groups
    set
      group_key = p_group_key,
      name = p_name,
      description = p_description,
      status = p_status,
      group_type = p_group_type,
      updated_by = p_actor_id,
      updated_at = v_now
    where id = p_contractor_group_id
    returning * into v_group;

    v_event_type := private.contractor_group_status_audit_event_type(
      v_existing.status,
      v_group.status
    );
  end if;

  insert into public.contractor_group_audit_events (
    contractor_group_id,
    event_type,
    actor_user_id,
    reason,
    metadata,
    occurred_at
  ) values (
    v_group.id,
    v_event_type,
    p_actor_id,
    p_description,
    jsonb_strip_nulls(
      jsonb_build_object(
        'oldName', v_existing.name,
        'newName', v_group.name,
        'oldKey', v_existing.group_key,
        'newKey', v_group.group_key,
        'oldStatus', v_existing.status,
        'newStatus', v_group.status,
        'oldGroupType', v_existing.group_type,
        'newGroupType', v_group.group_type
      )
    ),
    v_now
  );

  return v_group.id;
end;
$$;

create or replace function private.archive_contractor_group_with_audit(
  p_contractor_group_id uuid,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.contractor_groups%rowtype;
  v_group public.contractor_groups%rowtype;
  v_now timestamptz := timezone('utc', now());
begin
  select *
  into v_existing
  from public.contractor_groups
  where id = p_contractor_group_id
  for update;

  if not found then
    raise exception 'Select a valid contractor group.';
  end if;

  update public.contractor_groups
  set
    status = 'archived',
    updated_by = p_actor_id,
    updated_at = v_now
  where id = p_contractor_group_id
  returning * into v_group;

  insert into public.contractor_group_audit_events (
    contractor_group_id,
    event_type,
    actor_user_id,
    metadata,
    occurred_at
  ) values (
    v_group.id,
    'group_archived',
    p_actor_id,
    jsonb_strip_nulls(
      jsonb_build_object(
        'oldStatus', v_existing.status,
        'newStatus', v_group.status,
        'oldName', v_existing.name,
        'newName', v_group.name,
        'oldKey', v_existing.group_key,
        'newKey', v_group.group_key
      )
    ),
    v_now
  );

  return v_group.id;
end;
$$;

create or replace function private.assign_contractor_group_membership_with_audit(
  p_contractor_group_id uuid,
  p_organization_id uuid,
  p_assignment_source text,
  p_notes text,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group public.contractor_groups%rowtype;
  v_existing_membership public.contractor_group_memberships%rowtype;
  v_membership public.contractor_group_memberships%rowtype;
  v_org record;
  v_event_type text := 'organization_assigned';
  v_now timestamptz := timezone('utc', now());
begin
  if p_assignment_source not in (
    'manual',
    'targeting_preview',
    'future_auto_assignment'
  ) then
    raise exception 'Select a valid contractor group assignment source.';
  end if;

  select *
  into v_group
  from public.contractor_groups
  where id = p_contractor_group_id
  for update;

  if not found then
    raise exception 'Select a valid contractor group.';
  end if;

  if v_group.status = 'archived' then
    raise exception 'Archived contractor groups cannot receive new organization assignments.';
  end if;

  select
    id,
    slug,
    legal_name,
    display_name,
    tenant_status
  into v_org
  from public.companies
  where id = p_organization_id;

  if not found then
    raise exception 'Select a valid contractor organization.';
  end if;

  select *
  into v_existing_membership
  from public.contractor_group_memberships
  where contractor_group_id = p_contractor_group_id
    and organization_id = p_organization_id
  for update;

  if found then
    update public.contractor_group_memberships
    set
      assigned_by = p_actor_id,
      assignment_source = p_assignment_source,
      notes = p_notes
    where id = v_existing_membership.id
    returning * into v_membership;

    if v_existing_membership.assignment_source is distinct from p_assignment_source then
      v_event_type := 'assignment_source_changed';
    end if;
  else
    insert into public.contractor_group_memberships (
      contractor_group_id,
      organization_id,
      assigned_by,
      assignment_source,
      notes
    ) values (
      p_contractor_group_id,
      p_organization_id,
      p_actor_id,
      p_assignment_source,
      p_notes
    )
    returning * into v_membership;
  end if;

  insert into public.contractor_group_audit_events (
    contractor_group_id,
    organization_id,
    membership_id,
    event_type,
    actor_user_id,
    assignment_source,
    reason,
    metadata,
    occurred_at
  ) values (
    p_contractor_group_id,
    p_organization_id,
    v_membership.id,
    v_event_type,
    p_actor_id,
    p_assignment_source,
    p_notes,
    jsonb_strip_nulls(
      jsonb_build_object(
        'groupKey', v_group.group_key,
        'groupName', v_group.name,
        'organizationLabel', coalesce(
          nullif(v_org.display_name, ''),
          nullif(v_org.legal_name, ''),
          v_org.slug,
          v_org.id::text
        ),
        'organizationTenantStatus', v_org.tenant_status,
        'oldAssignmentSource', v_existing_membership.assignment_source,
        'newAssignmentSource', v_membership.assignment_source,
        'notesPresent', p_notes is not null and length(trim(p_notes)) > 0
      )
    ),
    v_now
  );

  return v_membership.id;
end;
$$;

create or replace function private.remove_contractor_group_membership_with_audit(
  p_membership_id uuid,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_membership record;
  v_now timestamptz := timezone('utc', now());
begin
  select
    membership.id as membership_id,
    membership.contractor_group_id,
    membership.organization_id,
    membership.assignment_source,
    membership.notes,
    contractor_group.group_key,
    contractor_group.name as group_name,
    organization.slug as organization_slug,
    organization.legal_name as organization_legal_name,
    organization.display_name as organization_display_name,
    organization.tenant_status as organization_tenant_status
  into v_membership
  from public.contractor_group_memberships membership
  join public.contractor_groups contractor_group
    on contractor_group.id = membership.contractor_group_id
  join public.companies organization
    on organization.id = membership.organization_id
  where membership.id = p_membership_id
  for update of membership;

  if not found then
    raise exception 'Select a valid contractor group membership.';
  end if;

  insert into public.contractor_group_audit_events (
    contractor_group_id,
    organization_id,
    membership_id,
    event_type,
    actor_user_id,
    assignment_source,
    reason,
    metadata,
    occurred_at
  ) values (
    v_membership.contractor_group_id,
    v_membership.organization_id,
    v_membership.membership_id,
    'organization_removed',
    p_actor_id,
    v_membership.assignment_source,
    v_membership.notes,
    jsonb_strip_nulls(
      jsonb_build_object(
        'removedMembershipId', v_membership.membership_id,
        'groupKey', v_membership.group_key,
        'groupName', v_membership.group_name,
        'organizationLabel', coalesce(
          nullif(v_membership.organization_display_name, ''),
          nullif(v_membership.organization_legal_name, ''),
          v_membership.organization_slug,
          v_membership.organization_id::text
        ),
        'organizationTenantStatus', v_membership.organization_tenant_status,
        'assignmentSource', v_membership.assignment_source,
        'notesPresent', v_membership.notes is not null and length(trim(v_membership.notes)) > 0
      )
    ),
    v_now
  );

  delete from public.contractor_group_memberships
  where id = p_membership_id;

  return v_membership.contractor_group_id;
end;
$$;

create or replace function public.upsert_contractor_group_with_audit(
  p_contractor_group_id uuid,
  p_group_key text,
  p_name text,
  p_description text,
  p_status text,
  p_group_type text,
  p_actor_id uuid
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.upsert_contractor_group_with_audit(
    p_contractor_group_id,
    p_group_key,
    p_name,
    p_description,
    p_status,
    p_group_type,
    p_actor_id
  );
$$;

create or replace function public.archive_contractor_group_with_audit(
  p_contractor_group_id uuid,
  p_actor_id uuid
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.archive_contractor_group_with_audit(
    p_contractor_group_id,
    p_actor_id
  );
$$;

create or replace function public.assign_contractor_group_membership_with_audit(
  p_contractor_group_id uuid,
  p_organization_id uuid,
  p_assignment_source text,
  p_notes text,
  p_actor_id uuid
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.assign_contractor_group_membership_with_audit(
    p_contractor_group_id,
    p_organization_id,
    p_assignment_source,
    p_notes,
    p_actor_id
  );
$$;

create or replace function public.remove_contractor_group_membership_with_audit(
  p_membership_id uuid,
  p_actor_id uuid
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.remove_contractor_group_membership_with_audit(
    p_membership_id,
    p_actor_id
  );
$$;

revoke all on function private.contractor_group_status_audit_event_type(text, text) from public;
revoke all on function private.contractor_group_status_audit_event_type(text, text) from anon;
revoke all on function private.contractor_group_status_audit_event_type(text, text) from authenticated;

revoke all on function private.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) from public;
revoke all on function private.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) from anon;
revoke all on function private.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) from authenticated;

revoke all on function private.archive_contractor_group_with_audit(uuid, uuid) from public;
revoke all on function private.archive_contractor_group_with_audit(uuid, uuid) from anon;
revoke all on function private.archive_contractor_group_with_audit(uuid, uuid) from authenticated;

revoke all on function private.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) from public;
revoke all on function private.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) from anon;
revoke all on function private.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) from authenticated;

revoke all on function private.remove_contractor_group_membership_with_audit(uuid, uuid) from public;
revoke all on function private.remove_contractor_group_membership_with_audit(uuid, uuid) from anon;
revoke all on function private.remove_contractor_group_membership_with_audit(uuid, uuid) from authenticated;

revoke all on function public.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) from public;
revoke all on function public.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) from anon;
revoke all on function public.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) from authenticated;

revoke all on function public.archive_contractor_group_with_audit(uuid, uuid) from public;
revoke all on function public.archive_contractor_group_with_audit(uuid, uuid) from anon;
revoke all on function public.archive_contractor_group_with_audit(uuid, uuid) from authenticated;

revoke all on function public.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) from public;
revoke all on function public.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) from anon;
revoke all on function public.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) from authenticated;

revoke all on function public.remove_contractor_group_membership_with_audit(uuid, uuid) from public;
revoke all on function public.remove_contractor_group_membership_with_audit(uuid, uuid) from anon;
revoke all on function public.remove_contractor_group_membership_with_audit(uuid, uuid) from authenticated;

grant usage on schema private to service_role;
grant execute on function private.contractor_group_status_audit_event_type(text, text) to service_role;
grant execute on function private.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) to service_role;
grant execute on function private.archive_contractor_group_with_audit(uuid, uuid) to service_role;
grant execute on function private.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) to service_role;
grant execute on function private.remove_contractor_group_membership_with_audit(uuid, uuid) to service_role;
grant execute on function public.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) to service_role;
grant execute on function public.archive_contractor_group_with_audit(uuid, uuid) to service_role;
grant execute on function public.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) to service_role;
grant execute on function public.remove_contractor_group_membership_with_audit(uuid, uuid) to service_role;

comment on function private.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) is
  'Atomically creates or updates one platform contractor group and appends the matching contractor_group_audit_events row. Segmentation metadata only; no runtime enforcement.';

comment on function private.archive_contractor_group_with_audit(uuid, uuid) is
  'Atomically archives one platform contractor group and appends a group_archived audit row. Segmentation metadata only; no runtime enforcement.';

comment on function private.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) is
  'Atomically assigns or updates one organization contractor-group membership and appends an assignment audit row. Segmentation metadata only; no runtime enforcement.';

comment on function private.remove_contractor_group_membership_with_audit(uuid, uuid) is
  'Atomically removes one organization contractor-group membership and appends an organization_removed audit row. Segmentation metadata only; no runtime enforcement.';

comment on function public.upsert_contractor_group_with_audit(uuid, text, text, text, text, text, uuid) is
  'Server-only service-role wrapper for private contractor group create/update audit mutation. Not granted to anon or authenticated roles.';

comment on function public.archive_contractor_group_with_audit(uuid, uuid) is
  'Server-only service-role wrapper for private contractor group archive audit mutation. Not granted to anon or authenticated roles.';

comment on function public.assign_contractor_group_membership_with_audit(uuid, uuid, text, text, uuid) is
  'Server-only service-role wrapper for private contractor group assignment audit mutation. Not granted to anon or authenticated roles.';

comment on function public.remove_contractor_group_membership_with_audit(uuid, uuid) is
  'Server-only service-role wrapper for private contractor group removal audit mutation. Not granted to anon or authenticated roles.';
