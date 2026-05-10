create table if not exists public.contractor_package_billing_mappings (
  id uuid primary key default extensions.gen_random_uuid(),
  contractor_package_assignment_id uuid
    references public.contractor_package_assignments(id) on delete restrict,
  company_id uuid references public.companies(id) on delete restrict,
  package_definition_id uuid
    references public.platform_package_definitions(id) on delete restrict,
  package_definition_version_id uuid
    references public.platform_package_definition_versions(id) on delete restrict,
  billing_provider text not null default 'unknown',
  provider_environment text not null default 'unknown',
  provider_customer_reference text,
  provider_product_reference text,
  provider_price_reference text,
  provider_subscription_reference text,
  provider_subscription_item_reference text,
  billing_state text not null default 'not_started',
  reconciliation_state text not null default 'not_started',
  trial_or_early_access_state text,
  custom_or_grandfathered_terms_marker text,
  expected_provider_state_snapshot jsonb,
  observed_provider_state_snapshot jsonb,
  mapping_snapshot jsonb,
  mismatch_summary text,
  last_verified_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint contractor_package_billing_mappings_provider_check
    check (billing_provider in ('stripe', 'manual_review', 'unknown')),
  constraint contractor_package_billing_mappings_environment_check
    check (provider_environment in ('sandbox', 'test', 'production', 'unknown')),
  constraint contractor_package_billing_mappings_billing_state_check
    check (
      billing_state in (
        'not_started',
        'mapped',
        'verified',
        'active',
        'mismatch_detected',
        'suspended',
        'deprecated',
        'archived'
      )
    ),
  constraint contractor_package_billing_mappings_reconciliation_state_check
    check (
      reconciliation_state in (
        'not_started',
        'pending_provider',
        'pending_verification',
        'verified',
        'mismatch_detected',
        'support_review_required',
        'suspended',
        'archived'
      )
    ),
  constraint contractor_package_billing_mappings_trial_state_check
    check (
      trial_or_early_access_state is null
      or trial_or_early_access_state in (
        'none',
        'trial',
        'early_access',
        'trial_and_early_access',
        'unknown'
      )
    ),
  constraint contractor_package_billing_mappings_custom_marker_check
    check (
      custom_or_grandfathered_terms_marker is null
      or custom_or_grandfathered_terms_marker in (
        'none',
        'custom',
        'grandfathered',
        'custom_and_grandfathered',
        'unknown'
      )
    ),
  constraint contractor_package_billing_mappings_provider_ref_check
    check (
      (provider_customer_reference is null or length(btrim(provider_customer_reference)) > 0)
      and (provider_product_reference is null or length(btrim(provider_product_reference)) > 0)
      and (provider_price_reference is null or length(btrim(provider_price_reference)) > 0)
      and (provider_subscription_reference is null or length(btrim(provider_subscription_reference)) > 0)
      and (provider_subscription_item_reference is null or length(btrim(provider_subscription_item_reference)) > 0)
    ),
  constraint contractor_package_billing_mappings_expected_snapshot_object_check
    check (expected_provider_state_snapshot is null or jsonb_typeof(expected_provider_state_snapshot) = 'object'),
  constraint contractor_package_billing_mappings_observed_snapshot_object_check
    check (observed_provider_state_snapshot is null or jsonb_typeof(observed_provider_state_snapshot) = 'object'),
  constraint contractor_package_billing_mappings_mapping_snapshot_object_check
    check (mapping_snapshot is null or jsonb_typeof(mapping_snapshot) = 'object'),
  constraint contractor_package_billing_mappings_mismatch_state_check
    check (
      mismatch_summary is null
      or (
        length(btrim(mismatch_summary)) > 0
        and (
          billing_state = 'mismatch_detected'
          or reconciliation_state in ('mismatch_detected', 'support_review_required')
        )
      )
    ),
  constraint contractor_package_billing_mappings_verified_timestamp_check
    check (
      last_verified_at is null
      or reconciliation_state in ('verified', 'mismatch_detected', 'support_review_required', 'suspended', 'archived')
      or billing_state in ('verified', 'active', 'mismatch_detected', 'suspended', 'deprecated', 'archived')
    ),
  constraint contractor_package_billing_mappings_archived_state_check
    check (
      archived_at is null
      or billing_state in ('deprecated', 'archived')
      or reconciliation_state = 'archived'
    )
);

create index if not exists contractor_package_billing_mappings_assignment_idx
  on public.contractor_package_billing_mappings (
    contractor_package_assignment_id,
    billing_state,
    reconciliation_state
  );

create index if not exists contractor_package_billing_mappings_company_idx
  on public.contractor_package_billing_mappings (
    company_id,
    provider_environment,
    billing_state,
    reconciliation_state
  );

create index if not exists contractor_package_billing_mappings_package_idx
  on public.contractor_package_billing_mappings (
    package_definition_id,
    package_definition_version_id,
    provider_environment
  );

create index if not exists contractor_package_billing_mappings_provider_idx
  on public.contractor_package_billing_mappings (
    billing_provider,
    provider_environment,
    reconciliation_state
  );

create index if not exists contractor_package_billing_mappings_subscription_reference_idx
  on public.contractor_package_billing_mappings (
    billing_provider,
    provider_environment,
    provider_subscription_reference
  )
  where provider_subscription_reference is not null;

create index if not exists contractor_package_billing_mappings_attention_idx
  on public.contractor_package_billing_mappings (
    reconciliation_state,
    billing_state,
    last_verified_at desc nulls last
  )
  where reconciliation_state in ('mismatch_detected', 'support_review_required', 'suspended')
     or billing_state in ('mismatch_detected', 'suspended');

