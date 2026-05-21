create unique index if not exists estimates_company_id_id_unique_idx
  on public.estimates (company_id, id);

create unique index if not exists contracts_company_id_id_unique_idx
  on public.contracts (company_id, id);

create unique index if not exists selected_floor_systems_company_id_id_unique_idx
  on public.selected_floor_systems (company_id, id);

create or replace function public.enforce_system_snapshot_restricted_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'System snapshots are binding records and cannot be deleted. Use snapshot_status instead.';
  end if;

  if (
    to_jsonb(new) - 'snapshot_status' - 'metadata' - 'updated_by' - 'updated_at'
  ) <> (
    to_jsonb(old) - 'snapshot_status' - 'metadata' - 'updated_by' - 'updated_at'
  ) then
    raise exception 'System snapshots are insert-only. Only snapshot_status, metadata, updated_by, and updated_at may be updated.';
  end if;

  return new;
end;
$$;

create table if not exists public.estimate_system_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  estimate_id uuid not null,
  selected_floor_system_id uuid not null,
  snapshot_status text not null default 'active',
  system_name_snapshot text not null,
  service_family_snapshot text not null,
  finish_family_snapshot text,
  manufacturer_name_snapshot text,
  product_line_snapshot text,
  product_code_snapshot text,
  sku_snapshot text,
  finish_product_name_snapshot text,
  area_label_snapshot text,
  area_type_snapshot text not null default 'whole_project',
  phase_label_snapshot text,
  option_label_snapshot text,
  sort_order_snapshot integer not null default 0,
  estimated_area_sqft_snapshot numeric(12, 2),
  estimated_linear_ft_snapshot numeric(12, 2),
  quantity_notes_snapshot text,
  customer_facing_description_snapshot text,
  technical_notes_snapshot text,
  component_snapshot_json jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint estimate_system_snapshots_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete restrict,
  constraint estimate_system_snapshots_selected_system_company_fkey
    foreign key (company_id, selected_floor_system_id)
    references public.selected_floor_systems(company_id, id)
    on delete restrict,
  constraint estimate_system_snapshots_status_check
    check (snapshot_status in ('active', 'superseded', 'retracted', 'void', 'amended')),
  constraint estimate_system_snapshots_service_family_check
    check (
      service_family_snapshot in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color_coating',
        'concrete_polishing',
        'grind_and_seal',
        'future_specialty_system'
      )
    ),
  constraint estimate_system_snapshots_finish_family_check
    check (
      finish_family_snapshot is null
      or finish_family_snapshot in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color',
        'none',
        'other'
      )
    ),
  constraint estimate_system_snapshots_area_type_check
    check (
      area_type_snapshot in (
        'room',
        'zone',
        'phase',
        'option',
        'alternate',
        'whole_project',
        'other'
      )
    ),
  constraint estimate_system_snapshots_sort_order_check
    check (sort_order_snapshot >= 0),
  constraint estimate_system_snapshots_estimated_area_sqft_check
    check (estimated_area_sqft_snapshot is null or estimated_area_sqft_snapshot >= 0),
  constraint estimate_system_snapshots_estimated_linear_ft_check
    check (estimated_linear_ft_snapshot is null or estimated_linear_ft_snapshot >= 0),
  constraint estimate_system_snapshots_component_snapshot_array_check
    check (jsonb_typeof(component_snapshot_json) = 'array'),
  constraint estimate_system_snapshots_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint estimate_system_snapshots_system_name_not_blank_check
    check (char_length(btrim(system_name_snapshot)) > 0),
  constraint estimate_system_snapshots_manufacturer_name_not_blank_check
    check (manufacturer_name_snapshot is null or char_length(btrim(manufacturer_name_snapshot)) > 0),
  constraint estimate_system_snapshots_product_line_not_blank_check
    check (product_line_snapshot is null or char_length(btrim(product_line_snapshot)) > 0),
  constraint estimate_system_snapshots_product_code_not_blank_check
    check (product_code_snapshot is null or char_length(btrim(product_code_snapshot)) > 0),
  constraint estimate_system_snapshots_sku_not_blank_check
    check (sku_snapshot is null or char_length(btrim(sku_snapshot)) > 0),
  constraint estimate_system_snapshots_finish_product_name_not_blank_check
    check (finish_product_name_snapshot is null or char_length(btrim(finish_product_name_snapshot)) > 0),
  constraint estimate_system_snapshots_area_label_not_blank_check
    check (area_label_snapshot is null or char_length(btrim(area_label_snapshot)) > 0),
  constraint estimate_system_snapshots_phase_label_not_blank_check
    check (phase_label_snapshot is null or char_length(btrim(phase_label_snapshot)) > 0),
  constraint estimate_system_snapshots_option_label_not_blank_check
    check (option_label_snapshot is null or char_length(btrim(option_label_snapshot)) > 0),
  constraint estimate_system_snapshots_quantity_notes_not_blank_check
    check (quantity_notes_snapshot is null or char_length(btrim(quantity_notes_snapshot)) > 0),
  constraint estimate_system_snapshots_customer_description_not_blank_check
    check (
      customer_facing_description_snapshot is null
      or char_length(btrim(customer_facing_description_snapshot)) > 0
    ),
  constraint estimate_system_snapshots_technical_notes_not_blank_check
    check (technical_notes_snapshot is null or char_length(btrim(technical_notes_snapshot)) > 0)
);

