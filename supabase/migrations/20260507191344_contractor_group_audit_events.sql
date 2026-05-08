create table if not exists public.contractor_group_audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  contractor_group_id uuid references public.contractor_groups(id) on delete set null,
  organization_id uuid references public.companies(id) on delete set null,
  membership_id uuid references public.contractor_group_memberships(id) on delete set null,
  event_type text not null,
  actor_user_id uuid references public.users(id) on delete set null,
  assignment_source text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  constraint contractor_group_audit_events_event_type_check check (
    event_type in (
      'group_created',
      'group_updated',
      'group_archived',
      'group_activated',
      'group_deactivated',
      'organization_assigned',
      'organization_removed',
      'assignment_source_changed'
    )
  ),
  constraint contractor_group_audit_events_assignment_source_check check (
    assignment_source is null
    or assignment_source in (
      'manual',
      'targeting_preview',
      'future_auto_assignment'
    )
  ),
  constraint contractor_group_audit_events_metadata_object_check check (
    jsonb_typeof(metadata) = 'object'
  )
);

create index if not exists contractor_group_audit_events_group_idx
  on public.contractor_group_audit_events(contractor_group_id);

create index if not exists contractor_group_audit_events_organization_idx
  on public.contractor_group_audit_events(organization_id);

create index if not exists contractor_group_audit_events_membership_idx
  on public.contractor_group_audit_events(membership_id);

create index if not exists contractor_group_audit_events_event_type_idx
  on public.contractor_group_audit_events(event_type);

create index if not exists contractor_group_audit_events_occurred_at_idx
  on public.contractor_group_audit_events(occurred_at desc);

alter table public.contractor_group_audit_events enable row level security;
alter table public.contractor_group_audit_events force row level security;

revoke all on table public.contractor_group_audit_events from anon, authenticated;

comment on table public.contractor_group_audit_events is
  'Platform-admin-only audit history for contractor group lifecycle and organization membership events. This table is audit/read-model evidence only and does not enforce entitlements, pricing, permissions, provisioning, or runtime behavior.';

comment on column public.contractor_group_audit_events.event_type is
  'Constrained contractor group lifecycle or assignment audit event type.';

comment on column public.contractor_group_audit_events.assignment_source is
  'Assignment source copied from contractor group membership events when applicable. future_auto_assignment remains reserved and non-enforcing.';

comment on column public.contractor_group_audit_events.metadata is
  'Small JSON object for safe event snapshots. Do not store secrets, service errors, or tenant-private payloads.';
