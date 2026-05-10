alter table public.organization_operational_cue_rules
  drop constraint if exists organization_operational_cue_rules_owner_strategy_check;

alter table public.organization_operational_cue_rules
  add constraint organization_operational_cue_rules_owner_strategy_check
    check (
      owner_strategy in (
        'record_owner',
        'organization',
        'estimator',
        'project_manager',
        'billing_owner',
        'scheduler'
      )
    );

update public.organization_operational_cue_rules
set owner_strategy = case cue_key
  when 'estimate_sent_followup' then 'estimator'
  when 'contract_sent_unsigned' then 'project_manager'
  when 'contract_viewed_unsigned' then 'project_manager'
  when 'invoice_overdue' then 'billing_owner'
  when 'deposit_invoice_unpaid' then 'billing_owner'
  when 'job_ready_unscheduled' then 'scheduler'
  when 'job_scheduled_missing_crew' then 'scheduler'
  else owner_strategy
end
where owner_strategy = 'record_owner'
  and cue_key in (
    'estimate_sent_followup',
    'contract_sent_unsigned',
    'contract_viewed_unsigned',
    'invoice_overdue',
    'deposit_invoice_unpaid',
    'job_ready_unscheduled',
    'job_scheduled_missing_crew'
  );

comment on column public.organization_operational_cue_rules.owner_strategy is
  'Built-in responsible role strategy for derived cues. Starter role strategies are estimator, project_manager, billing_owner, and scheduler; cue instances remain query-time derived and no user assignment is resolved in this foundation slice.';