create unique index if not exists estimate_system_snapshots_company_id_id_unique_idx
  on public.estimate_system_snapshots (company_id, id);

create index if not exists estimate_system_snapshots_company_estimate_idx
  on public.estimate_system_snapshots (company_id, estimate_id);

create index if not exists estimate_system_snapshots_company_selected_system_idx
  on public.estimate_system_snapshots (company_id, selected_floor_system_id);

create index if not exists estimate_system_snapshots_company_status_idx
  on public.estimate_system_snapshots (company_id, snapshot_status);

create index if not exists estimate_system_snapshots_company_created_at_idx
  on public.estimate_system_snapshots (company_id, created_at desc);

create unique index if not exists estimate_system_snapshots_active_unique_idx
  on public.estimate_system_snapshots (company_id, estimate_id, selected_floor_system_id)
  where snapshot_status = 'active';

drop trigger if exists set_estimate_system_snapshots_updated_at on public.estimate_system_snapshots;
create trigger set_estimate_system_snapshots_updated_at
before update on public.estimate_system_snapshots
for each row
execute function public.set_updated_at();

drop trigger if exists enforce_estimate_system_snapshots_restricted_update on public.estimate_system_snapshots;
create trigger enforce_estimate_system_snapshots_restricted_update
before update or delete on public.estimate_system_snapshots
for each row
execute function public.enforce_system_snapshot_restricted_update();

alter table public.estimate_system_snapshots enable row level security;
alter table public.estimate_system_snapshots force row level security;

drop policy if exists estimate_system_snapshots_select_by_membership on public.estimate_system_snapshots;
create policy estimate_system_snapshots_select_by_membership
on public.estimate_system_snapshots
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_system_snapshots_insert_by_membership on public.estimate_system_snapshots;
create policy estimate_system_snapshots_insert_by_membership
on public.estimate_system_snapshots
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_system_snapshots_update_by_membership on public.estimate_system_snapshots;
create policy estimate_system_snapshots_update_by_membership
on public.estimate_system_snapshots
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

