do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'inventory_transaction_type'
  ) then
    create type public.inventory_transaction_type as enum (
      'purchase',
      'adjustment',
      'job_usage',
      'return',
      'waste',
      'transfer'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'cost_item_component_type'
  ) then
    create type public.cost_item_component_type as enum (
      'inventory',
      'labor',
      'equipment',
      'subcontractor',
      'fee',
      'other'
    );
  end if;
end
$$;

create or replace function public.normalize_lookup_text(value text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(lower(btrim(coalesce(value, ''))), '\s+', ' ', 'g'), '');
$$;

create table if not exists public.tax_codes (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  normalized_name text generated always as (public.normalize_lookup_text(name)) stored,
  rate numeric(9, 6) not null default 0,
  jurisdiction text,
  active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tax_codes_name_not_blank_check
    check (char_length(btrim(name)) > 0),
  constraint tax_codes_rate_range_check
    check (rate >= 0 and rate <= 1)
);

create unique index if not exists tax_codes_company_normalized_name_unique_idx
  on public.tax_codes (company_id, normalized_name);

create unique index if not exists tax_codes_company_id_id_unique_idx
  on public.tax_codes (company_id, id);

create index if not exists tax_codes_company_active_idx
  on public.tax_codes (company_id, active, name);

drop trigger if exists set_tax_codes_updated_at on public.tax_codes;
create trigger set_tax_codes_updated_at
before update on public.tax_codes
for each row
execute function public.set_updated_at();

alter table public.tax_codes enable row level security;
alter table public.tax_codes force row level security;

drop policy if exists tax_codes_select_by_membership on public.tax_codes;
create policy tax_codes_select_by_membership
on public.tax_codes
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists tax_codes_insert_by_membership on public.tax_codes;
create policy tax_codes_insert_by_membership
on public.tax_codes
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists tax_codes_update_by_membership on public.tax_codes;
create policy tax_codes_update_by_membership
on public.tax_codes
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create table if not exists public.inventory_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  normalized_name text generated always as (public.normalize_lookup_text(name)) stored,
  sku text,
  normalized_sku text generated always as (public.normalize_lookup_text(sku)) stored,
  description text,
  category text,
  unit_of_measure text not null default 'each',
  current_quantity numeric(12, 4) not null default 0,
  reorder_point numeric(12, 4) not null default 0,
  default_unit_cost numeric(12, 2) not null default 0,
  taxable boolean not null default true,
  status public.document_template_status not null default 'active',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint inventory_items_name_not_blank_check
    check (char_length(btrim(name)) > 0),
  constraint inventory_items_unit_of_measure_not_blank_check
    check (char_length(btrim(unit_of_measure)) > 0),
  constraint inventory_items_current_quantity_nonnegative_check
    check (current_quantity >= 0),
  constraint inventory_items_reorder_point_nonnegative_check
    check (reorder_point >= 0),
  constraint inventory_items_default_unit_cost_nonnegative_check
    check (default_unit_cost >= 0)
);

create unique index if not exists inventory_items_company_normalized_name_unique_idx
  on public.inventory_items (company_id, normalized_name);

create unique index if not exists inventory_items_company_normalized_sku_unique_idx
  on public.inventory_items (company_id, normalized_sku)
  where normalized_sku is not null;

create unique index if not exists inventory_items_company_id_id_unique_idx
  on public.inventory_items (company_id, id);

create index if not exists inventory_items_company_status_category_idx
  on public.inventory_items (company_id, status, category, name);

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row
execute function public.set_updated_at();

alter table public.inventory_items enable row level security;
alter table public.inventory_items force row level security;

drop policy if exists inventory_items_select_by_membership on public.inventory_items;
create policy inventory_items_select_by_membership
on public.inventory_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists inventory_items_insert_by_membership on public.inventory_items;
create policy inventory_items_insert_by_membership
on public.inventory_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists inventory_items_update_by_membership on public.inventory_items;
create policy inventory_items_update_by_membership
on public.inventory_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create table if not exists public.inventory_transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  inventory_item_id uuid not null,
  transaction_type public.inventory_transaction_type not null,
  quantity_change numeric(12, 4) not null,
  unit_cost numeric(12, 2),
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint inventory_transactions_inventory_item_company_fkey
    foreign key (company_id, inventory_item_id)
    references public.inventory_items(company_id, id)
    on delete restrict,
  constraint inventory_transactions_quantity_change_nonzero_check
    check (quantity_change <> 0),
  constraint inventory_transactions_unit_cost_nonnegative_check
    check (unit_cost is null or unit_cost >= 0)
);

create index if not exists inventory_transactions_company_item_created_idx
  on public.inventory_transactions (company_id, inventory_item_id, created_at desc);

