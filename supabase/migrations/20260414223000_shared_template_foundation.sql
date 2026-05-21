do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'template_type'
  ) then
    create type public.template_type as enum (
      'estimate',
      'invoice',
      'contract'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'document_template_status'
  ) then
    create type public.document_template_status as enum (
      'active',
      'archived'
    );
  end if;
end
$$;

create table if not exists public.platform_template_seeds (
  id uuid primary key default extensions.gen_random_uuid(),
  template_type public.template_type not null,
  seed_key text not null unique,
  name text not null,
  description text,
  subject_template text,
  body_template text not null,
  schema_version integer not null default 1,
  is_default boolean not null default false,
  is_active boolean not null default true,
  merge_field_manifest jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists platform_template_seeds_type_idx
  on public.platform_template_seeds (template_type, is_active);

create table if not exists public.document_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  template_type public.template_type not null,
  source_seed_id uuid references public.platform_template_seeds(id) on delete set null,
  source_seed_key text,
  name text not null,
  description text,
  subject_template text,
  body_template text not null,
  schema_version integer not null default 1,
  status public.document_template_status not null default 'active',
  is_default boolean not null default false,
  merge_field_manifest jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists document_templates_company_id_id_unique_idx
  on public.document_templates (company_id, id);

create index if not exists document_templates_company_type_idx
  on public.document_templates (company_id, template_type, status);

create unique index if not exists document_templates_company_default_type_unique_idx
  on public.document_templates (company_id, template_type)
  where is_default = true and status = 'active';

create unique index if not exists document_templates_company_seed_unique_idx
  on public.document_templates (company_id, source_seed_id)
  where source_seed_id is not null;

alter table public.estimates
  add column if not exists template_id uuid;

alter table public.invoices
  add column if not exists template_id uuid;

create index if not exists estimates_template_id_idx
  on public.estimates (company_id, template_id);

create index if not exists invoices_template_id_idx
  on public.invoices (company_id, template_id);

alter table public.estimates
  drop constraint if exists estimates_template_company_fkey;
alter table public.estimates
  add constraint estimates_template_company_fkey
  foreign key (company_id, template_id)
  references public.document_templates(company_id, id)
  on delete set null;

alter table public.invoices
  drop constraint if exists invoices_template_company_fkey;
alter table public.invoices
  add constraint invoices_template_company_fkey
  foreign key (company_id, template_id)
  references public.document_templates(company_id, id)
  on delete set null;

create or replace function public.copy_platform_template_seed_to_company(
  target_seed_id uuid,
  target_company_id uuid,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_seed public.platform_template_seeds%rowtype;
  existing_template_id uuid;
  inserted_template_id uuid;
begin
  select *
  into selected_seed
  from public.platform_template_seeds
  where id = target_seed_id
    and is_active = true;

  if not found then
    return null;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_company_id::text || ':template-seed:' || target_seed_id::text, 0));

  select id
  into existing_template_id
  from public.document_templates
  where company_id = target_company_id
    and source_seed_id = target_seed_id
  limit 1;

  if existing_template_id is not null then
    return existing_template_id;
  end if;

  insert into public.document_templates (
    company_id,
    template_type,
    source_seed_id,
    source_seed_key,
    name,
    description,
    subject_template,
    body_template,
    schema_version,
    status,
    is_default,
    merge_field_manifest,
    metadata,
    created_by,
    updated_by
  ) values (
    target_company_id,
    selected_seed.template_type,
    selected_seed.id,
    selected_seed.seed_key,
    selected_seed.name,
    selected_seed.description,
    selected_seed.subject_template,
    selected_seed.body_template,
    selected_seed.schema_version,
    'active',
    selected_seed.is_default,
    selected_seed.merge_field_manifest,
    selected_seed.metadata,
    acting_user_id,
    acting_user_id
  )
  returning id into inserted_template_id;

  return inserted_template_id;
end;
$$;

