create table if not exists public.estimate_commercial_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  estimate_id uuid not null,
  customer_id uuid not null,
  project_id uuid not null,
  snapshot_version integer not null,
  template_id uuid,
  estimate_reference_number text not null,
  estimate_title text,
  estimate_status public.estimate_status not null,
  estimate_date date,
  expiration_date date,
  project_type text,
  sector text,
  subtotal_amount numeric(12, 2) not null default 0,
  taxable_sales_amount numeric(12, 2) not null default 0,
  exempt_sales_amount numeric(12, 2) not null default 0,
  tax_rate_applied numeric(9, 6) not null default 0,
  tax_behavior_applied public.tax_behavior not null,
  customer_tax_exempt_snapshot boolean not null default false,
  tax_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  notes text,
  terms_html text,
  inclusions_html text,
  exclusions_html text,
  scope_summary_html text,
  notes_html text,
  content_snapshot jsonb,
  customer_name_snapshot text not null,
  customer_company_name_snapshot text,
  customer_phone_snapshot text,
  customer_email_snapshot text,
  customer_address_line_1_snapshot text,
  customer_address_line_2_snapshot text,
  customer_city_snapshot text,
  customer_state_region_snapshot text,
  customer_postal_code_snapshot text,
  customer_country_code_snapshot text,
  service_address_line_1_snapshot text,
  service_address_line_2_snapshot text,
  service_city_snapshot text,
  service_state_region_snapshot text,
  service_postal_code_snapshot text,
  service_country_code_snapshot text,
  project_name_snapshot text not null,
  approved_at timestamptz not null default timezone('utc', now()),
  approved_by uuid references public.users(id) on delete set null,
  source_estimate_updated_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint estimate_commercial_snapshots_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete restrict,
  constraint estimate_commercial_snapshots_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint estimate_commercial_snapshots_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint estimate_commercial_snapshots_template_company_fkey
    foreign key (company_id, template_id)
    references public.document_templates(company_id, id)
    on delete set null,
  constraint estimate_commercial_snapshots_version_positive_check
    check (snapshot_version > 0),
  constraint estimate_commercial_snapshots_amounts_nonnegative_check
    check (
      subtotal_amount >= 0 and
      taxable_sales_amount >= 0 and
      exempt_sales_amount >= 0 and
      tax_rate_applied >= 0 and
      tax_rate_applied <= 1 and
      tax_amount >= 0 and
      discount_amount >= 0 and
      total_amount >= 0
    )
);

create unique index if not exists estimate_commercial_snapshots_company_estimate_version_idx
  on public.estimate_commercial_snapshots (company_id, estimate_id, snapshot_version);

create unique index if not exists estimate_commercial_snapshots_company_id_id_unique_idx
  on public.estimate_commercial_snapshots (company_id, id);

create index if not exists estimate_commercial_snapshots_company_estimate_idx
  on public.estimate_commercial_snapshots (company_id, estimate_id, created_at desc);

