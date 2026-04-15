do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'contract_status'
  ) then
    create type public.contract_status as enum (
      'draft',
      'sent',
      'viewed',
      'signed',
      'void'
    );
  end if;
end
$$;

create table if not exists public.contracts (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  estimate_id uuid,
  template_id uuid,
  status public.contract_status not null default 'draft',
  title text not null,
  rendered_subject text,
  rendered_content text not null,
  generated_from_estimate_reference text,
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contracts_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint contracts_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint contracts_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete set null,
  constraint contracts_template_company_fkey
    foreign key (company_id, template_id)
    references public.document_templates(company_id, id)
    on delete set null,
  constraint contracts_rendered_content_not_blank_check
    check (char_length(btrim(rendered_content)) > 0),
  constraint contracts_signed_requires_timestamp_check
    check (status <> 'signed' or signed_at is not null),
  constraint contracts_sent_timestamp_order_check
    check (
      (viewed_at is null or sent_at is not null) and
      (signed_at is null or viewed_at is not null or sent_at is not null)
    )
);

create unique index if not exists contracts_company_id_id_unique_idx
  on public.contracts (company_id, id);

create index if not exists contracts_company_status_idx
  on public.contracts (company_id, status);

create index if not exists contracts_project_idx
  on public.contracts (company_id, project_id);

create index if not exists contracts_customer_idx
  on public.contracts (company_id, customer_id);

create index if not exists contracts_estimate_idx
  on public.contracts (company_id, estimate_id);

create index if not exists contracts_template_idx
  on public.contracts (company_id, template_id);

create or replace function public.handle_contract_status_timestamps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'sent' and new.sent_at is null then
    new.sent_at := timezone('utc', now());
  end if;

  if new.status = 'viewed' then
    if new.sent_at is null then
      new.sent_at := timezone('utc', now());
    end if;

    if new.viewed_at is null then
      new.viewed_at := timezone('utc', now());
    end if;
  end if;

  if new.status = 'signed' then
    if new.sent_at is null then
      new.sent_at := timezone('utc', now());
    end if;

    if new.viewed_at is null then
      new.viewed_at := timezone('utc', now());
    end if;

    if new.signed_at is null then
      new.signed_at := timezone('utc', now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists set_contracts_updated_at on public.contracts;
create trigger set_contracts_updated_at
before update on public.contracts
for each row
execute function public.set_updated_at();

drop trigger if exists handle_contract_status_timestamps on public.contracts;
create trigger handle_contract_status_timestamps
before insert or update of status on public.contracts
for each row
execute function public.handle_contract_status_timestamps();

alter table public.contracts enable row level security;
alter table public.contracts force row level security;

drop policy if exists contracts_select_by_membership on public.contracts;
create policy contracts_select_by_membership
on public.contracts
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contracts_insert_by_membership on public.contracts;
create policy contracts_insert_by_membership
on public.contracts
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists contracts_update_by_membership on public.contracts;
create policy contracts_update_by_membership
on public.contracts
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.contracts is 'Canonical organization-scoped contract records generated from shared template output and linked back to project, customer, and approved estimate context.';
comment on column public.contracts.rendered_content is 'Rendered contract body produced from the shared template system and canonical merge data. Future signature workflows should operate on this canonical record rather than a detached document silo.';
comment on column public.contracts.generated_from_estimate_reference is 'Snapshot of the estimate reference used during generation for auditability. The contract still links canonically to the estimate record when present.';
comment on column public.contracts.template_id is 'Shared document template reference used to generate the contract output. Contracts intentionally reuse the document_templates foundation shared with estimates and invoices.';
