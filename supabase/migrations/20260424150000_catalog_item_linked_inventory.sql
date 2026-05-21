alter table public.catalog_items
  add column if not exists normalized_name text generated always as (public.normalize_lookup_text(name)) stored,
  add column if not exists normalized_sku text generated always as (public.normalize_lookup_text(sku)) stored;

create unique index if not exists catalog_items_company_id_id_unique_idx
  on public.catalog_items (company_id, id);

alter table public.inventory_items
  add column if not exists catalog_item_id uuid,
  add column if not exists location text not null default 'default';

drop index if exists public.inventory_items_company_normalized_name_unique_idx;
create unique index if not exists inventory_items_company_unlinked_normalized_name_unique_idx
  on public.inventory_items (company_id, normalized_name)
  where catalog_item_id is null;

drop index if exists public.inventory_items_company_normalized_sku_unique_idx;
create unique index if not exists inventory_items_company_unlinked_normalized_sku_unique_idx
  on public.inventory_items (company_id, normalized_sku)
  where catalog_item_id is null
    and normalized_sku is not null;

create unique index if not exists inventory_items_company_catalog_item_location_unique_idx
  on public.inventory_items (company_id, catalog_item_id, location)
  where catalog_item_id is not null;

alter table public.inventory_items
  drop constraint if exists inventory_items_catalog_item_company_fkey;
alter table public.inventory_items
  add constraint inventory_items_catalog_item_company_fkey
  foreign key (company_id, catalog_item_id)
  references public.catalog_items(company_id, id)
  on delete set null;

comment on column public.inventory_items.catalog_item_id is 'Optional link to the canonical catalog_items master record when inventory tracking is enabled for a cost item.';
comment on column public.inventory_items.location is 'Operational stock location label. Current UI uses a single default location, but the schema allows future multi-location expansion without a second item system.';
