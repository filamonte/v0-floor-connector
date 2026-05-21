create table if not exists public.platform_package_definitions (
  id uuid primary key default extensions.gen_random_uuid(),
  package_key text not null,
  display_name text not null,
  description text,
  status text not null default 'draft',
  intended_audience text,
  segment_summary text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint platform_package_definitions_package_key_unique unique (package_key),
  constraint platform_package_definitions_package_key_format
    check (package_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint platform_package_definitions_display_name_check
    check (length(btrim(display_name)) > 0),
  constraint platform_package_definitions_status_check
    check (status in ('draft', 'review', 'published', 'deprecated', 'archived')),
  constraint platform_package_definitions_archive_status_check
    check (
      (status = 'archived' and archived_at is not null)
      or
      (status <> 'archived' and archived_at is null)
    )
);

create index if not exists platform_package_definitions_status_idx
  on public.platform_package_definitions (status, package_key);

create index if not exists platform_package_definitions_created_at_idx
  on public.platform_package_definitions (created_at desc);

drop trigger if exists platform_package_definitions_set_updated_at
  on public.platform_package_definitions;
create trigger platform_package_definitions_set_updated_at
before update on public.platform_package_definitions
for each row
execute function public.set_updated_at();

create table if not exists public.platform_package_definition_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  package_definition_id uuid not null
    references public.platform_package_definitions(id) on delete cascade,
  version_number integer not null,
  version_label text,
  status text not null default 'draft',
  commercial_summary text,
  module_visibility_intent jsonb,
  usage_limit_intent jsonb,
  entitlement_intent jsonb,
  billing_provider_intent jsonb,
  starter_pack_default_intent jsonb,
  contractor_group_targeting_intent jsonb,
  published_snapshot jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  deprecated_at timestamptz,
  archived_at timestamptz,
  constraint platform_package_definition_versions_number_check
    check (version_number > 0),
  constraint platform_package_definition_versions_label_check
    check (version_label is null or length(btrim(version_label)) > 0),
  constraint platform_package_definition_versions_status_check
    check (status in ('draft', 'review', 'published', 'deprecated', 'archived')),
  constraint platform_package_definition_versions_published_status_check
    check (
      (published_at is null and status in ('draft', 'review'))
      or
      (published_at is not null and status in ('published', 'deprecated', 'archived'))
    ),
  constraint platform_package_definition_versions_deprecated_status_check
    check (
      deprecated_at is null
      or status in ('deprecated', 'archived')
    ),
  constraint platform_package_definition_versions_archive_status_check
    check (
      (status = 'archived' and archived_at is not null)
      or
      (status <> 'archived' and archived_at is null)
    ),
  constraint platform_package_definition_versions_module_visibility_object_check
    check (module_visibility_intent is null or jsonb_typeof(module_visibility_intent) = 'object'),
  constraint platform_package_definition_versions_usage_limit_object_check
    check (usage_limit_intent is null or jsonb_typeof(usage_limit_intent) = 'object'),
  constraint platform_package_definition_versions_entitlement_object_check
    check (entitlement_intent is null or jsonb_typeof(entitlement_intent) = 'object'),
  constraint platform_package_definition_versions_billing_provider_object_check
    check (billing_provider_intent is null or jsonb_typeof(billing_provider_intent) = 'object'),
  constraint platform_package_definition_versions_starter_pack_object_check
    check (starter_pack_default_intent is null or jsonb_typeof(starter_pack_default_intent) = 'object'),
  constraint platform_package_definition_versions_group_targeting_object_check
    check (contractor_group_targeting_intent is null or jsonb_typeof(contractor_group_targeting_intent) = 'object'),
  constraint platform_package_definition_versions_published_snapshot_object_check
    check (published_snapshot is null or jsonb_typeof(published_snapshot) = 'object')
);

create unique index if not exists platform_package_definition_versions_number_unique_idx
  on public.platform_package_definition_versions (
    package_definition_id,
    version_number
  );

create unique index if not exists platform_package_definition_versions_label_unique_idx
  on public.platform_package_definition_versions (
    package_definition_id,
    lower(version_label)
  )
  where version_label is not null;

create unique index if not exists platform_package_definition_versions_one_published_idx
  on public.platform_package_definition_versions (package_definition_id)
  where status = 'published' and archived_at is null;

create index if not exists platform_package_definition_versions_definition_idx
  on public.platform_package_definition_versions (
    package_definition_id,
    status,
    version_number desc
  );

create index if not exists platform_package_definition_versions_created_at_idx
  on public.platform_package_definition_versions (created_at desc);

drop trigger if exists platform_package_definition_versions_set_updated_at
  on public.platform_package_definition_versions;
create trigger platform_package_definition_versions_set_updated_at
before update on public.platform_package_definition_versions
for each row
execute function public.set_updated_at();

alter table public.platform_package_definitions enable row level security;
alter table public.platform_package_definitions force row level security;

alter table public.platform_package_definition_versions enable row level security;
alter table public.platform_package_definition_versions force row level security;

revoke all on table public.platform_package_definitions from public;
revoke all on table public.platform_package_definitions from anon;
revoke all on table public.platform_package_definitions from authenticated;

revoke all on table public.platform_package_definition_versions from public;
revoke all on table public.platform_package_definition_versions from anon;
revoke all on table public.platform_package_definition_versions from authenticated;

grant select on table public.platform_package_definitions to service_role;
grant select on table public.platform_package_definition_versions to service_role;

comment on table public.platform_package_definitions is
  'Platform-owned package definition catalog. Read-only in the app for this slice; it does not assign packages, call billing providers, enforce entitlements, gate modules, or change contractor permissions.';

comment on table public.platform_package_definition_versions is
  'Platform-owned package definition version catalog with intent snapshots only. Snapshots must not store billing provider secrets, payment data, service-role keys, raw provider payloads, or runtime enforcement state.';

comment on column public.platform_package_definitions.package_key is
  'Stable normalized package reference key for future package governance. It is not a contractor assignment or entitlement.';

comment on column public.platform_package_definition_versions.billing_provider_intent is
  'Safe intent summary for future billing-provider mapping. Do not store provider secrets, payment method data, card data, raw provider payloads, or service-role keys.';

comment on column public.platform_package_definition_versions.entitlement_intent is
  'Safe intent summary only. It does not enforce runtime entitlements, module access, package assignment, pricing, or contractor permissions.';
