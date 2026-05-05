create table if not exists public.finish_products (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  manufacturer_name text not null,
  product_line text,
  product_code text,
  sku text,
  product_name text not null,
  normalized_product_name text generated always as (lower(btrim(product_name))) stored,
  service_family text,
  finish_family text,
  display_color_name text,
  customer_facing_description text,
  technical_notes text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint finish_products_manufacturer_name_not_blank_check
    check (char_length(btrim(manufacturer_name)) > 0),
  constraint finish_products_product_line_not_blank_check
    check (product_line is null or char_length(btrim(product_line)) > 0),
  constraint finish_products_product_code_not_blank_check
    check (product_code is null or char_length(btrim(product_code)) > 0),
  constraint finish_products_sku_not_blank_check
    check (sku is null or char_length(btrim(sku)) > 0),
  constraint finish_products_product_name_not_blank_check
    check (char_length(btrim(product_name)) > 0),
  constraint finish_products_service_family_check
    check (
      service_family is null
      or service_family in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color_coating',
        'concrete_polishing',
        'grind_and_seal',
        'future_specialty_system'
      )
    ),
  constraint finish_products_finish_family_check
    check (
      finish_family is null
      or finish_family in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color',
        'none',
        'other'
      )
    ),
  constraint finish_products_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint finish_products_status_check
    check (status in ('draft', 'active', 'retired', 'archived'))
);

create unique index if not exists finish_products_company_id_id_unique_idx
  on public.finish_products (company_id, id);

create unique index if not exists finish_products_company_product_code_unique_idx
  on public.finish_products (
    company_id,
    lower(manufacturer_name),
    lower(coalesce(product_line, '')),
    lower(product_code)
  )
  where product_code is not null;

create unique index if not exists finish_products_company_sku_unique_idx
  on public.finish_products (
    company_id,
    lower(manufacturer_name),
    lower(sku)
  )
  where sku is not null;

create index if not exists finish_products_company_status_idx
  on public.finish_products (company_id, status);

create index if not exists finish_products_company_manufacturer_idx
  on public.finish_products (company_id, manufacturer_name);

create index if not exists finish_products_company_normalized_product_name_idx
  on public.finish_products (company_id, normalized_product_name);

create index if not exists finish_products_company_family_idx
  on public.finish_products (company_id, service_family, finish_family);

drop trigger if exists set_finish_products_updated_at on public.finish_products;
create trigger set_finish_products_updated_at
before update on public.finish_products
for each row
execute function public.set_updated_at();

alter table public.finish_products enable row level security;
alter table public.finish_products force row level security;

drop policy if exists finish_products_select_by_membership on public.finish_products;
create policy finish_products_select_by_membership
on public.finish_products
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists finish_products_insert_by_membership on public.finish_products;
create policy finish_products_insert_by_membership
on public.finish_products
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists finish_products_update_by_membership on public.finish_products;
create policy finish_products_update_by_membership
on public.finish_products
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists finish_products_delete_by_membership on public.finish_products;
create policy finish_products_delete_by_membership
on public.finish_products
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

create table if not exists public.floor_system_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  normalized_name text generated always as (lower(btrim(name))) stored,
  service_family text not null,
  finish_family text,
  customer_facing_description text,
  internal_notes text,
  prep_requirements text,
  technical_notes text,
  template_version integer not null default 1,
  status text not null default 'draft',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint floor_system_templates_name_not_blank_check
    check (char_length(btrim(name)) > 0),
  constraint floor_system_templates_service_family_check
    check (
      service_family in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color_coating',
        'concrete_polishing',
        'grind_and_seal',
        'future_specialty_system'
      )
    ),
  constraint floor_system_templates_finish_family_check
    check (
      finish_family is null
      or finish_family in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color',
        'none',
        'other'
      )
    ),
  constraint floor_system_templates_template_version_check
    check (template_version >= 1),
  constraint floor_system_templates_status_check
    check (status in ('draft', 'active', 'retired', 'archived'))
);

create unique index if not exists floor_system_templates_company_id_id_unique_idx
  on public.floor_system_templates (company_id, id);

create unique index if not exists floor_system_templates_company_name_active_unique_idx
  on public.floor_system_templates (company_id, normalized_name)
  where status <> 'archived';

create index if not exists floor_system_templates_company_status_idx
  on public.floor_system_templates (company_id, status);

create index if not exists floor_system_templates_company_normalized_name_idx
  on public.floor_system_templates (company_id, normalized_name);

create index if not exists floor_system_templates_company_family_idx
  on public.floor_system_templates (company_id, service_family, finish_family);

drop trigger if exists set_floor_system_templates_updated_at on public.floor_system_templates;
create trigger set_floor_system_templates_updated_at
before update on public.floor_system_templates
for each row
execute function public.set_updated_at();

