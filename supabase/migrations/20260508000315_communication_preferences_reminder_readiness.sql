do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'communication_preference_subject_type'
  ) then
    create type public.communication_preference_subject_type as enum (
      'customer',
      'customer_contact',
      'contact'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'communication_preference_channel'
  ) then
    create type public.communication_preference_channel as enum (
      'email',
      'sms'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'communication_preference_message_category'
  ) then
    create type public.communication_preference_message_category as enum (
      'appointment_confirmation',
      'appointment_reminder'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'communication_preference_status'
  ) then
    create type public.communication_preference_status as enum (
      'allowed',
      'opted_out',
      'suppressed'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'communication_preference_source'
  ) then
    create type public.communication_preference_source as enum (
      'manual',
      'portal',
      'provider',
      'import',
      'system'
    );
  end if;
end
$$;

create table if not exists public.communication_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subject_type public.communication_preference_subject_type not null,
  subject_id uuid not null,
  channel public.communication_preference_channel not null,
  message_category public.communication_preference_message_category not null,
  status public.communication_preference_status not null,
  source public.communication_preference_source not null default 'manual',
  reason text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists communication_preferences_subject_unique_idx
  on public.communication_preferences (
    company_id,
    subject_type,
    subject_id,
    channel,
    message_category
  );

create index if not exists communication_preferences_company_channel_category_status_idx
  on public.communication_preferences (company_id, channel, message_category, status);

create index if not exists communication_preferences_company_subject_idx
  on public.communication_preferences (company_id, subject_type, subject_id);

drop trigger if exists communication_preferences_set_updated_at on public.communication_preferences;
create trigger communication_preferences_set_updated_at
before update on public.communication_preferences
for each row
execute function public.set_updated_at();

alter table public.communication_preferences enable row level security;
alter table public.communication_preferences force row level security;

drop policy if exists communication_preferences_select_by_membership on public.communication_preferences;
create policy communication_preferences_select_by_membership
on public.communication_preferences
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists communication_preferences_insert_by_membership on public.communication_preferences;
create policy communication_preferences_insert_by_membership
on public.communication_preferences
for insert
to authenticated
with check (
  (select public.is_active_company_member(company_id))
  and created_by = (select auth.uid())
);

drop policy if exists communication_preferences_update_by_membership on public.communication_preferences;
create policy communication_preferences_update_by_membership
on public.communication_preferences
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check (
  (select public.is_active_company_member(company_id))
  and updated_by = (select auth.uid())
);

comment on table public.communication_preferences is 'Tenant-scoped customer/contact communication preferences for future customer-facing delivery. V1 is contractor-managed only; portal/customer preference UI is not exposed.';
comment on column public.communication_preferences.subject_type is 'Canonical preference owner type. Customer and customer_contact are used for appointment reminder readiness; contact is retained for validated future direct-contact preferences.';
comment on column public.communication_preferences.subject_id is 'Record id for the selected canonical preference subject. Server utilities validate that the subject belongs to the same company.';
comment on column public.communication_preferences.channel is 'Delivery channel preference. SMS is stored as future-safe preference data only and is not used by appointment reminder readiness in this pass.';
comment on column public.communication_preferences.message_category is 'Customer-facing communication category affected by this preference.';
comment on column public.communication_preferences.status is 'Preference status. Explicit opted_out or suppressed rows block future delivery; missing email reminder rows default to allowed for V1 readiness.';
