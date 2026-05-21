do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'automation_run_status'
  ) then
    create type public.automation_run_status as enum (
      'skipped',
      'executed',
      'blocked',
      'failed'
    );
  end if;
end
$$;

create table if not exists public.automation_runs (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category text not null,
  trigger_type text not null,
  source_table text not null,
  source_record_id uuid,
  source_event_id uuid,
  subject_type public.canonical_record_subject_type,
  subject_id uuid,
  customer_id uuid,
  project_id uuid,
  idempotency_key text not null,
  status public.automation_run_status not null,
  reason text,
  blockers jsonb not null default '[]'::jsonb,
  recipient_user_ids jsonb not null default '[]'::jsonb,
  notification_event_id uuid references public.notification_events(id) on delete set null,
  template_version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  executed_at timestamptz,
  created_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint automation_runs_category_check check (
    category in (
      'customer_message_received',
      'estimate_awaiting_approval',
      'contract_awaiting_signature',
      'contract_signed',
      'deposit_paid_ready_to_schedule',
      'payment_failed',
      'invoice_overdue',
      'change_order_approved',
      'schedule_reminder',
      'crew_assignment_reminder'
    )
  ),
  constraint automation_runs_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete set null (customer_id),
  constraint automation_runs_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete set null (project_id)
);

create unique index if not exists automation_runs_company_idempotency_key_idx
  on public.automation_runs (company_id, idempotency_key);

create index if not exists automation_runs_company_created_idx
  on public.automation_runs (company_id, created_at desc);

create index if not exists automation_runs_company_category_idx
  on public.automation_runs (company_id, category, created_at desc);

create index if not exists automation_runs_company_subject_idx
  on public.automation_runs (company_id, subject_type, subject_id, created_at desc)
  where subject_type is not null and subject_id is not null;

create index if not exists automation_runs_company_notification_event_idx
  on public.automation_runs (company_id, notification_event_id)
  where notification_event_id is not null;

drop trigger if exists automation_runs_set_updated_at on public.automation_runs;
create trigger automation_runs_set_updated_at
before update on public.automation_runs
for each row
execute function public.set_updated_at();

alter table public.automation_runs enable row level security;
alter table public.automation_runs force row level security;

drop policy if exists automation_runs_select_by_scope on public.automation_runs;
create policy automation_runs_select_by_scope
on public.automation_runs
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists automation_runs_insert_by_scope on public.automation_runs;
create policy automation_runs_insert_by_scope
on public.automation_runs
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists automation_runs_update_by_scope on public.automation_runs;
create policy automation_runs_update_by_scope
on public.automation_runs
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.automation_runs is 'Tenant-scoped audit and idempotency ledger for internal notification-only automation execution.';
