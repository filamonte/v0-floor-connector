create table if not exists public.platform_starter_pack_provisioning_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  run_id uuid references public.platform_starter_pack_provisioning_runs(id) on delete set null,
  starter_pack_id uuid references public.platform_starter_packs(id) on delete set null,
  organization_id uuid references public.companies(id) on delete set null,
  attempted_by uuid references public.users(id) on delete set null,
  attempt_type text not null,
  outcome text not null,
  reason_code text not null,
  safe_message text not null,
  review_status text,
  run_status text,
  metadata jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default timezone('utc', now()),
  constraint platform_starter_pack_provisioning_attempts_type_check
    check (attempt_type in ('execute')),
  constraint platform_starter_pack_provisioning_attempts_outcome_check
    check (
      outcome in (
        'rejected',
        'blocked',
        'failed_before_execution',
        'already_completed'
      )
    ),
  constraint platform_starter_pack_provisioning_attempts_reason_check
    check (btrim(reason_code) <> '' and length(reason_code) <= 120),
  constraint platform_starter_pack_provisioning_attempts_message_check
    check (btrim(safe_message) <> '' and length(safe_message) <= 500),
  constraint platform_starter_pack_provisioning_attempts_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists platform_starter_pack_provisioning_attempts_attempted_idx
  on public.platform_starter_pack_provisioning_attempts (attempted_at desc);

create index if not exists platform_starter_pack_provisioning_attempts_run_idx
  on public.platform_starter_pack_provisioning_attempts (
    run_id,
    attempted_at desc
  )
  where run_id is not null;

create index if not exists platform_starter_pack_provisioning_attempts_pack_idx
  on public.platform_starter_pack_provisioning_attempts (
    starter_pack_id,
    attempted_at desc
  )
  where starter_pack_id is not null;

create index if not exists platform_starter_pack_provisioning_attempts_org_idx
  on public.platform_starter_pack_provisioning_attempts (
    organization_id,
    attempted_at desc
  )
  where organization_id is not null;

create index if not exists platform_starter_pack_provisioning_attempts_outcome_idx
  on public.platform_starter_pack_provisioning_attempts (
    outcome,
    attempted_at desc
  );

alter table public.platform_starter_pack_provisioning_attempts enable row level security;
alter table public.platform_starter_pack_provisioning_attempts force row level security;

revoke all on table public.platform_starter_pack_provisioning_attempts from anon;
revoke all on table public.platform_starter_pack_provisioning_attempts from authenticated;

comment on table public.platform_starter_pack_provisioning_attempts is
  'Server-side operation attempt log for rejected, blocked, failed-before-execution, or idempotent no-op starter-pack provisioning execution attempts. These rows do not provision contractor-owned records.';
comment on column public.platform_starter_pack_provisioning_attempts.run_id is
  'Optional audit run associated with the rejected or no-op execution attempt.';
comment on column public.platform_starter_pack_provisioning_attempts.attempt_type is
  'Operation attempted. Phase 5J supports execute only.';
comment on column public.platform_starter_pack_provisioning_attempts.outcome is
  'Safe operator outcome for a non-successful or idempotent no-op attempt; successful executions remain recorded by provisioning run/item audit rows.';
comment on column public.platform_starter_pack_provisioning_attempts.safe_message is
  'User-safe operator message. Do not store secrets, raw provider errors, or raw database errors here.';
comment on column public.platform_starter_pack_provisioning_attempts.metadata is
  'Small safe context object for operator observability. Do not store large template/catalog payloads, secrets, or raw service errors.';
