create table if not exists public.document_signers (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  signer_role text not null,
  signer_name text not null,
  signer_email text not null,
  status text not null default 'pending',
  signed_at timestamptz,
  declined_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint document_signers_subject_type_check
    check (subject_type in ('warranty_document')),
  constraint document_signers_role_check
    check (signer_role in ('customer', 'contractor')),
  constraint document_signers_status_check
    check (status in ('pending', 'requested', 'viewed', 'signed', 'declined', 'voided')),
  constraint document_signers_name_not_blank_check
    check (char_length(btrim(signer_name)) > 0),
  constraint document_signers_email_not_blank_check
    check (char_length(btrim(signer_email)) > 0),
  constraint document_signers_status_timestamp_check
    check (
      (signed_at is null or status = 'signed')
      and (declined_at is null or status = 'declined')
    )
);

create unique index if not exists document_signers_company_id_id_unique_idx
  on public.document_signers (company_id, id);

create index if not exists document_signers_company_subject_idx
  on public.document_signers (company_id, subject_type, subject_id, created_at desc);

create index if not exists document_signers_company_status_idx
  on public.document_signers (company_id, status, created_at desc);

create unique index if not exists document_signers_subject_role_email_unique_idx
  on public.document_signers (
    company_id,
    subject_type,
    subject_id,
    signer_role,
    lower(signer_email)
  );

create table if not exists public.document_signature_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  signer_id uuid,
  event_type text not null,
  event_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint document_signature_events_subject_type_check
    check (subject_type in ('warranty_document')),
  constraint document_signature_events_event_type_check
    check (event_type in ('signature_requested', 'viewed', 'signed', 'declined', 'voided')),
  constraint document_signature_events_signer_company_fkey
    foreign key (company_id, signer_id)
    references public.document_signers(company_id, id)
    on delete set null
);

create unique index if not exists document_signature_events_company_id_id_unique_idx
  on public.document_signature_events (company_id, id);

create index if not exists document_signature_events_company_subject_idx
  on public.document_signature_events (company_id, subject_type, subject_id, created_at desc);

create index if not exists document_signature_events_company_signer_idx
  on public.document_signature_events (company_id, signer_id, created_at desc)
  where signer_id is not null;

create or replace function public.validate_document_signature_subject()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  subject_company_id uuid;
begin
  if new.subject_type = 'warranty_document' then
    select document.company_id
      into subject_company_id
    from public.warranty_documents document
    where document.id = new.subject_id;
  else
    raise exception 'Unsupported document signature subject type.';
  end if;

  if subject_company_id is null or subject_company_id <> new.company_id then
    raise exception 'Document signature subject must belong to the same company.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_document_signature_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  subject_company_id uuid;
  signer_subject_type text;
  signer_subject_id uuid;
begin
  if new.subject_type = 'warranty_document' then
    select document.company_id
      into subject_company_id
    from public.warranty_documents document
    where document.id = new.subject_id;
  else
    raise exception 'Unsupported document signature event subject type.';
  end if;

  if subject_company_id is null or subject_company_id <> new.company_id then
    raise exception 'Document signature event subject must belong to the same company.';
  end if;

  if new.signer_id is not null then
    select signer.subject_type, signer.subject_id
      into signer_subject_type, signer_subject_id
    from public.document_signers signer
    where signer.company_id = new.company_id
      and signer.id = new.signer_id;

    if signer_subject_type is null then
      raise exception 'Document signature event signer must belong to the same company.';
    end if;

    if signer_subject_type <> new.subject_type or signer_subject_id <> new.subject_id then
      raise exception 'Document signature event signer must match the event subject.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_document_signature_event_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Document signature events are immutable.';
end;
$$;

drop trigger if exists set_document_signers_updated_at on public.document_signers;
create trigger set_document_signers_updated_at
before update on public.document_signers
for each row
execute function public.set_updated_at();

drop trigger if exists validate_document_signers_subject_trigger
  on public.document_signers;
create trigger validate_document_signers_subject_trigger
before insert or update on public.document_signers
for each row
execute function public.validate_document_signature_subject();

drop trigger if exists validate_document_signature_events_trigger
  on public.document_signature_events;
create trigger validate_document_signature_events_trigger
before insert on public.document_signature_events
for each row
execute function public.validate_document_signature_event();

drop trigger if exists prevent_document_signature_event_updates
  on public.document_signature_events;
create trigger prevent_document_signature_event_updates
before update on public.document_signature_events
for each row
execute function public.prevent_document_signature_event_mutation();

drop trigger if exists prevent_document_signature_event_deletes
  on public.document_signature_events;
create trigger prevent_document_signature_event_deletes
before delete on public.document_signature_events
for each row
execute function public.prevent_document_signature_event_mutation();

alter table public.document_signers enable row level security;
alter table public.document_signers force row level security;

drop policy if exists document_signers_select_by_membership
  on public.document_signers;
create policy document_signers_select_by_membership
on public.document_signers
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists document_signers_insert_by_manager
  on public.document_signers;
create policy document_signers_insert_by_manager
on public.document_signers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = document_signers.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

drop policy if exists document_signers_update_by_manager
  on public.document_signers;
create policy document_signers_update_by_manager
on public.document_signers
for update
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = document_signers.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = document_signers.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

alter table public.document_signature_events enable row level security;
alter table public.document_signature_events force row level security;

drop policy if exists document_signature_events_select_by_membership
  on public.document_signature_events;
create policy document_signature_events_select_by_membership
on public.document_signature_events
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists document_signature_events_insert_by_manager
  on public.document_signature_events;
create policy document_signature_events_insert_by_manager
on public.document_signature_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = document_signature_events.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

comment on table public.document_signers is 'Generic document signer routing foundation. Initial allowed subject is warranty_document only so warranty signing can be added without disturbing existing contract signing.';
comment on table public.document_signature_events is 'Immutable audit trail for generic document signature lifecycle events. Initial allowed subject is warranty_document only.';
comment on column public.document_signers.subject_type is 'Generic document signature subject. Initially constrained to warranty_document until other document families are explicitly migrated.';
comment on column public.document_signers.subject_id is 'Identifier of the canonical signed document subject.';
comment on column public.document_signature_events.metadata is 'Optional application/provider event snapshot kept for audit support. Provider data supports canonical records and must not become signature truth.';
