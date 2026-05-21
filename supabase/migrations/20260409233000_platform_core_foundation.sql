create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'platform_surface'
  ) then
    create type public.platform_surface as enum (
      'marketing',
      'contractor_app',
      'customer_portal',
      'super_admin'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'module_key'
  ) then
    create type public.module_key as enum (
      'marketing',
      'contractor_app',
      'customer_portal',
      'super_admin',
      'customers',
      'jobs',
      'estimates',
      'invoices',
      'scheduling',
      'messaging',
      'documents',
      'billing',
      'integrations'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'subscription_state'
  ) then
    create type public.subscription_state as enum (
      'trialing',
      'active',
      'past_due',
      'paused',
      'canceled',
      'unpaid',
      'incomplete',
      'incomplete_expired'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'account_lifecycle_state'
  ) then
    create type public.account_lifecycle_state as enum (
      'trial',
      'active',
      'grace_period',
      'locked',
      'retained',
      'scheduled_for_deletion',
      'deleted',
      'restorable'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'tenant_status'
  ) then
    create type public.tenant_status as enum (
      'trialing',
      'active',
      'suspended',
      'locked',
      'archived',
      'deleted'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'role_scope'
  ) then
    create type public.role_scope as enum (
      'platform',
      'company'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'membership_status'
  ) then
    create type public.membership_status as enum (
      'invited',
      'active',
      'inactive',
      'suspended'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'location_type'
  ) then
    create type public.location_type as enum (
      'headquarters',
      'branch',
      'warehouse',
      'service_area',
      'billing'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'billing_interval'
  ) then
    create type public.billing_interval as enum (
      'monthly',
      'yearly',
      'custom'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  lifecycle_state public.account_lifecycle_state not null default 'active',
  last_sign_in_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.companies (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  legal_name text not null,
  display_name text not null,
  tenant_status public.tenant_status not null default 'trialing',
  lifecycle_state public.account_lifecycle_state not null default 'trial',
  primary_contact_user_id uuid references public.users(id) on delete set null,
  active_location_id uuid,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  grace_period_ends_at timestamptz,
  suspended_at timestamptz,
  access_locked_at timestamptz,
  data_retention_ends_at timestamptz,
  backup_completed_at timestamptz,
  restored_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.locations (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  location_type public.location_type not null default 'branch',
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  scope public.role_scope not null,
  is_system boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint roles_company_scope_check check (
    (scope = 'platform' and company_id is null) or
    (scope = 'company' and company_id is not null)
  )
);

create table if not exists public.permissions (
  id uuid primary key default extensions.gen_random_uuid(),
  key text not null,
  name text not null,
  description text,
  module_key public.module_key not null,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.role_permissions (
  id uuid primary key default extensions.gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint role_permissions_role_permission_unique unique (role_id, permission_id)
);

create table if not exists public.company_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  membership_status public.membership_status not null default 'invited',
  invitation_email text,
  invited_at timestamptz,
  accepted_at timestamptz,
  suspended_at timestamptz,
  last_active_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint company_memberships_company_user_unique unique (company_id, user_id)
);

create table if not exists public.feature_flags (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  module_key public.module_key,
  surface public.platform_surface,
  enabled boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscription_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  key text not null,
  name text not null,
  description text,
  billing_interval public.billing_interval not null default 'monthly',
  amount_cents integer not null default 0,
  currency_code text not null default 'USD',
  trial_days_with_card integer not null default 14,
  trial_days_without_card integer not null default 3,
  grace_period_days integer not null default 7,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subscription_plans_amount_cents_check check (amount_cents >= 0),
  constraint subscription_plans_trial_days_with_card_check check (trial_days_with_card >= 0),
  constraint subscription_plans_trial_days_without_card_check check (trial_days_without_card >= 0),
  constraint subscription_plans_grace_period_days_check check (grace_period_days >= 0)
);

create table if not exists public.company_subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  company_location_id uuid references public.locations(id) on delete set null,
  status public.subscription_state not null default 'trialing',
  lifecycle_state public.account_lifecycle_state not null default 'trial',
  is_current boolean not null default true,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  grace_period_ends_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  suspended_at timestamptz,
  locked_at timestamptz,
  retention_ends_at timestamptz,
  backup_completed_at timestamptz,
  restored_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.companies
  add constraint companies_active_location_id_fkey
  foreign key (active_location_id)
  references public.locations(id)
  on delete set null;

create unique index if not exists users_email_lower_unique_idx
  on public.users (lower(email));

create unique index if not exists companies_slug_unique_idx
  on public.companies (lower(slug));

create index if not exists companies_primary_contact_user_id_idx
  on public.companies (primary_contact_user_id);

create index if not exists companies_active_location_id_idx
  on public.companies (active_location_id);

create index if not exists locations_company_id_idx
  on public.locations (company_id);

create unique index if not exists locations_primary_company_unique_idx
  on public.locations (company_id)
  where is_primary = true;

create unique index if not exists roles_platform_key_unique_idx
  on public.roles (lower(key))
  where company_id is null;

create unique index if not exists roles_company_key_unique_idx
  on public.roles (company_id, lower(key))
  where company_id is not null;

create index if not exists roles_company_id_idx
  on public.roles (company_id);

create unique index if not exists permissions_key_unique_idx
  on public.permissions (lower(key));

create index if not exists permissions_module_key_idx
  on public.permissions (module_key);

create index if not exists role_permissions_role_id_idx
  on public.role_permissions (role_id);

create index if not exists role_permissions_permission_id_idx
  on public.role_permissions (permission_id);

create index if not exists company_memberships_company_id_idx
  on public.company_memberships (company_id);

create index if not exists company_memberships_user_id_idx
  on public.company_memberships (user_id);

create index if not exists company_memberships_role_id_idx
  on public.company_memberships (role_id);

create unique index if not exists feature_flags_platform_key_unique_idx
  on public.feature_flags (lower(key))
  where company_id is null;

create unique index if not exists feature_flags_company_key_unique_idx
  on public.feature_flags (company_id, lower(key))
  where company_id is not null;

create index if not exists feature_flags_company_id_idx
  on public.feature_flags (company_id);

create unique index if not exists subscription_plans_key_unique_idx
  on public.subscription_plans (lower(key));

create index if not exists company_subscriptions_company_id_idx
  on public.company_subscriptions (company_id);

create index if not exists company_subscriptions_subscription_plan_id_idx
  on public.company_subscriptions (subscription_plan_id);

create index if not exists company_subscriptions_company_location_id_idx
  on public.company_subscriptions (company_location_id);

create unique index if not exists company_subscriptions_current_unique_idx
  on public.company_subscriptions (company_id)
  where is_current = true;

create unique index if not exists company_subscriptions_stripe_customer_unique_idx
  on public.company_subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists company_subscriptions_stripe_subscription_unique_idx
  on public.company_subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create trigger locations_set_updated_at
before update on public.locations
for each row
execute function public.set_updated_at();

create trigger roles_set_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

create trigger permissions_set_updated_at
before update on public.permissions
for each row
execute function public.set_updated_at();

create trigger role_permissions_set_updated_at
before update on public.role_permissions
for each row
execute function public.set_updated_at();

create trigger company_memberships_set_updated_at
before update on public.company_memberships
for each row
execute function public.set_updated_at();

create trigger feature_flags_set_updated_at
before update on public.feature_flags
for each row
execute function public.set_updated_at();

create trigger subscription_plans_set_updated_at
before update on public.subscription_plans
for each row
execute function public.set_updated_at();

create trigger company_subscriptions_set_updated_at
before update on public.company_subscriptions
for each row
execute function public.set_updated_at();

comment on table public.users is 'Canonical user record aligned one-to-one with auth.users.';
comment on table public.companies is 'Top-level tenant table for contractor companies.';
comment on table public.locations is 'Company locations supporting multi-location tenants from the start.';
comment on table public.company_memberships is 'Join table linking users to companies and their assigned role.';
comment on table public.roles is 'Platform or company-scoped roles without inheritance.';
comment on table public.permissions is 'Permission registry used to attach access capabilities to roles.';
comment on table public.role_permissions is 'Join table between roles and permissions.';
comment on table public.feature_flags is 'Platform or tenant-scoped feature flag overrides.';
comment on table public.subscription_plans is 'Subscription plan catalog with trial and grace-period defaults.';
comment on table public.company_subscriptions is 'Tenant subscription lifecycle history and current state.';
