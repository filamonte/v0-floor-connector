create table if not exists public.contractor_groups (
  id uuid primary key default extensions.gen_random_uuid(),
  group_key text not null,
  name text not null,
  description text,
  status text not null default 'active',
  group_type text not null default 'custom',
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contractor_groups_group_key_unique unique (group_key),
  constraint contractor_groups_group_key_format check (group_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint contractor_groups_status_check check (
    status in ('active', 'inactive', 'archived')
  ),
  constraint contractor_groups_group_type_check check (
    group_type in (
      'trade_segment',
      'onboarding',
      'beta',
      'internal',
      'future_plan',
      'future_entitlement',
      'regional',
      'custom'
    )
  )
);

create index if not exists contractor_groups_status_idx
  on public.contractor_groups(status);

create index if not exists contractor_groups_group_type_idx
  on public.contractor_groups(group_type);

drop trigger if exists set_contractor_groups_updated_at on public.contractor_groups;
create trigger set_contractor_groups_updated_at
before update on public.contractor_groups
for each row
execute function public.set_updated_at();

create table if not exists public.contractor_group_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  contractor_group_id uuid not null references public.contractor_groups(id) on delete cascade,
  organization_id uuid not null references public.companies(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  assignment_source text not null default 'manual',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint contractor_group_memberships_assignment_source_check check (
    assignment_source in (
      'manual',
      'targeting_preview',
      'future_auto_assignment'
    )
  )
);

create unique index if not exists contractor_group_memberships_group_org_unique_idx
  on public.contractor_group_memberships(contractor_group_id, organization_id);

create index if not exists contractor_group_memberships_group_idx
  on public.contractor_group_memberships(contractor_group_id);

create index if not exists contractor_group_memberships_organization_idx
  on public.contractor_group_memberships(organization_id);

alter table public.contractor_groups enable row level security;
alter table public.contractor_groups force row level security;
alter table public.contractor_group_memberships enable row level security;
alter table public.contractor_group_memberships force row level security;

revoke all on table public.contractor_groups from anon, authenticated;
revoke all on table public.contractor_group_memberships from anon, authenticated;

comment on table public.contractor_groups is
  'Platform-managed contractor segmentation groups. These are not tenant roles and do not enforce runtime permissions, entitlements, pricing, or provisioning.';

comment on table public.contractor_group_memberships is
  'Platform-managed organization membership assignments for contractor segmentation groups. These are planning/classification metadata only.';

comment on column public.contractor_groups.group_type is
  'Classification type for platform segmentation. Future plan and future entitlement values are metadata only and do not enforce product behavior.';

comment on column public.contractor_group_memberships.assignment_source is
  'How the platform-admin membership assignment was created. future_auto_assignment is reserved and non-enforcing in this phase.';
