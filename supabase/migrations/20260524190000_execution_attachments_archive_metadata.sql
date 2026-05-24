alter table public.execution_attachments
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.users(id) on delete set null,
  add column if not exists archive_reason text,
  add column if not exists restored_at timestamptz,
  add column if not exists restored_by uuid references public.users(id) on delete set null,
  add column if not exists restore_reason text;

create index if not exists execution_attachments_company_subject_active_idx
  on public.execution_attachments (company_id, subject_type, subject_id, created_at desc)
  where archived_at is null;

create index if not exists execution_attachments_company_archived_at_idx
  on public.execution_attachments (company_id, archived_at)
  where archived_at is not null;

comment on column public.execution_attachments.archived_at is
  'When set, hides the field evidence attachment from active contractor evidence rows and proof counts without deleting the storage object.';
comment on column public.execution_attachments.archived_by is
  'Organization user who archived the field evidence attachment.';
comment on column public.execution_attachments.archive_reason is
  'Optional contractor-entered reason for hiding field evidence from active workflow views.';
comment on column public.execution_attachments.restored_at is
  'When set, records the latest restore time after a metadata archive.';
comment on column public.execution_attachments.restored_by is
  'Organization user who most recently restored the field evidence attachment.';
comment on column public.execution_attachments.restore_reason is
  'Optional contractor-entered reason for restoring archived field evidence.';
