create table if not exists public.platform_package_definition_audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  package_definition_id uuid not null
    references public.platform_package_definitions(id),
  package_definition_version_id uuid
    references public.platform_package_definition_versions(id) on delete set null,
  event_type text not null,
  actor_id uuid references public.users(id) on delete set null,
  reason text,
  confirmation_text text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  metadata jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint platform_package_definition_audit_events_type_check
    check (
      event_type in (
        'package_definition_created',
        'package_definition_updated',
        'package_definition_reviewed',
        'package_definition_approved',
        'package_definition_published',
        'package_definition_deprecated',
        'package_definition_archived',
        'package_version_created',
        'package_version_updated',
        'package_version_reviewed',
        'package_version_approved',
        'package_version_published',
        'package_version_deprecated',
        'package_version_archived'
      )
    ),
  constraint platform_package_definition_audit_events_version_reference_check
    check (
      event_type not like 'package_version_%'
      or package_definition_version_id is not null
    ),
  constraint platform_package_definition_audit_events_before_object_check
    check (before_snapshot is null or jsonb_typeof(before_snapshot) = 'object'),
  constraint platform_package_definition_audit_events_after_object_check
    check (after_snapshot is null or jsonb_typeof(after_snapshot) = 'object'),
  constraint platform_package_definition_audit_events_metadata_object_check
    check (metadata is null or jsonb_typeof(metadata) = 'object')
);

create index if not exists platform_package_definition_audit_events_definition_timeline_idx
  on public.platform_package_definition_audit_events (
    package_definition_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists platform_package_definition_audit_events_version_timeline_idx
  on public.platform_package_definition_audit_events (
    package_definition_version_id,
    occurred_at desc
  )
  where package_definition_version_id is not null;

create index if not exists platform_package_definition_audit_events_type_recent_idx
  on public.platform_package_definition_audit_events (
    event_type,
    occurred_at desc
  );

create index if not exists platform_package_definition_audit_events_recent_idx
  on public.platform_package_definition_audit_events (occurred_at desc);

alter table public.platform_package_definition_audit_events enable row level security;
alter table public.platform_package_definition_audit_events force row level security;

revoke all on table public.platform_package_definition_audit_events from public;
revoke all on table public.platform_package_definition_audit_events from anon;
revoke all on table public.platform_package_definition_audit_events from authenticated;

grant select on table public.platform_package_definition_audit_events to service_role;

comment on table public.platform_package_definition_audit_events is
  'Append-only package definition audit evidence foundation. Read-only in the app for this slice; no browser/client write path, lifecycle mutation, package assignment, billing provider operation, entitlement enforcement, module gate, runtime behavior, or contractor permission change is implemented here.';

comment on column public.platform_package_definition_audit_events.before_snapshot is
  'Safe JSON object summary only. Do not store billing provider secrets, raw provider payloads, payment data, service-role keys, or card/payment-method details.';

comment on column public.platform_package_definition_audit_events.after_snapshot is
  'Safe JSON object summary only. Do not store billing provider secrets, raw provider payloads, payment data, service-role keys, or card/payment-method details.';

comment on column public.platform_package_definition_audit_events.metadata is
  'Safe audit metadata object only. Do not store billing provider secrets, raw provider payloads, payment data, service-role keys, or card/payment-method details.';
