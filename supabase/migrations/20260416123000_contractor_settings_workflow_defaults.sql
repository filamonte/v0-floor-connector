alter table public.organization_financial_settings
  add column if not exists default_retainage_percentage numeric(5, 2) not null default 0;

alter table public.organization_financial_settings
  drop constraint if exists organization_financial_settings_default_retainage_percentage_range_check;
alter table public.organization_financial_settings
  add constraint organization_financial_settings_default_retainage_percentage_range_check
  check (default_retainage_percentage >= 0 and default_retainage_percentage <= 100);

create table if not exists public.organization_workflow_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  approved_estimate_contract_template_id uuid,
  require_contract_internal_approval boolean not null default false,
  require_deposit_before_job_scheduling boolean not null default false,
  default_deposit_percentage numeric(5, 2) not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_workflow_settings_contract_template_company_fkey
    foreign key (company_id, approved_estimate_contract_template_id)
    references public.document_templates(company_id, id)
    on delete set null,
  constraint organization_workflow_settings_default_deposit_percentage_range_check
    check (default_deposit_percentage >= 0 and default_deposit_percentage <= 100)
);

drop trigger if exists set_organization_workflow_settings_updated_at on public.organization_workflow_settings;
create trigger set_organization_workflow_settings_updated_at
before update on public.organization_workflow_settings
for each row
execute function public.set_updated_at();

alter table public.organization_workflow_settings enable row level security;
alter table public.organization_workflow_settings force row level security;

drop policy if exists organization_workflow_settings_select_by_membership on public.organization_workflow_settings;
create policy organization_workflow_settings_select_by_membership
on public.organization_workflow_settings
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists organization_workflow_settings_insert_by_membership on public.organization_workflow_settings;
create policy organization_workflow_settings_insert_by_membership
on public.organization_workflow_settings
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists organization_workflow_settings_update_by_membership on public.organization_workflow_settings;
create policy organization_workflow_settings_update_by_membership
on public.organization_workflow_settings
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create or replace function public.ensure_company_workflow_settings(
  target_company_id uuid,
  acting_user_id uuid default null
)
returns public.organization_workflow_settings
language plpgsql
security definer
set search_path = ''
as $$
declare
  settings_row public.organization_workflow_settings;
begin
  insert into public.organization_workflow_settings (
    company_id,
    created_by,
    updated_by
  )
  values (
    target_company_id,
    acting_user_id,
    acting_user_id
  )
  on conflict (company_id) do nothing;

  select *
  into settings_row
  from public.organization_workflow_settings
  where company_id = target_company_id;

  return settings_row;
end;
$$;

comment on column public.organization_financial_settings.default_retainage_percentage is 'Organization-level retainage baseline used to prefill new customer defaults and contractor workflow configuration.';
comment on table public.organization_workflow_settings is 'Organization-scoped contractor workflow defaults for the estimate to contract to invoice slice. This table stores settings that shape contractor-side document and financial workflow behavior without creating module-specific admin silos.';
comment on column public.organization_workflow_settings.approved_estimate_contract_template_id is 'Preferred contract template for the approved-estimate-to-contract workflow when the contractor organization wants a workflow-specific template assignment.';
comment on column public.organization_workflow_settings.require_contract_internal_approval is 'Whether the contractor organization expects an internal approval checkpoint before contracts are sent out for signature or execution.';
comment on column public.organization_workflow_settings.require_deposit_before_job_scheduling is 'Whether the contractor organization treats deposit readiness as part of job scheduling readiness in the current workflow configuration.';
comment on column public.organization_workflow_settings.default_deposit_percentage is 'Organization-level deposit percentage preference for financial-readiness workflows. Stored canonically even before broader enforcement UX is added.';
