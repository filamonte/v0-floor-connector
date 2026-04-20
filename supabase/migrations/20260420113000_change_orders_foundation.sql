do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'change_order_status'
  ) then
    create type public.change_order_status as enum (
      'draft',
      'sent',
      'approved',
      'rejected'
    );
  end if;
end
$$;

do $$
begin
  begin
    alter type public.portal_record_view_subject_type add value if not exists 'change_order';
  exception
    when duplicate_object then
      null;
  end;
end
$$;

create table if not exists public.change_orders (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  contract_id uuid,
  invoice_id uuid,
  applied_invoice_line_item_id uuid,
  status public.change_order_status not null default 'draft',
  title text not null,
  description text,
  scope_change_notes text,
  price_adjustment numeric(12, 2) not null default 0,
  decision_note text,
  sent_at timestamptz,
  customer_viewed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint change_orders_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint change_orders_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint change_orders_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete set null,
  constraint change_orders_invoice_company_fkey
    foreign key (company_id, invoice_id)
    references public.invoices(company_id, id)
    on delete set null,
  constraint change_orders_title_not_blank_check
    check (char_length(btrim(title)) > 0),
  constraint change_orders_sent_timestamp_check
    check (status <> 'sent' or sent_at is not null),
  constraint change_orders_approved_timestamp_check
    check (status <> 'approved' or approved_at is not null),
  constraint change_orders_rejected_timestamp_check
    check (status <> 'rejected' or rejected_at is not null)
);

create unique index if not exists change_orders_company_id_id_unique_idx
  on public.change_orders (company_id, id);

create index if not exists change_orders_company_status_idx
  on public.change_orders (company_id, status, updated_at desc);

create index if not exists change_orders_project_idx
  on public.change_orders (company_id, project_id, updated_at desc);

create index if not exists change_orders_customer_idx
  on public.change_orders (company_id, customer_id, updated_at desc);

create index if not exists change_orders_contract_idx
  on public.change_orders (company_id, contract_id, updated_at desc);

create index if not exists change_orders_invoice_idx
  on public.change_orders (company_id, invoice_id, updated_at desc);

create or replace function public.handle_change_order_status_timestamps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'sent' and new.sent_at is null then
    new.sent_at := timezone('utc', now());
  end if;

  if new.status = 'approved' then
    if new.sent_at is null then
      new.sent_at := timezone('utc', now());
    end if;

    if new.approved_at is null then
      new.approved_at := timezone('utc', now());
    end if;
  end if;

  if new.status = 'rejected' then
    if new.sent_at is null then
      new.sent_at := timezone('utc', now());
    end if;

    if new.rejected_at is null then
      new.rejected_at := timezone('utc', now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists set_change_orders_updated_at on public.change_orders;
create trigger set_change_orders_updated_at
before update on public.change_orders
for each row
execute function public.set_updated_at();

drop trigger if exists handle_change_order_status_timestamps on public.change_orders;
create trigger handle_change_order_status_timestamps
before insert or update of status on public.change_orders
for each row
execute function public.handle_change_order_status_timestamps();

alter table public.change_orders enable row level security;
alter table public.change_orders force row level security;

drop policy if exists change_orders_select_by_membership on public.change_orders;
create policy change_orders_select_by_membership
on public.change_orders
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists change_orders_insert_by_membership on public.change_orders;
create policy change_orders_insert_by_membership
on public.change_orders
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists change_orders_update_by_membership on public.change_orders;
create policy change_orders_update_by_membership
on public.change_orders
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.change_orders is 'Canonical organization-scoped change order records linked to the same project, contract, and invoice chain as estimates, contracts, and billing.';
comment on column public.change_orders.scope_change_notes is 'Structured narrative of the scope adjustment so approved change orders can represent project scope continuity without mutating the base project record.';
comment on column public.change_orders.price_adjustment is 'Signed currency delta applied by the change order. Positive values increase downstream billing while negative values reduce it.';
comment on column public.change_orders.applied_invoice_line_item_id is 'Invoice line item created from an approved change order when billing impact is intentionally pushed into the canonical invoice chain.';
