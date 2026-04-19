alter table public.payment_events
  add column if not exists gateway_provider text;

create index if not exists payment_events_company_gateway_provider_idx
  on public.payment_events (company_id, gateway_provider, occurred_at desc)
  where gateway_provider is not null;

create unique index if not exists payments_company_gateway_intent_reference_unique_idx
  on public.payments (company_id, gateway_provider, gateway_payment_intent_reference)
  where gateway_provider is not null
    and gateway_payment_intent_reference is not null;

create unique index if not exists payments_company_gateway_checkout_session_unique_idx
  on public.payments (company_id, gateway_provider, gateway_checkout_session_reference)
  where gateway_provider is not null
    and gateway_checkout_session_reference is not null;

create unique index if not exists payment_events_company_gateway_provider_event_unique_idx
  on public.payment_events (company_id, gateway_provider, provider_event_id)
  where gateway_provider is not null
    and provider_event_id is not null;

comment on column public.payment_events.gateway_provider is 'Optional payment gateway/provider captured alongside immutable payment events for webhook reconciliation and idempotency.';
