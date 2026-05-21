drop policy if exists organization_operational_cue_rules_insert_by_membership
  on public.organization_operational_cue_rules;
drop policy if exists organization_operational_cue_rules_update_by_membership
  on public.organization_operational_cue_rules;

create policy organization_operational_cue_rules_insert_by_admin_scope
on public.organization_operational_cue_rules
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_operational_cue_rules.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

create policy organization_operational_cue_rules_update_by_admin_scope
on public.organization_operational_cue_rules
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_operational_cue_rules.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = organization_operational_cue_rules.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

comment on table public.organization_operational_cue_rules is
  'Tenant-owned configurable operational cue rules. Active members may read rules for derived My Work cues; only owner/admin members may insert or update rule configuration. Operational cue instances are derived from canonical records at query time.';
