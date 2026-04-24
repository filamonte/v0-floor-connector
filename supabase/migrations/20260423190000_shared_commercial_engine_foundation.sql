do $$
begin
  begin
    alter type public.catalog_item_type add value if not exists 'labor';
  exception
    when duplicate_object then
      null;
  end;

  begin
    alter type public.catalog_item_type add value if not exists 'equipment';
  exception
    when duplicate_object then
      null;
  end;
end
$$;

alter table public.organization_workflow_settings
  add column if not exists next_change_order_number integer,
  add column if not exists next_contract_number integer;

alter table public.organization_workflow_settings
  drop constraint if exists organization_workflow_settings_next_change_order_number_positive_check;
alter table public.organization_workflow_settings
  add constraint organization_workflow_settings_next_change_order_number_positive_check
  check (next_change_order_number is null or next_change_order_number > 0);

alter table public.organization_workflow_settings
  drop constraint if exists organization_workflow_settings_next_contract_number_positive_check;
alter table public.organization_workflow_settings
  add constraint organization_workflow_settings_next_contract_number_positive_check
  check (next_contract_number is null or next_contract_number > 0);

alter table public.platform_workflow_defaults
  add column if not exists default_change_order_start_number integer not null default 3350,
  add column if not exists default_contract_start_number integer not null default 3350;

alter table public.platform_workflow_defaults
  drop constraint if exists platform_workflow_defaults_default_change_order_start_number_positive_check;
alter table public.platform_workflow_defaults
  add constraint platform_workflow_defaults_default_change_order_start_number_positive_check
  check (default_change_order_start_number > 0);

alter table public.platform_workflow_defaults
  drop constraint if exists platform_workflow_defaults_default_contract_start_number_positive_check;
alter table public.platform_workflow_defaults
  add constraint platform_workflow_defaults_default_contract_start_number_positive_check
  check (default_contract_start_number > 0);

update public.platform_workflow_defaults
set default_change_order_start_number = coalesce(default_change_order_start_number, 3350),
    default_contract_start_number = coalesce(default_contract_start_number, 3350)
where config_key = 'default';

insert into public.organization_workflow_settings (
  company_id,
  next_change_order_number,
  next_contract_number
)
select
  company.id,
  platform.default_change_order_start_number,
  platform.default_contract_start_number
from public.companies company
cross join public.platform_workflow_defaults platform
where platform.config_key = 'default'
on conflict (company_id) do update
set next_change_order_number = coalesce(
      public.organization_workflow_settings.next_change_order_number,
      excluded.next_change_order_number
    ),
    next_contract_number = coalesce(
      public.organization_workflow_settings.next_contract_number,
      excluded.next_contract_number
    );

create or replace function public.generate_change_order_reference_number(
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
    hashtextextended(target_company_id::text || ':change_order_reference', 0)
  );

  insert into public.organization_workflow_settings (company_id)
  values (target_company_id)
  on conflict (company_id) do nothing;

  select default_change_order_start_number
  into platform_default
  from public.platform_workflow_defaults
  where config_key = 'default';

  platform_default := coalesce(platform_default, 3350);

  select greatest(coalesce(next_change_order_number, platform_default), 1)
  into next_number
  from public.organization_workflow_settings
  where company_id = target_company_id;

  loop
    candidate := next_number::text;

    exit when not exists (
      select 1
      from public.change_orders
      where company_id = target_company_id
        and lower(reference_number) = lower(candidate)
    );

    next_number := next_number + 1;
  end loop;

  update public.organization_workflow_settings
  set next_change_order_number = next_number + 1
  where company_id = target_company_id;

  return candidate;
end;
$$;

