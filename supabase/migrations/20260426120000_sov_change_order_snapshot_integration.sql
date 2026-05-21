do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'schedule_of_value_lineage_type'
  ) then
    create type public.schedule_of_value_lineage_type as enum (
      'estimate_snapshot_item',
      'change_order_snapshot_item'
    );
  end if;
end
$$;

alter table public.schedule_of_value_items
  add column if not exists lineage_type public.schedule_of_value_lineage_type,
  add column if not exists change_order_snapshot_item_id uuid;

alter table public.schedule_of_value_items
  alter column source_estimate_line_item_id drop not null;

create unique index if not exists change_order_commercial_snapshot_items_company_id_id_unique_idx
  on public.change_order_commercial_snapshot_items (company_id, id);

alter table public.schedule_of_value_items
  drop constraint if exists schedule_of_value_items_change_order_snapshot_item_company_fkey;
alter table public.schedule_of_value_items
  add constraint schedule_of_value_items_change_order_snapshot_item_company_fkey
  foreign key (company_id, change_order_snapshot_item_id)
  references public.change_order_commercial_snapshot_items(company_id, id)
  on delete restrict;

with ranked_snapshot_items as (
  select
    snapshot_item.company_id,
    snapshot_item.estimate_line_item_id,
    snapshot_item.id as snapshot_item_id,
    row_number() over (
      partition by snapshot_item.company_id, snapshot_item.estimate_line_item_id
      order by snapshot.snapshot_version desc, snapshot.created_at desc, snapshot_item.created_at desc
    ) as row_number
  from public.estimate_commercial_snapshot_items snapshot_item
  join public.estimate_commercial_snapshots snapshot
    on snapshot.company_id = snapshot_item.company_id
   and snapshot.id = snapshot_item.estimate_commercial_snapshot_id
),
legacy_backfill_candidates as (
  select
    sov_item.id as schedule_of_value_item_id,
    ranked.snapshot_item_id,
    row_number() over (
      partition by sov_item.company_id, sov_item.schedule_of_values_id, ranked.snapshot_item_id
      order by sov_item.sort_order asc, sov_item.created_at asc, sov_item.id asc
    ) as row_number
  from public.schedule_of_value_items sov_item
  join ranked_snapshot_items ranked
    on sov_item.company_id = ranked.company_id
   and sov_item.source_estimate_line_item_id = ranked.estimate_line_item_id
  where sov_item.lineage_type is null
    and sov_item.source_estimate_snapshot_item_id is null
    and sov_item.change_order_snapshot_item_id is null
    and ranked.row_number = 1
)
update public.schedule_of_value_items sov_item
set source_estimate_snapshot_item_id = candidate.snapshot_item_id
from legacy_backfill_candidates candidate
where sov_item.id = candidate.schedule_of_value_item_id
  and candidate.row_number = 1;

update public.schedule_of_value_items
set lineage_type = 'estimate_snapshot_item'
where lineage_type is null
  and source_estimate_snapshot_item_id is not null
  and change_order_snapshot_item_id is null;

alter table public.schedule_of_value_items
  drop constraint if exists schedule_of_value_items_lineage_source_check;
alter table public.schedule_of_value_items
  add constraint schedule_of_value_items_lineage_source_check
  check (
    (
      lineage_type = 'estimate_snapshot_item'
      and source_estimate_snapshot_item_id is not null
      and change_order_snapshot_item_id is null
    )
    or (
      lineage_type = 'change_order_snapshot_item'
      and source_estimate_snapshot_item_id is null
      and source_estimate_line_item_id is null
      and change_order_snapshot_item_id is not null
    )
  )
  not valid;

drop index if exists schedule_of_value_items_snapshot_item_unique_idx;
create unique index if not exists schedule_of_value_items_snapshot_item_unique_idx
  on public.schedule_of_value_items (
    company_id,
    schedule_of_values_id,
    source_estimate_snapshot_item_id
  )
  where lineage_type = 'estimate_snapshot_item'
    and source_estimate_snapshot_item_id is not null;

create unique index if not exists schedule_of_value_items_change_order_snapshot_item_unique_idx
  on public.schedule_of_value_items (
    company_id,
    schedule_of_values_id,
    change_order_snapshot_item_id
  )
  where lineage_type = 'change_order_snapshot_item'
    and change_order_snapshot_item_id is not null;

create index if not exists schedule_of_value_items_change_order_snapshot_item_idx
  on public.schedule_of_value_items (company_id, change_order_snapshot_item_id)
  where change_order_snapshot_item_id is not null;

create index if not exists schedule_of_value_items_lineage_type_idx
  on public.schedule_of_value_items (company_id, lineage_type, schedule_of_values_id);

-- Diagnostic query for legacy rows that still violate the new lineage model after backfill.
-- Run this after the migration if you need to inspect remaining dirty rows without blocking deploy:
-- select
--   id,
--   company_id,
--   schedule_of_values_id,
--   lineage_type,
--   source_estimate_line_item_id,
--   source_estimate_snapshot_item_id,
--   change_order_snapshot_item_id,
--   name,
--   sort_order,
--   created_at
-- from public.schedule_of_value_items
-- where not (
--   (
--     lineage_type = 'estimate_snapshot_item'
--     and source_estimate_snapshot_item_id is not null
--     and change_order_snapshot_item_id is null
--   )
--   or (
--     lineage_type = 'change_order_snapshot_item'
--     and source_estimate_snapshot_item_id is null
--     and source_estimate_line_item_id is null
--     and change_order_snapshot_item_id is not null
--   )
-- )
-- order by company_id, schedule_of_values_id, sort_order, created_at, id;

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
    lineage_type,
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
    'estimate_snapshot_item',
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