create or replace function public.ensure_default_document_template(
  target_company_id uuid,
  target_template_type public.template_type,
  acting_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_template_id uuid;
  selected_seed_id uuid;
begin
  select id
  into existing_template_id
  from public.document_templates
  where company_id = target_company_id
    and template_type = target_template_type
    and is_default = true
    and status = 'active'
  limit 1;

  if existing_template_id is not null then
    return existing_template_id;
  end if;

  select id
  into selected_seed_id
  from public.platform_template_seeds
  where template_type = target_template_type
    and is_default = true
    and is_active = true
  order by created_at asc
  limit 1;

  if selected_seed_id is null then
    return null;
  end if;

  return public.copy_platform_template_seed_to_company(
    selected_seed_id,
    target_company_id,
    acting_user_id
  );
end;
$$;

drop trigger if exists set_document_templates_updated_at on public.document_templates;
create trigger set_document_templates_updated_at
before update on public.document_templates
for each row
execute function public.set_updated_at();

drop trigger if exists set_platform_template_seeds_updated_at on public.platform_template_seeds;
create trigger set_platform_template_seeds_updated_at
before update on public.platform_template_seeds
for each row
execute function public.set_updated_at();

alter table public.platform_template_seeds enable row level security;
alter table public.platform_template_seeds force row level security;

drop policy if exists platform_template_seeds_select_authenticated on public.platform_template_seeds;
create policy platform_template_seeds_select_authenticated
on public.platform_template_seeds
for select
to authenticated
using (is_active = true);

alter table public.document_templates enable row level security;
alter table public.document_templates force row level security;

drop policy if exists document_templates_select_by_membership on public.document_templates;
create policy document_templates_select_by_membership
on public.document_templates
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists document_templates_insert_by_membership on public.document_templates;
create policy document_templates_insert_by_membership
on public.document_templates
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists document_templates_update_by_membership on public.document_templates;
create policy document_templates_update_by_membership
on public.document_templates
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists document_templates_delete_by_membership on public.document_templates;
create policy document_templates_delete_by_membership
on public.document_templates
for delete
to authenticated
using ((select public.is_active_company_member(company_id)));

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
values
  (
    'estimate',
    'default-estimate-v1',
    'Default Estimate Template',
    'Platform-seeded baseline estimate output for new contractor organizations.',
    'Estimate {{estimate.referenceNumber}} for {{project.name}}',
    'Estimate {{estimate.referenceNumber}}\n\nPrepared for {{customer.name}}\nProject: {{project.name}}\nOrganization: {{organization.displayName}}\n\nSubtotal: {{estimate.subtotalAmount}}\nTax: {{estimate.taxAmount}}\nDiscount: {{estimate.discountAmount}}\nTotal: {{estimate.totalAmount}}\n\nNotes:\n{{estimate.notes}}',
    1,
    true,
    true,
    '["organization.displayName","organization.legalName","customer.name","customer.companyName","project.name","estimate.referenceNumber","estimate.subtotalAmount","estimate.taxAmount","estimate.discountAmount","estimate.totalAmount","estimate.notes"]'::jsonb,
    '{"channel":"document","workflow":"estimate"}'::jsonb
  ),
  (
    'invoice',
    'default-invoice-v1',
    'Default Invoice Template',
    'Platform-seeded baseline invoice output for new contractor organizations.',
    'Invoice {{invoice.referenceNumber}} for {{project.name}}',
    'Invoice {{invoice.referenceNumber}}\n\nBill To: {{customer.name}}\nProject: {{project.name}}\nOrganization: {{organization.displayName}}\n\nSubtotal: {{invoice.subtotalAmount}}\nTax: {{invoice.taxAmount}}\nDiscount: {{invoice.discountAmount}}\nRetainage Held: {{invoice.retainageHeldAmount}}\nTotal: {{invoice.totalAmount}}\nBalance Due: {{invoice.balanceDueAmount}}\n\nNotes:\n{{invoice.notes}}',
    1,
    true,
    true,
    '["organization.displayName","organization.legalName","customer.name","customer.companyName","project.name","invoice.referenceNumber","invoice.subtotalAmount","invoice.taxAmount","invoice.discountAmount","invoice.retainageHeldAmount","invoice.totalAmount","invoice.balanceDueAmount","invoice.notes"]'::jsonb,
    '{"channel":"document","workflow":"invoice"}'::jsonb
  ),
  (
    'contract',
    'default-contract-v1',
    'Default Contract Template',
    'Platform-seeded baseline contract output generated from approved estimates and projects.',
    'Contract for {{project.name}}',
    'Contract Draft\n\nOrganization: {{organization.displayName}}\nCustomer: {{customer.name}}\nProject: {{project.name}}\nSource Estimate: {{estimate.referenceNumber}}\n\nApproved Scope Total: {{estimate.totalAmount}}\n\nThis contract is generated from the approved estimate and project record.\n\nNotes:\n{{estimate.notes}}',
    1,
    true,
    true,
    '["organization.displayName","organization.legalName","customer.name","customer.companyName","project.name","estimate.referenceNumber","estimate.totalAmount","estimate.notes","contract.generatedAt"]'::jsonb,
    '{"channel":"document","workflow":"contract","source":"approved_estimate"}'::jsonb
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

comment on table public.platform_template_seeds is 'Platform-managed immutable seed definitions for reusable document templates. Organizations receive editable copies so tenant customizations never mutate shared platform defaults.';
comment on table public.document_templates is 'Organization-owned reusable document templates shared across estimate, invoice, and contract workflows. This is the canonical template system and should not be forked per module.';
comment on column public.document_templates.source_seed_id is 'Optional link back to the platform seed the organization copy originated from. Organization templates remain editable copies even when this source reference exists.';
comment on column public.document_templates.merge_field_manifest is 'Developer-facing list of shared merge-data paths intended for the template. Keep merge fields canonical across organization, customer, project, estimate, invoice, and contract contexts.';
comment on function public.copy_platform_template_seed_to_company(uuid, uuid, uuid) is 'Creates an organization-owned copy of a platform template seed. Copies are tenant editable and intentionally do not stay coupled to future platform seed edits.';
comment on function public.ensure_default_document_template(uuid, public.template_type, uuid) is 'Ensures an organization has a default template for the requested type by copying the active platform default seed when needed.';
comment on column public.estimates.template_id is 'Optional shared document template reference for estimate output. Uses the canonical document_templates table rather than a module-specific template model.';
comment on column public.invoices.template_id is 'Optional shared document template reference for invoice output. Future contracts should use the same document_templates system.';
