create table if not exists public.platform_starter_packs (
  id uuid primary key default extensions.gen_random_uuid(),
  pack_key text not null unique,
  name text not null,
  description text,
  status text not null default 'draft',
  segment_key text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_starter_packs_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint platform_starter_packs_key_check
    check (pack_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists platform_starter_packs_status_idx
  on public.platform_starter_packs (status, pack_key);

drop trigger if exists platform_starter_packs_set_updated_at
  on public.platform_starter_packs;
create trigger platform_starter_packs_set_updated_at
before update on public.platform_starter_packs
for each row
execute function public.set_updated_at();

create table if not exists public.platform_starter_pack_items (
  id uuid primary key default extensions.gen_random_uuid(),
  starter_pack_id uuid not null references public.platform_starter_packs(id) on delete cascade,
  item_type text not null,
  template_seed_id uuid references public.platform_template_seeds(id) on delete cascade,
  catalog_seed_id uuid references public.platform_catalog_item_seeds(id) on delete cascade,
  sort_order integer not null default 0,
  is_required boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint platform_starter_pack_items_type_check
    check (item_type in ('template_seed', 'catalog_seed')),
  constraint platform_starter_pack_items_single_reference_check
    check (
      (
        item_type = 'template_seed'
        and template_seed_id is not null
        and catalog_seed_id is null
      )
      or
      (
        item_type = 'catalog_seed'
        and catalog_seed_id is not null
        and template_seed_id is null
      )
    ),
  constraint platform_starter_pack_items_sort_order_check
    check (sort_order >= 0)
);

create index if not exists platform_starter_pack_items_pack_sort_idx
  on public.platform_starter_pack_items (
    starter_pack_id,
    sort_order,
    created_at,
    id
  );

create unique index if not exists platform_starter_pack_items_template_unique_idx
  on public.platform_starter_pack_items (starter_pack_id, template_seed_id)
  where item_type = 'template_seed' and template_seed_id is not null;

create unique index if not exists platform_starter_pack_items_catalog_unique_idx
  on public.platform_starter_pack_items (starter_pack_id, catalog_seed_id)
  where item_type = 'catalog_seed' and catalog_seed_id is not null;

alter table public.platform_starter_packs enable row level security;
alter table public.platform_starter_packs force row level security;

alter table public.platform_starter_pack_items enable row level security;
alter table public.platform_starter_pack_items force row level security;

revoke all on table public.platform_starter_packs from anon;
revoke all on table public.platform_starter_packs from authenticated;
revoke all on table public.platform_starter_pack_items from anon;
revoke all on table public.platform_starter_pack_items from authenticated;

comment on table public.platform_starter_packs is
  'Platform-managed starter pack definitions that group existing platform template and catalog seeds. They are inspectable governance bundles only and do not provision contractor-owned records.';
comment on table public.platform_starter_pack_items is
  'Platform-managed starter pack membership rows referencing existing platform template seeds or platform catalog item seeds without duplicating template or catalog models.';
comment on column public.platform_starter_pack_items.is_required is
  'Governance label for whether a seed is required inside the starter pack. This does not enforce contractor adoption or runtime behavior.';