create table if not exists public.contract_system_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contract_id uuid not null,
  selected_floor_system_id uuid not null,
  estimate_system_snapshot_id uuid,
  snapshot_status text not null default 'active',
  system_name_snapshot text not null,
  service_family_snapshot text not null,
  finish_family_snapshot text,
  manufacturer_name_snapshot text,
  product_line_snapshot text,
  product_code_snapshot text,
  sku_snapshot text,
  finish_product_name_snapshot text,
  area_label_snapshot text,
  area_type_snapshot text not null default 'whole_project',
  phase_label_snapshot text,
  option_label_snapshot text,
  sort_order_snapshot integer not null default 0,
  estimated_area_sqft_snapshot numeric(12, 2),
  estimated_linear_ft_snapshot numeric(12, 2),
  quantity_notes_snapshot text,
  customer_facing_description_snapshot text,
  technical_notes_snapshot text,
  component_snapshot_json jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_system_snapshots_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete restrict,
  constraint contract_system_snapshots_selected_system_company_fkey
    foreign key (company_id, selected_floor_system_id)
    references public.selected_floor_systems(company_id, id)
    on delete restrict,
  constraint contract_system_snapshots_estimate_snapshot_company_fkey
    foreign key (company_id, estimate_system_snapshot_id)
    references public.estimate_system_snapshots(company_id, id)
    on delete restrict,
  constraint contract_system_snapshots_status_check
    check (snapshot_status in ('active', 'superseded', 'retracted', 'void', 'amended')),
  constraint contract_system_snapshots_service_family_check
    check (
      service_family_snapshot in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color_coating',
        'concrete_polishing',
        'grind_and_seal',
        'future_specialty_system'
      )
    ),
  constraint contract_system_snapshots_finish_family_check
    check (
      finish_family_snapshot is null
      or finish_family_snapshot in (
        'decorative_flake',
        'metallic_epoxy',
        'decorative_quartz',
        'solid_color',
        'none',
        'other'
      )
    ),
  constraint contract_system_snapshots_area_type_check
    check (
      area_type_snapshot in (
        'room',
        'zone',
        'phase',
        'option',
        'alternate',
        'whole_project',
        'other'
      )
    ),
  constraint contract_system_snapshots_sort_order_check
    check (sort_order_snapshot >= 0),
  constraint contract_system_snapshots_estimated_area_sqft_check
    check (estimated_area_sqft_snapshot is null or estimated_area_sqft_snapshot >= 0),
  constraint contract_system_snapshots_estimated_linear_ft_check
    check (estimated_linear_ft_snapshot is null or estimated_linear_ft_snapshot >= 0),
  constraint contract_system_snapshots_component_snapshot_array_check
    check (jsonb_typeof(component_snapshot_json) = 'array'),
  constraint contract_system_snapshots_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint contract_system_snapshots_system_name_not_blank_check
    check (char_length(btrim(system_name_snapshot)) > 0),
  constraint contract_system_snapshots_manufacturer_name_not_blank_check
    check (manufacturer_name_snapshot is null or char_length(btrim(manufacturer_name_snapshot)) > 0),
  constraint contract_system_snapshots_product_line_not_blank_check
    check (product_line_snapshot is null or char_length(btrim(product_line_snapshot)) > 0),
  constraint contract_system_snapshots_product_code_not_blank_check
    check (product_code_snapshot is null or char_length(btrim(product_code_snapshot)) > 0),
  constraint contract_system_snapshots_sku_not_blank_check
    check (sku_snapshot is null or char_length(btrim(sku_snapshot)) > 0),
  constraint contract_system_snapshots_finish_product_name_not_blank_check
    check (finish_product_name_snapshot is null or char_length(btrim(finish_product_name_snapshot)) > 0),
  constraint contract_system_snapshots_area_label_not_blank_check
    check (area_label_snapshot is null or char_length(btrim(area_label_snapshot)) > 0),
  constraint contract_system_snapshots_phase_label_not_blank_check
    check (phase_label_snapshot is null or char_length(btrim(phase_label_snapshot)) > 0),
  constraint contract_system_snapshots_option_label_not_blank_check
    check (option_label_snapshot is null or char_length(btrim(option_label_snapshot)) > 0),
  constraint contract_system_snapshots_quantity_notes_not_blank_check
    check (quantity_notes_snapshot is null or char_length(btrim(quantity_notes_snapshot)) > 0),
  constraint contract_system_snapshots_customer_description_not_blank_check
    check (
      customer_facing_description_snapshot is null
      or char_length(btrim(customer_facing_description_snapshot)) > 0
    ),
  constraint contract_system_snapshots_technical_notes_not_blank_check
    check (technical_notes_snapshot is null or char_length(btrim(technical_notes_snapshot)) > 0)
);

