insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists documents_objects_select_by_company_membership on storage.objects;
create policy documents_objects_select_by_company_membership
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and array_length(storage.foldername(name), 1) > 0
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and public.is_active_company_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists documents_objects_insert_by_company_membership on storage.objects;
create policy documents_objects_insert_by_company_membership
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and array_length(storage.foldername(name), 1) > 0
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and public.is_active_company_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists documents_objects_update_by_company_membership on storage.objects;
create policy documents_objects_update_by_company_membership
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and array_length(storage.foldername(name), 1) > 0
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and public.is_active_company_member(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'documents'
  and array_length(storage.foldername(name), 1) > 0
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and public.is_active_company_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists documents_objects_delete_by_company_membership on storage.objects;
create policy documents_objects_delete_by_company_membership
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and array_length(storage.foldername(name), 1) > 0
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and public.is_active_company_member(((storage.foldername(name))[1])::uuid)
);
