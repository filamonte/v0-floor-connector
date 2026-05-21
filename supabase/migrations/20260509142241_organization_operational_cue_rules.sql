create table if not exists public.organization_operational_cue_rules (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.companies(id) on delete cascade,
  cue_key text not null,
  subject_type text not null,
  enabled boolean not null default true,
  threshold_days integer,
  urgency text not null default 'normal',
  owner_strategy text not null default 'record_owner',
  escalation_days integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_operational_cue_rules_unique_key
    unique (organization_id, cue_key),
  constraint organization_operational_cue_rules_cue_key_check
    check (
      cue_key in (
        'estimate_sent_followup',
        'contract_sent_unsigned',
        'contract_viewed_unsigned',
        'invoice_overdue',
        'deposit_invoice_unpaid',
        'job_ready_unscheduled',
        'job_scheduled_missing_crew'
      )
    ),
  constraint organization_operational_cue_rules_subject_type_check
    check (subject_type in ('estimate', 'contract', 'invoice', 'job')),
  constraint organization_operational_cue_rules_urgency_check
    check (urgency in ('normal', 'high', 'critical')),
  constraint organization_operational_cue_rules_owner_strategy_check
    check (owner_strategy in ('record_owner', 'organization')),
  constraint organization_operational_cue_rules_threshold_days_check
    check (threshold_days is null or threshold_days >= 0),
  constraint organization_operational_cue_rules_escalation_days_check
    check (escalation_days is null or escalation_days >= 0)
);

create index if not exists organization_operational_cue_rules_organization_idx
  on public.organization_operational_cue_rules(organization_id);

create index if not exists organization_operational_cue_rules_enabled_idx
  on public.organization_operational_cue_rules(organization_id, enabled);

drop trigger if exists set_organization_operational_cue_rules_updated_at
  on public.organization_operational_cue_rules;
create trigger set_organization_operational_cue_rules_updated_at
before update on public.organization_operational_cue_rules
for each row
execute function public.set_updated_at();

alter table public.organization_operational_cue_rules enable row level security;
alter table public.organization_operational_cue_rules force row level security;

drop policy if exists organization_operational_cue_rules_select_by_membership
  on public.organization_operational_cue_rules;
create policy organization_operational_cue_rules_select_by_membership
on public.organization_operational_cue_rules
for select
to authenticated
using ((select public.is_active_company_member(organization_id)));

drop policy if exists organization_operational_cue_rules_insert_by_membership
  on public.organization_operational_cue_rules;
create policy organization_operational_cue_rules_insert_by_membership
on public.organization_operational_cue_rules
for insert
to authenticated
with check ((select public.is_active_company_member(organization_id)));

drop policy if exists organization_operational_cue_rules_update_by_membership
  on public.organization_operational_cue_rules;
create policy organization_operational_cue_rules_update_by_membership
on public.organization_operational_cue_rules
for update
to authenticated
using ((select public.is_active_company_member(organization_id)))
with check ((select public.is_active_company_member(organization_id)));

grant select, insert, update
on public.organization_operational_cue_rules
to authenticated;

comment on table public.organization_operational_cue_rules is
  'Tenant-owned configurable operational cue rules. These rows store rule configuration only; operational cue instances are derived from canonical records at query time.';

comment on column public.organization_operational_cue_rules.cue_key is
  'Supported deterministic operational cue key. This first slice intentionally avoids a generic expression builder.';

comment on column public.organization_operational_cue_rules.subject_type is
  'Canonical record type the derived cue points to: estimate, contract, invoice, or job.';

comment on column public.organization_operational_cue_rules.owner_strategy is
  'Future ownership resolution strategy for derived cues. Current dashboard derivation falls back to organization-wide visibility when record ownership is unavailable.';
