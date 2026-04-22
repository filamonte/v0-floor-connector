create unique index if not exists opportunities_company_id_id_unique_idx
  on public.opportunities (company_id, id);

alter table public.estimates
  add column if not exists opportunity_id uuid;

with existing_project_opportunities as (
  select distinct on (company_id, project_id)
    company_id,
    project_id,
    id
  from public.opportunities
  where project_id is not null
  order by company_id, project_id, updated_at desc, created_at desc
)
update public.estimates as estimates
set opportunity_id = existing_project_opportunities.id
from existing_project_opportunities
where estimates.company_id = existing_project_opportunities.company_id
  and estimates.project_id = existing_project_opportunities.project_id
  and estimates.opportunity_id is null;

insert into public.opportunities (
  company_id,
  primary_contact_id,
  customer_id,
  project_id,
  status,
  title,
  site_name,
  prospect_name,
  prospect_company_name,
  email,
  phone,
  address_line_1,
  address_line_2,
  city,
  state_region,
  postal_code,
  country_code,
  notes,
  site_assessment_status,
  requirements_summary,
  qualified_at,
  converted_at,
  created_by,
  updated_by,
  created_at,
  updated_at
)
select distinct on (estimates.company_id, estimates.project_id)
  estimates.company_id,
  customer_contact.contact_id,
  estimates.customer_id,
  estimates.project_id,
  case
    when estimates.status = 'approved' then 'converted'::public.opportunity_status
    when estimates.status = 'sent' then 'proposal_sent'::public.opportunity_status
    else 'estimating'::public.opportunity_status
  end,
  coalesce(nullif(btrim(projects.name), ''), nullif(btrim(customers.name), ''), estimates.reference_number),
  projects.name,
  coalesce(nullif(btrim(contacts.display_name), ''), nullif(btrim(customers.name), ''), estimates.reference_number),
  coalesce(contacts.company_name, customers.company_name),
  coalesce(contacts.email, customers.email),
  coalesce(contacts.phone, customers.phone),
  projects.address_line_1,
  projects.address_line_2,
  projects.city,
  projects.state_region,
  projects.postal_code,
  projects.country_code,
  estimates.notes,
  'completed'::public.site_assessment_status,
  coalesce(projects.description, estimates.notes),
  estimates.created_at,
  estimates.created_at,
  estimates.created_by,
  estimates.updated_by,
  estimates.created_at,
  estimates.updated_at
from public.estimates as estimates
join public.projects
  on projects.company_id = estimates.company_id
 and projects.id = estimates.project_id
join public.customers
  on customers.company_id = estimates.company_id
 and customers.id = estimates.customer_id
left join lateral (
  select customer_contacts.contact_id
  from public.customer_contacts as customer_contacts
  where customer_contacts.company_id = estimates.company_id
    and customer_contacts.customer_id = estimates.customer_id
  order by customer_contacts.is_primary desc, customer_contacts.created_at asc
  limit 1
) as customer_contact on true
left join public.contacts
  on contacts.company_id = estimates.company_id
 and contacts.id = customer_contact.contact_id
where estimates.opportunity_id is null
  and not exists (
    select 1
    from public.opportunities as opportunities
    where opportunities.company_id = estimates.company_id
      and opportunities.project_id = estimates.project_id
  );

with backfilled_project_opportunities as (
  select distinct on (company_id, project_id)
    company_id,
    project_id,
    id
  from public.opportunities
  where project_id is not null
  order by company_id, project_id, updated_at desc, created_at desc
)
update public.estimates as estimates
set opportunity_id = backfilled_project_opportunities.id
from backfilled_project_opportunities
where estimates.company_id = backfilled_project_opportunities.company_id
  and estimates.project_id = backfilled_project_opportunities.project_id
  and estimates.opportunity_id is null;

alter table public.estimates
  add constraint estimates_opportunity_company_fkey
  foreign key (company_id, opportunity_id)
  references public.opportunities(company_id, id)
  on delete restrict;

create index if not exists estimates_opportunity_id_idx
  on public.estimates (opportunity_id);

alter table public.estimates
  alter column opportunity_id set not null;

comment on column public.estimates.opportunity_id is 'Canonical pre-sale opportunity that every estimate must remain linked to, even when estimate creation starts from customer or standalone context.';

alter table public.organization_workflow_settings
  add column if not exists next_estimate_number integer,
  add column if not exists next_invoice_number integer;

