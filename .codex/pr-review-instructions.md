# Codex PR Review Instructions

Paste this into a GitHub PR comment when requesting Codex review:

```text
@codex review this PR for FloorConnector architecture drift, tenant/security regressions, readiness workflow bypasses, duplicate canonical models, financial/payment-state issues, missing tests, and missing docs updates.
```

## Manual Review Flow

1. Open the PR as a draft unless a human has explicitly confirmed readiness.
2. Add the review request text above as a PR comment or include it in the PR
   body.
3. Read Codex comments as advisory findings, not merge approval.
4. Ask Codex to fix specific review comments only after a human decides the
   requested fixes are in scope.
5. Keep the PR in draft until validation and human confirmation are complete.

Human review remains the final gate. Codex review is advisory and must not be
treated as approval to merge.
