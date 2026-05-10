create table if not exists public.contractor_package_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  package_definition_id uuid
    references public.platform_package_definitions(id) on delete restrict,
  package_definition_version_id uuid
    references public.platform_package_definition_versions(id) on delete restrict,
  status text not null default 'draft',
  lifecycle_state text not null default 'draft',
  effective_at timestamptz,
  scheduled_for timestamptz,
  activated_at timestamptz,
  superseded_at timestamptz,
  canceled_at timestamptz,
  supersedes_assignment_id uuid references public.contractor_package_assignments(id),
  superseded_by_assignment_id uuid references public.contractor_package_assignments(id),
  assignment_snapshot jsonb,
  billing_impact_snapshot jsonb,
  entitlement_module_impact_snapshot jsonb,
  starter_pack_implication_snapshot jsonb,
  cancellation_reason text,
  supersession_reason text,
  grandfathered_contract boolean not null default false,
  custom_contract_label text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint contractor_package_assignments_status_check
    check (
      status in (
        'draft',
        'pending_review',
        'approved',
        'scheduled',
        'active',
        'superseded',
        'canceled',
        'archived'
      )
    ),
  constraint contractor_package_assignments_lifecycle_state_check
    check (
      lifecycle_state in (
        'draft',
        'pending_review',
        'approved',
        'scheduled',
        'active',
        'superseded',
        'canceled',
        'archived'
      )
    ),
  constraint contractor_package_assignments_active_package_check
    check (
      status <> 'active'
      or (
        package_definition_id is not null
        and package_definition_version_id is not null
        and effective_at is not null
        and activated_at is not null
      )
    ),
  constraint contractor_package_assignments_scheduled_time_check
    check (
      status <> 'scheduled'
      or (
        scheduled_for is not null
        and effective_at is not null
      )
    ),
  constraint contractor_package_assignments_superseded_reason_check
    check (
      (status = 'superseded' and superseded_at is not null and supersession_reason is not null and length(btrim(supersession_reason)) > 0)
      or
      status <> 'superseded'
    ),
  constraint contractor_package_assignments_superseded_timestamp_check
    check (
      superseded_at is null
      or status in ('superseded', 'archived')
    ),
  constraint contractor_package_assignments_canceled_reason_check
    check (
      (status = 'canceled' and canceled_at is not null and cancellation_reason is not null and length(btrim(cancellation_reason)) > 0)
      or
      status <> 'canceled'
    ),
  constraint contractor_package_assignments_canceled_timestamp_check
    check (
      canceled_at is null
      or status in ('canceled', 'archived')
    ),
  constraint contractor_package_assignments_archived_status_check
    check (
      (status = 'archived' and archived_at is not null)
      or
      (status <> 'archived' and archived_at is null)
    ),
  constraint contractor_package_assignments_custom_contract_label_check
    check (custom_contract_label is null or length(btrim(custom_contract_label)) > 0),
  constraint contractor_package_assignments_assignment_snapshot_object_check
    check (assignment_snapshot is null or jsonb_typeof(assignment_snapshot) = 'object'),
  constraint contractor_package_assignments_billing_impact_object_check
    check (billing_impact_snapshot is null or jsonb_typeof(billing_impact_snapshot) = 'object'),
  constraint contractor_package_assignments_entitlement_module_object_check
    check (entitlement_module_impact_snapshot is null or jsonb_typeof(entitlement_module_impact_snapshot) = 'object'),
  constraint contractor_package_assignments_starter_pack_object_check
    check (starter_pack_implication_snapshot is null or jsonb_typeof(starter_pack_implication_snapshot) = 'object')
);

create unique index if not exists contractor_package_assignments_one_active_company_idx
  on public.contractor_package_assignments (company_id)
  where status = 'active' and archived_at is null;

create index if not exists contractor_package_assignments_company_state_idx
  on public.contractor_package_assignments (
    company_id,
    status,
    lifecycle_state,
    effective_at desc
  );

create index if not exists contractor_package_assignments_package_idx
  on public.contractor_package_assignments (
    package_definition_id,
    package_definition_version_id,
    status
  );

create index if not exists contractor_package_assignments_scheduled_idx
  on public.contractor_package_assignments (scheduled_for, effective_at)
  where status = 'scheduled';

create index if not exists contractor_package_assignments_supersession_idx
  on public.contractor_package_assignments (
    supersedes_assignment_id,
    superseded_by_assignment_id
  );

