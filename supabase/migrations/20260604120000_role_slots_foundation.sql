create unique index if not exists people_company_id_id_unique_idx
  on public.people (company_id, id);

alter table public.opportunities
  add column if not exists onsite_rep_person_id uuid,
  add column if not exists relationship_owner_person_id uuid;

alter table public.projects
  add column if not exists onsite_rep_person_id uuid,
  add column if not exists relationship_owner_person_id uuid,
  add column if not exists follow_up_owner_person_id uuid,
  add column if not exists sales_credit_owner_person_id uuid;

alter table public.estimates
  add column if not exists estimate_writer_person_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'opportunities_onsite_rep_person_company_fkey'
  ) then
    alter table public.opportunities
      add constraint opportunities_onsite_rep_person_company_fkey
      foreign key (company_id, onsite_rep_person_id)
      references public.people(company_id, id)
      on delete set null (onsite_rep_person_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'opportunities_relationship_owner_person_company_fkey'
  ) then
    alter table public.opportunities
      add constraint opportunities_relationship_owner_person_company_fkey
      foreign key (company_id, relationship_owner_person_id)
      references public.people(company_id, id)
      on delete set null (relationship_owner_person_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_onsite_rep_person_company_fkey'
  ) then
    alter table public.projects
      add constraint projects_onsite_rep_person_company_fkey
      foreign key (company_id, onsite_rep_person_id)
      references public.people(company_id, id)
      on delete set null (onsite_rep_person_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_relationship_owner_person_company_fkey'
  ) then
    alter table public.projects
      add constraint projects_relationship_owner_person_company_fkey
      foreign key (company_id, relationship_owner_person_id)
      references public.people(company_id, id)
      on delete set null (relationship_owner_person_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_follow_up_owner_person_company_fkey'
  ) then
    alter table public.projects
      add constraint projects_follow_up_owner_person_company_fkey
      foreign key (company_id, follow_up_owner_person_id)
      references public.people(company_id, id)
      on delete set null (follow_up_owner_person_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_sales_credit_owner_person_company_fkey'
  ) then
    alter table public.projects
      add constraint projects_sales_credit_owner_person_company_fkey
      foreign key (company_id, sales_credit_owner_person_id)
      references public.people(company_id, id)
      on delete set null (sales_credit_owner_person_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'estimates_estimate_writer_person_company_fkey'
  ) then
    alter table public.estimates
      add constraint estimates_estimate_writer_person_company_fkey
      foreign key (company_id, estimate_writer_person_id)
      references public.people(company_id, id)
      on delete set null (estimate_writer_person_id);
  end if;
end $$;

create index if not exists opportunities_onsite_rep_person_idx
  on public.opportunities (company_id, onsite_rep_person_id)
  where onsite_rep_person_id is not null;

create index if not exists opportunities_relationship_owner_person_idx
  on public.opportunities (company_id, relationship_owner_person_id)
  where relationship_owner_person_id is not null;

create index if not exists projects_onsite_rep_person_idx
  on public.projects (company_id, onsite_rep_person_id)
  where onsite_rep_person_id is not null;

create index if not exists projects_relationship_owner_person_idx
  on public.projects (company_id, relationship_owner_person_id)
  where relationship_owner_person_id is not null;

create index if not exists projects_follow_up_owner_person_idx
  on public.projects (company_id, follow_up_owner_person_id)
  where follow_up_owner_person_id is not null;

create index if not exists projects_sales_credit_owner_person_idx
  on public.projects (company_id, sales_credit_owner_person_id)
  where sales_credit_owner_person_id is not null;

create index if not exists estimates_estimate_writer_person_idx
  on public.estimates (company_id, estimate_writer_person_id)
  where estimate_writer_person_id is not null;

comment on column public.opportunities.onsite_rep_person_id is
  'Internal ownership metadata only: person who performed site assessment or measurement visit.';
comment on column public.opportunities.relationship_owner_person_id is
  'Internal ownership metadata only: person who owns the customer relationship for this opportunity.';
comment on column public.projects.onsite_rep_person_id is
  'Internal ownership metadata only: person who performed site assessment or measurement visit.';
comment on column public.projects.relationship_owner_person_id is
  'Internal ownership metadata only: person who owns the customer relationship for this project.';
comment on column public.projects.follow_up_owner_person_id is
  'Internal ownership metadata only: person responsible for customer follow-up.';
comment on column public.projects.sales_credit_owner_person_id is
  'Internal attribution metadata only; does not calculate commissions, payroll, payouts, or ledger entries.';
comment on column public.estimates.estimate_writer_person_id is
  'Internal ownership metadata only: person primarily responsible for estimate creation.';
