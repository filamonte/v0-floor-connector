do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'invoice_lineage_type'
  ) then
    create type public.invoice_lineage_type as enum (
      'estimate_snapshot_item',
      'sov_item',
      'change_order_snapshot_item',
      'invoice_only_adjustment'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'invoice_only_adjustment_kind'
  ) then
    create type public.invoice_only_adjustment_kind as enum (
      'manual_catalog_item',
      'explicit_adjustment'
    );
  end if;
end
$$;

create unique index if not exists estimate_commercial_snapshot_items_company_id_id_unique_idx
  on public.estimate_commercial_snapshot_items (company_id, id);

create table if not exists public.change_order_commercial_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  change_order_id uuid not null,
  customer_id uuid not null,
  project_id uuid not null,
  contract_id uuid,
  invoice_id uuid,
  snapshot_version integer not null,
  title_snapshot text not null,
  description_snapshot text,
  scope_change_notes_snapshot text,
  price_adjustment_total numeric(12, 2) not null default 0,
  approved_at timestamptz not null default timezone('utc', now()),
  approved_by uuid references public.users(id) on delete set null,
  source_change_order_updated_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint change_order_commercial_snapshots_change_order_company_fkey
    foreign key (company_id, change_order_id)
    references public.change_orders(company_id, id)
    on delete restrict,
  constraint change_order_commercial_snapshots_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint change_order_commercial_snapshots_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint change_order_commercial_snapshots_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete set null,
  constraint change_order_commercial_snapshots_invoice_company_fkey
    foreign key (company_id, invoice_id)
    references public.invoices(company_id, id)
    on delete set null,
  constraint change_order_commercial_snapshots_version_positive_check
    check (snapshot_version > 0)
);

create unique index if not exists change_order_commercial_snapshots_company_change_order_version_idx
  on public.change_order_commercial_snapshots (company_id, change_order_id, snapshot_version);

create unique index if not exists change_order_commercial_snapshots_company_id_id_unique_idx
  on public.change_order_commercial_snapshots (company_id, id);

create index if not exists change_order_commercial_snapshots_project_idx
  on public.change_order_commercial_snapshots (company_id, project_id, created_at desc);

create table if not exists public.change_order_commercial_snapshot_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  change_order_commercial_snapshot_id uuid not null,
  change_order_id uuid not null,
  catalog_item_id uuid,
  tax_code_id uuid,
  name text not null,
  description text,
  quantity numeric(12, 2) not null default 1,
  unit text not null default 'each',
  taxable boolean not null default false,
  base_unit_cost numeric(12, 2) not null default 0,
  base_unit_price numeric(12, 2),
  markup_percent numeric(7, 2) not null default 0,
  hidden_markup_percent numeric(7, 2) not null default 0,
  unit_price_before_hidden_markup numeric(12, 2) not null default 0,
  visible_markup_amount numeric(12, 2) not null default 0,
  hidden_markup_amount numeric(12, 2) not null default 0,
  unit_price numeric(12, 2) not null default 0,
  tax_rate_snapshot numeric(9, 6) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  line_subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  cost_code text,
  line_total numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint change_order_commercial_snapshot_items_snapshot_company_fkey
    foreign key (company_id, change_order_commercial_snapshot_id)
    references public.change_order_commercial_snapshots(company_id, id)
    on delete cascade,
  constraint change_order_commercial_snapshot_items_change_order_company_fkey
    foreign key (company_id, change_order_id)
    references public.change_orders(company_id, id)
    on delete restrict,
  constraint change_order_commercial_snapshot_items_catalog_item_company_fkey
    foreign key (company_id, catalog_item_id)
    references public.catalog_items(company_id, id)
    on delete set null,
  constraint change_order_commercial_snapshot_items_tax_code_company_fkey
    foreign key (company_id, tax_code_id)
    references public.tax_codes(company_id, id)
    on delete set null,
  constraint change_order_commercial_snapshot_items_tax_rate_snapshot_range_check
    check (tax_rate_snapshot >= 0 and tax_rate_snapshot <= 1)
);

create unique index if not exists change_order_commercial_snapshot_items_company_id_id_unique_idx
  on public.change_order_commercial_snapshot_items (company_id, id);

create index if not exists change_order_commercial_snapshot_items_snapshot_idx
  on public.change_order_commercial_snapshot_items (
    company_id,
    change_order_commercial_snapshot_id,
    sort_order
  );

