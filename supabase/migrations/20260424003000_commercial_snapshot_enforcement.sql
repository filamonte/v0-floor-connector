alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_source_type_check;

alter table public.estimate_line_items
  add constraint estimate_line_items_source_type_check
  check (source_type in ('manual', 'catalog_item', 'system_component'));

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_new_rows_no_manual_check;

alter table public.estimate_line_items
  add constraint estimate_line_items_new_rows_no_manual_check
  check (
    created_at < timestamptz '2026-04-24 00:30:00+00'
    or source_type <> 'manual'
  )
  not valid;

alter table public.estimate_line_items
  drop constraint if exists estimate_line_items_new_rows_source_lineage_check;

alter table public.estimate_line_items
  add constraint estimate_line_items_new_rows_source_lineage_check
  check (
    created_at < timestamptz '2026-04-24 00:30:00+00'
    or (
      catalog_item_id is not null
      and (
        (
          source_type = 'catalog_item'
          and source_system_id is null
          and source_component_id is null
        )
        or (
          source_type = 'system_component'
          and source_system_id is not null
          and source_component_id is not null
        )
      )
    )
  )
  not valid;

create or replace function public.set_estimate_line_item_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.line_total := round(coalesce(new.quantity, 0) * coalesce(new.unit_price, 0), 2);
  return new;
end;
$$;

comment on constraint estimate_line_items_new_rows_no_manual_check on public.estimate_line_items is 'Existing rows may still violate this rule because they were created before server-owned insert enforcement was complete. New inserts and updates are still protected from manual source_type writes.';
comment on constraint estimate_line_items_new_rows_source_lineage_check on public.estimate_line_items is 'Existing rows may still violate lineage because they were created before server-owned insert enforcement was complete. New inserts and updates are still protected and must carry catalog lineage, with explicit system lineage for system-component rows.';

-- Diagnostic query for legacy rows that violate the new-write lineage rule.
-- Do not auto-fix here; investigate and remediate explicitly if needed.
-- select id, estimate_id, source_type, catalog_item_id, source_system_id, source_component_id, created_at
-- from public.estimate_line_items
-- where created_at >= timestamptz '2026-04-24 00:30:00+00'
--   and not (
--     catalog_item_id is not null
--     and (
--       (
--         source_type = 'catalog_item'
--         and source_system_id is null
--         and source_component_id is null
--       )
--       or (
--         source_type = 'system_component'
--         and source_system_id is not null
--         and source_component_id is not null
--       )
--     )
--   );
