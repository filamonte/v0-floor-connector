create table if not exists public.data_export_events (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  requested_by uuid references public.users(id) on delete set null,
  module_key text not null,
  format text not null,
  status text not null,
  record_count integer,
  schema_version text not null,
  filename text,
  error_summary text,
  source text not null default 'settings_export',
  request_context jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint data_export_events_module_key_check
    check (
      module_key in (
        'customers',
        'customer_contacts',
        'projects',
        'estimates',
        'estimate_line_items',
        'invoices',
        'invoice_line_items',
        'payments',
        'jobs',
        'job_assignments'
      )
    ),
  constraint data_export_events_format_check
    check (format in ('csv', 'json')),
  constraint data_export_events_status_check
    check (status in ('success', 'failed')),
  constraint data_export_events_record_count_check
    check (record_count is null or record_count >= 0),
  constraint data_export_events_schema_version_not_blank
    check (length(btrim(schema_version)) > 0),
  constraint data_export_events_filename_not_blank
    check (filename is null or length(btrim(filename)) > 0),
  constraint data_export_events_error_summary_not_blank
    check (error_summary is null or length(btrim(error_summary)) > 0),
  constraint data_export_events_source_check
    check (source in ('settings_export')),
  constraint data_export_events_request_context_object_check
    check (request_context is null or jsonb_typeof(request_context) = 'object')
);

create index if not exists data_export_events_company_created_idx
  on public.data_export_events (company_id, created_at desc);

create index if not exists data_export_events_company_module_created_idx
  on public.data_export_events (company_id, module_key, created_at desc);

create index if not exists data_export_events_company_status_created_idx
  on public.data_export_events (company_id, status, created_at desc);

alter table public.data_export_events enable row level security;
alter table public.data_export_events force row level security;

drop policy if exists data_export_events_select_by_admin_scope
  on public.data_export_events;
create policy data_export_events_select_by_admin_scope
on public.data_export_events
for select
to authenticated
using (
  exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_export_events.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

drop policy if exists data_export_events_insert_by_admin_scope
  on public.data_export_events;
create policy data_export_events_insert_by_admin_scope
on public.data_export_events
for insert
to authenticated
with check (
  requested_by = (select auth.uid())
  and exists (
    select 1
    from public.company_memberships membership
    where membership.company_id = data_export_events.company_id
      and membership.user_id = (select auth.uid())
      and membership.membership_status = 'active'
      and membership.membership_role in ('owner', 'admin')
  )
);

grant select, insert
on public.data_export_events
to authenticated;

comment on table public.data_export_events is
  'Tenant-scoped audit trail for Data Export download attempts. Stores export metadata only; it is not a file archive, data snapshot, import source, or canonical business data source.';

comment on column public.data_export_events.record_count is
  'Approximate count of rows prepared for the export. Exported row contents are never stored here.';

comment on column public.data_export_events.filename is
  'Generated download filename only. The exported file contents are not stored.';

comment on column public.data_export_events.error_summary is
  'Short safe failure summary for operator support. Do not store private data, SQL, provider payloads, secrets, tokens, payment details, or exported row contents.';

comment on column public.data_export_events.request_context is
  'Safe request metadata only, such as route source or response format. Do not store credentials, cookies, authorization headers, env values, invite links, tokens, raw payloads, payment details, or exported rows.';