create or replace function public.generate_contract_reference_number(
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
    hashtextextended(target_company_id::text || ':contract_reference', 0)
  );

  insert into public.organization_workflow_settings (company_id)
  values (target_company_id)
  on conflict (company_id) do nothing;

  select default_contract_start_number
  into platform_default
  from public.platform_workflow_defaults
  where config_key = 'default';

  platform_default := coalesce(platform_default, 3350);

  select greatest(coalesce(next_contract_number, platform_default), 1)
  into next_number
  from public.organization_workflow_settings
  where company_id = target_company_id;

  loop
    candidate := next_number::text;

    exit when not exists (
      select 1
      from public.contracts
      where company_id = target_company_id
        and lower(reference_number) = lower(candidate)
    );

    next_number := next_number + 1;
  end loop;

  update public.organization_workflow_settings
  set next_contract_number = next_number + 1
  where company_id = target_company_id;

  return candidate;
end;
$$;

alter table public.change_orders
  add column if not exists reference_number text;

alter table public.contracts
  add column if not exists reference_number text;

update public.change_orders
set reference_number = public.generate_change_order_reference_number(company_id)
where reference_number is null or btrim(reference_number) = '';

update public.contracts
set reference_number = public.generate_contract_reference_number(company_id)
where reference_number is null or btrim(reference_number) = '';

alter table public.change_orders
  alter column reference_number set not null;

alter table public.contracts
  alter column reference_number set not null;

create unique index if not exists change_orders_company_reference_number_unique_idx
  on public.change_orders (company_id, lower(reference_number));

create unique index if not exists contracts_company_reference_number_unique_idx
  on public.contracts (company_id, lower(reference_number));

create or replace function public.assign_change_order_reference_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reference_number is null or btrim(new.reference_number) = '' then
    new.reference_number := public.generate_change_order_reference_number(new.company_id);
  end if;

  return new;
end;
$$;

create or replace function public.assign_contract_reference_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reference_number is null or btrim(new.reference_number) = '' then
    new.reference_number := public.generate_contract_reference_number(new.company_id);
  end if;

  return new;
end;
$$;

drop trigger if exists assign_change_order_reference_number on public.change_orders;
create trigger assign_change_order_reference_number
before insert on public.change_orders
for each row
execute function public.assign_change_order_reference_number();

drop trigger if exists assign_contract_reference_number on public.contracts;
create trigger assign_contract_reference_number
before insert on public.contracts
for each row
execute function public.assign_contract_reference_number();

alter table public.platform_catalog_item_seeds
  add column if not exists default_unit_cost numeric(12, 2) not null default 0,
  add column if not exists taxable boolean not null default true,
  add column if not exists vendor_id uuid,
  add column if not exists category text;

alter table public.platform_catalog_item_seeds
  drop constraint if exists platform_catalog_item_seeds_default_unit_cost_nonnegative_check;
alter table public.platform_catalog_item_seeds
  add constraint platform_catalog_item_seeds_default_unit_cost_nonnegative_check
  check (default_unit_cost >= 0);

alter table public.catalog_items
  add column if not exists default_unit_cost numeric(12, 2) not null default 0,
  add column if not exists taxable boolean not null default true,
  add column if not exists vendor_id uuid,
  add column if not exists category text;

alter table public.catalog_items
  drop constraint if exists catalog_items_default_unit_cost_nonnegative_check;
alter table public.catalog_items
  add constraint catalog_items_default_unit_cost_nonnegative_check
  check (default_unit_cost >= 0);

create unique index if not exists catalog_items_company_id_id_unique_idx
  on public.catalog_items (company_id, id);

create table if not exists public.catalog_system_components (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  system_catalog_item_id uuid not null,
  component_catalog_item_id uuid not null,
  quantity_per_unit numeric(12, 4) not null default 1,
  basis_unit text not null default 'sqft',
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint catalog_system_components_system_company_fkey
    foreign key (company_id, system_catalog_item_id)
    references public.catalog_items(company_id, id)
    on delete cascade,
  constraint catalog_system_components_component_company_fkey
    foreign key (company_id, component_catalog_item_id)
    references public.catalog_items(company_id, id)
    on delete restrict,
  constraint catalog_system_components_quantity_per_unit_positive_check
    check (quantity_per_unit > 0),
  constraint catalog_system_components_basis_unit_not_blank_check
    check (char_length(btrim(basis_unit)) > 0)
);

create unique index if not exists catalog_system_components_system_component_unique_idx
  on public.catalog_system_components (company_id, system_catalog_item_id, component_catalog_item_id);

