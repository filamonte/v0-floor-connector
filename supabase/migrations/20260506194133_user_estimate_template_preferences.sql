create table if not exists public.user_estimate_template_preferences (
  organization_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  preferred_estimate_template_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users(id),
  updated_by uuid references public.users(id),
  constraint user_estimate_template_preferences_pkey primary key (organization_id, user_id),
  constraint user_estimate_template_preferences_template_fkey
    foreign key (organization_id, preferred_estimate_template_id)
    references public.document_templates(company_id, id)
    on delete cascade
);

create index if not exists user_estimate_template_preferences_template_idx
  on public.user_estimate_template_preferences (
    organization_id,
    preferred_estimate_template_id
  );

drop trigger if exists user_estimate_template_preferences_set_updated_at
  on public.user_estimate_template_preferences;
create trigger user_estimate_template_preferences_set_updated_at
before update on public.user_estimate_template_preferences
for each row
execute function public.set_updated_at();

alter table public.user_estimate_template_preferences enable row level security;
alter table public.user_estimate_template_preferences force row level security;

drop policy if exists user_estimate_template_preferences_select_own
  on public.user_estimate_template_preferences;
create policy user_estimate_template_preferences_select_own
on public.user_estimate_template_preferences
for select
to authenticated
using (
  (select auth.uid()) is not null
  and
  user_id = (select auth.uid())
  and (select public.is_active_company_member(organization_id))
);

drop policy if exists user_estimate_template_preferences_insert_own
  on public.user_estimate_template_preferences;
create policy user_estimate_template_preferences_insert_own
on public.user_estimate_template_preferences
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and
  user_id = (select auth.uid())
  and (select public.is_active_company_member(organization_id))
  and exists (
    select 1
    from public.document_templates template
    where template.company_id = organization_id
      and template.id = preferred_estimate_template_id
      and template.template_type = 'estimate'
      and template.status = 'active'
  )
);

drop policy if exists user_estimate_template_preferences_update_own
  on public.user_estimate_template_preferences;
create policy user_estimate_template_preferences_update_own
on public.user_estimate_template_preferences
for update
to authenticated
using (
  (select auth.uid()) is not null
  and
  user_id = (select auth.uid())
  and (select public.is_active_company_member(organization_id))
)
with check (
  (select auth.uid()) is not null
  and
  user_id = (select auth.uid())
  and (select public.is_active_company_member(organization_id))
  and exists (
    select 1
    from public.document_templates template
    where template.company_id = organization_id
      and template.id = preferred_estimate_template_id
      and template.template_type = 'estimate'
      and template.status = 'active'
  )
);

drop policy if exists user_estimate_template_preferences_delete_own
  on public.user_estimate_template_preferences;
create policy user_estimate_template_preferences_delete_own
on public.user_estimate_template_preferences
for delete
to authenticated
using (
  (select auth.uid()) is not null
  and
  user_id = (select auth.uid())
  and (select public.is_active_company_member(organization_id))
);

grant select, insert, update, delete
on public.user_estimate_template_preferences
to authenticated;

comment on table public.user_estimate_template_preferences is
  'Narrow personal preference table for the authenticated contractor user preferred estimate document template. Organization defaults remain business truth.';
comment on column public.user_estimate_template_preferences.preferred_estimate_template_id is
  'Personal preferred active estimate document template for this user within this organization. It does not mutate organization defaults or existing estimates.';
