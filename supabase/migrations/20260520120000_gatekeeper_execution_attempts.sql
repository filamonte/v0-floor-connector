create unique index if not exists gatekeeper_action_suggestions_company_id_id_unique_idx on public.gatekeeper_action_suggestions (company_id, id);

create table if not exists public.gatekeeper_execution_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  suggestion_id uuid not null,
  source_artifact_id uuid,
  source_thread_id uuid,
  source_message_id uuid,
  action_type text not null,
  execution_owner text not null,
  risk_tier text not null,
  status text not null default 'draft',
  idempotency_key text not null,
  requested_by uuid references public.users(id) on delete set null,
  requested_at timestamptz,
  executed_by uuid references public.users(id) on delete set null,
  executed_at timestamptz,
  result_subject_type text,
  result_subject_id uuid,
  validated_payload jsonb,
  proposed_payload_snapshot jsonb,
  validation_errors jsonb not null default '[]'::jsonb,
  execution_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.users(id) on delete restrict,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gatekeeper_execution_attempts_suggestion_company_fkey
    foreign key (company_id, suggestion_id)
    references public.gatekeeper_action_suggestions(company_id, id)
    on delete cascade,
  constraint gatekeeper_execution_attempts_artifact_company_fkey
    foreign key (company_id, source_artifact_id)
    references public.gatekeeper_artifacts(company_id, id)
    on delete set null (source_artifact_id),
  constraint gatekeeper_execution_attempts_thread_company_fkey
    foreign key (company_id, source_thread_id)
    references public.communication_threads(company_id, id)
    on delete set null (source_thread_id),
  constraint gatekeeper_execution_attempts_message_company_fkey
    foreign key (company_id, source_message_id)
    references public.communication_messages(company_id, id)
    on delete set null (source_message_id),
  constraint gatekeeper_execution_attempts_action_type_check
    check (
      action_type in (
        'create_opportunity',
        'update_opportunity',
        'schedule_site_assessment',
        'create_task_later',
        'send_followup_later',
        'update_project_notes',
        'flag_estimate_review',
        'flag_invoice_review',
        'flag_contract_review'
      )
    ),
  constraint gatekeeper_execution_attempts_owner_check
    check (
      execution_owner in (
        'opportunities',
        'projects',
        'schedule_jobs',
        'work_items',
        'communications',
        'estimates',
        'invoices',
        'contracts',
        'none'
      )
    ),
  constraint gatekeeper_execution_attempts_risk_tier_check
    check (
      risk_tier in (
        'low_internal',
        'medium_internal',
        'high_customer_facing',
        'high_schedule',
        'high_financial_legal',
        'forbidden'
      )
    ),
  constraint gatekeeper_execution_attempts_status_check
    check (
      status in (
        'draft',
        'confirmation_started',
        'validation_failed',
        'execution_requested',
        'executed',
        'failed',
        'canceled',
        'superseded'
      )
    ),
  constraint gatekeeper_execution_attempts_idempotency_not_blank
    check (length(btrim(idempotency_key)) > 0),
  constraint gatekeeper_execution_attempts_result_subject_pair_check
    check (
      (result_subject_type is null and result_subject_id is null)
      or (result_subject_type is not null and result_subject_id is not null)
    ),
  constraint gatekeeper_execution_attempts_result_subject_not_blank
    check (
      result_subject_type is null
      or length(btrim(result_subject_type)) > 0
    ),
  constraint gatekeeper_execution_attempts_executed_state_check
    check (
      status <> 'executed'
      or (
        executed_by is not null
        and executed_at is not null
        and result_subject_type is not null
        and result_subject_id is not null
      )
    ),
  constraint gatekeeper_execution_attempts_requested_state_check
    check (
      status not in ('execution_requested', 'executed', 'failed')
      or (requested_by is not null and requested_at is not null)
    ),
  constraint gatekeeper_execution_attempts_validation_errors_array_check
    check (jsonb_typeof(validation_errors) = 'array'),
  constraint gatekeeper_execution_attempts_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint gatekeeper_execution_attempts_validated_payload_object_check
    check (
      validated_payload is null
      or jsonb_typeof(validated_payload) = 'object'
    ),
  constraint gatekeeper_execution_attempts_payload_snapshot_object_check
    check (
      proposed_payload_snapshot is null
      or jsonb_typeof(proposed_payload_snapshot) = 'object'
    ),
  constraint gatekeeper_execution_attempts_error_not_blank
    check (execution_error is null or length(btrim(execution_error)) > 0)
);

