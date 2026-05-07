alter table public.opportunities
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists next_follow_up_note text;

create index if not exists opportunities_company_next_follow_up_idx
  on public.opportunities (company_id, next_follow_up_at asc)
  where next_follow_up_at is not null;

comment on column public.opportunities.next_follow_up_at is 'Optional contractor-managed next follow-up timestamp for lead/opportunity follow-through.';
comment on column public.opportunities.next_follow_up_note is 'Optional internal follow-up note for the next lead/opportunity follow-through action.';

alter table public.appointments
  add column if not exists customer_visible boolean not null default false,
  add column if not exists customer_notes text,
  add column if not exists internal_notes text;

update public.appointments
set internal_notes = notes
where internal_notes is null
  and notes is not null;

create index if not exists appointments_company_customer_visible_idx
  on public.appointments (company_id, customer_visible, starts_at asc)
  where customer_visible is true;

comment on column public.appointments.customer_visible is 'Explicit customer/portal visibility flag. Defaults false; portal display requires future safe loaders/RLS.';
comment on column public.appointments.customer_notes is 'Customer-facing appointment notes safe for future portal display when customer_visible is true.';
comment on column public.appointments.internal_notes is 'Internal appointment notes for contractor users. Do not expose through customer portal loaders.';
comment on column public.appointments.notes is 'Legacy/internal contractor appointment notes. Treat as internal unless copied into customer_notes by an approved workflow.';

