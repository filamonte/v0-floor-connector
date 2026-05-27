create table if not exists public.portal_evidence_delivery_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null,
  portal_evidence_grant_id uuid not null references public.portal_evidence_grants(id) on delete cascade,
  portal_access_grant_id uuid references public.portal_access_grants(id) on delete set null,
  actor_user_id uuid references public.users(id) on delete set null,
  actor_kind text not null,
  event_type text not null,
  occurred_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint portal_evidence_delivery_events_company_project_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint portal_evidence_delivery_events_actor_kind_check
    check (actor_kind in ('contractor', 'portal_customer', 'system')),
  constraint portal_evidence_delivery_events_event_type_check
    check (event_type in ('shared', 'viewed', 'downloaded', 'acknowledged', 'revoked')),
  constraint portal_evidence_delivery_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create unique index if not exists portal_evidence_delivery_events_ack_once_idx
  on public.portal_evidence_delivery_events (portal_evidence_grant_id, portal_access_grant_id)
  where event_type = 'acknowledged' and portal_access_grant_id is not null;

create index if not exists portal_evidence_delivery_events_company_project_idx
  on public.portal_evidence_delivery_events (company_id, project_id, occurred_at desc);

create index if not exists portal_evidence_delivery_events_grant_idx
  on public.portal_evidence_delivery_events (portal_evidence_grant_id, occurred_at desc);

create index if not exists portal_evidence_delivery_events_company_event_idx
  on public.portal_evidence_delivery_events (company_id, event_type, occurred_at desc);

create or replace function public.validate_portal_evidence_delivery_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  grant_record public.portal_evidence_grants%rowtype;
  access_company_id uuid;
  project_access_exists boolean;
begin
  select *
    into grant_record
  from public.portal_evidence_grants grant_row
  where grant_row.id = new.portal_evidence_grant_id;

  if grant_record.id is null then
    raise exception 'Portal evidence grant was not found.';
  end if;

  if grant_record.company_id <> new.company_id or grant_record.project_id <> new.project_id then
    raise exception 'Portal evidence event must match the grant company and project.';
  end if;

  if new.event_type in ('viewed', 'downloaded', 'acknowledged') and grant_record.status <> 'shared' then
    raise exception 'Customer evidence events require an active shared grant.';
  end if;

  if new.event_type = 'shared' and grant_record.status <> 'shared' then
    raise exception 'Shared evidence events require a shared grant.';
  end if;

  if new.event_type = 'revoked' and grant_record.status <> 'revoked' then
    raise exception 'Revoked evidence events require a revoked grant.';
  end if;

  if new.portal_access_grant_id is not null then
    select access_grant.company_id
      into access_company_id
    from public.portal_access_grants access_grant
    where access_grant.id = new.portal_access_grant_id
      and access_grant.status = 'active';

    if access_company_id is null or access_company_id <> new.company_id then
      raise exception 'Portal access grant must be active and in the same company.';
    end if;

    select exists (
      select 1
      from public.portal_project_access project_access
      where project_access.portal_access_grant_id = new.portal_access_grant_id
        and project_access.company_id = new.company_id
        and project_access.project_id = new.project_id
        and project_access.status = 'active'
    )
      into project_access_exists;

    if not project_access_exists then
      raise exception 'Portal access grant must have active project access.';
    end if;
  end if;

  if new.actor_kind = 'portal_customer' and new.portal_access_grant_id is null then
    raise exception 'Portal customer evidence events require a portal access grant.';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_portal_evidence_delivery_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Portal evidence delivery events are append-only.';
end;
$$;

drop trigger if exists validate_portal_evidence_delivery_event on public.portal_evidence_delivery_events;
create trigger validate_portal_evidence_delivery_event
before insert on public.portal_evidence_delivery_events
for each row
execute function public.validate_portal_evidence_delivery_event();

drop trigger if exists prevent_portal_evidence_delivery_event_updates on public.portal_evidence_delivery_events;
create trigger prevent_portal_evidence_delivery_event_updates
before update on public.portal_evidence_delivery_events
for each row
execute function public.prevent_portal_evidence_delivery_event_mutation();

drop trigger if exists prevent_portal_evidence_delivery_event_deletes on public.portal_evidence_delivery_events;
create trigger prevent_portal_evidence_delivery_event_deletes
before delete on public.portal_evidence_delivery_events
for each row
execute function public.prevent_portal_evidence_delivery_event_mutation();

alter table public.portal_evidence_delivery_events enable row level security;
alter table public.portal_evidence_delivery_events force row level security;

drop policy if exists portal_evidence_delivery_events_select_by_scope on public.portal_evidence_delivery_events;
create policy portal_evidence_delivery_events_select_by_scope
on public.portal_evidence_delivery_events
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (
    event_type in ('shared', 'viewed', 'downloaded', 'acknowledged')
    and (select public.has_active_portal_project_access(company_id, project_id))
  )
);

comment on table public.portal_evidence_delivery_events is 'Append-only delivery, portal view/download, acknowledgement, and revocation proof for explicitly shared project evidence grants.';
comment on column public.portal_evidence_delivery_events.portal_evidence_grant_id is 'Canonical sharing grant this proof event belongs to; this table does not copy the file or expose storage paths.';
comment on column public.portal_evidence_delivery_events.portal_access_grant_id is 'Project-scoped portal access grant involved in a customer-visible proof event when applicable.';
comment on column public.portal_evidence_delivery_events.actor_kind is 'Customer-safe actor category for the proof event: contractor, portal_customer, or system.';
comment on column public.portal_evidence_delivery_events.event_type is 'Shared evidence proof event type. Events are evidence-only and do not mutate source attachments.';
comment on column public.portal_evidence_delivery_events.metadata is 'Safe JSON metadata only. Do not store raw storage paths, provider payloads, secrets, or internal field-note bodies.';
