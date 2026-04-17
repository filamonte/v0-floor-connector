do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'catalog_item_type'
  ) then
    create type public.catalog_item_type as enum (
      'material',
      'service',
      'system'
    );
  end if;
end
$$;

create table if not exists public.platform_user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_user_roles_user_role_unique unique (user_id, role_id)
);

create index if not exists platform_user_roles_user_id_idx
  on public.platform_user_roles (user_id);

create index if not exists platform_user_roles_role_id_idx
  on public.platform_user_roles (role_id);

drop trigger if exists platform_user_roles_set_updated_at on public.platform_user_roles;
create trigger platform_user_roles_set_updated_at
before update on public.platform_user_roles
for each row
execute function public.set_updated_at();

create table if not exists public.platform_financial_defaults (
  config_key text primary key default 'default',
  default_tax_rate numeric(9, 6) not null default 0,
  default_tax_behavior public.tax_behavior not null default 'exclusive',
  default_retainage_percentage numeric(5, 2) not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_financial_defaults_singleton_check check (config_key = 'default'),
  constraint platform_financial_defaults_tax_rate_range_check
    check (default_tax_rate >= 0 and default_tax_rate <= 1),
  constraint platform_financial_defaults_retainage_range_check
    check (default_retainage_percentage >= 0 and default_retainage_percentage <= 100)
);

drop trigger if exists set_platform_financial_defaults_updated_at on public.platform_financial_defaults;
create trigger set_platform_financial_defaults_updated_at
before update on public.platform_financial_defaults
for each row
execute function public.set_updated_at();

create table if not exists public.platform_workflow_defaults (
  config_key text primary key default 'default',
  approved_estimate_contract_seed_id uuid references public.platform_template_seeds(id) on delete set null,
  require_contract_internal_approval boolean not null default false,
  require_deposit_before_job_scheduling boolean not null default false,
  default_deposit_percentage numeric(5, 2) not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_workflow_defaults_singleton_check check (config_key = 'default'),
  constraint platform_workflow_defaults_default_deposit_range_check
    check (default_deposit_percentage >= 0 and default_deposit_percentage <= 100)
);

drop trigger if exists set_platform_workflow_defaults_updated_at on public.platform_workflow_defaults;
create trigger set_platform_workflow_defaults_updated_at
before update on public.platform_workflow_defaults
for each row
execute function public.set_updated_at();

create table if not exists public.platform_catalog_item_seeds (
  id uuid primary key default extensions.gen_random_uuid(),
  item_type public.catalog_item_type not null,
  seed_key text not null unique,
  name text not null,
  description text,
  unit text not null default 'unit',
  default_unit_price numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_catalog_item_seeds_default_unit_price_nonnegative_check
    check (default_unit_price >= 0)
);

create index if not exists platform_catalog_item_seeds_type_idx
  on public.platform_catalog_item_seeds (item_type, is_active, sort_order);

drop trigger if exists set_platform_catalog_item_seeds_updated_at on public.platform_catalog_item_seeds;
create trigger set_platform_catalog_item_seeds_updated_at
before update on public.platform_catalog_item_seeds
for each row
execute function public.set_updated_at();

create table if not exists public.catalog_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_seed_id uuid references public.platform_catalog_item_seeds(id) on delete set null,
  source_seed_key text,
  item_type public.catalog_item_type not null,
  name text not null,
  description text,
  unit text not null default 'unit',
  default_unit_price numeric(12, 2) not null default 0,
  status public.document_template_status not null default 'active',
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint catalog_items_default_unit_price_nonnegative_check
    check (default_unit_price >= 0)
);

create index if not exists catalog_items_company_type_status_idx
  on public.catalog_items (company_id, item_type, status, sort_order);

create unique index if not exists catalog_items_company_seed_unique_idx
  on public.catalog_items (company_id, source_seed_id)
  where source_seed_id is not null;

drop trigger if exists set_catalog_items_updated_at on public.catalog_items;
create trigger set_catalog_items_updated_at
before update on public.catalog_items
for each row
execute function public.set_updated_at();

alter table public.catalog_items enable row level security;
alter table public.catalog_items force row level security;

drop policy if exists catalog_items_select_by_membership on public.catalog_items;
create policy catalog_items_select_by_membership
on public.catalog_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists catalog_items_insert_by_membership on public.catalog_items;
create policy catalog_items_insert_by_membership
on public.catalog_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists catalog_items_update_by_membership on public.catalog_items;
create policy catalog_items_update_by_membership
on public.catalog_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists catalog_items_delete_by_membership on public.catalog_items;
create policy catalog_items_delete_by_membership
on public.catalog_items
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

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
    default_unit_price,
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
    selected_seed.default_unit_price,
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

