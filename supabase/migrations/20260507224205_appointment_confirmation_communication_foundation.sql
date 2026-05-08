do $$
begin
  alter type public.canonical_record_subject_type add value if not exists 'appointment';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.communication_message_kind add value if not exists 'appointment_confirmation';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.communication_message_kind add value if not exists 'appointment_reminder';
exception
  when duplicate_object then null;
end $$;

create unique index if not exists appointments_company_id_id_unique_idx
  on public.appointments (company_id, id);

alter table public.communication_threads
  add column if not exists appointment_id uuid;

alter table public.communication_messages
  add column if not exists appointment_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'communication_threads_company_appointment_fkey'
      and conrelid = 'public.communication_threads'::regclass
  ) then
    alter table public.communication_threads
      add constraint communication_threads_company_appointment_fkey
      foreign key (company_id, appointment_id)
      references public.appointments(company_id, id)
      on delete set null (appointment_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'communication_messages_company_appointment_fkey'
      and conrelid = 'public.communication_messages'::regclass
  ) then
    alter table public.communication_messages
      add constraint communication_messages_company_appointment_fkey
      foreign key (company_id, appointment_id)
      references public.appointments(company_id, id)
      on delete set null (appointment_id);
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
      subject_type::text = 'appointment'
      and appointment_id is not null
      and appointment_id = subject_id
      and customer_id is not null
      and project_id is not null
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
    or appointment_id is not null
    or customer_id is not null
    or project_id is not null
  );

create index if not exists communication_threads_company_appointment_idx
  on public.communication_threads (company_id, appointment_id, last_message_at desc, updated_at desc)
  where appointment_id is not null;

create index if not exists communication_messages_company_appointment_idx
  on public.communication_messages (company_id, appointment_id, created_at desc)
  where appointment_id is not null;

create index if not exists communication_messages_appointment_kind_created_idx
  on public.communication_messages (company_id, appointment_id, message_kind, created_at desc)
  where appointment_id is not null;

drop policy if exists communication_threads_select_by_scope on public.communication_threads;
create policy communication_threads_select_by_scope
on public.communication_threads
for select
to authenticated
using (
  (select public.is_active_company_member(company_id))
  or (
    subject_type::text not in ('opportunity', 'appointment')
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
      subject_type::text not in ('opportunity', 'appointment')
      and opportunity_id is null
      and appointment_id is null
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
    subject_type::text not in ('opportunity', 'appointment')
    and opportunity_id is null
    and appointment_id is null
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
    subject_type::text not in ('opportunity', 'appointment')
    and opportunity_id is null
    and appointment_id is null
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
      and thread.appointment_id is not distinct from communication_messages.appointment_id
      and (
        (select public.is_active_company_member(thread.company_id))
        or (
          communication_messages.visibility = 'customer_visible'
          and thread.subject_type::text not in ('opportunity', 'appointment')
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
      and thread.appointment_id is not distinct from communication_messages.appointment_id
      and (
        (
          sender_type = 'organization_user'
          and (select public.is_active_company_member(thread.company_id))
        )
        or (
          sender_type = 'portal_user'
          and communication_messages.visibility = 'customer_visible'
          and communication_messages.message_kind = 'customer_message'
          and thread.subject_type::text not in ('opportunity', 'appointment')
          and thread.customer_id is not null
          and thread.project_id is not null
          and (select public.has_active_portal_customer_access(thread.company_id, thread.customer_id))
          and (select public.has_active_portal_project_access(thread.company_id, thread.project_id))
        )
      )
  )
);

comment on column public.communication_threads.appointment_id is 'Optional canonical appointment subject link for customer-facing appointment confirmation and reminder logs.';
comment on column public.communication_messages.appointment_id is 'Optional canonical appointment link copied from the parent thread for appointment confirmation and future reminder logs.';
comment on column public.communication_messages.message_kind is 'Durable message/log kind for manual calls, notes, voicemail, customer messages, appointment notes, appointment confirmations, future appointment reminders, and future provider-backed messages.';