create or replace function public.prevent_change_order_snapshot_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Change order commercial snapshots are immutable and cannot be changed once created.';
end;
$$;

drop trigger if exists prevent_change_order_commercial_snapshot_update
  on public.change_order_commercial_snapshots;
create trigger prevent_change_order_commercial_snapshot_update
before update or delete on public.change_order_commercial_snapshots
for each row
execute function public.prevent_change_order_snapshot_mutation();

drop trigger if exists prevent_change_order_commercial_snapshot_item_update
  on public.change_order_commercial_snapshot_items;
create trigger prevent_change_order_commercial_snapshot_item_update
before update or delete on public.change_order_commercial_snapshot_items
for each row
execute function public.prevent_change_order_snapshot_mutation();

create or replace function public.create_change_order_commercial_snapshot(
  target_change_order_id uuid,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  change_order_row public.change_orders%rowtype;
  snapshot_id uuid;
  next_snapshot_version integer;
begin
  select *
  into change_order_row
  from public.change_orders
  where id = target_change_order_id;

  if not found then
    raise exception 'Change order % not found.', target_change_order_id;
  end if;

  if change_order_row.status <> 'approved' then
    raise exception 'Commercial snapshots can only be created from approved change orders.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_change_order_id::text || ':change_order_snapshot', 0));

  select coalesce(max(snapshot_version), 0) + 1
  into next_snapshot_version
  from public.change_order_commercial_snapshots
  where company_id = change_order_row.company_id
    and change_order_id = change_order_row.id;

  insert into public.change_order_commercial_snapshots (
    company_id,
    change_order_id,
    customer_id,
    project_id,
    contract_id,
    invoice_id,
    snapshot_version,
    title_snapshot,
    description_snapshot,
    scope_change_notes_snapshot,
    price_adjustment_total,
    approved_at,
    approved_by,
    source_change_order_updated_at
  )
  values (
    change_order_row.company_id,
    change_order_row.id,
    change_order_row.customer_id,
    change_order_row.project_id,
    change_order_row.contract_id,
    change_order_row.invoice_id,
    next_snapshot_version,
    change_order_row.title,
    change_order_row.description,
    change_order_row.scope_change_notes,
    change_order_row.price_adjustment,
    coalesce(change_order_row.approved_at, timezone('utc', now())),
    acting_user_id,
    change_order_row.updated_at
  )
  returning id into snapshot_id;

  insert into public.change_order_commercial_snapshot_items (
    company_id,
    change_order_commercial_snapshot_id,
    change_order_id,
    name,
    description,
    quantity,
    unit,
    taxable,
    base_unit_cost,
    base_unit_price,
    markup_percent,
    hidden_markup_percent,
    unit_price_before_hidden_markup,
    visible_markup_amount,
    hidden_markup_amount,
    unit_price,
    tax_rate_snapshot,
    discount_amount,
    line_subtotal,
    tax_amount,
    cost_code,
    line_total,
    sort_order
  )
  values (
    change_order_row.company_id,
    snapshot_id,
    change_order_row.id,
    change_order_row.title,
    coalesce(change_order_row.description, change_order_row.scope_change_notes),
    1,
    'each',
    false,
    0,
    null,
    0,
    0,
    change_order_row.price_adjustment,
    0,
    0,
    change_order_row.price_adjustment,
    0,
    0,
    change_order_row.price_adjustment,
    0,
    null,
    change_order_row.price_adjustment,
    0
  );

  return snapshot_id;
end;
$$;

create or replace function public.snapshot_change_order_on_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    perform public.create_change_order_commercial_snapshot(new.id, new.updated_by);
  end if;

  return new;
end;
$$;

drop trigger if exists snapshot_change_order_on_approval on public.change_orders;
create trigger snapshot_change_order_on_approval
after insert or update of status on public.change_orders
for each row
when (new.status = 'approved')
execute function public.snapshot_change_order_on_approval();

alter table public.change_order_commercial_snapshots enable row level security;
alter table public.change_order_commercial_snapshots force row level security;

drop policy if exists change_order_commercial_snapshots_select_by_membership on public.change_order_commercial_snapshots;
create policy change_order_commercial_snapshots_select_by_membership
on public.change_order_commercial_snapshots
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists change_order_commercial_snapshots_insert_by_membership on public.change_order_commercial_snapshots;
create policy change_order_commercial_snapshots_insert_by_membership
on public.change_order_commercial_snapshots
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

alter table public.change_order_commercial_snapshot_items enable row level security;
alter table public.change_order_commercial_snapshot_items force row level security;

drop policy if exists change_order_commercial_snapshot_items_select_by_membership on public.change_order_commercial_snapshot_items;
create policy change_order_commercial_snapshot_items_select_by_membership
on public.change_order_commercial_snapshot_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists change_order_commercial_snapshot_items_insert_by_membership on public.change_order_commercial_snapshot_items;
create policy change_order_commercial_snapshot_items_insert_by_membership
on public.change_order_commercial_snapshot_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

alter table public.invoice_line_items
  add column if not exists lineage_type public.invoice_lineage_type,
  add column if not exists estimate_snapshot_item_id uuid,
  add column if not exists change_order_snapshot_item_id uuid,
  add column if not exists invoice_only_adjustment_kind public.invoice_only_adjustment_kind;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_estimate_snapshot_item_company_fkey;
alter table public.invoice_line_items
  add constraint invoice_line_items_estimate_snapshot_item_company_fkey
  foreign key (company_id, estimate_snapshot_item_id)
  references public.estimate_commercial_snapshot_items(company_id, id)
  on delete set null;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_change_order_snapshot_item_company_fkey;
alter table public.invoice_line_items
  add constraint invoice_line_items_change_order_snapshot_item_company_fkey
  foreign key (company_id, change_order_snapshot_item_id)
  references public.change_order_commercial_snapshot_items(company_id, id)
  on delete set null;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_quantity_positive_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_quantity_nonnegative_check
  check (quantity >= 0);

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_unit_price_nonnegative_check;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_line_total_nonnegative_check;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_line_subtotal_nonnegative_check;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_tax_amount_nonnegative_check;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_lineage_source_check;
alter table public.invoice_line_items
  add constraint invoice_line_items_lineage_source_check
  check (
    lineage_type is null
    or (
      lineage_type = 'estimate_snapshot_item'
      and estimate_snapshot_item_id is not null
      and schedule_of_value_item_id is null
      and change_order_snapshot_item_id is null
      and invoice_only_adjustment_kind is null
    )
    or (
      lineage_type = 'sov_item'
      and estimate_snapshot_item_id is null
      and schedule_of_value_item_id is not null
      and change_order_snapshot_item_id is null
      and invoice_only_adjustment_kind is null
    )
    or (
      lineage_type = 'change_order_snapshot_item'
      and estimate_snapshot_item_id is null
      and schedule_of_value_item_id is null
      and change_order_snapshot_item_id is not null
      and invoice_only_adjustment_kind is null
    )
    or (
      lineage_type = 'invoice_only_adjustment'
      and estimate_snapshot_item_id is null
      and schedule_of_value_item_id is null
      and change_order_snapshot_item_id is null
      and invoice_only_adjustment_kind is not null
    )
  );

create index if not exists invoice_line_items_estimate_snapshot_item_idx
  on public.invoice_line_items (company_id, estimate_snapshot_item_id)
  where estimate_snapshot_item_id is not null;

create index if not exists invoice_line_items_change_order_snapshot_item_idx
  on public.invoice_line_items (company_id, change_order_snapshot_item_id)
  where change_order_snapshot_item_id is not null;

comment on table public.change_order_commercial_snapshots is 'Immutable approved change-order snapshot headers used to preserve billing lineage when scope changes are invoiced downstream.';
comment on table public.change_order_commercial_snapshot_items is 'Immutable approved change-order snapshot line items used as invoice sources for downstream change-order billing.';
comment on column public.invoice_line_items.lineage_type is 'Canonical source classification for this invoice line. New invoice rows must use exactly one lineage path or an explicit invoice-only adjustment.';
comment on column public.invoice_line_items.estimate_snapshot_item_id is 'Approved estimate snapshot item that directly seeded this invoice line.';
comment on column public.invoice_line_items.change_order_snapshot_item_id is 'Approved change-order snapshot item that directly seeded this invoice line.';
comment on column public.invoice_line_items.invoice_only_adjustment_kind is 'Subtype for invoice-only adjustments that have no upstream estimate, SOV, or change-order snapshot source.';
