do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'site_assessment_status'
  ) then
    create type public.site_assessment_status as enum (
      'pending',
      'scheduled',
      'completed'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'commercial_readiness_status'
  ) then
    create type public.commercial_readiness_status as enum (
      'not_ready',
      'waiting_on_estimate_approval',
      'waiting_on_contract',
      'waiting_on_internal_approval',
      'waiting_on_signature',
      'waiting_on_deposit',
      'waiting_on_financing',
      'ready_to_schedule'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'contract_internal_approval_status'
  ) then
    create type public.contract_internal_approval_status as enum (
      'not_required',
      'pending',
      'approved',
      'rejected'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'signature_readiness_status'
  ) then
    create type public.signature_readiness_status as enum (
      'draft',
      'ready_to_send',
      'out_for_signature',
      'signed'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'financing_status'
  ) then
    create type public.financing_status as enum (
      'not_applicable',
      'pending',
      'approved',
      'declined'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'invoice_workflow_role'
  ) then
    create type public.invoice_workflow_role as enum (
      'standard',
      'deposit'
    );
  end if;
end
$$;

alter table public.opportunities
  add column if not exists site_assessment_status public.site_assessment_status not null default 'pending',
  add column if not exists site_assessment_scheduled_at timestamptz,
  add column if not exists site_assessment_completed_at timestamptz,
  add column if not exists requirements_summary text;

update public.opportunities
set
  site_assessment_status = case
    when status = 'site_assessment_complete' then 'completed'::public.site_assessment_status
    when status = 'site_assessment_scheduled' then 'scheduled'::public.site_assessment_status
    else site_assessment_status
  end,
  site_assessment_scheduled_at = case
    when status = 'site_assessment_scheduled' and site_assessment_scheduled_at is null
      then timezone('utc', now())
    else site_assessment_scheduled_at
  end,
  site_assessment_completed_at = case
    when status = 'site_assessment_complete' and site_assessment_completed_at is null
      then timezone('utc', now())
    else site_assessment_completed_at
  end;

alter table public.projects
  add column if not exists commercial_readiness_status public.commercial_readiness_status not null default 'waiting_on_estimate_approval',
  add column if not exists financing_status public.financing_status not null default 'not_applicable',
  add column if not exists ready_to_schedule_at timestamptz;

alter table public.contracts
  add column if not exists internal_approval_status public.contract_internal_approval_status not null default 'not_required',
  add column if not exists internal_approved_at timestamptz,
  add column if not exists signature_readiness_status public.signature_readiness_status not null default 'draft';

update public.contracts
set signature_readiness_status = case
  when status = 'signed' then 'signed'::public.signature_readiness_status
  when status in ('sent', 'viewed') then 'out_for_signature'::public.signature_readiness_status
  else signature_readiness_status
end;

alter table public.invoices
  add column if not exists workflow_role public.invoice_workflow_role not null default 'standard';

alter table public.organization_workflow_settings
  add column if not exists require_contract_signature_before_job_scheduling boolean not null default true,
  add column if not exists require_financing_approval_before_job_scheduling boolean not null default false;

alter table public.platform_workflow_defaults
  add column if not exists require_contract_signature_before_job_scheduling boolean not null default true,
  add column if not exists require_financing_approval_before_job_scheduling boolean not null default false;

comment on column public.opportunities.site_assessment_status is 'Canonical site assessment readiness state for the opportunity before commercial scope is finalized.';
comment on column public.opportunities.site_assessment_scheduled_at is 'When the upstream commercial/site assessment visit was scheduled.';
comment on column public.opportunities.site_assessment_completed_at is 'When the upstream commercial/site assessment work was completed.';
comment on column public.opportunities.requirements_summary is 'Shared requirements and scope notes gathered before estimating and contract generation.';

comment on column public.projects.commercial_readiness_status is 'Current upstream commercial-readiness state for the project before it is eligible for operational scheduling.';
comment on column public.projects.financing_status is 'Minimal financing-readiness state used by the commercial workflow before scheduling.';
comment on column public.projects.ready_to_schedule_at is 'Timestamp recorded when the project first becomes commercially ready for scheduling.';

comment on column public.contracts.internal_approval_status is 'Internal commercial approval state for the contract before it is sent or treated as schedule-ready.';
comment on column public.contracts.internal_approved_at is 'Timestamp for when internal contract approval was completed.';
comment on column public.contracts.signature_readiness_status is 'Shared signature-readiness state used by the commercial workflow before scheduling.';

comment on column public.invoices.workflow_role is 'How the invoice participates in the upstream commercial workflow. Deposit invoices can be used as readiness gates without creating a separate financial entity.';

comment on column public.organization_workflow_settings.require_contract_signature_before_job_scheduling is 'Whether contractor workflow requires a signed contract before work is considered ready to schedule.';
comment on column public.organization_workflow_settings.require_financing_approval_before_job_scheduling is 'Whether contractor workflow requires financing approval before work is considered ready to schedule.';
comment on column public.platform_workflow_defaults.require_contract_signature_before_job_scheduling is 'Platform starter default for requiring contract signature before scheduling readiness.';
comment on column public.platform_workflow_defaults.require_financing_approval_before_job_scheduling is 'Platform starter default for requiring financing approval before scheduling readiness.';
