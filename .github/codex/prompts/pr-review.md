# Codex PR Review Prompt

Review this FloorConnector PR as an advisory reviewer. Do not approve, merge, or
push changes.

Focus on:

- scope drift beyond the stated stream and PR summary
- canonical model violations or duplicate business records
- tenant, RLS, auth, portal-access, or security risk
- payment, contract, signature, invoice, or financial-state risk if touched
- readiness-gate bypasses
- docs drift between implemented behavior and current docs
- missing or weak tests
- formatting/check failures
- shared-risk file concerns
- product-owner-readable summary of what changed and what did not

Use these source-of-truth rules:

- FloorConnector keeps one canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Contractor app and portal are surfaces over shared canonical records.
- Planning docs do not prove implementation; `docs/current-state.md` owns
  implemented truth.

Output:

- Findings first, ordered by severity with file references.
- Open questions or assumptions.
- Validation gaps.
- Product-owner-readable summary.
