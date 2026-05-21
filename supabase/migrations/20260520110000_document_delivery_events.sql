-- Evidence-only document delivery proof foundation.
-- Starts with warranty documents so delivery history can attach to canonical
-- warranty records without changing provider, signature, payment, or contract
-- behavior.

create table if not exists public.document_delivery_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  event_type text not null,
  recipient_name text,
  recipient_email text,
  recipient_role text,
  channel text not null default 'internal',
  provider text,
  provider_message_id text,
  provider_event_id text,
  related_notification_event_id uuid references public.notification_events(id) on delete set null,
  event_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint document_delivery_events_subject_type_check
    check (subject_type in ('warranty_document')),
  constraint document_delivery_events_event_type_check
    check (
      event_type in (
        'delivery_recorded',
        'send_requested',
        'sent',
        'viewed',
        'failed',
        'bounced',
        'opened',
        'clicked'
      )
    ),
  constraint document_delivery_events_channel_check
    check (channel in ('internal', 'portal', 'email', 'print', 'manual')),
  constraint document_delivery_events_recipient_email_check
    check (recipient_email is null or length(btrim(recipient_email)) > 0),
  constraint document_delivery_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists document_delivery_events_company_id_idx
  on public.document_delivery_events (company_id);

create index if not exists document_delivery_events_company_subject_idx
  on public.document_delivery_events (company_id, subject_type, subject_id, created_at desc);

create index if not exists document_delivery_events_company_event_type_idx
  on public.document_delivery_events (company_id, event_type, created_at desc);

create index if not exists document_delivery_events_company_created_at_idx
  on public.document_delivery_events (company_id, created_at desc);

create index if not exists document_delivery_events_provider_event_idx
  on public.document_delivery_events (provider, provider_event_id)
  where provider_event_id is not null;

create or replace function public.validate_document_delivery_event_subject()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  subject_company_id uuid;
  notification_company_id uuid;
begin
  if new.subject_type = 'warranty_document' then
    select document.company_id
      into subject_company_id
    from public.warranty_documents document
    where document.id = new.subject_id;
  else
    raise exception 'Unsupported document delivery subject type: %', new.subject_type;
  end if;

  if subject_company_id is null then
    raise exception 'Document delivery subject was not found.';
  end if;

  if subject_company_id <> new.company_id then
    raise exception 'Document delivery subject must belong to the same company.';
  end if;

  if new.related_notification_event_id is not null then
    select notification.company_id
      into notification_company_id
    from public.notification_events notification
    where notification.id = new.related_notification_event_id;

    if notification_company_id is null then
      raise exception 'Related notification event was not found.';
    end if;

    if notification_company_id <> new.company_id then
      raise exception 'Related notification event must belong to the same company.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_document_delivery_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Document delivery events are immutable.';
end;
$$;

drop trigger if exists validate_document_delivery_event_subject on public.document_delivery_events;
create trigger validate_document_delivery_event_subject
before insert on public.document_delivery_events
for each row
execute function public.validate_document_delivery_event_subject();

drop trigger if exists prevent_document_delivery_event_updates on public.document_delivery_events;
create trigger prevent_document_delivery_event_updates
before update on public.document_delivery_events
for each row
execute function public.prevent_document_delivery_event_mutation();

drop trigger if exists prevent_document_delivery_event_deletes on public.document_delivery_events;
create trigger prevent_document_delivery_event_deletes
before delete on public.document_delivery_events
for each row
execute function public.prevent_document_delivery_event_mutation();

alter table public.document_delivery_events enable row level security;
alter table public.document_delivery_events force row level security;

drop policy if exists document_delivery_events_select_by_membership on public.document_delivery_events;
create policy document_delivery_events_select_by_membership
on public.document_delivery_events
for select
to authenticated
using (public.is_active_company_member(company_id));

drop policy if exists document_delivery_events_insert_by_manager on public.document_delivery_events;
create policy document_delivery_events_insert_by_manager
on public.document_delivery_events
for insert
to authenticated
with check (
  public.is_active_company_member(company_id)
  and exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = document_delivery_events.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin', 'manager')
  )
);

comment on table public.document_delivery_events is
  'Immutable evidence-only delivery proof events for canonical documents. Initial subject support is warranty_document only.';
comment on column public.document_delivery_events.subject_type is
  'Canonical document subject namespace. Initially warranty_document only.';
comment on column public.document_delivery_events.event_type is
  'Delivery evidence event type. Recording an event does not send email or mutate document status.';
comment on column public.document_delivery_events.channel is
  'Evidence channel such as internal, manual, print, portal, or email. Provider sends are not implemented by this table.';
