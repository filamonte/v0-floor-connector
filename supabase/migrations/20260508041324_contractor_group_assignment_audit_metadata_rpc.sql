create or replace function private.sanitize_contractor_group_assignment_audit_metadata(
  p_metadata jsonb
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'assignmentContext',
        case
          when p_metadata->>'assignmentContext' in ('manual', 'proposal_manual_review')
            then p_metadata->>'assignmentContext'
          else null
        end,
      'proposalSource',
        left(nullif(btrim(p_metadata->>'proposalSource'), ''), 80),
      'proposalConfidence',
        case
          when p_metadata->>'proposalConfidence' in ('high', 'medium', 'low', 'unavailable')
            then p_metadata->>'proposalConfidence'
          else null
        end,
      'proposalStatus',
        case
          when p_metadata->>'proposalStatus' in ('proposed', 'already_assigned', 'not_applicable', 'unavailable')
            then p_metadata->>'proposalStatus'
          else null
        end,
      'proposalReasonCode',
        left(nullif(btrim(p_metadata->>'proposalReasonCode'), ''), 120),
      'recomputationStatus',
        left(nullif(btrim(p_metadata->>'recomputationStatus'), ''), 80),
      'operatorReasonPresent',
        case
          when jsonb_typeof(p_metadata->'operatorReasonPresent') = 'boolean'
            then p_metadata->'operatorReasonPresent'
          else null
        end,
      'organizationLabel',
        left(nullif(btrim(p_metadata->>'organizationLabel'), ''), 160),
      'groupKey',
        left(nullif(btrim(p_metadata->>'groupKey'), ''), 120),
      'groupType',
        case
          when p_metadata->>'groupType' in (
            'trade_segment',
            'onboarding',
            'beta',
            'internal',
            'future_plan',
            'future_entitlement',
            'regional',
            'custom'
          )
            then p_metadata->>'groupType'
          else null
        end,
      'groupStatus',
        case
          when p_metadata->>'groupStatus' in ('active', 'inactive', 'archived')
            then p_metadata->>'groupStatus'
          else null
        end,
      'blockedStateChecked',
        case
          when jsonb_typeof(p_metadata->'blockedStateChecked') = 'boolean'
            then p_metadata->'blockedStateChecked'
          else null
        end
    )
  );
$$;

create or replace function private.assign_contractor_group_membership_with_audit_metadata(
  p_contractor_group_id uuid,
  p_organization_id uuid,
  p_assignment_source text,
  p_notes text,
  p_actor_id uuid,
  p_audit_metadata jsonb default '{}'::jsonb
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
  v_safe_audit_metadata jsonb := private.sanitize_contractor_group_assignment_audit_metadata(
    coalesce(p_audit_metadata, '{}'::jsonb)
  );
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
    v_safe_audit_metadata ||
      jsonb_strip_nulls(
        jsonb_build_object(
          'groupKey', v_group.group_key,
          'groupName', v_group.name,
          'groupType', v_group.group_type,
          'groupStatus', v_group.status,
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

create or replace function public.assign_contractor_group_membership_with_audit_metadata(
  p_contractor_group_id uuid,
  p_organization_id uuid,
  p_assignment_source text,
  p_notes text,
  p_actor_id uuid,
  p_audit_metadata jsonb default '{}'::jsonb
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.assign_contractor_group_membership_with_audit_metadata(
    p_contractor_group_id,
    p_organization_id,
    p_assignment_source,
    p_notes,
    p_actor_id,
    p_audit_metadata
  );
$$;

revoke all on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) from public;
revoke all on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) from anon;
revoke all on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) from authenticated;

revoke all on function private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) from public;
revoke all on function private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) from anon;
revoke all on function private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) from authenticated;

revoke all on function public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) from public;
revoke all on function public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) from anon;
revoke all on function public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) from authenticated;

grant usage on schema private to service_role;
grant execute on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) to service_role;
grant execute on function private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) to service_role;
grant execute on function public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) to service_role;

comment on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) is
  'Allowlist sanitizer for optional contractor group assignment audit metadata. Drops unrecognized or unsafe fields.';

comment on function private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) is
  'Atomically assigns or updates one organization contractor-group membership and appends an assignment audit row with optional sanitized metadata. Segmentation metadata only; no runtime enforcement.';

comment on function public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb) is
  'Service-role wrapper for contractor group membership assignment audit metadata. Not granted to public, anon, or authenticated.';
