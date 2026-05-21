do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_source'
  ) then
    create type public.payment_source as enum (
      'manual',
      'customer_portal'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_recorded_via'
  ) then
    create type public.payment_recorded_via as enum (
      'contractor_app',
      'customer_portal',
      'system'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_event_type'
  ) then
    create type public.payment_event_type as enum (
      'payment_requested',
      'checkout_started',
      'payment_succeeded',
      'payment_failed',
      'payment_voided',
      'provider_sync'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_event_actor_type'
  ) then
    create type public.payment_event_actor_type as enum (
      'portal_user',
      'organization_user',
      'provider',
      'system'
    );
  end if;
end
$$;

alter table public.payments
  add column if not exists payment_source public.payment_source not null default 'manual',
  add column if not exists recorded_via public.payment_recorded_via not null default 'contractor_app',
  add column if not exists gateway_provider text,
  add column if not exists gateway_payment_intent_reference text,
  add column if not exists gateway_checkout_session_reference text,
  add column if not exists gateway_status text,
  add column if not exists payment_method_summary text,
  add column if not exists payer_user_id uuid references public.users(id) on delete set null,
  add column if not exists payer_email text;

create index if not exists payments_source_idx
  on public.payments (company_id, payment_source);

create index if not exists payments_recorded_via_idx
  on public.payments (company_id, recorded_via);

create index if not exists payments_gateway_provider_idx
  on public.payments (company_id, gateway_provider);

create index if not exists payments_gateway_payment_intent_idx
  on public.payments (company_id, gateway_payment_intent_reference)
  where gateway_payment_intent_reference is not null;

create index if not exists payments_gateway_checkout_session_idx
  on public.payments (company_id, gateway_checkout_session_reference)
  where gateway_checkout_session_reference is not null;

create unique index if not exists payments_company_id_id_unique_idx
  on public.payments (company_id, id);

create table if not exists public.payment_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  payment_id uuid,
  event_type public.payment_event_type not null,
  actor_type public.payment_event_actor_type not null,
  actor_user_id uuid references public.users(id) on delete set null,
  portal_user_id uuid references public.users(id) on delete set null,
  provider_event_id text,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint payment_events_invoice_company_fkey
    foreign key (company_id, invoice_id)
    references public.invoices(company_id, id)
    on delete cascade,
  constraint payment_events_payment_company_fkey
    foreign key (company_id, payment_id)
    references public.payments(company_id, id)
    on delete cascade
);

create index if not exists payment_events_company_invoice_idx
  on public.payment_events (company_id, invoice_id, occurred_at desc);

create index if not exists payment_events_company_payment_idx
  on public.payment_events (company_id, payment_id, occurred_at desc);

create index if not exists payment_events_company_type_idx
  on public.payment_events (company_id, event_type, occurred_at desc);

create index if not exists payment_events_provider_event_idx
  on public.payment_events (company_id, provider_event_id)
  where provider_event_id is not null;

alter table public.payment_events enable row level security;
alter table public.payment_events force row level security;

drop policy if exists payment_events_select_by_membership on public.payment_events;
create policy payment_events_select_by_membership
on public.payment_events
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists payment_events_insert_by_membership on public.payment_events;
create policy payment_events_insert_by_membership
on public.payment_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists payment_events_update_by_membership on public.payment_events;
create policy payment_events_update_by_membership
on public.payment_events
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists payment_events_delete_by_membership on public.payment_events;
create policy payment_events_delete_by_membership
on public.payment_events
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

comment on column public.payments.payment_source is 'Whether the canonical payment originated from manual contractor-side entry or a customer-facing portal action.';
comment on column public.payments.recorded_via is 'Which application surface or system path recorded the canonical payment row.';
comment on column public.payments.gateway_provider is 'Optional payment gateway/provider name for online customer-facing payments.';
comment on column public.payments.gateway_payment_intent_reference is 'Provider payment or intent reference stored on the canonical payment record.';
comment on column public.payments.gateway_checkout_session_reference is 'Provider checkout/session reference for customer-facing payment flows.';
comment on column public.payments.gateway_status is 'Latest known provider-facing status for the canonical payment.';
comment on column public.payments.payment_method_summary is 'Customer-safe summary of the gateway-confirmed payment method.';
comment on column public.payments.payer_user_id is 'Authenticated canonical user who completed or initiated the payment when known.';
comment on column public.payments.payer_email is 'Customer payer email captured for online payment continuity and auditability.';
comment on table public.payment_events is 'Immutable payment workflow and provider audit events attached to the canonical invoice/payment chain.';
comment on column public.payment_events.payment_id is 'Optional canonical payment row associated with this immutable payment event.';
