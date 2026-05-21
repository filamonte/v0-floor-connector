revoke all on table public.user_estimate_template_preferences from anon;
revoke all on table public.user_estimate_template_preferences from authenticated;

grant select, insert, update, delete
on table public.user_estimate_template_preferences
to authenticated;
