alter table public.platform_starter_pack_provisioning_runs
  add column if not exists voided_by uuid references public.users(id) on delete set null,
  add column if not exists void_reason text,
  add column if not exists void_strategy text,
  add column if not exists void_readiness_snapshot jsonb not null default '{}'::jsonb;

alter table public.platform_starter_pack_provisioning_runs
  add column if not exists voided_at timestamptz;

update public.platform_starter_pack_provisioning_runs
set void_strategy = 'audit_only'
where voided_at is not null
  and void_strategy is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_starter_pack_provisioning_runs_void_strategy_check'
      and conrelid = 'public.platform_starter_pack_provisioning_runs'::regclass
  ) then
    alter table public.platform_starter_pack_provisioning_runs
      add constraint platform_starter_pack_provisioning_runs_void_strategy_check
      check (
        void_strategy is null
        or void_strategy in (
          'audit_only',
          'archive_unused_future',
          'detach_lineage_future'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_starter_pack_provisioning_runs_void_reason_check'
      and conrelid = 'public.platform_starter_pack_provisioning_runs'::regclass
  ) then
    alter table public.platform_starter_pack_provisioning_runs
      add constraint platform_starter_pack_provisioning_runs_void_reason_check
      check (void_reason is null or btrim(void_reason) <> '');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_starter_pack_provisioning_runs_void_snapshot_check'
      and conrelid = 'public.platform_starter_pack_provisioning_runs'::regclass
  ) then
    alter table public.platform_starter_pack_provisioning_runs
      add constraint platform_starter_pack_provisioning_runs_void_snapshot_check
      check (jsonb_typeof(void_readiness_snapshot) = 'object');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_starter_pack_provisioning_runs_void_metadata_check'
      and conrelid = 'public.platform_starter_pack_provisioning_runs'::regclass
  ) then
    alter table public.platform_starter_pack_provisioning_runs
      add constraint platform_starter_pack_provisioning_runs_void_metadata_check
      check (
        (
          status <> 'voided'
          or (
            voided_at is not null
            and void_strategy is not null
          )
        )
        and (
          voided_at is null
          or void_strategy is not null
        )
      );
  end if;
end $$;

alter table public.platform_starter_pack_provisioning_runs enable row level security;
alter table public.platform_starter_pack_provisioning_runs force row level security;

revoke all on table public.platform_starter_pack_provisioning_runs from anon;
revoke all on table public.platform_starter_pack_provisioning_runs from authenticated;

comment on column public.platform_starter_pack_provisioning_runs.voided_by is
  'Future audit-only void actor. This metadata is not a void action and does not mutate tenant-owned records.';
comment on column public.platform_starter_pack_provisioning_runs.void_reason is
  'Future operator-safe reason for audit-only void review. It must not contain secrets or raw provider errors.';
comment on column public.platform_starter_pack_provisioning_runs.void_strategy is
  'Future void strategy marker. Initial supported values are audit_only, archive_unused_future, and detach_lineage_future.';
comment on column public.platform_starter_pack_provisioning_runs.void_readiness_snapshot is
  'Future durable snapshot of read-only void-readiness usage checks. It is audit evidence only and not an executable command.';
