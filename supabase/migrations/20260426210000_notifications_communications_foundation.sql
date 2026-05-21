do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'canonical_record_subject_type'
  ) then
    create type public.canonical_record_subject_type as enum (
      'customer',
      'project',
      'estimate',
      'contract',
      'invoice',
      'change_order',
      'payment'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'notification_event_category'
  ) then
    create type public.notification_event_category as enum (
      'estimates',
      'contracts',
      'invoices',
      'change_orders',
      'payments',
      'communication',
      'system'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'notification_event_severity'
  ) then
    create type public.notification_event_severity as enum (
      'critical',
      'warning',
      'neutral'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'notification_actor_type'
  ) then
    create type public.notification_actor_type as enum (
      'organization_user',
      'portal_user',
      'provider',
      'system'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'notification_channel'
  ) then
    create type public.notification_channel as enum (
      'in_app',
      'email',
      'sms'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'notification_delivery_status'
  ) then
    create type public.notification_delivery_status as enum (
      'pending',
      'sent',
      'delivered',
      'opened',
      'clicked',
      'failed'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'communication_message_sender_type'
  ) then
    create type public.communication_message_sender_type as enum (
      'organization_user',
      'portal_user',
      'system'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'change_order_event_type'
  ) then
    create type public.change_order_event_type as enum (
      'sent',
      'viewed',
      'approved',
      'rejected'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'invoice_event_type'
  ) then
    create type public.invoice_event_type as enum (
      'sent',
      'viewed',
      'payment_requested',
      'paid',
      'failed',
      'voided'
    );
  end if;
end
$$;

create table if not exists public.notification_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category public.notification_event_category not null,
  severity public.notification_event_severity not null default 'neutral',
  event_type text not null,
  subject_type public.canonical_record_subject_type not null,
  subject_id uuid not null,
  customer_id uuid,
  project_id uuid,
  actor_type public.notification_actor_type not null,
  actor_user_id uuid references public.users(id) on delete set null,
  portal_user_id uuid references public.users(id) on delete set null,
  title text not null,
  message text not null,
  link_path text not null,
  group_key text,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint notification_events_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete set null,
  constraint notification_events_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete set null,
  constraint notification_events_actor_presence_check
    check (
      (actor_type = 'organization_user' and actor_user_id is not null and portal_user_id is null) or
      (actor_type = 'portal_user' and portal_user_id is not null and actor_user_id is null) or
      (actor_type in ('provider', 'system') and actor_user_id is null and portal_user_id is null)
    )
);

create index if not exists notification_events_company_occurred_idx
  on public.notification_events (company_id, occurred_at desc, created_at desc);

create index if not exists notification_events_company_category_idx
  on public.notification_events (company_id, category, occurred_at desc);

create index if not exists notification_events_company_subject_idx
  on public.notification_events (company_id, subject_type, subject_id, occurred_at desc);

create index if not exists notification_events_company_project_idx
  on public.notification_events (company_id, project_id, occurred_at desc);

create table if not exists public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  notification_event_id uuid not null references public.notification_events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notifications_company_event_unique unique (company_id, notification_event_id, user_id),
  constraint notifications_read_state_check
    check (
      (is_read = false and read_at is null) or
      (is_read = true and read_at is not null)
    )
);

create index if not exists notifications_company_user_read_idx
  on public.notifications (company_id, user_id, is_read, created_at desc);

create index if not exists notifications_company_user_event_idx
  on public.notifications (company_id, user_id, notification_event_id);

create table if not exists public.notification_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  notification_event_id uuid not null references public.notification_events(id) on delete cascade,
  channel public.notification_channel not null,
  provider text,
  status public.notification_delivery_status not null default 'pending',
  recipient_user_id uuid references public.users(id) on delete set null,
  recipient_email text,
  recipient_phone text,
  tracking_token uuid,
  provider_message_id text,
  error_message text,
  payload jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_deliveries_recipient_presence_check
    check (
      (channel = 'email' and recipient_email is not null) or
      (channel = 'sms' and recipient_phone is not null) or
      channel = 'in_app'
    )
);

create index if not exists notification_deliveries_company_status_idx
  on public.notification_deliveries (company_id, status, created_at desc);

create index if not exists notification_deliveries_company_event_idx
  on public.notification_deliveries (company_id, notification_event_id, created_at desc);

create unique index if not exists notification_deliveries_tracking_token_unique_idx
  on public.notification_deliveries (tracking_token)
  where tracking_token is not null;

create table if not exists public.communication_threads (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  subject_type public.canonical_record_subject_type not null,
  subject_id uuid not null,
  created_by_user_id uuid references public.users(id) on delete set null,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint communication_threads_company_customer_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint communication_threads_company_project_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint communication_threads_subject_unique unique (company_id, subject_type, subject_id)
);

