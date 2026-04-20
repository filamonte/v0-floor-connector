alter table public.companies
  add column if not exists logo_url text;

comment on column public.companies.logo_url is 'Optional tenant-configured logo URL used in contractor-facing shell and shared branded surfaces.';
