do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'time_card_review_status'
  ) then
    create type public.time_card_review_status as enum (
      'draft',
      'needs_review',
      'approved',
      'rejected'
    );
  end if;
end
$$;

alter table public.time_cards
  add column if not exists review_status public.time_card_review_status not null default 'needs_review',
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text;

update public.time_cards
set review_status = case
  when status = 'open' then 'draft'::public.time_card_review_status
  when status in ('completed', 'edited', 'flagged') then 'needs_review'::public.time_card_review_status
  else review_status
end
where review_status = 'needs_review';

create index if not exists time_cards_company_review_status_idx
  on public.time_cards (company_id, review_status);

create index if not exists time_cards_company_review_work_date_idx
  on public.time_cards (company_id, review_status, work_date desc);

comment on column public.time_cards.review_status is 'Manager review state for the derived time-card summary. Punch events remain the canonical audit source.';
comment on column public.time_cards.reviewed_by is 'User who last approved or rejected the derived time-card summary.';
comment on column public.time_cards.reviewed_at is 'Timestamp of the latest manager review action.';
comment on column public.time_cards.review_notes is 'Manager review notes or rejection reason. Does not overwrite punch-event audit truth.';
