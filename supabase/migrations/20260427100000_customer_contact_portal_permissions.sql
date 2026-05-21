create unique index if not exists customer_contacts_company_id_id_unique_idx
  on public.customer_contacts (company_id, id);

create table if not exists public.customer_contact_portal_permissions (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_contact_id uuid not null,
  portal_access_grant_id uuid null,
  can_view_estimates boolean not null default true,
  can_approve_estimates boolean not null default true,
  can_sign_contracts boolean not null default true,
  can_approve_change_orders boolean not null default true,
  can_view_pay_invoices boolean not null default true,
  can_request_quotes boolean not null default true,
  management_source text not null default 'system_default',
  last_managed_by_user_id uuid null references public.users(id) on delete set null,
  last_managed_by_customer_contact_id uuid null,
  last_override_by_user_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint customer_contact_portal_permissions_company_customer_contact_fkey
    foreign key (company_id, customer_contact_id)
    references public.customer_contacts(company_id, id)
    on delete cascade,
  constraint customer_contact_portal_permissions_company_portal_grant_fkey
    foreign key (company_id, portal_access_grant_id)
    references public.portal_access_grants(company_id, id)
    on delete set null,
  constraint customer_contact_portal_permissions_company_manager_contact_fkey
    foreign key (company_id, last_managed_by_customer_contact_id)
    references public.customer_contacts(company_id, id)
    on delete set null,
  constraint customer_contact_portal_permissions_company_customer_contact_unique
    unique (company_id, customer_contact_id),
  constraint customer_contact_portal_permissions_management_source_check
    check (
      management_source in ('system_default', 'contractor_admin', 'main_contact', 'migration')
    )
);

create index if not exists customer_contact_portal_permissions_company_contact_idx
  on public.customer_contact_portal_permissions (company_id, customer_contact_id);

create index if not exists customer_contact_portal_permissions_company_grant_idx
  on public.customer_contact_portal_permissions (company_id, portal_access_grant_id)
  where portal_access_grant_id is not null;

drop trigger if exists set_customer_contact_portal_permissions_updated_at on public.customer_contact_portal_permissions;

create trigger set_customer_contact_portal_permissions_updated_at
before update on public.customer_contact_portal_permissions
for each row
execute function public.set_updated_at();

alter table public.customer_contact_portal_permissions enable row level security;
alter table public.customer_contact_portal_permissions force row level security;

drop policy if exists customer_contact_portal_permissions_select_by_membership on public.customer_contact_portal_permissions;
create policy customer_contact_portal_permissions_select_by_membership
on public.customer_contact_portal_permissions
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists customer_contact_portal_permissions_insert_by_membership on public.customer_contact_portal_permissions;
create policy customer_contact_portal_permissions_insert_by_membership
on public.customer_contact_portal_permissions
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists customer_contact_portal_permissions_update_by_membership on public.customer_contact_portal_permissions;
create policy customer_contact_portal_permissions_update_by_membership
on public.customer_contact_portal_permissions
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

insert into public.customer_contact_portal_permissions (
  company_id,
  customer_contact_id,
  portal_access_grant_id,
  can_view_estimates,
  can_approve_estimates,
  can_sign_contracts,
  can_approve_change_orders,
  can_view_pay_invoices,
  can_request_quotes,
  management_source
)
select
  grants.company_id,
  grants.customer_contact_id,
  grants.id,
  true,
  true,
  true,
  true,
  true,
  true,
  'migration'
from public.portal_access_grants as grants
where grants.customer_contact_id is not null
on conflict (company_id, customer_contact_id) do update
set portal_access_grant_id = excluded.portal_access_grant_id;

comment on table public.customer_contact_portal_permissions is 'Stores tenant-scoped per-contact portal permissions for canonical customer_contacts without changing current portal action enforcement.';
comment on column public.customer_contact_portal_permissions.customer_contact_id is 'Canonical customer_contacts row receiving stored portal permissions.';
comment on column public.customer_contact_portal_permissions.portal_access_grant_id is 'Optional traceability link to the current linked portal access grant for this customer contact.';
comment on column public.customer_contact_portal_permissions.can_view_pay_invoices is 'Stored future-readiness authority for invoice visibility and payment initiation on linked customer contacts.';
