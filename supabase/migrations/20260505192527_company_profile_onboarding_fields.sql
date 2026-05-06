alter table public.companies
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website_url text,
  add column if not exists primary_trade text,
  add column if not exists brand_accent_color text,
  add column if not exists time_zone text;

alter table public.companies
  drop constraint if exists companies_email_format_check,
  add constraint companies_email_format_check
    check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') not valid;

alter table public.companies
  drop constraint if exists companies_website_url_format_check,
  add constraint companies_website_url_format_check
    check (website_url is null or website_url ~* '^https?://') not valid;

alter table public.companies
  drop constraint if exists companies_brand_accent_color_format_check,
  add constraint companies_brand_accent_color_format_check
    check (brand_accent_color is null or brand_accent_color ~* '^#[0-9a-f]{6}$') not valid;

comment on column public.companies.phone is
  'Optional contractor organization phone number used for customer-facing company profile surfaces.';

comment on column public.companies.email is
  'Optional contractor organization email used for customer-facing company profile surfaces.';

comment on column public.companies.website_url is
  'Optional contractor organization website URL.';

comment on column public.companies.primary_trade is
  'Optional primary trade or service type captured during contractor company setup.';

comment on column public.companies.brand_accent_color is
  'Optional hex brand accent color for tenant-owned company branding.';

comment on column public.companies.time_zone is
  'Optional IANA-style time zone preference captured during contractor company setup.';
