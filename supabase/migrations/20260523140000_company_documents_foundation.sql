create table if not exists public.company_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  category text not null,
  document_kind text not null,
  status text not null default 'draft',
  audience text not null default 'internal',
  description text,
  body text,
  effective_date date,
  expires_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint company_documents_title_check check (length(btrim(title)) > 0),
  constraint company_documents_document_kind_check check (length(btrim(document_kind)) > 0),
  constraint company_documents_category_check check (
    category in (
      'agreement',
      'employee_document',
      'subcontractor_document',
      'safety_compliance',
      'operations_sop',
      'training',
      'customer_service',
      'warranty_service',
      'other'
    )
  ),
  constraint company_documents_status_check check (
    status in ('draft', 'active', 'archived')
  ),
  constraint company_documents_audience_check check (
    audience in (
      'internal',
      'employee',
      'subcontractor',
      'customer_service',
      'other'
    )
  ),
  constraint company_documents_archived_at_check check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  )
);

create index if not exists company_documents_company_id_idx
  on public.company_documents (company_id);

create index if not exists company_documents_company_status_idx
  on public.company_documents (company_id, status);

create index if not exists company_documents_company_category_idx
  on public.company_documents (company_id, category);

create index if not exists company_documents_company_updated_at_idx
  on public.company_documents (company_id, updated_at desc);

create index if not exists company_documents_company_archived_at_idx
  on public.company_documents (company_id, archived_at)
  where archived_at is not null;

drop trigger if exists set_company_documents_updated_at on public.company_documents;
create trigger set_company_documents_updated_at
before update on public.company_documents
for each row
execute function public.set_updated_at();

alter table public.company_documents enable row level security;
alter table public.company_documents force row level security;

drop policy if exists company_documents_select_by_membership
  on public.company_documents;
create policy company_documents_select_by_membership
on public.company_documents
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists company_documents_insert_by_manager
  on public.company_documents;
create policy company_documents_insert_by_manager
on public.company_documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = company_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

drop policy if exists company_documents_update_by_manager
  on public.company_documents;
create policy company_documents_update_by_manager
on public.company_documents
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = company_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = company_documents.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

comment on table public.company_documents is
  'Tenant-owned company document library records for contractor business administration documents. This table stores metadata and editable content only; it does not create provider sends, signatures, portal distribution, public links, or file storage.';
comment on column public.company_documents.company_id is
  'Organization scope using the existing companies/company_memberships tenant model.';
comment on column public.company_documents.body is
  'Optional editable document content for Phase 1A. This is not generated legal content and is not rendered through provider, signature, or portal workflows.';