drop trigger if exists contractor_package_billing_mappings_set_updated_at
  on public.contractor_package_billing_mappings;
create trigger contractor_package_billing_mappings_set_updated_at
before update on public.contractor_package_billing_mappings
for each row
execute function public.set_updated_at();

create table if not exists public.contractor_package_billing_mapping_audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  contractor_package_billing_mapping_id uuid
    references public.contractor_package_billing_mappings(id) on delete restrict,
  contractor_package_assignment_id uuid
    references public.contractor_package_assignments(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  package_definition_id uuid
    references public.platform_package_definitions(id) on delete set null,
  package_definition_version_id uuid
    references public.platform_package_definition_versions(id) on delete set null,
  event_type text not null,
  actor_id uuid references public.users(id) on delete set null,
  reason text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  metadata jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint contractor_package_billing_mapping_audit_events_type_check
    check (
      event_type in (
        'billing_mapping_created',
        'billing_mapping_updated',
        'billing_mapping_reviewed',
        'billing_mapping_verified',
        'billing_mapping_mismatch_detected',
        'billing_mapping_support_review_requested',
        'billing_mapping_suspended',
        'billing_mapping_deprecated',
        'billing_mapping_archived',
        'provider_reference_observed',
        'provider_reference_reconciled'
      )
    ),
  constraint contractor_package_billing_mapping_audit_events_before_object_check
    check (before_snapshot is null or jsonb_typeof(before_snapshot) = 'object'),
  constraint contractor_package_billing_mapping_audit_events_after_object_check
    check (after_snapshot is null or jsonb_typeof(after_snapshot) = 'object'),
  constraint contractor_package_billing_mapping_audit_events_metadata_object_check
    check (metadata is null or jsonb_typeof(metadata) = 'object')
);

create index if not exists contractor_package_billing_mapping_audit_events_mapping_timeline_idx
  on public.contractor_package_billing_mapping_audit_events (
    contractor_package_billing_mapping_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_mapping_audit_events_assignment_idx
  on public.contractor_package_billing_mapping_audit_events (
    contractor_package_assignment_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_mapping_audit_events_company_idx
  on public.contractor_package_billing_mapping_audit_events (
    company_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_mapping_audit_events_package_idx
  on public.contractor_package_billing_mapping_audit_events (
    package_definition_id,
    package_definition_version_id,
    occurred_at desc
  );

create index if not exists contractor_package_billing_mapping_audit_events_type_recent_idx
  on public.contractor_package_billing_mapping_audit_events (
    event_type,
    occurred_at desc
  );

alter table public.contractor_package_billing_mappings enable row level security;
alter table public.contractor_package_billing_mappings force row level security;

alter table public.contractor_package_billing_mapping_audit_events enable row level security;
alter table public.contractor_package_billing_mapping_audit_events force row level security;

revoke all on table public.contractor_package_billing_mappings from public;
revoke all on table public.contractor_package_billing_mappings from anon;
revoke all on table public.contractor_package_billing_mappings from authenticated;

revoke all on table public.contractor_package_billing_mapping_audit_events from public;
revoke all on table public.contractor_package_billing_mapping_audit_events from anon;
revoke all on table public.contractor_package_billing_mapping_audit_events from authenticated;

grant select on table public.contractor_package_billing_mappings to service_role;
grant select on table public.contractor_package_billing_mapping_audit_events to service_role;

comment on table public.contractor_package_billing_mappings is
  'Read-only provider mapping readiness foundation for future package assignment reconciliation. This table stores internal references and safe summaries only; it does not call Stripe, execute billing, create/update/cancel subscriptions, collect payments, enforce entitlements, gate modules, mutate package assignments, change contractor permissions, or affect runtime behavior.';

comment on table public.contractor_package_billing_mapping_audit_events is
  'Read-only audit evidence for contractor package billing/provider mapping reconciliation. No browser/client write path, provider mutation, Stripe call, subscription operation, billing execution, entitlement enforcement, module gate, package assignment mutation, reporting/export behavior, automation, AI behavior, or starter-pack provisioning change is implemented here.';

comment on column public.contractor_package_billing_mappings.provider_customer_reference is
  'Provider reference only. Do not store provider secret tokens, service-role keys, raw provider payloads, payment method details, card data, bank data, or customer PII beyond provider ids.';

comment on column public.contractor_package_billing_mappings.provider_subscription_reference is
  'Provider subscription reference only. This does not create, update, cancel, or verify a subscription.';

comment on column public.contractor_package_billing_mappings.expected_provider_state_snapshot is
  'Safe expected provider-state summary object only. Do not store provider secrets, raw provider payload dumps, card/bank/payment method details, or service-role keys.';

comment on column public.contractor_package_billing_mappings.observed_provider_state_snapshot is
  'Safe observed provider-state summary object only. Do not store provider secrets, raw provider payload dumps, card/bank/payment method details, or service-role keys.';

comment on column public.contractor_package_billing_mappings.mapping_snapshot is
  'Safe mapping summary object only. It is not billing execution truth, entitlement truth, module gating truth, or runtime behavior.';

comment on column public.contractor_package_billing_mapping_audit_events.before_snapshot is
  'Safe JSON object summary only. Do not store provider secrets, raw provider payload dumps, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_billing_mapping_audit_events.after_snapshot is
  'Safe JSON object summary only. Do not store provider secrets, raw provider payload dumps, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_billing_mapping_audit_events.metadata is
  'Safe audit metadata object only. Do not store provider secrets, raw provider payload dumps, payment data, service-role keys, or card/payment-method details.';
