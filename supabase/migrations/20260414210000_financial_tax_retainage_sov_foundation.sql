do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'tax_behavior'
  ) then
    create type public.tax_behavior as enum (
      'exclusive',
      'inclusive',
      'none'
    );
  end if;
end
$$;

create table if not exists public.organization_financial_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  default_tax_rate numeric(9, 6) not null default 0,
  default_tax_behavior public.tax_behavior not null default 'exclusive',
  external_tax_provider text,
  external_tax_provider_config jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_financial_settings_default_tax_rate_range_check
    check (default_tax_rate >= 0 and default_tax_rate <= 1)
);

create index if not exists organization_financial_settings_behavior_idx
  on public.organization_financial_settings (company_id, default_tax_behavior);

drop trigger if exists set_organization_financial_settings_updated_at on public.organization_financial_settings;
create trigger set_organization_financial_settings_updated_at
before update on public.organization_financial_settings
for each row
execute function public.set_updated_at();

alter table public.organization_financial_settings enable row level security;
alter table public.organization_financial_settings force row level security;

drop policy if exists organization_financial_settings_select_by_membership on public.organization_financial_settings;
create policy organization_financial_settings_select_by_membership
on public.organization_financial_settings
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists organization_financial_settings_insert_by_membership on public.organization_financial_settings;
create policy organization_financial_settings_insert_by_membership
on public.organization_financial_settings
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists organization_financial_settings_update_by_membership on public.organization_financial_settings;
create policy organization_financial_settings_update_by_membership
on public.organization_financial_settings
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create or replace function public.ensure_company_financial_settings(
  target_company_id uuid,
  acting_user_id uuid default null
)
returns public.organization_financial_settings
language plpgsql
security definer
set search_path = ''
as $$
declare
  settings_row public.organization_financial_settings;
begin
  insert into public.organization_financial_settings (
    company_id,
    created_by,
    updated_by
  )
  values (
    target_company_id,
    acting_user_id,
    acting_user_id
  )
  on conflict (company_id) do nothing;

  select *
  into settings_row
  from public.organization_financial_settings
  where company_id = target_company_id;

  return settings_row;
end;
$$;

alter table public.customers
  add column if not exists is_tax_exempt boolean not null default false,
  add column if not exists tax_exemption_reason text,
  add column if not exists tax_exemption_reference text,
  add column if not exists tax_exemption_expires_on date,
  add column if not exists retainage_percentage_default numeric(5, 2) not null default 0;

alter table public.customers
  drop constraint if exists customers_retainage_percentage_default_range_check;
alter table public.customers
  add constraint customers_retainage_percentage_default_range_check
  check (retainage_percentage_default >= 0 and retainage_percentage_default <= 100);

alter table public.invoices
  add column if not exists tax_rate_applied numeric(9, 6) not null default 0,
  add column if not exists tax_behavior_applied public.tax_behavior not null default 'exclusive',
  add column if not exists customer_tax_exempt_snapshot boolean not null default false,
  add column if not exists taxable_sales_amount numeric(12, 2) not null default 0,
  add column if not exists exempt_sales_amount numeric(12, 2) not null default 0,
  add column if not exists tax_collected_amount numeric(12, 2) not null default 0,
  add column if not exists retainage_percentage numeric(5, 2) not null default 0,
  add column if not exists retainage_held_amount numeric(12, 2) not null default 0;

alter table public.invoices
  drop constraint if exists invoices_tax_rate_applied_range_check;
alter table public.invoices
  add constraint invoices_tax_rate_applied_range_check
  check (tax_rate_applied >= 0 and tax_rate_applied <= 1);

alter table public.invoices
  drop constraint if exists invoices_retainage_percentage_range_check;
alter table public.invoices
  add constraint invoices_retainage_percentage_range_check
  check (retainage_percentage >= 0 and retainage_percentage <= 100);

alter table public.invoices
  drop constraint if exists invoices_taxable_sales_nonnegative_check;
alter table public.invoices
  add constraint invoices_taxable_sales_nonnegative_check
  check (taxable_sales_amount >= 0 and exempt_sales_amount >= 0 and tax_collected_amount >= 0 and retainage_held_amount >= 0);

create index if not exists invoices_tax_reporting_idx
  on public.invoices (company_id, issue_date, tax_behavior_applied);

create index if not exists invoices_customer_tax_exempt_snapshot_idx
  on public.invoices (company_id, customer_tax_exempt_snapshot);

create unique index if not exists estimate_line_items_company_id_id_unique_idx
  on public.estimate_line_items (company_id, id);

