alter table public.jobs
  add column if not exists service_ticket_id uuid references public.service_tickets(id) on delete set null;

create index if not exists jobs_company_service_ticket_idx
  on public.jobs (company_id, service_ticket_id)
  where service_ticket_id is not null;

create or replace function public.validate_job_service_ticket_context()
returns trigger
language plpgsql
as $$
declare
  ticket_company_id uuid;
  ticket_customer_id uuid;
  ticket_project_id uuid;
  project_customer_id uuid;
begin
  if new.service_ticket_id is null then
    return new;
  end if;

  select
    ticket.company_id,
    ticket.customer_id,
    ticket.project_id
  into
    ticket_company_id,
    ticket_customer_id,
    ticket_project_id
  from public.service_tickets ticket
  where ticket.id = new.service_ticket_id;

  if ticket_company_id is null then
    raise exception 'Service ticket was not found for this job.';
  end if;

  if ticket_company_id <> new.company_id then
    raise exception 'Service ticket must belong to the same company as the job.';
  end if;

  select project.customer_id
  into project_customer_id
  from public.projects project
  where project.company_id = new.company_id
    and project.id = new.project_id;

  if project_customer_id is null then
    raise exception 'Job project was not found for this company.';
  end if;

  if project_customer_id <> ticket_customer_id then
    raise exception 'Service ticket customer must match the job project customer.';
  end if;

  if ticket_project_id is not null and ticket_project_id <> new.project_id then
    raise exception 'Service ticket project must match the linked service job project.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_job_service_ticket_context on public.jobs;
create trigger validate_job_service_ticket_context
before insert or update of company_id, project_id, service_ticket_id
on public.jobs
for each row
execute function public.validate_job_service_ticket_context();

comment on column public.jobs.service_ticket_id is
  'Optional canonical link from a follow-up service/warranty job back to the service ticket that created the visit/work order. The service ticket job_id remains the original install job context.';
