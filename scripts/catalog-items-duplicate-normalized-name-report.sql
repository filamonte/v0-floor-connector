-- Read-only duplicate catalog item normalized-name report.
--
-- Purpose:
--   Identify duplicate catalog_items.normalized_name values by organization before
--   enforcing or repairing organization-scoped uniqueness.
--
-- Safety:
--   This script only reads data. It does not update, delete, archive, or merge rows.
--
-- Usage:
--   Run in the Supabase SQL editor or through psql against the target database.

with duplicate_groups as (
  select
    company_id,
    normalized_name,
    count(*) as duplicate_count,
    count(*) filter (where status = 'active') as active_count,
    count(*) filter (where status = 'archived') as archived_count,
    min(created_at) as first_created_at,
    max(updated_at) as last_updated_at
  from public.catalog_items
  where normalized_name is not null
    and normalized_name <> ''
  group by company_id, normalized_name
  having count(*) > 1
)
select
  duplicate_groups.company_id,
  companies.display_name as organization_name,
  duplicate_groups.normalized_name,
  duplicate_groups.duplicate_count,
  duplicate_groups.active_count,
  duplicate_groups.archived_count,
  duplicate_groups.first_created_at,
  duplicate_groups.last_updated_at
from duplicate_groups
left join public.companies
  on companies.id = duplicate_groups.company_id
order by
  duplicate_groups.duplicate_count desc,
  companies.display_name nulls last,
  duplicate_groups.normalized_name;

with duplicate_groups as (
  select
    company_id,
    normalized_name
  from public.catalog_items
  where normalized_name is not null
    and normalized_name <> ''
  group by company_id, normalized_name
  having count(*) > 1
)
select
  catalog_items.company_id,
  companies.display_name as organization_name,
  catalog_items.normalized_name,
  catalog_items.id,
  catalog_items.name,
  catalog_items.item_type,
  catalog_items.status,
  catalog_items.sku,
  catalog_items.default_unit_cost,
  catalog_items.default_unit_price,
  catalog_items.is_default,
  catalog_items.source_seed_id,
  catalog_items.created_at,
  catalog_items.updated_at
from public.catalog_items
inner join duplicate_groups
  on duplicate_groups.company_id = catalog_items.company_id
 and duplicate_groups.normalized_name = catalog_items.normalized_name
left join public.companies
  on companies.id = catalog_items.company_id
order by
  catalog_items.company_id,
  catalog_items.normalized_name,
  catalog_items.status,
  catalog_items.created_at,
  catalog_items.id;
