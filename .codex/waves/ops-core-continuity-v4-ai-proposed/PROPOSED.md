# Proposed Wave

Status: Proposed
Source: template_fallback
Generated: 2026-06-03T13:37:28.702Z
Display Name: Ops Core Continuity V4

This proposal is operational-continuity work, not an autonomous AI
implementation wave. The generated folder name is retained for compatibility
with the proposal workflow.

Review focus:

- Preserve canonical records, project-centered workflow continuity, and
  tenant-safe loaders/actions.
- Reject schema, migrations, Supabase/RLS/auth/env/payment/provider/route
  protection changes unless separately approved.
- Keep `project-readiness-stride-v1` first; allow CrewBoard parallel work only
  when it avoids shared readiness helper rewrites.
- Keep portal work customer-safe and downstream of project readiness language
  where practical.
- Keep PRs draft and do not auto-merge.

This wave is not active. Review `wave.json` and prompts, then activate with:

```powershell
pnpm fc:wave:approve --wave ops-core-continuity-v4-ai-proposed --proposal
```

Do not run, merge, or push it before human review.