create index if not exists inventory_transactions_company_reference_idx
  on public.inventory_transactions (company_id, reference_type, reference_id);

drop trigger if exists set_inventory_transactions_updated_at on public.inventory_transactions;
create trigger set_inventory_transactions_updated_at
before update on public.inventory_transactions
for each row
execute function public.set_updated_at();

create or replace function public.apply_inventory_transaction_quantity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.inventory_items
    set
      current_quantity = greatest(0, current_quantity + new.quantity_change),
      updated_at = timezone('utc', now()),
      updated_by = coalesce(new.updated_by, new.created_by)
    where company_id = new.company_id
      and id = new.inventory_item_id;

    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.inventory_items
    set
      current_quantity = greatest(0, current_quantity - old.quantity_change),
      updated_at = timezone('utc', now()),
      updated_by = old.updated_by
    where company_id = old.company_id
      and id = old.inventory_item_id;

    return old;
  end if;

  if old.company_id = new.company_id and old.inventory_item_id = new.inventory_item_id then
    update public.inventory_items
    set
      current_quantity = greatest(0, current_quantity - old.quantity_change + new.quantity_change),
      updated_at = timezone('utc', now()),
      updated_by = coalesce(new.updated_by, new.created_by)
    where company_id = new.company_id
      and id = new.inventory_item_id;
  else
    update public.inventory_items
    set
      current_quantity = greatest(0, current_quantity - old.quantity_change),
      updated_at = timezone('utc', now()),
      updated_by = old.updated_by
    where company_id = old.company_id
      and id = old.inventory_item_id;

    update public.inventory_items
    set
      current_quantity = greatest(0, current_quantity + new.quantity_change),
      updated_at = timezone('utc', now()),
      updated_by = coalesce(new.updated_by, new.created_by)
    where company_id = new.company_id
      and id = new.inventory_item_id;
  end if;

  return new;
end;
$$;

drop trigger if exists apply_inventory_transaction_quantity on public.inventory_transactions;
create trigger apply_inventory_transaction_quantity
after insert or update or delete on public.inventory_transactions
for each row
execute function public.apply_inventory_transaction_quantity();

alter table public.inventory_transactions enable row level security;
alter table public.inventory_transactions force row level security;

drop policy if exists inventory_transactions_select_by_membership on public.inventory_transactions;
create policy inventory_transactions_select_by_membership
on public.inventory_transactions
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists inventory_transactions_insert_by_membership on public.inventory_transactions;
create policy inventory_transactions_insert_by_membership
on public.inventory_transactions
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists inventory_transactions_update_by_membership on public.inventory_transactions;
create policy inventory_transactions_update_by_membership
on public.inventory_transactions
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.catalog_items
  add column if not exists normalized_name text generated always as (public.normalize_lookup_text(name)) stored,
  add column if not exists normalized_sku text generated always as (public.normalize_lookup_text(sku)) stored,
  add column if not exists tax_code_id uuid;

-- Diagnostic query for duplicate normalized names:
-- select company_id, normalized_name, count(*)
-- from public.catalog_items
-- where normalized_name is not null and normalized_name <> ''
-- group by company_id, normalized_name
-- having count(*) > 1;
do $$
begin
  if exists (
    select 1
    from public.catalog_items
    where normalized_name is not null
      and normalized_name <> ''
    group by company_id, normalized_name
    having count(*) > 1
  ) then
    raise notice
      'Skipping unique index catalog_items_company_normalized_name_unique_idx because duplicate catalog_items normalized_name rows already exist. Creating non-unique lookup index instead.';

    create index if not exists catalog_items_company_normalized_name_lookup_idx
      on public.catalog_items (company_id, normalized_name);
  else
    create unique index if not exists catalog_items_company_normalized_name_unique_idx
      on public.catalog_items (company_id, normalized_name);
  end if;
end
$$;

-- Diagnostic query for duplicate normalized SKUs:
-- select company_id, normalized_sku, count(*)
-- from public.catalog_items
-- where normalized_sku is not null and normalized_sku <> ''
-- group by company_id, normalized_sku
-- having count(*) > 1;
do $$
begin
  if exists (
    select 1
    from public.catalog_items
    where normalized_sku is not null
      and normalized_sku <> ''
    group by company_id, normalized_sku
    having count(*) > 1
  ) then
    raise notice
      'Skipping unique index catalog_items_company_normalized_sku_unique_idx because duplicate catalog_items normalized_sku rows already exist. Creating non-unique lookup index instead.';

    create index if not exists catalog_items_company_normalized_sku_lookup_idx
      on public.catalog_items (company_id, normalized_sku)
      where normalized_sku is not null;
  else
    create unique index if not exists catalog_items_company_normalized_sku_unique_idx
      on public.catalog_items (company_id, normalized_sku)
      where normalized_sku is not null;
  end if;
