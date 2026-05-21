create or replace function public.create_record_revision(
  p_company_id uuid,
  p_subject_type public.record_revision_subject_type,
  p_subject_id uuid,
  p_revision_kind public.record_revision_kind,
  p_snapshot jsonb,
  p_revision_reason text default null,
  p_created_by uuid default auth.uid()
)
returns table (
  id uuid,
  company_id uuid,
  subject_type public.record_revision_subject_type,
  subject_id uuid,
  revision_number integer,
  is_current boolean,
  revision_reason text,
  revision_kind public.record_revision_kind,
  snapshot jsonb,
  created_by uuid,
  created_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor_id uuid := coalesce(p_created_by, (select auth.uid()));
  v_next_revision_number integer;
  v_inserted_revision_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to create record revisions.';
  end if;

  if p_created_by is not null and p_created_by <> (select auth.uid()) then
    raise exception 'Record revision actor must match the authenticated user.';
  end if;

  if not (select public.is_active_company_member(p_company_id)) then
    raise exception 'Record revision company is not available to the authenticated user.';
  end if;

  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    raise exception 'Record revision snapshot must be a JSON object.';
  end if;

  if p_snapshot ? 'subjectType'
    and p_snapshot ->> 'subjectType' <> p_subject_type::text
  then
    raise exception 'Record revision snapshot subject type does not match the canonical record.';
  end if;

  if p_snapshot ? 'subjectId'
    and p_snapshot ->> 'subjectId' <> p_subject_id::text
  then
    raise exception 'Record revision snapshot subject id does not match the canonical record.';
  end if;

  if p_subject_type = 'estimate'::public.record_revision_subject_type then
    if not exists (
      select 1
      from public.estimates estimate
      where estimate.company_id = p_company_id
        and estimate.id = p_subject_id
    ) then
      raise exception 'Estimate revision subject is not available for this company.';
    end if;
  elsif p_subject_type = 'invoice'::public.record_revision_subject_type then
    if not exists (
      select 1
      from public.invoices invoice
      where invoice.company_id = p_company_id
        and invoice.id = p_subject_id
    ) then
      raise exception 'Invoice revision subject is not available for this company.';
    end if;
  elsif p_subject_type = 'contract'::public.record_revision_subject_type then
    if not exists (
      select 1
      from public.contracts contract
      where contract.company_id = p_company_id
        and contract.id = p_subject_id
    ) then
      raise exception 'Contract revision subject is not available for this company.';
    end if;
  elsif p_subject_type = 'change_order'::public.record_revision_subject_type then
    if not exists (
      select 1
      from public.change_orders change_order
      where change_order.company_id = p_company_id
        and change_order.id = p_subject_id
    ) then
      raise exception 'Change order revision subject is not available for this company.';
    end if;
  else
    raise exception 'Unsupported record revision subject type.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_company_id::text || ':record_revision:' || p_subject_type::text || ':' || p_subject_id::text,
      0
    )
  );

  select coalesce(max(record_revision.revision_number), 0) + 1
  into v_next_revision_number
  from public.record_revisions record_revision
  where record_revision.company_id = p_company_id
    and record_revision.subject_type = p_subject_type
    and record_revision.subject_id = p_subject_id;

  update public.record_revisions record_revision
  set is_current = false
  where record_revision.company_id = p_company_id
    and record_revision.subject_type = p_subject_type
    and record_revision.subject_id = p_subject_id
    and record_revision.is_current = true;

  insert into public.record_revisions (
    company_id,
    subject_type,
    subject_id,
    revision_number,
    is_current,
    revision_reason,
    revision_kind,
    snapshot,
    created_by
  ) values (
    p_company_id,
    p_subject_type,
    p_subject_id,
    v_next_revision_number,
    true,
    p_revision_reason,
    p_revision_kind,
    p_snapshot,
    v_actor_id
  )
  returning record_revisions.id into v_inserted_revision_id;

  return query
  select
    record_revision.id,
    record_revision.company_id,
    record_revision.subject_type,
    record_revision.subject_id,
    record_revision.revision_number,
    record_revision.is_current,
    record_revision.revision_reason,
    record_revision.revision_kind,
    record_revision.snapshot,
    record_revision.created_by,
    record_revision.created_at
  from public.record_revisions record_revision
  where record_revision.id = v_inserted_revision_id;
end;
$$;

revoke all on function public.create_record_revision(
  uuid,
  public.record_revision_subject_type,
  uuid,
  public.record_revision_kind,
  jsonb,
  text,
  uuid
) from public;
revoke all on function public.create_record_revision(
  uuid,
  public.record_revision_subject_type,
  uuid,
  public.record_revision_kind,
  jsonb,
  text,
  uuid
) from anon;
grant execute on function public.create_record_revision(
  uuid,
  public.record_revision_subject_type,
  uuid,
  public.record_revision_kind,
  jsonb,
  text,
  uuid
) to authenticated;

comment on function public.create_record_revision(
  uuid,
  public.record_revision_subject_type,
  uuid,
  public.record_revision_kind,
  jsonb,
  text,
  uuid
) is
  'Atomically creates one tenant-scoped immutable record revision by validating membership and subject ownership, locking the company+subject, demoting the previous current revision, and inserting the next current revision. Uses SECURITY INVOKER so record_revisions RLS remains active.';
