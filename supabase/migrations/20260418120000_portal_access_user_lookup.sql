create or replace function public.lookup_portal_user_by_email(target_email text)
returns table (
  user_id uuid,
  email text,
  full_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    user_record.id as user_id,
    user_record.email,
    user_record.full_name
  from public.users user_record
  where lower(user_record.email) = lower(trim(target_email))
    and user_record.lifecycle_state = 'active'
  limit 1
$$;

comment on function public.lookup_portal_user_by_email(text) is 'Resolves an existing canonical authenticated user by email for contractor-side portal access management without exposing the broader users table.';
