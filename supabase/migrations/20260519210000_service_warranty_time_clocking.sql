alter table public.time_punch_events
  add column if not exists service_ticket_id uuid references public.service_tickets(id) on delete set null;

alter table public.time_cards
  add column if not exists service_ticket_id uuid references public.service_tickets(id) on delete set null;

create index if not exists time_punch_events_company_service_ticket_idx
  on public.time_punch_events (company_id, service_ticket_id)
  where service_ticket_id is not null;

create index if not exists time_cards_company_service_ticket_work_date_idx
  on public.time_cards (company_id, service_ticket_id, work_date desc)
  where service_ticket_id is not null;

create or replace function public.validate_time_service_ticket_context()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket_company_id uuid;
  ticket_project_id uuid;
  ticket_job_id uuid;
begin
  if new.service_ticket_id is null then
    return new;
  end if;

  select ticket.company_id, ticket.project_id, ticket.job_id
    into ticket_company_id, ticket_project_id, ticket_job_id
  from public.service_tickets ticket
  where ticket.id = new.service_ticket_id;

  if ticket_company_id is null or ticket_company_id <> new.company_id then
    raise exception 'Time service ticket must belong to the same company.';
  end if;

  if ticket_project_id is not null then
    if new.project_id is not null and new.project_id <> ticket_project_id then
      raise exception 'Time project must match the service ticket project.';
    end if;

    if new.project_id is null then
      new.project_id := ticket_project_id;
    end if;
  end if;

  if ticket_job_id is not null then
    if new.job_id is not null and new.job_id <> ticket_job_id then
      raise exception 'Time job must match the service ticket job.';
    end if;

    if new.job_id is null then
      new.job_id := ticket_job_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_time_punch_event_service_ticket_context_trigger
  on public.time_punch_events;

create trigger validate_time_punch_event_service_ticket_context_trigger
before insert or update on public.time_punch_events
for each row
execute function public.validate_time_service_ticket_context();

drop trigger if exists validate_time_card_service_ticket_context_trigger
  on public.time_cards;

create trigger validate_time_card_service_ticket_context_trigger
before insert or update on public.time_cards
for each row
execute function public.validate_time_service_ticket_context();

comment on column public.time_punch_events.service_ticket_id is
  'Optional service/warranty ticket context for canonical punch events. This does not create a separate service time system.';

comment on column public.time_cards.service_ticket_id is
  'Optional service/warranty ticket context copied from derived punch evidence for manager review summaries.';
