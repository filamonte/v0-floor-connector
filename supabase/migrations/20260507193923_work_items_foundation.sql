do $$
begin
  create type public.work_item_status as enum (
    'open',
    'completed',
    'dismissed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.work_item_priority as enum (
    'low',
    'normal',
    'high',
    'urgent'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.work_item_kind as enum (
    'manual',
    'lead_follow_up',
    'appointment_confirmation_prep',
    'appointment_follow_up',
    'estimate_follow_up',
    'invoice_follow_up',
    'human_handoff'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.work_item_source_type as enum (
    'opportunity',
    'appointment',
    'customer',
    'project',
    'estimate',
    'contract',
    'change_order',
    'job',
    'invoice',
    'payment',
    'communication_thread',
    'notification_event',
    'workflow_error_event'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.work_item_visibility as enum (
    'internal'
  );
exception
  when duplicate_object then null;
end $$;

create unique index if not exists people_company_id_id_unique_idx
  on public.people (company_id, id);

create unique index if not exists customers_company_id_id_unique_idx
  on public.customers (company_id, id);

create unique index if not exists projects_company_id_id_unique_idx
  on public.projects (company_id, id);

create table if not exists public.work_items (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  status public.work_item_status not null default 'open',
  priority public.work_item_priority not null default 'normal',
  kind public.work_item_kind not null default 'manual',
  due_at timestamptz,
  assigned_person_id uuid,
  source_type public.work_item_source_type,
  source_id uuid,
  customer_id uuid,
  project_id uuid,
  link_path text,
  visibility public.work_item_visibility not null default 'internal',
  dedupe_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  completed_by uuid references public.users(id) on delete set null,
  completed_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint work_items_title_not_blank check (length(btrim(title)) > 0),
  constraint work_items_source_pair_check check (
    (source_type is null and source_id is null)
    or (source_type is not null and source_id is not null)
  ),
  constraint work_items_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint work_items_link_path_check check (
    link_path is null or left(link_path, 1) = '/'
  ),
  constraint work_items_completed_state_check check (
    (
      status = 'completed'
      and completed_at is not null
      and dismissed_at is null
    )
    or (
      status <> 'completed'
      and completed_at is null
      and completed_by is null
    )
  ),
  constraint work_items_dismissed_state_check check (
    (
      status = 'dismissed'
      and dismissed_at is not null
      and completed_at is null
      and completed_by is null
    )
    or (
      status <> 'dismissed'
      and dismissed_at is null
    )
  ),
  constraint work_items_assigned_person_company_fkey
    foreign key (company_id, assigned_person_id)
    references public.people(company_id, id)
    on delete set null (assigned_person_id),
  constraint work_items_customer_company_fkey
    foreign key (company_id, customer_id)
    references public.customers(company_id, id)
    on delete set null (customer_id),
  constraint work_items_project_company_fkey
    foreign key (company_id, project_id)
    references public.projects(company_id, id)
    on delete set null (project_id)
);

create index if not exists work_items_company_status_due_idx
  on public.work_items (company_id, status, due_at asc nulls last, created_at desc);

create index if not exists work_items_company_assigned_status_due_idx
  on public.work_items (company_id, assigned_person_id, status, due_at asc nulls last, created_at desc)
  where assigned_person_id is not null;

create index if not exists work_items_company_source_idx
  on public.work_items (company_id, source_type, source_id)
  where source_type is not null and source_id is not null;

create unique index if not exists work_items_company_dedupe_key_unique_idx
  on public.work_items (company_id, dedupe_key)
  where dedupe_key is not null;

drop trigger if exists work_items_set_updated_at on public.work_items;
create trigger work_items_set_updated_at
before update on public.work_items
for each row
execute function public.set_updated_at();

alter table public.work_items enable row level security;
alter table public.work_items force row level security;

drop policy if exists work_items_select_by_membership on public.work_items;
create policy work_items_select_by_membership
on public.work_items
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists work_items_insert_by_membership on public.work_items;
create policy work_items_insert_by_membership
on public.work_items
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

drop policy if exists work_items_update_by_membership on public.work_items;
create policy work_items_update_by_membership
on public.work_items
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on table public.work_items is 'Internal contractor work/action items. Work items track ownership, due date, and completion without replacing canonical opportunity, appointment, notification, automation, workflow, or lifecycle records.';
comment on column public.work_items.company_id is 'Tenant owner. Work items are internal organization-scoped records protected by RLS.';
comment on column public.work_items.kind is 'Small internal work-item classification. Does not create a workflow engine or replace canonical status fields.';
comment on column public.work_items.source_type is 'Optional canonical source type validated by server-side utilities before creation.';
comment on column public.work_items.source_id is 'Optional canonical source id paired with source_type. The source remains the business source of truth.';
comment on column public.work_items.visibility is 'Internal-only V1 visibility. Work items are not exposed to portal/customer users.';
comment on column public.work_items.dedupe_key is 'Optional future-safe duplicate guard for explicit generated or automation-created work items. No auto-generation is implemented by this migration.';
comment on column public.work_items.metadata is 'Safe structured internal metadata only. Do not store secrets, provider tokens, raw customer private payloads, or AI-only business truth.';
