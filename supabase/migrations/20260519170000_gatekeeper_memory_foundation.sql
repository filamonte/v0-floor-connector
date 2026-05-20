do $$
begin
  alter type public.canonical_record_subject_type add value if not exists 'person';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.canonical_record_subject_type add value if not exists 'vendor';
exception
  when duplicate_object then null;
end $$;

create unique index if not exists communication_threads_company_id_id_unique_idx
  on public.communication_threads (company_id, id);

alter table public.communication_threads
  add column if not exists thread_category text not null default 'operational',
  add column if not exists channel_kind text not null default 'unknown',
  add column if not exists thread_status text not null default 'open';

alter table public.communication_threads
  drop constraint if exists communication_threads_thread_category_check,
  drop constraint if exists communication_threads_channel_kind_check,
  drop constraint if exists communication_threads_thread_status_check;

alter table public.communication_threads
  add constraint communication_threads_thread_category_check
    check (thread_category in ('operational', 'sales', 'support', 'billing', 'field', 'success', 'unknown')),
  add constraint communication_threads_channel_kind_check
    check (channel_kind in ('phone', 'sms', 'email', 'web_chat', 'portal', 'internal_note', 'assistant_note', 'unknown')),
  add constraint communication_threads_thread_status_check
    check (thread_status in ('open', 'waiting_on_customer', 'waiting_on_contractor', 'closed', 'archived'));

alter table public.communication_messages
  add column if not exists direction text not null default 'internal',
  add column if not exists source_kind text not null default 'human',
  add column if not exists channel_kind text not null default 'unknown',
  add column if not exists occurred_at timestamptz not null default timezone('utc', now());

alter table public.communication_messages
  drop constraint if exists communication_messages_direction_check,
  drop constraint if exists communication_messages_source_kind_check,
  drop constraint if exists communication_messages_channel_kind_check;

alter table public.communication_messages
  add constraint communication_messages_direction_check
    check (direction in ('inbound', 'outbound', 'internal', 'system')),
  add constraint communication_messages_source_kind_check
    check (source_kind in ('human', 'assistant', 'system', 'provider_placeholder')),
  add constraint communication_messages_channel_kind_check
    check (channel_kind in ('phone', 'sms', 'email', 'web_chat', 'portal', 'internal_note', 'assistant_note', 'unknown'));

create index if not exists communication_threads_company_status_idx
  on public.communication_threads (company_id, thread_status, updated_at desc);

create index if not exists communication_threads_company_channel_idx
  on public.communication_threads (company_id, channel_kind, updated_at desc);

create index if not exists communication_messages_company_channel_occurred_idx
  on public.communication_messages (company_id, channel_kind, occurred_at desc);

create table if not exists public.gatekeeper_artifacts (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  communication_thread_id uuid,
  communication_message_id uuid,
  subject_type public.canonical_record_subject_type,
  subject_id uuid,
  artifact_type text not null,
  content_text text,
  content jsonb not null default '{}'::jsonb,
  confidence numeric,
  review_status text not null default 'proposed',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gatekeeper_artifacts_thread_company_fkey
    foreign key (company_id, communication_thread_id)
    references public.communication_threads(company_id, id)
    on delete set null (communication_thread_id),
  constraint gatekeeper_artifacts_message_company_fkey
    foreign key (company_id, communication_message_id)
    references public.communication_messages(company_id, id)
    on delete set null (communication_message_id),
  constraint gatekeeper_artifacts_subject_pair_check
    check (
      (subject_type is null and subject_id is null)
      or (subject_type is not null and subject_id is not null)
    ),
  constraint gatekeeper_artifacts_type_check
    check (
      artifact_type in (
        'call_summary',
        'transcript_placeholder',
        'extracted_requirement',
        'extracted_commitment',
        'risk_signal',
        'workflow_observation',
        'onboarding_note'
      )
    ),
  constraint gatekeeper_artifacts_review_status_check
    check (review_status in ('proposed', 'accepted', 'rejected', 'dismissed')),
  constraint gatekeeper_artifacts_confidence_check
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  constraint gatekeeper_artifacts_content_object_check
    check (jsonb_typeof(content) = 'object'),
  constraint gatekeeper_artifacts_review_fields_check
    check (
      (review_status = 'proposed' and reviewed_by is null and reviewed_at is null)
      or (review_status <> 'proposed' and reviewed_by is not null and reviewed_at is not null)
    ),
  constraint gatekeeper_artifacts_content_presence_check
    check (
      content_text is not null
      or content <> '{}'::jsonb
    )
);