drop trigger if exists contractor_package_assignments_set_updated_at
  on public.contractor_package_assignments;
create trigger contractor_package_assignments_set_updated_at
before update on public.contractor_package_assignments
for each row
execute function public.set_updated_at();

create table if not exists public.contractor_package_assignment_audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  contractor_package_assignment_id uuid not null
    references public.contractor_package_assignments(id),
  company_id uuid not null references public.companies(id),
  package_definition_id uuid
    references public.platform_package_definitions(id) on delete set null,
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
  constraint contractor_package_assignment_audit_events_type_check
    check (
      event_type in (
        'package_assignment_drafted',
        'package_assignment_updated',
        'package_assignment_reviewed',
        'package_assignment_approved',
        'package_assignment_scheduled',
        'package_assignment_activated',
        'package_assignment_superseded',
        'package_assignment_canceled',
        'package_assignment_archived'
      )
    ),
  constraint contractor_package_assignment_audit_events_before_object_check
    check (before_snapshot is null or jsonb_typeof(before_snapshot) = 'object'),
  constraint contractor_package_assignment_audit_events_after_object_check
    check (after_snapshot is null or jsonb_typeof(after_snapshot) = 'object'),
  constraint contractor_package_assignment_audit_events_metadata_object_check
    check (metadata is null or jsonb_typeof(metadata) = 'object')
);

create index if not exists contractor_package_assignment_audit_events_assignment_timeline_idx
  on public.contractor_package_assignment_audit_events (
    contractor_package_assignment_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_assignment_audit_events_company_timeline_idx
  on public.contractor_package_assignment_audit_events (
    company_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_assignment_audit_events_package_idx
  on public.contractor_package_assignment_audit_events (
    package_definition_id,
    package_definition_version_id,
    occurred_at desc
  );

create index if not exists contractor_package_assignment_audit_events_type_recent_idx
  on public.contractor_package_assignment_audit_events (
    event_type,
    occurred_at desc
  );

alter table public.contractor_package_assignments enable row level security;
alter table public.contractor_package_assignments force row level security;

alter table public.contractor_package_assignment_audit_events enable row level security;
alter table public.contractor_package_assignment_audit_events force row level security;

revoke all on table public.contractor_package_assignments from public;
revoke all on table public.contractor_package_assignments from anon;
revoke all on table public.contractor_package_assignments from authenticated;

revoke all on table public.contractor_package_assignment_audit_events from public;
revoke all on table public.contractor_package_assignment_audit_events from anon;
revoke all on table public.contractor_package_assignment_audit_events from authenticated;

grant select on table public.contractor_package_assignments to service_role;
grant select on table public.contractor_package_assignment_audit_events to service_role;

comment on table public.contractor_package_assignments is
  'Platform-governed contractor package assignment foundation for read-only inspection. This table does not activate package assignments, call billing providers, create subscriptions, enforce entitlements, gate modules, change contractor permissions, provision starter packs, or alter runtime behavior.';

comment on table public.contractor_package_assignment_audit_events is
  'Read-only assignment audit evidence foundation for future contractor package assignment governance. No browser/client write path, assignment mutation action, billing behavior, entitlement enforcement, module gate, contractor permission change, reporting/export behavior, automation, AI behavior, or starter-pack provisioning change is implemented here.';

comment on column public.contractor_package_assignments.billing_impact_snapshot is
  'Safe billing impact summary only. Do not store provider secrets, payment data, service-role keys, raw provider payloads, card data, or payment method details.';

comment on column public.contractor_package_assignments.entitlement_module_impact_snapshot is
  'Safe entitlement/module impact summary only. It does not enforce runtime entitlements, module access, pricing, package assignment activation, or contractor permissions.';

comment on column public.contractor_package_assignments.starter_pack_implication_snapshot is
  'Safe starter-pack implication summary only. It does not provision templates, catalog items, defaults, or tenant-owned records.';

comment on column public.contractor_package_assignment_audit_events.before_snapshot is
  'Safe JSON object summary only. Do not store billing provider secrets, raw provider payloads, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_assignment_audit_events.after_snapshot is
  'Safe JSON object summary only. Do not store billing provider secrets, raw provider payloads, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_assignment_audit_events.metadata is
  'Safe audit metadata object only. Do not store billing provider secrets, raw provider payloads, payment data, service-role keys, or card/payment-method details.';
