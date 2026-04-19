do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'contract_signer_role'
  ) then
    create type public.contract_signer_role as enum (
      'customer',
      'contractor'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'contract_signer_status'
  ) then
    create type public.contract_signer_status as enum (
      'pending',
      'viewed',
      'signed',
      'declined',
      'voided'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'contract_signature_event_type'
  ) then
    create type public.contract_signature_event_type as enum (
      'signature_requested',
      'signer_viewed',
      'signer_signed',
      'signer_declined',
      'contractor_countersigned',
      'signature_completed',
      'signature_voided',
      'provider_sync'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'contract_signature_actor_type'
  ) then
    create type public.contract_signature_actor_type as enum (
      'portal_user',
      'organization_user',
      'provider',
      'system'
    );
  end if;
end
$$;

alter table public.contracts
  add column if not exists customer_viewed_at timestamptz,
  add column if not exists customer_signed_at timestamptz,
  add column if not exists contractor_countersigned_at timestamptz,
  add column if not exists signature_declined_at timestamptz,
  add column if not exists signature_voided_at timestamptz;

update public.contracts
set customer_viewed_at = coalesce(customer_viewed_at, viewed_at)
where viewed_at is not null;

update public.contracts
set customer_signed_at = coalesce(customer_signed_at, signed_at)
where signed_at is not null;

alter table public.contracts
  drop constraint if exists contracts_customer_signature_timestamp_order_check,
  add constraint contracts_customer_signature_timestamp_order_check
    check (
      (customer_viewed_at is null or sent_at is not null)
      and (customer_signed_at is null or customer_viewed_at is not null or sent_at is not null)
      and (contractor_countersigned_at is null or customer_signed_at is not null)
      and (signed_at is null or customer_signed_at is not null)
    );

create table if not exists public.contract_signers (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contract_id uuid not null,
  signer_role public.contract_signer_role not null,
  signer_status public.contract_signer_status not null default 'pending',
  customer_id uuid,
  portal_user_id uuid references public.users(id) on delete set null,
  organization_user_id uuid references public.users(id) on delete set null,
  display_name text not null,
  email text not null,
  signer_order integer not null default 1,
  viewed_at timestamptz,
  signed_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_signers_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete cascade,
  constraint contract_signers_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint contract_signers_display_name_not_blank_check
    check (char_length(btrim(display_name)) > 0),
  constraint contract_signers_email_not_blank_check
    check (char_length(btrim(email)) > 0),
  constraint contract_signers_order_positive_check
    check (signer_order > 0),
  constraint contract_signers_customer_role_requires_customer_check
    check (signer_role <> 'customer' or customer_id is not null),
  constraint contract_signers_status_timestamp_order_check
    check (
      (viewed_at is null or signer_status in ('viewed', 'signed', 'declined', 'voided'))
      and (signed_at is null or signer_status = 'signed')
      and (declined_at is null or signer_status = 'declined')
    )
);

create unique index if not exists contract_signers_company_id_id_unique_idx
  on public.contract_signers (company_id, id);

create unique index if not exists contract_signers_contract_role_order_unique_idx
  on public.contract_signers (company_id, contract_id, signer_role, signer_order);

create index if not exists contract_signers_contract_idx
  on public.contract_signers (company_id, contract_id, signer_order);

create index if not exists contract_signers_customer_idx
  on public.contract_signers (company_id, customer_id);

create table if not exists public.contract_signature_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contract_id uuid not null,
  contract_signer_id uuid,
  event_type public.contract_signature_event_type not null,
  actor_type public.contract_signature_actor_type not null,
  actor_user_id uuid references public.users(id) on delete set null,
  portal_user_id uuid references public.users(id) on delete set null,
  provider_event_id text,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint contract_signature_events_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete cascade,
  constraint contract_signature_events_signer_company_fkey
    foreign key (company_id, contract_signer_id)
    references public.contract_signers(company_id, id)
    on delete set null
);

create unique index if not exists contract_signature_events_company_id_id_unique_idx
  on public.contract_signature_events (company_id, id);

create index if not exists contract_signature_events_contract_idx
  on public.contract_signature_events (company_id, contract_id, occurred_at desc);

create index if not exists contract_signature_events_signer_idx
  on public.contract_signature_events (company_id, contract_signer_id, occurred_at desc);

create index if not exists contract_signature_events_provider_idx
  on public.contract_signature_events (company_id, provider_event_id)
  where provider_event_id is not null;

create or replace function public.prevent_contract_signature_event_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Contract signature events are immutable.';
end;
$$;

drop trigger if exists set_contract_signers_updated_at on public.contract_signers;
create trigger set_contract_signers_updated_at
before update on public.contract_signers
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_contract_signature_event_updates on public.contract_signature_events;
create trigger prevent_contract_signature_event_updates
before update on public.contract_signature_events
for each row
execute function public.prevent_contract_signature_event_mutation();

drop trigger if exists prevent_contract_signature_event_deletes on public.contract_signature_events;
create trigger prevent_contract_signature_event_deletes
before delete on public.contract_signature_events
for each row
execute function public.prevent_contract_signature_event_mutation();

alter table public.contract_signers enable row level security;
alter table public.contract_signers force row level security;

drop policy if exists contract_signers_select_by_membership on public.contract_signers;
create policy contract_signers_select_by_membership
on public.contract_signers
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contract_signers_insert_by_membership on public.contract_signers;
create policy contract_signers_insert_by_membership
on public.contract_signers
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists contract_signers_update_by_membership on public.contract_signers;
create policy contract_signers_update_by_membership
on public.contract_signers
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

alter table public.contract_signature_events enable row level security;
alter table public.contract_signature_events force row level security;

drop policy if exists contract_signature_events_select_by_membership on public.contract_signature_events;
create policy contract_signature_events_select_by_membership
on public.contract_signature_events
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contract_signature_events_insert_by_membership on public.contract_signature_events;
create policy contract_signature_events_insert_by_membership
on public.contract_signature_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

comment on table public.contract_signers is 'Supporting signer workflow records for canonical contracts. Signer routing lives here, while the contracts table remains the business truth for commercial workflow and readiness.';
comment on table public.contract_signature_events is 'Immutable audit trail for contract signature lifecycle events attached to the canonical contract record.';
comment on column public.contracts.customer_viewed_at is 'Customer-facing contract review timestamp kept on the canonical contract so portal signature activity does not fork contract state.';
comment on column public.contracts.customer_signed_at is 'Timestamp when the customer signer completed their signature action on the canonical contract.';
comment on column public.contracts.contractor_countersigned_at is 'Timestamp when the contractor-side countersign step completed on the same canonical contract, when required.';
comment on column public.contracts.signature_declined_at is 'Timestamp when the current signature flow was explicitly declined.';
comment on column public.contracts.signature_voided_at is 'Timestamp when the current signature flow was voided without creating a separate signed-document model.';
comment on column public.contract_signers.signer_role is 'Signer role for the canonical contract workflow, such as customer or contractor.';
comment on column public.contract_signers.signer_status is 'Workflow state for this signer only. The contracts table remains the overall commercial business-state source of truth.';
comment on column public.contract_signature_events.payload is 'Optional provider or application event payload snapshot kept for audit/debug support. This extends the canonical contract workflow instead of replacing it.';
