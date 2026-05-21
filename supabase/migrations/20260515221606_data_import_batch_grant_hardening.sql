revoke all
on public.data_import_batches
from anon, authenticated;

revoke all
on public.data_import_rows
from anon, authenticated;

grant select, insert, update
on public.data_import_batches
to authenticated;

grant select, insert, update
on public.data_import_rows
to authenticated;
