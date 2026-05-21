-- Expand evidence-only document delivery events to estimates and invoices.
-- Contracts intentionally stay out of this slice because contract send/signature
-- behavior remains on contract-specific tables and routes.

alter table public.document_delivery_events
  drop constraint if exists document_delivery_events_subject_type_check;

alter table public.document_delivery_events
  add constraint document_delivery_events_subject_type_check
  check (subject_type in ('warranty_document', 'estimate', 'invoice'));

create or replace function public.validate_document_delivery_event_subject()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  subject_company_id uuid;
  notification_company_id uuid;
begin
  if new.subject_type = 'warranty_document' then
    select document.company_id
      into subject_company_id
    from public.warranty_documents document
    where document.id = new.subject_id;
  elsif new.subject_type = 'estimate' then
    select estimate.company_id
      into subject_company_id
    from public.estimates estimate
    where estimate.id = new.subject_id;
  elsif new.subject_type = 'invoice' then
    select invoice.company_id
      into subject_company_id
    from public.invoices invoice
    where invoice.id = new.subject_id;
  else
    raise exception 'Unsupported document delivery subject type: %', new.subject_type;
  end if;

  if subject_company_id is null then
    raise exception 'Document delivery subject was not found.';
  end if;

  if subject_company_id <> new.company_id then
    raise exception 'Document delivery subject must belong to the same company.';
  end if;

  if new.related_notification_event_id is not null then
    select notification.company_id
      into notification_company_id
    from public.notification_events notification
    where notification.id = new.related_notification_event_id;

    if notification_company_id is null then
      raise exception 'Related notification event was not found.';
    end if;

    if notification_company_id <> new.company_id then
      raise exception 'Related notification event must belong to the same company.';
    end if;
  end if;

  return new;
end;
$$;

comment on table public.document_delivery_events is
  'Immutable evidence-only delivery proof events for canonical documents. Current subject support is warranty_document, estimate, and invoice.';
comment on column public.document_delivery_events.subject_type is
  'Canonical document subject namespace. Current support is warranty_document, estimate, and invoice; contracts remain deferred.';