create or replace function public.append_change_order_snapshot_items_to_sov(
  target_change_order_id uuid,
  target_schedule_of_values_id uuid default null,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  change_order_row public.change_orders%rowtype;
  latest_snapshot_row public.change_order_commercial_snapshots%rowtype;
  target_sov_row public.schedule_of_values%rowtype;
  matching_sov_count integer;
  max_sort_order integer;
begin
  select *
  into change_order_row
  from public.change_orders
  where id = target_change_order_id;

  if not found then
    raise exception 'Change order % not found.', target_change_order_id;
  end if;

  if change_order_row.status <> 'approved' then
    raise exception 'Only approved change orders can be added to the schedule of values.';
  end if;

  select *
  into latest_snapshot_row
  from public.change_order_commercial_snapshots
  where company_id = change_order_row.company_id
    and change_order_id = change_order_row.id
  order by snapshot_version desc, created_at desc
  limit 1;

  if not found then
    raise exception 'Approved change-order snapshot data is missing. Re-approve the change order before adding it to the schedule of values.';
  end if;

  if exists (
    select 1
    from public.change_order_commercial_snapshot_items snapshot_item
    where snapshot_item.company_id = latest_snapshot_row.company_id
      and snapshot_item.change_order_commercial_snapshot_id = latest_snapshot_row.id
      and snapshot_item.line_total <= 0
  ) then
    raise exception 'Negative or zero-value change-order snapshot items cannot be added to the schedule of values. Invoice them directly instead.';
  end if;

  if target_schedule_of_values_id is null then
    select count(*)
    into matching_sov_count
    from public.schedule_of_values sov
    where sov.company_id = change_order_row.company_id
      and sov.project_id = change_order_row.project_id;

    if matching_sov_count = 0 then
      raise exception 'No schedule of values exists for this project yet.';
    end if;

    if matching_sov_count > 1 then
      raise exception 'Multiple schedules of values exist for this project. Select the target schedule of values explicitly.';
    end if;

    select *
    into target_sov_row
    from public.schedule_of_values sov
    where sov.company_id = change_order_row.company_id
      and sov.project_id = change_order_row.project_id
    limit 1;
  else
    select *
    into target_sov_row
    from public.schedule_of_values sov
    where sov.company_id = change_order_row.company_id
      and sov.id = target_schedule_of_values_id;

    if not found then
      raise exception 'Selected schedule of values % was not found for this organization.', target_schedule_of_values_id;
    end if;

    if target_sov_row.project_id <> change_order_row.project_id then
      raise exception 'Selected schedule of values must belong to the same project as the approved change order.';
    end if;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_sov_row.id::text || ':append_change_order_snapshot_items', 0));

  select coalesce(max(sort_order), -1)
  into max_sort_order
  from public.schedule_of_value_items
  where company_id = target_sov_row.company_id
    and schedule_of_values_id = target_sov_row.id;

  insert into public.schedule_of_value_items (
    company_id,
    schedule_of_values_id,
    lineage_type,
    source_estimate_snapshot_item_id,
    source_estimate_line_item_id,
    change_order_snapshot_item_id,
    name,
    description,
    scheduled_value_amount,
    percent_complete,
    prior_billed_amount,
    current_billed_amount,
    retainage_percentage,
    retainage_held_amount,
    retainage_released_amount,
    sort_order,
    created_by,
    updated_by
  )
  select
    target_sov_row.company_id,
    target_sov_row.id,
    'change_order_snapshot_item',
    null,
    null,
    snapshot_item.id,
    snapshot_item.name,
    snapshot_item.description,
    snapshot_item.line_total,
    0,
    0,
    0,
    target_sov_row.retainage_percentage_default,
    0,
    0,
    max_sort_order + row_number() over (
      order by snapshot_item.sort_order asc, snapshot_item.created_at asc
    ),
    acting_user_id,
    acting_user_id
  from public.change_order_commercial_snapshot_items snapshot_item
  where snapshot_item.company_id = latest_snapshot_row.company_id
    and snapshot_item.change_order_commercial_snapshot_id = latest_snapshot_row.id
    and not exists (
      select 1
      from public.schedule_of_value_items existing_item
      where existing_item.company_id = target_sov_row.company_id
        and existing_item.schedule_of_values_id = target_sov_row.id
        and existing_item.change_order_snapshot_item_id = snapshot_item.id
    )
  order by snapshot_item.sort_order asc, snapshot_item.created_at asc;

  return target_sov_row.id;
end;
$$;

comment on type public.schedule_of_value_lineage_type is 'Canonical lineage type for schedule-of-values rows. New rows must point to exactly one upstream snapshot source.';
comment on column public.schedule_of_value_items.lineage_type is 'Canonical source classification for this schedule-of-values row.';
comment on column public.schedule_of_value_items.change_order_snapshot_item_id is 'Approved change-order snapshot item that seeded this additive schedule-of-values row.';
comment on column public.schedule_of_value_items.source_estimate_line_item_id is 'Legacy estimate-line-item trace for estimate-derived SOV rows only. Change-order SOV rows must leave this null.';
comment on table public.schedule_of_value_items is 'Canonical schedule of values line items sourced from either approved estimate snapshot items or appended approved change-order snapshot items.';
