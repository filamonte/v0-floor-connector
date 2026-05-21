create table if not exists public.contractor_package_billing_support_reviews (
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
  review_status text not null default 'pending_review',
  resolution_category text not null default 'provider_state_mismatch',
  provider_environment text not null default 'unknown',
  provider_reference_summary jsonb,
  reconciliation_evidence_snapshot jsonb,
  webhook_evidence_snapshot jsonb,
  operator_evidence_snapshot jsonb,
  rollback_recovery_snapshot jsonb,
  support_summary text,
  blocked_reason text,
  escalation_reason text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint contractor_package_billing_support_reviews_status_check
    check (
      review_status in (
        'pending_review',
        'awaiting_evidence',
        'awaiting_provider_confirmation',
        'approved_for_resolution',
        'resolution_blocked',
        'resolved',
        'archived'
      )
    ),
  constraint contractor_package_billing_support_reviews_category_check
    check (
      resolution_category in (
        'provider_state_mismatch',
        'duplicate_provider_subscription',
        'orphaned_provider_subscription',
        'stale_provider_mapping',
        'invalid_environment_mix',
        'unsupported_custom_contract',
        'webhook_replay_issue',
        'missing_provider_customer',
        'missing_provider_subscription',
        'manual_support_override_required'
      )
    ),
  constraint contractor_package_billing_support_reviews_environment_check
    check (provider_environment in ('sandbox', 'test', 'production', 'unknown')),
  constraint contractor_package_billing_support_reviews_provider_summary_object_check
    check (provider_reference_summary is null or jsonb_typeof(provider_reference_summary) = 'object'),
  constraint contractor_package_billing_support_reviews_reconciliation_snapshot_object_check
    check (reconciliation_evidence_snapshot is null or jsonb_typeof(reconciliation_evidence_snapshot) = 'object'),
  constraint contractor_package_billing_support_reviews_webhook_snapshot_object_check
    check (webhook_evidence_snapshot is null or jsonb_typeof(webhook_evidence_snapshot) = 'object'),
  constraint contractor_package_billing_support_reviews_operator_snapshot_object_check
    check (operator_evidence_snapshot is null or jsonb_typeof(operator_evidence_snapshot) = 'object'),
  constraint contractor_package_billing_support_reviews_rollback_snapshot_object_check
    check (rollback_recovery_snapshot is null or jsonb_typeof(rollback_recovery_snapshot) = 'object'),
  constraint contractor_package_billing_support_reviews_summary_check
    check (support_summary is null or length(btrim(support_summary)) > 0),
  constraint contractor_package_billing_support_reviews_blocked_reason_check
    check (
      blocked_reason is null
      or (
        length(btrim(blocked_reason)) > 0
        and review_status = 'resolution_blocked'
      )
    ),
  constraint contractor_package_billing_support_reviews_escalation_reason_check
    check (escalation_reason is null or length(btrim(escalation_reason)) > 0),
  constraint contractor_package_billing_support_reviews_resolved_evidence_check
    check (review_status <> 'resolved' or support_summary is not null),
  constraint contractor_package_billing_support_reviews_archived_state_check
    check (archived_at is null or review_status = 'archived')
);

create index if not exists contractor_package_billing_support_reviews_mapping_idx
  on public.contractor_package_billing_support_reviews (
    contractor_package_billing_mapping_id,
    review_status,
    created_at desc
  );

create index if not exists contractor_package_billing_support_reviews_assignment_idx
  on public.contractor_package_billing_support_reviews (
    contractor_package_assignment_id,
    review_status,
    created_at desc
  );

create index if not exists contractor_package_billing_support_reviews_company_idx
  on public.contractor_package_billing_support_reviews (
    company_id,
    review_status,
    provider_environment,
    created_at desc
  );

create index if not exists contractor_package_billing_support_reviews_package_idx
  on public.contractor_package_billing_support_reviews (
    package_definition_id,
    package_definition_version_id,
    review_status
  );

create index if not exists contractor_package_billing_support_reviews_status_category_idx
  on public.contractor_package_billing_support_reviews (
    review_status,
    resolution_category,
    provider_environment
  );

create index if not exists contractor_package_billing_support_reviews_attention_idx
  on public.contractor_package_billing_support_reviews (
    review_status,
    updated_at desc
  )
  where review_status in (
    'awaiting_evidence',
    'awaiting_provider_confirmation',
    'approved_for_resolution',
    'resolution_blocked'
  );

drop trigger if exists contractor_package_billing_support_reviews_set_updated_at
  on public.contractor_package_billing_support_reviews;
create trigger contractor_package_billing_support_reviews_set_updated_at
before update on public.contractor_package_billing_support_reviews
for each row
execute function public.set_updated_at();

