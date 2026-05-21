create table if not exists public.warranty_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  service_ticket_id uuid references public.service_tickets(id) on delete set null,
  document_template_id uuid,
  status text not null default 'draft',
  title text not null,
  warranty_start_date date,
  warranty_end_date date,
  warranty_basis text,
  rendered_content text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  issued_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint warranty_documents_template_company_fkey
    foreign key (company_id, document_template_id)
    references public.document_templates(company_id, id)
    on delete set null,
  constraint warranty_documents_status_check check (
    status in ('draft', 'issued', 'sent', 'viewed', 'signed', 'void')
  ),
  constraint warranty_documents_title_check check (length(btrim(title)) > 0),
  constraint warranty_documents_warranty_date_order_check check (
    warranty_start_date is null or warranty_end_date is null or warranty_end_date >= warranty_start_date
  ),
  constraint warranty_documents_issued_at_check check (
    status not in ('issued', 'sent', 'viewed', 'signed') or issued_at is not null
  ),
  constraint warranty_documents_voided_at_check check (
    status <> 'void' or voided_at is not null
  )
);

create index if not exists warranty_documents_company_id_idx
  on public.warranty_documents (company_id);

create index if not exists warranty_documents_company_status_idx
  on public.warranty_documents (company_id, status);

create index if not exists warranty_documents_company_customer_idx
  on public.warranty_documents (company_id, customer_id);

create index if not exists warranty_documents_company_project_idx
  on public.warranty_documents (company_id, project_id)
  where project_id is not null;

create index if not exists warranty_documents_company_job_idx
  on public.warranty_documents (company_id, job_id)
  where job_id is not null;

create index if not exists warranty_documents_company_service_ticket_idx
  on public.warranty_documents (company_id, service_ticket_id)
  where service_ticket_id is not null;

create or replace function public.validate_warranty_document_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_company_id uuid;
  project_company_id uuid;
  project_customer_id uuid;
  job_company_id uuid;
  job_project_id uuid;
  ticket_company_id uuid;
  ticket_customer_id uuid;
  ticket_project_id uuid;
  ticket_job_id uuid;
  template_company_id uuid;
  template_type public.template_type;
begin
  select customer.company_id
    into customer_company_id
  from public.customers customer
  where customer.id = new.customer_id;

  if customer_company_id is null or customer_company_id <> new.company_id then
    raise exception 'Warranty document customer must belong to the same company.';
  end if;

  if new.service_ticket_id is not null then
    select ticket.company_id, ticket.customer_id, ticket.project_id, ticket.job_id
      into ticket_company_id, ticket_customer_id, ticket_project_id, ticket_job_id
    from public.service_tickets ticket
    where ticket.id = new.service_ticket_id;

    if ticket_company_id is null or ticket_company_id <> new.company_id then
      raise exception 'Warranty document service ticket must belong to the same company.';
    end if;

    if ticket_customer_id <> new.customer_id then
      raise exception 'Warranty document service ticket must belong to the selected customer.';
    end if;

    if new.project_id is null then
      new.project_id := ticket_project_id;
    elsif ticket_project_id is not null and ticket_project_id <> new.project_id then
      raise exception 'Warranty document project must match the service ticket project.';
    end if;

    if new.job_id is null then
      new.job_id := ticket_job_id;
    elsif ticket_job_id is not null and ticket_job_id <> new.job_id then
      raise exception 'Warranty document job must match the service ticket job.';
    end if;
  end if;

  if new.job_id is not null then
    select job.company_id, job.project_id
      into job_company_id, job_project_id
    from public.jobs job
    where job.id = new.job_id;

    if job_company_id is null or job_company_id <> new.company_id then
      raise exception 'Warranty document job must belong to the same company.';
    end if;

    if new.project_id is not null and job_project_id <> new.project_id then
      raise exception 'Warranty document job must belong to the selected project.';
    end if;

    if new.project_id is null then
      new.project_id := job_project_id;
    end if;
  end if;

  if new.project_id is not null then
    select project.company_id, project.customer_id
      into project_company_id, project_customer_id
    from public.projects project
    where project.id = new.project_id;

    if project_company_id is null or project_company_id <> new.company_id then
      raise exception 'Warranty document project must belong to the same company.';
    end if;

    if project_customer_id <> new.customer_id then
      raise exception 'Warranty document project must belong to the selected customer.';
    end if;
  end if;

  if new.document_template_id is not null then
    select template.company_id, template.template_type
      into template_company_id, template_type
    from public.document_templates template
    where template.id = new.document_template_id;

    if template_company_id is null or template_company_id <> new.company_id then
      raise exception 'Warranty document template must belong to the same company.';
    end if;

    if template_type <> 'warranty'::public.template_type then
      raise exception 'Warranty document template must be a warranty template.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists set_warranty_documents_updated_at on public.warranty_documents;
