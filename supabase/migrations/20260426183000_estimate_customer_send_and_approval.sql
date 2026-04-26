do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'estimate_customer_event_type'
  ) then
    create type public.estimate_customer_event_type as enum (
      'sent',
      'viewed',
      'comment_added',
      'approved',
      'rejected'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'estimate_customer_event_actor_type'
  ) then
    create type public.estimate_customer_event_actor_type as enum (
      'organization_user',
      'portal_user',
      'system'
    );
  end if;
end
$$;

alter table public.estimates
  add column if not exists sent_at timestamptz,
  add column if not exists sent_by uuid references public.users(id) on delete set null,
  add column if not exists customer_viewed_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by_portal_user_id uuid references public.users(id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by_portal_user_id uuid references public.users(id) on delete set null;

create index if not exists estimates_company_sent_at_idx
  on public.estimates (company_id, sent_at desc);

create index if not exists estimates_company_customer_viewed_at_idx
  on public.estimates (company_id, customer_viewed_at desc);

create table if not exists public.estimate_customer_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  estimate_id uuid not null,
  customer_id uuid not null,
  project_id uuid not null,
  event_type public.estimate_customer_event_type not null,
  actor_type public.estimate_customer_event_actor_type not null,
  organization_user_id uuid references public.users(id) on delete set null,
  portal_user_id uuid references public.users(id) on delete set null,
  event_note text,
  email_recipient text,
  email_tracking_token uuid,
  email_opened_at timestamptz,
  email_clicked_at timestamptz,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint estimate_customer_events_estimate_company_fkey
    foreign key (company_id, estimate_id)
    references public.estimates(company_id, id)
    on delete cascade,
  constraint estimate_customer_events_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete restrict,
  constraint estimate_customer_events_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete restrict,
  constraint estimate_customer_events_actor_presence_check
    check (
      (actor_type = 'organization_user' and organization_user_id is not null and portal_user_id is null) or
      (actor_type = 'portal_user' and portal_user_id is not null and organization_user_id is null) or
      (actor_type = 'system' and organization_user_id is null and portal_user_id is null)
    ),
  constraint estimate_customer_events_email_tracking_check
    check (
      (
        event_type = 'sent' and
        (
          email_tracking_token is null or
          email_recipient is not null
        )
      ) or (
        event_type <> 'sent' and
        email_tracking_token is null and
        email_recipient is null and
        email_opened_at is null and
        email_clicked_at is null
      )
    )
);

create index if not exists estimate_customer_events_company_estimate_occurred_idx
  on public.estimate_customer_events (company_id, estimate_id, occurred_at desc, created_at desc);

create index if not exists estimate_customer_events_company_project_occurred_idx
  on public.estimate_customer_events (company_id, project_id, occurred_at desc);

create unique index if not exists estimate_customer_events_tracking_token_unique_idx
  on public.estimate_customer_events (email_tracking_token)
  where email_tracking_token is not null;

alter table public.estimate_customer_events enable row level security;
alter table public.estimate_customer_events force row level security;

drop policy if exists estimate_customer_events_select_by_membership on public.estimate_customer_events;
create policy estimate_customer_events_select_by_membership
on public.estimate_customer_events
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists estimate_customer_events_insert_by_membership on public.estimate_customer_events;
create policy estimate_customer_events_insert_by_membership
on public.estimate_customer_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

comment on table public.estimate_customer_events is 'Canonical estimate send, portal review, comment, and decision audit records, including email-delivery tracking for portal estimate review links.';
comment on column public.estimate_customer_events.email_tracking_token is 'Opaque token embedded into estimate email links so open and click activity can be recorded without exposing approval actions anonymously.';
