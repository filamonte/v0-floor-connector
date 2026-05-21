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
      'proposalFingerprint',
        left(nullif(btrim(p_metadata->>'proposalFingerprint'), ''), 500),
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

revoke all on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) from public;
revoke all on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) from anon;
revoke all on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) from authenticated;
grant execute on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) to service_role;

comment on function private.sanitize_contractor_group_assignment_audit_metadata(jsonb) is
  'Allowlist sanitizer for optional contractor group assignment audit metadata, including scalar proposal fingerprint evidence. Drops unrecognized or unsafe fields.';