create index if not exists communication_threads_company_project_idx
  on public.communication_threads (company_id, project_id, last_message_at desc, updated_at desc);

create index if not exists communication_threads_company_customer_idx
  on public.communication_threads (company_id, customer_id, last_message_at desc, updated_at desc);

create table if not exists public.communication_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  thread_id uuid not null references public.communication_threads(id) on delete cascade,
  customer_id uuid not null,
  project_id uuid not null,
  sender_type public.communication_message_sender_type not null,
  sender_user_id uuid references public.users(id) on delete set null,
  body text not null,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint communication_messages_company_customer_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint communication_messages_company_project_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint communication_messages_sender_presence_check
    check (
      (sender_type in ('organization_user', 'portal_user') and sender_user_id is not null) or
      (sender_type = 'system' and sender_user_id is null)
    )
);

create index if not exists communication_messages_thread_created_idx
  on public.communication_messages (thread_id, created_at desc);

create index if not exists communication_messages_company_project_idx
  on public.communication_messages (company_id, project_id, created_at desc);

create table if not exists public.change_order_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  change_order_id uuid not null,
  customer_id uuid not null,
  project_id uuid not null,
  event_type public.change_order_event_type not null,
  actor_type public.notification_actor_type not null,
  actor_user_id uuid references public.users(id) on delete set null,
  portal_user_id uuid references public.users(id) on delete set null,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint change_order_events_change_order_company_fkey
    foreign key (company_id, change_order_id)
    references public.change_orders(company_id, id)
    on delete cascade,
  constraint change_order_events_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint change_order_events_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint change_order_events_actor_presence_check
    check (
      (actor_type = 'organization_user' and actor_user_id is not null and portal_user_id is null) or
      (actor_type = 'portal_user' and portal_user_id is not null and actor_user_id is null) or
      (actor_type in ('provider', 'system') and actor_user_id is null and portal_user_id is null)
    )
);

create index if not exists change_order_events_company_change_order_idx
  on public.change_order_events (company_id, change_order_id, occurred_at desc);

create index if not exists change_order_events_company_project_idx
  on public.change_order_events (company_id, project_id, occurred_at desc);

create table if not exists public.invoice_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  customer_id uuid not null,
  project_id uuid not null,
  event_type public.invoice_event_type not null,
  actor_type public.notification_actor_type not null,
  actor_user_id uuid references public.users(id) on delete set null,
  portal_user_id uuid references public.users(id) on delete set null,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint invoice_events_invoice_company_fkey
    foreign key (company_id, invoice_id)
    references public.invoices(company_id, id)
    on delete cascade,
  constraint invoice_events_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete cascade,
  constraint invoice_events_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete cascade,
  constraint invoice_events_actor_presence_check
    check (
      (actor_type = 'organization_user' and actor_user_id is not null and portal_user_id is null) or
      (actor_type = 'portal_user' and portal_user_id is not null and actor_user_id is null) or
      (actor_type in ('provider', 'system') and actor_user_id is null and portal_user_id is null)
    )
);

create index if not exists invoice_events_company_invoice_idx
  on public.invoice_events (company_id, invoice_id, occurred_at desc);

create index if not exists invoice_events_company_project_idx
  on public.invoice_events (company_id, project_id, occurred_at desc);

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();

drop trigger if exists notification_deliveries_set_updated_at on public.notification_deliveries;
create trigger notification_deliveries_set_updated_at
before update on public.notification_deliveries
for each row
execute function public.set_updated_at();

drop trigger if exists communication_threads_set_updated_at on public.communication_threads;
create trigger communication_threads_set_updated_at
before update on public.communication_threads
for each row
execute function public.set_updated_at();

alter table public.notification_events enable row level security;
alter table public.notification_events force row level security;

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

alter table public.notification_deliveries enable row level security;
alter table public.notification_deliveries force row level security;

alter table public.communication_threads enable row level security;
alter table public.communication_threads force row level security;

alter table public.communication_messages enable row level security;
alter table public.communication_messages force row level security;

alter table public.change_order_events enable row level security;
alter table public.change_order_events force row level security;

alter table public.invoice_events enable row level security;
alter table public.invoice_events force row level security;