create index if not exists gatekeeper_artifacts_company_status_idx
  on public.gatekeeper_artifacts (company_id, review_status, created_at desc);

create unique index if not exists gatekeeper_artifacts_company_id_id_unique_idx
  on public.gatekeeper_artifacts (company_id, id);

create index if not exists gatekeeper_artifacts_company_subject_idx
  on public.gatekeeper_artifacts (company_id, subject_type, subject_id, created_at desc)
  where subject_type is not null and subject_id is not null;

create index if not exists gatekeeper_artifacts_company_thread_idx
  on public.gatekeeper_artifacts (company_id, communication_thread_id, created_at desc)
  where communication_thread_id is not null;

create index if not exists gatekeeper_artifacts_company_message_idx
  on public.gatekeeper_artifacts (company_id, communication_message_id, created_at desc)
  where communication_message_id is not null;

create table if not exists public.gatekeeper_action_suggestions (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_artifact_id uuid,
  communication_thread_id uuid,
  communication_message_id uuid,
  subject_type public.canonical_record_subject_type,
  subject_id uuid,
  suggestion_type text not null,
  title text not null,
  rationale text,
  proposed_payload jsonb not null default '{}'::jsonb,
  status text not null default 'proposed',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gatekeeper_action_suggestions_artifact_company_fkey
    foreign key (company_id, source_artifact_id)
    references public.gatekeeper_artifacts(company_id, id)
    on delete set null (source_artifact_id),
  constraint gatekeeper_action_suggestions_thread_company_fkey
    foreign key (company_id, communication_thread_id)
    references public.communication_threads(company_id, id)
    on delete set null (communication_thread_id),
  constraint gatekeeper_action_suggestions_message_company_fkey
    foreign key (company_id, communication_message_id)
    references public.communication_messages(company_id, id)
    on delete set null (communication_message_id),
  constraint gatekeeper_action_suggestions_subject_pair_check
    check (
      (subject_type is null and subject_id is null)
      or (subject_type is not null and subject_id is not null)
    ),
  constraint gatekeeper_action_suggestions_type_check
    check (
      suggestion_type in (
        'create_opportunity',
        'update_opportunity',
        'schedule_site_assessment',
        'create_task_later',
        'send_followup_later',
        'update_project_notes',
        'flag_estimate_review',
        'flag_invoice_review',
        'flag_contract_review'
      )
    ),
  constraint gatekeeper_action_suggestions_status_check
    check (status in ('proposed', 'approved', 'rejected', 'dismissed', 'superseded')),
  constraint gatekeeper_action_suggestions_title_not_blank
    check (length(btrim(title)) > 0),
  constraint gatekeeper_action_suggestions_payload_object_check
    check (jsonb_typeof(proposed_payload) = 'object'),
  constraint gatekeeper_action_suggestions_review_fields_check
    check (
      (status = 'proposed' and reviewed_by is null and reviewed_at is null)
      or (status <> 'proposed' and reviewed_by is not null and reviewed_at is not null)
    )
);

create index if not exists gatekeeper_action_suggestions_company_status_idx
  on public.gatekeeper_action_suggestions (company_id, status, created_at desc);

create index if not exists gatekeeper_action_suggestions_company_subject_idx
  on public.gatekeeper_action_suggestions (company_id, subject_type, subject_id, created_at desc)
  where subject_type is not null and subject_id is not null;

create index if not exists gatekeeper_action_suggestions_company_artifact_idx
  on public.gatekeeper_action_suggestions (company_id, source_artifact_id, created_at desc)
  where source_artifact_id is not null;

create index if not exists gatekeeper_action_suggestions_company_thread_idx
  on public.gatekeeper_action_suggestions (company_id, communication_thread_id, created_at desc)
  where communication_thread_id is not null;

drop trigger if exists gatekeeper_artifacts_set_updated_at
  on public.gatekeeper_artifacts;
create trigger gatekeeper_artifacts_set_updated_at
before update on public.gatekeeper_artifacts
for each row
execute function public.set_updated_at();

drop trigger if exists gatekeeper_action_suggestions_set_updated_at
  on public.gatekeeper_action_suggestions;