create table if not exists public.schedule_of_values (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  estimate_id uuid not null,
  billing_model text not null default 'aia_progress',
  source_estimate_status public.estimate_status not null default 'approved',
  retainage_percentage_default numeric(5, 2) not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedule_of_values_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint schedule_of_values_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint schedule_of_values_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete cascade,
  constraint schedule_of_values_retainage_percentage_default_range_check
    check (retainage_percentage_default >= 0 and retainage_percentage_default <= 100)
);

create unique index if not exists schedule_of_values_estimate_unique_idx
  on public.schedule_of_values (company_id, estimate_id);

create unique index if not exists schedule_of_values_company_id_id_unique_idx
  on public.schedule_of_values (company_id, id);

create index if not exists schedule_of_values_project_idx
  on public.schedule_of_values (company_id, project_id);

create table if not exists public.schedule_of_value_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  schedule_of_values_id uuid not null,
  source_estimate_line_item_id uuid not null,
  name text not null,
  description text,
  scheduled_value_amount numeric(12, 2) not null default 0,
  percent_complete numeric(5, 2) not null default 0,
  prior_billed_amount numeric(12, 2) not null default 0,
  current_billed_amount numeric(12, 2) not null default 0,
  retainage_percentage numeric(5, 2) not null default 0,
  retainage_held_amount numeric(12, 2) not null default 0,
  retainage_released_amount numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedule_of_value_items_sov_company_fkey
    foreign key (company_id, schedule_of_values_id)
    references public.schedule_of_values(company_id, id)
    on delete cascade,
  constraint schedule_of_value_items_estimate_line_item_company_fkey
    foreign key (company_id, source_estimate_line_item_id)
    references public.estimate_line_items(company_id, id)
    on delete restrict,
  constraint schedule_of_value_items_scheduled_value_nonnegative_check
    check (scheduled_value_amount >= 0),
  constraint schedule_of_value_items_percent_complete_range_check
    check (percent_complete >= 0 and percent_complete <= 100),
  constraint schedule_of_value_items_amounts_nonnegative_check
    check (
      prior_billed_amount >= 0 and
      current_billed_amount >= 0 and
      retainage_percentage >= 0 and
      retainage_percentage <= 100 and
      retainage_held_amount >= 0 and
      retainage_released_amount >= 0
    )
);

create unique index if not exists schedule_of_value_items_source_estimate_line_item_unique_idx
  on public.schedule_of_value_items (company_id, schedule_of_values_id, source_estimate_line_item_id);

create index if not exists schedule_of_value_items_sov_sort_idx
  on public.schedule_of_value_items (schedule_of_values_id, sort_order);

drop trigger if exists set_schedule_of_values_updated_at on public.schedule_of_values;
create trigger set_schedule_of_values_updated_at
before update on public.schedule_of_values
for each row
execute function public.set_updated_at();

drop trigger if exists set_schedule_of_value_items_updated_at on public.schedule_of_value_items;
create trigger set_schedule_of_value_items_updated_at
before update on public.schedule_of_value_items
for each row
execute function public.set_updated_at();

alter table public.schedule_of_values enable row level security;
alter table public.schedule_of_values force row level security;

drop policy if exists schedule_of_values_select_by_membership on public.schedule_of_values;
create policy schedule_of_values_select_by_membership
on public.schedule_of_values
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists schedule_of_values_insert_by_membership on public.schedule_of_values;
create policy schedule_of_values_insert_by_membership
on public.schedule_of_values
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists schedule_of_values_update_by_membership on public.schedule_of_values;
create policy schedule_of_values_update_by_membership
on public.schedule_of_values
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.schedule_of_value_items enable row level security;
alter table public.schedule_of_value_items force row level security;

drop policy if exists schedule_of_value_items_select_by_membership on public.schedule_of_value_items;
create policy schedule_of_value_items_select_by_membership
on public.schedule_of_value_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists schedule_of_value_items_insert_by_membership on public.schedule_of_value_items;
create policy schedule_of_value_items_insert_by_membership
on public.schedule_of_value_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists schedule_of_value_items_update_by_membership on public.schedule_of_value_items;
create policy schedule_of_value_items_update_by_membership
on public.schedule_of_value_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create or replace function public.apply_invoice_financial_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_row public.customers%rowtype;
  settings_row public.organization_financial_settings%rowtype;
  applied_tax_rate numeric(9, 6);
