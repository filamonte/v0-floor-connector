create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.execute_platform_starter_pack_provisioning_run(
  p_run_id uuid,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.platform_starter_pack_provisioning_runs%rowtype;
  v_pack_status text;
  v_item public.platform_starter_pack_provisioning_run_items%rowtype;
  v_template_seed public.platform_template_seeds%rowtype;
  v_catalog_seed public.platform_catalog_item_seeds%rowtype;
  v_existing_destination_id uuid;
  v_destination_id uuid;
  v_item_count integer := 0;
  v_created_template_count integer := 0;
  v_created_catalog_item_count integer := 0;
  v_skipped_count integer := 0;
  v_catalog_sort_order integer := 0;
  v_now timestamptz := timezone('utc', now());
begin
  select *
  into v_run
  from public.platform_starter_pack_provisioning_runs
  where id = p_run_id
  for update;

  if not found then
    raise exception 'Provisioning run was not found.';
  end if;

  if v_run.status in ('completed', 'completed_with_warnings') then
    select
      count(*) filter (
        where action = 'created'
          and destination_record_type = 'document_template'
      ),
      count(*) filter (
        where action = 'created'
          and destination_record_type = 'catalog_item'
      ),
      count(*) filter (where action = 'skipped_existing')
    into
      v_created_template_count,
      v_created_catalog_item_count,
      v_skipped_count
    from public.platform_starter_pack_provisioning_run_items
    where run_id = p_run_id;

    return jsonb_build_object(
      'runId', p_run_id,
      'status', v_run.status,
      'alreadyCompleted', true,
      'createdTemplateCount', coalesce(v_created_template_count, 0),
      'createdCatalogItemCount', coalesce(v_created_catalog_item_count, 0),
      'skippedCount', coalesce(v_skipped_count, 0),
      'message', 'Provisioning run was already completed. No duplicate records were created.'
    );
  end if;

  if v_run.status = 'running' then
    raise exception 'Provisioning run is already running.';
  end if;

  if v_run.status <> 'approved' then
    raise exception 'Only approved provisioning runs can be executed.';
  end if;

  select status
  into v_pack_status
  from public.platform_starter_packs
  where id = v_run.starter_pack_id;

  if not found then
    raise exception 'Starter pack is unavailable.';
  end if;

  if v_pack_status <> 'published' then
    raise exception 'Starter pack must be published before execution.';
  end if;

  perform 1
  from public.companies
  where id = v_run.organization_id;

  if not found then
    raise exception 'Target organization is unavailable.';
  end if;

  select count(*)
  into v_item_count
  from public.platform_starter_pack_provisioning_run_items
  where run_id = p_run_id;

  if v_item_count < 1 then
    raise exception 'Provisioning run has no audit items.';
  end if;

  perform 1
  from public.platform_starter_pack_provisioning_run_items
  where run_id = p_run_id
    and (
      action not in ('would_create', 'skipped_existing')
      or status not in ('pending', 'skipped')
    )
  limit 1;

  if found then
    raise exception 'Provisioning run contains blocked, failed, or unsupported audit items.';
  end if;

  perform 1
  from public.platform_starter_pack_provisioning_run_items
  where run_id = p_run_id
    and action = 'would_create'
    and destination_record_id is not null
  limit 1;

  if found then
    raise exception 'Provisioning run already has destination ids on create items.';
  end if;

  update public.platform_starter_pack_provisioning_runs
  set
    status = 'running',
    started_at = coalesce(started_at, v_now),
    error_message = null,
    updated_at = v_now
  where id = p_run_id;

  select coalesce(max(sort_order), 0)
  into v_catalog_sort_order
  from public.catalog_items
  where company_id = v_run.organization_id;

  for v_item in
    select *
    from public.platform_starter_pack_provisioning_run_items
    where run_id = p_run_id
    order by created_at, id
    for update
  loop
    v_existing_destination_id := null;
    v_destination_id := null;

    if v_item.action = 'skipped_existing' then
      if (v_item.destination_snapshot ->> 'matchingExistingRecordId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        v_existing_destination_id := (v_item.destination_snapshot ->> 'matchingExistingRecordId')::uuid;
      end if;

      if v_existing_destination_id is not null then
        if v_item.destination_record_type = 'document_template' then
          perform 1
          from public.document_templates
          where id = v_existing_destination_id
            and company_id = v_run.organization_id;
        elsif v_item.destination_record_type = 'catalog_item' then
          perform 1
          from public.catalog_items
          where id = v_existing_destination_id
            and company_id = v_run.organization_id;
        else
          raise exception 'Unsupported skipped destination type.';
        end if;

        if not found then
          raise exception 'Skipped existing destination is no longer available.';
        end if;
      end if;

      update public.platform_starter_pack_provisioning_run_items
      set
        destination_record_id = v_existing_destination_id,
        action = 'skipped_existing',
        status = 'skipped',
        destination_snapshot = coalesce(destination_snapshot, '{}'::jsonb) ||
          jsonb_build_object(
            'executionAction', 'skipped_existing',
            'destinationRecordId', v_existing_destination_id,
            'executedAt', v_now
          ),
        reason = coalesce(reason, 'Existing organization-owned record was skipped.'),
        updated_at = v_now
      where id = v_item.id;

      v_skipped_count := v_skipped_count + 1;
      continue;
    end if;

    if v_item.source_item_type = 'template_seed' then
      select *
      into v_template_seed
      from public.platform_template_seeds
      where id = v_item.source_template_seed_id
        and is_active = true;

      if not found then
        raise exception 'Template seed is unavailable or inactive.';
      end if;

      perform 1
      from public.platform_starter_pack_items
      where id = v_item.starter_pack_item_id
        and starter_pack_id = v_run.starter_pack_id
        and item_type = 'template_seed'
        and template_seed_id = v_template_seed.id;

      if not found then
        raise exception 'Template seed is no longer part of this starter pack.';
      end if;

      select id
      into v_existing_destination_id
      from public.document_templates
      where company_id = v_run.organization_id
        and (
          source_seed_id = v_template_seed.id
          or (
            v_template_seed.seed_key is not null
            and source_seed_key = v_template_seed.seed_key
          )
        )
      limit 1;

      if v_existing_destination_id is not null then
        raise exception 'Template seed is already linked to an organization-owned template. Rerun dry-run review.';
      end if;

      insert into public.document_templates (
        company_id,
        template_type,
        source_seed_id,
        source_seed_key,
        name,
        description,
        subject_template,
        body_template,
        schema_version,
        status,
        is_default,
        merge_field_manifest,
        metadata,
        created_by,
        updated_by
      ) values (
        v_run.organization_id,
        v_template_seed.template_type,
        v_template_seed.id,
        v_template_seed.seed_key,
        v_template_seed.name,
        v_template_seed.description,
        v_template_seed.subject_template,
        v_template_seed.body_template,
        v_template_seed.schema_version,
        'active',
        false,
        v_template_seed.merge_field_manifest,
        coalesce(v_template_seed.metadata, '{}'::jsonb) ||
          jsonb_build_object(
            'provisionedFromStarterPackId', v_run.starter_pack_id,
            'provisioningRunId', v_run.id,
            'sourceSeedId', v_template_seed.id,
            'sourceSeedKey', v_template_seed.seed_key
          ),
        p_actor_id,
        p_actor_id
      )
      returning id into v_destination_id;

      update public.platform_starter_pack_provisioning_run_items
      set
        destination_record_id = v_destination_id,
        action = 'created',
        status = 'completed',
        destination_snapshot = jsonb_build_object(
          'destinationType', 'document_template',
          'destinationRecordId', v_destination_id,
          'organizationId', v_run.organization_id,
          'sourceSeedId', v_template_seed.id,
          'sourceSeedKey', v_template_seed.seed_key,
          'templateType', v_template_seed.template_type,
          'name', v_template_seed.name,
          'status', 'active',
          'isDefault', false,
          'executedAt', v_now
        ),
        reason = 'Created organization-owned document template copy from platform starter-pack seed.',
        error_message = null,
        updated_at = v_now
      where id = v_item.id;

      v_created_template_count := v_created_template_count + 1;
      continue;
    end if;

    if v_item.source_item_type = 'catalog_seed' then
      select *
      into v_catalog_seed
      from public.platform_catalog_item_seeds
      where id = v_item.source_catalog_seed_id
        and is_active = true;

      if not found then
        raise exception 'Catalog seed is unavailable or inactive.';
      end if;

      perform 1
      from public.platform_starter_pack_items
      where id = v_item.starter_pack_item_id
        and starter_pack_id = v_run.starter_pack_id
        and item_type = 'catalog_seed'
        and catalog_seed_id = v_catalog_seed.id;

      if not found then
        raise exception 'Catalog seed is no longer part of this starter pack.';
      end if;

      select id
      into v_existing_destination_id
      from public.catalog_items
      where company_id = v_run.organization_id
        and (
          source_seed_id = v_catalog_seed.id
          or (
            v_catalog_seed.seed_key is not null
            and source_seed_key = v_catalog_seed.seed_key
          )
        )
      limit 1;

      if v_existing_destination_id is not null then
        raise exception 'Catalog seed is already linked to an organization-owned catalog item. Rerun dry-run review.';
      end if;

      v_catalog_sort_order := v_catalog_sort_order + 10;

      insert into public.catalog_items (
        company_id,
        source_seed_id,
        source_seed_key,
        item_type,
        name,
        description,
        unit,
        default_unit_cost,
        default_unit_price,
        markup_percent,
        hidden_markup_percent,
        taxable,
        vendor_id,
        category,
        cost_code,
        sku,
        internal_notes,
        photo_storage_path,
        status,
        is_default,
        metadata,
        sort_order,
        created_by,
        updated_by,
        tax_code_id
      ) values (
        v_run.organization_id,
        v_catalog_seed.id,
        v_catalog_seed.seed_key,
        v_catalog_seed.item_type,
        v_catalog_seed.name,
        v_catalog_seed.description,
        v_catalog_seed.unit,
        v_catalog_seed.default_unit_cost,
        coalesce(v_catalog_seed.default_unit_price, 0),
        v_catalog_seed.markup_percent,
        v_catalog_seed.hidden_markup_percent,
        v_catalog_seed.taxable,
        null,
        v_catalog_seed.category,
        v_catalog_seed.cost_code,
        v_catalog_seed.sku,
        v_catalog_seed.internal_notes,
        v_catalog_seed.photo_storage_path,
        'active',
        false,
        coalesce(v_catalog_seed.metadata, '{}'::jsonb) ||
          jsonb_build_object(
            'provisionedFromStarterPackId', v_run.starter_pack_id,
            'provisioningRunId', v_run.id,
            'sourceSeedId', v_catalog_seed.id,
            'sourceSeedKey', v_catalog_seed.seed_key,
            'vendorIdOmitted', v_catalog_seed.vendor_id is not null
          ),
        v_catalog_sort_order,
        p_actor_id,
        p_actor_id,
        null
      )
      returning id into v_destination_id;

      update public.platform_starter_pack_provisioning_run_items
      set
        destination_record_id = v_destination_id,
        action = 'created',
        status = 'completed',
        destination_snapshot = jsonb_build_object(
          'destinationType', 'catalog_item',
          'destinationRecordId', v_destination_id,
          'organizationId', v_run.organization_id,
          'sourceSeedId', v_catalog_seed.id,
          'sourceSeedKey', v_catalog_seed.seed_key,
          'itemType', v_catalog_seed.item_type,
          'name', v_catalog_seed.name,
          'category', v_catalog_seed.category,
          'status', 'active',
          'isDefault', false,
          'vendorId', null,
          'taxCodeId', null,
          'sortOrder', v_catalog_sort_order,
          'executedAt', v_now
        ),
        reason = 'Created organization-owned catalog item copy from platform starter-pack seed.',
        error_message = null,
        updated_at = v_now
      where id = v_item.id;

      v_created_catalog_item_count := v_created_catalog_item_count + 1;
      continue;
    end if;

    raise exception 'Unsupported provisioning item source type.';
  end loop;

  update public.platform_starter_pack_provisioning_runs
  set
    status = 'completed',
    completed_at = v_now,
    error_message = null,
    updated_at = v_now
  where id = p_run_id;

  return jsonb_build_object(
    'runId', p_run_id,
    'status', 'completed',
    'alreadyCompleted', false,
    'createdTemplateCount', v_created_template_count,
    'createdCatalogItemCount', v_created_catalog_item_count,
    'skippedCount', v_skipped_count,
    'message', 'Starter-pack provisioning completed. Contractor-owned copies were created only for approved missing items.'
  );
end;
$$;

create or replace function public.execute_platform_starter_pack_provisioning_run(
  p_run_id uuid,
  p_actor_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.execute_platform_starter_pack_provisioning_run(p_run_id, p_actor_id);
$$;

revoke all on function private.execute_platform_starter_pack_provisioning_run(uuid, uuid) from public;
revoke all on function private.execute_platform_starter_pack_provisioning_run(uuid, uuid) from anon;
revoke all on function private.execute_platform_starter_pack_provisioning_run(uuid, uuid) from authenticated;

revoke all on function public.execute_platform_starter_pack_provisioning_run(uuid, uuid) from public;
revoke all on function public.execute_platform_starter_pack_provisioning_run(uuid, uuid) from anon;
revoke all on function public.execute_platform_starter_pack_provisioning_run(uuid, uuid) from authenticated;

grant usage on schema private to service_role;
grant execute on function private.execute_platform_starter_pack_provisioning_run(uuid, uuid) to service_role;
grant execute on function public.execute_platform_starter_pack_provisioning_run(uuid, uuid) to service_role;

comment on function private.execute_platform_starter_pack_provisioning_run(uuid, uuid) is
  'Executes one approved starter-pack provisioning audit run atomically. Creates tenant-owned document template and catalog item copies only from captured approved run items.';

comment on function public.execute_platform_starter_pack_provisioning_run(uuid, uuid) is
  'Server-only service-role wrapper for private starter-pack provisioning execution. Not granted to anon or authenticated roles.';
