create table if not exists public.platform_starter_pack_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  starter_pack_id uuid not null references public.platform_starter_packs(id) on delete cascade,
  assignment_type text not null,
  organization_id uuid references public.companies(id) on delete cascade,
  assignment_key text,
  label text,
  status text not null default 'draft',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_starter_pack_assignments_type_check
    check (
      assignment_type in (
        'all_organizations',
        'organization',
        'onboarding_profile',
        'region',
        'trade_segment',
        'plan_tier',
        'future_contractor_group'
      )
    ),
  constraint platform_starter_pack_assignments_status_check
    check (status in ('draft', 'active', 'inactive')),
  constraint platform_starter_pack_assignments_target_check
    check (
      (
        assignment_type = 'all_organizations'
        and organization_id is null
        and assignment_key is null
      )
      or
      (
        assignment_type = 'organization'
        and organization_id is not null
        and assignment_key is null
      )
      or
      (
        assignment_type in (
          'onboarding_profile',
          'region',
          'trade_segment',
          'plan_tier',
          'future_contractor_group'
        )
        and organization_id is null
        and assignment_key is not null
        and btrim(assignment_key) <> ''
      )
    )
);

create index if not exists platform_starter_pack_assignments_pack_idx
  on public.platform_starter_pack_assignments (
    starter_pack_id,
    assignment_type,
    status,
    created_at
  );

create index if not exists platform_starter_pack_assignments_organization_idx
  on public.platform_starter_pack_assignments (organization_id)
  where organization_id is not null;

create unique index if not exists platform_starter_pack_assignments_active_all_unique_idx
  on public.platform_starter_pack_assignments (starter_pack_id, assignment_type)
  where status = 'active' and assignment_type = 'all_organizations';

create unique index if not exists platform_starter_pack_assignments_active_org_unique_idx
  on public.platform_starter_pack_assignments (starter_pack_id, organization_id)
  where status = 'active' and assignment_type = 'organization';

create unique index if not exists platform_starter_pack_assignments_active_key_unique_idx
  on public.platform_starter_pack_assignments (
    starter_pack_id,
    assignment_type,
    assignment_key
  )
  where
    status = 'active'
    and assignment_type not in ('all_organizations', 'organization')
    and assignment_key is not null;

drop trigger if exists platform_starter_pack_assignments_set_updated_at
  on public.platform_starter_pack_assignments;
create trigger platform_starter_pack_assignments_set_updated_at
before update on public.platform_starter_pack_assignments
for each row
execute function public.set_updated_at();

alter table public.platform_starter_pack_assignments enable row level security;
alter table public.platform_starter_pack_assignments force row level security;

revoke all on table public.platform_starter_pack_assignments from anon;
revoke all on table public.platform_starter_pack_assignments from authenticated;

comment on table public.platform_starter_pack_assignments is
  'Platform-managed starter pack assignment intent. These rows are planning-only and do not provision contractor-owned templates or catalog items, enforce entitlements, or change runtime defaults.';
comment on column public.platform_starter_pack_assignments.assignment_type is
  'Planning target type for future starter pack assignment. future_contractor_group is an intent label only; contractor groups do not exist in this phase.';
comment on column public.platform_starter_pack_assignments.assignment_key is
  'Text key for non-organization assignment intent such as region, trade segment, onboarding profile, plan tier, or future contractor group.';