do $$
begin
  alter type public.canonical_record_subject_type add value if not exists 'opportunity';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.communication_message_kind as enum (
    'customer_message',
    'manual_call',
    'manual_email_note',
    'manual_text_note',
    'voicemail',
    'internal_note',
    'appointment_note'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.communication_message_visibility as enum (
    'internal',
    'customer_visible'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.communication_message_delivery_status as enum (
    'logged',
    'draft',
    'sent'
  );
exception
  when duplicate_object then null;
end $$;

create unique index if not exists opportunities_company_id_id_unique_idx
  on public.opportunities (company_id, id);

alter table public.communication_threads
  add column if not exists opportunity_id uuid,
  add column if not exists last_message_visibility public.communication_message_visibility not null default 'customer_visible';

alter table public.communication_messages
  add column if not exists opportunity_id uuid,
  add column if not exists message_kind public.communication_message_kind not null default 'customer_message',
  add column if not exists visibility public.communication_message_visibility not null default 'customer_visible',
  add column if not exists delivery_status public.communication_message_delivery_status not null default 'logged';

alter table public.communication_threads
  alter column customer_id drop not null,
  alter column project_id drop not null;

alter table public.communication_messages
  alter column customer_id drop not null,
  alter column project_id drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'communication_threads_company_opportunity_fkey'
      and conrelid = 'public.communication_threads'::regclass
  ) then
    alter table public.communication_threads
      add constraint communication_threads_company_opportunity_fkey
      foreign key (company_id, opportunity_id)
      references public.opportunities(company_id, id)
      on delete set null (opportunity_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'communication_messages_company_opportunity_fkey'
      and conrelid = 'public.communication_messages'::regclass
  ) then
    alter table public.communication_messages
      add constraint communication_messages_company_opportunity_fkey
      foreign key (company_id, opportunity_id)
      references public.opportunities(company_id, id)
      on delete set null (opportunity_id);
  end if;
end $$;

alter table public.communication_threads
  drop constraint if exists communication_threads_subject_linkage_check;

alter table public.communication_threads
  add constraint communication_threads_subject_linkage_check
  check (
    (
      subject_type::text = 'opportunity'
      and opportunity_id is not null
      and opportunity_id = subject_id
    )
    or (
      subject_type::text = 'customer'
      and customer_id is not null
      and customer_id = subject_id
    )
    or (
      subject_type::text = 'project'
      and customer_id is not null
      and project_id is not null
      and project_id = subject_id
    )
    or (
      subject_type::text in ('estimate', 'contract', 'invoice', 'change_order', 'payment')
      and customer_id is not null
      and project_id is not null
    )
  );

alter table public.communication_messages
  drop constraint if exists communication_messages_thread_linkage_check;

alter table public.communication_messages
  add constraint communication_messages_thread_linkage_check
  check (
    opportunity_id is not null
    or customer_id is not null
    or project_id is not null
  );

create index if not exists communication_threads_company_opportunity_idx
  on public.communication_threads (company_id, opportunity_id, last_message_at desc, updated_at desc)
  where opportunity_id is not null;

create index if not exists communication_messages_company_opportunity_idx
  on public.communication_messages (company_id, opportunity_id, created_at desc)
  where opportunity_id is not null;

create index if not exists communication_messages_thread_visibility_created_idx
  on public.communication_messages (thread_id, visibility, created_at desc);

drop policy if exists communication_threads_select_by_scope on public.communication_threads;
create policy communication_threads_select_by_scope
on public.communication_threads
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (
    subject_type::text <> 'opportunity'
    and customer_id is not null
    and project_id is not null
    and last_message_visibility = 'customer_visible'
    and (select public.has_active_portal_customer_access(company_id, customer_id))
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
      subject_type::text <> 'opportunity'
      and opportunity_id is null
      and customer_id is not null
      and project_id is not null
      and (select public.has_active_portal_customer_access(company_id, customer_id))
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
    subject_type::text <> 'opportunity'
    and opportunity_id is null
    and customer_id is not null
    and project_id is not null
    and last_message_visibility = 'customer_visible'
    and (select public.has_active_portal_customer_access(company_id, customer_id))
    and (select public.has_active_portal_project_access(company_id, project_id))
  )
)
with check (
  (select public.is_active_company_member(company_id))
  or (
    subject_type::text <> 'opportunity'
    and opportunity_id is null
    and customer_id is not null
    and project_id is not null
    and last_message_visibility = 'customer_visible'
    and (select public.has_active_portal_customer_access(company_id, customer_id))
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
      and thread.customer_id is not distinct from communication_messages.customer_id
      and thread.project_id is not distinct from communication_messages.project_id
      and thread.opportunity_id is not distinct from communication_messages.opportunity_id
      and (
        (select public.is_active_company_member(thread.company_id))
        or (
          communication_messages.visibility = 'customer_visible'
          and thread.subject_type::text <> 'opportunity'
          and thread.customer_id is not null
          and thread.project_id is not null
          and (select public.has_active_portal_customer_access(thread.company_id, thread.customer_id))
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
      and thread.customer_id is not distinct from communication_messages.customer_id
      and thread.project_id is not distinct from communication_messages.project_id
      and thread.opportunity_id is not distinct from communication_messages.opportunity_id
      and (
        (
          sender_type = 'organization_user'
          and (select public.is_active_company_member(thread.company_id))
        )
        or (
          sender_type = 'portal_user'
          and communication_messages.visibility = 'customer_visible'
          and communication_messages.message_kind = 'customer_message'
          and thread.subject_type::text <> 'opportunity'
          and thread.customer_id is not null
          and thread.project_id is not null
          and (select public.has_active_portal_customer_access(thread.company_id, thread.customer_id))
          and (select public.has_active_portal_project_access(thread.company_id, thread.project_id))
        )
      )
  )
);

comment on column public.communication_threads.opportunity_id is 'Optional canonical opportunity subject link for pre-conversion lead communication.';
comment on column public.communication_threads.last_message_visibility is 'Visibility of the current thread preview. Portal policies require customer_visible to avoid internal preview leakage.';
comment on column public.communication_messages.opportunity_id is 'Optional canonical opportunity link copied from the parent thread for pre-conversion lead communication.';
comment on column public.communication_messages.message_kind is 'Durable message/log kind for manual calls, notes, voicemail, customer messages, appointment notes, and future provider-backed messages.';
comment on column public.communication_messages.visibility is 'Explicit message visibility. Manual logs default to internal in server utilities; customer-visible content must be deliberate.';
comment on column public.communication_messages.delivery_status is 'Logging/delivery status for manual and future provider-backed communication. Manual logs use logged.';
comment on table public.communication_threads is 'Canonical record-attached communication threads, including opportunity/customer/project chain subjects. Not a duplicate lead or project model.';
comment on table public.communication_messages is 'Immutable messages and manual communication logs inside canonical communication threads. Internal visibility must not be exposed to portal users.';
