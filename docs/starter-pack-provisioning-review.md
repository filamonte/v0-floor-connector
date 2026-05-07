# Starter Pack Provisioning Architecture Review

Status: Phase 5T final architecture and operator readiness review before any void action.

Date: 2026-05-07.

Scope: documentation and readiness review only. This pass does not add schema, RLS/grant changes, server actions, RPCs, UI mutation controls, provisioning behavior, tenant-owned writes, rollback, void, archive, delete, detach, assignment enforcement, entitlements, tax, payroll, financial calculation, invoice/contract generation, user preference, or contractor navigation changes.

## Lifecycle Reviewed

This review covers the starter-pack provisioning lifecycle from Phase 4A through Phase 5S:

- platform starter packs and starter-pack items
- assignment intent
- targeting preview
- provisioning dry run
- approval draft capture
- draft freshness review
- audit-only approval gate
- guarded approved-run execution
- provisioning audit observability
- rejected/no-op execution attempt logging
- void-readiness usage checks
- audit-only void metadata foundation
- audit-only void eligibility read model
- operator QA for read-only void eligibility

## What Is Safe Now

- Starter packs are platform-owned governance bundles over existing platform template seeds and platform catalog item seeds. They do not duplicate the template or catalog models.
- Assignment intent is planning metadata only. It can explain likely future audiences, but it does not provision, enforce, or change tenant behavior.
- Targeting preview is deterministic and read-only. It uses existing organization metadata when available and marks unsupported target types as unavailable/planning-only.
- Provisioning dry run is read-only and inspectable. It reports `would_create`, `already_exists`, `blocked`, and `unavailable` rows before any audit draft or execution.
- Draft creation recomputes the dry run server-side and writes only audit run/item rows.
- Draft review recomputes current dry-run state and detects stale, invalid, unavailable, missing, added, and changed items.
- Approval is an audit header transition only and requires a fresh, non-blocking draft plus exact `APPROVE DRY RUN ONLY` confirmation.
- Execution is guarded to approved, fresh, non-blocking runs and requires exact `EXECUTE STARTER PACK` confirmation.
- Execution uses a server-only service-role path behind the platform-admin check and a private Postgres function with row locking and idempotent completed-run behavior.
- Execution creates only missing contractor-owned `document_templates` and `catalog_items`; provisioned rows are active but not defaults.
- Catalog provisioning intentionally does not copy platform seed `vendor_id` or tax profile fields.
- Destination rows store source seed lineage, and audit run items store destination ids after successful creation or known skipped-existing matches.
- Rejected, blocked, failed-before-execution, and already-completed no-op execution attempts are persisted with safe operator messages.
- Completed-run review shows destination ids, item outcome counts, observability health, and operation attempts without offering rollback or void.
- Void-readiness and audit-only void eligibility are read-only. They compute support evidence but do not mutate audit rows or contractor-owned records.

## What Is Intentionally Not Implemented

- No rollback action.
- No void action.
- No archive, delete, or detach-lineage action.
- No assignment-based automatic provisioning.
- No tenant self-service starter-pack adoption.
- No contractor-group enforcement, tenant-role behavior, contractor-side permission behavior, entitlement mapping, pricing/package mapping, or auto-assignment.
- No entitlement enforcement or plan-tier runtime gating.
- No tax profile or payroll integration.
- No background provisioning jobs.
- No default mutation from starter-pack provisioning.
- No invoice, contract, estimate, catalog runtime behavior changes from starter packs.
- No hard-delete recovery path for records created by provisioning.

## What Operators Must Understand

- Provisioning is real once executed. It creates contractor-owned template/catalog records in the selected organization.
- Completed provisioning is not reversible through the current UI.
- A completed run did not change organization defaults, tax behavior, entitlement behavior, payroll behavior, invoice/contract generation, or existing records.
- Assignment intent and targeting previews are recommendations/planning context, not automation.
- A stale approved run must not be executed; the operator should create or approve a fresh run after reviewing the new dry run.
- Already-existing rows may represent exact source lineage or conservative normalized matches. Conservative matches should be treated as an operator-review signal, not a perfect guarantee.
- Void-readiness and void eligibility are evidence panels only. They do not mark anything voided.
- Future archive/delete/detach work must never be described as available until it has usage checks, audit design, QA, and explicit approval.

## What Should Happen Before Enabling Any Void Action