end
$$;

alter table public.catalog_items
  drop constraint if exists catalog_items_tax_code_company_fkey;
alter table public.catalog_items
  add constraint catalog_items_tax_code_company_fkey
  foreign key (company_id, tax_code_id)
  references public.tax_codes(company_id, id)
  on delete set null;

create table if not exists public.cost_item_components (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  cost_item_id uuid not null,
  component_type public.cost_item_component_type not null,
  inventory_item_id uuid,
  labor_rate_id uuid,
  equipment_item_id uuid,
  quantity_per_unit numeric(12, 4) not null default 1,
  unit_cost numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cost_item_components_cost_item_company_fkey
    foreign key (company_id, cost_item_id)
    references public.catalog_items(company_id, id)
    on delete cascade,
  constraint cost_item_components_inventory_item_company_fkey
    foreign key (company_id, inventory_item_id)
    references public.inventory_items(company_id, id)
    on delete restrict,
  constraint cost_item_components_quantity_per_unit_positive_check
    check (quantity_per_unit > 0),
  constraint cost_item_components_unit_cost_nonnegative_check
    check (unit_cost >= 0),
  constraint cost_item_components_target_presence_check
    check (
      (component_type = 'inventory' and inventory_item_id is not null)
      or component_type in ('labor', 'equipment', 'subcontractor', 'fee', 'other')
    )
);

create index if not exists cost_item_components_company_cost_item_sort_idx
  on public.cost_item_components (company_id, cost_item_id, sort_order, created_at);

drop trigger if exists set_cost_item_components_updated_at on public.cost_item_components;
create trigger set_cost_item_components_updated_at
before update on public.cost_item_components
for each row
execute function public.set_updated_at();

alter table public.cost_item_components enable row level security;
alter table public.cost_item_components force row level security;

drop policy if exists cost_item_components_select_by_membership on public.cost_item_components;
create policy cost_item_components_select_by_membership
on public.cost_item_components
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists cost_item_components_insert_by_membership on public.cost_item_components;
create policy cost_item_components_insert_by_membership
on public.cost_item_components
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists cost_item_components_update_by_membership on public.cost_item_components;
create policy cost_item_components_update_by_membership
on public.cost_item_components
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.estimate_line_items
  add column if not exists tax_code_id uuid,
  add column if not exists tax_rate_snapshot numeric(9, 6) not null default 0,
  add column if not exists discount_amount numeric(12, 2) not null default 0,
  add column if not exists line_subtotal numeric(12, 2) not null default 0,
  add column if not exists tax_amount numeric(12, 2) not null default 0;

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_tax_code_company_fkey;
alter table public.estimate_line_items
  add constraint estimate_line_items_tax_code_company_fkey
  foreign key (company_id, tax_code_id)
  references public.tax_codes(company_id, id)
  on delete set null;

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_tax_rate_snapshot_range_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_tax_rate_snapshot_range_check
  check (tax_rate_snapshot >= 0 and tax_rate_snapshot <= 1);

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_discount_amount_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_discount_amount_nonnegative_check
  check (discount_amount >= 0);

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_line_subtotal_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_line_subtotal_nonnegative_check
  check (line_subtotal >= 0);

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_tax_amount_nonnegative_check;
alter table public.estimate_line_items
  add constraint estimate_line_items_tax_amount_nonnegative_check
  check (tax_amount >= 0);

create index if not exists estimate_line_items_tax_code_idx
  on public.estimate_line_items (company_id, tax_code_id);

alter table public.invoice_line_items
  add column if not exists estimate_line_item_id uuid,
  add column if not exists tax_code_id uuid,
  add column if not exists tax_rate_snapshot numeric(9, 6) not null default 0,
  add column if not exists discount_amount numeric(12, 2) not null default 0,
  add column if not exists line_subtotal numeric(12, 2) not null default 0,
  add column if not exists tax_amount numeric(12, 2) not null default 0;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_estimate_line_item_company_fkey;
alter table public.invoice_line_items
  add constraint invoice_line_items_estimate_line_item_company_fkey
  foreign key (company_id, estimate_line_item_id)
  references public.estimate_line_items(company_id, id)
  on delete set null;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_tax_code_company_fkey;
