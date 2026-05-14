alter table public.company_subscriptions
  add column if not exists stripe_price_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_last_event_id text,
  add column if not exists stripe_last_webhook_received_at timestamptz;

create index if not exists company_subscriptions_stripe_price_idx
  on public.company_subscriptions (stripe_price_id)
  where stripe_price_id is not null;

create index if not exists company_subscriptions_stripe_last_event_idx
  on public.company_subscriptions (stripe_last_event_id)
  where stripe_last_event_id is not null;

comment on column public.company_subscriptions.stripe_price_id is
  'FloorConnector SaaS billing Stripe Price reference observed from signed subscription webhooks. Stores id only, not provider payload.';

comment on column public.company_subscriptions.stripe_checkout_session_id is
  'FloorConnector SaaS billing Stripe Checkout Session reference observed from signed subscription checkout webhook.';

comment on column public.company_subscriptions.stripe_last_event_id is
  'Last signed Stripe SaaS billing webhook event id processed for this current subscription row.';

comment on column public.company_subscriptions.stripe_last_webhook_received_at is
  'Timestamp of the last signed Stripe SaaS billing webhook event reconciled for this subscription row.';

create table if not exists public.stripe_saas_billing_webhook_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  stripe_event_id text not null,
  event_type text not null,
  processing_result text not null default 'processed',
  received_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint stripe_saas_billing_webhook_events_result_check
    check (processing_result in ('processed', 'ignored', 'duplicate'))
);

create unique index if not exists stripe_saas_billing_webhook_events_event_unique_idx
  on public.stripe_saas_billing_webhook_events (stripe_event_id);

create index if not exists stripe_saas_billing_webhook_events_company_idx
  on public.stripe_saas_billing_webhook_events (company_id, received_at desc);

alter table public.stripe_saas_billing_webhook_events enable row level security;
alter table public.stripe_saas_billing_webhook_events force row level security;

revoke all on public.stripe_saas_billing_webhook_events from anon, authenticated;

comment on table public.stripe_saas_billing_webhook_events is
  'Safe idempotency ledger for signed FloorConnector SaaS billing Stripe webhook event ids. Stores no raw provider payloads, signatures, secrets, card data, or customer payment details.';
