alter table public.organization_workflow_settings
  add column if not exists workflow_guidance_preferences jsonb not null default '{
    "workflowMode": "guided",
    "showNextBestActions": true,
    "showReadinessGuidance": true,
    "strictReadinessEnforcement": true,
    "allowOneOffInvoiceShortcuts": false,
    "showShortcutCleanupPrompts": true,
    "showWorkflowExplanationCopy": true,
    "enableAiSuggestions": false,
    "enableAiSummaries": false,
    "enableAiDrafting": false,
    "enableAiFormPrefillSuggestions": false,
    "enableAiWorkItemRecommendations": false,
    "requireConfirmationBeforeAiActions": true
  }'::jsonb;

comment on column public.organization_workflow_settings.workflow_guidance_preferences is 'Organization-owned workflow guidance and AI-assistance display preferences. These settings tune coaching visibility only and do not weaken canonical security, financial, signature, payment, or readiness enforcement.';