create index if not exists catalog_system_components_system_sort_idx
  on public.catalog_system_components (company_id, system_catalog_item_id, sort_order, created_at);

drop trigger if exists set_catalog_system_components_updated_at on public.catalog_system_components;
create trigger set_catalog_system_components_updated_at
before update on public.catalog_system_components
for each row
execute function public.set_updated_at();

alter table public.catalog_system_components enable row level security;
alter table public.catalog_system_components force row level security;

drop policy if exists catalog_system_components_select_by_membership on public.catalog_system_components;
create policy catalog_system_components_select_by_membership
on public.catalog_system_components
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists catalog_system_components_insert_by_membership on public.catalog_system_components;
create policy catalog_system_components_insert_by_membership
on public.catalog_system_components
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists catalog_system_components_update_by_membership on public.catalog_system_components;
create policy catalog_system_components_update_by_membership
on public.catalog_system_components
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists catalog_system_components_delete_by_membership on public.catalog_system_components;
create policy catalog_system_components_delete_by_membership
on public.catalog_system_components
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

create table if not exists public.estimate_content_blocks (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  block_type text not null,
  title text not null,
  content_html text not null,
  status public.document_template_status not null default 'active',
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint estimate_content_blocks_block_type_check
    check (block_type in ('scope', 'inclusion', 'exclusion')),
  constraint estimate_content_blocks_title_not_blank_check
    check (char_length(btrim(title)) > 0),
  constraint estimate_content_blocks_content_not_blank_check
    check (char_length(btrim(content_html)) > 0)
);

create index if not exists estimate_content_blocks_company_type_status_idx
  on public.estimate_content_blocks (company_id, block_type, status, sort_order);

drop trigger if exists set_estimate_content_blocks_updated_at on public.estimate_content_blocks;
create trigger set_estimate_content_blocks_updated_at
before update on public.estimate_content_blocks
for each row
execute function public.set_updated_at();

alter table public.estimate_content_blocks enable row level security;
alter table public.estimate_content_blocks force row level security;

drop policy if exists estimate_content_blocks_select_by_membership on public.estimate_content_blocks;
create policy estimate_content_blocks_select_by_membership
on public.estimate_content_blocks
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_content_blocks_insert_by_membership on public.estimate_content_blocks;
create policy estimate_content_blocks_insert_by_membership
on public.estimate_content_blocks
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_content_blocks_update_by_membership on public.estimate_content_blocks;
create policy estimate_content_blocks_update_by_membership
on public.estimate_content_blocks
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_content_blocks_delete_by_membership on public.estimate_content_blocks;
create policy estimate_content_blocks_delete_by_membership
on public.estimate_content_blocks
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

alter table public.estimates
  add column if not exists tax_rate_applied numeric(9, 6) not null default 0,
  add column if not exists tax_behavior_applied public.tax_behavior not null default 'exclusive',
  add column if not exists customer_tax_exempt_snapshot boolean not null default false,
  add column if not exists taxable_sales_amount numeric(12, 2) not null default 0,
  add column if not exists exempt_sales_amount numeric(12, 2) not null default 0;

alter table public.estimates
  drop constraint if exists estimates_tax_rate_applied_range_check;
alter table public.estimates
  add constraint estimates_tax_rate_applied_range_check
  check (tax_rate_applied >= 0 and tax_rate_applied <= 1);

alter table public.estimate_line_items
  add column if not exists catalog_item_id uuid,
  add column if not exists source_type text not null default 'manual',
  add column if not exists source_system_id uuid,
  add column if not exists source_component_id uuid,
  add column if not exists item_type public.catalog_item_type,
  add column if not exists base_unit_cost numeric(12, 2) not null default 0,
  add column if not exists base_unit_price numeric(12, 2) not null default 0,
  add column if not exists markup_percent numeric(5, 2) not null default 0,
  add column if not exists taxable boolean not null default true,
  add column if not exists group_name text,
  add column if not exists assigned_to text;

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_source_type_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_source_type_check
  check (source_type in ('manual', 'catalog_item', 'system_component'));

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_base_unit_cost_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_base_unit_cost_nonnegative_check
  check (base_unit_cost >= 0);

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_base_unit_price_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_base_unit_price_nonnegative_check
  check (base_unit_price >= 0);

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_markup_percent_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_markup_percent_nonnegative_check
  check (markup_percent >= 0);

