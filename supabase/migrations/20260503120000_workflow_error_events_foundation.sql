create table if not exists public.workflow_error_events (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  subject_type text not null,
  subject_id uuid,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint workflow_error_events_action_not_blank check (length(btrim(action)) > 0),
  constraint workflow_error_events_subject_type_not_blank check (length(btrim(subject_type)) > 0),
  constraint workflow_error_events_message_not_blank check (length(btrim(message)) > 0)
);

create index if not exists workflow_error_events_org_created_idx
  on public.workflow_error_events (organization_id, created_at desc);

create index if not exists workflow_error_events_org_action_created_idx
  on public.workflow_error_events (organization_id, action, created_at desc);

create index if not exists workflow_error_events_org_subject_idx
  on public.workflow_error_events (organization_id, subject_type, subject_id, created_at desc)
  where subject_id is not null;

alter table public.workflow_error_events enable row level security;
alter table public.workflow_error_events force row level security;

drop policy if exists workflow_error_events_select_by_admin_scope on public.workflow_error_events;
create policy workflow_error_events_select_by_admin_scope
on public.workflow_error_events
for select
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = workflow_error_events.organization_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists workflow_error_events_insert_by_member_scope on public.workflow_error_events;
create policy workflow_error_events_insert_by_member_scope
on public.workflow_error_events
for insert
to authenticated
with check ((select public.is_active_company_member(organization_id)));

comment on table public.workflow_error_events is 'Tenant-scoped internal workflow failure log for contractor owner/admin review. Stores safe operational context only.';
comment on column public.workflow_error_events.metadata is 'Safe structured context for the failed workflow action. Do not store secrets, tokens, raw env vars, customer private notes, or payment provider secrets.';
