alter table public.companies
  add column if not exists founder_plan_label text,
  add column if not exists founder_monthly_amount_cents integer,
  add column if not exists founder_billing_status text not null default 'not_started',
  add column if not exists founder_billing_method text not null default 'manual_invoice',
  add column if not exists founder_billing_reference text,
  add column if not exists founder_billing_notes text,
  add column if not exists founder_billing_follow_up_at timestamptz,
  add column if not exists founder_billing_evidence_received_at timestamptz,
  add column if not exists founder_billing_updated_by uuid references public.users(id) on delete set null,
  add column if not exists founder_billing_updated_at timestamptz;

alter table public.companies
  add constraint companies_founder_monthly_amount_cents_check
  check (
    founder_monthly_amount_cents is null
    or founder_monthly_amount_cents >= 0
  );

alter table public.companies
  add constraint companies_founder_billing_status_check
  check (
    founder_billing_status in (
      'not_started',
      'pending',
      'evidence_received',
      'waived',
      'blocked'
    )
  );

alter table public.companies
  add constraint companies_founder_billing_method_check
  check (
    founder_billing_method in (
      'manual_invoice',
      'stripe_payment_link',
      'stripe_subscription_future',
      'waived'
    )
  );

create index if not exists companies_founder_billing_status_idx
  on public.companies (founder_billing_status);

create index if not exists companies_founder_billing_follow_up_at_idx
  on public.companies (founder_billing_follow_up_at)
  where founder_billing_follow_up_at is not null;

comment on column public.companies.founder_plan_label is
  'Platform-admin-entered founder access plan label. This is operational evidence only and does not create or verify a Stripe plan.';

comment on column public.companies.founder_monthly_amount_cents is
  'Expected founder monthly amount in cents for manual/operator tracking. This is not a Stripe price or invoice amount.';

comment on column public.companies.founder_billing_status is
  'Platform-admin-entered founder billing evidence state. This does not auto-activate the tenant or represent live Stripe subscription truth.';

comment on column public.companies.founder_billing_method is
  'Platform-admin-entered expected collection method for founder access. This is not provider execution.';

comment on column public.companies.founder_billing_reference is
  'Non-secret external billing reference or receipt note entered by platform admin. Do not store raw payment details, card data, API keys, or provider payloads.';

comment on column public.companies.founder_billing_notes is
  'Platform-only billing notes for founder evidence and follow-up. Do not store secrets or raw provider payloads.';

comment on column public.companies.founder_billing_follow_up_at is
  'Platform-admin follow-up timestamp for founder billing evidence.';

comment on column public.companies.founder_billing_evidence_received_at is
  'Timestamp when platform admin marked founder billing evidence received or waived.';

comment on column public.companies.founder_billing_updated_by is
  'Platform admin user who last updated founder billing evidence.';

comment on column public.companies.founder_billing_updated_at is
  'Timestamp when founder billing evidence was last updated.';
