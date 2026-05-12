do $$
begin
  alter type public.canonical_record_subject_type add value if not exists 'job';
exception
  when duplicate_object then null;
end $$;

create table if not exists public.workflow_cue_states (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  cue_family text not null,
  cue_key text not null,
  cue_version integer not null default 1,
  cue_fingerprint text not null,
  subject_type public.canonical_record_subject_type not null,
  subject_id uuid not null,
  project_id uuid references public.projects(id) on delete set null,
  scope text not null,
  user_id uuid references public.users(id) on delete cascade,
  state text not null,
  snoozed_until timestamptz,
  dismissed_at timestamptz,
  resolved_at timestamptz,
  last_seen_at timestamptz,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workflow_cue_states_cue_family_check
    check (cue_family in ('operational', 'project_guidance')),
  constraint workflow_cue_states_scope_check
    check (scope in ('user', 'company')),
  constraint workflow_cue_states_state_check
    check (state in ('dismissed', 'snoozed', 'resolved')),
  constraint workflow_cue_states_user_scope_check
    check (
      (scope = 'user' and user_id is not null)
      or (scope = 'company' and user_id is null)
    ),
  constraint workflow_cue_states_snoozed_state_check
    check (
      (state = 'snoozed' and snoozed_until is not null)
      or (state <> 'snoozed')
    ),
  constraint workflow_cue_states_dismissed_state_check
    check (
      (state = 'dismissed' and dismissed_at is not null)
      or (state <> 'dismissed')
    ),
  constraint workflow_cue_states_resolved_state_check
    check (
      (state = 'resolved' and resolved_at is not null)
      or (state <> 'resolved')
    ),
  constraint workflow_cue_states_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint workflow_cue_states_cue_version_positive_check
    check (cue_version > 0),
  constraint workflow_cue_states_cue_key_not_blank
    check (length(btrim(cue_key)) > 0),
  constraint workflow_cue_states_cue_fingerprint_not_blank
    check (length(btrim(cue_fingerprint)) > 0)
);

create unique index if not exists workflow_cue_states_user_unique_idx
  on public.workflow_cue_states (
    company_id,
    cue_family,
    cue_key,
    subject_type,
    subject_id,
    cue_fingerprint,
    user_id
  )
  where scope = 'user';

create unique index if not exists workflow_cue_states_company_unique_idx
  on public.workflow_cue_states (
    company_id,
    cue_family,
    cue_key,
    subject_type,
    subject_id,
    cue_fingerprint
  )
  where scope = 'company';

create index if not exists workflow_cue_states_company_user_state_idx
  on public.workflow_cue_states (company_id, user_id, state, snoozed_until);

create index if not exists workflow_cue_states_company_subject_idx
  on public.workflow_cue_states (
    company_id,
    cue_family,
    cue_key,
    subject_type,
    subject_id
  );

create index if not exists workflow_cue_states_company_project_idx
  on public.workflow_cue_states (company_id, project_id)
  where project_id is not null;

drop trigger if exists workflow_cue_states_set_updated_at
  on public.workflow_cue_states;
create trigger workflow_cue_states_set_updated_at
before update on public.workflow_cue_states
for each row
execute function public.set_updated_at();

alter table public.workflow_cue_states enable row level security;
alter table public.workflow_cue_states force row level security;

drop policy if exists workflow_cue_states_select_by_membership
  on public.workflow_cue_states;
create policy workflow_cue_states_select_by_membership
on public.workflow_cue_states
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists workflow_cue_states_insert_user_scope
  on public.workflow_cue_states;
create policy workflow_cue_states_insert_user_scope
on public.workflow_cue_states
for insert
to authenticated
with check (
  scope = 'user'
  and user_id = (select auth.uid())
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists workflow_cue_states_update_user_scope
  on public.workflow_cue_states;
create policy workflow_cue_states_update_user_scope
on public.workflow_cue_states
for update
to authenticated
using (
  scope = 'user'
  and user_id = (select auth.uid())
  and (select public.is_active_company_member(company_id))
)
with check (
  scope = 'user'
  and user_id = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists workflow_cue_states_delete_user_scope
  on public.workflow_cue_states;
create policy workflow_cue_states_delete_user_scope
on public.workflow_cue_states
for delete
to authenticated
using (
  scope = 'user'
  and user_id = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

grant select, insert, update, delete
on public.workflow_cue_states
to authenticated;

comment on table public.workflow_cue_states is
  'Tenant-scoped response state for computed workflow cues. Computed cues remain derived from canonical records; absence of a row means the cue is active and visible.';
comment on column public.workflow_cue_states.company_id is
  'Tenant owner for cue handling state. This table stores visibility/handling state only, not cue business truth.';
comment on column public.workflow_cue_states.cue_family is
  'Cue source family such as operational or project_guidance. This prevents module-local cue-state tables.';
comment on column public.workflow_cue_states.cue_key is
  'Stable deterministic cue key from the computed cue system. It is not a task or work-item kind.';
comment on column public.workflow_cue_states.cue_fingerprint is
  'Deterministic fingerprint of material cue evidence. If the underlying issue materially changes, a prior dismissed or snoozed state no longer suppresses the cue.';
comment on column public.workflow_cue_states.subject_type is
  'Canonical record type the cue points to. The canonical source record remains the business source of truth.';
comment on column public.workflow_cue_states.subject_id is
  'Canonical record id the cue points to. Cue state does not mark this record complete or mutate workflow status.';
comment on column public.workflow_cue_states.scope is
  'Handling scope. V1 app actions write user-scoped dismiss and snooze state only.';
comment on column public.workflow_cue_states.state is
  'User or company handling state. There are no active rows; absence of a row means active/visible.';
comment on column public.workflow_cue_states.metadata is
  'Safe internal metadata only. Do not store secrets, provider payloads, AI-only business truth, or copied canonical record data.';
