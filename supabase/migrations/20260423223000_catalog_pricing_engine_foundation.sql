do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'subcontractor'
      and enumtypid = 'public.catalog_item_type'::regtype
  ) then
    alter type public.catalog_item_type add value 'subcontractor';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'other'
      and enumtypid = 'public.catalog_item_type'::regtype
  ) then
    alter type public.catalog_item_type add value 'other';
  end if;
end
$$;

alter table public.platform_catalog_item_seeds
  alter column default_unit_price drop not null,
  alter column default_unit_price drop default,
  add column if not exists markup_percent numeric(7, 2) not null default 0,
  add column if not exists hidden_markup_percent numeric(7, 2) not null default 0,
  add column if not exists sku text,
  add column if not exists internal_notes text,
  add column if not exists photo_storage_path text;

alter table public.platform_catalog_item_seeds
  drop constraint if exists platform_catalog_item_seeds_default_unit_price_nonnegative_check;
alter table public.platform_catalog_item_seeds
  add constraint platform_catalog_item_seeds_default_unit_price_nonnegative_check
  check (default_unit_price is null or default_unit_price >= 0);

alter table public.platform_catalog_item_seeds
  drop constraint if exists platform_catalog_item_seeds_markup_percent_nonnegative_check;
alter table public.platform_catalog_item_seeds
  add constraint platform_catalog_item_seeds_markup_percent_nonnegative_check
  check (markup_percent >= 0);

alter table public.platform_catalog_item_seeds
  drop constraint if exists platform_catalog_item_seeds_hidden_markup_percent_nonnegative_check;
alter table public.platform_catalog_item_seeds
  add constraint platform_catalog_item_seeds_hidden_markup_percent_nonnegative_check
  check (hidden_markup_percent >= 0);

alter table public.catalog_items
  alter column default_unit_price drop not null,
  alter column default_unit_price drop default,
  add column if not exists markup_percent numeric(7, 2) not null default 0,
  add column if not exists hidden_markup_percent numeric(7, 2) not null default 0,
  add column if not exists sku text,
  add column if not exists internal_notes text,
  add column if not exists photo_storage_path text;

alter table public.catalog_items
  drop constraint if exists catalog_items_default_unit_price_nonnegative_check;
alter table public.catalog_items
  add constraint catalog_items_default_unit_price_nonnegative_check
  check (default_unit_price is null or default_unit_price >= 0);

alter table public.catalog_items
  drop constraint if exists catalog_items_markup_percent_nonnegative_check;
alter table public.catalog_items
  add constraint catalog_items_markup_percent_nonnegative_check
  check (markup_percent >= 0);

alter table public.catalog_items
  drop constraint if exists catalog_items_hidden_markup_percent_nonnegative_check;
alter table public.catalog_items
  add constraint catalog_items_hidden_markup_percent_nonnegative_check
  check (hidden_markup_percent >= 0);

alter table public.estimate_line_items
  alter column base_unit_price drop not null,
  drop constraint if exists estimate_line_items_source_type_check,
  add column if not exists hidden_markup_percent numeric(7, 2) not null default 0,
  add column if not exists unit_price_before_hidden_markup numeric(12, 2) not null default 0,
  add column if not exists visible_markup_amount numeric(12, 2) not null default 0,
  add column if not exists hidden_markup_amount numeric(12, 2) not null default 0;

alter table public.estimate_line_items
  add constraint estimate_line_items_source_type_check
  check (source_type in ('manual', 'catalog_item', 'system_component'));

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_base_unit_price_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_base_unit_price_nonnegative_check
  check (base_unit_price is null or base_unit_price >= 0);

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_hidden_markup_percent_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_hidden_markup_percent_nonnegative_check
  check (hidden_markup_percent >= 0);

alter table public.invoice_line_items
  add column if not exists base_unit_price numeric(12, 2),
  add column if not exists markup_percent numeric(7, 2) not null default 0,
  add column if not exists hidden_markup_percent numeric(7, 2) not null default 0,
  add column if not exists unit_price_before_hidden_markup numeric(12, 2) not null default 0,
  add column if not exists visible_markup_amount numeric(12, 2) not null default 0,
  add column if not exists hidden_markup_amount numeric(12, 2) not null default 0;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_base_unit_price_nonnegative_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_base_unit_price_nonnegative_check
  check (base_unit_price is null or base_unit_price >= 0);

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_markup_percent_nonnegative_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_markup_percent_nonnegative_check
  check (markup_percent >= 0);

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_hidden_markup_percent_nonnegative_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_hidden_markup_percent_nonnegative_check
  check (hidden_markup_percent >= 0);

update public.platform_catalog_item_seeds
set default_unit_price = null
where default_unit_price = 0;

update public.catalog_items
set default_unit_price = null
where default_unit_price = 0;

update public.estimate_line_items
set
  base_unit_price = nullif(base_unit_price, 0),
  hidden_markup_percent = coalesce(hidden_markup_percent, 0),
  unit_price_before_hidden_markup = coalesce(unit_price_before_hidden_markup, unit_price),
  visible_markup_amount = coalesce(visible_markup_amount, greatest(unit_price - coalesce(base_unit_cost, 0), 0)),
  hidden_markup_amount = coalesce(hidden_markup_amount, 0);

update public.invoice_line_items
set
  base_unit_price = nullif(base_unit_price, 0),
  markup_percent = coalesce(markup_percent, 0),
  hidden_markup_percent = coalesce(hidden_markup_percent, 0),
  unit_price_before_hidden_markup = coalesce(unit_price_before_hidden_markup, unit_price),
  visible_markup_amount = coalesce(visible_markup_amount, greatest(unit_price - coalesce(base_unit_cost, 0), 0)),
  hidden_markup_amount = coalesce(hidden_markup_amount, 0);

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
    markup_percent,
    hidden_markup_percent,
    taxable,
    vendor_id,
    category,
    sku,
    internal_notes,
    photo_storage_path,
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
    selected_seed.markup_percent,
    selected_seed.hidden_markup_percent,
    selected_seed.taxable,
    selected_seed.vendor_id,
    selected_seed.category,
    selected_seed.sku,
    selected_seed.internal_notes,
    selected_seed.photo_storage_path,
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

comment on column public.catalog_items.default_unit_price is 'Optional explicit price override. Null means pricing should start from cost.';
comment on column public.catalog_items.markup_percent is 'Visible markup percentage applied before hidden markup.';
comment on column public.catalog_items.hidden_markup_percent is 'Read-only hidden markup percentage enforced in downstream pricing.';
comment on column public.catalog_items.photo_storage_path is 'Optional storage path in the shared documents bucket for the catalog item photo.';
comment on column public.estimate_line_items.hidden_markup_percent is 'Hidden markup snapshot copied from the catalog item and enforced in estimate pricing.';
comment on column public.invoice_line_items.hidden_markup_percent is 'Hidden markup snapshot copied from the estimate line item during invoice seeding.';
