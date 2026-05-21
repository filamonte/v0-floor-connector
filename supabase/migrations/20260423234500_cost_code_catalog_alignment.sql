alter table public.platform_catalog_item_seeds
  add column if not exists cost_code text;

alter table public.catalog_items
  add column if not exists cost_code text;

alter table public.estimate_line_items
  add column if not exists cost_code text;

alter table public.invoice_line_items
  add column if not exists cost_code text;

update public.estimate_line_items
set cost_code = nullif(btrim(cost_code), '');

update public.invoice_line_items
set cost_code = nullif(btrim(cost_code), '');

comment on column public.platform_catalog_item_seeds.cost_code is 'Optional contractor-facing cost code used when starter catalog items are adopted into an organization.';
comment on column public.catalog_items.cost_code is 'Optional canonical cost code used by the shared cost items database, estimates, invoices, and systems.';
comment on column public.estimate_line_items.cost_code is 'Cost code snapshot copied from the selected catalog item or expanded system component.';
comment on column public.invoice_line_items.cost_code is 'Cost code snapshot copied from the seeded estimate line item or selected catalog item.';

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
    cost_code,
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
    selected_seed.cost_code,
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
