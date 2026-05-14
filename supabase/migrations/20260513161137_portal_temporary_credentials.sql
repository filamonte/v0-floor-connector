alter table public.portal_access_grants
  add column if not exists temporary_credential_issued_at timestamptz,
  add column if not exists temporary_credential_issued_by uuid references public.users(id) on delete set null,
  add column if not exists temporary_credential_requires_password_change boolean not null default false,
  add column if not exists temporary_credential_last_cleared_at timestamptz;

create index if not exists portal_access_grants_temporary_credential_idx
  on public.portal_access_grants (company_id, temporary_credential_requires_password_change)
  where temporary_credential_requires_password_change = true;

comment on column public.portal_access_grants.temporary_credential_issued_at is
  'Audit timestamp for support-issued temporary portal credentials. Does not store the temporary password.';

comment on column public.portal_access_grants.temporary_credential_issued_by is
  'Contractor/platform user who issued the support temporary portal credential. Does not imply customer authorization by itself.';

comment on column public.portal_access_grants.temporary_credential_requires_password_change is
  'Status flag indicating the portal user must change the support temporary credential after login.';

comment on column public.portal_access_grants.temporary_credential_last_cleared_at is
  'Timestamp when the temporary credential change requirement was cleared after password update.';
