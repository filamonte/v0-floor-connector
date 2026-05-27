alter function public.prevent_portal_evidence_delivery_event_mutation()
  set search_path = public;

revoke execute on function public.validate_portal_evidence_delivery_event()
  from public, anon, authenticated;

revoke execute on function public.prevent_portal_evidence_delivery_event_mutation()
  from public, anon, authenticated;
