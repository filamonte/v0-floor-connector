create table if not exists public.platform_starter_pack_provisioning_runs (
  id uuid primary key default extensions.gen_random_uuid(),
  starter_pack_id uuid not null references public.platform_starter_packs(id) on delete restrict,
  organization_id uuid not null references public.companies(id) on delete restrict,
  requested_by uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  status text not null default 'draft',
  dry_run_snapshot jsonb not null default '{}'::jsonb,
  confirmation_text text,
  idempotency_key text,
  requested_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  voided_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_starter_pack_provisioning_runs_status_check
    check (
      status in (
        'draft',
        'approved',
        'running',
        'completed',
        'completed_with_warnings',
        'failed',
        'voided'
      )
    ),
  constraint platform_starter_pack_provisioning_runs_snapshot_check
    check (jsonb_typeof(dry_run_snapshot) = 'object'),
  constraint platform_starter_pack_provisioning_runs_confirmation_check
    check (confirmation_text is null or btrim(confirmation_text) <> ''),
  constraint platform_starter_pack_provisioning_runs_idempotency_check
    check (idempotency_key is null or btrim(idempotency_key) <> '')
);

create unique index if not exists platform_starter_pack_provisioning_runs_idempotency_unique_idx
  on public.platform_starter_pack_provisioning_runs (idempotency_key)
  where idempotency_key is not null;

create index if not exists platform_starter_pack_provisioning_runs_pack_idx
  on public.platform_starter_pack_provisioning_runs (
    starter_pack_id,
    created_at desc
  );

create index if not exists platform_starter_pack_provisioning_runs_org_idx
  on public.platform_starter_pack_provisioning_runs (
    organization_id,
    created_at desc
  );

create index if not exists platform_starter_pack_provisioning_runs_status_idx
  on public.platform_starter_pack_provisioning_runs (
    status,
    created_at desc
  );

drop trigger if exists platform_starter_pack_provisioning_runs_set_updated_at
  on public.platform_starter_pack_provisioning_runs;
create trigger platform_starter_pack_provisioning_runs_set_updated_at
before update on public.platform_starter_pack_provisioning_runs
for each row
execute function public.set_updated_at();

create table if not exists public.platform_starter_pack_provisioning_run_items (
  id uuid primary key default extensions.gen_random_uuid(),
  run_id uuid not null references public.platform_starter_pack_provisioning_runs(id) on delete restrict,
  starter_pack_item_id uuid references public.platform_starter_pack_items(id) on delete set null,
  source_item_type text not null,
  source_template_seed_id uuid references public.platform_template_seeds(id) on delete set null,
  source_catalog_seed_id uuid references public.platform_catalog_item_seeds(id) on delete set null,
  destination_record_type text not null,
  destination_record_id uuid,
  action text not null,
  status text not null default 'pending',
  source_snapshot jsonb not null default '{}'::jsonb,
  destination_snapshot jsonb not null default '{}'::jsonb,
  reason text,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_starter_pack_provisioning_run_items_source_type_check
    check (source_item_type in ('template_seed', 'catalog_seed')),
  constraint platform_starter_pack_provisioning_run_items_destination_type_check
    check (destination_record_type in ('document_template', 'catalog_item')),
  constraint platform_starter_pack_provisioning_run_items_action_check
    check (
      action in (
        'would_create',
        'skipped_existing',
        'created',
        'blocked',
        'failed',
        'voided'
      )
    ),
  constraint platform_starter_pack_provisioning_run_items_status_check
    check (
      status in (
        'pending',
        'completed',
        'skipped',
        'blocked',
        'failed',
        'voided'
      )
    ),
  constraint platform_starter_pack_provisioning_run_items_source_snapshot_check
    check (jsonb_typeof(source_snapshot) = 'object'),
  constraint platform_starter_pack_provisioning_run_items_destination_snapshot_check
    check (jsonb_typeof(destination_snapshot) = 'object'),
  constraint platform_starter_pack_provisioning_run_items_source_reference_check
    check (
      (
        source_item_type = 'template_seed'
        and source_template_seed_id is not null
        and source_catalog_seed_id is null
        and destination_record_type = 'document_template'
      )
      or
      (
        source_item_type = 'catalog_seed'
        and source_catalog_seed_id is not null
        and source_template_seed_id is null
        and destination_record_type = 'catalog_item'
      )
    )
);

create index if not exists platform_starter_pack_provisioning_run_items_run_idx
  on public.platform_starter_pack_provisioning_run_items (
    run_id,
    created_at,
    id
  );

create index if not exists platform_starter_pack_provisioning_run_items_status_idx
  on public.platform_starter_pack_provisioning_run_items (
    status,
    created_at desc
  );

create index if not exists platform_starter_pack_provisioning_run_items_template_seed_idx
  on public.platform_starter_pack_provisioning_run_items (source_template_seed_id)
  where source_template_seed_id is not null;

create index if not exists platform_starter_pack_provisioning_run_items_catalog_seed_idx
  on public.platform_starter_pack_provisioning_run_items (source_catalog_seed_id)
  where source_catalog_seed_id is not null;

create index if not exists platform_starter_pack_provisioning_run_items_destination_idx
  on public.platform_starter_pack_provisioning_run_items (
    destination_record_type,
    destination_record_id
  )
  where destination_record_id is not null;

drop trigger if exists platform_starter_pack_provisioning_run_items_set_updated_at
  on public.platform_starter_pack_provisioning_run_items;
create trigger platform_starter_pack_provisioning_run_items_set_updated_at
before update on public.platform_starter_pack_provisioning_run_items
for each row
execute function public.set_updated_at();

alter table public.platform_starter_pack_provisioning_runs enable row level security;
alter table public.platform_starter_pack_provisioning_runs force row level security;

alter table public.platform_starter_pack_provisioning_run_items enable row level security;
alter table public.platform_starter_pack_provisioning_run_items force row level security;

revoke all on table public.platform_starter_pack_provisioning_runs from anon;
revoke all on table public.platform_starter_pack_provisioning_runs from authenticated;
revoke all on table public.platform_starter_pack_provisioning_run_items from anon;
revoke all on table public.platform_starter_pack_provisioning_run_items from authenticated;

comment on table public.platform_starter_pack_provisioning_runs is
  'Future starter-pack provisioning audit/run records. These rows do not provision contractor-owned templates or catalog items by themselves.';
comment on table public.platform_starter_pack_provisioning_run_items is
  'Future item-level provisioning audit rows for starter-pack dry-run approvals and outcomes. These rows preserve source and destination snapshots without duplicating template or catalog models.';
comment on column public.platform_starter_pack_provisioning_runs.dry_run_snapshot is
  'Audit snapshot of the reviewed dry run for a future provisioning approval. It is evidence only and not an executable command.';
comment on column public.platform_starter_pack_provisioning_runs.idempotency_key is
  'Future retry guard for one approved provisioning attempt. No provisioning action is implemented in this phase.';
comment on column public.platform_starter_pack_provisioning_run_items.destination_record_id is
  'Polymorphic future destination id for a created or matched organization-owned document_template or catalog_item.';
comment on column public.platform_starter_pack_provisioning_run_items.source_snapshot is
  'Source seed snapshot captured for audit evidence; it does not replace platform template or catalog seed tables.';