alter table public.organization_workflow_settings
  drop constraint if exists organization_workflow_settings_next_estimate_number_positive_check;
alter table public.organization_workflow_settings
  add constraint organization_workflow_settings_next_estimate_number_positive_check
  check (next_estimate_number is null or next_estimate_number > 0);

alter table public.organization_workflow_settings
  drop constraint if exists organization_workflow_settings_next_invoice_number_positive_check;
alter table public.organization_workflow_settings
  add constraint organization_workflow_settings_next_invoice_number_positive_check
  check (next_invoice_number is null or next_invoice_number > 0);

alter table public.platform_workflow_defaults
  add column if not exists default_estimate_start_number integer not null default 3350,
  add column if not exists default_invoice_start_number integer not null default 3350;

alter table public.platform_workflow_defaults
  drop constraint if exists platform_workflow_defaults_default_estimate_start_number_positive_check;
alter table public.platform_workflow_defaults
  add constraint platform_workflow_defaults_default_estimate_start_number_positive_check
  check (default_estimate_start_number > 0);

alter table public.platform_workflow_defaults
  drop constraint if exists platform_workflow_defaults_default_invoice_start_number_positive_check;
alter table public.platform_workflow_defaults
  add constraint platform_workflow_defaults_default_invoice_start_number_positive_check
  check (default_invoice_start_number > 0);

update public.platform_workflow_defaults
set default_estimate_start_number = coalesce(default_estimate_start_number, 3350),
    default_invoice_start_number = coalesce(default_invoice_start_number, 3350)
where config_key = 'default';

create or replace function public.generate_estimate_reference_number(
  target_company_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_number integer;
  candidate text;
  platform_default integer;
begin
  perform pg_advisory_xact_lock(
    hashtextextended(target_company_id::text || ':estimate_reference', 0)
  );

  insert into public.organization_workflow_settings (
    company_id
  )
  values (
    target_company_id
  )
  on conflict (company_id) do nothing;

  select default_estimate_start_number
  into platform_default
  from public.platform_workflow_defaults
  where config_key = 'default';

  platform_default := coalesce(platform_default, 3350);

  select greatest(coalesce(next_estimate_number, platform_default), 1)
  into next_number
  from public.organization_workflow_settings
  where company_id = target_company_id;

  loop
    candidate := next_number::text;

    exit when not exists (
      select 1
      from public.estimates
      where company_id = target_company_id
        and lower(reference_number) = lower(candidate)
    );

    next_number := next_number + 1;
  end loop;

  update public.organization_workflow_settings
  set next_estimate_number = next_number + 1
  where company_id = target_company_id;

  return candidate;
end;
$$;

create or replace function public.generate_invoice_reference_number(
  target_company_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_number integer;
  candidate text;
  platform_default integer;
begin
  perform pg_advisory_xact_lock(
    hashtextextended(target_company_id::text || ':invoice_reference', 0)
  );

  insert into public.organization_workflow_settings (
    company_id
  )
  values (
    target_company_id
  )
  on conflict (company_id) do nothing;

  select default_invoice_start_number
  into platform_default
  from public.platform_workflow_defaults
  where config_key = 'default';

  platform_default := coalesce(platform_default, 3350);

  select greatest(coalesce(next_invoice_number, platform_default), 1)
  into next_number
  from public.organization_workflow_settings
  where company_id = target_company_id;

  loop
    candidate := next_number::text;

    exit when not exists (
      select 1
      from public.invoices
      where company_id = target_company_id
        and lower(reference_number) = lower(candidate)
    );

    next_number := next_number + 1;
  end loop;

  update public.organization_workflow_settings
  set next_invoice_number = next_number + 1
  where company_id = target_company_id;

  return candidate;
end;
$$;

comment on column public.organization_workflow_settings.next_estimate_number is 'Next plain human-facing estimate number reserved for this organization. Can be raised by contractor settings and seeded per contractor before first estimate creation.';
comment on column public.organization_workflow_settings.next_invoice_number is 'Next plain human-facing invoice number reserved for this organization. Can be raised by contractor settings and seeded per contractor before first invoice creation.';
comment on column public.platform_workflow_defaults.default_estimate_start_number is 'Platform default starting estimate number for organizations that have not overridden their own sequence yet.';
comment on column public.platform_workflow_defaults.default_invoice_start_number is 'Platform default starting invoice number for organizations that have not overridden their own sequence yet.';
