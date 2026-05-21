do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'invoice_status'
  ) then
    create type public.invoice_status as enum (
      'draft',
      'sent',
      'partially_paid',
      'paid',
      'void'
    );
  end if;
end
$$;

create unique index if not exists jobs_company_id_id_unique_idx
  on public.jobs (company_id, id);

create or replace function public.generate_invoice_reference_number(
  target_company_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_number integer;
  candidate text;
begin
  perform pg_advisory_xact_lock(hashtextextended(target_company_id::text, 0));

  select count(*)::integer + 1
  into next_number
  from public.invoices
  where company_id = target_company_id;

  loop
    candidate := 'INV-' || lpad(next_number::text, 4, '0');

    exit when not exists (
      select 1
      from public.invoices
      where company_id = target_company_id
        and lower(reference_number) = lower(candidate)
    );

    next_number := next_number + 1;
  end loop;

  return candidate;
end;
$$;

create table if not exists public.invoices (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  estimate_id uuid,
  job_id uuid,
  reference_number text not null,
  billing_model text not null default 'standard',
  status public.invoice_status not null default 'draft',
  issue_date date not null,
  due_date date,
  subtotal_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  balance_due_amount numeric(12, 2) not null default 0,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invoices_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint invoices_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint invoices_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete set null,
  constraint invoices_job_company_fkey
    foreign key (company_id, job_id)
    references public.jobs(company_id, id)
    on delete set null,
  constraint invoices_amounts_nonnegative_check
    check (
      subtotal_amount >= 0
      and tax_amount >= 0
      and discount_amount >= 0
      and total_amount >= 0
      and balance_due_amount >= 0
    ),
  constraint invoices_balance_due_not_greater_than_total_check
    check (balance_due_amount <= total_amount),
  constraint invoices_due_date_after_issue_date_check
    check (due_date is null or due_date >= issue_date)
);

create unique index if not exists invoices_company_reference_unique_idx
  on public.invoices (company_id, lower(reference_number));

create index if not exists invoices_company_id_idx
  on public.invoices (company_id);

create index if not exists invoices_customer_id_idx
  on public.invoices (customer_id);

create index if not exists invoices_project_id_idx
  on public.invoices (project_id);

create index if not exists invoices_estimate_id_idx
  on public.invoices (estimate_id);

create index if not exists invoices_job_id_idx
  on public.invoices (job_id);

create index if not exists invoices_status_idx
  on public.invoices (company_id, status);

create index if not exists invoices_issue_date_idx
  on public.invoices (company_id, issue_date);

create index if not exists invoices_due_date_idx
  on public.invoices (company_id, due_date);

create or replace function public.assign_invoice_reference_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reference_number is null or btrim(new.reference_number) = '' then
    new.reference_number := public.generate_invoice_reference_number(new.company_id);
  end if;

  return new;
end;
$$;

drop trigger if exists assign_invoice_reference_number on public.invoices;

create trigger assign_invoice_reference_number
before insert on public.invoices
for each row
execute function public.assign_invoice_reference_number();

drop trigger if exists set_invoices_updated_at on public.invoices;

create trigger set_invoices_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoices force row level security;

drop policy if exists invoices_select_by_membership on public.invoices;
create policy invoices_select_by_membership
on public.invoices
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists invoices_insert_by_membership on public.invoices;
create policy invoices_insert_by_membership
on public.invoices
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists invoices_update_by_membership on public.invoices;
create policy invoices_update_by_membership
on public.invoices
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.invoices is 'Canonical organization-scoped invoice header record linked to project, customer, and optional estimate/job records.';
comment on column public.invoices.billing_model is 'Defaults to standard billing in v1. Future AIA/progress billing should extend this canonical invoice header rather than replace it or create disconnected finance records.';
comment on column public.invoices.estimate_id is 'Optional approved estimate that financially originated the invoice.';
comment on column public.invoices.job_id is 'Optional job/work order that the invoice is billing against.';
