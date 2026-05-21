alter table public.companies
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_method_id text;

create unique index if not exists companies_stripe_customer_unique_idx
  on public.companies (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists companies_stripe_payment_method_unique_idx
  on public.companies (stripe_payment_method_id)
  where stripe_payment_method_id is not null;

comment on column public.companies.stripe_customer_id is
  'Stripe customer reference for organization-level billing setup. Stripe remains the source of truth.';

comment on column public.companies.stripe_payment_method_id is
  'Default Stripe payment method reference saved through SetupIntent for future billing activation. Raw card data is never stored.';
