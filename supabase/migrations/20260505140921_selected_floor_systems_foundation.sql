create unique index if not exists opportunities_company_id_id_unique_idx
  on public.opportunities (company_id, id);

create unique index if not exists customers_company_id_id_unique_idx
  on public.customers (company_id, id);

create unique index if not exists projects_company_id_id_unique_idx
  on public.projects (company_id, id);

create unique index if not exists estimates_company_id_id_unique_idx
  on public.estimates (company_id, id);

create unique index if not exists contracts_company_id_id_unique_idx
  on public.contracts (company_id, id);

create unique index if not exists jobs_company_id_id_unique_idx
  on public.jobs (company_id, id);

create unique index if not exists floor_system_templates_company_id_id_unique_idx
  on public.floor_system_templates (company_id, id);

create unique index if not exists finish_products_company_id_id_unique_idx
  on public.finish_products (company_id, id);

create table if not exists public.selected_floor_systems (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  floor_system_template_id uuid,
  finish_product_id uuid,
  opportunity_id uuid,
  customer_id uuid,
  project_id uuid,
  estimate_id uuid,
  contract_id uuid,
  job_id uuid,
  source text not null default 'manual',
  status text not null default 'draft',
  is_primary boolean not null default false,
  area_label text,
  area_type text not null default 'whole_project',
  phase_label text,
  option_label text,
  sort_order integer not null default 0,
  estimated_area_sqft numeric(12, 2),
  estimated_linear_ft numeric(12, 2),
  quantity_notes text,
  customer_facing_description text,
  internal_notes text,
  spec_completeness_status text not null default 'incomplete',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint selected_floor_systems_template_company_fkey
    foreign key (company_id, floor_system_template_id)
    references public.floor_system_templates(company_id, id)
    on delete set null (floor_system_template_id),
  constraint selected_floor_systems_finish_product_company_fkey
    foreign key (company_id, finish_product_id)
    references public.finish_products(company_id, id)
    on delete set null (finish_product_id),
  constraint selected_floor_systems_opportunity_company_fkey
    foreign key (company_id, opportunity_id)
    references public.opportunities(company_id, id)
    on delete set null (opportunity_id),
  constraint selected_floor_systems_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete set null (customer_id),
  constraint selected_floor_systems_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete set null (project_id),
  constraint selected_floor_systems_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete set null (estimate_id),
  constraint selected_floor_systems_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete set null (contract_id),
  constraint selected_floor_systems_job_company_fkey
    foreign key (company_id, job_id)
    references public.jobs(company_id, id)
    on delete set null (job_id),
  constraint selected_floor_systems_source_check
    check (
      source in (
        'manual',
        'lead_intake',
        'site_assessment',
        'estimate_builder',
        'visualizer_handoff',
        'other'
      )
    ),
  constraint selected_floor_systems_status_check
    check (
      status in (
        'draft',
        'proposed',
        'selected',
        'locked',
        'superseded',
        'amended',
        'void',
        'retracted',
        'rejected'
      )
    ),
  constraint selected_floor_systems_area_type_check
    check (
      area_type in (
        'room',
        'zone',
        'phase',
        'option',
        'alternate',
        'whole_project',
        'other'
      )
    ),
  constraint selected_floor_systems_spec_completeness_status_check
    check (
      spec_completeness_status in (
        'incomplete',
        'ready_for_proposal',
        'customer_facing',
        'locked'
      )
    ),
  constraint selected_floor_systems_sort_order_check
    check (sort_order >= 0),
  constraint selected_floor_systems_estimated_area_sqft_check
    check (estimated_area_sqft is null or estimated_area_sqft >= 0),
  constraint selected_floor_systems_estimated_linear_ft_check
    check (estimated_linear_ft is null or estimated_linear_ft >= 0),
  constraint selected_floor_systems_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint selected_floor_systems_area_label_not_blank_check
    check (area_label is null or char_length(btrim(area_label)) > 0),
  constraint selected_floor_systems_phase_label_not_blank_check
    check (phase_label is null or char_length(btrim(phase_label)) > 0),
  constraint selected_floor_systems_option_label_not_blank_check
    check (option_label is null or char_length(btrim(option_label)) > 0),
  constraint selected_floor_systems_quantity_notes_not_blank_check
    check (quantity_notes is null or char_length(btrim(quantity_notes)) > 0),
  constraint selected_floor_systems_customer_description_not_blank_check
    check (
      customer_facing_description is null
      or char_length(btrim(customer_facing_description)) > 0
    ),
  constraint selected_floor_systems_internal_notes_not_blank_check
    check (internal_notes is null or char_length(btrim(internal_notes)) > 0),
  constraint selected_floor_systems_workflow_anchor_check
    check (
      opportunity_id is not null
      or customer_id is not null
      or project_id is not null
      or estimate_id is not null
      or contract_id is not null
      or job_id is not null
    )
);

