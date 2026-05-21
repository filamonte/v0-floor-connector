create table if not exists public.equipment_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  name text not null,
  asset_tag text,
  serial_number text,
  equipment_type text not null default 'other',
  ownership_status text not null default 'owned',
  operational_status text not null default 'available',
  manufacturer text,
  model text,
  year integer,
  purchase_date date,
  purchase_cost numeric(12, 2),
  rental_start_date date,
  rental_end_date date,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint equipment_assets_name_not_blank check (length(btrim(name)) > 0),
  constraint equipment_assets_equipment_type_check check (
    equipment_type in (
      'grinder',
      'polisher',
      'vacuum',
      'dust_collector',
      'shot_blaster',
      'scarifier',
      'scraper',
      'mixer',
      'sprayer',
      'trailer',
      'truck',
      'generator',
      'moisture_meter',
      'testing_tool',
      'coating_tool',
      'burnisher',
      'hand_tool',
      'kit',
      'other'
    )
  ),
  constraint equipment_assets_ownership_status_check check (
    ownership_status in (
      'owned',
      'rented',
      'leased',
      'subcontractor_owned',
      'other'
    )
  ),
  constraint equipment_assets_operational_status_check check (
    operational_status in (
      'available',
      'assigned',
      'in_use',
      'maintenance',
      'out_of_service',
      'retired'
    )
  ),
  constraint equipment_assets_year_check check (
    year is null or (year >= 1900 and year <= 2200)
  ),
  constraint equipment_assets_purchase_cost_check check (
    purchase_cost is null or purchase_cost >= 0
  ),
  constraint equipment_assets_rental_window_check check (
    rental_start_date is null
    or rental_end_date is null
    or rental_end_date >= rental_start_date
  )
);

create index if not exists equipment_assets_company_id_idx
  on public.equipment_assets(company_id);

create index if not exists equipment_assets_company_active_idx
  on public.equipment_assets(company_id, is_active);

create index if not exists equipment_assets_company_operational_status_idx
  on public.equipment_assets(company_id, operational_status);

create index if not exists equipment_assets_company_equipment_type_idx
  on public.equipment_assets(company_id, equipment_type);

create index if not exists equipment_assets_company_vendor_id_idx
  on public.equipment_assets(company_id, vendor_id)
  where vendor_id is not null;

create unique index if not exists equipment_assets_company_asset_tag_unique_idx
  on public.equipment_assets(company_id, lower(asset_tag))
  where asset_tag is not null and length(btrim(asset_tag)) > 0;

create or replace function public.enforce_equipment_asset_vendor_scope()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  vendor_company_id uuid;
begin
  if new.vendor_id is null then
    return new;
  end if;

  select vendors.company_id
    into vendor_company_id
  from public.vendors
  where vendors.id = new.vendor_id;

  if vendor_company_id is null then
    raise exception 'Equipment vendor does not exist.';
  end if;

  if vendor_company_id <> new.company_id then
    raise exception 'Equipment vendor must belong to the same company.';
  end if;

  return new;
end;
$$;

drop trigger if exists equipment_assets_vendor_scope on public.equipment_assets;
create trigger equipment_assets_vendor_scope
before insert or update of company_id, vendor_id on public.equipment_assets
for each row
execute function public.enforce_equipment_asset_vendor_scope();

drop trigger if exists equipment_assets_set_updated_at on public.equipment_assets;
create trigger equipment_assets_set_updated_at
before update on public.equipment_assets
for each row
execute function public.set_updated_at();

alter table public.equipment_assets enable row level security;
alter table public.equipment_assets force row level security;

drop policy if exists equipment_assets_select_by_membership on public.equipment_assets;
create policy equipment_assets_select_by_membership
on public.equipment_assets
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists equipment_assets_insert_by_manager_scope on public.equipment_assets;
create policy equipment_assets_insert_by_manager_scope
on public.equipment_assets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = equipment_assets.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
  and (created_by is null or created_by = (select auth.uid()))
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists equipment_assets_update_by_manager_scope on public.equipment_assets;
create policy equipment_assets_update_by_manager_scope
on public.equipment_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = equipment_assets.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = equipment_assets.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
  and (updated_by is null or updated_by = (select auth.uid()))
);

grant select, insert, update on public.equipment_assets to authenticated;

comment on table public.equipment_assets is
  'Tenant-scoped canonical equipment asset registry. Assignment, readiness, maintenance, usage, costing, portal, and AI workflows are intentionally deferred.';

comment on column public.equipment_assets.vendor_id is
  'Optional canonical vendor/rental relationship. Same-company scope is enforced by trigger.';