- Keep the first action audit-only: transition only `completed` or `completed_with_warnings` runs to `voided`.
- Recompute void-readiness usage immediately before updating audit metadata.
- Require exact confirmation `VOID AUDIT ONLY` and a non-empty, safe operator reason.
- Write only run-header audit metadata: `voided_by`, `void_reason`, `void_strategy = audit_only`, `voided_at`, and `void_readiness_snapshot`.
- Do not update run item destination ids, destination snapshots, contractor-owned templates, contractor-owned catalog items, defaults, estimates, invoices, contracts, taxes, payroll, entitlements, or preferences.
- Use row locking or a private RPC/transaction helper so concurrent void attempts cannot overwrite metadata.
- Treat already-voided runs as idempotent readback without overwriting the original void metadata.
- Add rejected void-attempt logging only as a separate narrow operations-audit pass if needed.
- Browser QA must verify completed, completed-with-warnings, draft, approved, running, failed, already-voided, missing-usage, and wrong-confirmation states before enabling the action.

## What Should Happen Before Assignment Auto-Provisioning

- Assignment intent must remain advisory until a separate recommendation queue is designed.
- Auto-provisioning should not run directly from assignment rows; it should create an operator-reviewed dry run and approval draft first.
- Targeting inputs need stronger durable data contracts for region, trade segment, onboarding profile, plan tier, and contractor groups before any recommendation can become automation.
- Operators need batch previews showing all organizations affected, per-organization dry-run differences, skipped/existing rows, and blocked rows.
- Assignment changes must not retroactively mutate already-provisioned organizations without a new explicit approval path.
- Entitlement or plan-tier assignment should remain blocked until entitlement semantics are explicit and tenant-safe.

## What Should Happen Before Tenant Self-Service Adoption

- Contractor self-service must use contractor-owned copies only and must not expose platform-admin audit controls.
- The UI must distinguish platform seeds, starter packs, organization-owned copies, and existing local records.
- Tenant users should see what will be copied before adoption and must not be able to mutate platform packs or platform seeds.
- RLS and server actions must use normal tenant membership checks, not platform-admin paths.
- Adoption should reuse the same dry-run/deduplication lineage rules so source linkage remains consistent.
- Self-service adoption should not make records defaults unless a separate tenant-owned default selection action is explicitly implemented.

## What Should Happen Before Entitlements Tie Into Provisioning

- Entitlements must be modeled separately from starter-pack assignment intent.
- Provisioning eligibility can consult entitlements only after the entitlement source of truth, tenant isolation, and operator override rules are implemented.
- Entitlements should gate recommendations or available actions, not silently mutate already-created tenant records.
- Failed entitlement checks should produce safe operator messages and no tenant-owned writes.
- Plan-tier targeting should not be treated as entitlement enforcement until billing/plan state is canonical and tested.

## Strongest Safety Guarantees

- Platform-admin role checks remain separate from contractor membership roles.
- Audit stages are separated: dry run, draft, review, approval, execution, attempts, and void readiness each have distinct read/write responsibilities.
- Execution never trusts client-provided dry-run rows; review and eligibility are recomputed server-side.
- Execution is scoped to one approved run, one starter pack, and one organization.
- Private RPC execution locks audit rows and returns completed-run no-op results without creating duplicates.
- Provisioned tenant records carry source seed lineage and are created with `is_default = false`.
- Operation attempt logging captures rejected/no-op execution paths without retry or mutation controls.
- Void readiness and eligibility were intentionally added before a void action, giving operators evidence without introducing destructive behavior.

## Remaining Operational Risks

- There is no implemented void or rollback path, so support must not promise undo for completed provisioning.
- Rejected void attempts are not logged because no void action exists yet.
- Conservative duplicate matching can be useful but imperfect; operators may need guidance when a row is skipped without exact lineage.
- The execution RPC still relies on the approved audit run shape and final database checks; future broader execution must preserve that narrow command envelope.
- Operation observability is in super admin but is not yet a full operations/errors center with alerting, retention policy, or escalation workflow.
- Audit run/item rows are the operational history, so support procedures must avoid manual database edits that bypass audit state.
- Source lineage is central to duplicate detection. Detach-lineage behavior would weaken future dry-run explainability unless redesigned carefully.

## Edge Cases

- A starter pack can change after a draft or approval; stale review must continue blocking approval/execution.
- A source seed can become inactive after approval; execution must remain blocked by fresh review and database guards.
- A tenant can independently create an equivalent record between approval and execution; execution must reject stale create rows and require a new review.
- Skipped-existing rows can point to records not created by the run; future archive strategies must never mutate those records.
- Completed runs may have destination records that are already used by estimates, invoices, contracts, defaults, or catalog lines by the time support reviews them.
- Missing destination records should be treated as audit/support risk, not permission to delete or detach anything else.

## Operator Confusion Risks

