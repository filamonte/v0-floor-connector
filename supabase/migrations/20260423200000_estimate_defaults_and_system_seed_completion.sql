alter table public.platform_workflow_defaults
  add column if not exists default_estimate_terms_html text,
  add column if not exists default_estimate_inclusions_html text,
  add column if not exists default_estimate_exclusions_html text,
  add column if not exists default_estimate_scope_summary_html text;

alter table public.organization_workflow_settings
  add column if not exists default_estimate_terms_html text,
  add column if not exists default_estimate_inclusions_html text,
  add column if not exists default_estimate_exclusions_html text,
  add column if not exists default_estimate_scope_summary_html text;

alter table public.estimate_content_blocks
  drop constraint if exists estimate_content_blocks_block_type_check;
alter table public.estimate_content_blocks
  add constraint estimate_content_blocks_block_type_check
  check (block_type in ('scope', 'inclusion', 'exclusion', 'terms'));

create table if not exists public.platform_catalog_system_components (
  id uuid primary key default extensions.gen_random_uuid(),
  system_seed_id uuid not null references public.platform_catalog_item_seeds(id) on delete cascade,
  component_seed_id uuid not null references public.platform_catalog_item_seeds(id) on delete restrict,
  quantity_per_unit numeric(12, 4) not null default 1,
  basis_unit text not null default 'sqft',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_catalog_system_components_quantity_positive_check
    check (quantity_per_unit > 0),
  constraint platform_catalog_system_components_basis_not_blank_check
    check (char_length(btrim(basis_unit)) > 0)
);

create unique index if not exists platform_catalog_system_components_system_component_unique_idx
  on public.platform_catalog_system_components (system_seed_id, component_seed_id);

create index if not exists platform_catalog_system_components_system_sort_idx
  on public.platform_catalog_system_components (system_seed_id, sort_order, created_at);

drop trigger if exists set_platform_catalog_system_components_updated_at
  on public.platform_catalog_system_components;
create trigger set_platform_catalog_system_components_updated_at
before update on public.platform_catalog_system_components
for each row
execute function public.set_updated_at();

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
  copied_item_id uuid;
  component_row record;
  component_catalog_item_id uuid;
begin
  select *
  into selected_seed
  from public.platform_catalog_item_seeds
  where id = target_seed_id
    and is_active = true;

  if not found then
    return null;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(target_company_id::text || ':catalog-seed:' || target_seed_id::text, 0)
  );

  select id
  into existing_item_id
  from public.catalog_items
  where company_id = target_company_id
    and source_seed_id = target_seed_id
  limit 1;

  if existing_item_id is null then
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
    returning id into copied_item_id;
  else
    copied_item_id := existing_item_id;
  end if;

  if selected_seed.item_type = 'system' then
    for component_row in
      select
        component_seed_id,
        quantity_per_unit,
        basis_unit,
        sort_order
      from public.platform_catalog_system_components
      where system_seed_id = selected_seed.id
      order by sort_order asc, created_at asc
    loop
      component_catalog_item_id := public.copy_platform_catalog_item_seed_to_company(
        component_row.component_seed_id,
        target_company_id,
        acting_user_id
      );

      if component_catalog_item_id is null then
        continue;
      end if;

      insert into public.catalog_system_components (
        company_id,
        system_catalog_item_id,
        component_catalog_item_id,
        quantity_per_unit,
        basis_unit,
        sort_order,
        created_by,
        updated_by
      ) values (
        target_company_id,
        copied_item_id,
        component_catalog_item_id,
        component_row.quantity_per_unit,
        component_row.basis_unit,
        component_row.sort_order,
        acting_user_id,
        acting_user_id
      )
      on conflict (company_id, system_catalog_item_id, component_catalog_item_id) do update
      set
        quantity_per_unit = excluded.quantity_per_unit,
        basis_unit = excluded.basis_unit,
        sort_order = excluded.sort_order,
        updated_by = acting_user_id,
        updated_at = timezone('utc', now());
    end loop;
  end if;

  return copied_item_id;
end;
$$;

comment on column public.platform_workflow_defaults.default_estimate_terms_html is 'Platform starter default for estimate terms content.';
comment on column public.platform_workflow_defaults.default_estimate_inclusions_html is 'Platform starter default for estimate inclusions content.';
comment on column public.platform_workflow_defaults.default_estimate_exclusions_html is 'Platform starter default for estimate exclusions content.';
comment on column public.platform_workflow_defaults.default_estimate_scope_summary_html is 'Platform starter default for estimate scope summary content.';
comment on column public.organization_workflow_settings.default_estimate_terms_html is 'Organization override for default estimate terms content.';
comment on column public.organization_workflow_settings.default_estimate_inclusions_html is 'Organization override for default estimate inclusions content.';
comment on column public.organization_workflow_settings.default_estimate_exclusions_html is 'Organization override for default estimate exclusions content.';
comment on column public.organization_workflow_settings.default_estimate_scope_summary_html is 'Organization override for default estimate scope summary content.';
comment on table public.platform_catalog_system_components is 'Platform-owned reusable system seed components that can be copied into tenant-owned catalog system components without duplicating system models.';
