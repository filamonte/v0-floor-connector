do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'contract_payment_schedule_type'
  ) then
    create type public.contract_payment_schedule_type as enum (
      'no_upfront_payment_required',
      'net_terms',
      'due_on_completion',
      'deposit_before_scheduling',
      'fifty_fifty',
      'thirds',
      'milestone_placeholder',
      'progress_billing_placeholder'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'contract_payment_requirement_due_basis'
  ) then
    create type public.contract_payment_requirement_due_basis as enum (
      'contract_signing',
      'before_scheduling',
      'mobilization',
      'completion',
      'net_terms',
      'milestone',
      'progress_billing_placeholder'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'contract_payment_requirement_amount_mode'
  ) then
    create type public.contract_payment_requirement_amount_mode as enum (
      'fixed_amount',
      'percentage',
      'remaining_balance',
      'none'
    );
  end if;
end
$$;

create table if not exists public.contract_payment_requirements (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contract_id uuid not null,
  customer_id uuid not null,
  project_id uuid not null,
  estimate_id uuid,
  schedule_type public.contract_payment_schedule_type not null,
  due_basis public.contract_payment_requirement_due_basis not null,
  amount_mode public.contract_payment_requirement_amount_mode not null default 'none',
  amount numeric(12, 2),
  percentage numeric(5, 2),
  schedule_blocking boolean not null default false,
  linked_invoice_id uuid,
  label text,
  notes text,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_payment_requirements_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete cascade,
  constraint contract_payment_requirements_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint contract_payment_requirements_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint contract_payment_requirements_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete set null,
  constraint contract_payment_requirements_invoice_company_fkey
    foreign key (company_id, linked_invoice_id)
    references public.invoices(company_id, id)
    on delete set null,
  constraint contract_payment_requirements_amount_shape_check
    check (
      (amount_mode = 'fixed_amount' and amount is not null and amount > 0 and percentage is null)
      or (amount_mode = 'percentage' and percentage is not null and percentage > 0 and percentage <= 100 and amount is null)
      or (amount_mode in ('remaining_balance', 'none') and amount is null and percentage is null)
    )
);

create unique index if not exists contract_payment_requirements_company_id_id_unique_idx
  on public.contract_payment_requirements (company_id, id);

create index if not exists contract_payment_requirements_contract_idx
  on public.contract_payment_requirements (company_id, contract_id, sort_order);

create index if not exists contract_payment_requirements_project_blocking_idx
  on public.contract_payment_requirements (company_id, project_id, schedule_blocking, sort_order);

create index if not exists contract_payment_requirements_invoice_idx
  on public.contract_payment_requirements (company_id, linked_invoice_id)
  where linked_invoice_id is not null;

create or replace function public.validate_contract_payment_requirement_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  contract_row public.contracts%rowtype;
  invoice_row public.invoices%rowtype;
begin
  select *
  into contract_row
  from public.contracts
  where company_id = new.company_id
    and id = new.contract_id;

  if not found then
    raise exception 'Contract payment requirement contract % was not found for this organization.', new.contract_id;
  end if;

  if contract_row.customer_id <> new.customer_id then
    raise exception 'Contract payment requirement customer must match the contract customer.';
  end if;

  if contract_row.project_id <> new.project_id then
    raise exception 'Contract payment requirement project must match the contract project.';
  end if;

  if coalesce(contract_row.estimate_id, '00000000-0000-0000-0000-000000000000'::uuid) <>
     coalesce(new.estimate_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'Contract payment requirement estimate must match the contract estimate.';
  end if;

  if new.linked_invoice_id is not null then
    select *
    into invoice_row
    from public.invoices
    where company_id = new.company_id
      and id = new.linked_invoice_id;

    if not found then
      raise exception 'Linked invoice % was not found for this organization.', new.linked_invoice_id;
    end if;

    if invoice_row.customer_id <> new.customer_id or invoice_row.project_id <> new.project_id then
      raise exception 'Linked invoice must stay on the same customer and project as the contract payment requirement.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_contract_payment_requirement_scope on public.contract_payment_requirements;
create trigger validate_contract_payment_requirement_scope
before insert or update of company_id, contract_id, customer_id, project_id, estimate_id, linked_invoice_id
on public.contract_payment_requirements
for each row
execute function public.validate_contract_payment_requirement_scope();

drop trigger if exists set_contract_payment_requirements_updated_at on public.contract_payment_requirements;
create trigger set_contract_payment_requirements_updated_at
before update on public.contract_payment_requirements
for each row
execute function public.set_updated_at();

alter table public.contract_payment_requirements enable row level security;
alter table public.contract_payment_requirements force row level security;

drop policy if exists contract_payment_requirements_select_by_membership on public.contract_payment_requirements;
create policy contract_payment_requirements_select_by_membership
on public.contract_payment_requirements
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contract_payment_requirements_insert_by_membership on public.contract_payment_requirements;
create policy contract_payment_requirements_insert_by_membership
on public.contract_payment_requirements
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists contract_payment_requirements_update_by_membership on public.contract_payment_requirements;
create policy contract_payment_requirements_update_by_membership
on public.contract_payment_requirements
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists contract_payment_requirements_delete_by_membership on public.contract_payment_requirements;
create policy contract_payment_requirements_delete_by_membership
on public.contract_payment_requirements
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on table public.contract_payment_requirements is 'Canonical contract-owned payment requirements used by Financial Readiness. These rows describe terms and required evidence while invoices, payments, and payment_events remain billing and payment truth.';
comment on column public.contract_payment_requirements.schedule_type is 'Supported payment term shape such as no upfront payment, net terms, due on completion, deposit before scheduling, 50/50, thirds, milestone placeholder, or future progress billing placeholder.';
comment on column public.contract_payment_requirements.schedule_blocking is 'Whether this requirement must be satisfied before the next operational scheduling move.';
comment on column public.contract_payment_requirements.linked_invoice_id is 'Optional canonical invoice evidence for this requirement. Payment satisfaction is derived from canonical invoices and payments, not from this row.';
