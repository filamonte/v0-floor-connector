drop policy if exists record_revisions_update_current_by_membership on public.record_revisions;
create policy record_revisions_update_current_by_membership
on public.record_revisions
for update
to authenticated
using ((select public.is_active_company_member(company_id)))
with check ((select public.is_active_company_member(company_id)));

comment on column public.record_revisions.is_current is 'Marks the latest revision for display. Previous current rows are made non-current by the server-side revision creation flow.';