- "Assignment" can sound like "applied." UI and docs should keep saying planning intent unless provisioning has been explicitly executed.
- "Approved" can sound like "provisioned." Approval should continue to say audit approval only until execution completes.
- "Void" can sound like "undo." Future copy must say audit-only void is not undo and leaves contractor-owned records untouched.
- "Already exists" can hide the difference between exact source linkage and conservative matching. Operators should see match type in review/dry-run rows.
- Completed provisioning created real contractor-owned records, even though it did not change defaults.

## Audit Consistency Gaps

- Successful execution is captured on run/item rows, while rejected/no-op execution attempts are captured in a separate attempts table. That split is reasonable but should be explained in operator docs.
- There is no void-attempt audit because no void action exists yet.
- There is no item-level void outcome metadata. That is acceptable for future audit-only void but not sufficient for archive/detach.
- Completed-with-warnings is supported by schema/read models but not deeply exercised as a separate execution outcome.

## Stale Review Gaps

- Stale detection exists for selected run review and execution eligibility, but operators can still view older approvals. The UI must keep freshness visible when a run is selected.
- Assignment targeting changes do not automatically create stale provisioning runs because assignments do not drive execution today. If assignment recommendations later feed provisioning, stale detection must include assignment/recommendation version evidence.
- Future tenant self-service adoption needs its own freshness boundary; it should not reuse stale platform-admin snapshots.

## Concurrency Concerns

- Execution uses row locks in the private function for the approved run and item rows.
- Completed-run repeated execution is idempotent at the run level.
- Future audit-only void should lock the run row before checking status and updating void metadata.
- Future batch or assignment-driven provisioning would need per-organization locking and clear handling for two operators acting on the same pack/organization.

## Idempotency Assumptions

- Draft idempotency uses a fingerprint/key derived from organization, starter pack, operator, and dry-run content.
- Execution idempotency is run-level: completed runs return a no-op result and do not create duplicates.
- Destination uniqueness by organization/source seed is defense-in-depth, but dry-run/review logic should remain the primary operator explanation.
- Resume after partial failure is not implemented and should not be assumed.

## Future Scaling Concerns

- Current dry-run/review flows are appropriate for small operator-controlled batches, not large automatic rollouts.
- Assignment auto-provisioning would need queueing, pagination, per-organization status, retry policy, and stronger operations/error surfacing.
- Operation attempts may need retention and filtering as execution volume grows.
- Usage-readiness checks can expand across more workflow references; keep them explicit rather than turning them into generic JSON inspection.

## Future Tenant Support Concerns

- Support should be able to identify exactly which starter pack/run created a contractor-owned template or catalog item from source lineage and audit rows.
- Support must know that created records are now contractor-owned and may be edited or used independently.
- Manual database fixes that clear source lineage or destination ids would reduce dry-run explainability and should be avoided.
- Any future customer-facing or contractor-facing explanation should avoid implying platform seeds continue to control tenant-owned copies.

## Future Rollback/Void Risks

- Hard delete is unsafe once templates/catalog items may be referenced by commercial records.
- Archive-unused requires strong usage checks and item-level retained/archived audit evidence.
- Detach-lineage could solve some support semantics but would damage duplicate detection unless a replacement managed-lineage marker exists.
- Audit-only void is the safest first strategy because it records operator history without touching contractor-owned records.

## Future Assignment-Enforcement Risks

- Assignment intent is not entitlement enforcement.
- Plan-tier and region targeting can become stale or ambiguous if the underlying organization metadata changes.
- Contractor groups now exist as platform segmentation metadata only. Group assignment still must not become enforcement or auto-provisioning until membership semantics, operator review, tenant isolation, and audit requirements are separately approved.
- Automatic rollout from assignment intent could accidentally affect too many tenants unless it always routes through dry-run and approval review.

## Future Catalog/Template Lineage Risks

- Source lineage is the backbone for dry-run deduplication, execution idempotency, and support explainability.
- Conservative normalized matching should remain conservative and operator-visible because names/categories can drift.
- Catalog vendor and tax references must stay tenant-safe; platform seed vendor/tax ids should not be copied without a dedicated mapping design.
- Provisioning should not update existing tenant records even when a platform seed changes; contractors own adopted copies.

## Recommendation

The current implementation is ready for a narrow, explicitly approved audit-only void action as the next implementation slice, provided that action writes only run-header audit metadata, recomputes void readiness at submit time, uses exact `VOID AUDIT ONLY` confirmation, and does not mutate contractor-owned records.

It is not ready for archive/delete/detach, assignment auto-provisioning, tenant self-service adoption, entitlement-driven provisioning, or batch/background provisioning. Those require separate design, schema/read-model work, operator QA, and release gates.