drop policy if exists notification_events_select_by_scope on public.notification_events;
create policy notification_events_select_by_scope
on public.notification_events
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists notification_events_insert_by_membership on public.notification_events;
create policy notification_events_insert_by_membership
on public.notification_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists notifications_select_by_user_scope on public.notifications;
create policy notifications_select_by_user_scope
on public.notifications
for select
to authenticated
using (
  user_id = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists notifications_insert_by_user_scope on public.notifications;
create policy notifications_insert_by_user_scope
on public.notifications
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists notifications_update_by_user_scope on public.notifications;
create policy notifications_update_by_user_scope
on public.notifications
for update
to authenticated
using (
  user_id = (select auth.uid())
  and (select public.is_active_company_member(company_id))
)
with check (
  user_id = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists notification_deliveries_select_by_scope on public.notification_deliveries;
create policy notification_deliveries_select_by_scope
on public.notification_deliveries
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists notification_deliveries_insert_by_scope on public.notification_deliveries;
create policy notification_deliveries_insert_by_scope
on public.notification_deliveries
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists notification_deliveries_update_by_scope on public.notification_deliveries;
create policy notification_deliveries_update_by_scope
on public.notification_deliveries
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

drop policy if exists communication_threads_select_by_scope on public.communication_threads;
create policy communication_threads_select_by_scope
on public.communication_threads
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (
    (select public.has_active_portal_customer_access(company_id, customer_id))
    and (select public.has_active_portal_project_access(company_id, project_id))
  )
);

drop policy if exists communication_threads_insert_by_scope on public.communication_threads;
create policy communication_threads_insert_by_scope
on public.communication_threads
for insert
to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and (
    (select public.is_active_company_member(company_id))
    or (
      (select public.has_active_portal_customer_access(company_id, customer_id))
      and (select public.has_active_portal_project_access(company_id, project_id))
    )
  )
);

drop policy if exists communication_threads_update_by_scope on public.communication_threads;
create policy communication_threads_update_by_scope
on public.communication_threads
for update
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (
    (select public.has_active_portal_customer_access(company_id, customer_id))
    and (select public.has_active_portal_project_access(company_id, project_id))
  )
)
with check (
  (select public.is_active_company_member(company_id))
  or (
    (select public.has_active_portal_customer_access(company_id, customer_id))
    and (select public.has_active_portal_project_access(company_id, project_id))
  )
);

drop policy if exists communication_messages_select_by_scope on public.communication_messages;
create policy communication_messages_select_by_scope
on public.communication_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.communication_threads thread
    where thread.id = communication_messages.thread_id
      and thread.company_id = communication_messages.company_id
      and (
        (select public.is_active_company_member(thread.company_id))
        or (
          (select public.has_active_portal_customer_access(thread.company_id, thread.customer_id))
          and (select public.has_active_portal_project_access(thread.company_id, thread.project_id))
        )
      )
  )
);

drop policy if exists communication_messages_insert_by_scope on public.communication_messages;
create policy communication_messages_insert_by_scope
on public.communication_messages
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1
    from public.communication_threads thread
    where thread.id = communication_messages.thread_id
      and thread.company_id = communication_messages.company_id
      and thread.customer_id = communication_messages.customer_id
      and thread.project_id = communication_messages.project_id
      and (
        (sender_type = 'organization_user' and (select public.is_active_company_member(thread.company_id)))
        or (
          sender_type = 'portal_user'
          and (select public.has_active_portal_customer_access(thread.company_id, thread.customer_id))
          and (select public.has_active_portal_project_access(thread.company_id, thread.project_id))
        )
      )
  )
);

drop policy if exists change_order_events_select_by_scope on public.change_order_events;
create policy change_order_events_select_by_scope
on public.change_order_events
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists change_order_events_insert_by_scope on public.change_order_events;
create policy change_order_events_insert_by_scope
on public.change_order_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists invoice_events_select_by_scope on public.invoice_events;
create policy invoice_events_select_by_scope
on public.invoice_events
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (select public.has_active_portal_project_access(company_id, project_id))
);

drop policy if exists invoice_events_insert_by_scope on public.invoice_events;
create policy invoice_events_insert_by_scope
on public.invoice_events
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

comment on table public.notification_events is 'Immutable cross-module notification activity stream used as the canonical source of truth for in-app and delivery-oriented communication signals.';
comment on table public.notifications is 'Per-user read model derived from canonical notification events for contractor in-app notification state.';
comment on table public.notification_deliveries is 'Channel-specific delivery ledger for canonical notification events, including Postmark email tracking and future SMS support.';
comment on table public.communication_threads is 'Canonical record-attached communication threads that keep contractor and customer messaging on the same shared project chain.';
comment on table public.communication_messages is 'Immutable messages inside canonical communication threads. These do not create duplicate estimate, contract, invoice, or change-order records.';
comment on table public.change_order_events is 'Immutable workflow events for canonical change-order lifecycle activity.';
comment on table public.invoice_events is 'Immutable workflow events for canonical invoice lifecycle activity, including payment-request and payment-outcome milestones.';