create trigger gatekeeper_action_suggestions_set_updated_at
before update on public.gatekeeper_action_suggestions
for each row
execute function public.set_updated_at();

alter table public.gatekeeper_artifacts enable row level security;
alter table public.gatekeeper_artifacts force row level security;

alter table public.gatekeeper_action_suggestions enable row level security;
alter table public.gatekeeper_action_suggestions force row level security;

drop policy if exists gatekeeper_artifacts_select_by_membership
  on public.gatekeeper_artifacts;
create policy gatekeeper_artifacts_select_by_membership
on public.gatekeeper_artifacts
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists gatekeeper_artifacts_insert_by_membership
  on public.gatekeeper_artifacts;
create policy gatekeeper_artifacts_insert_by_membership
on public.gatekeeper_artifacts
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists gatekeeper_artifacts_update_by_membership
  on public.gatekeeper_artifacts;
create policy gatekeeper_artifacts_update_by_membership
on public.gatekeeper_artifacts
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check (
  updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists gatekeeper_action_suggestions_select_by_membership
  on public.gatekeeper_action_suggestions;
create policy gatekeeper_action_suggestions_select_by_membership
on public.gatekeeper_action_suggestions
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists gatekeeper_action_suggestions_insert_by_membership
  on public.gatekeeper_action_suggestions;
create policy gatekeeper_action_suggestions_insert_by_membership
on public.gatekeeper_action_suggestions
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

drop policy if exists gatekeeper_action_suggestions_update_by_membership
  on public.gatekeeper_action_suggestions;
create policy gatekeeper_action_suggestions_update_by_membership
on public.gatekeeper_action_suggestions
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check (
  updated_by = (select auth.uid())
  and (select public.is_active_company_member(company_id))
);

grant select, insert, update
on public.gatekeeper_artifacts
to authenticated;

grant select, insert, update
on public.gatekeeper_action_suggestions
to authenticated;

comment on column public.communication_threads.thread_category is
  'Provider-neutral communication thread category for future GateKeeper memory and review surfaces. This is not a separate CRM or inbox source of truth.';
comment on column public.communication_threads.channel_kind is
  'Provider-neutral channel label for the dominant or originating thread channel. External providers remain adapters.';
comment on column public.communication_threads.thread_status is
  'Lightweight communication thread state for future review queues; this does not mutate canonical workflow status.';
comment on column public.communication_messages.direction is
  'Provider-neutral communication direction for future timelines. Existing canonical records remain the source of workflow truth.';
comment on column public.communication_messages.source_kind is
  'Origin classification for human, assistant, system, or provider-placeholder messages. Assistant/provider rows must not own canonical business truth.';
comment on column public.communication_messages.channel_kind is
  'Provider-neutral message channel label such as phone, sms, email, web_chat, portal, internal_note, or assistant_note.';
comment on column public.communication_messages.occurred_at is
  'Operational occurrence timestamp for timeline ordering when it differs from row creation time.';

comment on table public.gatekeeper_artifacts is
  'Tenant-scoped GateKeeper memory artifacts linked to canonical communication and workflow records. Artifacts are reviewable memory, not autonomous AI truth.';
comment on column public.gatekeeper_artifacts.subject_type is
  'Optional canonical subject type. The subject record remains authoritative.';
comment on column public.gatekeeper_artifacts.subject_id is
  'Optional canonical subject id. GateKeeper artifacts do not mutate the subject record directly.';
comment on column public.gatekeeper_artifacts.content is
  'Structured provider-neutral artifact content. Do not store secrets, raw provider payloads, or duplicate canonical record snapshots.';
comment on column public.gatekeeper_artifacts.review_status is
  'Human review state for proposed memory artifacts. Proposed artifacts do not change canonical workflow truth.';

comment on table public.gatekeeper_action_suggestions is
  'Tenant-scoped GateKeeper proposed actions requiring human review. This table intentionally stores no execution state or autonomous workflow behavior.';
comment on column public.gatekeeper_action_suggestions.proposed_payload is
  'Provider-neutral proposed action payload for later human review. It must not be executed automatically in this foundation slice.';
comment on column public.gatekeeper_action_suggestions.status is
  'Human review state only. Approved does not mean executed; execution requires a future explicit workflow slice.';
