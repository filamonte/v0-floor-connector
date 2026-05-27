create index if not exists execution_attachments_company_work_item_subject_idx
  on public.execution_attachments (company_id, subject_id, created_at desc)
  where subject_type = 'work_item';

comment on column public.execution_attachments.subject_type is
  'Restricts execution attachments to approved internal execution subjects: Daily Logs, Job Notes, and internal Work Items. Work Item evidence remains contractor-only unless a later explicit sharing policy supports it.';