create table if not exists public.estimate_commercial_snapshot_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  estimate_commercial_snapshot_id uuid not null,
  estimate_id uuid not null,
  estimate_line_item_id uuid not null,
  catalog_item_id uuid,
  tax_code_id uuid,
  source_type text not null,
  source_system_id uuid,
  source_component_id uuid,
  item_type public.catalog_item_type,
  name text not null,
  description text,
  quantity numeric(12, 2) not null default 0,
  unit text not null,
  base_unit_cost numeric(12, 2) not null default 0,
  base_unit_price numeric(12, 2),
  markup_percent numeric(7, 2) not null default 0,
  hidden_markup_percent numeric(7, 2) not null default 0,
  unit_price_before_hidden_markup numeric(12, 2) not null default 0,
  visible_markup_amount numeric(12, 2) not null default 0,
  hidden_markup_amount numeric(12, 2) not null default 0,
  unit_price numeric(12, 2) not null default 0,
  taxable boolean not null default true,
  tax_rate_snapshot numeric(9, 6) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  line_subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  cost_code text,
  group_name text,
  assigned_to text,
  line_total numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint estimate_commercial_snapshot_items_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete restrict,
  constraint estimate_commercial_snapshot_items_estimate_line_item_company_fkey
    foreign key (company_id, estimate_line_item_id)
    references public.estimate_line_items(company_id, id)
    on delete restrict,
  constraint estimate_commercial_snapshot_items_catalog_item_company_fkey
    foreign key (company_id, catalog_item_id)
    references public.catalog_items(company_id, id)
    on delete set null,
  constraint estimate_commercial_snapshot_items_tax_code_company_fkey
    foreign key (company_id, tax_code_id)
    references public.tax_codes(company_id, id)
    on delete set null,
  constraint estimate_commercial_snapshot_items_source_type_check
    check (source_type in ('manual', 'catalog_item', 'system_component')),
  constraint estimate_commercial_snapshot_items_amounts_nonnegative_check
    check (
      quantity >= 0 and
      base_unit_cost >= 0 and
      (base_unit_price is null or base_unit_price >= 0)
    ),
  constraint estimate_commercial_snapshot_items_markup_nonnegative_check
    check (
      markup_percent >= 0 and
      hidden_markup_percent >= 0 and
      unit_price_before_hidden_markup >= 0 and
      visible_markup_amount >= 0 and
      hidden_markup_amount >= 0 and
      unit_price >= 0 and
      tax_rate_snapshot >= 0 and
      tax_rate_snapshot <= 1 and
      discount_amount >= 0 and
      line_subtotal >= 0 and
      tax_amount >= 0 and
      line_total >= 0
    )
);

create unique index if not exists estimate_commercial_snapshot_items_snapshot_line_item_idx
  on public.estimate_commercial_snapshot_items (
    company_id,
    estimate_commercial_snapshot_id,
    estimate_line_item_id
  );

create unique index if not exists estimate_commercial_snapshot_items_company_id_id_unique_idx
  on public.estimate_commercial_snapshot_items (company_id, id);

alter table public.estimate_commercial_snapshot_items
  drop constraint if exists estimate_commercial_snapshot_items_snapshot_company_fkey;
alter table public.estimate_commercial_snapshot_items
  add constraint estimate_commercial_snapshot_items_snapshot_company_fkey
  foreign key (company_id, estimate_commercial_snapshot_id)
  references public.estimate_commercial_snapshots(company_id, id)
  on delete cascade;

create index if not exists estimate_commercial_snapshot_items_snapshot_sort_idx
  on public.estimate_commercial_snapshot_items (estimate_commercial_snapshot_id, sort_order);

create or replace function public.prevent_estimate_snapshot_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Estimate commercial snapshots are immutable and cannot be changed once created.';
end;
$$;

drop trigger if exists prevent_estimate_commercial_snapshot_update
  on public.estimate_commercial_snapshots;
create trigger prevent_estimate_commercial_snapshot_update
before update or delete on public.estimate_commercial_snapshots
for each row
execute function public.prevent_estimate_snapshot_mutation();

drop trigger if exists prevent_estimate_commercial_snapshot_item_update
  on public.estimate_commercial_snapshot_items;
create trigger prevent_estimate_commercial_snapshot_item_update
before update or delete on public.estimate_commercial_snapshot_items
for each row
execute function public.prevent_estimate_snapshot_mutation();