update public.estimate_line_items
set source_type = coalesce(nullif(source_type, ''), 'manual'),
    base_unit_price = coalesce(base_unit_price, unit_price),
    item_type = coalesce(item_type, 'service'),
    taxable = coalesce(taxable, true);

alter table public.invoice_line_items
  add column if not exists catalog_item_id uuid,
  add column if not exists taxable boolean not null default true,
  add column if not exists base_unit_cost numeric(12, 2);

create or replace function public.copy_platform_catalog_item_seed_to_company(
  target_seed_id uuid,
  target_company_id uuid,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_seed public.platform_catalog_item_seeds%rowtype;
  existing_item_id uuid;
  inserted_item_id uuid;
begin
  select *
  into selected_seed
  from public.platform_catalog_item_seeds
  where id = target_seed_id
    and is_active = true;

  if not found then
    return null;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_company_id::text || ':catalog-seed:' || target_seed_id::text, 0));

  select id
  into existing_item_id
  from public.catalog_items
  where company_id = target_company_id
    and source_seed_id = target_seed_id
  limit 1;

  if existing_item_id is not null then
    return existing_item_id;
  end if;

  insert into public.catalog_items (
    company_id,
    source_seed_id,
    source_seed_key,
    item_type,
    name,
    description,
    unit,
    default_unit_cost,
    default_unit_price,
    taxable,
    vendor_id,
    category,
    status,
    is_default,
    metadata,
    sort_order,
    created_by,
    updated_by
  ) values (
    target_company_id,
    selected_seed.id,
    selected_seed.seed_key,
    selected_seed.item_type,
    selected_seed.name,
    selected_seed.description,
    selected_seed.unit,
    selected_seed.default_unit_cost,
    selected_seed.default_unit_price,
    selected_seed.taxable,
    selected_seed.vendor_id,
    selected_seed.category,
    'active',
    selected_seed.is_default,
    selected_seed.metadata,
    selected_seed.sort_order,
    acting_user_id,
    acting_user_id
  )
  returning id into inserted_item_id;

  return inserted_item_id;
end;
$$;

create or replace function public.apply_estimate_financial_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_row public.customers%rowtype;
  settings_row public.organization_financial_settings%rowtype;
  applied_tax_rate numeric(9, 6);
begin
  select *
  into customer_row
  from public.customers
  where id = new.customer_id
    and company_id = new.company_id;

  if not found then
    raise exception 'Customer % was not found for estimate company %.', new.customer_id, new.company_id;
  end if;

  select *
  into settings_row
  from public.organization_financial_settings
  where company_id = new.company_id;

  if not found then
    settings_row := public.ensure_company_financial_settings(new.company_id, new.updated_by);
  end if;

  new.customer_tax_exempt_snapshot := customer_row.is_tax_exempt;
  new.tax_behavior_applied := settings_row.default_tax_behavior;

  if customer_row.is_tax_exempt or settings_row.default_tax_behavior = 'none' then
    applied_tax_rate := 0;
  else
    applied_tax_rate := settings_row.default_tax_rate;
  end if;

  new.tax_rate_applied := applied_tax_rate;

  return new;
end;
$$;

create or replace function public.set_estimate_line_item_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.base_unit_price is null then
    new.base_unit_price := coalesce(new.unit_price, 0);
  end if;

  if new.unit_price is null or new.unit_price = 0 then
    new.unit_price := round(
      coalesce(new.base_unit_price, 0) * (1 + (coalesce(new.markup_percent, 0) / 100.0)),
      2
    );
  end if;

  new.line_total := round(new.quantity * new.unit_price, 2);
  return new;
end;
$$;

