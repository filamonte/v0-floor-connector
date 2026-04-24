insert into public.organization_workflow_settings (
  company_id
)
select distinct estimates.company_id
from public.estimates
on conflict (company_id) do nothing;

update public.estimates
set reference_number = regexp_replace(reference_number, '^\s*EST-\s*', '', 'i')
where reference_number ~* '^\s*EST-\s*\d+\s*$';

with platform_defaults as (
  select coalesce(default_estimate_start_number, 3350) as default_estimate_start_number
  from public.platform_workflow_defaults
  where config_key = 'default'
)
update public.organization_workflow_settings as settings
set next_estimate_number = greatest(
  coalesce(settings.next_estimate_number, 0),
  coalesce((
    select max(estimates.reference_number::integer) + 1
    from public.estimates
    where estimates.company_id = settings.company_id
      and estimates.reference_number ~ '^\d+$'
  ), platform_defaults.default_estimate_start_number),
  platform_defaults.default_estimate_start_number
)
from platform_defaults;
