create table if not exists public.assessment_spaces (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  assessment_package_id uuid not null references public.assessment_packages(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  space_type text not null default 'area',
  floor_level text,
  length_feet numeric(12, 2),
  width_feet numeric(12, 2),
  square_feet numeric(12, 2),
  perimeter_feet numeric(12, 2),
  substrate text,
  current_flooring text,
  condition_summary text,
  prep_notes text,
  moisture_notes text,
  access_notes text,
  sort_order integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint assessment_spaces_space_type_check check (
    space_type in (
      'room',
      'area',
      'zone',
      'stair',
      'hallway',
      'garage',
      'exterior',
      'other'
    )
  ),
  constraint assessment_spaces_name_check check (length(trim(name)) > 0),
  constraint assessment_spaces_length_check check (length_feet is null or length_feet >= 0),
  constraint assessment_spaces_width_check check (width_feet is null or width_feet >= 0),
  constraint assessment_spaces_square_feet_check check (square_feet is null or square_feet >= 0),
  constraint assessment_spaces_perimeter_feet_check check (perimeter_feet is null or perimeter_feet >= 0)
);

create index if not exists assessment_spaces_company_id_idx
  on public.assessment_spaces (company_id);

create index if not exists assessment_spaces_package_sort_idx
  on public.assessment_spaces (assessment_package_id, sort_order, created_at);

create index if not exists assessment_spaces_company_project_idx
  on public.assessment_spaces (company_id, project_id);

drop trigger if exists set_assessment_spaces_updated_at on public.assessment_spaces;

create trigger set_assessment_spaces_updated_at
before update on public.assessment_spaces
for each row
execute function public.set_updated_at();

create or replace function public.validate_assessment_space_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  package_company_id uuid;
  package_project_id uuid;
begin
  select assessment_package.company_id, assessment_package.project_id
    into package_company_id, package_project_id
  from public.assessment_packages assessment_package
  where assessment_package.id = new.assessment_package_id;

  if package_company_id is null then
    raise exception 'Assessment space must belong to an assessment package.';
  end if;

  if package_company_id <> new.company_id then
    raise exception 'Assessment space must belong to the same company as its assessment package.';
  end if;

  if package_project_id <> new.project_id then
    raise exception 'Assessment space project must match its assessment package project.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_assessment_space_relationships_trigger
  on public.assessment_spaces;

create trigger validate_assessment_space_relationships_trigger
before insert or update on public.assessment_spaces
for each row
execute function public.validate_assessment_space_relationships();

alter table public.assessment_spaces enable row level security;
alter table public.assessment_spaces force row level security;

drop policy if exists assessment_spaces_select_by_membership
  on public.assessment_spaces;
create policy assessment_spaces_select_by_membership
on public.assessment_spaces
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists assessment_spaces_insert_by_membership
  on public.assessment_spaces;
create policy assessment_spaces_insert_by_membership
on public.assessment_spaces
for insert
to authenticated
with check (
  (select public.is_active_company_member(company_id))
  and (created_by is null or created_by = (select auth.uid()))
  and (updated_by is null or updated_by = (select auth.uid()))
);

drop policy if exists assessment_spaces_update_by_membership
  on public.assessment_spaces;
create policy assessment_spaces_update_by_membership
on public.assessment_spaces
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check (
  (select public.is_active_company_member(company_id))
  and (updated_by is null or updated_by = (select auth.uid()))
);

comment on table public.assessment_spaces is 'Canonical tenant-scoped area and space foundation under assessment packages. It supports future guided capture, photos, conditions, risks, and estimate handoff without becoming detached room, estimate, material, or project truth.';
comment on column public.assessment_spaces.assessment_package_id is 'Parent project-owned assessment package. This package controls project and organization lineage.';
comment on column public.assessment_spaces.project_id is 'Denormalized from the parent assessment package for tenant-safe project queries; it must match the package project.';