begin
  select *
  into customer_row
  from public.customers
  where id = new.customer_id
    and company_id = new.company_id;

  if not found then
    raise exception 'Customer % was not found for company %.', new.customer_id, new.company_id;
  end if;

  select *
  into settings_row
  from public.organization_financial_settings
  where company_id = new.company_id;

  if not found then
    settings_row := public.ensure_company_financial_settings(new.company_id, new.updated_by);
  end if;

  new.customer_tax_exempt_snapshot := customer_row.is_tax_exempt;
  new.tax_behavior_applied := settings_row.default_tax_behavior;

  if customer_row.is_tax_exempt or settings_row.default_tax_behavior = 'none' then
    applied_tax_rate := 0;
  else
    applied_tax_rate := settings_row.default_tax_rate;
  end if;

  new.tax_rate_applied := applied_tax_rate;

  if tg_op = 'INSERT' then
    new.retainage_percentage := coalesce(customer_row.retainage_percentage_default, 0);
  elsif new.customer_id is distinct from old.customer_id then
    new.retainage_percentage := coalesce(customer_row.retainage_percentage_default, 0);
  end if;

  return new;
end;
$$;

create or replace function public.recalculate_invoice_financials(
  target_invoice_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_invoice public.invoices%rowtype;
  next_subtotal numeric(12, 2);
  discounted_subtotal numeric(12, 2);
  next_total numeric(12, 2);
  next_tax_amount numeric(12, 2);
  next_taxable_sales_amount numeric(12, 2);
  next_exempt_sales_amount numeric(12, 2);
  next_retainage_amount numeric(12, 2);
  recorded_payment_total numeric(12, 2);
  next_balance_due numeric(12, 2);
  next_status public.invoice_status;
begin
  select *
  into target_invoice
  from public.invoices
  where id = target_invoice_id;

  if not found then
    return;
  end if;

  select coalesce(sum(line_item.line_total), 0)::numeric(12, 2)
  into next_subtotal
  from public.invoice_line_items line_item
  where line_item.invoice_id = target_invoice_id;

  discounted_subtotal := round(
    greatest(0, next_subtotal - coalesce(target_invoice.discount_amount, 0)),
    2
  );

  if target_invoice.customer_tax_exempt_snapshot or target_invoice.tax_behavior_applied = 'none' or coalesce(target_invoice.tax_rate_applied, 0) = 0 then
    next_tax_amount := 0;
    next_taxable_sales_amount := 0;
    next_exempt_sales_amount := discounted_subtotal;
    next_total := discounted_subtotal;
  elsif target_invoice.tax_behavior_applied = 'inclusive' then
    next_taxable_sales_amount := round(
      discounted_subtotal / (1 + target_invoice.tax_rate_applied),
      2
    );
    next_tax_amount := round(discounted_subtotal - next_taxable_sales_amount, 2);
    next_exempt_sales_amount := 0;
    next_total := discounted_subtotal;
  else
    next_taxable_sales_amount := discounted_subtotal;
    next_tax_amount := round(discounted_subtotal * target_invoice.tax_rate_applied, 2);
    next_exempt_sales_amount := 0;
    next_total := round(discounted_subtotal + next_tax_amount, 2);
  end if;

  next_retainage_amount := round(
    discounted_subtotal * (coalesce(target_invoice.retainage_percentage, 0) / 100.0),
    2
  );

  select coalesce(sum(payment.amount), 0)::numeric(12, 2)
  into recorded_payment_total
  from public.payments payment
  where payment.invoice_id = target_invoice_id
    and payment.status = 'recorded';

  if target_invoice.status = 'void' then
    next_balance_due := 0;
    next_status := 'void';
  else
    next_balance_due := round(
      greatest(0, next_total - next_retainage_amount - recorded_payment_total),
      2
    );

    if recorded_payment_total > 0 and next_balance_due = 0 then
      next_status := 'paid';
    elsif recorded_payment_total > 0 then
      next_status := 'partially_paid';
    elsif target_invoice.status in ('paid', 'partially_paid') then
      next_status := 'sent';
    else
      next_status := target_invoice.status;
    end if;
  end if;

  update public.invoices
  set
    subtotal_amount = next_subtotal,
    taxable_sales_amount = next_taxable_sales_amount,
    exempt_sales_amount = next_exempt_sales_amount,
    tax_amount = next_tax_amount,
    tax_collected_amount = next_tax_amount,
    retainage_held_amount = next_retainage_amount,
    total_amount = next_total,
    balance_due_amount = next_balance_due,
    status = next_status,
    updated_at = timezone('utc', now())
  where id = target_invoice_id;
end;
$$;

drop trigger if exists apply_invoice_financial_defaults on public.invoices;
create trigger apply_invoice_financial_defaults
before insert or update of customer_id, company_id on public.invoices
for each row
execute function public.apply_invoice_financial_defaults();

drop trigger if exists recalculate_invoice_totals_from_invoice on public.invoices;
create trigger recalculate_invoice_totals_from_invoice
after insert or update of discount_amount, status, tax_rate_applied, tax_behavior_applied, customer_tax_exempt_snapshot, retainage_percentage on public.invoices
for each row
when (pg_trigger_depth() = 0)
execute function public.handle_invoice_amount_recalculation();

create or replace function public.ensure_schedule_of_values_for_estimate(
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
  sov_id uuid;
begin
  select *
  into estimate_row
  from public.estimates
  where id = target_estimate_id;

  if not found then
    raise exception 'Estimate % not found.', target_estimate_id;
  end if;

  if estimate_row.status <> 'approved' then
    raise exception 'Schedule of values can only be provisioned from approved estimates.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_estimate_id::text, 0));

  select id
  into sov_id
  from public.schedule_of_values
  where company_id = estimate_row.company_id
    and estimate_id = estimate_row.id;

  if found then
    return sov_id;
  end if;

  select *
  into customer_row
  from public.customers
  where id = estimate_row.customer_id
    and company_id = estimate_row.company_id;

  insert into public.schedule_of_values (
    company_id,
    customer_id,
    project_id,
    estimate_id,
    retainage_percentage_default,
    created_by,
    updated_by
  )
  values (
    estimate_row.company_id,
    estimate_row.customer_id,
    estimate_row.project_id,
    estimate_row.id,
    coalesce(customer_row.retainage_percentage_default, 0),
    acting_user_id,
    acting_user_id
  )
  returning id into sov_id;

  insert into public.schedule_of_value_items (
    company_id,
    schedule_of_values_id,
    source_estimate_line_item_id,
    name,
    description,
    scheduled_value_amount,
    retainage_percentage,
    sort_order,
    created_by,
    updated_by
  )
  select
    line_item.company_id,
    sov_id,
    line_item.id,
    line_item.name,
    line_item.description,
    line_item.line_total,
    coalesce(customer_row.retainage_percentage_default, 0),
    line_item.sort_order,
    acting_user_id,
    acting_user_id
  from public.estimate_line_items line_item
  where line_item.estimate_id = estimate_row.id
  order by line_item.sort_order asc, line_item.created_at asc;

  return sov_id;
end;
$$;

create or replace view public.invoice_tax_reporting_entries as
select
  invoice.id as invoice_id,
  invoice.company_id,
  invoice.customer_id,
  invoice.project_id,
  invoice.issue_date,
  date_trunc('month', invoice.issue_date::timestamp)::date as reporting_period_start,
  (date_trunc('month', invoice.issue_date::timestamp) + interval '1 month - 1 day')::date as reporting_period_end,
  invoice.customer_tax_exempt_snapshot,
  invoice.tax_behavior_applied,
  invoice.tax_rate_applied,
  invoice.taxable_sales_amount,
  invoice.exempt_sales_amount,
  invoice.tax_collected_amount,
  invoice.total_amount,
  invoice.balance_due_amount,
  invoice.status
from public.invoices invoice;

comment on table public.organization_financial_settings is 'Canonical organization-scoped financial settings foundation for default tax behavior and future external tax provider integration.';
comment on column public.organization_financial_settings.default_tax_rate is 'Decimal tax rate such as 0.062500 for 6.25 percent. FloorConnector does not hardcode jurisdiction tables in v1.';
comment on table public.schedule_of_values is 'Canonical schedule of values header derived from an approved estimate and reused for future AIA/progress billing workflows.';
comment on table public.schedule_of_value_items is 'Canonical schedule of values line items linked back to approved estimate line items so future AIA billing stays connected to the estimating source of truth.';
comment on column public.schedule_of_value_items.source_estimate_line_item_id is 'Approved estimate line item that remains the canonical source for this schedule-of-values row.';
comment on column public.invoices.taxable_sales_amount is 'Reporting-friendly taxable sales amount snapshot for this invoice.';
comment on column public.invoices.exempt_sales_amount is 'Reporting-friendly exempt sales amount snapshot for this invoice.';
comment on column public.invoices.tax_collected_amount is 'Reporting-friendly tax collected snapshot for this invoice.';
comment on column public.invoices.retainage_held_amount is 'Amount retained from the current invoice based on the applied retainage percentage.';
comment on view public.invoice_tax_reporting_entries is 'Reporting-friendly invoice tax view grouped by invoice issue month for future tax reporting workflows.';