create trigger set_warranty_documents_updated_at
before update on public.warranty_documents
for each row
execute function public.set_updated_at();

drop trigger if exists validate_warranty_document_relationships_trigger
  on public.warranty_documents;
create trigger validate_warranty_document_relationships_trigger
before insert or update on public.warranty_documents
for each row
execute function public.validate_warranty_document_relationships();

alter table public.warranty_documents enable row level security;
alter table public.warranty_documents force row level security;

drop policy if exists warranty_documents_select_by_membership
  on public.warranty_documents;
create policy warranty_documents_select_by_membership
on public.warranty_documents
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists warranty_documents_insert_by_manager
  on public.warranty_documents;
create policy warranty_documents_insert_by_manager
on public.warranty_documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = warranty_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

drop policy if exists warranty_documents_update_by_manager
  on public.warranty_documents;
create policy warranty_documents_update_by_manager
on public.warranty_documents
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = warranty_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = warranty_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

insert into public.platform_template_seeds (
  template_type,
  seed_key,
  name,
  description,
  subject_template,
  body_template,
  schema_version,
  is_default,
  is_active,
  merge_field_manifest,
  metadata
)
values (
  'warranty',
  'default-specialty-flooring-warranty-v1',
  'Default Specialty Flooring Warranty',
  'Platform-seeded warranty template for specialty flooring closeout and service follow-up.',
  'Warranty for {{project.name}}',
  'Limited Warranty\n\nContractor: {{organization.displayName}}\nCustomer: {{customer.name}}\nProject: {{project.name}}\nJob: {{job.label}}\nService Ticket: {{serviceTicket.title}}\n\nWarranty Period: {{warranty.startDate}} to {{warranty.endDate}}\n\nWarranty Basis:\n{{warranty.basis}}\n\nCoverage Summary:\nThis warranty applies to the completed flooring work described by the linked project, job, and service/warranty record. Coverage depends on the written scope, substrate conditions, maintenance expectations, and exclusions recorded by the contractor.\n\nCustomer Acknowledgement:\nSignature workflow is planned for a future slice. This print/save view is generated from the canonical warranty document record.',
  1,
  true,
  true,
  '["organization.displayName","organization.legalName","customer.name","project.name","job.label","serviceTicket.title","serviceTicket.status","warranty.startDate","warranty.endDate","warranty.basis","warranty.documentTitle","warranty.status","signatures.customerPlaceholder","signatures.contractorPlaceholder"]'::jsonb,
  '{"channel":"document","workflow":"warranty","source":"service_ticket"}'::jsonb
)
on conflict (seed_key)
do update set
  name = excluded.name,
  description = excluded.description,
  subject_template = excluded.subject_template,
  body_template = excluded.body_template,
  schema_version = excluded.schema_version,
  is_default = excluded.is_default,
  is_active = excluded.is_active,
  merge_field_manifest = excluded.merge_field_manifest,
  metadata = excluded.metadata,
  updated_at = timezone('utc', now());

comment on table public.warranty_documents is
  'Canonical tenant-scoped warranty documents generated from warranty templates and linked customer/project/job/service-ticket context. Print/PDF output is rendering evidence, not detached document truth.';
comment on column public.warranty_documents.rendered_content is
  'Rendered customer-facing warranty HTML/text generated from the selected warranty document template and canonical merge data.';
comment on column public.warranty_documents.service_ticket_id is
  'Optional link to the internal service/warranty ticket that supplied warranty context.';
comment on column public.warranty_documents.document_template_id is
  'Optional organization-owned warranty document template used to render this warranty document.';
