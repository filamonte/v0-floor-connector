alter table public.organization_workflow_settings
  add column if not exists automation_notification_preferences jsonb not null default '[]'::jsonb;

alter table public.organization_workflow_settings
  drop constraint if exists organization_workflow_settings_automation_notification_preferences_array_check;
alter table public.organization_workflow_settings
  add constraint organization_workflow_settings_automation_notification_preferences_array_check
  check (jsonb_typeof(automation_notification_preferences) = 'array');

comment on column public.organization_workflow_settings.automation_notification_preferences is 'Organization-scoped future notification automation preferences. Stores category-level future enablement and intended contractor-role recipients only; it does not schedule or execute automation.';