create unique index if not exists selected_floor_systems_company_id_id_unique_idx
  on public.selected_floor_systems (company_id, id);

create unique index if not exists selected_floor_systems_primary_project_unique_idx
  on public.selected_floor_systems (company_id, project_id)
  where is_primary = true and project_id is not null;

create index if not exists selected_floor_systems_company_project_status_idx
  on public.selected_floor_systems (company_id, project_id, status)
  where project_id is not null;

create index if not exists selected_floor_systems_company_opportunity_idx
  on public.selected_floor_systems (company_id, opportunity_id)
  where opportunity_id is not null;

create index if not exists selected_floor_systems_company_customer_idx
  on public.selected_floor_systems (company_id, customer_id)
  where customer_id is not null;

create index if not exists selected_floor_systems_company_estimate_idx
  on public.selected_floor_systems (company_id, estimate_id)
  where estimate_id is not null;

create index if not exists selected_floor_systems_company_contract_idx
  on public.selected_floor_systems (company_id, contract_id)
  where contract_id is not null;

create index if not exists selected_floor_systems_company_job_idx
  on public.selected_floor_systems (company_id, job_id)
  where job_id is not null;

create index if not exists selected_floor_systems_company_template_idx
  on public.selected_floor_systems (company_id, floor_system_template_id)
  where floor_system_template_id is not null;

create index if not exists selected_floor_systems_company_finish_product_idx
  on public.selected_floor_systems (company_id, finish_product_id)
  where finish_product_id is not null;

create index if not exists selected_floor_systems_company_source_status_idx
  on public.selected_floor_systems (company_id, source, status);

drop trigger if exists set_selected_floor_systems_updated_at on public.selected_floor_systems;
create trigger set_selected_floor_systems_updated_at
before update on public.selected_floor_systems
for each row
execute function public.set_updated_at();

alter table public.selected_floor_systems enable row level security;
alter table public.selected_floor_systems force row level security;

drop policy if exists selected_floor_systems_select_by_membership on public.selected_floor_systems;
create policy selected_floor_systems_select_by_membership
on public.selected_floor_systems
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists selected_floor_systems_insert_by_membership on public.selected_floor_systems;
create policy selected_floor_systems_insert_by_membership
on public.selected_floor_systems
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists selected_floor_systems_update_by_membership on public.selected_floor_systems;
create policy selected_floor_systems_update_by_membership
on public.selected_floor_systems
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.selected_floor_systems is 'Tenant-owned selected floor system/spec foundation for real workflow records. No public/pre-auth rows, public visualizer handoff, snapshots, files, delivery proof, or activity timeline behavior are added in this slice.';
comment on column public.selected_floor_systems.company_id is 'Required tenant owner. This table does not store nullable company ownership or public/pre-auth selections.';
comment on column public.selected_floor_systems.floor_system_template_id is 'Optional tenant-owned floor system template reference; same-company enforced when present.';
comment on column public.selected_floor_systems.finish_product_id is 'Optional tenant-owned finish/spec product reference; same-company enforced when present.';
comment on column public.selected_floor_systems.source is 'Source of the tenant-owned selection. visualizer_handoff is reserved for a future approved server-side claim flow.';
comment on column public.selected_floor_systems.status is 'Selection lifecycle status for draft/proposed/selected/locked/superseded/amended/void/retracted/rejected states.';
comment on column public.selected_floor_systems.is_primary is 'At most one selected floor system per company/project can be primary when project_id is present.';
comment on column public.selected_floor_systems.metadata is 'Extensible selected-system metadata as a JSON object; not snapshot truth, file proof, or provider payload storage.';
