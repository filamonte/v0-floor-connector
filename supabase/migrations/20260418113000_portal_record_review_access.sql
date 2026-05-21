do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'portal_record_view_subject_type'
  ) then
    create type public.portal_record_view_subject_type as enum (
      'project',
      'estimate',
      'contract',
      'invoice'
    );
  end if;
end
$$;

create table if not exists public.portal_record_views (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  portal_user_id uuid not null references public.users(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  subject_type public.portal_record_view_subject_type not null,
  subject_id uuid not null,
  viewed_at timestamptz not null default timezone('utc', now()),
  constraint portal_record_views_company_customer_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint portal_record_views_company_project_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade
);

create index if not exists portal_record_views_company_user_idx
  on public.portal_record_views (company_id, portal_user_id, viewed_at desc);

create index if not exists portal_record_views_company_subject_idx
  on public.portal_record_views (company_id, subject_type, subject_id, viewed_at desc);

create index if not exists portal_record_views_project_idx
  on public.portal_record_views (company_id, project_id, viewed_at desc);

alter table public.portal_record_views enable row level security;
alter table public.portal_record_views force row level security;

drop policy if exists portal_record_views_select_by_scope on public.portal_record_views;
create policy portal_record_views_select_by_scope
on public.portal_record_views
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or portal_user_id = (select auth.uid())
);

drop policy if exists portal_record_views_insert_by_scope on public.portal_record_views;
create policy portal_record_views_insert_by_scope
on public.portal_record_views
for insert
to authenticated
with check (
  portal_user_id = (select auth.uid())
  and (select public.has_active_portal_customer_access(company_id, customer_id))
  and (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists customers_select_by_membership on public.customers;
create policy customers_select_by_membership
on public.customers
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_customer_access(company_id, id))
);

drop policy if exists projects_select_by_membership on public.projects;
create policy projects_select_by_membership
on public.projects
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, id))
);

drop policy if exists estimates_select_by_membership on public.estimates;
create policy estimates_select_by_membership
on public.estimates
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists estimate_line_items_select_by_membership on public.estimate_line_items;
create policy estimate_line_items_select_by_membership
on public.estimate_line_items
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or exists (
    select 1
    from public.estimates estimate_record
    where estimate_record.company_id = estimate_line_items.company_id
      and estimate_record.id = estimate_line_items.estimate_id
      and (select public.has_active_portal_project_access(
        estimate_record.company_id,
        estimate_record.project_id
      ))
  )
);

drop policy if exists contracts_select_by_membership on public.contracts;
create policy contracts_select_by_membership
on public.contracts
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists invoices_select_by_membership on public.invoices;
create policy invoices_select_by_membership
on public.invoices
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists invoice_line_items_select_by_membership on public.invoice_line_items;
create policy invoice_line_items_select_by_membership
on public.invoice_line_items
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or exists (
    select 1
    from public.invoices invoice_record
    where invoice_record.company_id = invoice_line_items.company_id
      and invoice_record.id = invoice_line_items.invoice_id
      and (select public.has_active_portal_project_access(
        invoice_record.company_id,
        invoice_record.project_id
      ))
  )
);

drop policy if exists payments_select_by_membership on public.payments;
create policy payments_select_by_membership
on public.payments
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or exists (
    select 1
    from public.invoices invoice_record
    where invoice_record.company_id = payments.company_id
      and invoice_record.id = payments.invoice_id
      and (select public.has_active_portal_project_access(
        invoice_record.company_id,
        invoice_record.project_id
      ))
  )
);

comment on table public.portal_record_views is 'Lightweight audit trail of canonical customer-facing record views inside the portal foundation.';
comment on column public.portal_record_views.portal_user_id is 'Authenticated canonical user who viewed the customer-facing portal record.';
comment on column public.portal_record_views.subject_type is 'Canonical record category viewed in the portal: project, estimate, contract, or invoice.';
comment on column public.portal_record_views.subject_id is 'Canonical shared record id viewed in the portal.';