create table if not exists public.contractor_package_billing_support_review_events (
  id uuid primary key default extensions.gen_random_uuid(),
  support_review_id uuid not null
    references public.contractor_package_billing_support_reviews(id) on delete restrict,
  contractor_package_billing_mapping_id uuid
    references public.contractor_package_billing_mappings(id) on delete set null,
  contractor_package_assignment_id uuid
    references public.contractor_package_assignments(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  event_type text not null,
  actor_id uuid references public.users(id) on delete set null,
  reason text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  metadata jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint contractor_package_billing_support_review_events_type_check
    check (
      event_type in (
        'support_review_created',
        'support_review_updated',
        'support_review_evidence_added',
        'support_review_provider_confirmation_requested',
        'support_review_provider_confirmation_received',
        'support_review_approved_for_resolution',
        'support_review_resolution_blocked',
        'support_review_resolved',
        'support_review_archived'
      )
    ),
  constraint contractor_package_billing_support_review_events_reason_check
    check (reason is null or length(btrim(reason)) > 0),
  constraint contractor_package_billing_support_review_events_before_object_check
    check (before_snapshot is null or jsonb_typeof(before_snapshot) = 'object'),
  constraint contractor_package_billing_support_review_events_after_object_check
    check (after_snapshot is null or jsonb_typeof(after_snapshot) = 'object'),
  constraint contractor_package_billing_support_review_events_metadata_object_check
    check (metadata is null or jsonb_typeof(metadata) = 'object')
);

create index if not exists contractor_package_billing_support_review_events_review_timeline_idx
  on public.contractor_package_billing_support_review_events (
    support_review_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_support_review_events_mapping_timeline_idx
  on public.contractor_package_billing_support_review_events (
    contractor_package_billing_mapping_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_support_review_events_assignment_idx
  on public.contractor_package_billing_support_review_events (
    contractor_package_assignment_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_support_review_events_company_idx
  on public.contractor_package_billing_support_review_events (
    company_id,
    occurred_at desc,
    created_at desc
  );

create index if not exists contractor_package_billing_support_review_events_type_recent_idx
  on public.contractor_package_billing_support_review_events (
    event_type,
    occurred_at desc
  );

alter table public.contractor_package_billing_support_reviews enable row level security;
alter table public.contractor_package_billing_support_reviews force row level security;

alter table public.contractor_package_billing_support_review_events enable row level security;
alter table public.contractor_package_billing_support_review_events force row level security;

revoke all on table public.contractor_package_billing_support_reviews from public;
revoke all on table public.contractor_package_billing_support_reviews from anon;
revoke all on table public.contractor_package_billing_support_reviews from authenticated;

revoke all on table public.contractor_package_billing_support_review_events from public;
revoke all on table public.contractor_package_billing_support_review_events from anon;
revoke all on table public.contractor_package_billing_support_review_events from authenticated;

grant select on table public.contractor_package_billing_support_reviews to service_role;
grant select on table public.contractor_package_billing_support_review_events to service_role;

comment on table public.contractor_package_billing_support_reviews is
  'Read-only support-review evidence foundation for future package billing/provider reconciliation. This table stores safe evidence summaries only; it does not call Stripe/providers, execute corrective actions, operate subscriptions, execute billing, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, report/export, run automation/AI, or affect runtime behavior.';

comment on table public.contractor_package_billing_support_review_events is
  'Read-only event evidence for package billing/provider support reviews. No browser/client write path, corrective action execution, provider mutation, Stripe/provider call, subscription operation, billing execution, package assignment mutation, entitlement enforcement, module gate, reporting/export behavior, automation, AI behavior, or starter-pack provisioning change is implemented here.';

comment on column public.contractor_package_billing_support_reviews.provider_reference_summary is
  'Safe provider reference summary object only. Do not store provider secret tokens, service-role keys, raw provider payloads, payment method details, card data, or bank data.';

comment on column public.contractor_package_billing_support_reviews.reconciliation_evidence_snapshot is
  'Safe reconciliation evidence summary object only. Do not store raw provider payload dumps, provider secrets, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_billing_support_reviews.webhook_evidence_snapshot is
  'Safe webhook evidence summary object only. Do not store raw provider webhook payloads, signatures, secrets, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_billing_support_reviews.operator_evidence_snapshot is
  'Safe operator evidence summary object only. It is not corrective-action authority, billing execution truth, entitlement truth, module gating truth, or runtime behavior.';

comment on column public.contractor_package_billing_support_reviews.rollback_recovery_snapshot is
  'Safe rollback/recovery readiness summary only. It does not execute rollback, recovery, provider mutation, subscription operation, package assignment mutation, or runtime behavior.';

comment on column public.contractor_package_billing_support_review_events.before_snapshot is
  'Safe JSON object summary only. Do not store provider secrets, raw provider payload dumps, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_billing_support_review_events.after_snapshot is
  'Safe JSON object summary only. Do not store provider secrets, raw provider payload dumps, payment data, service-role keys, or card/payment-method details.';

comment on column public.contractor_package_billing_support_review_events.metadata is
  'Safe support-review event metadata object only. Do not store provider secrets, raw provider payload dumps, payment data, service-role keys, or card/payment-method details.';
