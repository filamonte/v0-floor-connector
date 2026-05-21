do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_status'
  ) then
    create type public.payment_status as enum (
      'recorded',
      'void'
    );
  end if;
end
$$;

create unique index if not exists invoices_company_id_id_unique_idx
  on public.invoices (company_id, id);

create table if not exists public.invoice_line_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  name text not null,
  description text,
  quantity numeric(12, 2) not null default 1,
  unit text not null default 'each',
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invoice_line_items_invoice_company_fkey
    foreign key (company_id, invoice_id)
    references public.invoices(company_id, id)
    on delete cascade,
  constraint invoice_line_items_quantity_positive_check
    check (quantity > 0),
  constraint invoice_line_items_unit_price_nonnegative_check
    check (unit_price >= 0),
  constraint invoice_line_items_line_total_nonnegative_check
    check (line_total >= 0)
);

create index if not exists invoice_line_items_invoice_id_idx
  on public.invoice_line_items (invoice_id);

create index if not exists invoice_line_items_company_id_idx
  on public.invoice_line_items (company_id);

create index if not exists invoice_line_items_invoice_sort_idx
  on public.invoice_line_items (invoice_id, sort_order);

create table if not exists public.payments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  amount numeric(12, 2) not null,
  payment_date date not null,
  payment_method text not null default 'other',
  reference text,
  notes text,
  status public.payment_status not null default 'recorded',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_invoice_company_fkey
    foreign key (company_id, invoice_id)
    references public.invoices(company_id, id)
    on delete cascade,
  constraint payments_amount_positive_check
    check (amount > 0)
);

create index if not exists payments_invoice_id_idx
  on public.payments (invoice_id);

create index if not exists payments_company_id_idx
  on public.payments (company_id);

create index if not exists payments_invoice_date_idx
  on public.payments (invoice_id, payment_date desc);

create index if not exists payments_status_idx
  on public.payments (company_id, status);

create or replace function public.set_invoice_line_item_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.line_total := round(new.quantity * new.unit_price, 2);
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
  next_total numeric(12, 2);
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

  select coalesce(sum(payment.amount), 0)::numeric(12, 2)
  into recorded_payment_total
  from public.payments payment
  where payment.invoice_id = target_invoice_id
    and payment.status = 'recorded';

  next_total := round(
    greatest(
      0,
      next_subtotal
      + coalesce(target_invoice.tax_amount, 0)
      - coalesce(target_invoice.discount_amount, 0)
    ),
    2
  );

  if target_invoice.status = 'void' then
    next_balance_due := 0;
    next_status := 'void';
  else
    next_balance_due := round(greatest(0, next_total - recorded_payment_total), 2);

    if recorded_payment_total > 0 and next_balance_due = 0 and next_total > 0 then
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
    total_amount = next_total,
    balance_due_amount = next_balance_due,
    status = next_status,
    updated_at = timezone('utc', now())
  where id = target_invoice_id;
end;
$$;

create or replace function public.handle_invoice_line_item_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalculate_invoice_financials(
    coalesce(new.invoice_id, old.invoice_id)
  );

  return null;
end;
$$;

create or replace function public.handle_invoice_payment_recalculation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalculate_invoice_financials(
    coalesce(new.invoice_id, old.invoice_id)
  );

  return null;
end;
$$;

create or replace function public.handle_invoice_amount_recalculation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalculate_invoice_financials(new.id);
  return new;
end;
$$;

drop trigger if exists set_invoice_line_item_total on public.invoice_line_items;

create trigger set_invoice_line_item_total
before insert or update on public.invoice_line_items
for each row
execute function public.set_invoice_line_item_total();

drop trigger if exists set_invoice_line_items_updated_at on public.invoice_line_items;

create trigger set_invoice_line_items_updated_at
before update on public.invoice_line_items
for each row
execute function public.set_updated_at();

drop trigger if exists recalculate_invoice_totals_from_line_items on public.invoice_line_items;

create trigger recalculate_invoice_totals_from_line_items
after insert or update or delete on public.invoice_line_items
for each row
execute function public.handle_invoice_line_item_totals();

drop trigger if exists set_payments_updated_at on public.payments;

create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

drop trigger if exists recalculate_invoice_totals_from_payments on public.payments;

create trigger recalculate_invoice_totals_from_payments
after insert or update or delete on public.payments
for each row
execute function public.handle_invoice_payment_recalculation();

drop trigger if exists recalculate_invoice_totals_from_invoice on public.invoices;

create trigger recalculate_invoice_totals_from_invoice
after insert or update of tax_amount, discount_amount, status on public.invoices
for each row
when (pg_trigger_depth() = 0)
execute function public.handle_invoice_amount_recalculation();

alter table public.invoice_line_items enable row level security;
alter table public.invoice_line_items force row level security;

drop policy if exists invoice_line_items_select_by_membership on public.invoice_line_items;
create policy invoice_line_items_select_by_membership
on public.invoice_line_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists invoice_line_items_insert_by_membership on public.invoice_line_items;
create policy invoice_line_items_insert_by_membership
on public.invoice_line_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists invoice_line_items_update_by_membership on public.invoice_line_items;
create policy invoice_line_items_update_by_membership
on public.invoice_line_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists invoice_line_items_delete_by_membership on public.invoice_line_items;
create policy invoice_line_items_delete_by_membership
on public.invoice_line_items
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

alter table public.payments enable row level security;
alter table public.payments force row level security;

drop policy if exists payments_select_by_membership on public.payments;
create policy payments_select_by_membership
on public.payments
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists payments_insert_by_membership on public.payments;
create policy payments_insert_by_membership
on public.payments
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists payments_update_by_membership on public.payments;
create policy payments_update_by_membership
on public.payments
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists payments_delete_by_membership on public.payments;
create policy payments_delete_by_membership
on public.payments
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on table public.invoice_line_items is 'Organization-scoped invoice line items used to calculate canonical invoice subtotals and totals.';
comment on column public.invoice_line_items.line_total is 'Derived from quantity multiplied by unit price for auditability.';
comment on table public.payments is 'Canonical organization-scoped payment records linked to invoices. Future online payments should extend this table rather than fork invoice receipts into a separate model.';
comment on column public.invoices.balance_due_amount is 'Automatically recalculated from canonical invoice totals minus recorded invoice-linked payments.';
