insert into public.subscription_plans (
  key,
  name,
  description,
  billing_interval,
  amount_cents,
  currency_code,
  trial_days_with_card,
  trial_days_without_card,
  grace_period_days,
  is_active
)
select
  'founder-default',
  coalesce(nullif(trim(settings.plan_label), ''), 'Founder plan'),
  'Default FloorConnector SaaS plan catalog row used by signed SaaS billing webhook reconciliation. This is a plan catalog entry only; company subscriptions are created or updated by signed Stripe webhooks.',
  case settings.recurring_interval
    when 'year' then 'yearly'::public.billing_interval
    else 'monthly'::public.billing_interval
  end,
  settings.unit_amount_cents,
  upper(settings.currency),
  14,
  3,
  7,
  true
from public.platform_billing_settings as settings
where settings.config_key = 'default'
on conflict ((lower(key))) do update
set
  name = excluded.name,
  description = excluded.description,
  billing_interval = excluded.billing_interval,
  amount_cents = excluded.amount_cents,
  currency_code = excluded.currency_code,
  is_active = true,
  updated_at = timezone('utc', now());

insert into public.subscription_plans (
  key,
  name,
  description,
  billing_interval,
  amount_cents,
  currency_code,
  trial_days_with_card,
  trial_days_without_card,
  grace_period_days,
  is_active
)
select
  'founder-default',
  'Founder plan',
  'Default FloorConnector SaaS plan catalog row used by signed SaaS billing webhook reconciliation. This is a plan catalog entry only; company subscriptions are created or updated by signed Stripe webhooks.',
  'monthly'::public.billing_interval,
  49900,
  'USD',
  14,
  3,
  7,
  true
where not exists (
  select 1
  from public.subscription_plans
  where lower(key) = 'founder-default'
);
