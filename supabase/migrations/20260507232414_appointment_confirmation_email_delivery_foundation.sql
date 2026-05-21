create unique index if not exists communication_messages_company_id_id_unique_idx
  on public.communication_messages (company_id, id);

alter table public.notification_deliveries
  add column if not exists communication_message_id uuid;

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_company_communication_message_fkey;

alter table public.notification_deliveries
  add constraint notification_deliveries_company_communication_message_fkey
  foreign key (company_id, communication_message_id)
  references public.communication_messages(company_id, id)
  on delete set null (communication_message_id);

create index if not exists notification_deliveries_company_communication_message_idx
  on public.notification_deliveries (company_id, communication_message_id, created_at desc)
  where communication_message_id is not null;

comment on column public.notification_deliveries.communication_message_id is 'Optional canonical communication message delivered through this provider attempt. The message is the customer communication history; this delivery row is provider audit telemetry.';