create unique index if not exists contract_system_snapshots_company_id_id_unique_idx
  on public.contract_system_snapshots (company_id, id);

create index if not exists contract_system_snapshots_company_contract_idx
  on public.contract_system_snapshots (company_id, contract_id);

create index if not exists contract_system_snapshots_company_selected_system_idx
  on public.contract_system_snapshots (company_id, selected_floor_system_id);

create index if not exists contract_system_snapshots_company_estimate_snapshot_idx
  on public.contract_system_snapshots (company_id, estimate_system_snapshot_id)
  where estimate_system_snapshot_id is not null;

create index if not exists contract_system_snapshots_company_status_idx
  on public.contract_system_snapshots (company_id, snapshot_status);

create index if not exists contract_system_snapshots_company_created_at_idx
  on public.contract_system_snapshots (company_id, created_at desc);

create unique index if not exists contract_system_snapshots_active_unique_idx
  on public.contract_system_snapshots (company_id, contract_id, selected_floor_system_id)
  where snapshot_status = 'active';

drop trigger if exists set_contract_system_snapshots_updated_at on public.contract_system_snapshots;
create trigger set_contract_system_snapshots_updated_at
before update on public.contract_system_snapshots
for each row
execute function public.set_updated_at();

drop trigger if exists enforce_contract_system_snapshots_restricted_update on public.contract_system_snapshots;
create trigger enforce_contract_system_snapshots_restricted_update
before update or delete on public.contract_system_snapshots
for each row
execute function public.enforce_system_snapshot_restricted_update();

alter table public.contract_system_snapshots enable row level security;
alter table public.contract_system_snapshots force row level security;

drop policy if exists contract_system_snapshots_select_by_membership on public.contract_system_snapshots;
create policy contract_system_snapshots_select_by_membership
on public.contract_system_snapshots
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contract_system_snapshots_insert_by_membership on public.contract_system_snapshots;
create policy contract_system_snapshots_insert_by_membership
on public.contract_system_snapshots
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists contract_system_snapshots_update_by_membership on public.contract_system_snapshots;
create policy contract_system_snapshots_update_by_membership
on public.contract_system_snapshots
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on function public.enforce_system_snapshot_restricted_update() is 'Restricts system snapshot tables to insert-only binding behavior. Deletes are blocked and updates are limited to status, metadata, updated_by, and updated_at.';

comment on table public.estimate_system_snapshots is 'Tenant-owned selected-system/spec proof snapshots for future customer-facing estimate boundaries. Schema foundation only; no estimate workflow writes these rows yet.';
comment on table public.contract_system_snapshots is 'Tenant-owned selected-system/spec proof snapshots for future contract review/signature boundaries. Schema foundation only; no contract workflow writes these rows yet.';

comment on column public.estimate_system_snapshots.component_snapshot_json is 'Frozen component/catalog/product metadata payload for future estimate display. Must be a JSON array. Canonical files/file_links are not added in this slice.';
comment on column public.contract_system_snapshots.component_snapshot_json is 'Frozen component/catalog/product metadata payload for future contract display. Must be a JSON array. Canonical files/file_links are not added in this slice.';
comment on column public.estimate_system_snapshots.metadata is 'Extensible snapshot metadata as a JSON object. Image/spec-sheet references are metadata-only until a future shared file/link layer exists.';
comment on column public.contract_system_snapshots.metadata is 'Extensible snapshot metadata as a JSON object. Image/spec-sheet references are metadata-only until a future shared file/link layer exists.';
comment on column public.contract_system_snapshots.estimate_system_snapshot_id is 'Optional same-company source link when a contract system snapshot is copied from estimate system snapshot proof.';
