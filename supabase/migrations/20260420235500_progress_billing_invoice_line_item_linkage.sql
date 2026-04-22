alter table public.invoice_line_items
  add column if not exists schedule_of_value_item_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoice_line_items_sov_item_company_fkey'
  ) then
    alter table public.invoice_line_items
      add constraint invoice_line_items_sov_item_company_fkey
      foreign key (schedule_of_value_item_id)
      references public.schedule_of_value_items (id)
      on delete set null;
  end if;
end
$$;

create index if not exists invoice_line_items_sov_item_idx
  on public.invoice_line_items (company_id, schedule_of_value_item_id);

comment on column public.invoice_line_items.schedule_of_value_item_id is 'Optional canonical link back to the schedule-of-values row billed by this invoice line item.';