create unique index if not exists gatekeeper_execution_attempts_company_id_id_unique_idx
  on public.gatekeeper_execution_attempts (company_id, id);

create unique index if not exists gatekeeper_execution_attempts_company_idempotency_unique_idx
  on public.gatekeeper_execution_attempts (company_id, idempotency_key);

create index if not exists gatekeeper_execution_attempts_company_suggestion_idx
  on public.gatekeeper_execution_attempts (company_id, suggestion_id, created_at desc);

create index if not exists gatekeeper_execution_attempts_company_status_idx
  on public.gatekeeper_execution_attempts (company_id, status, created_at desc);

create index if not exists gatekeeper_execution_attempts_company_action_type_idx
  on public.gatekeeper_execution_attempts (company_id, action_type, created_at desc);

create index if not exists gatekeeper_execution_attempts_company_result_subject_idx
  on public.gatekeeper_execution_attempts (
    company_id,
    result_subject_type,
    result_subject_id,
    created_at desc
  )
  where result_subject_type is not null and result_subject_id is not null;

drop trigger if exists gatekeeper_execution_attempts_set_updated_at
  on public.gatekeeper_execution_attempts;
create trigger gatekeeper_execution_attempts_set_updated_at
before update on public.gatekeeper_execution_attempts
for each row
execute function public.set_updated_at();

alter table public.gatekeeper_execution_attempts enable row level security;
alter table public.gatekeeper_execution_attempts force row level security;

drop policy if exists gatekeeper_execution_attempts_select_by_membership
  on public.gatekeeper_execution_attempts;
create policy gatekeeper_execution_attempts_select_by_membership
on public.gatekeeper_execution_attempts
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists gatekeeper_execution_attempts_insert_by_membership
  on public.gatekeeper_execution_attempts;
create policy gatekeeper_execution_attempts_insert_by_membership
on public.gatekeeper_execution_attempts
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (updated_by is null or updated_by = (select auth.uid()))
  and (select public.is_active_company_member(company_id))
);

drop policy if exists gatekeeper_execution_attempts_update_by_membership
  on public.gatekeeper_execution_attempts;
create policy gatekeeper_execution_attempts_update_by_membership
on public.gatekeeper_execution_attempts
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check (
  updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

grant select, insert, update
on public.gatekeeper_execution_attempts
to authenticated;

comment on table public.gatekeeper_execution_attempts is
  'Tenant-scoped GateKeeper controlled execution ledger. Stores execution requests, attempts, status, idempotency, result linkage, and failure metadata only; it does not execute suggestions or own canonical workflow mutations.';
comment on column public.gatekeeper_execution_attempts.suggestion_id is
  'Reviewed GateKeeper action suggestion that produced this controlled execution attempt. The suggestion review state remains separate from execution state.';
comment on column public.gatekeeper_execution_attempts.idempotency_key is
  'Tenant-scoped idempotency key for preventing duplicate controlled execution attempts.';
comment on column public.gatekeeper_execution_attempts.status is
  'Controlled execution attempt state. This is separate from gatekeeper_action_suggestions.status, which remains human review state only.';
comment on column public.gatekeeper_execution_attempts.result_subject_type is
  'Optional canonical record type created or updated by a future owning workflow. GateKeeper does not directly mutate that record.';
comment on column public.gatekeeper_execution_attempts.result_subject_id is
  'Optional canonical record id created or updated by a future owning workflow.';
comment on column public.gatekeeper_execution_attempts.validated_payload is
  'Snapshot of a future owning workflow validated payload. This table does not make proposed payloads trustworthy by itself.';
comment on column public.gatekeeper_execution_attempts.proposed_payload_snapshot is
  'Snapshot of the original untrusted GateKeeper proposed payload for audit comparison.';
comment on column public.gatekeeper_execution_attempts.validation_errors is
  'Structured validation/preflight errors for the execution attempt. Keep safe and bounded; do not store secrets or raw provider payloads.';
comment on column public.gatekeeper_execution_attempts.metadata is
  'Safe execution metadata only. Do not store provider secrets, auth tokens, raw transcripts, payment data, or canonical record snapshots.';