alter table public.floor_system_templates enable row level security;
alter table public.floor_system_templates force row level security;

drop policy if exists floor_system_templates_select_by_membership on public.floor_system_templates;
create policy floor_system_templates_select_by_membership
on public.floor_system_templates
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists floor_system_templates_insert_by_membership on public.floor_system_templates;
create policy floor_system_templates_insert_by_membership
on public.floor_system_templates
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists floor_system_templates_update_by_membership on public.floor_system_templates;
create policy floor_system_templates_update_by_membership
on public.floor_system_templates
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists floor_system_templates_delete_by_membership on public.floor_system_templates;
create policy floor_system_templates_delete_by_membership
on public.floor_system_templates
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

create table if not exists public.floor_system_template_components (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  floor_system_template_id uuid not null,
  catalog_item_id uuid not null,
  finish_product_id uuid,
  component_role text not null default 'standard',
  sort_order integer not null default 0,
  quantity_basis text not null,
  default_quantity numeric(12, 4),
  formula_metadata jsonb not null default '{}'::jsonb,
  customer_facing_label text,
  internal_notes text,
  is_optional boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint floor_system_template_components_template_company_fkey
    foreign key (company_id, floor_system_template_id)
    references public.floor_system_templates(company_id, id)
    on delete cascade,
  constraint floor_system_template_components_catalog_item_company_fkey
    foreign key (company_id, catalog_item_id)
    references public.catalog_items(company_id, id)
    on delete restrict,
  constraint floor_system_template_components_finish_product_company_fkey
    foreign key (company_id, finish_product_id)
    references public.finish_products(company_id, id)
    on delete set null (finish_product_id),
  constraint floor_system_template_components_component_role_check
    check (
      component_role in (
        'standard',
        'basecoat',
        'broadcast',
        'topcoat',
        'primer',
        'prep',
        'labor',
        'equipment',
        'add_on',
        'other'
      )
    ),
  constraint floor_system_template_components_quantity_basis_check
    check (
      quantity_basis in (
        'sqft',
        'linear_ft',
        'each',
        'fixed',
        'hour',
        'day',
        'percentage',
        'formula'
      )
    ),
  constraint floor_system_template_components_sort_order_check
    check (sort_order >= 0),
  constraint floor_system_template_components_quantity_basis_not_blank_check
    check (char_length(btrim(quantity_basis)) > 0),
  constraint floor_system_template_components_default_quantity_check
    check (default_quantity is null or default_quantity >= 0),
  constraint floor_system_template_components_formula_metadata_object_check
    check (jsonb_typeof(formula_metadata) = 'object'),
  constraint floor_system_template_components_customer_label_not_blank_check
    check (customer_facing_label is null or char_length(btrim(customer_facing_label)) > 0)
);

create unique index if not exists floor_system_template_components_company_id_id_unique_idx
  on public.floor_system_template_components (company_id, id);

create unique index if not exists floor_system_template_components_template_sort_item_unique_idx
  on public.floor_system_template_components (floor_system_template_id, sort_order, catalog_item_id);

create index if not exists floor_system_template_components_template_sort_idx
  on public.floor_system_template_components (company_id, floor_system_template_id, sort_order);

create index if not exists floor_system_template_components_catalog_item_idx
  on public.floor_system_template_components (company_id, catalog_item_id);

create index if not exists floor_system_template_components_finish_product_idx
  on public.floor_system_template_components (company_id, finish_product_id)
  where finish_product_id is not null;

drop trigger if exists set_floor_system_template_components_updated_at on public.floor_system_template_components;
create trigger set_floor_system_template_components_updated_at
before update on public.floor_system_template_components
for each row
execute function public.set_updated_at();

alter table public.floor_system_template_components enable row level security;
alter table public.floor_system_template_components force row level security;

drop policy if exists floor_system_template_components_select_by_membership on public.floor_system_template_components;
create policy floor_system_template_components_select_by_membership
on public.floor_system_template_components
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists floor_system_template_components_insert_by_membership on public.floor_system_template_components;
create policy floor_system_template_components_insert_by_membership
on public.floor_system_template_components
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists floor_system_template_components_update_by_membership on public.floor_system_template_components;
create policy floor_system_template_components_update_by_membership
on public.floor_system_template_components
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists floor_system_template_components_delete_by_membership on public.floor_system_template_components;
create policy floor_system_template_components_delete_by_membership
on public.floor_system_template_components
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on table public.finish_products is 'Tenant-owned manufacturer/product/spec proof metadata for floor finishes and surface systems. Not a cost item or pricing source.';
comment on table public.floor_system_templates is 'Tenant-owned reusable floor system template definitions built on catalog_items for estimate expansion.';
comment on table public.floor_system_template_components is 'Tenant-owned floor system template components. catalog_item_id is required as the canonical cost/reusable item source; finish_product_id is optional spec metadata.';
