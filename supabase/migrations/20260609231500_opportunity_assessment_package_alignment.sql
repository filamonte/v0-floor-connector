alter table public.assessment_packages
  add column if not exists opportunity_id uuid references public.opportunities(id) on delete set null;

alter table public.assessment_packages
  alter column project_id drop not null;

alter table public.assessment_packages
  drop constraint if exists assessment_packages_owner_check;

alter table public.assessment_packages
  add constraint assessment_packages_owner_check
  check (opportunity_id is not null or project_id is not null);

create index if not exists assessment_packages_company_opportunity_idx
  on public.assessment_packages (company_id, opportunity_id)
  where opportunity_id is not null;

create index if not exists assessment_packages_opportunity_updated_at_idx
  on public.assessment_packages (opportunity_id, updated_at desc)
  where opportunity_id is not null;

alter table public.assessment_spaces
  add column if not exists opportunity_id uuid references public.opportunities(id) on delete set null;

alter table public.assessment_spaces
  alter column project_id drop not null;

create index if not exists assessment_spaces_company_opportunity_idx
  on public.assessment_spaces (company_id, opportunity_id)
  where opportunity_id is not null;

create or replace function public.validate_assessment_package_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_company_id uuid;
  opportunity_company_id uuid;
  opportunity_project_id uuid;
begin
  if new.project_id is null and new.opportunity_id is null then
    raise exception 'Assessment package must belong to an opportunity or project.';
  end if;

  if new.project_id is not null then
    select project.company_id
      into project_company_id
    from public.projects project
    where project.id = new.project_id;

    if project_company_id is null or project_company_id <> new.company_id then
      raise exception 'Assessment package project must belong to the same company.';
    end if;
  end if;

  if new.opportunity_id is not null then
    select opportunity.company_id, opportunity.project_id
      into opportunity_company_id, opportunity_project_id
    from public.opportunities opportunity
    where opportunity.id = new.opportunity_id;

    if opportunity_company_id is null or opportunity_company_id <> new.company_id then
      raise exception 'Assessment package opportunity must belong to the same company.';
    end if;

    if new.project_id is not null and opportunity_project_id is not null and opportunity_project_id <> new.project_id then
      raise exception 'Assessment package project must match the linked opportunity project when present.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.validate_assessment_space_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  package_company_id uuid;
  package_opportunity_id uuid;
  package_project_id uuid;
begin
  select
    assessment_package.company_id,
    assessment_package.opportunity_id,
    assessment_package.project_id
    into package_company_id, package_opportunity_id, package_project_id
  from public.assessment_packages assessment_package
  where assessment_package.id = new.assessment_package_id;

  if package_company_id is null then
    raise exception 'Assessment space must belong to an assessment package.';
  end if;

  if package_company_id <> new.company_id then
    raise exception 'Assessment space must belong to the same company as its assessment package.';
  end if;

  new.opportunity_id := package_opportunity_id;
  new.project_id := package_project_id;

  return new;
end;
$$;

comment on column public.assessment_packages.opportunity_id is 'Optional canonical opportunity that owns pre-sale assessment package context before a project exists.';
comment on column public.assessment_packages.project_id is 'Optional canonical project that carries assessment package context after work becomes operational.';
comment on column public.assessment_spaces.opportunity_id is 'Denormalized from the parent assessment package for tenant-safe opportunity assessment queries.';
comment on column public.assessment_spaces.project_id is 'Denormalized from the parent assessment package when the package is linked to an operational project.';