create or replace function public.ensure_company_system_roles(
  target_company_id uuid,
  acting_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.roles (
    company_id,
    key,
    name,
    description,
    scope,
    is_system,
    created_by,
    updated_by
  )
  values
    (
      target_company_id,
      'owner',
      'Owner',
      'Full administrative access for the company.',
      'company',
      true,
      acting_user_id,
      acting_user_id
    ),
    (
      target_company_id,
      'admin',
      'Admin',
      'Administrative access for organization settings and operational controls.',
      'company',
      true,
      acting_user_id,
      acting_user_id
    ),
    (
      target_company_id,
      'manager',
      'Manager',
      'Operational workflow access without full company ownership.',
      'company',
      true,
      acting_user_id,
      acting_user_id
    ),
    (
      target_company_id,
      'member',
      'Member',
      'Standard day-to-day workflow access for team members.',
      'company',
      true,
      acting_user_id,
      acting_user_id
    )
  on conflict do nothing;
end;
$$;

insert into public.roles (
  company_id,
  key,
  name,
  description,
  scope,
  is_system
)
values (
  null,
  'platform_admin',
  'Platform Admin',
  'Administrative access to the super-admin surface and global platform controls.',
  'platform',
  true
)
on conflict do nothing;

insert into public.platform_financial_defaults (
  config_key,
  default_tax_rate,
  default_tax_behavior,
  default_retainage_percentage
)
values (
  'default',
  0,
  'exclusive',
  0
)
on conflict (config_key) do nothing;

insert into public.platform_workflow_defaults (
  config_key,
  approved_estimate_contract_seed_id,
  require_contract_internal_approval,
  require_deposit_before_job_scheduling,
  default_deposit_percentage
)
select
  'default',
  seed.id,
  false,
  false,
  0
from public.platform_template_seeds seed
where seed.seed_key = 'default-contract-v1'
on conflict (config_key) do nothing;

insert into public.platform_catalog_item_seeds (
  item_type,
  seed_key,
  name,
  description,
  unit,
  default_unit_price,
  is_active,
  is_default,
  metadata,
  sort_order
)
values
  (
    'material',
    'resinous-basecoat-v1',
    'Resinous Basecoat',
    'Starter platform catalog material for resinous flooring basecoat work.',
    'sq ft',
    3.25,
    true,
    true,
    '{"category":"epoxy","workflow":"material"}'::jsonb,
    10
  ),
  (
    'material',
    'diamond-grinding-prep-v1',
    'Diamond Grinding Prep',
    'Starter platform catalog prep item for concrete polishing and coating preparation.',
    'sq ft',
    2.15,
    true,
    true,
    '{"category":"surface-prep","workflow":"material"}'::jsonb,
    20
  ),
  (
    'service',
    'site-measurement-v1',
    'Site Measurement Visit',
    'Starter reusable service item for inspection and field measurement visits.',
    'visit',
    250.00,
    true,
    true,
    '{"category":"preconstruction","workflow":"service"}'::jsonb,
    30
  )
on conflict (seed_key) do update set
  name = excluded.name,
  description = excluded.description,
  unit = excluded.unit,
  default_unit_price = excluded.default_unit_price,
  is_active = excluded.is_active,
  is_default = excluded.is_default,
  metadata = excluded.metadata,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.feature_flags (
  company_id,
  key,
  name,
  description,
  module_key,
  surface,
  enabled
)
values
  (null, 'platform-documents', 'Documents module', 'Platform policy for shared documents workflows.', 'documents', 'contractor_app', true),
  (null, 'platform-billing', 'Billing module', 'Platform policy for billing and invoice workflows.', 'billing', 'contractor_app', true),
  (null, 'platform-scheduling', 'Scheduling module', 'Platform policy for scheduling workflows.', 'scheduling', 'contractor_app', false),
  (null, 'platform-integrations', 'Integrations module', 'Platform policy for external integration workflows.', 'integrations', 'contractor_app', false),
  (null, 'platform-customer-portal', 'Customer portal surface', 'Platform policy for customer portal availability.', 'customer_portal', 'customer_portal', false),
  (null, 'platform-super-admin', 'Super admin surface', 'Platform policy for super-admin controls.', 'super_admin', 'super_admin', true)
on conflict do nothing;

comment on table public.platform_user_roles is 'Join table assigning platform-scoped roles to canonical users for super-admin and global configuration access.';
comment on table public.platform_financial_defaults is 'Platform-wide starter financial defaults that tenant organizations may adopt into organization-owned settings.';
comment on table public.platform_workflow_defaults is 'Platform-wide starter workflow defaults that shape the contractor estimate-to-contract-to-invoice slice before organizations override them.';
comment on table public.platform_catalog_item_seeds is 'Platform-managed starter catalog and master-data seeds that organizations can copy into editable tenant-owned catalog items.';
comment on table public.catalog_items is 'Organization-owned reusable master-data records shared across contractor workflows. These may originate from platform starter seeds but remain editable tenant copies.';
comment on function public.copy_platform_catalog_item_seed_to_company(uuid, uuid, uuid) is 'Creates an organization-owned copy of a platform catalog item seed so tenant changes never mutate the global starter seed.';
comment on function public.ensure_company_system_roles(uuid, uuid) is 'Ensures the standard owner/admin/manager/member company roles exist for organization-level administration and membership workflows.';