alter table public.invoice_line_items
  add constraint invoice_line_items_tax_code_company_fkey
  foreign key (company_id, tax_code_id)
  references public.tax_codes(company_id, id)
  on delete set null;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_tax_rate_snapshot_range_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_tax_rate_snapshot_range_check
  check (tax_rate_snapshot >= 0 and tax_rate_snapshot <= 1);

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_discount_amount_nonnegative_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_discount_amount_nonnegative_check
  check (discount_amount >= 0);

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_line_subtotal_nonnegative_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_line_subtotal_nonnegative_check
  check (line_subtotal >= 0);

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_tax_amount_nonnegative_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_tax_amount_nonnegative_check
  check (tax_amount >= 0);

create index if not exists invoice_line_items_estimate_line_item_idx
  on public.invoice_line_items (company_id, estimate_line_item_id);

create index if not exists invoice_line_items_tax_code_idx
  on public.invoice_line_items (company_id, tax_code_id);

-- Transition-period dirty estimate line rows may exist from before lineage enforcement
-- was fully server-owned. This migration only backfills financial snapshot fields for
-- rows that are safe to update under the existing lineage rule, and intentionally skips
-- lineage-violating rows for separate manual review and cleanup.
-- select id, estimate_id, source_type, catalog_item_id, source_system_id, source_component_id, created_at
-- from public.estimate_line_items
-- where created_at >= timestamptz '2026-04-24 00:30:00+00'
--   and not (
--     catalog_item_id is not null
--     and (
--       (
--         source_type = 'catalog_item'
--         and source_system_id is null
--         and source_component_id is null
--       )
--       or (
--         source_type = 'system_component'
--         and source_system_id is not null
--         and source_component_id is not null
--       )
--     )
--   );
update public.estimate_line_items
set
  line_subtotal = round(quantity * unit_price, 2),
  tax_amount = 0
where (line_subtotal = 0
   or tax_amount = 0)
   and (
     created_at < timestamptz '2026-04-24 00:30:00+00'
     or (
       catalog_item_id is not null
       and (
         (
           source_type = 'catalog_item'
           and source_system_id is null
           and source_component_id is null
         )
         or (
           source_type = 'system_component'
           and source_system_id is not null
           and source_component_id is not null
         )
       )
     )
   );

update public.invoice_line_items
set
  line_subtotal = round(quantity * unit_price, 2),
  tax_amount = 0
where line_subtotal = 0
   or tax_amount = 0;

comment on function public.normalize_lookup_text(text) is 'Canonical whitespace-trimming and case-normalization helper used to prevent duplicate organization-scoped inventory items, cost items, and tax codes.';
comment on table public.tax_codes is 'Organization-scoped tax code definitions used to snapshot line-level tax behavior on estimates and invoices.';
comment on table public.inventory_items is 'Organization-scoped physical inventory records. These are distinct from catalog_items, which remain the reusable sellable cost item database.';
comment on table public.inventory_transactions is 'Immutable-style inventory movement audit log. Inventory quantity should move through these transactions rather than silent quantity edits.';
comment on table public.cost_item_components is 'Component-level cost modeling for catalog_items. Supports inventory, labor, equipment, subcontractor, fee, and other cost composition without exposing internal cost structure to customer-facing surfaces.';
comment on table public.catalog_items is 'Canonical organization-scoped reusable cost item database used across estimating and invoicing. This remains distinct from inventory_items, which track physical stock.';
comment on column public.catalog_items.tax_code_id is 'Default organization-scoped tax code applied when the catalog item is snapshotted into estimate or invoice line items.';
comment on column public.estimate_line_items.tax_code_id is 'Optional tax code snapshot carried from the selected catalog item or manual line configuration at estimate-write time.';
comment on column public.estimate_line_items.tax_rate_snapshot is 'Snapshot of the effective tax rate for the line item at estimate-write time. Later tax-code changes must not retroactively change prior estimates.';
comment on column public.estimate_line_items.discount_amount is 'Line-level discount snapshot for estimate calculations. Document-level discount_amount on estimates remains available separately.';
comment on column public.estimate_line_items.line_subtotal is 'Pre-tax line subtotal snapshot derived from quantity multiplied by customer-facing unit price.';
comment on column public.invoice_line_items.estimate_line_item_id is 'Optional lineage link back to the estimate snapshot row that originated this invoice line. Invoice rows must remain copied snapshots, not live references.';
comment on column public.invoice_line_items.tax_code_id is 'Optional tax code snapshot carried from the selected estimate line item or manual invoice line configuration.';
comment on column public.invoice_line_items.tax_rate_snapshot is 'Snapshot of the effective tax rate for the invoice line item. Later tax-code changes must not retroactively change prior invoices.';
comment on column public.invoice_line_items.discount_amount is 'Line-level discount snapshot for invoice calculations. Document-level discount_amount on invoices remains available separately.';
comment on column public.invoice_line_items.line_subtotal is 'Pre-tax line subtotal snapshot derived from quantity multiplied by customer-facing unit price.';
