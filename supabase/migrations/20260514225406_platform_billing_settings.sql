create table if not exists public.platform_billing_settings (
  config_key text primary key default 'default',
  plan_label text not null default 'Founder plan',
  stripe_product_id text,
  stripe_price_id text,
  currency text not null default 'usd',
  unit_amount_cents integer not null default 49900,
  recurring_interval text not null default 'month',
  stripe_mode text not null default 'test',
  stripe_product_synced_at timestamptz,
  stripe_price_synced_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_billing_settings_singleton_check check (config_key = 'default'),
  constraint platform_billing_settings_price_id_format_check
    check (stripe_price_id is null or stripe_price_id ~ '^price_[A-Za-z0-9]+$'),
  constraint platform_billing_settings_product_id_format_check
    check (stripe_product_id is null or stripe_product_id ~ '^prod_[A-Za-z0-9]+$'),
  constraint platform_billing_settings_currency_format_check
    check (currency ~ '^[a-z]{3}$'),
  constraint platform_billing_settings_unit_amount_cents_positive_check
    check (unit_amount_cents > 0),
  constraint platform_billing_settings_recurring_interval_check
    check (recurring_interval in ('day', 'week', 'month', 'year')),
  constraint platform_billing_settings_stripe_mode_check
    check (stripe_mode in ('test', 'live', 'unknown'))
);

drop trigger if exists set_platform_billing_settings_updated_at on public.platform_billing_settings;
create trigger set_platform_billing_settings_updated_at
before update on public.platform_billing_settings
for each row
execute function public.set_updated_at();

insert into public.platform_billing_settings (
  config_key,
  plan_label,
  currency,
  unit_amount_cents,
  recurring_interval,
  stripe_mode
)
values (
  'default',
  'Founder plan',
  'usd',
  49900,
  'month',
  'test'
)
on conflict (config_key) do nothing;

alter table public.platform_billing_settings enable row level security;
alter table public.platform_billing_settings force row level security;

revoke all on table public.platform_billing_settings from public;
revoke all on table public.platform_billing_settings from anon;
revoke all on table public.platform_billing_settings from authenticated;

comment on table public.platform_billing_settings is 'Platform-admin-controlled non-secret SaaS billing settings such as Stripe product and price references. Secrets remain in environment/provider configuration.';
comment on column public.platform_billing_settings.stripe_product_id is 'Non-secret Stripe Product reference for FloorConnector SaaS billing setup; never store Stripe keys or webhook secrets here.';
comment on column public.platform_billing_settings.stripe_price_id is 'Non-secret Stripe recurring Price reference preferred by SaaS Checkout before env fallback.';
