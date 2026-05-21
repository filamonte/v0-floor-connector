create unique index if not exists estimates_company_id_id_unique_idx
  on public.estimates (company_id, id);

create table if not exists public.estimate_line_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  estimate_id uuid not null,
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
  constraint estimate_line_items_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete cascade,
  constraint estimate_line_items_quantity_positive_check
    check (quantity > 0),
  constraint estimate_line_items_unit_price_nonnegative_check
    check (unit_price >= 0),
  constraint estimate_line_items_line_total_nonnegative_check
    check (line_total >= 0)
);

create index if not exists estimate_line_items_estimate_id_idx
  on public.estimate_line_items (estimate_id);

create index if not exists estimate_line_items_company_id_idx
  on public.estimate_line_items (company_id);

create index if not exists estimate_line_items_estimate_sort_idx
  on public.estimate_line_items (estimate_id, sort_order);

create or replace function public.set_estimate_line_item_total()
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

create or replace function public.recalculate_estimate_totals(
  target_estimate_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_estimate public.estimates%rowtype;
  next_subtotal numeric(12, 2);
  next_total numeric(12, 2);
begin
  select *
  into target_estimate
  from public.estimates
  where id = target_estimate_id;

  if not found then
    return;
  end if;

  select coalesce(sum(line_item.line_total), 0)::numeric(12, 2)
  into next_subtotal
  from public.estimate_line_items line_item
  where line_item.estimate_id = target_estimate_id;

  next_total := round(
    greatest(
      0,
      next_subtotal
      + coalesce(target_estimate.tax_amount, 0)
      - coalesce(target_estimate.discount_amount, 0)
    ),
    2
  );

  update public.estimates
  set
    subtotal_amount = next_subtotal,
    total_amount = next_total,
    updated_at = timezone('utc', now())
  where id = target_estimate_id;
end;
$$;

create or replace function public.handle_estimate_line_item_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalculate_estimate_totals(
    coalesce(new.estimate_id, old.estimate_id)
  );

  return null;
end;
$$;

create or replace function public.handle_estimate_amount_recalculation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalculate_estimate_totals(new.id);
  return new;
end;
$$;

drop trigger if exists set_estimate_line_item_total on public.estimate_line_items;

create trigger set_estimate_line_item_total
before insert or update on public.estimate_line_items
for each row
execute function public.set_estimate_line_item_total();

drop trigger if exists set_estimate_line_items_updated_at on public.estimate_line_items;

create trigger set_estimate_line_items_updated_at
before update on public.estimate_line_items
for each row
execute function public.set_updated_at();

drop trigger if exists recalculate_estimate_totals_from_line_items on public.estimate_line_items;

create trigger recalculate_estimate_totals_from_line_items
after insert or update or delete on public.estimate_line_items
for each row
execute function public.handle_estimate_line_item_totals();

drop trigger if exists recalculate_estimate_totals_from_estimate on public.estimates;

create trigger recalculate_estimate_totals_from_estimate
after insert or update of tax_amount, discount_amount on public.estimates
for each row
execute function public.handle_estimate_amount_recalculation();

alter table public.estimate_line_items enable row level security;
alter table public.estimate_line_items force row level security;

drop policy if exists estimate_line_items_select_by_membership on public.estimate_line_items;
create policy estimate_line_items_select_by_membership
on public.estimate_line_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_line_items_insert_by_membership on public.estimate_line_items;
create policy estimate_line_items_insert_by_membership
on public.estimate_line_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_line_items_update_by_membership on public.estimate_line_items;
create policy estimate_line_items_update_by_membership
on public.estimate_line_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_line_items_delete_by_membership on public.estimate_line_items;
create policy estimate_line_items_delete_by_membership
on public.estimate_line_items
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on table public.estimate_line_items is 'Organization-scoped estimate line items used to calculate estimate subtotals and totals.';
comment on column public.estimate_line_items.line_total is 'Derived from quantity multiplied by unit price for auditability.';