create or replace function public.create_estimate_commercial_snapshot(
  target_estimate_id uuid,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  estimate_row public.estimates%rowtype;
  customer_row public.customers%rowtype;
  project_row public.projects%rowtype;
  snapshot_id uuid;
  next_snapshot_version integer;
begin
  select *
  into estimate_row
  from public.estimates
  where id = target_estimate_id;

  if not found then
    raise exception 'Estimate % not found.', target_estimate_id;
  end if;

  if estimate_row.status <> 'approved' then
    raise exception 'Commercial snapshots can only be created from approved estimates.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_estimate_id::text || ':commercial_snapshot', 0));

  select *
  into customer_row
  from public.customers
  where company_id = estimate_row.company_id
    and id = estimate_row.customer_id;

  if not found then
    raise exception 'Customer % not found for approved estimate %.', estimate_row.customer_id, estimate_row.id;
  end if;

  select *
  into project_row
  from public.projects
  where company_id = estimate_row.company_id
    and id = estimate_row.project_id;

  if not found then
    raise exception 'Project % not found for approved estimate %.', estimate_row.project_id, estimate_row.id;
  end if;

  select coalesce(max(snapshot_version), 0) + 1
  into next_snapshot_version
  from public.estimate_commercial_snapshots
  where company_id = estimate_row.company_id
    and estimate_id = estimate_row.id;

  insert into public.estimate_commercial_snapshots (
    company_id,
    estimate_id,
    customer_id,
    project_id,
    snapshot_version,
    template_id,
    estimate_reference_number,
    estimate_title,
    estimate_status,
    estimate_date,
    expiration_date,
    project_type,
    sector,
    subtotal_amount,
    taxable_sales_amount,
    exempt_sales_amount,
    tax_rate_applied,
    tax_behavior_applied,
    customer_tax_exempt_snapshot,
    tax_amount,
    discount_amount,
    total_amount,
    notes,
    terms_html,
    inclusions_html,
    exclusions_html,
    scope_summary_html,
    notes_html,
    content_snapshot,
    customer_name_snapshot,
    customer_company_name_snapshot,
    customer_phone_snapshot,
    customer_email_snapshot,
    customer_address_line_1_snapshot,
    customer_address_line_2_snapshot,
    customer_city_snapshot,
    customer_state_region_snapshot,
    customer_postal_code_snapshot,
    customer_country_code_snapshot,
    service_address_line_1_snapshot,
    service_address_line_2_snapshot,
    service_city_snapshot,
    service_state_region_snapshot,
    service_postal_code_snapshot,
    service_country_code_snapshot,
    project_name_snapshot,
    approved_at,
    approved_by,
    source_estimate_updated_at
  )
  values (
    estimate_row.company_id,
    estimate_row.id,
    estimate_row.customer_id,
    estimate_row.project_id,
    next_snapshot_version,
    estimate_row.template_id,
    estimate_row.reference_number,
    estimate_row.title,
    estimate_row.status,
    estimate_row.estimate_date,
    estimate_row.expiration_date,
    estimate_row.project_type,
    estimate_row.sector,
    estimate_row.subtotal_amount,
    estimate_row.taxable_sales_amount,
    estimate_row.exempt_sales_amount,
    estimate_row.tax_rate_applied,
    estimate_row.tax_behavior_applied,
    estimate_row.customer_tax_exempt_snapshot,
    estimate_row.tax_amount,
    estimate_row.discount_amount,
    estimate_row.total_amount,
    estimate_row.notes,
    case when estimate_row.content is null then null else estimate_row.content ->> 'termsHtml' end,
    case when estimate_row.content is null then null else estimate_row.content ->> 'inclusionsHtml' end,
    case when estimate_row.content is null then null else estimate_row.content ->> 'exclusionsHtml' end,
    case when estimate_row.content is null then null else estimate_row.content ->> 'scopeSummaryHtml' end,
    case when estimate_row.content is null then null else estimate_row.content ->> 'notesHtml' end,
    estimate_row.content,
    customer_row.name,
    customer_row.company_name,
    customer_row.phone,
    customer_row.email,
    customer_row.address_line_1,
    customer_row.address_line_2,
    customer_row.city,
    customer_row.state_region,
    customer_row.postal_code,
    customer_row.country_code,
    project_row.address_line_1,
    project_row.address_line_2,
    project_row.city,
    project_row.state_region,
    project_row.postal_code,
    project_row.country_code,
    project_row.name,
    timezone('utc', now()),
    coalesce(acting_user_id, estimate_row.updated_by),
    estimate_row.updated_at
  )
  returning id into snapshot_id;

  insert into public.estimate_commercial_snapshot_items (
    company_id,
    estimate_commercial_snapshot_id,
    estimate_id,
    estimate_line_item_id,
    catalog_item_id,
    tax_code_id,
    source_type,
    source_system_id,
    source_component_id,
    item_type,
    name,
    description,
    quantity,
    unit,
    base_unit_cost,
    base_unit_price,
    markup_percent,
    hidden_markup_percent,
    unit_price_before_hidden_markup,
    visible_markup_amount,
    hidden_markup_amount,
    unit_price,
    taxable,
    tax_rate_snapshot,
    discount_amount,
    line_subtotal,
    tax_amount,
    cost_code,
    group_name,
    assigned_to,
    line_total,
    sort_order
  )
  select
    line_item.company_id,
    snapshot_id,
    line_item.estimate_id,
    line_item.id,
    line_item.catalog_item_id,
    line_item.tax_code_id,
    line_item.source_type,
    line_item.source_system_id,
    line_item.source_component_id,
    line_item.item_type,
    line_item.name,
    line_item.description,
    line_item.quantity,
    line_item.unit,
    line_item.base_unit_cost,
    line_item.base_unit_price,
    line_item.markup_percent,
    line_item.hidden_markup_percent,
    line_item.unit_price_before_hidden_markup,
    line_item.visible_markup_amount,
    line_item.hidden_markup_amount,
    line_item.unit_price,
    line_item.taxable,
    line_item.tax_rate_snapshot,
    line_item.discount_amount,
    line_item.line_subtotal,
    line_item.tax_amount,
    line_item.cost_code,
    line_item.group_name,
    line_item.assigned_to,
    line_item.line_total,
    line_item.sort_order
  from public.estimate_line_items line_item
  where line_item.company_id = estimate_row.company_id
    and line_item.estimate_id = estimate_row.id
  order by line_item.sort_order asc, line_item.created_at asc;

  return snapshot_id;
end;
$$;

create or replace function public.snapshot_estimate_on_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved' then
    if tg_op = 'INSERT' then
      perform public.create_estimate_commercial_snapshot(new.id, new.updated_by);
    elsif old.status is distinct from 'approved' then
      perform public.create_estimate_commercial_snapshot(new.id, new.updated_by);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists snapshot_estimate_on_approval on public.estimates;
create trigger snapshot_estimate_on_approval
after insert or update of status on public.estimates
for each row
execute function public.snapshot_estimate_on_approval();

alter table public.estimate_commercial_snapshots enable row level security;
alter table public.estimate_commercial_snapshots force row level security;

drop policy if exists estimate_commercial_snapshots_select_by_membership on public.estimate_commercial_snapshots;
create policy estimate_commercial_snapshots_select_by_membership
on public.estimate_commercial_snapshots
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_commercial_snapshots_insert_by_membership on public.estimate_commercial_snapshots;
create policy estimate_commercial_snapshots_insert_by_membership
on public.estimate_commercial_snapshots
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

alter table public.estimate_commercial_snapshot_items enable row level security;
alter table public.estimate_commercial_snapshot_items force row level security;

drop policy if exists estimate_commercial_snapshot_items_select_by_membership on public.estimate_commercial_snapshot_items;
create policy estimate_commercial_snapshot_items_select_by_membership
on public.estimate_commercial_snapshot_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_commercial_snapshot_items_insert_by_membership on public.estimate_commercial_snapshot_items;
create policy estimate_commercial_snapshot_items_insert_by_membership
on public.estimate_commercial_snapshot_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

comment on table public.estimate_commercial_snapshots is 'Immutable approved-estimate commercial snapshot headers created at approval time so downstream legal and billing workflows can preserve historical truth.';
comment on table public.estimate_commercial_snapshot_items is 'Immutable approved-estimate commercial snapshot line items copied from estimate_line_items at approval time.';
comment on column public.estimate_commercial_snapshots.snapshot_version is 'Monotonic approval snapshot version for a canonical estimate. Each new approval creates a new immutable snapshot.';
comment on column public.estimate_commercial_snapshot_items.estimate_line_item_id is 'Original estimate_line_items row copied into this immutable approved-estimate snapshot line item.';
