create unique index if not exists customer_contacts_company_customer_id_id_unique_idx
  on public.customer_contacts (company_id, customer_id, id);

alter table public.portal_access_grants
  add column if not exists customer_contact_id uuid;

create index if not exists portal_access_grants_company_customer_contact_idx
  on public.portal_access_grants (company_id, customer_contact_id)
  where customer_contact_id is not null;

alter table public.portal_access_grants
  drop constraint if exists portal_access_grants_company_customer_contact_fkey;

alter table public.portal_access_grants
  add constraint portal_access_grants_company_customer_contact_fkey
  foreign key (company_id, customer_id, customer_contact_id)
  references public.customer_contacts(company_id, customer_id, id)
  on delete set null;

comment on column public.portal_access_grants.customer_contact_id is 'Optional link to the canonical customer_contacts relationship row represented by this portal grant. Null preserves legacy customer-level portal grants.';
