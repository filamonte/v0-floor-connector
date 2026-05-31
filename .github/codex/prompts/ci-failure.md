# Codex CI Failure Triage Prompt

Triage this FloorConnector CI failure as an advisory reviewer. Do not push,
merge, or broaden the scope.

Report:

- likely root cause
- failing command and signal
- files most likely involved
- whether the fix is safe for an agent
- focused follow-up prompt for the right stream/worktree
- checks to rerun after the fix

Avoid:

- broad rewrites
- speculative product changes
- schema/migration changes unless the failure directly proves they are needed
- production env or secret assumptions
- unrelated formatting churn

Preserve FloorConnector guardrails: canonical records, tenant isolation, portal
access, readiness gates, financial math, payment state, contract/signature
state, and no autonomous/provider actions.