create or replace function public.recalculate_estimate_totals(
  target_estimate_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_estimate public.estimates%rowtype;
  next_subtotal numeric(12, 2);
  next_taxable_sales numeric(12, 2);
  next_exempt_sales numeric(12, 2);
  discounted_taxable_sales numeric(12, 2);
  discounted_total numeric(12, 2);
  next_tax_amount numeric(12, 2);
  next_total numeric(12, 2);
begin
  select *
  into target_estimate
  from public.estimates
  where id = target_estimate_id;

  if not found then
    return;
  end if;

  select
    coalesce(sum(line_item.line_total), 0)::numeric(12, 2),
    coalesce(sum(case when line_item.taxable then line_item.line_total else 0 end), 0)::numeric(12, 2),
    coalesce(sum(case when line_item.taxable then 0 else line_item.line_total end), 0)::numeric(12, 2)
  into next_subtotal, next_taxable_sales, next_exempt_sales
  from public.estimate_line_items line_item
  where line_item.estimate_id = target_estimate_id;

  discounted_total := round(
    greatest(0, next_subtotal - coalesce(target_estimate.discount_amount, 0)),
    2
  );

  if next_subtotal = 0 then
    discounted_taxable_sales := 0;
    next_exempt_sales := discounted_total;
  else
    discounted_taxable_sales := round(
      greatest(0, next_taxable_sales - (coalesce(target_estimate.discount_amount, 0) * (next_taxable_sales / next_subtotal))),
      2
    );
    next_exempt_sales := round(discounted_total - discounted_taxable_sales, 2);
  end if;

  if target_estimate.customer_tax_exempt_snapshot
     or target_estimate.tax_behavior_applied = 'none'
     or coalesce(target_estimate.tax_rate_applied, 0) = 0 then
    next_tax_amount := 0;
    next_exempt_sales := discounted_total;
    discounted_taxable_sales := 0;
    next_total := discounted_total;
  elsif target_estimate.tax_behavior_applied = 'inclusive' then
    next_tax_amount := round(
      discounted_taxable_sales - (discounted_taxable_sales / (1 + target_estimate.tax_rate_applied)),
      2
    );
    discounted_taxable_sales := round(discounted_taxable_sales - next_tax_amount, 2);
    next_total := discounted_total;
  else
    next_tax_amount := round(discounted_taxable_sales * target_estimate.tax_rate_applied, 2);
    next_total := round(discounted_total + next_tax_amount, 2);
  end if;

  update public.estimates
  set
    subtotal_amount = next_subtotal,
    taxable_sales_amount = discounted_taxable_sales,
    exempt_sales_amount = next_exempt_sales,
    tax_amount = next_tax_amount,
    total_amount = next_total,
    updated_at = timezone('utc', now())
  where id = target_estimate_id;
end;
$$;

drop trigger if exists apply_estimate_financial_defaults on public.estimates;
create trigger apply_estimate_financial_defaults
before insert or update of customer_id, company_id on public.estimates
for each row
execute function public.apply_estimate_financial_defaults();

drop trigger if exists recalculate_estimate_totals_from_estimate on public.estimates;
create trigger recalculate_estimate_totals_from_estimate
after insert or update of discount_amount, tax_rate_applied, tax_behavior_applied, customer_tax_exempt_snapshot on public.estimates
for each row
when (pg_trigger_depth() = 0)
execute function public.handle_estimate_amount_recalculation();

create or replace function public.recalculate_invoice_financials(
  target_invoice_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_invoice public.invoices%rowtype;
  next_subtotal numeric(12, 2);
  discounted_subtotal numeric(12, 2);
  next_total numeric(12, 2);
  next_tax_amount numeric(12, 2);
  next_taxable_sales_amount numeric(12, 2);
  next_exempt_sales_amount numeric(12, 2);
  next_retainage_amount numeric(12, 2);
  recorded_payment_total numeric(12, 2);
  next_balance_due numeric(12, 2);
  next_status public.invoice_status;
  raw_taxable_sales numeric(12, 2);
begin
  select *
  into target_invoice
  from public.invoices
  where id = target_invoice_id;

  if not found then
    return;
  end if;

  select
    coalesce(sum(line_item.line_total), 0)::numeric(12, 2),
    coalesce(sum(case when line_item.taxable then line_item.line_total else 0 end), 0)::numeric(12, 2)
  into next_subtotal, raw_taxable_sales
  from public.invoice_line_items line_item
  where line_item.invoice_id = target_invoice_id;

  discounted_subtotal := round(
    greatest(0, next_subtotal - coalesce(target_invoice.discount_amount, 0)),
    2
  );

  if next_subtotal = 0 then
    next_taxable_sales_amount := 0;
    next_exempt_sales_amount := discounted_subtotal;
  else
    next_taxable_sales_amount := round(
      greatest(0, raw_taxable_sales - (coalesce(target_invoice.discount_amount, 0) * (raw_taxable_sales / next_subtotal))),
      2
    );
    next_exempt_sales_amount := round(discounted_subtotal - next_taxable_sales_amount, 2);
  end if;

  if target_invoice.customer_tax_exempt_snapshot or target_invoice.tax_behavior_applied = 'none' or coalesce(target_invoice.tax_rate_applied, 0) = 0 then
    next_tax_amount := 0;
    next_taxable_sales_amount := 0;
    next_exempt_sales_amount := discounted_subtotal;
    next_total := discounted_subtotal;
  elsif target_invoice.tax_behavior_applied = 'inclusive' then
    next_tax_amount := round(
      next_taxable_sales_amount - (next_taxable_sales_amount / (1 + target_invoice.tax_rate_applied)),
      2
    );
    next_taxable_sales_amount := round(next_taxable_sales_amount - next_tax_amount, 2);
    next_total := discounted_subtotal;
  else
    next_tax_amount := round(next_taxable_sales_amount * target_invoice.tax_rate_applied, 2);
    next_total := round(discounted_subtotal + next_tax_amount, 2);
  end if;

  next_retainage_amount := round(
    discounted_subtotal * (coalesce(target_invoice.retainage_percentage, 0) / 100.0),
    2
  );

  select coalesce(sum(payment.amount), 0)::numeric(12, 2)
  into recorded_payment_total
  from public.payments payment
  where payment.invoice_id = target_invoice_id
    and payment.status = 'recorded';

  if target_invoice.status = 'void' then
    next_balance_due := 0;
    next_status := 'void';
  else
    next_balance_due := round(
      greatest(0, next_total - next_retainage_amount - recorded_payment_total),
      2
    );

    if recorded_payment_total > 0 and next_balance_due = 0 then
      next_status := 'paid';
    elsif recorded_payment_total > 0 then
      next_status := 'partially_paid';
    elsif target_invoice.status in ('paid', 'partially_paid') then
      next_status := 'sent';
    else
      next_status := target_invoice.status;
    end if;
  end if;

  update public.invoices
  set
    subtotal_amount = next_subtotal,
    taxable_sales_amount = next_taxable_sales_amount,
    exempt_sales_amount = next_exempt_sales_amount,
    tax_amount = next_tax_amount,
    tax_collected_amount = next_tax_amount,
    retainage_held_amount = next_retainage_amount,
    total_amount = next_total,
    balance_due_amount = next_balance_due,
    status = next_status,
    updated_at = timezone('utc', now())
  where id = target_invoice_id;
end;
$$;

comment on table public.catalog_system_components is 'Canonical reusable system or assembly component rows. Quantity per unit can scale immediately from estimate square footage or other future basis inputs.';
comment on table public.estimate_content_blocks is 'Organization-scoped reusable scope, inclusion, and exclusion content blocks for estimate authoring. This remains separate from full document templates.';
comment on column public.organization_workflow_settings.next_change_order_number is 'Next plain human-facing change order number reserved for this organization.';
comment on column public.organization_workflow_settings.next_contract_number is 'Next plain human-facing contract number reserved for this organization.';
comment on column public.platform_workflow_defaults.default_change_order_start_number is 'Platform default starting change order number for organizations that have not overridden their own sequence yet.';
comment on column public.platform_workflow_defaults.default_contract_start_number is 'Platform default starting contract number for organizations that have not overridden their own sequence yet.';
