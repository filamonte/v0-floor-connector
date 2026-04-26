alter table public.schedule_of_value_items
  add column if not exists source_estimate_snapshot_item_id uuid;

create unique index if not exists estimate_commercial_snapshot_items_company_id_id_unique_idx
  on public.estimate_commercial_snapshot_items (company_id, id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'schedule_of_value_items_snapshot_item_company_fkey'
  ) then
    alter table public.schedule_of_value_items
      add constraint schedule_of_value_items_snapshot_item_company_fkey
      foreign key (company_id, source_estimate_snapshot_item_id)
      references public.estimate_commercial_snapshot_items(company_id, id)
      on delete restrict;
  end if;
end
$$;

create unique index if not exists schedule_of_value_items_snapshot_item_unique_idx
  on public.schedule_of_value_items (
    company_id,
    schedule_of_values_id,
    source_estimate_snapshot_item_id
  )
  where source_estimate_snapshot_item_id is not null;

create index if not exists schedule_of_value_items_snapshot_item_idx
  on public.schedule_of_value_items (company_id, source_estimate_snapshot_item_id)
  where source_estimate_snapshot_item_id is not null;

comment on column public.schedule_of_value_items.source_estimate_snapshot_item_id is 'Primary lineage reference to the approved estimate commercial snapshot item used to seed this schedule-of-values row.';

create or replace function public.ensure_schedule_of_values_for_estimate(
  target_estimate_id uuid,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  estimate_row public.estimates%rowtype;
  customer_row public.customers%rowtype;
  snapshot_row public.estimate_commercial_snapshots%rowtype;
  sov_id uuid;
begin
  select *
  into estimate_row
  from public.estimates
  where id = target_estimate_id;

  if not found then
    raise exception 'Estimate % not found.', target_estimate_id;
  end if;

  if estimate_row.status <> 'approved' then
    raise exception 'Schedule of values can only be provisioned from approved estimates.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_estimate_id::text, 0));

  select id
  into sov_id
  from public.schedule_of_values
  where company_id = estimate_row.company_id
    and estimate_id = estimate_row.id;

  if found then
    return sov_id;
  end if;

  select *
  into snapshot_row
  from public.estimate_commercial_snapshots
  where company_id = estimate_row.company_id
    and estimate_id = estimate_row.id
  order by snapshot_version desc, created_at desc
  limit 1;

  if not found then
    raise exception 'Approved estimate snapshot is missing. Re-approve the estimate before creating a schedule of values.';
  end if;

  select *
  into customer_row
  from public.customers
  where id = estimate_row.customer_id
    and company_id = estimate_row.company_id;

  insert into public.schedule_of_values (
    company_id,
    customer_id,
    project_id,
    estimate_id,
    retainage_percentage_default,
    created_by,
    updated_by
  )
  values (
    estimate_row.company_id,
    estimate_row.customer_id,
    estimate_row.project_id,
    estimate_row.id,
    coalesce(customer_row.retainage_percentage_default, 0),
    acting_user_id,
    acting_user_id
  )
  returning id into sov_id;

  insert into public.schedule_of_value_items (
    company_id,
    schedule_of_values_id,
    source_estimate_snapshot_item_id,
    source_estimate_line_item_id,
    name,
    description,
    scheduled_value_amount,
    retainage_percentage,
    sort_order,
    created_by,
    updated_by
  )
  select
    snapshot_item.company_id,
    sov_id,
    snapshot_item.id,
    snapshot_item.estimate_line_item_id,
    snapshot_item.name,
    snapshot_item.description,
    snapshot_item.line_total,
    coalesce(customer_row.retainage_percentage_default, 0),
    snapshot_item.sort_order,
    acting_user_id,
    acting_user_id
  from public.estimate_commercial_snapshot_items snapshot_item
  where snapshot_item.company_id = snapshot_row.company_id
    and snapshot_item.estimate_commercial_snapshot_id = snapshot_row.id
  order by snapshot_item.sort_order asc, snapshot_item.created_at asc;

  return sov_id;
end;
$$;
