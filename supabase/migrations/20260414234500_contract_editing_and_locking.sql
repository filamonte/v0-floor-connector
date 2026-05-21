alter table public.contracts
  add column if not exists signature_provider text,
  add column if not exists signature_provider_reference text,
  add column if not exists signature_started_at timestamptz,
  add column if not exists locked_at timestamptz,
  add column if not exists edit_lock_reason text;

create table if not exists public.contract_revisions (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contract_id uuid not null,
  revision_number integer not null,
  title text not null,
  rendered_subject text,
  rendered_content text not null,
  edit_summary text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint contract_revisions_contract_company_fkey
    foreign key (company_id, contract_id)
    references public.contracts(company_id, id)
    on delete cascade,
  constraint contract_revisions_revision_number_positive_check
    check (revision_number > 0)
);

create unique index if not exists contract_revisions_company_contract_revision_unique_idx
  on public.contract_revisions (company_id, contract_id, revision_number);

create index if not exists contract_revisions_contract_created_idx
  on public.contract_revisions (contract_id, created_at desc);

create or replace function public.is_contract_editable(target_contract public.contracts)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select (
    target_contract.status = 'draft'
    and target_contract.signature_started_at is null
    and target_contract.signed_at is null
    and target_contract.locked_at is null
  );
$$;

create or replace function public.assign_contract_lock_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('sent', 'viewed', 'signed') then
    if new.signature_started_at is null then
      new.signature_started_at := timezone('utc', now());
    end if;

    if new.locked_at is null then
      new.locked_at := timezone('utc', now());
    end if;

    if new.edit_lock_reason is null then
      new.edit_lock_reason := 'signature_activity_started';
    end if;
  elsif new.status = 'void' and new.locked_at is null and old.status <> 'void' then
    new.locked_at := timezone('utc', now());
    if new.edit_lock_reason is null then
      new.edit_lock_reason := 'voided';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_locked_contract_content_edits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    new.title is distinct from old.title or
    new.rendered_subject is distinct from old.rendered_subject or
    new.rendered_content is distinct from old.rendered_content or
    new.template_id is distinct from old.template_id
  ) and not public.is_contract_editable(old) then
    raise exception 'This contract is locked and can no longer be edited.';
  end if;

  return new;
end;
$$;

create or replace function public.create_contract_revision_snapshot(
  target_contract_id uuid,
  acting_user_id uuid default null,
  summary text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_contract public.contracts%rowtype;
  next_revision_number integer;
  inserted_revision_id uuid;
begin
  select *
  into target_contract
  from public.contracts
  where id = target_contract_id;

  if not found then
    return null;
  end if;

  if not public.is_contract_editable(target_contract) then
    raise exception 'This contract is locked and can no longer be edited.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_contract.company_id::text || ':contract-revision:' || target_contract_id::text, 0));

  select coalesce(max(revision_number), 0) + 1
  into next_revision_number
  from public.contract_revisions
  where contract_id = target_contract_id;

  insert into public.contract_revisions (
    company_id,
    contract_id,
    revision_number,
    title,
    rendered_subject,
    rendered_content,
    edit_summary,
    created_by
  ) values (
    target_contract.company_id,
    target_contract_id,
    next_revision_number,
    target_contract.title,
    target_contract.rendered_subject,
    target_contract.rendered_content,
    summary,
    acting_user_id
  )
  returning id into inserted_revision_id;

  return inserted_revision_id;
end;
$$;

drop trigger if exists assign_contract_lock_state on public.contracts;
create trigger assign_contract_lock_state
before update of status, signature_started_at, signed_at on public.contracts
for each row
execute function public.assign_contract_lock_state();

drop trigger if exists prevent_locked_contract_content_edits on public.contracts;
create trigger prevent_locked_contract_content_edits
before update of title, rendered_subject, rendered_content, template_id on public.contracts
for each row
execute function public.prevent_locked_contract_content_edits();

alter table public.contract_revisions enable row level security;
alter table public.contract_revisions force row level security;

drop policy if exists contract_revisions_select_by_membership on public.contract_revisions;
create policy contract_revisions_select_by_membership
on public.contract_revisions
for select
to authenticated
using ((select public.is_active_company_member(company_id)));

drop policy if exists contract_revisions_insert_by_membership on public.contract_revisions;
create policy contract_revisions_insert_by_membership
on public.contract_revisions
for insert
to authenticated
with check ((select public.is_active_company_member(company_id)));

comment on table public.contract_revisions is 'Audit-friendly snapshots of editable contract content taken before draft contract edits. This supports lightweight pre-sign editing without introducing a disconnected signed-document model.';
comment on function public.is_contract_editable(public.contracts) is 'Contracts remain editable only while still in draft and before signature activity has started.';
comment on function public.create_contract_revision_snapshot(uuid, uuid, text) is 'Creates a revision snapshot of the current draft contract before an edit is applied.';
comment on column public.contracts.signature_provider is 'Future e-sign integration identifier such as signwell. Kept on the canonical contract record so provider workflows do not fork document identity.';
comment on column public.contracts.signature_provider_reference is 'Future provider packet or envelope identifier for signature synchronization.';
comment on column public.contracts.signature_started_at is 'Timestamp when signature activity begins. Once populated, draft content editing is locked.';
comment on column public.contracts.locked_at is 'Timestamp when unrestricted draft editing became locked.';
comment on column public.contracts.edit_lock_reason is 'Lightweight reason for why the contract can no longer be freely edited, such as signature_activity_started, signed, or voided.';
