## REQUIRED FIRST STEP

Before doing anything, developers must read:

docs/developer-source-of-truth.md

`docs/developer-source-of-truth.md` defines:

- system rules
- canonical lifecycle
- workflow constraints
- implementation guardrails

Do not proceed without it. This chat handoff is only a launcher and compact operational orientation; it is not a competing source of truth.

# Chat Handoff

Status: compact operational handoff for the current branch.

Use this file for fast orientation after reading [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md). For exact implemented truth, defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Contractor Package Assignment Schema / Read-Model Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the Contractor Package Assignment Schema / Read-Model Design planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Contractor Package Assignment Schema / Read-Model Design as future-only planning. It names future `contractor_package_assignments`, future `contractor_package_assignment_audit_events`, optional future `contractor_package_assignment_transitions`, and optional future `contractor_package_assignment_snapshots` without claiming an implemented package assignment table, assignment audit table, assignment read model, migration, schema/RLS/grant change, or package assignment write behavior.
- `docs/Roadmap.md` consistently describes future contractor package assignment concepts, future assignment lifecycle states, future assignment constraints, future read-model helper concepts, future RLS/security gates, and a future first implementation slice while keeping actual package assignment mutation actions, approval/schedule/activate/cancel controls, billing/provider writes, Stripe calls, subscriptions, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export, automation/AI assignment suggestions, and starter-pack provisioning changes deferred.
- The lifecycle states `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived` are described as future/planned states only.
- The assignment constraints are described as future/planned only: only approved/published package versions can become active assignments, at most one active assignment per company unless multi-package support is explicitly designed, scheduled assignments need an audited transition before activation, supersession preserves previous assignment evidence, cancellation does not erase history, archived assignments require a new assignment rather than direct reactivation, and assignment is not billing mutation, entitlement/module enforcement, contractor group membership, or starter-pack provisioning.
- `docs/workflows.md` consistently separates implemented read-only package/billing inspection and the implemented static Future Package Definition Model planning panel from the future-only contractor package assignment schema/read-model workflow, future assignment lifecycle/audit workflow, and future read-only assignment inspection panel.
- `docs/workflows.md` does not describe any current assignment mutation workflow, package assignment table/read model, approval/schedule/activate/cancel control, billing/provider workflow, Stripe/provider call workflow, subscription operation workflow, entitlement/module runtime workflow, reporting/export workflow, contractor-facing behavior, automation, AI behavior, or starter-pack provisioning change.
- `docs/current-state.md` remains implemented truth: it describes `/super-admin/packages` and the Future Package Definition Model as implemented read-only observability/planning only, and it does not claim `contractor_package_assignments`, `contractor_package_assignment_audit_events`, package assignment persistence, package assignment read model, assignment lifecycle controls, assignment writes, activation/cancel controls, billing/provider mapping, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior exist.
- `docs/README.md` did not need changes because no new document was created and the existing doc index remains accurate.

Stale wording corrected:

- No source-of-truth overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- `docs/chat-handoff.md` now records this completed source-of-truth review and advances the recommended next step so the handoff no longer points back at the review that is complete.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: Contractor Package Assignment Approval / Activation Readiness Design. Define the future approval, scheduling, activation, cancellation, supersession, audit evidence, operator confirmation, stale-context, read-model, and no-mutation boundaries for contractor package assignment controls before adding package assignment writes, migrations, schema/RLS/grants, server actions, RPCs, billing/Stripe/subscription behavior, entitlement/module/runtime enforcement, reporting/export behavior, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or product behavior."

## Contractor Package Assignment Schema / Read-Model Design Planning

This docs-only Super Admin Platform Evolution pass planned the future Contractor Package Assignment Schema / Read-Model Design slice. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Contractor package assignment schema/read-model planning summary:

- `docs/Roadmap.md` now includes a dedicated future Contractor Package Assignment Schema / Read-Model Design section after the package definition lifecycle/approval readiness planning section.
- The section defines future contractor package assignment concepts: contractor package assignment, company/contractor target, package definition reference, package version reference, assignment status, lifecycle state, effective date, previous assignment, superseding assignment, assignment snapshot, billing impact snapshot, entitlement/module impact snapshot, starter-pack implication snapshot, cancellation/supersession reason, and grandfathered/custom contract marker.
- The section clearly states that this is future-only schema/read-model planning and does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, approval/schedule/activate/cancel controls, entitlement enforcement, module gates, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior.

Proposed future table/read-model summary:

- Future first-slice assignment tables are `contractor_package_assignments` and `contractor_package_assignment_audit_events`.
- `contractor_package_assignments` would store the future audited link between one company/contractor and one package definition version, including lifecycle/status, effective dates, previous/superseding assignment links, safe snapshots, operator actors, and grandfathered/custom-contract context.
- `contractor_package_assignment_audit_events` would store future assignment lifecycle evidence for drafting, review, approval, scheduling, activation, supersession, cancellation, and archive history.
- Optional split tables such as `contractor_package_assignment_transitions` or `contractor_package_assignment_snapshots` remain deferred unless future query volume, retention, legal/audit, or export shape justifies them.
- Future read-model helpers such as `buildContractorPackageAssignmentReadModel(...)` or `getContractorPackageAssignmentReadModel(...)` should expose current assignment by company, assignment history, scheduled changes, supersession chain, missing package/version caveats, billing impact caveats, entitlement/module impact caveats, starter-pack implication caveats, read-only operator summaries, and attention-needed rows.

Future assignment lifecycle/constraint summary:

- Future assignment lifecycle states are `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`.
- Only approved/published package definition versions should become active assignments.
- At most one active assignment per company should exist unless explicit multi-package support is designed.
- Scheduled assignments must not activate automatically or silently; activation needs a future audited transition.
- Supersession and cancellation should preserve prior evidence, operator reason, effective dates, and package-version snapshots.
- Archived assignments should not be reactivated without creating a new assignment.
- Assignment is not billing mutation, Stripe subscription creation/update/cancel, payment collection, entitlement/module enforcement, contractor group membership, starter-pack provisioning, contractor permission change, reporting/export action, automation, AI suggestion, or runtime behavior.

Future RLS/security gate summary:

- Future assignment/audit tables should use RLS enabled and forced when exposed through `public`, revoked broad `anon`/`authenticated` grants unless intentionally exposed, platform-admin-only server access, and no browser service-role exposure.
- Future assignment RPCs, if later needed, must lock `search_path`, perform authorization and readiness recomputation server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Snapshots should be server-recomputed JSON objects. Client-submitted snapshots must not be accepted as authoritative.
- Snapshots and metadata must avoid raw provider/billing secrets, raw provider errors, stack traces, service-role keys, sensitive payment method data, tenant-owned mutable payloads, and unbounded blobs.
- Assignment creation alone must not mutate tenant-owned records, subscriptions, billing/provider state, entitlements, module availability, contractor permissions, starter-pack provisioning state, reporting/export files, automation, AI behavior, or runtime behavior.

First implementation slice recommendation:

1. Add migrations for `contractor_package_assignments` and `contractor_package_assignment_audit_events` only after package definition/version and package definition audit foundations are implemented.
2. Add RLS/grant posture for platform-admin-only server access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin-only read helpers and a pure assignment read-model builder.
5. Add focused pure read-model tests for current assignment, history, scheduled changes, supersession chains, missing version caveats, impact caveats, and attention-needed rows.
6. Add a read-only Super Admin assignment inspection panel only.
7. Keep package assignment mutation actions, approval/schedule/activate/cancel controls, billing/provider mapping writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation/AI assignment suggestions, and starter-pack provisioning changes deferred.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Contractor Package Assignment Schema / Read-Model Design planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe contractor package assignment schema/read-model work as future-only planning with no implemented `contractor_package_assignments` table, assignment audit table, migration, schema/RLS/grant change, package assignment write model, approval/schedule/activate/cancel control, billing/Stripe/subscription behavior, entitlement/module/runtime enforcement, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or product behavior."

## Package Definition Lifecycle Controls / Approval Readiness Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the Package Definition Lifecycle Controls / Approval Readiness Design planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Definition Lifecycle Controls / Approval Readiness Design as future-only lifecycle/readiness planning. It documents future create draft, edit draft, submit for internal review, request changes, approve package definition, publish package version, deprecate package version, archive package definition/version, and supersede package version controls without claiming any implemented lifecycle controls, approval/publish/deprecate/archive controls, migration, schema/RLS/grant change, UI control, server action, RPC, or lifecycle mutation behavior.
- Future allowed transitions are described as planned only: `draft -> internal_review`, `internal_review -> draft`, `internal_review -> approved`, `approved -> published`, `published -> deprecated`, `deprecated -> archived`, `published -> superseded` by a newer published version, `draft -> archived`, and `internal_review -> archived`.
- Future blocked transitions are described as planned only: destructive `published -> draft`, `archived -> published`, `deprecated -> active/published` without a new reviewed version, `approved -> published` without audit evidence, publish without required package dimensions, publish without approval actor/reason/confirmation, publish while billing/provider mapping is claimed active without a future verified provider model, and publish while entitlement/module mapping is claimed enforced without a future entitlement/module model.
- `docs/workflows.md` consistently separates implemented read-only package/billing inspection and the implemented static Future Package Definition Model planning panel from the future-only package definition lifecycle/readiness workflow, future approval/publish/deprecate/archive controls, and future lifecycle readiness helper.
- `docs/workflows.md` does not describe any current package definition mutation workflow, approval/publish workflow, package audit write workflow, package assignment workflow, billing/provider workflow, Stripe/provider call workflow, subscription operation workflow, entitlement/module runtime workflow, reporting/export workflow, contractor-facing behavior, automation, AI behavior, or starter-pack provisioning change.
- `docs/current-state.md` remains implemented truth: it describes `/super-admin/packages` and the Future Package Definition Model as implemented read-only observability/planning only, and it does not claim package lifecycle controls, approval controls, publish controls, deprecation/archive controls, lifecycle mutations, lifecycle readiness helper, approval evidence writes, migrations, schema/RLS/grant changes, package definition mutations, assignment writes, billing/provider mapping, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior exist.
- `docs/README.md` did not need changes because no new document was created and the existing doc index remains accurate.

Stale wording corrected:

- No source-of-truth overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- `docs/chat-handoff.md` now records this completed source-of-truth review and advances the recommended next step so the handoff no longer points back at the review that is complete.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: Contractor Package Assignment Schema / Read-Model Design. Define the future schema/read-model needs for auditable contractor package assignment records after package definition/version, package definition audit evidence, and lifecycle readiness planning, without adding app code, migrations, schema/RLS/grants, package assignment writes, billing/Stripe/subscription behavior, entitlement/module/runtime enforcement, reporting/export behavior, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or product behavior."

## Package Definition Lifecycle Controls / Approval Readiness Design Planning

This docs-only Super Admin Platform Evolution pass planned the future Package Definition Lifecycle Controls / Approval Readiness Design slice. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package definition lifecycle/approval planning summary:

- `docs/Roadmap.md` now includes a dedicated future Package Definition Lifecycle Controls / Approval Readiness Design section after the package definition audit/evidence planning section.
- The section defines future lifecycle controls for create draft, edit draft, submit for internal review, request changes, approve package definition, publish package version, deprecate package version, archive package definition/version, and supersede package version.
- The section clearly states that this is future-only lifecycle/readiness planning and does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package mutation actions, approval/publish/deprecate/archive controls, package assignment writes, entitlement enforcement, module gates, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior.

Future allowed/blocked transition summary:

- Future allowed transitions are `draft -> internal_review`, `internal_review -> draft`, `internal_review -> approved`, `approved -> published`, `published -> deprecated`, `deprecated -> archived`, `published -> superseded` by a newer published version, `draft -> archived`, and `internal_review -> archived`.
- Future blocked transitions include destructive `published -> draft`, `archived -> published`, `deprecated -> active/published` without a new reviewed version, `approved -> published` without required audit evidence, publish without required package dimensions, publish without approval actor/reason/confirmation, publish while billing/provider mapping is claimed active without a verified future provider model, and publish while entitlement/module mapping is claimed enforced without a future entitlement/module model.
- `docs/workflows.md` now mirrors these future-only lifecycle and approval readiness boundaries inside the Super Admin package governance workflow section.

Future approval/readiness/security gate summary:

- Future approval requirements should be platform-admin-only and include explicit operator reason, confirmation phrase, approval actor, approval timestamp, package definition snapshot, package version snapshot, validation result snapshot, dependency caveat snapshot, before/after snapshots, and an audit event written in the same transaction as any future lifecycle change.
- Future readiness checks should verify required name/key/version, package dimension completeness, valid lifecycle state, duplicate active key/version conflicts, publication snapshot presence, intent-only billing/provider boundaries, intent-only entitlement/module boundaries, intent-only starter-pack boundaries, and no implied runtime enforcement.
- Future lifecycle/readiness helpers such as `buildPlatformPackageLifecycleReadiness(...)` or `getPlatformPackageApprovalReadModel(...)` should expose lifecycle state, transition eligibility, blocking issues, warning issues, required approval inputs, missing evidence, dependency caveats, safe operator summaries, and `actionAvailable` only when implementation exists.
- Future security gates should require forced RLS where public lifecycle/audit tables are used, revoked broad `anon`/`authenticated` grants unless intentionally exposed, platform-admin-only server access, no browser service-role exposure, locked `search_path` and revoked execute grants for future lifecycle RPCs, safe error messages, server-side readiness recomputation, and no authoritative client-submitted snapshots.

First implementation slice recommendation:

1. Add a pure lifecycle/readiness helper after package definition/version and audit foundations exist or are represented in a pure test harness.
2. Add tests for allowed transitions, blocked transitions, missing evidence, dependency caveats, and `actionAvailable` remaining false until controls exist.
3. Add a read-only Super Admin lifecycle readiness panel or catalog section.
4. Keep actual lifecycle mutation server actions, approval/publish/deprecate/archive buttons, package assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Package Definition Lifecycle Controls / Approval Readiness Design planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe lifecycle/approval controls as future-only planning with no implemented package lifecycle mutation controls, approval/publish/deprecate/archive buttons, server actions, RPCs, migrations, schema/RLS/grants, package assignment writes, billing/Stripe/subscription behavior, entitlement/module/runtime enforcement, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or product behavior."

## Package Definition Audit Evidence Schema / Read-Model Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the Package Definition Audit Evidence Schema / Read-Model Design planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Definition Audit Evidence Schema / Read-Model Design as future-only planning. It names future `platform_package_definition_audit_events`, keeps optional `platform_package_version_audit_events` as a later split only if justified, and documents future package definition/version audit event concepts, before/after snapshots, operator reason and confirmation evidence, review/approval/publication/deprecation/archive evidence, and immutable published snapshots without claiming an implemented audit table, audit read model, migration, schema change, RLS/grant change, or audit write behavior.
- The event families `package_definition_created`, `package_definition_updated`, `package_definition_reviewed`, `package_definition_approved`, `package_definition_published`, `package_definition_deprecated`, `package_definition_archived`, `package_version_created`, `package_version_updated`, `package_version_reviewed`, `package_version_approved`, `package_version_published`, `package_version_deprecated`, and `package_version_archived` are described as future/planned event names only.
- `docs/workflows.md` consistently separates implemented read-only package/billing inspection and the implemented static Future Package Definition Model planning panel from the future-only package definition audit/evidence workflow, future audit timeline/read-model workflow, future package definition/version tables, and future audit table/read model.
- `docs/workflows.md` does not describe any current package definition mutation workflow, approval/publish workflow, package audit write workflow, package assignment workflow, billing/provider workflow, Stripe/provider call workflow, subscription operation workflow, entitlement/module runtime workflow, reporting/export workflow, contractor-facing behavior, automation, AI behavior, or starter-pack provisioning change.
- `docs/current-state.md` remains implemented truth: it describes `/super-admin/packages` and the Future Package Definition Model as implemented read-only observability/planning only, and it does not claim `platform_package_definition_audit_events`, package definition audit persistence, audit timeline read model, audit event writes, approval/publication/deprecation/archive evidence writes, migrations, schema/RLS/grant changes, package definition mutations, assignment writes, billing/provider mapping, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior exist.
- `docs/README.md` did not need changes because no new document was created and the existing doc index remains accurate.

Stale wording corrected:

- No source-of-truth overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- `docs/chat-handoff.md` now records this completed source-of-truth review and advances the recommended next step so the handoff no longer points back at the review that is complete.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: Package Definition Lifecycle Controls / Approval Readiness Design. Define the future read-model, prerequisites, approval evidence checks, operator review states, and no-mutation boundaries for package definition lifecycle controls before adding schema mutations, approval/publish actions, contractor assignment writes, billing/Stripe/provider behavior, entitlement/module runtime enforcement, reporting/export behavior, starter-pack provisioning changes, automation, AI behavior, or product behavior."

## Package Definition Audit Evidence Schema / Read-Model Design Planning

This docs-only Super Admin Platform Evolution pass planned the future Package Definition Audit Evidence Schema / Read-Model Design slice. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package definition audit/evidence planning summary:

- `docs/Roadmap.md` now includes a dedicated future Package Definition Audit Evidence Schema / Read-Model Design section after the package definition persistence planning section.
- The section defines future package definition audit events, package version audit events, package definition snapshots, package version snapshots, before/after snapshots, operator reasons, confirmation phrases, review actors, approval actors, approval/publication timestamps, deprecation/archive reasons, source system, effective version, supersession/deprecation evidence, and immutable published snapshots.
- The section clearly states that this is future-only audit schema/read-model planning and does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package mutation actions, package assignment writes, entitlement enforcement, module gates, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior.

Proposed future audit table/read-model summary:

- Future first audit table is `platform_package_definition_audit_events`.
- The table would store package-definition and package-version evidence using constrained `event_type`, `package_definition_id`, `package_definition_version_id`, `actor_user_id`, `reason`, `confirmation_text`, `before_snapshot`, `after_snapshot`, `metadata`, `occurred_at`, and `created_at`.
- Event families include `package_definition_created`, `package_definition_updated`, `package_definition_reviewed`, `package_definition_approved`, `package_definition_published`, `package_definition_deprecated`, `package_definition_archived`, `package_version_created`, `package_version_updated`, `package_version_reviewed`, `package_version_approved`, `package_version_published`, `package_version_deprecated`, and `package_version_archived`.
- A separate `platform_package_version_audit_events` table remains optional only if future event volume, retention rules, or query shape justifies the split.
- A future read-model helper such as `buildPlatformPackageDefinitionAuditTimeline(...)` or `getPlatformPackageDefinitionAuditReadModel(...)` should expose package definition timeline, package version timeline, latest review/approval/publication evidence, deprecation/archive evidence, missing evidence caveats, safe operator summaries, and attention-needed rows.

Future RLS/security gate summary:

- Future audit tables should use platform-admin-only server access, RLS enabled and forced where exposed through `public`, revoked broad `anon`/`authenticated` grants unless intentionally designed, no browser service-role exposure, sanitized bounded metadata, and safe JSON object snapshots.
- Snapshots must not store secrets, raw provider errors, stack traces, service-role keys, provider secret keys, sensitive payment method data, or tenant-owned mutable payloads.
- Future mutation actions must recompute snapshots server-side; client-submitted snapshots should never be accepted as authoritative evidence.
- Future audit writes must not mutate tenant-owned records, package assignment records, subscriptions, billing/provider state, entitlements, module availability, contractor permissions, starter-pack provisioning state, reporting/export files, automation, AI behavior, or runtime behavior.

First implementation slice recommendation:

1. Add a migration for `platform_package_definition_audit_events` after package definition/version tables exist.
2. Add RLS/grant posture for platform-admin-only server access.
3. Add generated/shared types if required by repo pattern.
4. Add platform-admin-only read helpers plus a pure audit timeline read-model builder.
5. Add focused pure read-model tests, schema/RLS/grant checks, platform-admin authorization tests, snapshot-safety tests, and browser QA for a read-only audit timeline panel.
6. Keep package definition mutation actions, package version mutation actions, approval/publish controls, package assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Package Definition Audit Evidence Schema / Read-Model Design planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe package definition audit/evidence schema/read-model work as future-only planning with no implemented package audit table, migration, RLS/grants, server action, RPC, UI behavior, package mutation action, approval/publish control, package assignment write, billing/Stripe/subscription behavior, entitlement/module/runtime enforcement, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or product behavior."

## Package Definition Persistence Schema / Read-Model Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the Package Definition Persistence Schema / Read-Model Design planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Definition Persistence Schema / Read-Model Design as future-only schema/read-model planning. It names future `platform_package_definitions` and `platform_package_definition_versions` table concepts without claiming migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, or a package definition read model have been implemented.
- `docs/Roadmap.md` keeps package definitions separate from contractor package assignments, billing subscriptions, billing/provider mappings, entitlement enforcement, module gating, runtime access, reporting/export behavior, contractor permissions, and starter-pack provisioning.
- `docs/workflows.md` consistently separates the implemented read-only `/super-admin/packages` package/billing inspection and static Future Package Definition Model planning panel from the future-only package definition persistence/read-model workflow, future definition/version tables, future read-only Super Admin catalog output, and future schema/RLS/security gates.
- `docs/workflows.md` does not describe any current package definition mutation workflow, approval/publish workflow, package assignment workflow, billing/provider workflow, Stripe/provider call workflow, entitlement/module runtime workflow, reporting/export workflow, contractor-facing behavior, automation, AI behavior, or starter-pack provisioning change.
- `docs/current-state.md` remains implemented truth: it describes `/super-admin/packages` and the Future Package Definition Model as implemented read-only observability/planning only, and it does not claim `platform_package_definitions`, `platform_package_definition_versions`, package definition persistence, package version persistence, package definition mutation, approval/publish controls, assignment writes, billing/provider mapping, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior exist.
- `docs/README.md` did not need changes because no new document was created and the existing doc index remains accurate.

Stale wording corrected:

- No source-of-truth overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- `docs/chat-handoff.md` now records this completed source-of-truth review and advances the recommended next step so the handoff no longer points back at the review that is complete.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: Package Definition Audit Evidence Schema / Read-Model Design. Define the future audit/evidence schema and read-model needs for package definition creation, version snapshots, review, approval, publication, deprecation, and archive history before adding lifecycle mutation controls, contractor assignment writes, billing/Stripe/provider behavior, entitlement/module runtime enforcement, reporting/export behavior, starter-pack provisioning changes, automation, AI behavior, or product behavior."

## Package Definition Persistence Schema / Read-Model Design Planning

This docs-only Super Admin Platform Evolution pass planned the future Package Definition Persistence Schema / Read-Model Design slice. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package definition persistence/schema planning summary:

- `docs/Roadmap.md` now includes a dedicated future Package Definition Persistence Schema / Read-Model Design section. It defines package definition, package version, package key, display name, status, lifecycle state, version number, commercial summary, intended audience/segment, module visibility intent, usage limit intent, entitlement intent, billing/provider mapping intent, starter-pack default intent, contractor group targeting intent, published snapshot, and archived/deprecated state.
- The section clearly states that this is future-only planning and does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gates, reporting/export behavior, contractor permission changes, or runtime behavior.
- Lifecycle boundaries remain conservative: draft can be edited in the future, published versions should be immutable or effectively snapshotted, deprecation should replace destructive edits, archive should preserve history, and package definitions are separate from contractor assignments, billing subscriptions, and runtime entitlement enforcement.

Proposed future table/read-model summary:

- Future first-slice tables are limited to `platform_package_definitions` and `platform_package_definition_versions`.
- `platform_package_definitions` would store stable platform-owned package family identity and high-level lifecycle/status fields, including `package_key`, display name, intended audience, commercial summary, timestamps, and actor fields.
- `platform_package_definition_versions` would store versioned package-definition snapshots, including version number, lifecycle/publication status, display/commercial snapshots, package-dimension snapshots, module/usage/entitlement/billing/starter-pack/group-targeting intent snapshots, publication/deprecation/archive metadata, timestamps, and actor fields.
- Deferred tables include package governance audit events or a broader audit table, module intent mappings, usage limit intent mappings, entitlement intent mappings, starter-pack intent mappings, and billing/provider intent mappings. These are explicitly not part of the first schema slice.
- A future read-model helper such as `buildPlatformPackageDefinitionCatalog(...)` or `getPlatformPackageDefinitionReadModel(...)` should expose definition lists, version lists, lifecycle/publication state, intended dimensions, dependency/caveat status, audit evidence availability, and read-only operator summaries.

Future RLS/security gate summary:

- Future package definition tables should use platform-admin-only server access, RLS enabled and forced where exposed through `public`, revoked broad `anon`/`authenticated` grants unless intentionally designed, no browser service-role exposure, safe JSON snapshots, and no raw provider/billing secrets, raw provider errors, sensitive payment-method data, or tenant-owned mutable state.
- Future security-definer RPCs, if any, must lock `search_path` and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Future package definition writes must not change tenant-owned records, starter-pack provisioning records, contractor groups, subscriptions, entitlements, module availability, contractor permissions, reporting/export behavior, automation, AI behavior, or runtime behavior.

First implementation slice recommendation:

1. Migration for `platform_package_definitions` and `platform_package_definition_versions` only.
2. Generated/shared types if required by repo pattern.
3. Platform-admin-only server read helpers plus a pure read-model builder.
4. Read-only Super Admin catalog view or panel.
5. Focused pure tests, schema/RLS/grant checks, platform-admin authorization tests, and browser QA.
6. No publish/approval controls, contractor assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation, AI behavior, or starter-pack provisioning changes.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Package Definition Persistence Schema / Read-Model Design planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe package definition persistence/schema/read-model work as future-only planning with no implemented package tables, migrations, RLS/grants, server actions, RPCs, UI behavior, package assignment writes, billing/Stripe/subscription behavior, entitlement/module/runtime enforcement, reporting/export behavior, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or product behavior."

## Package Governance Implementation Readiness Matrix Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the Package Governance Implementation Readiness Matrix across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes the Package Governance Implementation Readiness Matrix as future sequencing/planning, not implemented product behavior.
- The matrix includes package definition persistence, package definition lifecycle/approval, contractor package assignment, billing/provider mapping, billing reconciliation, entitlement/module boundary model, runtime enforcement, package governance audit/evidence, package governance reporting/export, contractor-facing package visibility, support/operator review bundle, and migration from early-access/read-only state.
- Each matrix row records current status/risk, prerequisites/blockers, schema/RLS and server-action/RPC considerations, audit evidence requirements, QA/security gates, explicit non-goals, and a recommended first implementation slice.
- Sequencing remains conservative: package definition schema/read model first, audit/evidence second, lifecycle/approval controls third, contractor assignment schema/read model fourth, assignment audit/approval fifth, billing/provider mapping read model before Stripe mutation, entitlement/module mapping read model before runtime enforcement, runtime enforcement last, and reporting/export only after audit evidence exists.
- Risk classes remain explicit: docs/read-model work is low risk, schema/RLS/audit/read-model foundations are medium risk, mutation actions are high risk, and billing/provider/runtime enforcement is critical risk.
- Explicit blockers remain present: no package definition persistence, package assignment table, entitlement runtime model, module gate mapping, billing provider mapping table, package governance audit table, Stripe subscription mutation workflow, reconciliation workflow, or contractor-facing package visibility/export exists yet.
- `docs/workflows.md` mirrors the planning-only sequencing boundary and does not imply package-governance schema, mutation, billing/provider, entitlement/module, reporting/export, or runtime systems are implemented.
- `docs/current-state.md` remains implemented truth: it describes `/super-admin/packages` and the Future Package Definition Model as implemented read-only planning/observability, and it does not claim package definition persistence, lifecycle approval controls, assignment writes, billing/provider mapping, reconciliation, entitlement/module runtime enforcement, package governance audit events, reporting/export, contractor-facing package visibility, or support bundles exist.
- `docs/README.md` did not need changes because no new document was added and the existing doc index remains accurate.

Stale wording corrected:

- No source-of-truth overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- `docs/chat-handoff.md` now records this current review and advances the recommended next step so the handoff no longer points back at the completed matrix review.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: Package Definition Persistence Schema / Read-Model Design. Define future package definition persistence scope, platform-admin authorization, package-version snapshot rules, lifecycle/audit dependencies, schema/RLS considerations, server-action/RPC boundaries, QA/security gates, and no-mutation/no-runtime boundaries without adding migrations, schema, app code, tests, UI behavior, billing/Stripe/subscription behavior, package assignment writes, entitlement/module enforcement, reporting/export behavior, starter-pack provisioning changes, automation, AI behavior, or runtime behavior."

## Package Governance Implementation Readiness Matrix Planning

This docs-only Super Admin Platform Evolution pass planned the Package Governance Implementation Readiness Matrix. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Readiness matrix summary:

- `docs/Roadmap.md` now includes a dedicated Package Governance Implementation Readiness Matrix covering package definition persistence, package definition lifecycle/approval, contractor package assignment, billing/provider mapping, billing reconciliation, entitlement/module boundary model, runtime enforcement, package governance audit/evidence, package governance reporting/export, contractor-facing package visibility, support/operator review bundle, and migration from early-access/read-only state.
- Each matrix row records current status, risk, prerequisites, blockers, schema/RLS considerations, server-action/RPC considerations, required audit evidence, QA/security gates, explicit non-goals, and the recommended first implementation slice.
- The matrix keeps current implemented truth narrow: `/super-admin/packages` is still read-only package/billing observability plus the static Future Package Definition Model planning panel. No package definition persistence, package assignment model, billing provider mapping table, entitlement runtime model, module gate mapping, package governance audit table, reporting/export route/action/file generation, or runtime package behavior exists.

Recommended implementation sequence:

1. Package definition schema/read model first.
2. Package governance audit/evidence schema second.
3. Package definition lifecycle/approval controls third.
4. Contractor package assignment schema/read model fourth.
5. Assignment audit/approval fifth.
6. Billing/provider mapping read model before any Stripe mutation.
7. Billing reconciliation design/read model before trusting provider state.
8. Entitlement/module mapping read model before runtime enforcement.
9. Runtime enforcement last.
10. Reporting/export only after audit evidence exists.

Key blockers and risks:

- Blockers: no package definition persistence, package assignment table, entitlement runtime model, module gate mapping, billing provider mapping table, package governance audit table, Stripe subscription mutation workflow, reconciliation workflow, or contractor-facing package export/visibility model exists yet.
- Risk levels: docs and read-only read models are low risk; schema/RLS/audit/read models are medium risk; mutation actions are high risk; billing/provider mutation, Stripe subscription operations, runtime enforcement, module gating, pricing/package enforcement, contractor permission changes, and automated correction workflows are critical risk.

Future QA/security gate summary:

- Future slices must include schema/RLS tests, forced RLS and grant checks, platform-admin authorization tests, no client service-role exposure checks, security-definer execute grant checks if RPCs are added, browser QA, no unintended billing/subscription mutation tests, no unintended entitlement/module mutation tests, no unintended contractor permission changes, Stripe sandbox tests before provider mutation, webhook signature verification before trusting provider state, audit snapshot tests, and reporting/export redaction tests where applicable.
- `docs/workflows.md` now has a compact planning-only sequencing note so future package governance workflows stay ordered and do not blur read-model, schema, mutation, billing/provider, entitlement/module, runtime, and reporting/export boundaries.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Package Governance Implementation Readiness Matrix. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe the matrix as future-only planning with no implemented package schema, package assignment model, billing/provider mapping table, package governance audit table, reporting/export behavior, billing/Stripe/subscription mutation, entitlement/module/runtime enforcement, contractor permission changes, automation, AI behavior, starter-pack provisioning changes, or product behavior."

## Package Governance Reporting / Export Readiness Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass re-verified the future Package Governance Reporting / Export Readiness planning section across the source-of-truth docs after the implementation-readiness matrix planning pass. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Governance Reporting / Export Readiness as future-only planning. It includes the requested future report concepts: package inventory report, package definition version report, contractor package assignment report, billing/provider mapping report, entitlement/module mapping report, override report, package audit trail report, reconciliation/attention-needed report, grandfathered/custom contract report, early-access/trial report, and support investigation bundle.
- `docs/Roadmap.md` describes future export shapes as planned only: CSV summary export, JSON audit bundle, PDF/operator support packet, internal support bundle, contractor-facing export as separately scoped future work, and compliance/legal hold export as separately scoped future work.
- `docs/Roadmap.md` states that no package governance report read model, export workflow, export button, file generation, downloadable file/link, package governance audit write model, package-definition persistence, package assignment write, billing mutation, Stripe/subscription operation, entitlement enforcement, module gating, contractor permission change, or runtime behavior exists today.
- `docs/workflows.md` separates implemented read-only `/super-admin/packages` inspection and the implemented Future Package Definition Model planning panel from future-only reporting/export workflows, support investigation bundles, legal hold/compliance exports, contractor-facing exports, billing mutations, Stripe/provider calls, entitlement/module runtime mutation workflows, and contractor-facing behavior.
- `docs/workflows.md` keeps reporting/export readiness as a future planning boundary and explicitly states that it must not create packages, assign packages, mutate billing, call Stripe, create/update/cancel subscriptions, enforce entitlements, gate modules, change contractor permissions, generate files, expose export links, run automation, run AI behavior, or change runtime behavior.
- `docs/current-state.md` remains implemented truth: it describes `/super-admin/packages` and the Future Package Definition Model as implemented read-only planning/observability, and it does not claim package governance reporting/export routes, export actions, file generation, downloads, package governance audit persistence, billing mutations, Stripe calls, subscriptions, package assignment writes, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior.
- `docs/README.md` did not need changes because no new document was added and the existing doc index remains accurate.

Stale wording corrected:

- No source-of-truth overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- `docs/chat-handoff.md` now records this current source-of-truth review and keeps the recommended next step on matrix consistency review so the handoff does not imply reporting/export is implemented as app behavior.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Package Governance Implementation Readiness Matrix. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe the matrix as future-only planning with no implemented package schema, package assignment model, billing/provider mapping table, package governance audit table, reporting/export behavior, billing/Stripe/subscription mutation, entitlement/module/runtime enforcement, contractor permission changes, automation, AI behavior, starter-pack provisioning changes, or product behavior."

## Package Governance Reporting / Export Readiness Planning

This docs-only Super Admin Platform Evolution pass planned the future Package Governance Reporting / Export Readiness layer. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, reporting/export behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package governance reporting/export planning summary:

- Future reporting/export readiness is defined as a planning layer on top of future package governance evidence, not as implemented app behavior.
- Future reporting concepts include package inventory reports, package definition version reports, contractor package assignment reports, billing/provider mapping reports, entitlement/module mapping reports, override reports, package audit trail reports, reconciliation/attention-needed reports, grandfathered/custom contract reports, early-access/trial reports, and support investigation bundles.
- The model is future-only. No package governance report read model, export workflow, export button, file generation, downloadable file/link, package governance audit write model, package-definition persistence, package assignment write, billing mutation, Stripe/subscription operation, entitlement enforcement, module gate, contractor permission change, or runtime behavior exists today.

Future report/export shape summary:

- Future export shapes should separate CSV summary exports, JSON audit bundles, PDF/operator support packets, internal support bundles, contractor-facing exports as separately scoped future work, and compliance/legal hold exports as separately scoped future work.
- Future report data boundaries should use package definitions and versions, package assignment snapshots, billing/provider mapping snapshots, carefully displayed provider references, entitlement/module snapshots, override snapshots, audit events, approval/reason/confirmation metadata, and reconciliation status.
- Future reports and exports must exclude raw secrets, raw provider error payloads, service-role keys, and sensitive payment method data.

Future safety/retention/QA gates:

- Future export safety should be platform-admin-only and server-side only, require an explicit export reason, audit the export request, prevent client service-role exposure, apply redaction rules, bound export size, avoid raw provider errors/secrets and sensitive payment data, and use expiring download links if file storage is introduced later.
- Future retention/legal handling should preserve package governance audit evidence through deprecation, supersession, rollback, voiding, legal hold, and support investigation scenarios. Export readiness must not imply permission to mutate package, billing, entitlement, module, contractor permission, or runtime records.
- Future QA/security gates should include report read-model tests, export redaction tests, platform-admin authorization tests, no client service-role exposure tests, export audit event tests, file/link expiration tests if applicable, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, browser QA, support bundle content tests, and large export guard tests.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the future Package Governance Reporting / Export Readiness planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe reporting/export readiness as future-only planning with no report/export route, export button, file generation, downloadable file/link, package governance audit writes, package-definition persistence, package assignment writes, billing mutations, Stripe calls, subscription operations, entitlement/module/runtime enforcement, contractor permission changes, starter-pack provisioning, automation, AI behavior, or product behavior."

## Package Governance Audit and Evidence Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the future Package Governance Audit and Evidence Model planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, package-audit behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Governance Audit and Evidence Model as future-only planning with the requested future concepts: package governance audit event, package definition snapshot, package assignment snapshot, billing/provider mapping snapshot, entitlement/module mapping snapshot, operator reason, confirmation phrase, approval actor/timestamp, effective date, before/after snapshot, source system, external provider reference snapshot, reconciliation state, and rollback/deprecation/supersession plan.
- `docs/Roadmap.md` describes the requested future event families as planned events only: `package_definition_created`, `package_definition_reviewed`, `package_definition_approved`, `package_definition_published`, `package_definition_deprecated`, `package_definition_archived`, `package_assignment_drafted`, `package_assignment_approved`, `package_assignment_scheduled`, `package_assignment_activated`, `package_assignment_superseded`, `package_assignment_canceled`, `provider_mapping_created`, `provider_mapping_verified`, `provider_mapping_deprecated`, `entitlement_mapping_reviewed`, `entitlement_override_created`, `entitlement_override_expired`, and `billing_reconciliation_reviewed`.
- `docs/Roadmap.md` states that no package governance audit/evidence write model, package-definition persistence, package assignment write, billing mutation, Stripe/subscription operation, entitlement enforcement, module gating, contractor permission change, or runtime behavior exists today.
- `docs/workflows.md` separates implemented read-only `/super-admin/packages` inspection and the implemented Future Package Definition Model planning panel from future-only package governance audit/evidence, package definition audit events, package assignment audit events, provider mapping audit events, entitlement/override audit events, billing reconciliation review events, billing mutations, Stripe/provider calls, entitlement/module runtime mutation workflows, and contractor-facing behavior.
- `docs/current-state.md` remains implemented truth: `/super-admin/packages` is read-only package/billing observability plus a static planning panel, and it does not claim package governance audit persistence, package governance audit events, billing mutations, Stripe calls, subscriptions, package assignment writes, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior.
- `docs/README.md` did not need changes because no new document was added and the existing doc index remains accurate.

Stale wording corrected:

- No overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- This handoff now records the completed consistency review so the next step does not imply package governance audit/evidence has been implemented as app behavior.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: future Package Governance Reporting / Export Readiness. Define future support/reporting/export needs for package governance audit evidence, package definition history, contractor assignment history, billing/provider mapping snapshots, entitlement/module mapping snapshots, reconciliation evidence, redaction/safe metadata, provider-reference display, platform-admin authorization, and QA/security gates without implementing app code, tests, migrations, schema, RLS/grants, UI behavior, billing mutations, Stripe calls, subscription operations, entitlement enforcement, module gating, package assignment writes, package-audit writes, contractor permission changes, automation, AI behavior, or runtime behavior."

## Package Governance Audit and Evidence Model Planning

This docs-only Super Admin Platform Evolution pass planned the future Package Governance Audit and Evidence Model. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, package assignment writes, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package governance audit/evidence planning summary:

- Future audit/evidence governance is defined as the future traceability layer for package definitions, package assignments, billing/provider mappings, entitlement/module mappings, overrides, reconciliation reviews, operator reasons, confirmation phrases, approval actors/timestamps, effective dates, before/after snapshots, source systems, provider reference snapshots, and rollback/deprecation/supersession plans.
- The model is future-only. No package governance audit/evidence write model, package-definition persistence, package assignment write, billing mutation, Stripe/subscription operation, entitlement enforcement, module gate, contractor permission change, or runtime behavior exists today.
- Required future evidence varies by action type: package definition actions capture package/version and lifecycle snapshots; package assignment actions capture company, assignment, package version, effective date, and impact snapshots; billing/provider actions capture provider reference and reconciliation snapshots; entitlement/module actions capture intended runtime boundaries; override actions capture reason, duration, source, and revoke strategy; reconciliation actions capture expected versus observed provider state and review outcome.

Future audit event family summary:

- Planned package definition events: `package_definition_created`, `package_definition_reviewed`, `package_definition_approved`, `package_definition_published`, `package_definition_deprecated`, and `package_definition_archived`.
- Planned package assignment events: `package_assignment_drafted`, `package_assignment_approved`, `package_assignment_scheduled`, `package_assignment_activated`, `package_assignment_superseded`, and `package_assignment_canceled`.
- Planned provider, entitlement, override, and reconciliation events: `provider_mapping_created`, `provider_mapping_verified`, `provider_mapping_deprecated`, `entitlement_mapping_reviewed`, `entitlement_override_created`, `entitlement_override_expired`, and `billing_reconciliation_reviewed`.

Future immutability/security/support boundaries:

- Published package definitions should not be destructively edited; package assignment history should be append-only or effectively immutable; provider and entitlement/module snapshots should preserve approval-time context; and void/deprecation/supersession should retain prior evidence instead of erasing it.
- Future audit writes should be platform-admin-only, server-side only, RLS-protected, forced where public audit tables are used, free of client service-role exposure, and safe from raw provider errors, secrets, stack traces, and unsafe payload metadata.
- Future support/operator review should be able to explain why a contractor has a package, why a module/feature is or is not available, why billing differs from package expectation, whether provider state is reconciled, who approved package/version/assignment changes, how grandfathered/custom contracts apply, and what rollback/deprecation path exists.

Future QA/security gates:

- Schema/RLS tests.
- Platform-admin authorization tests.
- No client service-role exposure tests.
- Audit append-only tests.
- Before/after snapshot tests.
- Safe metadata tests.
- Provider reference sanitization tests.
- No unintended billing mutation tests.
- No unintended entitlement/module runtime mutation tests.
- Browser QA.
- Audit evidence verification.
- Support/export readiness tests.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the future Package Governance Audit and Evidence Model planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe the audit/evidence model as future-only planning with no package governance audit writes, package-definition persistence, package assignment writes, billing mutations, Stripe calls, subscription operations, entitlement/module/runtime enforcement, contractor permission changes, starter-pack provisioning, automation, AI behavior, or product behavior."

## Readiness / Schedule QA Checkpoint

The follow-on non-AI readiness and scheduling QA thread is complete enough to pause. This checkpoint did not change application behavior, tests, schema, migrations, readiness rules, scheduling logic, financial logic, work-item behavior, app shell, navigation, field logic, AI cue behavior, or add any new AI behavior.

Files changed in this checkpoint:

- `docs/chat-handoff.md`

Covered readiness/scheduling QA:

- Project Detail ready-to-schedule handoff states are covered for ready signed projects with no job, ready projects with exactly one unscheduled job, and ready projects whose job schedule is already set.
- `/schedule` URL handoff behavior is covered for exact `projectId + jobId + view=unscheduled + action=schedule`, project-only unscheduled exact-one fallback, and project-only scheduled handoff.
- `/schedule` submit-path QA is covered with a disposable E2E fixture: the test opens the existing schedule composer, confirms URL load does not mutate schedule state, submits a deterministic future schedule, verifies the canonical job schedule persists once after reload, confirms no duplicate jobs or work items are created, and resets the fixture job back to unscheduled after assertions.

Primary test files and docs:

- `e2e/schedule-ready-handoff.spec.js`
- `e2e/project-ai-cue-work-item-bridge.spec.js`
- `docs/e2e-browser-qa.md`

Relevant validation commands from the completed QA thread:

- `pnpm exec playwright test e2e/schedule-ready-handoff.spec.js --project=chromium-protected` passed: 5 protected tests.
- `pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected` passed in the prior bridge/ready-state coverage pass.
- `pnpm exec tsx --test apps/web/lib/projects/cues.test.ts apps/web/lib/work-items/work-items.test.ts apps/web/lib/work-items/prefill.test.ts` passed.
- `pnpm exec tsx --test apps/web/lib/dashboard/project-cue-preview.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check -- e2e/schedule-ready-handoff.spec.js docs/e2e-browser-qa.md` passed with only the existing docs LF-to-CRLF warning.

Pause recommendation:

- Pause AI cue expansion and pause additional readiness/schedule QA unless a concrete destination, URL-handoff, or submit-path bug appears.
- The next product slice should move to a new, explicitly scoped product need rather than extending the current AI/readiness/schedule thread by inertia.

## Package Entitlement / Module Boundary Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the future Package Entitlement / Module Boundary Governance planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, package-assignment behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Entitlement / Module Boundary Governance as future-only planning with the requested future concepts: entitlement, module availability, module visibility, feature access, usage limit, package definition entitlement mapping, contractor package assignment effective entitlements, override, trial/early-access exception, grandfathered/custom contract exception, support override/emergency override, and audit snapshot.
- `docs/Roadmap.md` includes future entitlement lifecycle states `planned`, `reviewed`, `approved`, `active`, `suspended`, `deprecated`, `revoked`, and `archived`, plus future module boundary lifecycle states `hidden`, `visible_preview`, `visible_enabled`, `enabled_limited`, `enabled_full`, `suspended`, and `deprecated`.
- `docs/Roadmap.md` states that no entitlement write model, runtime entitlement resolver, module gate, package enforcement, contractor permission change, billing mutation, Stripe/subscription operation, package assignment write, or runtime behavior exists today.
- `docs/workflows.md` separates implemented read-only `/super-admin/packages` inspection and the implemented Future Package Definition Model planning panel from future-only entitlement/module boundary, override, billing/provider mapping, contractor package assignment, contractor group, starter-pack, user-preference, runtime mutation, and contractor-facing workflows.
- `docs/current-state.md` remains implemented truth: `/super-admin/packages` is read-only package/billing observability plus a static planning panel, and it does not claim entitlement persistence, module gates, runtime enforcement, package assignment writes, billing mutations, Stripe calls, subscriptions, contractor permission changes, starter-pack provisioning changes, or runtime package behavior.
- `docs/README.md` did not need changes because no new document was added.

Stale wording corrected:

- No overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- This handoff now records the completed consistency review so the next step does not imply entitlement/module governance has been implemented as app behavior.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: future Package Governance Audit and Evidence Model. Define future audit event families, evidence snapshots, approval/review metadata, actor/reason/confirmation requirements, before/after package-definition snapshots, assignment snapshots, billing/provider mapping snapshots, entitlement/module mapping snapshots, override snapshots, rollback/revoke/deprecation evidence, and QA/security gates without implementing app code, schema, migrations, RLS/grants, billing mutations, Stripe calls, subscription operations, entitlement enforcement, module gating, package assignment writes, contractor permission changes, automation, AI behavior, or runtime behavior."

## Package Entitlement / Module Boundary Governance Planning

This docs-only Super Admin Platform Evolution pass planned future Package Entitlement / Module Boundary Governance. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, package-assignment behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package Entitlement / Module Boundary planning summary:

- Future entitlement/module governance is defined as the future boundary between commercial package planning and runtime access control. It distinguishes entitlement, module availability, module visibility, feature access, usage limit, package definition entitlement mapping, contractor package assignment effective entitlements, override, trial/early-access exception, grandfathered/custom contract exception, support override/emergency override, and audit snapshot.
- Package definitions remain intended commercial packaging; package assignments link contractors to package versions; billing/provider state handles payment/subscription status; entitlements determine runtime capability access only after a separate model exists; and module visibility is UI exposure, not full permission enforcement.
- Contractor groups remain segmentation/proposal inputs, starter packs/onboarding remain provisioning defaults, and user preferences remain personal defaults. None of those are entitlement grants.

Entitlement/module lifecycle planning summary:

- Future entitlement lifecycle states: `planned`, `reviewed`, `approved`, `active`, `suspended`, `deprecated`, `revoked`, and `archived`.
- Future module boundary lifecycle states: `hidden`, `visible_preview`, `visible_enabled`, `enabled_limited`, `enabled_full`, `suspended`, and `deprecated`.
- `active` or enabled module states should not exist as runtime behavior until future schema/RLS, platform-admin authorization, entitlement no-op, module visibility, separation, browser, audit, and rollback/revoke QA gates exist.

Future enforcement and override boundaries:

- No runtime enforcement until an explicit entitlement model exists.
- No automatic entitlement changes from billing state alone, contractor groups, starter-pack assignment, user preferences, AI, or automation.
- No module gating until module-to-entitlement mapping exists.
- No contractor-facing permission change without explicit assignment/entitlement audit.
- Future overrides should be platform-admin-only, reasoned, audited, temporary when appropriate, reviewed before becoming permanent, and unable to silently mutate billing or package assignment.

Future QA/security gates:

- Schema/RLS tests.
- Platform-admin authorization tests.
- No client service-role exposure.
- Entitlement no-op tests before runtime rollout.
- Module visibility regression tests.
- Package assignment, billing/provider, contractor group, starter-pack, and user-preference separation tests.
- Browser QA.
- Audit evidence verification.
- Rollback/revoke tests.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the future Package Entitlement / Module Boundary Governance planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe entitlement/module boundary governance as future-only planning with no entitlement write model, runtime enforcement, module gating, package enforcement, billing/Stripe/subscription mutation, package assignment writes, contractor permission changes, starter-pack provisioning, AI/automation behavior, or product behavior."

## Package Billing / Provider Mapping Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the future Package Billing / Provider Mapping Governance planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, package-assignment behavior, provider-mapping behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Package Billing / Provider Mapping Governance as future-only planning with the requested future concepts: package definition, package version, contractor package assignment, billing plan, billing price, provider product, provider price, provider customer, subscription, subscription item, billing status, trial/early-access status, custom/grandfathered commercial contract, and payment-method/setup readiness.
- `docs/Roadmap.md` includes future provider mapping lifecycle states `draft`, `provider_pending`, `mapped`, `verified`, `active`, `deprecated`, and `archived`, plus future reconciliation concepts, audit evidence, provider safety boundaries, and QA/security gates without claiming an implemented provider mapping write model.
- `docs/workflows.md` separates implemented read-only `/super-admin/packages` inspection and the implemented Future Package Definition Model planning panel from future-only billing/provider mapping, provider reconciliation, billing/subscription operations, package assignment relationships, entitlement/module enforcement, Stripe/provider calls, and contractor-facing behavior.
- `docs/current-state.md` remains implemented truth: `/super-admin/packages` is read-only package/billing observability plus a static planning panel, and it does not claim provider mapping persistence, billing mutations, Stripe calls, subscriptions, package assignment writes, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior.
- `docs/README.md` did not need changes because no new document was added.

Stale wording corrected:

- No overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- This handoff now records the completed consistency review so the next step does not imply billing/provider mapping has been implemented as app behavior.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: future Package Entitlement / Module Boundary Governance. Define how future package definitions, package assignments, billing/provider mappings, entitlements, module visibility, server-side runtime gates, audit evidence, and QA/security gates should relate without implementing app code, schema, billing mutations, Stripe calls, subscription operations, entitlement enforcement, module gating, package assignment writes, contractor permission changes, or runtime behavior."

## Package Billing / Provider Mapping Governance Planning

This docs-only Super Admin Platform Evolution pass planned future Package Billing / Provider Mapping Governance. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, package-assignment behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package Billing / Provider Mapping planning summary:

- Future billing/provider mapping is defined as the bridge between approved package definitions/package versions, contractor package assignments, commercial billing plans/prices, provider products/prices/customers, subscriptions, subscription items, billing status, trial/early-access state, custom/grandfathered contracts, and payment-method/setup readiness.
- Package definitions remain product packaging; contractor package assignments remain platform governance; billing provider mapping translates approved commercial terms to provider artifacts; subscription state remains provider/commercial state; entitlement/module enforcement remains a separate future runtime layer.
- Contractor groups may suggest package targeting or rollout cohorts later but must not mutate billing. Starter packs and onboarding remain separate from billing and must not create provider subscriptions, products, prices, or billing-state changes.

Provider mapping lifecycle planning summary:

- Future provider mapping lifecycle states: `draft`, `provider_pending`, `mapped`, `verified`, `active`, `deprecated`, and `archived`.
- `draft` captures proposed internal mapping before provider state is trusted.
- `provider_pending` represents provider artifact creation, lookup, or import still needing verification.
- `mapped` means internal references exist but provider state still requires reconciliation.
- `verified` requires provider state, billing plan, price, currency, cadence, trial/discount terms, and package/version context to match expected internal state.
- `active` should require platform-admin approval, sandbox/test-mode validation, server-only provider execution, webhook/reconciliation design, audit evidence, and no-unintended-mutation QA gates.
- `deprecated` and `archived` preserve existing support/audit history instead of destructive provider mapping edits.

Billing/provider safety boundaries:

- Package assignment must not silently create, update, or cancel provider subscriptions.
- Billing changes require a separate explicit platform-admin approval workflow.
- Provider mapping must be verified before any billing action.
- Stripe sandbox validation is required before live billing behavior.
- Provider webhook reconciliation must be designed before provider state is trusted.
- Billing failure handling stays separate from package assignment.
- Subscription cancellation/suspension must be auditable.
- Provider calls must be server-side only; secret keys must not enter the browser; provider mutations need idempotency keys; webhook signatures must be verified; raw provider errors must not be displayed; provider ids are references, not secrets, but still need careful display.

Future reconciliation and QA gates:

- Future reconciliation should compare expected provider state to observed provider state and classify mismatch/attention-needed, pending webhook, stale provider mapping, failed provider operation, and manual support review states.
- No automatic destructive correction should run without explicit approval.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, service-role/server-only tests, Stripe sandbox tests, provider idempotency tests, webhook signature tests, no unintended billing mutation tests, no entitlement/runtime mutation tests, browser QA, audit evidence verification, and reconciliation mismatch tests.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the future Package Billing / Provider Mapping Governance planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe provider mapping as future-only planning with no provider mapping writes, billing mutations, Stripe calls, subscription operations, package assignment writes, entitlement/module/runtime enforcement, contractor permission changes, starter-pack provisioning, or product behavior."

## Contractor Package Assignment Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the future Contractor Package Assignment Governance planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, package-assignment behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification summary:

- `docs/Roadmap.md` consistently describes Contractor Package Assignment Governance as future-only planning: the audited link between a company/contractor and an approved/published package definition version, with future states `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`.
- `docs/Roadmap.md` includes future audit evidence, migration/change paths, billing separation, entitlement/module separation, contractor-group separation, starter-pack separation, and QA/security gates without claiming an implemented package assignment write model.
- `docs/workflows.md` separates implemented read-only `/super-admin/packages` inspection and the implemented Future Package Definition Model planning panel from future-only contractor package assignment, approval/audit, billing/subscription, entitlement/module, and runtime enforcement workflows.
- `docs/current-state.md` remains implemented truth: `/super-admin/packages` and the Future Package Definition Model are read-only planning/inspection surfaces, and no package assignment persistence, approvals, assignments, Stripe subscriptions, billing mutations, entitlements, module gates, contractor permission changes, starter-pack provisioning changes, or runtime package behavior exist.
- `docs/README.md` did not need changes because no new document was added.

Stale wording corrected:

- No overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- This handoff now records the completed consistency review so the next step does not imply contractor package assignment has been implemented as app behavior.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only: future Package Billing / Provider Mapping Governance. Define how future package definitions and contractor package assignments should map to billing plans, provider artifacts, Stripe/subscription state, approval evidence, reconciliation, sandbox QA gates, and audit boundaries without implementing app code, schema, Stripe calls, billing mutations, subscription operations, entitlement/module enforcement, package assignment writes, contractor permission changes, or runtime behavior."

## Contractor Package Assignment Governance Planning

This docs-only Super Admin Platform Evolution pass planned the future Contractor Package Assignment Governance model. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor permissions, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Contractor package assignment governance planning summary:

- Future contractor package assignment is defined as the audited link between a company/contractor and an approved/published package definition version.
- Assignment is explicitly separate from package definition, billing subscription, entitlement enforcement, module gating, contractor groups, and starter-pack provisioning.
- Future assignment workflows should select the contractor/company, select an approved/published package version, review current package/billing/entitlement context, review pricing/billing impact, review module/entitlement impact, review starter-pack/onboarding implications, require platform-admin reason and confirmation, schedule an effective date when needed, activate only through a future audited action, and preserve history.

Assignment lifecycle planning summary:

- Future states: `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`.
- `approved` should record the human decision but should not activate the assignment, mutate billing, toggle entitlements, gate modules, change permissions, or affect runtime behavior.
- `active` should be reachable only after future package definition, assignment, authorization, billing-separation, entitlement-separation, and QA gates exist.
- `superseded`, `canceled`, and `archived` preserve support/audit history instead of destructive edits.

Audit and separation boundaries:

- Future audit evidence should include actor, timestamp, company id/name, previous package assignment snapshot, new package assignment snapshot, selected package version, reason, confirmation text, effective date, billing impact summary, entitlement/module impact summary, provider mapping snapshot, starter-pack/onboarding implication snapshot, and rollback/supersession strategy.
- Package assignment must not silently create/update/cancel Stripe subscriptions; billing changes require a separate explicit billing workflow and independent provider audit.
- Package assignment must not silently toggle runtime access; entitlements and module gates require a separate implemented model and audit.
- Contractor groups may suggest assignments later but must not auto-change package assignment.
- Starter-pack implications remain onboarding/provisioning context only and must not auto-provision or mutate tenant-owned records.

Future safety/QA gates:

- Schema/RLS tests.
- Platform-admin authorization tests.
- No-service-role-browser-exposure tests.
- No unintended billing mutation tests.
- No unintended entitlement/module runtime mutation tests.
- Stripe sandbox tests before provider behavior.
- Browser QA.
- Audit evidence verification.
- Rollback/supersession tests.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the future Contractor Package Assignment Governance planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, `docs/chat-handoff.md`, and `docs/current-state.md` consistently describe package assignment as future-only planning with no package assignment writes, billing/Stripe/subscription mutation, entitlement/module/runtime enforcement, contractor permission changes, starter-pack provisioning, or product behavior."

## Package Lifecycle Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the future Package Lifecycle and Approval Workflow planning section across the source-of-truth docs. It did not change application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor-side permission behavior, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation/source-of-truth verification:

- `docs/Roadmap.md` consistently describes Package Lifecycle and Approval Workflow as future-only planning with states `draft`, `internal_review`, `approved`, `published`, `deprecated`, and `archived`, plus future versioning, published snapshot/immutability expectations, approval/audit evidence, and package-assignment boundaries.
- `docs/workflows.md` separates implemented read-only `/super-admin/packages` inspection and the implemented Future Package Definition Model planning panel from future-only package lifecycle, approval, assignment, billing/subscription, entitlement, module-gating, and runtime workflows.
- `docs/current-state.md` remains implemented truth: `/super-admin/packages` is platform-admin-only, read-only package/billing observability plus a static planning panel, and it does not claim package lifecycle persistence, package approvals, package assignments, billing changes, Stripe subscriptions, entitlement enforcement, module gates, pricing/package enforcement, contractor permission behavior, or runtime package behavior.
- `docs/README.md` needed no change because no new documentation file was added.

Stale wording corrected:

- No overclaim was found in `docs/Roadmap.md`, `docs/workflows.md`, `docs/current-state.md`, or `docs/README.md`.
- This handoff now records the completed consistency review so the current next step does not imply Package Lifecycle and Approval Workflow has been implemented as app behavior.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only for future Contractor Package Assignment Governance. Define assignment lifecycle, approval/audit evidence, separation from package definitions, billing changes, entitlements, module gates, contractor groups, and migration paths without app code, schema, Stripe calls, billing mutations, package enforcement, contractor permissions, or runtime behavior."

## Package Lifecycle and Approval Workflow Planning

This docs-only Super Admin Platform Evolution pass planned the future package lifecycle and approval workflow for Package / Billing Governance. It did not add application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, contractor-side permission behavior, contractor navigation, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning behavior, or product behavior.

Files changed in this pass:

- `docs/Roadmap.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Package lifecycle planning summary:

- Future package definitions should use explicit lifecycle states: `draft`, `internal_review`, `approved`, `published`, `deprecated`, and `archived`.
- Future published package definitions should be immutable or snapshotted, with versioning, deprecation, archive, grandfathering/custom-contract exceptions, and migration paths used instead of destructive edits.
- Future contractor package assignment remains separate from package definition and should be separately auditable.

Approval workflow planning summary:

- Future review should validate package dimensions, billing/provider mapping, module availability, usage limits, starter-pack defaults, contractor group targeting, entitlement mapping, and Stripe/provider mapping before approval.
- Future publishing should require explicit platform-admin approval and should only publish approved versions after schema/RLS, authorization, provider, entitlement, module, migration, browser, and regression QA gates pass.
- Future audit evidence should capture actor, timestamp, before/after snapshot, reason, confirmation text, impacted package dimensions, provider mapping snapshot, entitlement/module mapping snapshot, and rollback/deprecation strategy.

Future safety boundaries:

- No runtime enforcement until entitlement modeling exists.
- No Stripe mutation until billing workflows exist.
- No contractor-facing package change until assignment workflows exist.
- No module gating until module entitlement mapping exists.
- No automatic package changes from contractor groups.
- No AI or automation package changes.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the future Package Lifecycle and Approval Workflow planning section. Confirm `docs/Roadmap.md`, `docs/workflows.md`, and `docs/chat-handoff.md` consistently describe the lifecycle as future-only planning with no package persistence, assignment, billing, Stripe, entitlement, module-gating, contractor-permission, or runtime behavior."

## Package Definition Planning Source-of-Truth Review

This docs-only Super Admin Platform Evolution pass verified the `/super-admin/packages` Future Package Definition Model documentation against the implemented read-only planning helper and Packages page. No application code, tests, migrations, schema, RLS/grants, UI behavior, runtime behavior, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, package enforcement, starter-pack provisioning behavior, automation, AI behavior, background jobs, or product behavior was changed.

Files changed in this pass:

- `docs/current-state.md`
- `docs/workflows.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`

Docs/source-of-truth verification:

- `docs/current-state.md` now explicitly describes the Future Package Definition Model posture flags: `readOnly: true`, `planningOnly: true`, `runtimeEnforcement: false`, and `mutationControlsAvailable: false`.
- `docs/current-state.md` also clarifies that package-definition persistence and package-assignment models do not exist yet.
- `docs/workflows.md` keeps `/super-admin/packages` as inspection-only and expands the planning-model separation across package definitions, billing plans, plan tiers, module visibility, usage limits, entitlements, feature flags, provider mapping, trial/early-access status, grandfathered/custom contracts, contractor groups, and starter-pack assignments.
- `docs/Roadmap.md` now distinguishes the implemented read-only planning panel from future package-definition persistence, billing management, subscription operations, Stripe-backed billing, entitlement enforcement, module gating, pricing enforcement, contractor permissions, and runtime mutation.
- `docs/chat-handoff.md` retains the prior posture/browser regression result, before/after counts, validation, known caveats, and recommended next prompt below.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as docs-first design only for future package lifecycle and approval workflow. Keep it planning-only with no app code, migrations, schema, billing mutations, Stripe calls, entitlement/module enforcement, package assignment, contractor permissions, or runtime behavior."

## Package Definition Planning Posture Review

This Super Admin Platform Evolution pass ran a narrow posture/browser regression review for the read-only `Future Package Definition Model` panel on `/super-admin/packages`. No confirmed posture defect was found, so no application code, tests, migrations, schema, RLS/grants, billing behavior, Stripe behavior, subscription behavior, entitlement behavior, module-gating behavior, contractor navigation, runtime behavior, automation, AI behavior, background jobs, tenant-owned template/catalog writes, or starter-pack provisioning behavior was changed.

Files changed in this pass:

- `docs/chat-handoff.md`

Read-only model verification:

- `buildPlatformPackageDefinitionPlanningModel()` returns `readOnly: true`, `planningOnly: true`, `runtimeEnforcement: false`, and `mutationControlsAvailable: false`.
- The planning model exposes no mutation/action descriptor keys such as `href`, `method`, `buttonLabel`, `formAction`, `actionAvailable`, or `mutationAvailable`.
- The model is static planning output only and does not read/write package assignments, call Stripe, resolve entitlements, gate modules, or mutate runtime behavior.

Future-boundary verification:

- The planning output separates package definitions, billing plans, plan tiers, module visibility, usage limits, onboarding/default starter packs, contractor group targeting, billing provider mapping, entitlements, feature flags, trial/early-access status, and grandfathered/custom contracts.
- Contractor groups are classified as segmentation metadata, not billing plans, tenant roles, entitlements, package assignments, or contractor permissions.
- Starter packs are classified as onboarding/default provisioning inputs, not billing enforcement or entitlement gates.

Browser QA:

- Playwright opened `http://localhost:3001/super-admin/packages` with `playwright/.auth/platform-admin.json`.
- Confirmed `Future Package Definition Model` rendered.
- Confirmed copy states package definitions, billing enforcement, entitlements/module gates, and Stripe-backed subscription operations are not implemented.
- Page-scoped `form`, `input`, `button`, `select`, and `textarea` counts inside `data-testid="platform-package-governance-page"` were all `0`.
- The only page-scoped anchors matching the broad package/billing scan were top-tab anchors to `#package-billing-overview` and `#billing-setup-readiness`; no package, billing, Stripe, subscription, entitlement, module, activation, runtime, or mutation controls were present.
- Browser console/page errors for the checked Packages page: `0`.

Non-platform access:

- Using the existing contractor-only `playwright/.auth/local-user.json` state, direct navigation to `/super-admin/packages` redirected to `/dashboard?error=Platform+admin+access+is+required.`.
- `data-testid="platform-package-governance-page"` count was `0` for the contractor-only session.

Before/after count verification:

| Table | Before | After |
| --- | ---: | ---: |
| `companies` | 10 | 10 |
| `company_subscriptions` | 0 | 0 |
| `subscription_plans` | 0 | 0 |
| `document_templates` | 4 | 4 |
| `catalog_items` | 9 | 9 |
| `platform_starter_pack_provisioning_runs` | 4 | 4 |
| `platform_starter_pack_provisioning_run_items` | 5 | 5 |
| `contractor_group_audit_events` | 52 | 52 |
| `contractor_group_memberships` | 0 | 0 |

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/package-definition-planning.test.ts apps/web/lib/platform-admin/package-governance.test.ts` passed: 11 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a docs-only source-of-truth consistency review for the Package Definition Planning posture review. Confirm `docs/current-state.md`, `docs/workflows.md`, `docs/Roadmap.md`, and `docs/chat-handoff.md` consistently describe the Packages page as read-only/planning-only, with no billing, Stripe, subscription, entitlement, module-gating, package-assignment, contractor-permission, or runtime behavior."

## Package Definition Planning Read-Model

This Super Admin Platform Evolution slice added a planning/read-model-only package definition layer to `/super-admin/packages`. It did not add migrations, new tables, schema changes, RLS/grant changes, Stripe calls, billing changes, subscription creation/update/cancel, payment collection, entitlement enforcement, module gating, pricing/package enforcement, activation mutation, contractor permissions, contractor navigation, runtime behavior, automation, AI behavior, background jobs, tenant-owned template/catalog writes, starter-pack provisioning changes, or service-role exposure.

Files changed in this slice:

- `apps/web/app/(super-admin)/super-admin/packages/page.tsx`
- `apps/web/lib/platform-admin/package-definition-planning-core.ts`
- `apps/web/lib/platform-admin/package-definition-planning.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`

Package definition planning/read-model summary:

- Added `buildPlatformPackageDefinitionPlanningModel()` as a static pure planning model with `readOnly: true`, `runtimeEnforcement: false`, `mutationControlsAvailable: false`, and `planningOnly: true`.
- The model separates future package definition, billing plan, plan tier, module availability, usage limits, onboarding/default starter packs, contractor group targeting, billing provider mapping, entitlements, feature flags, trial/early-access status, and grandfathered/custom contracts.
- The model lists future package lifecycle states, required approvals, data dependencies, enforcement boundaries, and risks/caveats.
- Contractor groups are classified as segmentation, not billing plans, tenant roles, entitlements, package assignments, or contractor permissions.
- Starter packs are classified as onboarding/default provisioning inputs, not billing enforcement or entitlement gates.

UI summary:

- `/super-admin/packages` now renders a read-only `Future Package Definition Model` section after the existing future-controls section.
- The panel explicitly says package definitions, billing enforcement, entitlements/module gates, and Stripe-backed subscription operations are not implemented yet.
- The panel exposes no forms, inputs, buttons, Stripe controls, billing controls, entitlement controls, module controls, activation controls, or mutation controls.

Browser QA:

- Playwright opened `http://localhost:3001/super-admin/packages` with `playwright/.auth/platform-admin.json`.
- The page rendered `data-testid="platform-package-governance-page"`.
- Confirmed `Future Package Definition Model` rendered with no-implementation copy for package definitions, billing enforcement, entitlements/module gates, and Stripe-backed subscription operations.
- Page-scoped `form`, `input`, `button`, `select`, and `textarea` counts inside the Packages page container were all `0`.
- Browser console/page errors for the checked Packages page: `0`.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/package-definition-planning.test.ts apps/web/lib/platform-admin/package-governance.test.ts` passed: 11 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a narrow browser/posture regression review for `/super-admin/packages` after the Future Package Definition Model planning panel. Confirm the panel renders, no forms/inputs/buttons or mutation controls were added, no Stripe/billing/subscription/entitlement/module/runtime behavior exists, and update only docs/tests for confirmed posture gaps."

## Project-Centered Scheduling Clarity Checkpoint

This slice paused AI cue expansion and made one small Project Workspace readiness/scheduling clarity improvement. The ready-to-schedule action panel still appears only when the existing project readiness snapshot is clear and still uses existing job Quick-Create plus the shared `/schedule` surface. When a ready project already has jobs and none are unscheduled, the panel now makes `Open schedule` the primary follow-through and labels the state as `Job schedule already set`, so users can distinguish no-job, unscheduled-job, and scheduled-job handoffs without adding new workflow state.

Files changed in this slice:

- `apps/web/components/ready-to-schedule-action-panel.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Boundary preserved:

- No AI cue behavior, cue bridge behavior, dashboard behavior, autonomous creation, schema, migration, financial calculation, readiness rule, invoice/payment logic, contract signature logic, job scheduling logic, field execution logic, app shell, navigation, or duplicate model change was made.

Validation:

- `pnpm exec tsx --test apps/web/lib/projects/cues.test.ts apps/web/lib/work-items/work-items.test.ts apps/web/lib/work-items/prefill.test.ts` passed: 15 tests.
- `pnpm exec tsx --test apps/web/lib/dashboard/project-cue-preview.test.ts` passed: 1 test.
- `pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected` passed: 7 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Run a narrow browser/readability QA pass on the Project Workspace ready-to-schedule handoff states. Verify no-job, one unscheduled job, and already-scheduled job copy/actions route to the existing `/jobs` and `/schedule` workflows without changing readiness or scheduling logic."

## Package / Billing Governance Source-of-Truth Review

This handoff is currently aligned to the Super Admin Platform Evolution Packages lane. `/super-admin/packages` is implemented as a platform-admin-only, read-only Package / Billing Plan Governance foundation for observability over existing records only.

Docs/source-of-truth verification:

- `docs/current-state.md` accurately describes `/super-admin/packages` as server-side, platform-admin-only, read-only package/billing governance over existing `companies`, `company_subscriptions`, linked `subscription_plans`, and safe Stripe configuration-presence checks.
- `docs/workflows.md` now includes the implemented Packages inspection workflow and separates it from future package changes, billing/subscription operations, entitlement/module enforcement, and runtime behavior.
- `docs/Roadmap.md` now distinguishes the implemented read-only foundation from future package definitions, billing management, plan enforcement, entitlement gating, module gating, subscription operations, and Stripe-backed billing.
- The existing security/posture handoff below remains the current verification result for access control, server-only data access, Stripe/billing no-mutation posture, safe data presentation, browser QA, before/after counts, and validation.

Current package/billing boundary:

- The Packages surface shows package/billing overview cards, contractor plan state, billing setup readiness, early-access/activation status, and future package-control caveats.
- It does not call Stripe, inspect or print secret values, create subscriptions, create invoices, charge cards, enforce entitlements, gate modules, change packages/pricing, change contractor permissions, change billing setup, mutate tenant records, or affect runtime behavior.
- Future real package definitions, billing management, plan enforcement, entitlement/module gating, subscription operations, and Stripe-backed billing remain unimplemented until explicitly scoped.

Validation for this docs-only review:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Plan the next Super Admin Platform Evolution package/billing governance slice as design-first or read-only only. Define future package definitions, billing management, plan enforcement, entitlement gating, module gating, subscription operations, and Stripe-backed billing boundaries without adding runtime behavior, Stripe calls, billing mutations, or contractor-facing changes."

## Phase 8F Package Governance Security/Posture Regression Review

Phase 8F ran the narrow security/posture and browser regression review for `/super-admin/packages`. This pass was verification/hardening only. No confirmed posture defect was found, so no application code or tests were changed. No migration, schema change, RLS/grant change, Stripe API call, billing setup change, subscription creation/update/cancel, payment collection, invoice creation, entitlement enforcement, module gating, pricing/package enforcement, activation mutation, contractor-side permission change, contractor navigation change, runtime behavior, automation, AI behavior, background job, tenant-owned template/catalog write, financial/tax/payroll change, invoice/contract generation change, user preference behavior, or client/browser service-role exposure was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Security/posture verification:

- Platform-admin access: confirmed `/super-admin/packages` inherits `apps/web/app/(super-admin)/super-admin/layout.tsx`, which calls `requirePlatformAdminUser("/super-admin")` server-side. `requirePlatformAdminUser` checks `platform_user_roles` through the platform role helper and redirects non-platform-admin users to `/dashboard?error=Platform+admin+access+is+required.` Contractor membership roles do not grant access.
- Browser denial check: using the existing contractor-only `playwright/.auth/local-user.json` state, direct navigation to `http://localhost:3001/super-admin/packages` redirected to `/dashboard?error=Platform+admin+access+is+required.`, and `data-testid="platform-package-governance-page"` count was `0`.
- Server-only data access: confirmed `apps/web/lib/platform-admin/data.ts` imports `server-only`, the page is a server component with no `"use client"`, and package governance loads through `getPlatformPackageGovernance()` plus existing platform-admin data helpers. No privileged data access moved into a client component.
- Service-role posture: source search found no `NEXT_PUBLIC_*` service-role exposure and no service-role key usage in the Packages page/core/test files. Service-role env references remain server/config-only or documentation/security-test context.
- Stripe/billing posture: confirmed the Packages page does not import Stripe helpers, call Stripe, create SetupIntents, mutate payment methods, create/update/cancel subscriptions, create invoices, or charge cards. Stripe readiness output is limited to safe key-presence/mode labels from the server env helper; raw env values and secrets are not printed.
- Read-only/no mutation posture: source and Browser checks confirmed the page has no package/plan-change, billing update, subscription, Stripe sync, payment collection, entitlement, module-gating, pricing/package enforcement, activation toggle, or contractor-permission controls.
- Navigation posture: `/super-admin/packages` appears in `platformAdminNavItems` and the Super Admin overview only. `contractorSettingsNavItems` and contractor-facing route searches do not link to `/super-admin/packages`.
- Safe data presentation: Browser DOM checks found no unsafe markers or raw operational/provider details: `SQLSTATE`, `PGRST`, `SUPABASE_SERVICE_ROLE`, `SERVICE_ROLE`, `service_role`, `postgres://`, `api_key`, `stack trace`, `permission denied for table`, `duplicate key value violates`, `violates row-level security`, `rawDbError`, Stripe secret/publishable key prefixes, raw Stripe column names, `cus_`, or `pm_`.

Browser QA:

- Browser QA opened `http://localhost:3001/super-admin/packages` with the existing platform-admin session.
- The page rendered `data-testid="platform-package-governance-page"` and `data-testid="platform-package-read-only-copy"`.
- Confirmed all required sections rendered: `Package / Billing Overview`, `Contractor Plan State`, `Billing Setup Readiness`, `Early-Access / Activation Status`, and `Not Yet Governed / Future Package Controls`.
- Page-scoped `form`, `input`, `button`, `select`, and `textarea` counts were all `0`.
- Browser console errors for the checked Packages page: `0`.

Before/after count verification:

| Table | Before | After |
| --- | ---: | ---: |
| `companies` | 10 | 10 |
| `company_subscriptions` | 0 | 0 |
| `subscription_plans` | 0 | 0 |
| `document_templates` | 4 | 4 |
| `catalog_items` | 9 | 9 |
| `platform_starter_pack_provisioning_runs` | 4 | 4 |
| `platform_starter_pack_provisioning_run_items` | 5 | 5 |
| `contractor_group_audit_events` | 52 | 52 |
| `contractor_group_memberships` | 0 | 0 |

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/package-governance.test.ts` passed: 6 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- Completed by the Package / Billing Governance Source-of-Truth Review above. Use the current recommended next prompt at the top of this handoff.

## Phase 8E Super Admin Package / Billing Plan Governance Foundation

Phase 8E implemented the next small Super Admin Platform Evolution slice: a read-only Package / Billing Plan Governance foundation at `/super-admin/packages`. This pass added observability only. No migration, new table, schema change, RLS/grant change, Stripe API call, billing setup change, subscription creation/update/cancel, payment collection, invoice creation, entitlement enforcement, module gating, pricing/package enforcement, contractor-side permission change, contractor navigation change, runtime behavior, automation, AI behavior, background job, tenant-owned template/catalog write, financial/tax/payroll change, invoice/contract generation change, user preference behavior, or client/browser service-role exposure was added.

Files changed in this pass:

- `apps/web/app/(super-admin)/super-admin/packages/page.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/lib/platform-admin/package-governance-core.ts`
- `apps/web/lib/platform-admin/package-governance.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`

Implemented read model:

- `buildPlatformPackageGovernance` produces summary cards, plan buckets, tenant/lifecycle buckets, billing-readiness buckets, early-access/activation buckets, tenant rows with caveats, Stripe configuration-presence notes, read-only operator guidance, and future package-control boundaries.
- Server data loading reuses existing platform-admin server-side data helpers and existing records only: `companies`, `company_subscriptions`, linked `subscription_plans`, and safe env-presence checks from the existing server env helper.
- Stripe readiness notes show only key-presence/mode labels. The page does not inspect or print secret values and does not call Stripe.

UI summary:

- Added `/super-admin/packages` behind the existing `/super-admin` layout, so the page requires explicit platform-admin access through the existing platform-role boundary.
- Added Super Admin navigation and overview entry for Packages only; contractor-side navigation was not changed.
- The page includes `Package / Billing Overview`, `Contractor Plan State`, `Billing Setup Readiness`, `Early-Access / Activation Status`, and `Not Yet Governed / Future Package Controls`.
- Visible copy states the page is read-only and has no billing changes, Stripe calls, charges, subscriptions, entitlement enforcement, package/module gating, contractor permission changes, or runtime behavior.

Tests and validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/package-governance.test.ts` passed: 6 tests covering summary counts, missing-plan caveats, billing setup readiness caveats, early-access/activation grouping, no mutation/action fields, and safe bounded display labels.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Browser QA:

- Browser QA opened `http://localhost:3001/super-admin/packages` with the existing platform-admin session.
- The page rendered `data-testid="platform-package-governance-page"` and the read-only copy.
- Confirmed all required sections rendered: `Package / Billing Overview`, `Contractor Plan State`, `Billing Setup Readiness`, `Early-Access / Activation Status`, and `Not Yet Governed / Future Package Controls`.
- Page-scoped `form`, `input`, and `button` counts were all `0`.
- Browser console errors for the checked page: `0`.

Recommended next prompt:

- Completed by the Phase 8F Package Governance Security/Posture Regression Review above. Use the current recommended next prompt at the top of this handoff.

## Phase 8D Super Admin Operations Docs Consolidation

Phase 8D ran a documentation/source-of-truth consolidation pass for the Super Admin Operations / System Health read-only surface. This pass was documentation-only. No application code, tests, migrations, schema, RLS/grant posture, UI behavior, runtime behavior, remediation action, retry control, archive/delete control, provisioning execution, assignment automation, entitlement behavior, pricing/package behavior, AI behavior, background job, contractor-side permission change, contractor navigation change, tenant-owned template/catalog write, or product behavior was changed.

Files changed in this pass:

- `docs/current-state.md`
- `docs/workflows.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`

Source-of-truth verification:

- Confirmed the implemented Operations page is `/super-admin/operations`, platform-admin-only, and read-only.
- Confirmed the implemented UI sections are `Platform Health Summary`, `Recent Operational Activity`, `Attention Needed`, `Audit Sources`, and `Not Yet Monitored / Future Operations`.
- Confirmed the implemented read model uses existing sources only: tenant status counts, recent workflow errors, recent starter-pack provisioning runs/items, recent provisioning attempts, recent contractor group audit events, contractor group membership counts, and starter-pack assignment intent counts.
- Confirmed the read model sanitizes and caps operational labels, workflow/error/activity summaries, starter-pack run errors, starter-pack attempt messages, and source caveats before display.
- Confirmed the page has no forms or page-scoped buttons/inputs for remediation, retry, fix, resolve, archive, delete, provision, assign, entitlement, runtime, sync, or backfill controls.
- Confirmed the current surface does not mutate tenant records, create logs, trigger automation, execute provisioning, enforce entitlements, change pricing/packages, change runtime behavior, add AI behavior, or expose service-role credentials to the browser.

Stale wording corrected:

- Updated `docs/current-state.md` so the Operations entry names the exact implemented sections, platform-admin-only access, sanitizer/bounded-message behavior, and explicit no-control/no-automation boundaries.
- Updated `docs/workflows.md` with the implemented read-only platform-admin operations observability flow and separated it from future support operations, alerting, runbook, incident, remediation, retry, escalation, and system-health automation work.
- Updated `docs/Roadmap.md` so Phase 8 recognizes the implemented read-only Operations/System Health foundation while keeping broader operations expansion future-only and explicitly non-current.
- `docs/README.md`, `docs/contractor-groups-plan.md`, `docs/starter-pack-provisioning-plan.md`, and `docs/starter-pack-provisioning-review.md` were inspected for this scope; no index or plan correction was required.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a final docs-only source-of-truth review for the Super Admin Operations / System Health read-only surface. Verify no implemented behavior is described as future-only, no future remediation/automation behavior is described as implemented, and no app code, tests, migrations, schema, RLS/grants, UI behavior, or runtime behavior changes are made."

## Phase 8C Super Admin Operations Final Browser Regression

Phase 8C ran the final narrow browser regression pass for `/super-admin/operations` after the sanitizer hardening. This pass was verification-only except for this handoff update. No application code, migration, schema, RLS/grant posture, remediation action, retry control, archive/delete control, provisioning execution, assignment automation, entitlement behavior, pricing/package behavior, runtime behavior, AI behavior, background job, contractor-side permission change, contractor navigation change, tenant-owned template/catalog write, or new product behavior was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Browser regression evidence:

- Platform-admin Browser QA opened `http://localhost:3001/super-admin/operations`.
- The page rendered without shell hang and showed `data-testid="platform-operations-page"` plus the read-only copy.
- Confirmed all required sections rendered: `Platform Health Summary`, `Recent Operational Activity`, `Attention Needed`, `Audit Sources`, and `Not Yet Monitored / Future Operations`.
- Browser console errors/warnings for the checked page: `0`.
- No framework error overlay was detected.

Sanitized presentation verification:

- DOM checks found no unsafe operational detail markers: `SQLSTATE`, `PGRST`, `SUPABASE_SERVICE_ROLE`, `SERVICE_ROLE`, `service_role`, `postgres://`, `api_key`, `stack trace`, `permission denied for table`, `duplicate key value violates`, `violates row-level security`, or `rawDbError`.
- Source/read-only caveat copy rendered safely.
- Focused tests continued to verify unsafe details are hidden and long details are capped/truncated by the read-model sanitizer.

No-mutation-control verification:

- Page-scoped `form` count: `0`.
- Page-scoped `input` count: `0`.
- Page-scoped `button` text list: empty.
- Page-scoped forbidden button counts were all `0` for Retry, Fix, Resolve, Archive, Delete, Provision, Assign, Entitlement, Runtime, Sync, and Backfill.
- The loaded app shell still had the global sign-out form/button only; it was outside the Operations page content.

Non-platform access result:

- Contractor/non-platform storage state opened `http://localhost:3001/super-admin/operations` and redirected to `/dashboard?error=Platform+admin+access+is+required.`.
- The redirected contractor view did not contain `Platform Health Summary` or `Recent Operational Activity`.

Before/after counts:

- Before: `companies = 10`, `workflow_error_events = 8`, `contractor_group_audit_events = 52`, `contractor_group_memberships = 0`, `platform_starter_pack_provisioning_runs = 4`, `platform_starter_pack_provisioning_run_items = 5`, `platform_starter_pack_provisioning_attempts = 6`, `document_templates = 4`, `catalog_items = 9`.
- After: `companies = 10`, `workflow_error_events = 8`, `contractor_group_audit_events = 52`, `contractor_group_memberships = 0`, `platform_starter_pack_provisioning_runs = 4`, `platform_starter_pack_provisioning_run_items = 5`, `platform_starter_pack_provisioning_attempts = 6`, `document_templates = 4`, `catalog_items = 9`.
- Counts did not change.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/operations-observability.test.ts` passed: 7 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a docs/source-of-truth consolidation pass for the Super Admin Operations / System Health read-only surface. Verify `docs/current-state.md`, `docs/workflows.md`, `docs/Roadmap.md`, and `docs/chat-handoff.md` accurately distinguish implemented read-only observability from future remediation, alerting, provisioning, entitlement, runtime, and automation work. Documentation-only; do not change app code, migrations, schema, RLS/grants, or runtime behavior."

## Phase 8B Super Admin Operations Security/Posture Review

Phase 8B ran the narrow security/posture review for the new read-only `/super-admin/operations` surface. This pass was verification/hardening only. No migration, schema change, RLS/grant change, new table, remediation action, retry control, archive/delete control, provisioning execution, assignment automation, entitlement behavior, pricing/package behavior, runtime behavior, AI behavior, background job, contractor-side permission change, contractor navigation change, tenant-owned template/catalog write, or new product behavior was added.

Files changed in this pass:

- `apps/web/lib/platform-admin/operations-observability-core.ts`
- `apps/web/lib/platform-admin/operations-observability.test.ts`
- `docs/chat-handoff.md`

Security/posture verification:

- Platform-admin access: `/super-admin/operations` is nested under the existing `/super-admin` server layout, which calls `requirePlatformAdminUser("/super-admin")`; contractor membership roles still do not grant access. Browser QA with a contractor-only storage state redirected from `/super-admin/operations` to `/dashboard?error=Platform+admin+access+is+required.` and did not render the operations page.
- Server-only data access: the page is a server component and reads through `apps/web/lib/platform-admin/data.ts`, which is marked `server-only` and uses the existing admin Supabase boundary. No service-role client or service-role key was moved into a client component, browser payload, or `NEXT_PUBLIC_*` exposure.
- Read-only/no-mutation posture: the page has no page-scoped forms, inputs, or buttons. Browser QA found the Operations sections rendered and found zero page-level controls named Retry, Fix, Resolve, Archive, Delete, Provision, Assign, Entitlement, Runtime, Backfill, or Sync. The only form/button on the loaded shell was the global sign-out control.
- Safe data presentation: hardened `buildPlatformOperationsObservability` so workflow-error messages, starter-pack run errors, starter-pack attempt messages, labels, and source caveats are bounded and defensively sanitized before reaching the UI. Unsafe SQL/provider/secret/stack-trace-like details are replaced with generic operator guidance.
- Source availability/caveats: unavailable sources still render as safe read-only caveats rather than throwing away other loaded sources or crashing the page.
- Navigation posture: Operations appears only in the Super Admin navigation/overview. No contractor-side navigation link to `/super-admin/operations` was added.

Before/after counts:

- Before: `companies = 10`, `workflow_error_events = 8`, `contractor_group_audit_events = 52`, `contractor_group_memberships = 0`, `platform_starter_pack_provisioning_runs = 4`, `platform_starter_pack_provisioning_run_items = 5`, `platform_starter_pack_provisioning_attempts = 6`, `document_templates = 4`, `catalog_items = 9`.
- After: `companies = 10`, `workflow_error_events = 8`, `contractor_group_audit_events = 52`, `contractor_group_memberships = 0`, `platform_starter_pack_provisioning_runs = 4`, `platform_starter_pack_provisioning_run_items = 5`, `platform_starter_pack_provisioning_attempts = 6`, `document_templates = 4`, `catalog_items = 9`.
- Counts did not change.

Tests, browser QA, and validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/operations-observability.test.ts` passed: 7 tests covering summary counts, attention-needed classification, unavailable caveats, recent activity ordering, no mutation-control fields, unsafe detail sanitization, and bounded long details.
- Browser QA opened `http://localhost:3001/super-admin/operations` with platform-admin auth. The page rendered Platform Health Summary, Recent Operational Activity, Attention Needed, Audit Sources, and Not Yet Monitored / Future Operations; read-only/no-remediation copy was present; no page-scoped forms/buttons/inputs or browser console errors were found.
- Contractor-only browser QA for `http://localhost:3001/super-admin/operations` redirected to `/dashboard?error=Platform+admin+access+is+required.` and did not render the operations page.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a final narrow browser regression pass for `/super-admin/operations`. Verify the platform-admin page renders cleanly after the sanitizer hardening, all read-only sections remain visible, source caveats remain safe, non-platform access is blocked, counts do not change, and no remediation/provisioning/entitlement/runtime/AI controls exist."

## Phase 8A Super Admin Operations / System Health Foundation

Phase 8A implemented the next small Super Admin Platform Evolution slice: a read-only Platform Operations / System Health foundation at `/super-admin/operations`. This pass added observability only. No migration, new table, schema change, RLS/grant change, remediation action, retry control, archive/delete control, provisioning execution, entitlement behavior, pricing/package behavior, assignment automation, AI behavior, runtime automation, contractor-side permission change, contractor navigation change, tenant-owned template/catalog write, tax/payroll/financial change, invoice/contract generation change, user preference behavior, or background job was added.

Files changed in this pass:

- `apps/web/app/(super-admin)/super-admin/operations/page.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/admin/page.tsx`
- `apps/web/lib/platform-admin/operations-observability-core.ts`
- `apps/web/lib/platform-admin/operations-observability.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Implemented read model:

- `buildPlatformOperationsObservability` produces summary cards, recent activity rows, attention-needed rows, audit source availability/caveats, future operations caveats, and read-only operator guidance from existing data only.
- Server data loading uses existing platform-admin server-side data helpers and service-role boundaries already present in `apps/web/lib/platform-admin/data.ts`; no browser/client service-role exposure was added.
- Sources currently represented are tenant status counts from `companies`, recent `workflow_error_events`, recent starter-pack provisioning runs/items, recent `platform_starter_pack_provisioning_attempts`, recent `contractor_group_audit_events`, `contractor_group_memberships` count, and `platform_starter_pack_assignments` count.
- If a source cannot be loaded, the read model marks it unavailable with a safe caveat instead of exposing raw database/provider details.

UI summary:

- Added `/super-admin/operations` behind the existing super-admin layout, so `/super-admin` and nested routes still require explicit platform-admin access.
- Added Super Admin navigation and overview entry for Operations only; contractor-side navigation was not changed.
- The page includes `Platform Health Summary`, `Recent Operational Activity`, `Attention Needed`, `Audit Sources`, and `Not Yet Monitored / Future Operations`.
- Visible copy states the page is read-only and has no remediation, retry, assignment, provisioning, entitlement, pricing/package, runtime, or tenant-record mutation effect.

Tests and QA:

- `pnpm exec tsx --test apps/web/lib/platform-admin/operations-observability.test.ts` passed: 5 tests covering summary counts, attention-needed classification, unavailable source caveats, recent activity ordering, and no mutation-control fields.
- Browser QA opened `http://localhost:3001/super-admin/operations` with the existing platform-admin session. The page rendered the summary, recent activity, attention, audit source, and future operations sections; only the global shell sign-out control was present. No page-level retry, provisioning execution, manual assignment, entitlement, archive, or delete controls were found.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a narrow security/posture review for the new Super Admin Operations / System Health read-only surface. Verify platform-admin-only access, server-only service-role use, safe source-unavailable caveats, no browser secrets, no mutation controls, and no automation/provisioning/entitlement/runtime behavior. Fix only confirmed posture defects."

## Phase 7F Proposal Manual Assignment Final Docs Review

Phase 7F ran a final documentation/source-of-truth review for contractor group proposal manual assignment. This pass was documentation-only verification. No application code, tests, migrations, schema, RLS/grant posture, UI behavior, runtime behavior, automation, bulk apply, proposal dismissal history, starter-pack provisioning, entitlement behavior, pricing/package behavior, contractor-permission behavior, AI behavior, background job, or tenant-owned template/catalog write was changed.

Files changed in this pass:

- `docs/chat-handoff.md`

Verification summary:

- Confirmed `docs/current-state.md` accurately describes contractor groups as platform-owned segmentation records with durable audit events, implemented proposal manual assignment, eligible-only high/medium active non-future forms, required operator reason, exact `ASSIGN GROUP MANUALLY` confirmation, server-side recomputation before write, one membership plus one audit event only, sanitized/bounded metadata, blocked read-only rows, and no automation/provisioning/entitlement/pricing/permission/runtime/AI/bulk/dismissal behavior.
- Confirmed `docs/workflows.md` accurately describes the platform-admin proposal review flow, manual assignment from one eligible proposal, blocked states, already-assigned/no-duplicate behavior, audited cleanup/removal expectations, and no automatic assignment or downstream business behavior.
- Confirmed `docs/contractor-groups-plan.md` separates implemented behavior from future proposal dismissal/history, future automation possibilities, future entitlement/provisioning possibilities, and explicit non-goals/guardrails.
- Confirmed this handoff contains the Phase 7C security/posture review, Phase 7D final regression QA evidence, before/apply/after counts, cleanup notes, and validation results.
- Corrected one stale historical Phase 6Y handoff sentence so it is clearly marked as superseded planning context rather than current future-action guidance.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Move to the next Super Admin Platform Evolution slice: define the next smallest platform-admin governance/readiness task after contractor-group proposal manual assignment. Stay out of AI, automation, provisioning, entitlement, pricing/package, runtime, and contractor-side permission behavior unless explicitly scoped."

## Phase 7E Proposal Manual Assignment Docs Consolidation

Phase 7E ran a documentation/source-of-truth consolidation pass for contractor group proposal manual assignment. This pass was documentation-only. No application code, tests, migrations, schema, RLS/grant posture, runtime behavior, UI behavior, automation, bulk apply, proposal dismissal history, starter-pack provisioning, entitlement behavior, pricing/package behavior, contractor-permission behavior, AI behavior, background job, or tenant-owned template/catalog write was changed.

Files changed in this pass:

- `docs/current-state.md`
- `docs/workflows.md`
- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Source-of-truth consistency result:

- Confirmed `docs/current-state.md` describes contractor groups as platform-owned segmentation/read-model metadata with audited manual assignment/removal, proposal readiness, eligible-only proposal manual assignment, required operator reason, exact `ASSIGN GROUP MANUALLY` confirmation, server-side recomputation, one membership plus one audit event only, sanitized proposal metadata, already-assigned no-duplicate readback, and no automation/provisioning/entitlement/pricing/permission/runtime effect.
- Confirmed `docs/workflows.md` describes the platform-admin-only proposal review flow, eligible proposal acceptance, blocked proposal states, audited cleanup/removal expectations, no bulk apply / Apply all / Auto assign / dismissal workflow, and no starter-pack provisioning or entitlement effect.
- Updated `docs/contractor-groups-plan.md` so the proposal manual-assignment section distinguishes implemented behavior from future boundaries instead of carrying older "future action/not implemented" wording. The plan now names the implemented action path, metadata-capable RPC support, eligible and blocked states, safe metadata shape, validation/security posture, QA coverage, and future-only dismissal/history/automation/entitlement/provisioning boundaries.
- Confirmed the latest regression QA and security/posture review evidence remains in this handoff, including the Phase 7D before/apply/after counts and cleanup notes and the Phase 7C RPC/RLS/metadata/error-handling verification.

Stale wording corrected:

- Removed stale language implying the proposal action was still unimplemented.
- Replaced old suggested action names with `applyContractorGroupProposalManualAssignmentAction(...)` and the current server-helper/RPC path.
- Clarified that manual-apply impact is current for eligible rows, while proposal decision history/dismissal, automation, entitlements, provisioning, pricing/package behavior, contractor permissions, tenant defaults, and runtime behavior remain future/non-goals.
- Preserved the rule that the proposal read model itself is decision support only; the explicit server action is the only implemented bridge to the audited assignment write path.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a narrow final review of the Super Admin Platform Evolution contractor-group proposal manual assignment docs only. Verify no stale future-action wording remains in `docs/contractor-groups-plan.md`, `docs/current-state.md`, `docs/workflows.md`, and `docs/chat-handoff.md`, and do not change application code, migrations, schema, RLS/grants, or runtime behavior."

## Phase 7D Proposal Manual Assignment Final Regression QA

Phase 7D ran a final narrow regression pass for contractor group proposal manual assignment after the security hardening pass. This pass was QA/hardening only. No application code, schema, migration, RLS/grant posture, automation, bulk apply, proposal dismissal history, starter-pack provisioning, entitlement behavior, pricing/package behavior, contractor-permission behavior, runtime behavior, AI behavior, background job, template/catalog write, or new product feature scope was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Linked Supabase project and deliberate QA setup:

- Linked project: `jcnoraopbwdhshcmplgb`.
- Platform admin actor used for audited QA setup/apply/cleanup: `d4e22ae3-bbf2-4c56-b0fe-c87a4a331a76` (`platform@floorconnector.com`).
- Selected contractor organization: `865f87c3-376e-4d89-8d2c-ed4132264719` (`jfilamonte`, `tenant_status = trialing`, `primary_trade = Epoxy flooring`).
- Created five deliberate QA groups through `public.upsert_contractor_group_with_audit(...)`:
  - eligible active trade-segment group `b0febf19-d481-4a88-8f64-836ea8a9a3d9` / `qa-regression-eligible-20260508145400`
  - inactive trade-segment group `95502b46-9d34-4e74-8ecd-5a3343c46196` / `qa-regression-inactive-20260508145400`
  - active non-matching trade-segment group `a6554fb9-a3f6-4835-870b-9d3a3f89a106` / `qa-regression-not-applicable-20260508145400`
  - active future-plan group `d45e7bc4-3d24-4ec5-967d-3d8db49f8f6c` / `qa-regression-future-plan-20260508145400`
  - active future-entitlement group `8c058414-9283-4ecb-8ae0-4ce45c41768f` / `qa-regression-future-entitlement-20260508145400`
- Cleaned up by removing the QA membership through `public.remove_contractor_group_membership_with_audit(...)` and archiving all five QA groups through `public.archive_contractor_group_with_audit(...)`.

Happy-path browser QA:

- Started the local web app on `http://localhost:3001` with `pnpm --filter @floorconnector/web dev -p 3001`.
- Opened `/super-admin/groups` with platform-admin auth and selected the QA organization plus proposed/high/trade-segment filters.
- Confirmed the eligible QA row rendered exactly one expandable manual-assignment form with the operator reason field, exact `ASSIGN GROUP MANUALLY` phrase field, submitted proposal fingerprint, and explicit no-entitlement/no-provisioning/no-pricing/no-permission/no-runtime copy.
- Submitted one eligible proposal with operator reason `Final regression QA: reviewed eligible proposal evidence and applying one manual segmentation assignment.`
- Verified exactly one current membership row was created:
  - membership `bef741ec-24bd-4317-81d6-9f25ecf8c8c4`
  - `assignment_source = targeting_preview`
  - target group `b0febf19-d481-4a88-8f64-836ea8a9a3d9`
  - target organization `865f87c3-376e-4d89-8d2c-ed4132264719`
- Verified exactly one `organization_assigned` audit event for the apply:
  - audit event `f51318bc-a8de-4e6c-9619-542644561c65`
  - `assignment_source = targeting_preview`
  - reason matched the operator reason above

Audit metadata verification:

- Confirmed the assignment audit metadata persisted safe proposal-review fields:
  - `assignmentContext = proposal_manual_review`
  - `proposalSource = exact_trade_match`
  - `proposalConfidence = high`
  - `proposalStatus = proposed`
  - `proposalReasonCode = exact_trade_match`
  - `recomputationStatus = eligible_for_manual_review`
  - `operatorReasonPresent = true`
  - `groupKey = qa-regression-eligible-20260508145400`
  - `groupType = trade_segment`
  - `groupStatus = active`
  - `blockedStateChecked = true`
  - bounded scalar `proposalFingerprint`
- Confirmed unsafe metadata such as raw DB errors, service-role keys, nested unsafe payloads, provider payloads, stack traces, and secret-like fields were not present in the stored assignment metadata.

Repeated apply / idempotency verification:

- Reloaded the same organization/group proposal view after the apply using already-assigned filters.
- Browser recomputation showed the QA group as already assigned and exposed:
  - `contractor-group-proposal-manual-assignment-form` count `0`
  - `contractor-group-proposal-manual-assignment-details` count `0`
  - `input[name="confirmationPhrase"]` count `0`
  - `Assign group manually` button count `0`
- Live counts after apply showed one current membership and one additional assignment audit event only; no duplicate membership was created.
- Focused server/action tests continued to cover the already-assigned readback path without calling the assignment helper.

Blocked-row browser QA:

- Verified blocked/read-only proposal rows for:
  - inactive group
  - low-confidence/not-applicable trade-segment row
  - future-plan group
  - future-entitlement group
  - archived trade-segment row from prior QA evidence
- For every blocked target, Browser DOM checks returned:
  - `contractor-group-proposal-manual-assignment-form` count `0`
  - `contractor-group-proposal-manual-assignment-details` count `0`
  - `input[name="confirmationPhrase"]` count `0`
  - `Assign group manually` button count `0`
  - blocked/read-only explanation text present
- Button/link inspection confirmed no actionable controls for Apply all, Auto assign, bulk apply, dismissal, provisioning, entitlement, pricing/package, contractor-permission, or runtime behavior.

Error-handling verification:

- Focused action tests passed for wrong confirmation phrase, missing reason, stale submitted proposal context, inactive/archived/future blocked states, low-confidence/unavailable states, already-assigned no-duplicate readback, metadata sanitizer allowlist behavior, and unexpected lower-level/RPC error masking.
- No raw SQL/RPC/provider detail was exposed through the tested action error boundary.

Before/apply/after counts:

- Before QA setup:
  - `contractor_groups`: 11
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 40
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- After deliberate QA setup and one eligible apply:
  - `contractor_groups`: 16
  - `contractor_group_memberships`: 1
  - `contractor_group_audit_events`: 46
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- After cleanup/removal/archive:
  - `contractor_groups`: 16
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 52
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- Count interpretation: current memberships returned to baseline after cleanup; contractor group count increased by five retained archived QA evidence rows; audit events increased only from audited QA setup, one proposal apply, audited membership removal, and audited group archives; template, catalog, and provisioning counts did not change.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 31 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a docs/source-of-truth consolidation pass for the Super Admin Platform Evolution contractor-group proposal manual assignment work. Confirm `docs/current-state.md`, `docs/workflows.md`, `docs/contractor-groups-plan.md`, and `docs/chat-handoff.md` consistently describe the implemented action, final regression evidence, no automation/provisioning/entitlement/runtime behavior, and remaining future boundaries. Do not change application code, migrations, RLS/grants, or product behavior."

## Phase 7C Proposal Manual Assignment Security/Posture Review

Phase 7C ran a security/posture review for contractor group proposal manual assignment and audit metadata only. This pass stayed inside platform-admin governance/readiness and did not add automation, bulk apply, proposal dismissal history, starter-pack provisioning, entitlement behavior, pricing/package behavior, contractor-permission behavior, runtime behavior, AI behavior, background jobs, schema changes, RLS/grant changes, or tenant-owned template/catalog writes.

Files changed in this pass:

- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply-core.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`
- `docs/chat-handoff.md`

Security/posture checks performed:

- Confirmed `applyContractorGroupProposalManualAssignmentAction(...)` requires `requirePlatformAdminUser("/super-admin/groups")` server-side before schema parsing, recomputation, or assignment.
- Confirmed the proposal write path remains server-only and calls `applyContractorGroupProposalManualAssignment(...)` with `getContractorGroupProposalManualApplyServerReadiness` plus `assignOrganizationToContractorGroupWithAuditMetadata`.
- Confirmed service-role usage is isolated behind `getSupabaseAdminClient()` in server-only modules; source/env-name scan found no `NEXT_PUBLIC_*` service-role key exposure.
- Confirmed UI source only renders the proposal manual assignment form for proposed, ready-for-review, high/medium-confidence, active, non-future groups with no runtime effect and no prior assignment.
- Confirmed no proposal-panel controls for Apply all, Auto assign, bulk apply, proposal dismissal, starter-pack provisioning, entitlement enablement, pricing/package changes, contractor permission grants, or runtime controls were added.

Migration/RPC/RLS verification against linked Supabase:

- Linked project migrations were aligned through `20260508174905_contractor_group_assignment_proposal_fingerprint_metadata`; no migration was applied.
- RPC privilege query confirmed contractor-group audit/write RPCs and metadata-capable assignment RPCs are not executable by `public`, `anon`, or `authenticated`, and are executable by `service_role`.
- Private schema usage query confirmed `private` schema USAGE is false for `public`, `anon`, and `authenticated`, and true for `service_role`.
- Function posture query confirmed security-definer assignment/write wrappers use `search_path=""`; the metadata sanitizer is not security definer and also uses `search_path=""`.
- RLS/table posture query confirmed `contractor_groups`, `contractor_group_memberships`, and `contractor_group_audit_events` have RLS enabled and forced.
- Table grant query returned no broad `public`, `anon`, or `authenticated` grants on those three tables.

Audit metadata and error handling verification:

- Live sanitizer query confirmed unsafe fields such as `rawDbError`, `serviceRoleKey`, nested payloads, and arrays are dropped, and `proposalFingerprint` is capped at 500 characters.
- Source review confirmed the RPC merges sanitized caller metadata first and DB-derived group/organization metadata second, so canonical DB group key/type/status and organization labels win over submitted hidden fields.
- Hardened the proposal action error boundary so intentional proposal validation/blocking errors remain visible, while unexpected lower-level dependency/RPC text is masked as `Unable to apply contractor group proposal. Recompute the proposal and try again.`
- Adjusted the core rejection order so explicit blocking issues, such as stale proposal context, are returned before generic readiness explanation.

Before/after counts:

- Before review:
  - `contractor_groups`: 11
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 40
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- After review:
  - `contractor_groups`: 11
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 40
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- Count interpretation: no memberships, audit events, templates, catalog items, provisioning runs, or provisioning run items changed during this security review.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 31 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Run a final narrow regression pass for contractor group proposal manual assignment after security hardening. Verify the eligible proposal happy path still creates exactly one membership and one audit event with sanitized metadata, repeated apply remains no-duplicate/already-assigned, and blocked-state rows still expose no form. Do not add automation, provisioning, entitlement, pricing/package, contractor-permission, runtime, AI, background-job, or schema/RLS/grant changes."

## Phase 7B Proposal Manual Assignment Blocked-State QA

Phase 7B ran a blocked-state browser/server QA pass for the proposal manual-assignment slice on `/super-admin/groups`. This pass was QA/hardening only. No proposal assignment was submitted, no membership was created, and no application code, schema, migration, RLS/grant, entitlement, provisioning, pricing/package, contractor-permission, runtime, automation, AI, background-job, template, catalog, invoice, contract, tax, payroll, or tenant-owned workflow behavior was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Linked Supabase project and deliberate QA setup:

- Linked project: `jcnoraopbwdhshcmplgb`.
- Platform admin actor used for audited QA setup/cleanup: `d4e22ae3-bbf2-4c56-b0fe-c87a4a331a76` (`platform@floorconnector.com`).
- Selected contractor organization: `865f87c3-376e-4d89-8d2c-ed4132264719` (`jfilamonte`, `tenant_status = trialing`, `primary_trade = Epoxy flooring`).
- Existing archived proposal QA group reused for archived-state coverage: `95d75193-9836-45e2-a52b-2d3cda404e8b` / `epoxy-flooring-qa-proposal-20260508`.
- Created four deliberate QA groups through `public.upsert_contractor_group_with_audit(...)`:
  - inactive trade-segment group `e56724d2-fae3-4d34-ab67-cb94d065b6cc` / `qa-blocked-inactive-20260508141941`
  - active non-matching trade-segment group `3b26e92b-1704-45a4-94a7-738e74052dde` / `qa-blocked-low-confidence-20260508141941`
  - active future-plan group `a92fe09c-a0db-42f2-9790-98185f2deac0` / `qa-blocked-future-plan-20260508141941`
  - active future-entitlement group `b0d0a67c-9a45-4768-b3d4-6218d69087ea` / `qa-blocked-future-entitlement-20260508141941`
- Archived those four deliberate QA groups after browser QA through `public.archive_contractor_group_with_audit(...)`.
- Confirmed the four deliberate QA groups had `0` memberships after cleanup.

Browser QA:

- Used the Browser plugin with the in-app browser after starting the web app correctly on `http://localhost:3001` via `pnpm --filter @floorconnector/web dev -p 3001`.
- Initial Browser attempt failed while the dev server had been started with the wrong `-- -p 3001` argument shape and exited; rerun used the corrected command above.
- Opened `/super-admin/groups` with platform-admin auth and filtered the proposal read model by selected organization/status/confidence/group type.
- Covered blocked states:
  - inactive group: visible read-only explanation included inactive/not-recommended/reactivated copy
  - archived group: visible read-only explanation included archived/history copy
  - low-confidence/not-applicable proposal: visible low/not-recommended copy for the non-matching trade-segment QA group
  - future-plan group: visible future-plan/planning-metadata copy
  - future-entitlement group: visible future-entitlement/planning-metadata copy
- For every blocked target, the Browser DOM checks returned:
  - `contractor-group-proposal-manual-assignment-form` count `0`
  - `contractor-group-proposal-manual-assignment-details` count `0`
  - `input[name="confirmationPhrase"]` count `0`
  - `Assign group manually` button count `0`
  - no forbidden proposal controls found for `Apply all`, `Auto assign`, `Bulk apply`, proposal dismissal, starter-pack provisioning, entitlement enablement, pricing/package change, or contractor-permission grant
  - relevant console warning/error count `0`

Server/action QA:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 56 tests.
- Focused coverage includes confirmation phrase required, reason required, stale recomputation blocked, inactive/archived/future-plan/future-entitlement blocked, low-confidence/unavailable blocked, already-assigned no-duplicate readback, audit metadata included/sanitized, and UI forbidden-control source checks.

Before/setup/after counts:

- Before QA setup:
  - `contractor_groups`: 7
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 32
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- After deliberate QA group setup:
  - `contractor_groups`: 11
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 36
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- After QA cleanup/archive:
  - `contractor_groups`: 11
  - `contractor_group_memberships`: 0
  - `contractor_group_audit_events`: 40
  - `document_templates`: 4
  - `catalog_items`: 9
  - `platform_starter_pack_provisioning_runs`: 4
  - `platform_starter_pack_provisioning_run_items`: 5
- Expected count interpretation: memberships did not increase; template/catalog/provisioning counts did not change; audit events increased only because deliberate QA group setup and cleanup/archive were audited; contractor group count increased by four retained archived QA rows.

Security and boundary verification:

- Browser QA used platform-admin auth and the existing server-rendered `/super-admin/groups` surface.
- No client/browser service-role exposure was added or needed.
- No schema, migration, RLS, or grant change was made.
- Blocked proposal rows remained read-only and did not expose the exact-phrase submit path.
- The existing server/action harness still proves blocked states do not call the assignment helper and already-assigned returns no-duplicate readback.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 56 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending warnings only.

Recommended next prompt:

- "Run a security/posture review for contractor group proposal manual assignment and audit metadata only. Verify platform-admin authorization, server-only service-role usage, RPC execute grants, RLS force settings, safe error messages, and no client/browser service-role exposure. Do not add automation, bulk apply, dismissal history, provisioning, entitlement, pricing/package, contractor-permission, runtime, or AI behavior."

## AI Integration Next Steps - Project Cue Work-Item Bridge

Project guidance cues now support optional manual bridge actions into the existing internal work-item creation flow. This remains deterministic guidance only: no external AI call, autonomous write, schema change, migration, duplicate task model, financial calculation change, readiness-rule change, invoice/payment mutation, contract-signature mutation, job mutation, schedule commitment, or field-note status mutation was added.

Files changed in this slice:

- `apps/web/lib/projects/cues.ts`
- `apps/web/lib/projects/cues.test.ts`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/work-items/work-item-create-form.tsx`
- `apps/web/lib/work-items/actions.ts`
- `apps/web/lib/work-items/data.ts`
- `apps/web/lib/work-items/prefill.ts`
- `apps/web/lib/work-items/prefill.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Project cue cards keep their primary canonical workflow links intact.
- Bridgeable project cues now show a secondary `Create work item` action that returns to Project Detail with `workItemCue=...#work-items`.
- The Project Detail work-item panel reuses the existing `WorkItemCreateForm`, `createWorkItemAction`, and `work_items` source validation.
- Project guidance prefill supports approved estimate missing contract, unpaid deposit invoice, open blocker/issue field notes, signed ready project with no job, and ready project with unscheduled jobs.
- Prefill preserves source-aware context: estimate cues source-lock to estimates, deposit cues source-lock to invoices, signed-contract cues source-lock to contracts, single unscheduled-job cues source-lock to jobs, and field-note/multi-job cues source-lock to the project with related field-note/job ids in metadata.
- Dashboard project cues now link back to the project cue panel while preserving the original workflow link as the secondary/context action.

Boundary preserved:

- Work items are created only after the contractor reviews and submits the existing form.
- Completing, dismissing, or creating a project-linked work item does not mutate project readiness, invoice/payment state, contract signature state, job state, schedule placement, field-note status, portal visibility, notifications, automation runs, or provider sends.
- No `/work-items` manager route or separate AI/task workspace was added.

Validation:

- `pnpm exec tsx --test apps/web/lib/projects/cues.test.ts apps/web/lib/work-items/work-items.test.ts apps/web/lib/work-items/prefill.test.ts` passed: 15 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Fresh local browser smoke passed on temporary `localhost:3001`: dashboard rendered `Suggested project actions`, Project Detail rendered `Suggested project actions` and `Internal work items`, and a project cue bridge opened the prefilled work-item form with `workItemCue=...#work-items` without submitting the form.

Recommended next slice:

- Completed in later slices: the project cue bridge spec now covers all bridge cue scenarios, dashboard preview routing, and accessibility/readability guardrails. Pause further AI cue feature expansion until a new product need is selected.

## Phase 7A Proposal Manual Assignment Live Slice

Phase 7A completed the first real proposal-to-manual-assignment action slice for contractor groups. This remains a human-confirmed platform-admin workflow only: proposal -> explicit operator confirmation -> existing audited manual assignment path. No automation, AI assignment, entitlement behavior, starter-pack provisioning, pricing/package behavior, contractor permission behavior, tenant-default mutation, runtime behavior, background job, proposal dismissal/history state machine, or bulk apply was added.

Files changed:

- `apps/web/lib/platform-admin/contractor-group-proposal-apply-core.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`
- `apps/web/lib/platform-admin/contractor-group-audit-events-core.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/components/contractor-group-manager-readiness-display.test.ts`
- `supabase/migrations/20260508174905_contractor_group_assignment_proposal_fingerprint_metadata.sql`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Implemented behavior:

- `applyContractorGroupProposalManualAssignmentAction` remains platform-admin-only through `/super-admin/groups`.
- The action requires organization id, contractor group id, submitted proposal fingerprint/context, operator reason, and exact `ASSIGN GROUP MANUALLY` confirmation.
- The server recomputes proposal readiness from current data before any write and only applies proposed high/medium-confidence rows with `eligible_for_manual_review`, active non-future groups, reviewable organization status, no current membership, no runtime/provisioning effect, and matching submitted fingerprint/context.
- Already-assigned recomputation returns a no-duplicate readback instead of calling the assignment helper.
- Successful assignment calls the existing metadata-capable audited membership RPC helper exactly once with `assignment_source = targeting_preview`.
- Audit metadata now includes safe proposal-review fields plus a bounded scalar `proposalFingerprint`; the sanitizer still drops unrecognized fields, nested payloads, raw errors, stack traces, and secret-like data.
- The eligible-row UI copy now explicitly says one membership plus one audit event only, with no entitlement, provisioning, pricing/package, contractor permission, starter-pack, or runtime behavior.

Live QA on linked Supabase project `jcnoraopbwdhshcmplgb`:

- Applied migration `20260508174905_contractor_group_assignment_proposal_fingerprint_metadata.sql`.
- Initial linked counts before deliberate QA setup: `contractor_groups` 6, `contractor_group_memberships` 0, `contractor_group_audit_events` 27, `document_templates` 4, `catalog_items` 9, `platform_starter_pack_provisioning_runs` 4, `platform_starter_pack_provisioning_run_items` 5.
- Because all existing groups were archived, created and then corrected one deliberate active QA trade-segment group through existing audited group-management RPCs; apply-before counts after setup were `contractor_groups` 7, `contractor_group_memberships` 0, `contractor_group_audit_events` 29, `document_templates` 4, `catalog_items` 9, `platform_starter_pack_provisioning_runs` 4, `platform_starter_pack_provisioning_run_items` 5.
- Browser QA used `playwright/.auth/platform-admin.json` against `http://localhost:3001/super-admin/groups` and submitted one eligible high-confidence proposal for organization `865f87c3-376e-4d89-8d2c-ed4132264719` into contractor group `95d75193-9836-45e2-a52b-2d3cda404e8b`.
- After submit, counts were `contractor_group_memberships` 1 and `contractor_group_audit_events` 30; template/catalog/provisioning counts remained unchanged.
- Verified the created membership id `8b02b6f6-7c4a-4795-bdef-1d3f88a25b8b` used `assignment_source = targeting_preview` and the operator reason.
- Verified one `organization_assigned` audit event id `cb7fc7d1-dc2f-4810-836e-97955ad93ac2` with metadata including `assignmentContext = proposal_manual_review`, `proposalSource = exact_trade_match`, `proposalConfidence = high`, `proposalStatus = proposed`, `proposalReasonCode = exact_trade_match`, `recomputationStatus = eligible_for_manual_review`, `operatorReasonPresent = true`, group key/type/status, `blockedStateChecked = true`, and the proposal fingerprint.
- Reloading the same filtered proposal view showed zero eligible manual-assignment forms and already-assigned state for the selected organization/group, so no duplicate write path remained visible.
- Cleaned up by removing the deliberate membership through `remove_contractor_group_membership_with_audit` and archiving the deliberate QA group through `archive_contractor_group_with_audit`.
- Final linked counts after cleanup/archive: `contractor_groups` 7, `contractor_group_memberships` 0, `contractor_group_audit_events` 32, `document_templates` 4, `catalog_items` 9, `platform_starter_pack_provisioning_runs` 4, `platform_starter_pack_provisioning_run_items` 5.
- Supabase CLI temporarily hit pooler auth/circuit-breaker throttling when queries ran in parallel; sequential reruns produced the evidence above.

Security verification:

- `pnpm exec supabase migration list --linked` shows local/remote aligned through `20260508174905`.
- `private.sanitize_contractor_group_assignment_audit_metadata(jsonb)` and `public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb)` execute privileges are `false` for `public`, `anon`, and `authenticated`, and `true` for `service_role`.
- `contractor_groups`, `contractor_group_memberships`, and `contractor_group_audit_events` all have RLS enabled and forced.
- `rg -n "service_role|SERVICE_ROLE|SUPABASE_SERVICE|service-role" apps/web --glob "!**/.next/**"` found only migration-security test assertions; no browser/client service-role exposure was found.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 56 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts` passed: 25 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts` passed: 72 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending warnings only.

Recommended next prompt:

- "Run a blocked-state browser QA pass for proposal manual assignment using deliberate inactive, archived, low-confidence, future-plan, and future-entitlement QA rows only. Do not add automation, bulk apply, dismissal history, provisioning, entitlement, pricing/package, contractor-permission, or runtime behavior."

## Phase 6Z-QA Metadata RPC Live Verification Rerun

Phase 6Z-QA was rerun against the linked Supabase project `jcnoraopbwdhshcmplgb` after the proposal UI implementation section above. This was a verification-only pass. No proposal UI, button, form, server action, RPC, membership write, proposal decision write, entitlement behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission behavior, tenant-owned template/catalog write, financial/tax/payroll behavior, invoice/contract behavior, user-preference behavior, or background job was added in this pass. The existing current-branch single-proposal UI/server-action foundation was left unchanged and was not invoked.

Files changed in this rerun:

- `docs/chat-handoff.md`

Migration/security verification:

- `pnpm exec supabase migration list --linked` confirmed `20260508041324_contractor_group_assignment_audit_metadata_rpc.sql` is applied remotely and local/remote migration history is aligned.
- `private.sanitize_contractor_group_assignment_audit_metadata(jsonb)` exists.
- `private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb default '{}'::jsonb)` exists and is `security definer`.
- `public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb default '{}'::jsonb)` exists and is `security definer` as the service-role RPC wrapper for server-side Supabase RPC calls.
- Execute privilege verification returned `false` for `public`, `anon`, and `authenticated` on the private sanitizer, private metadata assignment function, and public metadata assignment wrapper.
- Execute privilege verification returned `true` for `service_role` on the private sanitizer, private metadata assignment function, and public metadata assignment wrapper.
- `contractor_groups`, `contractor_group_memberships`, and `contractor_group_audit_events` all have RLS enabled and forced.
- Direct broad table grants for `public`, `anon`, and `authenticated` on the three contractor group tables returned no rows.
- `rg -n "service_role|SERVICE_ROLE|SUPABASE_SERVICE|service-role" apps/web --glob "!**/.next/**"` found only migration-security test assertions; no browser/client service-role exposure was found.

Live invoke-and-cleanup proof:

- Skipped intentionally again. The linked project still has six contractor groups and all six are archived: `phase-6j-debug-1778192662589`, `phase-6i-playwright-qa-1778185844360`, `phase-6i-audit-qa-1778185236513`, `phase-6h-audit-qa-1778183306708`, `phase-6d-qa-1778179074785`, and `phase-6b-qa-1778176931161`.
- The metadata assignment RPC blocks archived groups, and no existing active QA contractor group was available.
- This pass did not create, unarchive, or assign a group just for QA because the prompt requested live invoke only when safe with existing QA records.
- The linked CLI briefly hit Supabase pooler auth circuit-breaker errors when multiple read-only queries were attempted too close together; rerunning sequentially produced the migration, function, grant, and RLS evidence above.

Before/after counts:

- `catalog_items`: 9 before, 9 after.
- `contractor_group_audit_events`: 27 before, 27 after.
- `contractor_group_memberships`: 0 before, 0 after.
- `contractor_groups`: 6 before, 6 after.
- `document_templates`: 4 before, 4 after.
- `platform_starter_pack_provisioning_run_items`: 5 before, 5 after.
- `platform_starter_pack_provisioning_runs`: 4 before, 4 after.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending warnings only.

Recommended next prompt:

- "Run proposal manual-assignment UI QA without live submit first, then create a dedicated active QA contractor group through the audited group-management flow only if you want a controlled live apply/invoke proof."

## Phase 6Z UI Implementation - Single Proposal Manual Assignment Form

Phase 6Z UI implementation exposed the existing audited contractor group proposal apply server action on `/super-admin/groups` as a single-row, human-confirmed form for eligible proposal rows only. This pass did not perform a live apply.

Behavior added:

- Eligible proposal rows render one expandable manual assignment confirmation form.
- UI-side eligibility is convenience only: proposed status, `ready_for_review`, high/medium confidence, no existing assignment, `runtimeEffect: "none"`, active group status, and non-future group type.
- The form submits to `applyContractorGroupProposalManualAssignmentAction`.
- Hidden fields include organization id, contractor group id, and the complete submitted proposal fingerprint/context expected by the server action for stale-detection: proposal id, organization id, contractor group id/key/type/status, proposal status, confidence, source, reason code, and manual-review readiness.
- Visible required fields are operator reason and exact `ASSIGN GROUP MANUALLY` confirmation.
- Visible copy states the write scope is one contractor group membership plus one audit event only, that no provisioning/entitlement/pricing/permission/starter-pack/runtime behavior changes, that the server recomputes readiness and may reject stale proposals, and that starter-pack impact remains read-only targeting context.

Files changed:

- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/components/contractor-group-manager-readiness-display.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Intentionally not implemented:

- No bulk apply, Apply all, Auto assign, proposal dismissal/approval state, starter-pack provisioning, entitlement/runtime behavior, pricing/permission/feature behavior, document-template/catalog mutation, schema/migration/RLS/grant change, new server write path, or live apply QA.

Validation:

- `pnpm exec tsx --test apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 5 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 50 tests.
- `pnpm typecheck` passed.

Next QA step:

- Run `/super-admin/groups` browser QA without live apply first, verifying eligible-row form rendering, forbidden controls remain absent, and counts stay stable. A separate controlled real-apply QA should happen only after explicit approval.

For stronger implementation control on new tasks, also use:

- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md)
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md)
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md)
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)

## Phase 6Z-QA Metadata RPC Live Verification

Phase 6Z-QA verified the metadata-capable contractor group assignment audit RPC on the linked Supabase project. This was a verification-only pass. No proposal-to-assignment UI, button, form, new exposed proposal control, proposal decision write, entitlement behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission behavior, tenant-owned template/catalog write, financial/tax/payroll behavior, invoice/contract behavior, user-preference behavior, or background job was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Migration verification:

- `pnpm exec supabase migration list --linked` confirmed `20260508041324_contractor_group_assignment_audit_metadata_rpc.sql` is applied remotely and local/remote migration history is aligned.
- No unrelated migration was applied.

Function/security verification:

- `private.sanitize_contractor_group_assignment_audit_metadata(jsonb)` exists.
- `private.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb default '{}'::jsonb)` exists and is `security definer`.
- `public.assign_contractor_group_membership_with_audit_metadata(uuid, uuid, text, text, uuid, jsonb default '{}'::jsonb)` exists and is `security definer` as the service-role RPC wrapper for server-side Supabase RPC calls.
- Execute privilege verification returned `false` for `public`, `anon`, and `authenticated` on the private sanitizer, private metadata assignment function, and public metadata assignment wrapper.
- Execute privilege verification returned `true` for `service_role` on the private sanitizer, private metadata assignment function, and public metadata assignment wrapper.
- `contractor_groups`, `contractor_group_memberships`, and `contractor_group_audit_events` all have RLS enabled and forced.
- Direct broad table grants for `public`, `anon`, and `authenticated` on the three contractor group tables returned no rows.
- `rg -n "service_role|SERVICE_ROLE|SUPABASE_SERVICE|service-role" apps/web --glob "!**/.next/**"` found only migration-security test assertions; no browser/client service-role exposure was found.

Live invoke-and-cleanup proof:

- Skipped intentionally. The linked project currently has six contractor groups and all six are archived: `phase-6j-debug-1778192662589`, `phase-6i-playwright-qa-1778185844360`, `phase-6i-audit-qa-1778185236513`, `phase-6h-audit-qa-1778183306708`, `phase-6d-qa-1778179074785`, and `phase-6b-qa-1778176931161`.
- The metadata assignment RPC correctly blocks archived groups, and no existing active QA contractor group was available.
- This pass did not create or unarchive a group just for QA because the prompt requested live invoke only when safe with existing QA records.

Before/after counts:

- `catalog_items`: 9 before, 9 after.
- `contractor_group_audit_events`: 27 before, 27 after.
- `contractor_group_memberships`: 0 before, 0 after.
- `contractor_groups`: 6 before, 6 after.
- `document_templates`: 4 before, 4 after.
- `platform_starter_pack_provisioning_run_items`: 5 before, 5 after.
- `platform_starter_pack_provisioning_runs`: 4 before, 4 after.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending warnings only.

Recommended next prompt:

- "Implement Phase 7A as proposal-to-manual-assignment UI planning/readiness only, or first create a dedicated active QA contractor group through the audited group-management flow and rerun the Phase 6Z metadata RPC invoke-and-cleanup proof against that QA group."

## Phase 6Y Proposal Manual Assignment Server Action QA

Phase 6Y completed QA verification for the single-proposal, human-confirmed, audited contractor group proposal apply server-action foundation. This QA pass did not invoke a live apply action and did not add UI controls, features, schema, migrations, RLS/grant changes, provisioning, entitlements, runtime behavior, document-template/catalog mutations, or automation.

Docs read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/README.md`

Files inspected:

- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply-core.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`

Server-action foundation verified:

- Source inspection confirmed `applyContractorGroupProposalManualAssignmentAction` is present in `actions.ts`, is gated by `requirePlatformAdminUser("/super-admin/groups")`, parses `contractorGroupProposalManualApplyInputSchema`, calls `getContractorGroupProposalManualApplyServerReadiness`, and only passes through `assignOrganizationToContractorGroupWithAuditMetadata` after the proposal apply core accepts the request.
- Source inspection confirmed the proposal apply action is not imported or rendered by `contractor-group-manager.tsx` or `/super-admin/groups`.
- Focused tests confirmed eligible high-confidence and medium-confidence proposals call the metadata assignment dependency once; stale fingerprint/context, existing membership, inactive/archived/future groups, low/unavailable rows, bad phrase, empty reason, and incomplete submitted proposal context reject before assignment.
- Focused tests confirmed proposal audit metadata remains inside the current sanitized allowlist and does not add runtime/provisioning metadata fields.
- Platform-admin gating is source-verified through the server action; the current focused test harness covers the testable apply core rather than invoking the Next redirecting action directly.

Route/page QA:

- Authenticated platform-admin Playwright opened `/super-admin/groups`.
- The page rendered assignment proposals, read-only readiness context, `No runtime effect` copy, and future apply preview.
- The existing `Apply filters` button remained visible as a filter control.
- No proposal apply form was present.
- No forbidden proposal mutation controls were visible: no Apply all, Auto assign, Apply proposal, Approve, Dismiss, bulk action, provisioning, entitlement, or runtime buttons.
- Console/page-error capture was clean during the route check.

Before/after read-only counts matched:

- `contractor_groups`: 6 -> 6
- `contractor_group_memberships`: 0 -> 0
- `contractor_group_audit_events`: 27 -> 27
- `document_templates`: 4 -> 4
- `catalog_items`: 9 -> 9
- `platform_starter_pack_provisioning_runs`: 4 -> 4
- `platform_starter_pack_provisioning_run_items`: 5 -> 5

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts` passed: 8 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 42 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts` passed: 20 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-targeting.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts` passed: 17 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF/CRLF normalization warnings only.

Files changed in this QA pass:

- `docs/chat-handoff.md`

Defects found:

- None.

Recommended next prompt:

- "Create a focused implementation plan for the single-row, human-confirmed `/super-admin/groups` UI action that invokes the audited proposal apply server action. Keep it one proposal at a time, phrase-gated, reason-required, platform-admin only, no bulk apply, no auto-assign, no provisioning, no entitlement/runtime behavior, and no schema/RLS changes."

## Phase 6X Proposal Manual Assignment Server Action Foundation

Phase 6X added the server-action foundation for applying exactly one contractor group assignment proposal after human confirmation. This pass adds no proposal apply button, no form on `/super-admin/groups`, no bulk apply, no auto-assignment, no proposal approval/dismissal state, no schema/migration/RLS/grant change, no starter-pack provisioning, no entitlement/runtime behavior, and no document-template/catalog mutation.

Behavior added:

- `applyContractorGroupProposalManualAssignmentAction` is platform-admin gated through `/super-admin/groups`.
- The action accepts one organization id, one contractor group id, submitted proposal fingerprint JSON, operator reason, and confirmation phrase.
- It requires exact confirmation phrase `ASSIGN GROUP MANUALLY`.
- It requires a non-empty operator reason.
- It recomputes proposal readiness server-side with `getContractorGroupProposalManualApplyServerReadiness`; submitted fingerprint data is only stale-context detection, not trusted truth.
- It allows only eligible, high/medium-confidence, `proposed`, `ready_for_review` rows on active non-future groups with no existing membership.
- It rejects stale context, existing membership/already-assigned rows, inactive/archived groups, future plan/entitlement groups, low-confidence rows, unavailable/missing-metadata rows, bad confirmation phrase, and empty reason before calling the assignment dependency.
- It calls `assignOrganizationToContractorGroupWithAuditMetadata` only after all checks pass, using `assignment_source = targeting_preview`.
- It writes only through the existing metadata-capable audited RPC path when invoked, producing the intended contractor group membership plus assignment audit event.
- Audit metadata is limited to the existing sanitizer allowlist: `assignmentContext`, proposal source/confidence/status/reason code, recomputation status, operator reason presence, organization label, group key/type/status, and blocked-state checked.
- Runtime effect and provisioning effect remain `none`; starter-pack impact remains read-only targeting context only.

Files changed in this pass:

- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply-core.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts` passed: 8 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 42 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts` passed: 20 tests.
- `pnpm typecheck` passed after aligning the new test fixture with current readiness types.
- `pnpm lint` passed after replacing async test stubs with promise-returning stubs.

Not implemented:

- No proposal apply UI control, Apply all, Auto assign, bulk apply, proposal dismissal/approval state, starter-pack provisioning, entitlement/runtime behavior, pricing/permission/feature behavior, document-template/catalog mutation, schema/migration/RLS/grant change, or automation was added.

Recommended next prompt:

- "Run Phase 6X server-action QA/read-only verification. Verify focused tests, inspect the server action wiring, confirm `/super-admin/groups` still has no proposal mutation controls, capture before/after counts for memberships/audit/provisioning/template/catalog tables without invoking the action, and update only `docs/chat-handoff.md` if QA passes."

## Phase 6Z Proposal Assignment Audit Metadata RPC Extension

Phase 6Z added metadata capacity to the transaction-aware contractor group manual assignment audit path. This pass adds optional sanitized assignment audit metadata support for future proposal-to-manual-assignment evidence, while preserving the existing manual assignment RPC/action behavior. It does not add the proposal-to-assignment server action, UI button, form, membership write from proposals, proposal decision write, entitlement behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission behavior, tenant-owned template/catalog writes, tax/payroll/financial behavior, invoice/contract behavior, user-preference behavior, or background jobs.

Files changed in this pass:

- `supabase/migrations/20260508041324_contractor_group_assignment_audit_metadata_rpc.sql`
- `apps/web/lib/platform-admin/contractor-group-audit-events-core.ts`
- `apps/web/lib/platform-admin/contractor-group-audit-events.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`
- `docs/current-state.md`
- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Migration/RPC summary:

- Added `private.sanitize_contractor_group_assignment_audit_metadata(jsonb)`.
- Added `private.assign_contractor_group_membership_with_audit_metadata(...)`.
- Added `public.assign_contractor_group_membership_with_audit_metadata(...)` as the service-role RPC wrapper for Supabase server-side calls.
- Existing `assign_contractor_group_membership_with_audit` behavior remains unchanged for normal manual assignment.
- The new metadata wrapper still locks the target group and membership row, validates assignment source and organization, upserts membership, and inserts the audit event in the same transaction.

Metadata support:

- Optional allowlisted fields include `assignmentContext`, `proposalSource`, `proposalConfidence`, `proposalStatus`, `proposalReasonCode`, `recomputationStatus`, `operatorReasonPresent`, `organizationLabel`, `groupKey`, `groupType`, `groupStatus`, and `blockedStateChecked`.
- The sanitizer drops unrecognized fields, invalid enum values, non-boolean booleans, blank strings, raw nested objects, and secret-looking arbitrary keys because only allowlisted keys are emitted.
- Canonical group and organization labels/statuses from the database still win inside the RPC metadata payload.

Security posture:

- New private and public RPC functions use locked-down `search_path = ''`.
- Execute is revoked from `public`, `anon`, and `authenticated`.
- Execute is granted only to `service_role`.
- No service-role key is exposed to browser/client code.
- No table shape, RLS, or broad grant change was added.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending warnings only.
- Validation initially surfaced stale type/lint drift in existing proposal manual-assignment code (`apps/web/lib/platform-admin/actions.ts` and `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`). The cleanup was limited to typing parsed JSON as `unknown`/record and aligning test fixtures with current readiness shapes; no proposal UI, server action exposure, membership write behavior, or runtime behavior was added by this pass.

Manual/live QA:

- `pnpm exec supabase migration list --linked` initially showed all previous migrations applied and `20260508041324` pending locally only.
- `pnpm exec supabase db push --linked --dry-run` showed exactly one pending migration: `20260508041324_contractor_group_assignment_audit_metadata_rpc.sql`.
- `pnpm exec supabase db push --linked --yes` applied `20260508041324_contractor_group_assignment_audit_metadata_rpc.sql` to the linked Supabase project.
- A follow-up `pnpm exec supabase migration list --linked` confirmed local and remote both include `20260508041324`.
- Read-only function grant verification confirmed `private.assign_contractor_group_membership_with_audit_metadata`, `private.sanitize_contractor_group_assignment_audit_metadata`, and `public.assign_contractor_group_membership_with_audit_metadata` are not executable by `public`, `anon`, or `authenticated`, and are executable by `service_role`.
- No membership-writing QA call was invoked, so no contractor group membership, audit event, tenant-owned template/catalog, or provisioning counts were changed by live QA.

Recommended next prompt:

- "Implement Phase 7A as the first narrow proposal-to-manual-assignment server-action design-to-implementation plan only: reuse the existing audited assignment path plus Phase 6Z metadata helper, require server-side recomputation and operator reason, and still do not add UI controls until the action plan is approved."

## Phase 6W Proposal Manual-Apply Server Readiness QA

Phase 6W completed QA verification for the no-write contractor group proposal manual-apply server-readiness layer. The pass inspected the Phase 6V source/read model, ran focused tests, verified `/super-admin/groups` in an authenticated platform-admin Playwright session, and confirmed read-only Supabase count snapshots stayed unchanged before and after route QA.

Docs read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/README.md`

Files inspected:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`

Readiness behavior verified:

- Manual apply server-readiness tests cover high/medium eligible proposals, low-confidence blocking, stale submitted context blocking, existing membership already-assigned readback, archived/inactive blocking, future plan/entitlement blocking, missing metadata/unavailable blocking, starter-pack preview as read-only/non-provisioning, and no mutation of membership/audit/provisioning inputs.
- The readiness utility continues to return `actionAvailable: false`, `runtimeEffect: "none"`, provisioning effect `none`, and required confirmation phrase `ASSIGN GROUP MANUALLY`.
- `/super-admin/groups` rendered assignment proposals, readiness display, reason/evidence/caveat/future apply preview context, no-runtime-effect copy, starter-pack context, and manual review checklist copy.
- Proposal filters rendered and submitted URL state for organization, status, confidence, and group type.
- No forbidden mutation controls were visible: no Apply all, Auto assign, Approve, Dismiss, bulk action, entitlement, provisioning, or runtime buttons.

Before/after read-only counts matched:

- `contractor_groups`: 6 -> 6
- `contractor_group_memberships`: 0 -> 0
- `contractor_group_audit_events`: 27 -> 27
- `document_templates`: 4 -> 4
- `catalog_items`: 9 -> 9
- `platform_starter_pack_provisioning_runs`: 4 -> 4
- `platform_starter_pack_provisioning_run_items`: 5 -> 5

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 42 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-targeting.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts` passed: 17 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF/CRLF normalization warnings only.

Files changed in this QA pass:

- `docs/chat-handoff.md`

Not implemented:

- No assignment action, membership write, audit write, apply/bulk/auto-assign UI control, starter-pack provisioning behavior, entitlement behavior, runtime behavior, schema/migration/RLS/grant change, or automation was added.

Recommended next prompt:

- "Plan or implement the smallest future single-proposal human-confirmed audited apply action. Keep it one proposal at a time, server-recomputed, confirmation-phrase gated, audit-safe, dedupe-safe, no runtime effect, no starter-pack provisioning, and no bulk apply."

## Phase 6Y Proposal-To-Manual-Assignment Implementation Planning QA

Phase 6Y verified the Phase 6X final readiness section and inspected the audited manual contractor group assignment path as planning context. That planning pass has since been superseded by the implemented proposal manual-assignment action documented in Phase 7A through Phase 7E above; keep this section as historical context only.

Feasibility verdict:

- Ready with caveats for a future narrow human-confirmed server action wrapper.
- The existing audited assignment path can be reused for the final membership write: `assignContractorGroupMembershipAction` -> `assignOrganizationToContractorGroup` -> `assign_contractor_group_membership_with_audit`.
- The future wrapper must short-circuit existing memberships before calling the RPC, because the current RPC upserts the membership and appends an audit event rather than acting as a no-op/readback helper.
- The future wrapper must block inactive groups before the RPC, because the current RPC blocks archived groups but not inactive groups.
- A new RPC is not needed for a notes-only first version, but structured proposal metadata such as proposal source, confidence, reason code, and recomputation result would require a small transaction-aware RPC extension before enabling the action.

Audited assignment contract inspected:

- `assignContractorGroupMembershipAction` requires `requirePlatformAdminUser("/super-admin/groups")`.
- `contractorGroupMembershipInputSchema` validates group id, organization id, assignment source, and notes.
- `assignOrganizationToContractorGroup` uses the server-only Supabase admin client and calls `assign_contractor_group_membership_with_audit`.
- The RPC locks the target group and any existing membership row, validates assignment source and organization, upserts membership, and writes `contractor_group_audit_events` in the same transaction.
- The migration revokes execute from `public`, `anon`, and `authenticated` and grants execute to `service_role`.

Files changed in this pass:

- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF/CRLF normalization warnings only.

Not implemented:

- No assignment server action, RPC, membership write, proposal decision write, UI mutation control, migration, schema/RLS/grant change, assignment automation, entitlement behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, tax/payroll/financial behavior, invoice/contract behavior, user-preference behavior, or background job was added.

Recommended next prompt:

- "Implement Phase 6Z as proposal-to-manual-assignment final QA/read-only verification. Verify the Phase 6Y checklist, run validation, inspect `/super-admin/groups` for no proposal mutation controls, and decide whether the next approved phase should be a notes-only first action or a tiny transaction-aware RPC metadata extension before the action."

## Phase 6V Proposal Manual-Apply Server Readiness

Phase 6V added a no-write contractor group proposal manual-apply server-readiness utility. The helper recomputes one target organization/group proposal from current server-loaded organizations, contractor groups, memberships, starter-pack references, and recent audit context, then returns eligibility, readiness status, reason code, operator explanation, required confirmation phrase, future write preview, read-only starter-pack impact preview, audit preview metadata, and blocker/warning issues. It keeps `actionAvailable: false`, `runtimeEffect: "none"`, and provisioning effect `none`.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior added:

- Eligible only for recomputed high/medium confidence `proposed` rows on active non-future contractor groups with no existing membership.
- Blocks stale submitted proposal fingerprints, existing memberships, archived/inactive groups, future plan/entitlement groups, unavailable/missing-metadata rows, not-applicable rows, and low-confidence proposals.
- Existing membership returns already-assigned readiness with no write intent.
- Starter-pack impact remains read-only targeting context only and never provisions.
- The data-layer wrapper only reads current platform-admin data and does not call membership/audit/provisioning RPCs.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 42 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-targeting.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts` passed: 17 tests.
- Full validation should still run before handoff completion: `pnpm typecheck`, `pnpm lint`, and `git diff --check`.

Not implemented:

- No apply action, UI mutation control, membership write, audit write, schema/migration/RLS/grant change, starter-pack provisioning, entitlement behavior, automation, or runtime behavior was added.

## Phase 6X Proposal-To-Manual-Assignment Final Readiness Review

Phase 6X completed the final design-review checkpoint before any real proposal-to-manual-assignment write. `docs/contractor-groups-plan.md` now contains `Proposal-To-Manual-Assignment Final Readiness Review` with a readiness verdict, caveats, reusable helpers, future action input contract, server-side validation sequence, audit metadata shape, idempotency behavior, safe error handling, security checklist, QA checklist, and UI/operator copy requirements.

Final readiness verdict:

- Ready with caveats for a narrow future human-confirmed server action wrapper around the existing audited manual assignment path.
- The existing `assignContractorGroupMembershipAction` -> `assignOrganizationToContractorGroup` -> `assign_contractor_group_membership_with_audit` path can be reused for the final membership write and `organization_assigned` audit event after the future action recomputes proposal eligibility server-side.
- A new membership-writing RPC is not needed for the first narrow implementation unless proposal-specific audit metadata cannot be captured atomically through the existing audited assignment path.
- Bulk apply, auto-assignment, proposal dismissal/history, entitlement behavior, starter-pack auto-provisioning, pricing/package behavior, contractor permission changes, and runtime behavior remain out of scope and blocked.

Design decisions captured:

- Future confirmation phrase should be `ASSIGN GROUP MANUALLY`.
- Future operator reason/notes should be required.
- High/medium confidence `proposed` rows may be eligible only after server-side recomputation.
- Low-confidence, unavailable, not-applicable, archived, inactive, future-plan, and future-entitlement states remain blocked.
- Existing membership returns already-assigned/readback and must not duplicate membership.
- Group or organization drift between render and submit must force server-side recomputation and block stale mismatches.

Files changed in this pass:

- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF/CRLF normalization warnings only.

Recommended next prompt:

- "Implement Phase 6Y as proposal-to-manual-assignment implementation planning QA only. Verify the Phase 6X final readiness section, inspect the existing audited assignment RPC/action contract, and produce an implementation checklist for the first narrow server action without adding the action, RPC, form, button, membership write, entitlement behavior, provisioning behavior, or runtime behavior."

## Phase 6W Proposal-To-Manual-Assignment Readiness QA

Phase 6W completed read-only operator QA for the contractor group proposal-to-manual-assignment readiness foundation. A small copy defect was found and fixed: the visible manual-review checklist already said a future action requires manual reason and audited assignment, but did not explicitly say the proposal would be recomputed server-side. The copy now says future action would require manual reason, server-side proposal recomputation, and audited assignment, and remains clearly not implemented. No assignment action, RPC, form, input, disabled fake button, membership write, proposal decision write, migration, schema/RLS/grant change, entitlement behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, tax/payroll/financial behavior, invoice/contract behavior, user-preference behavior, or background job was added.

Files changed in this pass:

- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/components/contractor-group-manager-readiness-display.test.ts`
- `docs/chat-handoff.md`

Browser/Playwright QA:

- Browser plugin runtime was not available as a callable tool in this session, so authenticated Playwright was used with `playwright/.auth/platform-admin.json` against `http://localhost:3000/super-admin/groups`.
- Confirmed `Assignment proposals` rendered.
- Confirmed `Manual review checklist` rendered on 8 visible proposal rows.
- Confirmed future readiness copy rendered 8 times for manual reason, server-side proposal recomputation, audited assignment, and `Not implemented yet`.
- Confirmed `No runtime effect` rendered.
- Confirmed proposal rows still showed `Assignment applied: no` and `Action available: no`.
- Confirmed no forbidden proposal controls were visible for `Apply all`, `Auto assign`, `Assign from proposal`, `Approve`, `Dismiss`, or `Bulk apply`.
- Screenshot evidence was written to `%TEMP%\phase-6w-super-admin-groups-readiness.png`.
- Caveat: Playwright captured the same existing React hydration mismatch warning family involving generated input `style={{caret-color:"transparent"}}` differences. No `ChunkLoadError`, compile overlay, page error, or requested readiness/proposal QA failure appeared.

Before/after read-only count checks matched:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/components/contractor-group-manager-readiness-display.test.ts` passed: 34 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF/CRLF normalization warnings only.

Recommended next prompt:

- "Implement Phase 6X as proposal-to-manual-assignment server-action planning/final readiness only. Do not implement the action yet; verify the exact transaction/RPC path, stale recomputation contract, audit metadata contract, and QA gates before approving any real membership write."

## Phase 6U Contractor Group Assignment Proposal Readiness Display QA

Phase 6U completed read-only QA verification for the `/super-admin/groups` manual-review readiness display. Authenticated Playwright platform-admin QA loaded the route successfully, submitted proposal filters, observed proposal readiness context, and confirmed no proposal apply, bulk, approval, dismissal, provisioning, entitlement, or runtime mutation controls were visible. This pass did not add assignment actions, membership writes, audit writes, starter-pack provisioning, entitlement/runtime behavior, schema changes, migrations, RLS/grant changes, or automation.

Files changed in this QA pass:

- `docs/chat-handoff.md`

Browser/Playwright QA:

- Authenticated Playwright with `playwright/.auth/platform-admin.json` loaded `http://localhost:3000/super-admin/groups`.
- Confirmed `Assignment proposals` rendered.
- Confirmed proposal filters rendered and submitted through URL state for organization, proposal status, proposal confidence, and proposal group type.
- Confirmed readiness display rendered on visible proposal rows, including readiness label, reason code, explanation/context, evidence items, caveats with severity, future apply preview, `No runtime effect`, and manual review checklist.
- Confirmed read-only copy states no assignment is applied and no apply/bulk/provisioning/entitlement/runtime control exists.
- Confirmed no visible forbidden proposal mutation buttons for `Apply all`, `Auto assign`, `Approve`, `Dismiss`, bulk action, provisioning, entitlement, or runtime controls.
- Current live QA data did not include a visible proposal with starter-pack impact context; source/read-model tests still cover read-only starter-pack impact preview behavior.
- Playwright console captured no warnings or errors for the checked route.
- QA screenshot was written to `%TEMP%\phase-6u-super-admin-groups-readiness.png`.

Before/after read-only count checks matched:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Validation:

- `pnpm exec tsx --test apps/web/components/contractor-group-manager-readiness-display.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 34 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-targeting.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts` passed: 17 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF/CRLF normalization warnings only.

Recommended next prompt:

- "Decide whether to plan a future human-confirmed proposal-to-manual-assignment action. Keep the next pass planning/server-readiness only unless explicitly approving a real audited apply action."

## Phase 6V Proposal-To-Manual-Assignment Readiness Hardening

Phase 6V added a pure proposal-to-manual-assignment readiness helper for future contractor group assignment conversion. The helper evaluates proposal eligibility/status, required future reason/confirmation inputs, server-side recomputation requirements, safe audit metadata preview, blocking/warning issues, and a safe operator summary. It always returns `actionAvailable: false`. This pass did not add an assignment action, RPC, button, form, input, disabled fake button, membership write, proposal decision write, migration, schema/RLS/grant change, entitlement behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, tax/payroll/financial behavior, invoice/contract behavior, user-preference behavior, or background job.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `docs/contractor-groups-plan.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Readiness rules added:

- `proposed` high-confidence and medium-confidence rows with active groups can be `eligible_for_manual_review` for a future action only.
- `already_assigned` returns no-op/readback guidance and must not duplicate membership.
- `unavailable`, `not_applicable`, low-confidence, archived, inactive, `future_plan`, and `future_entitlement` rows are blocked.
- missing organization/group context is unavailable.
- stale loaded organization/group context returns `stale_recompute_required`.
- a current membership discovered at readiness time overrides the proposal state and returns `already_assigned`.
- every output keeps `actionAvailable: false`.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 32 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF/CRLF normalization warnings only.

Manual QA:

- Not run in this pass; no UI, route, action, schema, or runtime behavior was added. The change is pure read-model/test/docs hardening only.

Recommended next prompt:

- "Implement Phase 6W as proposal-to-manual-assignment readiness operator QA/read-only verification. Verify the pure readiness statuses through focused tests and docs, inspect `/super-admin/groups` for no assignment/apply controls, record count stability, and fix only read-only copy/docs defects."

## Phase 6U Proposal-To-Manual-Assignment Design QA

Phase 6U completed read-only verification of the Phase 6T proposal-to-manual-assignment design. `docs/contractor-groups-plan.md` contains the dedicated `Proposal-To-Manual-Assignment Implementation Plan` section and covers the future action name/shape, required inputs, server-side recomputation, allowed/blocked proposal states, audited manual assignment path, idempotency/concurrency, safe metadata, platform-admin/server-only security, UI workflow, and QA gates. No documentation or UI defects were found, and no assignment action, RPC, membership write, proposal decision write, entitlement behavior, starter-pack provisioning behavior, runtime behavior, migration, schema change, RLS/grant change, or background job was added.

Files changed in this verification pass:

- `docs/chat-handoff.md`

Browser/Playwright QA:

- In-app Browser on the current `/super-admin/groups?groupStatus=archived&groupType=custom&proposalStatus=unavailable&proposalConfidence=unavailable&proposalGroupType=future_entitlement` tab reproduced the known shared loading-shell caveat and showed stale console history from an older `contractor-group-manager.tsx` compile issue; this was not treated as a current Phase 6T defect because current validation passes and authenticated Playwright loaded the route successfully.
- Authenticated Playwright with platform-admin storage state loaded `http://localhost:3000/super-admin/groups`.
- Confirmed `Assignment proposals` renders.
- Confirmed 8 visible `Manual review checklist` panels render.
- Confirmed 8 instances of `Future action will require manual reason and audited assignment. Not implemented yet.` render.
- Confirmed proposal rows still show `Action available: no`, `Assignment applied: no`, and `Runtime effect: none`.
- Confirmed safety copy remains visible for platform segmentation only, no entitlement behavior, no contractor permission change, no starter-pack auto-provisioning, and no runtime workflow effect.
- Confirmed no exact `Apply all`, `Auto assign`, `Assign from proposal`, `Approve`, `Dismiss`, or `Bulk apply` button/text/input exists.
- Visible buttons remained existing controls only: sign out, filter proposals, filter events, apply filters, inspect groups, create contractor group, save group, and assign organization.
- Playwright console captured one existing React hydration mismatch warning; no framework error overlay or current compile failure appeared.
- QA screenshot was written to `%TEMP%\phase-6u-groups-proposal-design-qa-3000.png`.

Before/after read-only count checks matched:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 22 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF/CRLF normalization warnings only.

Recommended next prompt:

- "Implement Phase 6V as contractor group proposal-to-manual-assignment implementation readiness hardening only. Add no action yet; tighten pure helper/test coverage or operator docs only if gaps remain before a real server action."

## Phase 6T Contractor Group Assignment Proposal Readiness Display

Phase 6T added read-only `/super-admin/groups` display for the contractor group assignment proposal manual-review readiness fields. Proposal rows now show readiness labels, readiness explanations, reason codes, evidence items, caveats with severity, future manual-apply preview, `No runtime effect` copy, and read-only starter-pack impact context when present. Starter-pack impact remains targeting context only and is labeled non-provisioning. This pass did not add apply/approve/dismiss controls, assignment automation, membership writes, audit writes, proposal dismissal writes, entitlement enforcement, module gating, pricing/package behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission changes, tenant-owned template/catalog writes, migrations, schema changes, RLS/grant changes, or background jobs.

Files changed in this pass:

- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/components/contractor-group-manager-readiness-display.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm exec tsx --test apps/web/components/contractor-group-manager-readiness-display.test.ts apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing CRLF-normalization warnings only.

Recommended next prompt:

- "Run Phase 6U as read-only QA verification for `/super-admin/groups` assignment proposal readiness display. Verify readiness labels/details render, filters still work, no apply/approve/dismiss/provisioning/runtime controls exist, and before/after counts remain unchanged."

## Phase 6S Contractor Group Assignment Proposal Read-Model Enrichment

Phase 6S read-model enrichment promoted contractor group assignment proposal manual-review readiness into first-class proposal fields. The proposal model now exposes `manualReviewReadiness`, `readinessLabel`, `readinessExplanation`, stable `reasonCode`, structured `evidenceItems`, structured `caveatItems`, `futureApplyPreview`, `starterPackImpactPreview`, `runtimeEffect: "none"`, `actionAvailable: false`, and the existing manual-review checklist on each proposal. Starter-pack impact is read-only targeting context only and has `provisioningEffect: "none"`. This pass did not add apply/approve/dismiss controls, assignment automation, membership writes, audit writes, proposal dismissal writes, entitlement enforcement, module gating, pricing/package behavior, starter-pack provisioning behavior, runtime behavior, contractor-side permission changes, tenant-owned template/catalog writes, migrations, schema changes, RLS/grant changes, or background jobs.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts` passed: 39 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing CRLF-normalization warnings only.

Recommended next prompt:

- "Implement the read-only `/super-admin/groups` display pass for the new contractor group proposal readiness fields. Show readiness labels, reason codes, evidence/caveat summaries, future apply preview, and starter-pack impact context without adding apply controls, membership writes, audit writes, provisioning, entitlements, schema, RLS/grant changes, or runtime behavior."

## Phase 6T Contractor Group Proposal-To-Manual-Assignment Design

Phase 6T was completed as a design-only pass for the then-future human-confirmed proposal-to-manual-assignment workflow. It has since been superseded by the implemented `applyContractorGroupProposalManualAssignmentAction(...)` flow documented in Phase 7A through Phase 7E above. This historical pass did not add a server action, RPC, migration, schema/RLS/grant change, assignment write, button, form, input, disabled fake button, proposal decision history, entitlement behavior, starter-pack provisioning behavior, runtime behavior, or background job at the time it ran.

Files changed in this pass:

- `docs/contractor-groups-plan.md`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF/CRLF normalization warnings only.

Recommended next prompt:

- "Implement Phase 6U as contractor group proposal-to-manual-assignment design QA/read-only verification. Verify the new design section and read-only checklist copy, run validation, and confirm no assignment/server-action/RPC/mutation/provisioning/runtime behavior exists."

## Phase 6S Contractor Group Assignment Proposal Manual-Review Readiness

Phase 6S added read-only manual-review readiness for contractor group assignment proposals. The proposal model now exposes a pure manual-review checklist builder with evidence items, future operator checks, blocking caveats, suggested future reason text, a manual assignment path label, and `actionAvailable: false`. `/super-admin/groups` shows the checklist for visible proposal rows. This does not add apply/approve/dismiss controls, assignment automation, membership writes, proposal dismissal writes, entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, runtime behavior, contractor-side permission changes, tenant-owned template/catalog writes, migrations, schema changes, RLS/grant changes, or background jobs.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/contractor-groups-plan.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 18 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing CRLF-normalization warnings only.

Browser/operator QA:

- In-app Browser reproduced the known shared shell caveat on `/super-admin/groups`, showing `Preparing your workspace`; this was not treated as a Phase 6S defect because authenticated Playwright loaded the page successfully.
- Authenticated Playwright loaded `/super-admin/groups` with platform-admin storage state.
- Confirmed `Assignment proposals` renders.
- Confirmed 8 visible `Manual review checklist` panels render on the default proposal view.
- Confirmed each visible checklist shows `Action available: no`, `Future checks`, and `Suggested future reason` copy.
- Confirmed the existing copy still says the audited manual assignment flow remains required and no apply-all/auto-assign/provisioning/entitlement/runtime control exists.
- Confirmed no `Apply all`, `Auto assign`, `Approve`, or `Dismiss` buttons were visible.
- QA screenshot was written to `%TEMP%\phase-6s-groups-manual-review.png`.

Before/after read-only count checks matched:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Recommended next prompt:

- "Implement Phase 6T as contractor group assignment proposal manual-review operator QA/read-only verification. Verify the manual review checklist UI, docs, validation, and count stability only; do not add apply/approve/dismiss controls, assignment automation, membership writes, entitlement behavior, provisioning behavior, schema, or runtime change."

## Customer Communication Preference UI

Customer detail now includes contractor-admin communication preference management for email appointment reminders. This sits on the existing `communication_preferences` foundation and does not add schema, SMS controls, portal preference UI, automated reminder settings, appointment confirmation preferences, AI, Google/Outlook sync, customer self-scheduling, provider changes, or reminder scheduling.

Files changed in this pass:

- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/components/customer-communication-preferences-panel.tsx`
- `apps/web/components/appointment-reminder-panel.tsx`
- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/communication-preferences.ts`
- `apps/web/lib/communications/communication-preferences-schema.ts`
- `apps/web/lib/communications/customer-communication-preferences-core.ts`
- `apps/web/lib/communications/appointment-reminders.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented:

- Customer detail now loads customer-level and linked `customer_contact` email appointment-reminder preference summaries.
- Missing preference rows display as `Allowed by default`.
- Contractor admins can save `allowed`, `opted_out`, or `suppressed` preferences with an optional reason.
- Customer-level `opted_out` or `suppressed` blocks all appointment reminder recipients for that customer; customer-contact blocks apply only to that linked contact.
- Appointment Customer Reminder panel links back to the customer communication preference section when no eligible recipient remains after preference filtering.

Not implemented:

- SMS controls, portal preference UI, automated reminders, appointment confirmation preferences, global organization defaults, AI, Google/Outlook sync, customer self-scheduling, provider changes, schema changes, or appointment status/note mutation.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-reminders.test.ts` passed: 9 tests.
- `pnpm typecheck` passed.

Recommended next prompt:

- "Create a focused implementation plan for automated appointment reminder schedules or SMS consent/opt-out foundations. Planning only; do not implement scheduling, SMS delivery, AI, Google/Outlook sync, portal preference UI, or customer self-scheduling."

## Phase 6R Contractor Group Assignment Proposal QA

Phase 6R completed read-only operator verification for the contractor group assignment proposal filters and selected-organization proposal summary. No proposal defects were found and no assignment automation, automatic membership write, entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, migration, schema change, RLS/grant change, or background job was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 37 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing CRLF-normalization warnings only.

Browser/operator QA:

- In-app Browser retried the current filtered URL and stayed on the shared `Preparing your workspace` shell for `/super-admin/groups`; this reproduced the known browser/session caveat and was not treated as a Phase 6Q page defect.
- Created/updated the normal Playwright platform-admin storage state through `pnpm exec playwright test --project=setup-platform-admin` against `http://localhost:3000`.
- Authenticated Playwright loaded `/super-admin/groups` with platform-admin auth and confirmed `Assignment proposals` renders.
- Confirmed the proposal organization, proposal status, confidence, and group type filters render.
- Confirmed status/confidence/group-type filters submit and update URL state for `proposalStatus=unavailable`, `proposalConfidence=unavailable`, and `proposalGroupType=future_entitlement`.
- Confirmed the future-entitlement caveat remains understandable: future plan and future entitlement groups are never proposed automatically in this phase.
- Confirmed the selected organization filter updates the selected organization proposal summary. QA selected organization `e19c182b-923b-402d-996b-c4c20728a79f`; visible summary was `platform proposal summary` with `6 total`, `0 proposed`, `0 already assigned`, and `6 unavailable`.
- Confirmed top reasons render for the selected organization and proposal rows show `assignment applied: no`.
- Confirmed safety copy says no assignment is applied here and the existing audited manual assignment flow remains required.
- Confirmed no actionable `Apply all`, `Auto assign`, bulk, entitlement, starter-pack provisioning, or runtime controls were visible. The page intentionally contains safety copy saying no apply-all/auto-assign control exists.
- Playwright console captured one React hydration warning showing browser-injected `caret-color: transparent` style attributes on form fields. The page rendered and QA checks passed; this was documented as browser/environment noise, not a proposal read-model defect.
- QA screenshot was written to `%TEMP%\phase-6r-groups-proposals.png`.

Before/after read-only count checks matched:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Recommended next prompt:

- "Implement Phase 6S as contractor group assignment proposal manual-review readiness planning/read-model only. Define what a future human-reviewed proposal-to-assignment workflow would require, but add no apply action, automation, membership writes, entitlement behavior, provisioning behavior, schema, or runtime change."

## Phase 6Q Contractor Group Assignment Proposal UX/Read-Model Hardening

Phase 6Q hardened the read-only contractor group assignment proposal model and `/super-admin/groups` proposal inspection UI. No assignment automation, automatic membership write, entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, migration, schema change, RLS/grant change, or background job was added.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/contractor-groups-plan.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Implemented read-only behavior:

- Proposal read model now supports filters for proposal status, confidence, and group type in addition to organization.
- Proposal read model now returns organization summaries with total, proposed, already-assigned, unavailable, not-applicable, top reason, and top caveat counts.
- `/super-admin/groups` now includes proposal filters for organization, proposal status, confidence, and group type.
- Selecting an organization shows proposal summary counts and the most common proposal reasons/caveats.
- Proposal rows still carry `assignmentApplied: false`, and the UI continues to state that manual audited assignment remains required.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 13 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts` passed: 30 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing CRLF-normalization warnings only.

Browser/operator QA:

- In-app Browser loaded `http://localhost:3000/super-admin/groups?groupStatus=archived&groupType=custom&proposalStatus=unavailable&proposalConfidence=unavailable&proposalGroupType=future_entitlement` with the platform-admin session.
- Confirmed `Assignment proposals` renders with `Proposal organization`, `Proposal status`, `Confidence`, and `Group type` filters plus the `Filter proposals` control.
- Confirmed copy still says no assignment is applied, manual audited assignment remains required, and no entitlement/provisioning/pricing/permission/runtime behavior is triggered.
- Confirmed filtered proposal state renders visible summary counts and future-only/future-entitlement copy.
- Confirmed no `Apply all` or `Auto assign` mutation control exists. Visible controls remain existing navigation/filter/group-management controls plus the new read-only `Filter proposals` submit.
- The in-app Browser verified the new panel once, then later direct navigation between filtered organization states stayed on the shared `Preparing your workspace` shell. This matches prior Browser/session caveats and should be rechecked in Phase 6R before treating it as a page defect; static validation and focused tests passed.
- Browser console history still includes stale Phase 6O JSX parse errors from before the current fix; current typecheck/lint are clean.

Read-only count check after QA:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Recommended next prompt:

- "Implement Phase 6R as contractor group assignment proposal operator QA/read-only verification. Verify the new proposal filters and selected-organization summary in `/super-admin/groups`, record before/after counts, and fix only read-only UI/docs defects."

## Phase 6P Contractor Group Assignment Proposal QA

Phase 6P completed read-only operator/browser verification for the contractor group assignment proposal panel. No code defects were found and no assignment automation, automatic membership write, entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, migration, schema change, RLS/grant change, or background job was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 31 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing CRLF-normalization warnings only.

Browser/operator QA:

- In-app Browser loaded `http://localhost:3000/super-admin/groups?groupStatus=archived&groupType=custom` with the platform-admin session.
- Confirmed `Assignment proposals` renders.
- Confirmed the proposal panel says it is read-only decision support, says no assignment is applied, and says the existing audited manual assignment flow remains required.
- Confirmed proposal rows show `assignment applied: no`.
- Confirmed unavailable/future-only proposal copy renders, including the caveat that future plan and future entitlement groups are never proposed automatically in this phase.
- Confirmed no `Apply all`, `Auto assign`, provisioning, entitlement, or runtime mutation button/control is present. Visible buttons were existing controls only: sign out, filter events, apply filters, inspect groups, create contractor group, save group, and assign organization.
- Confirmed the current QA data has no active contractor group memberships, so `already_assigned` could not be browser-verified from live data; it remains covered by the focused pure test.
- Confirmed current live proposal data includes unavailable states; focused tests cover exact region match, exact trade match, archived group unavailable, future entitlement unavailable, insufficient metadata unavailable, and existing membership mapping.
- Browser console history still included stale dev-server errors from the earlier Phase 6O JSX parse issue, but the current DOM rendered the page and validation passed. No current framework error overlay was visible.

Before/after read-only count checks matched:

- `contractor_groups=6`
- `contractor_group_memberships=0`
- `contractor_group_audit_events=27`
- `document_templates=4`
- `catalog_items=9`
- `platform_starter_pack_provisioning_runs=4`
- `platform_starter_pack_provisioning_run_items=5`

Recommended next prompt:

- "Implement Phase 6Q as contractor group assignment proposal UX/read-model hardening only. Improve read-only filtering or organization-focused proposal inspection if needed, add no mutation controls, and keep proposals non-enforcing/non-automated."

## Appointment Reminder Manual Email Send UI

Appointment workspaces now expose contractor-side manual email reminder sending in a separate Customer Reminder panel. This uses the existing reminder readiness, customer-safe reminder preview, communication preferences, canonical `appointment_reminder` communication messages, and notification delivery audit foundation. It does not add SMS, automated reminder schedules, cron, AI, Google/Outlook sync, portal reminder actions, customer self-scheduling, or automation.

Files changed in this pass:

- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/components/appointment-reminder-panel.tsx`
- `apps/web/lib/communications/actions.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented:

- Appointment detail now loads reminder readiness, customer-safe reminder preview, preference-filtered eligible email recipients, recent reminder logs, and linked reminder delivery attempts.
- The Customer Reminder panel shows readiness blockers, "Email only", "Manual send", and "No SMS or automated reminders yet" boundaries.
- Contractors can edit customer-safe reminder body copy and manually send one email reminder to a selected eligible recipient.
- `sendAppointmentReminderEmailAction` validates input server-side, calls `sendAppointmentReminderEmail`, revalidates appointment/communications/dashboard surfaces, and returns safe redirect messages.
- Recent reminder logs and the latest sent/failed delivery attempt are shown separately from appointment confirmations.
- Duplicate successful reminder emails to the same recipient for the same appointment remain blocked by the server and surface as a safe action error.

Not implemented:

- SMS, automated reminder scheduling, cron, AI, Google/Outlook sync, portal reminder actions, customer self-scheduling, dashboard reminder-send UI, or appointment status/note mutation.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-reminders.test.ts apps/web/lib/communications/appointment-confirmations.test.ts apps/web/lib/communications/appointment-confirmation-email-core.test.ts apps/web/lib/portal/appointment-visibility.test.ts` passed: 15 tests.
- `pnpm typecheck` passed.

Recommended next prompt:

- "Create a focused implementation plan for customer/contact communication preference UI and preference management. Plan only; do not add SMS implementation, automated reminders, AI, Google/Outlook sync, portal preference UI, or customer self-scheduling unless the plan explicitly scopes a later phase."

## Manual Email Appointment Reminder Send Foundation

Manual appointment reminder email sending now exists as a schema-free server/data foundation only. It reuses canonical appointments, customer-safe reminder previews, `communication_preferences`, appointment-linked `communication_messages`, `notification_events`, and `notification_deliveries`. It does not add reminder UI, automated scheduling, cron, SMS, AI, Google/Outlook sync, portal reminder actions, customer self-scheduling, or automation.

Files changed in this pass:

- `apps/web/lib/communications/appointment-reminder-core.ts`
- `apps/web/lib/communications/appointment-reminders.ts`
- `apps/web/lib/communications/appointment-reminders.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented:

- `sendAppointmentReminderEmail` validates active organization scope, reminder readiness, selected recipient membership in the preference-filtered recipient set, and customer-safe reminder body content.
- Manual reminder sends create or reuse an appointment-linked `appointment_reminder` communication message with `visibility = customer_visible`.
- Reminder email sends use the existing Postmark-backed `sendTrackedNotificationEmail` path and link delivery attempts to canonical messages through `notification_deliveries.communication_message_id`.
- `communication_messages.delivery_status` is updated to `sent` only after provider success.
- Provider failures remain failed notification delivery audit rows and do not mark the communication message sent.
- Duplicate successful reminder emails to the same recipient for the same appointment are blocked without introducing persisted reminder schedule rows.

Not implemented:

- Reminder UI, automated reminder scheduling, cron, SMS, AI, Google/Outlook sync, portal reminder actions, customer self-scheduling, or appointment status/note mutation.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-reminders.test.ts` passed: 7 tests.
- `pnpm exec tsx --test apps/web/lib/communications/appointment-reminders.test.ts apps/web/lib/communications/appointment-confirmations.test.ts apps/web/lib/communications/appointment-confirmation-email-core.test.ts apps/web/lib/portal/appointment-visibility.test.ts` passed: 15 tests.
- `pnpm typecheck` passed.

Recommended next prompt:

- "Implement appointment detail UI for manually sending email appointment reminders. Reuse the existing reminder readiness, customer-safe preview, preference-filtered recipient resolver, and `sendAppointmentReminderEmail` utility. Keep the UI explicit/manual and do not add SMS, automated scheduling, AI, external calendar sync, portal reminder actions, or customer self-scheduling."

## Communication Preferences And Appointment Reminder Readiness Foundation

Customer communication preference storage and appointment reminder readiness utilities now exist as a schema/data foundation only. This does not add UI, provider sends, automated reminder scheduling, SMS, AI, Google/Outlook sync, portal preference UI, customer self-scheduling, or automation.

Files changed in this pass:

- `supabase/migrations/20260508000315_communication_preferences_reminder_readiness.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/communications/communication-preferences-schema.ts`
- `apps/web/lib/communications/communication-preferences.ts`
- `apps/web/lib/communications/appointment-reminder-core.ts`
- `apps/web/lib/communications/appointment-reminder-preview.ts`
- `apps/web/lib/communications/appointment-reminders.ts`
- `apps/web/lib/communications/appointment-reminders.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- `communication_preferences` stores organization-scoped customer, customer-contact, and contact preference rows for email and future SMS categories, with active-member RLS and no portal/customer policies.
- Server utilities validate preference subjects against canonical `customers`, `customer_contacts`, or `contacts` before upsert.
- Appointment reminder readiness can build customer-safe reminder preview copy, resolve email recipients through the existing appointment-confirmation recipient path, and filter those recipients through appointment-reminder preferences.
- Explicit `opted_out` or `suppressed` preferences block reminder recipients; missing email appointment-reminder preference rows default to allowed for readiness only.
- Readiness suppresses non-customer-visible appointments, missing customer/project context, canceled/no-show/completed appointments, missing start times, and missing eligible email recipients.

Still intentionally not implemented:

- Reminder sending, automated reminders, persisted reminder schedules, SMS, provider-backed reminder delivery, AI, Google/Outlook sync, portal preference UI, customer self-scheduling, or reminder UI.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-reminders.test.ts` passed: 6 tests.
- `pnpm typecheck` passed.

Recommended next prompt:

- "Implement the manual email appointment reminder send foundation. Reuse appointment reminder readiness, customer-safe reminder preview, communication preferences, canonical appointment communication messages with `message_kind = appointment_reminder`, and `notification_deliveries` provider audit. Do not add UI, SMS, automated scheduling, AI, Google/Outlook sync, portal actions, or customer self-scheduling."

## Phase 6O Contractor Group Assignment Proposals

Phase 6O added contractor group assignment proposal planning/read-model behavior only. `/super-admin/groups` now shows a read-only `Assignment proposals` panel built from current contractor group definitions, current organization metadata, and explicit current memberships. No assignment automation, automatic membership writes, entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, runtime behavior, contractor-side permission change, tenant-owned template/catalog write, schema change, RLS/grant change, background job, or service-role browser exposure was added.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-proposals-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/contractor-groups-plan.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Implemented behavior:

- The proposal read model returns `proposed`, `already_assigned`, `not_applicable`, or `unavailable` rows with confidence, source, reason, caveats, group status/type, and an explicit `assignmentApplied: false` marker.
- Regional proposals require exact state/region-to-group matching.
- Trade segment proposals require exact primary-trade-to-group matching.
- Existing memberships always show as `already_assigned`.
- Archived groups are not proposed for new assignments.
- Future plan and future entitlement groups are marked future-only/unavailable.
- Insufficient organization metadata returns unavailable instead of guessing.
- The `/super-admin/groups` panel states proposals are read-only and that existing audited manual assignment remains required.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts` passed: 7 tests.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-proposals.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-group-audit-events.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed, with existing CRLF-normalization warnings only.

Read-only browser/count QA:

- In-app Browser loaded `http://localhost:3000/super-admin/groups?groupStatus=archived&groupType=custom`.
- Confirmed the page rendered `Assignment proposals`, read-only proposal copy, and no apply-all or auto-assign mutation buttons.
- Visible buttons remained existing controls: sign out, filter events, apply filters, inspect groups, create contractor group, save group, and assign organization.
- Before/after read-only count checks matched: `contractor_groups=6`, `contractor_group_memberships=0`, `contractor_group_audit_events=27`, `document_templates=4`, `catalog_items=9`, `platform_starter_pack_provisioning_runs=4`, `platform_starter_pack_provisioning_run_items=5`.

Recommended next prompt:

- "Implement Phase 6P as contractor group assignment proposal operator QA/read-only verification. Verify the `/super-admin/groups` proposal panel with a platform-admin browser session, record before/after counts for contractor groups, memberships, audit events, document templates, catalog items, and provisioning runs/items, confirm no apply/auto-assign/provisioning controls exist, and fix only read-only UI/docs defects."

## Appointment Confirmation Manual Email Send UI

Appointment workspaces now expose contractor-side manual email sending for customer appointment confirmations. This reuses the existing customer-safe preview, canonical appointment confirmation communication message, and notification delivery audit foundation. It does not add SMS, automated reminders, AI, Google/Outlook sync, customer self-scheduling, portal confirmation actions, or automation.

Files changed in this pass:

- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/components/appointment-confirmation-panel.tsx`
- `apps/web/components/auth-submit-button.tsx`
- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/appointment-confirmations.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Appointment detail now loads confirmation preview, eligibility, recent confirmation logs, eligible email recipients, linked email delivery attempts, and organization send-lock state.
- The Customer Confirmation panel shows readiness blockers, editable customer-safe preview content, a single-recipient email selector, logged-only action, manual email send action, and latest sent/failed email delivery state.
- Manual email send uses `sendAppointmentConfirmationEmailAction`, validates the selected recipient server-side through the existing resolver, and revalidates appointment, communications, and dashboard surfaces after the action.
- Email send remains explicit and human-confirmed. Successful provider delivery marks the communication message `sent`; failed provider attempts stay in delivery history and do not mark the message sent.
- Appointment status, schedule fields, customer-visible flags, customer notes, internal notes, legacy notes, work items, portal visibility, automation runs, and external calendar state are not mutated.

Still intentionally not implemented:

- SMS, voice, chat, automated reminders, Google/Outlook sync, customer self-scheduling, portal confirmation actions, provider-backed reminder scheduling, AI, or automated confirmation sends.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm exec tsx --test apps/web/lib/communications/appointment-confirmation-email-core.test.ts apps/web/lib/communications/appointment-confirmations.test.ts apps/web/lib/communications/appointment-confirmation-eligibility.test.ts apps/web/lib/portal/appointment-visibility.test.ts` passed: 11 tests.

Recommended next prompt:

- "Create a focused implementation plan for appointment reminders and communication preferences. Plan only; do not implement code, schema, UI, SMS, automation, AI, or external calendar sync. Evaluate customer consent/preferences, quiet hours, reminder schedule records, manual versus automated reminder phases, and how future reminders reuse canonical appointments, communication messages, and notification delivery audit."

## Appointment Confirmation Email Delivery Foundation

Manual provider-backed email delivery now has a schema/data/server foundation for appointment confirmations. This is not a UI slice and does not add SMS, automated reminders, AI, Google/Outlook sync, customer self-scheduling, portal confirmation actions, or automation.

Files changed in this pass:

- `supabase/migrations/20260507232414_appointment_confirmation_email_delivery_foundation.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/notifications/system.ts`
- `apps/web/lib/communications/appointment-confirmation-email-core.ts`
- `apps/web/lib/communications/appointment-confirmation-email-core.test.ts`
- `apps/web/lib/communications/appointment-confirmations.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- `notification_deliveries.communication_message_id` can now link a provider delivery attempt back to the canonical customer communication message it attempted to deliver.
- Appointment confirmation email recipient resolution validates the active organization, requires a customer-visible project/customer-linked appointment, and resolves valid email recipients from active project-scoped portal access, customer contacts, and canonical customer email fallback.
- Appointment confirmation email sending uses the existing Postmark-backed notification email path and customer-safe appointment confirmation preview content.
- Sending can create a new customer-visible `appointment_confirmation` communication message or reuse a selected existing appointment confirmation message.
- `communication_messages.delivery_status` is updated to `sent` only after provider success.
- Failed provider attempts are recorded through `notification_deliveries` and do not mark the communication message sent.
- Appointment status, schedule fields, customer-visible flags, customer notes, internal notes, legacy notes, work items, portal visibility, automation runs, and external calendar state are not mutated.

Still intentionally not implemented:

- Appointment detail email-send UI.
- SMS, voice, chat, automated reminders, Google/Outlook sync, customer self-scheduling, portal confirmation actions, provider-backed reminder scheduling, or AI.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-confirmation-email-core.test.ts apps/web/lib/communications/appointment-confirmations.test.ts apps/web/lib/portal/appointment-visibility.test.ts` passed: 8 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- `pnpm exec supabase migration list --linked` succeeded and showed `20260507232414` as local-only/pending.
- `pnpm exec supabase migration list --local` could not connect because local Postgres on `127.0.0.1:54322` was not running.

Recommended next prompt:

- "Implement the appointment detail UI for manual email sending of customer appointment confirmations. Reuse the existing Customer Confirmation panel, show eligible email recipients, require explicit contractor confirmation, call the existing send utility, and display sent/failed delivery state. Do not add SMS, automated reminders, AI, Google/Outlook sync, portal confirmation actions, or customer self-scheduling."

## Contractor Group Audit Export And Retention QA

Phase 6N completed verification for contractor group audit export/retention planning and the read-only `/super-admin/groups` operator copy. No export behavior, CSV/JSON generation, API route, download button, retention/deletion job, audit-event deletion/archive behavior, migration, schema change, RLS/grant change, entitlement behavior, runtime behavior, assignment automation, starter-pack provisioning behavior, contractor permission behavior, or tenant-owned write path was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Documentation verification:

- Confirmed `docs/contractor-groups-plan.md` contains `Audit Retention, Export, And Support Readiness`.
- Confirmed the section covers audit purpose, retention expectations, why audit events should not be casually deleted, future CSV/JSON/support-bundle export shapes, platform-admin-only export access, safe export fields, excluded/redacted fields, actor/user and organization label handling, metadata sanitization, support investigation workflows, future retention/deletion caveats, future legal/compliance caveats, and a future audit export QA checklist.

Browser/operator QA:

- The in-app Browser runtime reached `http://localhost:3000/super-admin/groups?groupStatus=archived&groupType=custom` but remained on the shared `Preparing your workspace` loading shell with no relevant console errors. This matches the Phase 6L Browser/session caveat and was not treated as a confirmed page defect.
- Authenticated Playwright QA against the same local server and platform-admin E2E credentials loaded `/super-admin/groups?groupStatus=archived&groupType=custom`.
- Confirmed `Audit observability` renders.
- Confirmed `Audit history` renders.
- Confirmed the Audit History copy includes `Export and retention tooling is planned`, `audit events are platform evidence`, and `should not be manually deleted`.
- Confirmed no export/download/retention/delete/archive-audit-event controls were visible. The rendered button set was limited to existing navigation, filters, inspection, and current contractor group management controls.
- Confirmed safety copy remains visible for no entitlement enforcement, no contractor permission changes, no starter-pack auto-provisioning/provisioning behavior, and no runtime behavior.
- Confirmed no browser console warnings or errors during the authenticated Playwright QA run.

Read-only count check:

| Table | Before | After |
| --- | ---: | ---: |
| `catalog_items` | 9 | 9 |
| `contractor_group_audit_events` | 27 | 27 |
| `contractor_group_memberships` | 0 | 0 |
| `contractor_groups` | 6 | 6 |
| `document_templates` | 4 | 4 |
| `platform_starter_pack_provisioning_run_items` | 5 | 5 |
| `platform_starter_pack_provisioning_runs` | 4 | 4 |

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 6O as contractor group assignment proposal planning/read-model only. Define future preview-first automated assignment proposals, operator approval requirements, audit-event expectations, rejection/attempt visibility, and explicit no-entitlement/no-provisioning boundaries. Do not add automation, jobs, schema, entitlements, runtime behavior, or contractor permission changes."

## Contractor Group Audit Export And Retention Planning

Phase 6M completed a planning/support-readiness pass for contractor group audit retention and future exports. No export action, retention job, deletion behavior, archive automation, migration, schema change, RLS/grant change, server action, API route, entitlement behavior, runtime behavior, assignment automation, starter-pack provisioning behavior, contractor permission behavior, or tenant-owned write path was added.

Files changed in this pass:

- `docs/contractor-groups-plan.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `apps/web/components/contractor-group-manager.tsx`

Plan summary:

- Added `Audit Retention, Export, And Support Readiness` to `docs/contractor-groups-plan.md`.
- Defines contractor group audit events as platform evidence for support/governance investigations, not disposable UI activity logs.
- Recommends retaining audit events for the life of the platform account unless a later legal/compliance policy requires a narrower window.
- Defines future export formats as CSV, JSON, and bounded support bundles.
- Limits future export access to platform admins first, with any support-role access requiring explicit server-side scope and audit.
- Lists safe export fields, excluded/redacted fields, actor/organization label handling, metadata sanitization rules, support investigation workflows, retention/deletion caveats, legal/compliance caveats, and a future export QA checklist.

UI copy:

- `/super-admin/groups` Audit History now states that export and retention tooling is planned and that audit events are platform evidence that should not be manually deleted.
- No export button, download control, API route, retention/deletion control, background job, or mutation path was added.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 6N as contractor group audit export/retention operator QA and documentation verification only. Confirm the Audit History copy renders, validate no export/download/delete/retention controls exist, run typecheck/lint/diff-check, and fix only documentation or copy defects."

## Contractor Group Audit Operator QA

Phase 6L completed read-only operator verification for contractor group audit observability. No application code, schema, RLS/grants, or contractor group behavior changed in this pass.

Files changed in this pass:

- `docs/chat-handoff.md`

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 28 tests.

Browser/operator QA:

- The in-app Browser plugin remained on the `Preparing your workspace` loading shell for the existing `/super-admin/groups?groupStatus=archived&groupType=custom` tab and a fresh tab, even after restarting the local dev server. Browser console output only showed stale historical schema-cache/page errors plus current Next.js smooth-scroll warnings, so this was recorded as an in-app Browser/session caveat rather than a confirmed page defect.
- Authenticated Playwright QA against the same local server and platform-admin E2E credentials loaded `/super-admin/groups?groupStatus=archived&groupType=custom` successfully.
- Confirmed `Audit observability` renders.
- Confirmed `Audit history` renders.
- Confirmed the event-type filter renders and selected `organization_removed`, updating the URL with `auditEventType=organization_removed`.
- Confirmed group-level audit summary sections render for archived/custom groups with audit events.
- Confirmed organization-centric audit history renders for organization `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1` (`QA Early Access`) and shows assignment/removal activity.
- Confirmed metadata summaries render without raw database errors or secrets.
- Confirmed the context check copy reports loaded audit events include expected group and organization context; no missing-context warning was present in the QA data.
- Confirmed safety copy remains visible: platform segmentation only, no entitlement enforcement, no contractor permission changes, and no starter-pack auto-provisioning/runtime behavior.

Read-only count check:

| Table | Before | After |
| --- | ---: | ---: |
| `catalog_items` | 9 | 9 |
| `contractor_group_audit_events` | 27 | 27 |
| `contractor_group_memberships` | 0 | 0 |
| `contractor_groups` | 6 | 6 |
| `document_templates` | 4 | 4 |
| `platform_starter_pack_provisioning_run_items` | 5 | 5 |
| `platform_starter_pack_provisioning_runs` | 4 | 4 |

Security/behavior spot-check:

- No Phase 6K mutation controls were added; existing Phase 6A group management controls remain the only mutation controls on `/super-admin/groups`.
- No client/browser service-role exposure was found in `apps` or `packages`.
- No entitlement, runtime, pricing/package, starter-pack provisioning, assignment automation, contractor permission, tenant-owned template/catalog, tax, payroll, financial, invoice/contract generation, user preference, or navigation behavior changed.

Recommended next prompt:

- "Implement Phase 6M as contractor group audit event retention/export planning and support-readiness only. Define how operators should preserve, search, and eventually export group audit history before groups power entitlements or onboarding. Do not add export behavior, entitlement enforcement, assignment automation, provisioning, schema changes, or contractor permission behavior."

## Appointment Customer Confirmation Panel

The contractor-side appointment workspace now has a Customer Confirmation panel. It uses the existing appointment-linked communication foundation to preview and manually log customer-visible appointment confirmations, but it still does not send anything externally.

Files changed in this pass:

- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/components/appointment-confirmation-panel.tsx`
- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/data.ts`
- `apps/web/lib/communications/appointment-confirmation-eligibility.ts`
- `apps/web/lib/communications/appointment-confirmation-eligibility.test.ts`
- `apps/web/lib/communications/appointment-confirmations.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Appointment workspaces load confirmation eligibility, customer-safe preview content, and recent appointment confirmation logs.
- The Customer Confirmation panel shows whether the appointment is ready to log, including blockers for missing customer visibility, customer context, project context, start time, or title.
- Eligible appointments show editable customer-safe confirmation copy generated from allowed appointment/customer/project/company fields.
- Contractors can manually log the confirmation from the appointment workspace.
- Logging creates a customer-visible `appointment_confirmation` communication message with `delivery_status = logged`, revalidates appointment/communications/dashboard paths, and redirects back with a logged-only success message.
- The panel shows recent logged appointment confirmation messages with timestamp, message kind, delivery status, body, and creator id when available.

Safety boundaries:

- No `appointment_confirmations` table was created.
- No SMS/email/voice/chat provider delivery, reminder scheduling, AI, Google/Outlook sync, customer self-scheduling, portal confirmation UI, or automation was added.
- Logging does not mutate appointment status, `customer_visible`, `customer_notes`, `internal_notes`, legacy `notes`, portal visibility, notification deliveries, automation runs, work items, or external calendar state.
- Portal appointment loaders and portal UI remain unchanged.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-confirmation-eligibility.test.ts apps/web/lib/communications/appointment-confirmations.test.ts apps/web/lib/portal/appointment-visibility.test.ts` passed: 8 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.

Recommended next prompt:

- "Create the provider-delivery planning spec for appointment confirmations and reminders. Include consent, opt-out, quiet hours, templates, provider adapters, delivery audit events, retry/failure behavior, and human confirmation rules. Do not implement provider delivery yet."

## Validation Reconciliation After Communications Migration Push

Validation was rechecked after first inspecting the linked Supabase migration state. This pass made no application-code changes.

Migration state:

- `pnpm exec supabase migration list --linked` now shows all local migrations through `20260507224205` applied remotely.
- The previously noted local-only communications migration `20260507224205_appointment_confirmation_communication_foundation.sql` is now present in the linked migration history.
- No unrelated migration was applied in this pass.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Root cause classification:

- Already resolved / no longer reproducible.
- The earlier communications blocker was intentional appointment/communications type drift that had already been reconciled by the appointment confirmation logging foundation work.
- No stale communications, appointment, contractor group, starter-pack, provisioning, financial, tax, payroll, entitlement, or navigation behavior was changed here.

Recommended next prompt:

- "Implement Phase 6L contractor group audit operator QA/read-only verification. Re-check contractor group audit observability and security after the validation reconciliation pass, without adding entitlement, runtime, assignment automation, provisioning, or contractor permission behavior."

## Appointment Customer Confirmation Logging Foundation

Appointment customer confirmation logging now has a schema/data foundation over canonical communication history. This is not a UI, provider delivery, reminder, automation, AI, external-calendar, customer self-scheduling, or portal confirmation-action slice.

Files changed in this pass:

- `supabase/migrations/20260507224205_appointment_confirmation_communication_foundation.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/communications/data.ts`
- `apps/web/lib/communications/contractor-data.ts`
- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/appointment-confirmation-preview.ts`
- `apps/web/lib/communications/appointment-confirmations.ts`
- `apps/web/lib/communications/appointment-confirmations.test.ts`
- `apps/web/lib/notifications/system.ts`
- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/components/communication-reply-form.tsx`
- `apps/web/components/communication-notification-triage-form.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- `communication_threads` and `communication_messages` can now link to canonical appointments with tenant-scoped appointment context.
- `communication_message_kind` now includes `appointment_confirmation` and `appointment_reminder`; reminder is classification only and does not schedule or send anything.
- Server utilities can build customer-safe appointment confirmation previews from appointment title/type, date/time, status, safe location, `customer_notes`, safe customer/project context, and company name.
- Server utilities can manually log a customer-visible appointment confirmation as a canonical communication message with `delivery_status = logged`, after validating the appointment belongs to the active organization and is `customer_visible = true`.
- Contractor communications source filtering now recognizes appointment threads.

Safety boundaries:

- No `appointment_confirmations` table was created.
- Logging a confirmation does not mutate appointment status, appointment visibility fields, notes, portal visibility, notification deliveries, automation runs, work items, or external calendar state.
- Preview/logging utilities must not include `internal_notes`, legacy `notes`, work items, internal communication, assignment internals, or provider payloads.
- Portal appointment loaders remain customer-safe and portal communication visibility was not broadened for appointment threads.
- No SMS/email/voice/chat provider delivery, reminder scheduling, AI, Google/Outlook sync, customer self-scheduling, portal confirmation UI, or automation was added.

Validation:

- `pnpm exec tsx --test apps/web/lib/communications/appointment-confirmations.test.ts apps/web/lib/lead-communication-foundation.test.ts apps/web/lib/portal/appointment-visibility.test.ts` passed: 9 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.
- `pnpm exec supabase migration list --linked` confirmed `20260507224205` is local-only and not applied remotely; no migration push was performed.

Recommended next prompt:

- "Implement appointment confirmation logging UI on appointment detail. Add a contractor-only preview/log button that uses the existing customer-safe preview and manual logging utility. Do not send SMS/email, schedule reminders, add AI, sync external calendars, expose portal confirmation actions, or mutate appointment status."

## Appointment Work Items UI Slice

Appointment-detail work item integration is implemented for internal contractor users. It reuses the existing `work_items` foundation and shared work-item UI so contractors can manually create, view, complete, and dismiss appointment-linked internal work items without adding auto-generation, provider delivery, AI, external calendar sync, customer reminders, portal task visibility, customer self-scheduling, or a generic workflow engine.

Files changed in this pass:

- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/components/work-items/work-item-create-form.tsx`
- `apps/web/lib/work-items/work-items.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Appointment workspaces now load work items where `source_type = appointment` and `source_id` is the current appointment.
- Appointment workspaces include a contractor-only Work Items section with explicit create and linked-list panels.
- Appointment-linked work item creation source-locks the current appointment, points `link_path` back to the appointment workspace, preserves appointment customer/project context when present, and defaults assignment to the appointment's assigned person when that person is active and assignable.
- The default work-item kind is context-aware but still manually confirmed: scheduled/upcoming appointments default to `appointment_confirmation_prep`, completed/canceled/no-show appointments default to `appointment_follow_up`, and other states fall back to `manual`.
- Contractors can complete or dismiss open appointment-linked work items from the appointment workspace.
- Completing or dismissing appointment-linked work items does not mutate appointment status, schedule fields, customer-visible appointment notes, portal visibility, notifications, automation runs, or workflow error events.

Boundaries:

- No appointment work items are auto-created from appointment status, no-show/canceled cues, follow-up queues, AI, providers, notifications, automation runs, or workflow errors.
- No portal/customer loader or portal UI imports or displays work items.
- No `/work-items` manager route was added.

Validation:

- `pnpm exec tsx --test apps/web/lib/work-items/work-items.test.ts` passed: 7 tests.
- `pnpm exec tsx --test apps/web/lib/portal/appointment-visibility.test.ts` passed: 3 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.

Recommended next prompt:

- "Implement explicit create-work-item bridge actions from follow-up queue and no-show/canceled appointment cues. Keep every bridge manually confirmed, prefill source/kind/due context, and do not add auto-generation, provider reminders, AI, external calendar sync, portal visibility, or a generic workflow engine."

## Internal Work Items UI Slice

The first V1 internal work-item UI slice is implemented for dashboard and lead workspaces. It makes manually created internal work items usable without adding auto-generation, provider delivery, AI, external calendar sync, customer reminders, portal task visibility, or a generic workflow engine.

Files changed in this pass:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/leads/[leadId]/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/work-items/work-item-create-form.tsx`
- `apps/web/components/work-items/work-item-list.tsx`
- `apps/web/lib/work-items/read-model.ts`
- `apps/web/lib/work-items/work-items.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Dashboard now shows a compact internal work-items queue.
- Dashboard prefers open work items assigned to the current user's linked active `people` record when that mapping exists and has work; otherwise it falls back to open company work items with assignee context.
- Dashboard work items can be completed or dismissed through the existing work-item server actions.
- Lead workspaces now show opportunity-linked internal work items near the communication/follow-up area.
- Lead workspaces can explicitly create manual or lead-follow-up work items linked to the current opportunity with title, description, due date, priority, kind, and optional assignable person.
- Lead-linked work items can be completed or dismissed from the lead workspace.
- Completing or dismissing a work item does not mutate `opportunities.next_follow_up_at`, lead status, communication visibility, appointment state, notifications, automation runs, or workflow error events.

Boundaries:

- No `/work-items` manager route was added.
- No work items are auto-created from lead follow-up queues, appointment cues, notifications, automation runs, workflow errors, AI, or provider events.
- Work items remain internal-only and are not exposed through portal/customer loaders.

Validation:

- `pnpm exec tsx --test apps/web/lib/work-items/work-items.test.ts` passed: 6 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.

Recommended next prompt:

- "Implement appointment-detail work item integration. Show work items linked to `source_type = appointment`, allow explicit manual appointment-prep/follow-up work item creation from appointment detail, and allow complete/dismiss. Do not add auto-generation, reminders, provider delivery, AI, external calendar sync, portal visibility, or a generic workflow engine."

## Contractor Groups Phase 6H Audit Write Live QA

Phase 6H applied and verified the Phase 6G contractor group audit-write RPC migration against the linked Supabase project `jcnoraopbwdhshcmplgb`. This was a verification pass with no entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, assignment automation, runtime behavior, contractor-side permission behavior, tenant-owned template/catalog writes, tax/payroll/financial behavior, invoice/contract generation changes, user preference changes, duplicate tenant-role behavior, or background jobs.

Migration verification:

- Applied `supabase/migrations/20260507192746_contractor_group_audit_write_rpcs.sql` to the linked Supabase project with `pnpm exec supabase db query --linked -f supabase/migrations/20260507192746_contractor_group_audit_write_rpcs.sql`.
- Marked only `20260507192746` applied with `pnpm exec supabase migration repair 20260507192746 --status applied --linked` because a later unrelated local migration `20260507193923_work_items_foundation.sql` is also pending and was intentionally not applied in this pass.
- Confirmed `supabase_migrations.schema_migrations` contains `20260507192746`; `20260507193923` remains unapplied remotely.

RPC/security verification:

- Private functions exist for group create/update, archive, assign/update membership, remove membership, and status-transition event selection.
- Public wrapper RPCs exist only for server-side Supabase RPC calls.
- All public and private Phase 6G functions have `search_path = ''`.
- Mutation functions are `security definer`; the private status-mapping helper is not security definer.
- `anon` and `authenticated` do not have execute privilege on the public or private Phase 6G functions.
- `service_role` has execute privilege on the public and private Phase 6G functions.
- `anon` and `authenticated` do not have `USAGE` on the `private` schema; `service_role` does.
- `rg` over `apps` and `packages` found service-role usage confined to server-side config/db utilities, with no `NEXT_PUBLIC_*` service-role exposure.

Table security verification:

- `contractor_group_audit_events`, `contractor_groups`, and `contractor_group_memberships` have RLS enabled and forced.
- `contractor_group_audit_events` has no direct `anon`, `authenticated`, or `public` table grants.

QA records and actions:

- QA group: `Phase 6H Audit QA 1778183306708`
- QA group key: `phase-6h-audit-qa-1778183306708`
- QA group id: `26df42fa-ab6b-4ec1-942f-8e14235d4609`
- QA organization: `QA Early Access`
- QA organization id: `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`
- Browser UI created the QA group and confirmed the `group_created` event.
- Browser UI assigned `QA Early Access` to the QA group and confirmed the `organization_assigned` event.
- Browser UI removed the assignment and the database confirmed `organization_removed` plus `removedMembershipId` metadata.
- The in-app browser visibly rendered `/super-admin/groups`, the Audit History panel, segmentation-only safety copy, and no entitlement/provisioning controls.
- Direct linked-database RPC checks verified `group_updated`, `group_deactivated`, `group_activated`, `assignment_source_changed`, a second `organization_removed`, and `group_archived` because the browser automation surface did not reliably submit the lower group update/archive controls even though they rendered correctly.
- Final browser reload at `/super-admin/groups?groupStatus=archived&groupType=custom` confirmed the Audit History panel rendered `Group updated`, `Group deactivated`, `Group activated`, `Assignment source changed`, `Organization removed`, and `Group archived` for the QA event timeline.

Before/after counts:

- `contractor_groups`: `2` -> `3` because the QA group remains archived as audit evidence.
- `contractor_group_memberships`: `0` -> `0`; QA assignments were removed.
- `contractor_group_audit_events`: `0` -> `10` from the QA lifecycle and assignment evidence rows.
- `document_templates`: `4` -> `4`.
- `catalog_items`: `9` -> `9`.
- `platform_starter_pack_provisioning_runs`: `4` -> `4`.
- `platform_starter_pack_provisioning_run_items`: `5` -> `5`.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.

Recommended next prompt:

- "Implement Phase 6I as contractor group audit-write post-QA cleanup/hardening only. Review the Phase 6H QA caveat around lower group update/archive browser automation versus RPC verification, run validation, and fix only confirmed defects. Do not add entitlements, automation, provisioning, runtime behavior, or contractor permissions."

## Contractor Groups Phase 6I Audit Write UI Hardening

Phase 6I investigated the Phase 6H caveat around lower `/super-admin/groups` update/archive controls. The root cause was repeated generic form/button names making browser automation brittle, not a transaction/RPC defect or entitlement/runtime behavior issue. The server actions and RPCs remained scoped to platform-admin server paths.

Files changed:

- `apps/web/components/contractor-group-manager.tsx`
- `docs/chat-handoff.md`

Hardening made:

- Group create/update forms now have stable `data-testid` values and group-specific accessible labels.
- Group assignment, membership removal, and archive forms now have stable `data-testid` values plus `data-contractor-group-key` attributes.
- Repeated buttons keep their visible copy, but now have group-specific accessible names for reliable operator/browser QA targeting.
- No server action, RPC, migration, schema, RLS, grant, entitlement, runtime, provisioning, assignment automation, contractor permission, template/catalog, tax/payroll/financial, invoice/contract, or user-preference behavior changed.

QA records:

- In-app browser rendered `/super-admin/groups?groupStatus=archived&groupType=custom`, the group-specific controls, and the durable Audit History timeline.
- In-app browser automation still showed click/submit brittleness on repeated controls, but rendered the final Phase 6I audit events after reload.
- Playwright with the existing platform-admin storage state successfully submitted the actual UI forms for:
  - group create
  - metadata update / inactive transition
  - active transition
  - organization assignment
  - organization removal
  - group archive
- Main QA group: `Phase 6I Playwright QA 1778185844360 Updated`
- Main QA group key: `phase-6i-playwright-qa-1778185844360`
- QA organization: `QA Early Access` / `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`
- Confirmed durable events for the main QA group: `group_created`, `group_deactivated`, `group_activated`, `organization_assigned`, `organization_removed`, and `group_archived`.
- A preliminary in-app QA group `phase-6i-audit-qa-1778185236513` was also archived as audit evidence after creating update/archive evidence.

Before/after counts:

- `contractor_groups`: `3` -> `5`; two Phase 6I QA groups remain archived as audit evidence.
- `contractor_group_memberships`: `0` -> `0`; QA memberships were removed.
- `contractor_group_audit_events`: `10` -> `20` from Phase 6I lifecycle and assignment evidence rows.
- `document_templates`: `4` -> `4`.
- `catalog_items`: `9` -> `9`.
- `platform_starter_pack_provisioning_runs`: `4` -> `4`.
- `platform_starter_pack_provisioning_run_items`: `5` -> `5`.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 6J as contractor group audit observability/operator review hardening only. Summarize audit event health, expose recent lifecycle/assignment event filters if low-risk, and fix only read-only UI defects. Do not add entitlements, automation, runtime behavior, starter-pack auto-provisioning, or contractor permissions."

## Contractor Groups Phase 6J Audit RPC Security And Operator Verification

Phase 6J re-verified the Phase 6G/6I contractor group audit-write path after the UI accessibility/test-hook hardening. This was verification-only; no app code, migration, schema, RLS/grant, entitlement, pricing, provisioning, runtime, contractor permission, tenant template/catalog, tax/payroll/financial, invoice/contract, user-preference, assignment automation, background job, or service-role exposure behavior was added.

Migration verification:

- `pnpm exec supabase migration list --linked` confirmed `20260507173254`, `20260507191344`, and `20260507192746` are applied remotely.
- Direct `supabase_migrations.schema_migrations` query returned all three requested versions.
- The later unrelated local migration `20260507193923` still shows as local-only in `migration list`; it was not applied in this pass.

RPC/function security verification:

- Private transaction-aware functions and public wrapper RPCs exist for create/update, archive, assign/update membership, and remove membership.
- Function owner is `postgres`; mutation functions are `security definer`; the private status-mapping helper is not security definer.
- All Phase 6G public/private functions have `search_path = ''`.
- `public`, `anon`, and `authenticated` have no execute privilege on the Phase 6G public or private functions.
- `service_role` has execute privilege on the Phase 6G public and private functions.
- `public`, `anon`, and `authenticated` have no `USAGE` on the `private` schema; `service_role` does.
- `rg` over `apps` and `packages` found service-role references only in server-side config/db utilities and a migration test assertion; no `NEXT_PUBLIC_*` service-role exposure was found.

Table security verification:

- `contractor_groups`, `contractor_group_memberships`, and `contractor_group_audit_events` exist.
- All three have RLS enabled and forced.
- `information_schema.role_table_grants` returned no direct `public`, `anon`, or `authenticated` grants for the three contractor group tables.

QA records and actions:

- QA group: `Phase 6J Audit QA 1778192662589 Updated`
- QA group key: `phase-6j-debug-1778192662589`
- QA group id: `b55b9969-5733-4310-a11b-1c10a2efe29b`
- QA organization: `QA Early Access`
- QA organization id: `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`
- In-app browser rendered `/super-admin/groups?groupStatus=archived&groupType=custom`, the Audit History panel, the archived QA group, segmentation-only safety copy, and no forbidden runtime/enforcement buttons.
- In-app browser click dispatch still failed on the long scrolled create form before submission (`No element found at point ...`), so actual submissions were completed with Playwright against the same localhost UI using the Phase 6I `data-testid` and group-specific accessible labels.
- Playwright successfully submitted the UI forms for group create, metadata update, status inactive, status active, organization assignment, organization removal, and group archive.
- Durable audit events confirmed for the QA group: `group_created`, `group_updated`, `group_deactivated`, `group_activated`, `organization_assigned`, `organization_removed`, and `group_archived`.
- `assignment_source_changed` was not exercised because the current UI does not expose assignment source/notes update for an existing membership; the assignment source remains a hidden `manual` field and already-assigned organizations are filtered out of the assignment selector.
- Audit metadata showed safe scalar fields only: old/new key/name/status/type, organization label/status, notes presence, assignment source, and removed membership id. No raw DB errors or secrets were present.

Before/after counts:

- `contractor_groups`: `5` -> `6`; the Phase 6J QA group remains archived as audit evidence.
- `contractor_group_memberships`: `0` -> `0`; the QA assignment was removed.
- `contractor_group_audit_events`: `20` -> `27` from Phase 6J lifecycle and assignment evidence rows.
- `document_templates`: `4` -> `4`.
- `catalog_items`: `9` -> `9`.
- `platform_starter_pack_provisioning_runs`: `4` -> `4`.
- `platform_starter_pack_provisioning_run_items`: `5` -> `5`.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 6K as contractor group audit observability/read-model hardening only. Add filters or summaries for recent durable audit events if useful, keep it read-only, and do not add entitlements, runtime behavior, assignment automation, starter-pack auto-provisioning, or contractor permissions."

## Internal Work Items Schema/Data Foundation

The V1 internal work-item foundation is implemented as schema/data only. It adds `work_items` as an organization-scoped, RLS-protected contractor action layer for ownership, due dates, assignment, completion, and dismissal. It does not add UI, auto-generation, provider delivery, AI, Google/Outlook sync, customer reminders, portal task visibility, or a generic workflow engine.

Files changed in this pass:

- `supabase/migrations/20260507193923_work_items_foundation.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/work-items/constants.ts`
- `apps/web/lib/work-items/schemas.ts`
- `apps/web/lib/work-items/read-model.ts`
- `apps/web/lib/work-items/data.ts`
- `apps/web/lib/work-items/actions.ts`
- `apps/web/lib/work-items/work-items.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Added constrained `work_item_*` enums and the `work_items` table with `company_id`, title, description, status, priority, kind, due date, optional assigned person, optional source type/id, optional customer/project context, internal-only visibility, optional dedupe key, safe metadata, creator/updater/completion fields, and timestamps.
- Added same-company constraints for assigned people, customers, and projects, indexes for open/due/dashboard/source lookup, a partial unique dedupe-key index, and `set_updated_at`.
- Enabled and forced RLS. Active organization members can select, insert, and update internal work items for their company. No portal/customer policies or delete policy were added.
- Added typed work-item constants, shared types, validation schemas, queue sorting helpers, server-side data utilities, and server actions for create, update, complete, and dismiss.
- Server utilities validate assigned people as active and assignable in the active organization and validate supported polymorphic source records before source-linked creation.

Boundaries:

- Work items do not replace `opportunities.next_follow_up_at`, `next_follow_up_note`, appointment scheduling/status fields, notifications, notification events, notification deliveries, automation runs, workflow error events, or canonical workflow state.
- No work items are auto-created from lead follow-up queues, appointment no-show/canceled cues, notification events, automation runs, or workflow errors.
- Completed/dismissed work items are not reopened in V1.

Validation:

- `pnpm exec tsx --test apps/web/lib/work-items/work-items.test.ts` passed: 4 tests.
- `pnpm typecheck` passed after relation-shape tightening in `apps/web/lib/work-items/data.ts`.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.
- `supabase db push --local --dry-run` could not run because the local Supabase database was not listening on `127.0.0.1:54322`.
- `supabase db push --dry-run` connected to the linked remote project and reported `20260507193923_work_items_foundation.sql` as the only pending migration. It was not applied.

Recommended next prompt:

- "Implement the dashboard/list UI for internal work items. Show my assigned open work items when the current user maps to an active `people` row, fall back to company open work items when needed, and add links back to source records. Do not add auto-generation, external reminders, AI, portal task visibility, or provider delivery."

## Contractor Groups Phase 6G Audit Write Wiring

Phase 6G wires contractor group create/update/archive/assign/remove operations to durable audit events through transaction-aware server-side RPCs. This adds audit evidence only. It does not add entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, assignment automation, runtime behavior, contractor-side permission behavior, tenant-owned template/catalog writes, tax/payroll/financial behavior, invoice/contract generation changes, user preference changes, duplicate tenant-role behavior, or background jobs.

Files changed:

- `supabase/migrations/20260507192746_contractor_group_audit_write_rpcs.sql`
- `apps/web/lib/platform-admin/contractor-group-audit-events-core.ts`
- `apps/web/lib/platform-admin/contractor-group-audit-events.test.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness-core.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/current-state.md`
- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Added private Postgres functions plus service-role-only public wrappers for contractor group create/update, archive, assign/update membership, and remove membership.
- Each RPC locks the affected group or membership rows, performs the mutation, and inserts the matching `contractor_group_audit_events` row in the same database transaction.
- Group create/update emits `group_created`, `group_updated`, `group_activated`, `group_deactivated`, or `group_archived` based on the status transition.
- Membership assign/update emits `organization_assigned` or `assignment_source_changed` when an existing membership's source changes.
- Membership removal emits `organization_removed` before deleting the membership row; because `membership_id` references the removed row with `on delete set null`, the durable event stores `removedMembershipId` in safe metadata.
- Audit metadata stores safe before/after group fields, assignment source, organization label/status, notes-present flag, and removed membership id where relevant. It does not store secrets or raw database errors.
- `/super-admin/groups` Audit History copy now explains that new group management actions append events once the audit-write migration is applied.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 29 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.

Recommended next prompt:

- "Implement Phase 6H as operator/browser QA and live verification for contractor group audit writes. Apply/verify `20260507192746_contractor_group_audit_write_rpcs.sql`, create/update/archive/assign/remove a QA group, confirm audit events appear, verify RLS/grants and before/after tenant-owned counts, and fix only defects found."

## Internal Lead Follow-Up Queue

The V1 internal follow-up/reminder visibility slice is implemented. It adds contractor-side dashboard and lead-manager visibility over existing canonical opportunity follow-up fields and appointment records only; it does not add external reminder delivery, AI, Google/Outlook sync, provider messaging, portal reminders, schema, migrations, or a generic task engine.

Files changed in this pass:

- `apps/web/lib/opportunities/follow-up-read-model.ts`
- `apps/web/lib/opportunities/follow-up-data.ts`
- `apps/web/lib/opportunities/follow-up-read-model.test.ts`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/leads/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Added a tenant-scoped lead follow-up data utility that reads canonical opportunities and opportunity communication thread recency.
- Added a pure read model that classifies active leads as overdue, due today, upcoming, or no follow-up using `opportunities.next_follow_up_at`; won/lost/converted leads are excluded from the queue.
- Dashboard now shows a compact internal lead follow-up queue prioritizing overdue and due-today items, including follow-up note and last communication timestamp when available.
- Lead manager now has lightweight follow-up filters and badges for due, overdue, no-follow-up, and all follow-up states.
- Dashboard appointment visibility now labels today/tomorrow appointment items and can include recent canceled/no-show appointments as internal follow-up cues.

Important caveats:

- No customer reminder delivery, self-scheduling, SMS/email/voice/chat provider behavior, AI, Google Calendar, Outlook/Microsoft 365 sync, portal follow-up display, task/reminder persistence, or workflow engine was added.
- Internal follow-up notes remain contractor-side only and must not be exposed through portal/customer loaders.

Validation:

- `pnpm exec tsx apps/web/lib/opportunities/follow-up-read-model.test.ts` passed: 4 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with line-ending normalization warnings only.

Recommended next prompt:

- "Implement the next narrow appointment/customer communication slice as either customer appointment confirmation/reminder planning or a first lightweight notification/task foundation. Do not add provider delivery, AI, Google/Outlook sync, or a duplicate reminder/task model without an approved plan."

## Contractor Groups Phase 6F Audit Schema Foundation

Phase 6F added contractor group audit/history storage and read-only operator visibility only. This is an audit foundation for future group lifecycle and assignment history; it does not add entitlement enforcement, module gating, pricing behavior, starter-pack auto-provisioning, assignment automation, runtime behavior, contractor-side permission behavior, tenant-owned template/catalog writes, or background jobs.

Files changed:

- `supabase/migrations/20260507191344_contractor_group_audit_events.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/contractor-group-audit-events-core.ts`
- `apps/web/lib/platform-admin/contractor-group-audit-events.test.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `docs/current-state.md`
- `docs/contractor-groups-plan.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Added `contractor_group_audit_events` with constrained event types, optional group/organization/membership references, actor id, assignment source, reason, safe JSON-object metadata, and `occurred_at`.
- Enabled and forced RLS on the audit table and revoked direct `anon` / `authenticated` grants.
- Added shared contractor group audit event types, a pure read-model/timeline formatter, and read-only platform-admin data helpers.
- `/super-admin/groups` now loads recent audit rows and shows a read-only `Audit history` panel. If no durable events exist, the panel explains that the table is ready and write wiring is a follow-up.
- The existing inferred `Assignment history readiness` panel now reflects that durable audit storage exists, while current-row inference still cannot reconstruct historical removals that were not written as audit events.

Important caveat:

- Existing group create/update/archive/assign/remove actions were not wired to append audit events in this pass. That was intentional: the current actions are separate Supabase calls, and durable audit writes should be added in a follow-up with transaction-aware server-side behavior so group mutations do not become partially audited or brittle.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 25 tests.
- `pnpm typecheck` passed.
- Scoped ESLint over the Phase 6F touched web files passed.
- Full `pnpm lint` is currently blocked by unrelated `@typescript-eslint/no-floating-promises` errors in `apps/web/lib/opportunities/follow-up-read-model.test.ts`.
- Scoped `git diff --check` over the Phase 6F files passed. Full `git diff --check` is currently blocked by unrelated trailing whitespace in `docs/Architecture.md`.

Recommended next prompt:

- "Implement Phase 6G as contractor group audit write wiring and QA only. Use the existing `contractor_group_audit_events` table, add transaction-aware/server-side audit writes for create/update/archive/assign/remove actions, keep contractor groups segmentation-only, and verify no entitlement/runtime/provisioning behavior changes."

## Customer-Visible Portal Appointment Display

The V1 customer-visible appointment display slice is implemented. Portal home and portal project workspaces now show read-only appointments from the canonical `appointments` table only when the appointment is project-linked and `customer_visible = true`.

Files changed in this pass:

- `apps/web/lib/portal/appointment-visibility.ts`
- `apps/web/lib/portal/appointment-visibility.test.ts`
- `apps/web/lib/portal/data.ts`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Added portal-safe appointment mapping that returns only title, appointment type, date/time, status, location, `customer_notes`, project context, and timestamps.
- Added project-scoped portal appointment loading through existing authenticated portal scope and `portal_project_access`; inaccessible projects return no appointments.
- Added portal home upcoming appointment visibility across accessible projects.
- Added portal project workspace appointment visibility for that project.
- Appointment display is customer-safe and read-only. It does not expose `appointments.notes`, `internal_notes`, assignment internals, internal communication, or contractor scheduling comments.

Boundaries:

- No schema, migration, RLS policy, appointment persistence, contractor appointment workflow, self-scheduling, reminders, AI, SMS/email/voice/chat provider, Google Calendar, or Outlook/Microsoft 365 sync changes were made.
- Opportunity-only appointments are not shown in the portal in this V1; portal appointment display is project-scoped.

Validation:

- `pnpm exec tsx apps/web/lib/portal/appointment-visibility.test.ts` passed: 3 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

## Dashboard Appointment Lint Reconciliation

Investigated the reported `pnpm lint` blocker in `apps/web/app/(app)/dashboard/page.tsx`. The blocker was tied to intentional lead-linked appointment dashboard work, not unrelated dead code.

Exact lint blocker from the prior Phase 6D handoff:

- `apps/web/app/(app)/dashboard/page.tsx:211:9` - `dashboardAppointments` assigned but never used.
- `apps/web/app/(app)/dashboard/page.tsx:217:9` - `appointmentDashboardTitle` assigned but never used.
- `apps/web/app/(app)/dashboard/page.tsx:220:9` - `appointmentDashboardDescription` assigned but never used.
- `apps/web/app/(app)/dashboard/page.tsx:225:9` - `appointmentDashboardEyebrow` assigned but never used.
- `apps/web/app/(app)/dashboard/page.tsx:228:9` - `appointmentDashboardEmptyTitle` assigned but never used.
- `apps/web/app/(app)/dashboard/page.tsx:231:9` - `appointmentDashboardEmptyDescription` assigned but never used.

Root cause classification:

- Stale render-layer drift during intentional appointment/dashboard work.
- The appointment read-model variables were intended to support the implemented dashboard behavior: show `My upcoming appointments` when the authenticated user maps to an active `people.membership_user_id` record, otherwise fall back to company upcoming appointments.
- Current `apps/web/app/(app)/dashboard/page.tsx` now consumes those values in the appointments operations widget, so no dashboard code change was needed in this pass.

Files changed in this pass:

- `docs/chat-handoff.md`

Validation:

- `pnpm --filter @floorconnector/web lint` passed.
- `pnpm lint` passed from Turbo cache replay.
- `pnpm typecheck` passed from Turbo cache replay.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Boundaries preserved:

- Intentional dashboard appointment visibility was preserved.
- No new dashboard, communication, appointment, AI, provider, portal, scheduling, contractor group, starter-pack/provisioning, financial, tax, payroll, entitlement, or contractor navigation behavior was added.

## Contractor Groups Phase 6E

Phase 6E added contractor group assignment-audit planning/read-model only. It does not add migrations, tables, RLS/grant changes, entitlement enforcement, module gating, pricing/package behavior, starter-pack auto-provisioning, runtime behavior, contractor-side permissions, tenant-owned template/catalog writes, tax/payroll/financial behavior, invoice/contract generation changes, user preference behavior, assignment automation, or background jobs.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness-core.ts`
- `apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `docs/contractor-groups-plan.md`
- `docs/README.md`
- `docs/current-state.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/chat-handoff.md`

Implemented read-only behavior:

- Added a pure assignment audit-readiness model that infers group-created, organization-assigned, and archived-group events from current `contractor_groups` and `contractor_group_memberships` rows.
- The model explicitly reports that removed membership history is not durable yet because current removal deletes the membership row.
- The model reports archive history as inferred from current archived status and `updated_at`, not a durable archive event with actor/reason.
- `/super-admin/groups` now shows a read-only `Assignment history readiness` panel with inferred recent events, caveats, and no-runtime-effect copy.
- `docs/contractor-groups-plan.md` defines future immutable assignment audit/history requirements before groups power enforcement, automation, entitlements, onboarding assignment, or starter-pack recommendation/provisioning workflows.

Browser QA:

- Reloaded `http://localhost:3000/super-admin/groups?groupStatus=archived&groupType=custom` in the in-app browser with the authenticated platform-admin session.
- Confirmed `Assignment history readiness` renders.
- Confirmed copy explains membership removal is not durable history yet.
- Confirmed `No runtime effect` and `Platform segmentation only` safety copy renders.
- Confirmed no forbidden entitlement/provisioning controls appeared (`Enable entitlement`, `Auto-provision`, `Run provisioning`, or `Provision group`).

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-assignment-audit-readiness.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 21 tests.
- `pnpm --filter @floorconnector/web typecheck` passed.
- `pnpm --filter @floorconnector/web lint` passed.
- `pnpm typecheck` passed from Turbo cache replay.
- `pnpm lint` passed from Turbo cache replay.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 6F as contractor group assignment-audit schema design only. Do not add migrations unless explicitly approved; define the immutable event table shape, actor metadata, retention expectations, and future read model before any enforcement, automation, entitlement, or provisioning behavior."

## Lead-Linked Appointment Schedule And Dashboard Visibility

The V1 internal company schedule/dashboard visibility slice for lead-linked appointments is implemented. Existing canonical `appointments` now surface beside scheduled jobs in contractor-only schedule/dashboard views without adding external calendar sync, AI, provider messaging, portal appointment display, a generic calendar table, or a dispatch redesign.

Files changed in this pass:

- `apps/web/lib/schedule/read-model.ts`
- `apps/web/lib/schedule/read-model.test.ts`
- `apps/web/lib/schedule/links.ts`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- `/schedule` now loads canonical jobs and canonical appointments and projects them into a discriminated internal read model with `type: "job"` and `type: "appointment"`.
- The schedule manager keeps job scheduling persistence separate from appointment persistence; it does not merge jobs and appointments into a new source of truth.
- Schedule filters now include all items, jobs, and appointments.
- Day/week schedule views show appointment blocks alongside scheduled jobs, clearly labeled as appointments.
- Appointment schedule/list entries link to appointment detail and, where known, lead/opportunity, customer, or project context.
- Appointment entries show assigned person, appointment type/status, location, and a customer-visible badge when `customer_visible` is true.
- Dashboard now shows `My upcoming appointments` when the authenticated user can be safely mapped to an active `people` row through `people.membership_user_id`.
- If there is no safe current-user-to-person mapping or no assigned upcoming appointment for that person, the dashboard falls back to company upcoming appointments with assignee/context labels instead of inventing a user/person mapping.

Boundaries:

- Google Calendar, Outlook/Microsoft 365, external busy blocks, two-way sync, AI scheduling, SMS/email/voice/chat providers, route optimization, portal appointment display, and customer-facing appointment notifications remain not implemented.
- Existing jobs and `job_assignments` remain the canonical production scheduling foundation.
- Existing `appointments` remain the canonical appointment foundation.
- Contractor/internal schedule views may show internal appointment context, but portal/customer surfaces must still use only explicitly customer-visible appointment data when portal appointment display is built later.

Validation:

- `pnpm exec tsx apps/web/lib/schedule/read-model.test.ts` passed: 3 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement the next narrow appointment slice: either customer-facing portal appointment display using only `customer_visible` and `customer_notes`, or internal manual reminder/follow-up task queues. Do not add Google/Outlook sync, AI, SMS/email/voice/chat providers, or a generic calendar/event source of truth."

## Super Admin Platform Console Phase 6D

Phase 6D completed operator/browser QA and live verification for contractor group observability. No Phase 6C defects were found, and no app code, migrations, schema, RLS, grants, entitlement behavior, runtime behavior, starter-pack auto-provisioning, contractor permission behavior, tenant-owned template/catalog writes, tax/payroll/financial logic, invoice/contract generation, user preference behavior, or duplicate tenant-role system was added.

Migration and live schema verification:

- `pnpm exec supabase migration list --linked` confirmed `20260507173254 | 20260507173254 | 2026-05-07 17:32:54`.
- Local Supabase migration introspection was not available because the local database was not running on `127.0.0.1:54322`.
- Linked SQL verification confirmed `contractor_groups` and `contractor_group_memberships` exist, RLS is enabled, RLS is forced, and both `anon` and `authenticated` have no direct table privileges.

QA records:

- QA group name: `Phase 6D QA Observability 1778179074785`
- QA group key: `phase-6d-qa-1778179074785`
- QA group id: `74e3616a-67eb-46f0-aa5e-41e50840a738`
- Temporary membership id: `22ea65de-3caf-405a-80cb-4f2c77b3c764`
- Member organization: `platform` / `e19c182b-923b-402d-996b-c4c20728a79f`
- Non-member organization: `QA Early Access` / `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`
- Temporary starter-pack targeting assignment id: `a27464be-3538-4fcc-a953-df99cc76ed10`
- Starter pack used for targeting preview: `Phase 5G QA Execution Pack` / `2a92b429-69bf-4b62-9574-345462e0dbe4`

Browser QA results:

- `/super-admin/groups` loaded with the authenticated platform-admin session.
- Confirmed summary tiles, status/type filters, safety copy, organization-centric inspection, starter-pack assignment references, and no provisioning/entitlement/runtime controls.
- Created the QA group through the browser UI.
- Assigned `platform (trialing)` through the browser UI and confirmed the member count, recently assigned membership observability, and organization-centric membership panel updated.
- Verified status/type filters by filtering to active/custom and confirming the QA group remained visible while the archived Phase 6B group was hidden.
- Verified a no-group organization by selecting `QA Early Access`; the organization-centric panel showed `No groups assigned`.
- Created a temporary `future_contractor_group` starter-pack assignment intent for the QA group key, verified the member organization matched by explicit group membership in `/super-admin/templates`, and verified the non-member organization did not match.
- Removed the temporary starter-pack assignment, removed the temporary membership, and archived the QA group as evidence with zero memberships.
- Multi-group organization display was covered by the focused pure test; live browser QA did not create a second persistent group membership just to force that state.

Count checks:

| Table | Before | After | Result |
| --- | ---: | ---: | --- |
| `contractor_groups` | 1 | 2 | QA group remains archived as evidence |
| `contractor_group_memberships` | 0 | 0 | Temporary membership removed |
| `document_templates` | 4 | 4 | Unchanged |
| `catalog_items` | 9 | 9 | Unchanged |
| `platform_starter_pack_provisioning_runs` | 4 | 4 | Unchanged |
| `platform_starter_pack_provisioning_run_items` | 5 | 5 | Unchanged |

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed.
- `pnpm typecheck` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- `pnpm lint` was previously blocked by unrelated unused appointment-dashboard variables in `apps/web/app/(app)/dashboard/page.tsx`; the Dashboard Appointment Lint Reconciliation note above records that the current branch now consumes those variables and lint passes.

Recommended next prompt:

- "Fix the unrelated dashboard lint blocker by reconciling the current appointment dashboard variables in `apps/web/app/(app)/dashboard/page.tsx` with the intended dashboard/scheduling work. Do not change contractor groups, provisioning, entitlements, tax/payroll/financial logic, or navigation."

## Super Admin Platform Console Phase 6C

Phase 6C added contractor group read-model hardening and observability only. `/super-admin/groups` now builds a pure platform-admin observability model over existing contractor groups, manual memberships, tenant records, and starter-pack assignment intent. It adds summary counts, status/type filters, multi-group/no-group organization visibility, recently assigned memberships, organization-centric group inspection, and read-only starter-pack assignment references for `future_contractor_group` keys.

Files changed in this pass:

- `apps/web/lib/platform-admin/contractor-group-observability-core.ts`
- `apps/web/lib/platform-admin/contractor-group-observability.test.ts`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior boundaries:

- Contractor groups remain platform segmentation metadata only.
- The observability model does not enforce entitlements, module access, pricing/packages, starter-pack auto-provisioning, contractor permissions, tenant defaults, runtime behavior, or tenant-owned template/catalog writes.
- `future_contractor_group` starter-pack references are displayed as read-only planning context; they do not auto-match beyond explicit membership and do not provision anything.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed after removing one unused local variable from the new pure read model.
- `git diff --check` passed with existing LF/CRLF normalization warnings only.

Browser QA:

- Opened `http://localhost:3000/super-admin/groups` in the in-app browser with an authenticated platform-admin session.
- Confirmed the page renders the platform-managed segmentation heading, summary tiles including memberships/no-group organizations, safety copy, status/type filters, organization-centric inspection, and starter-pack assignment reference sections.
- No entitlement, runtime, provisioning, default, permission, or tenant-owned record mutation behavior was exercised or added.

Recommended next prompt:

- "Run Phase 6D as contractor group operator/browser QA and live verification for the new read-only observability panels. Fix only defects found; do not add entitlement enforcement, auto-provisioning, pricing/package behavior, contractor permission behavior, or runtime behavior."

## Communications Typecheck Reconciliation

This narrow repair/reconciliation pass investigated the reported `pnpm typecheck` blocker in `apps/web/app/(app)/communications/page.tsx`.

Root cause classification:

- The prior failure was from intentional current communications upgrades that added canonical opportunity/lead communication support, plus stale type drift while that work was still being reconciled.
- The current branch already aligns `opportunity` across `CanonicalRecordSubjectType`, the lead communication migration, communication server actions, communication data loaders, contractor communication summary/list types, and the `/communications` source filter.
- No unsupported subject value was found in the current implementation.
- No broad revert was performed.

Evidence inspected:

- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/contractor-data.ts`
- `apps/web/lib/communications/data.ts`
- `packages/types/src/index.ts`
- `supabase/migrations/20260507180043_lead_communication_appointment_visibility.sql`
- Recent `docs/chat-handoff.md` notes for lead communication and customer-visible appointment foundations.

Current validation:

- `pnpm typecheck` passed.
- `pnpm --filter @floorconnector/web typecheck` passed directly through `tsc --project tsconfig.typecheck.json --noEmit`.
- No application code change was needed in this reconciliation pass because the current dirty branch already contains the intended type alignment.

Guardrails preserved:

- No migrations, new communication features, SMS/email sending, provider integration, AI, portal behavior change, financial/tax/payroll/entitlement change, starter-pack/provisioning change, contractor group behavior change, contractor navigation change, or broad refactor was added.

Recommended next prompt:

- "Implement Phase 6C contractor group read-model hardening and observability only. Summarize group memberships across organizations and starter-pack targeting previews without entitlement enforcement, auto-provisioning, pricing/package behavior, contractor permission changes, or runtime behavior."

## Super Admin Platform Console Phase 6B

Phase 6B completed contractor group operator QA and live-environment verification. The Phase 6A contractor groups migration was applied to the linked Supabase project during this pass, and browser QA confirmed `/super-admin/groups` plus starter-pack targeting preview behavior. No entitlement enforcement, module gating, pricing/package enforcement, starter-pack auto-provisioning, contractor-side permission behavior, tenant-owned template/catalog write, contractor navigation change, tax/payroll/financial change, invoice/contract generation change, user-preference behavior change, or runtime behavior was added.

Files changed in this pass:

- `docs/chat-handoff.md`

Migration/application status:

- `20260507173254_contractor_groups_foundation.sql` was local-only at the start of Phase 6B.
- `pnpm exec supabase db push --linked --yes` applied the migration to the linked Supabase project.
- `pnpm exec supabase migration list --linked` then showed `20260507173254 | 20260507173254 | 2026-05-07 17:32:54`.

Schema, constraint, RLS, and grant verification:

- Live service-role reads confirmed `contractor_groups` and `contractor_group_memberships` exist.
- Migration text confirms both tables enable and force RLS, revoke all broad `anon` / `authenticated` table grants, reference `public.companies(id)` for memberships, and keep platform-admin management server-side.
- Direct anon REST reads were denied for both group tables with `permission denied for table contractor_groups` and `permission denied for table contractor_group_memberships`.
- Direct authenticated REST denial was not independently verified because the local Playwright storage state did not expose a Supabase auth token; the migration still explicitly revokes direct `authenticated` table grants.
- Live constraint checks rejected invalid group status (`contractor_groups_status_check`), invalid group type (`contractor_groups_group_type_check`), invalid membership assignment source (`contractor_group_memberships_assignment_source_check`), and duplicate organization/group membership (`contractor_group_memberships_group_org_unique_idx`).
- Supabase CLI direct query introspection was blocked by linked DB password/pooler auth (`SUPABASE_DB_PASSWORD` / temp-role auth), and Supabase MCP SQL execution was denied for the project, so live verification used the app's server-side Supabase service client and safe REST denial checks.

Browser QA records:

- QA group: `Phase 6B QA Group 1778176931161`
- QA group key: `phase-6b-qa-1778176931161`
- QA group id: `d9f7ffef-14b6-4c0c-b852-20b40d655d16`
- Assigned/member organization for targeting preview: `platform (trialing)` / `e19c182b-923b-402d-996b-c4c20728a79f`
- Non-member organization for targeting preview: `QA Early Access (active)` / `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`
- Starter pack used for temporary targeting assignment: `Phase 5G QA Execution Pack` / `2a92b429-69bf-4b62-9574-345462e0dbe4`

Browser QA results:

- `/super-admin/groups` loaded for the authenticated platform-admin session.
- The page displayed the expected safety copy: "Platform segmentation only", "Contractor groups do not affect contractor permissions", and "Future entitlements".
- Created the QA contractor group, edited metadata, assigned `platform (trialing)`, saw the organization count update, removed the organization, and archived the group.
- Duplicate membership was rejected by the live unique constraint during direct constraint verification.
- A temporary `future_contractor_group` starter-pack assignment matched only the explicitly assigned member organization and showed the reason `explicitly assigned to active contractor group Phase 6B QA Group 1778176931161`.
- The non-member organization showed `not explicitly assigned to that group`.
- The temporary starter-pack assignment was deleted after preview QA. The QA group remains archived as evidence, with zero memberships.
- No starter-pack auto-provisioning occurred.

Count checks:

| Table | Before | After | Result |
| --- | ---: | ---: | --- |
| `contractor_groups` | 0 | 1 | QA group remains archived as evidence |
| `contractor_group_memberships` | 0 | 0 | Assignment was removed |
| `document_templates` | 4 | 4 | Unchanged |
| `catalog_items` | 9 | 9 | Unchanged |
| `platform_starter_pack_provisioning_runs` | 4 | 4 | Unchanged |
| `platform_starter_pack_provisioning_run_items` | 5 | 5 | Unchanged |

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 11 tests, 0 failures.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- `pnpm typecheck` failed during Phase 6B on communication page subject-type errors in `apps/web/app/(app)/communications/page.tsx` around `CanonicalRecordSubjectType | "all"` including `"opportunity"`. The follow-up Communications Typecheck Reconciliation pass above confirmed this was intentional communications type drift and that the current branch now typechecks.

Recommended next prompt:

- "First fix the unrelated communications typecheck blocker by aligning the communication subject filter types with `CanonicalRecordSubjectType` / supported filter values, then rerun typecheck. After validation is green, implement Phase 6C as contractor group read-model hardening and observability only: summarize group memberships across organizations and starter-pack targeting previews without entitlement enforcement, auto-provisioning, pricing/package behavior, or contractor permission changes."

## Super Admin Platform Console Phase 6A

Phase 6A is implemented as a Contractor Groups foundation/read-model pass. Contractor groups are platform-owned segmentation metadata for onboarding targeting, starter-pack targeting previews, rollout cohorts, beta programs, regional/trade segmentation, and future platform packaging. They are not tenant roles, contractor-owned permission groups, entitlements, pricing packages, module gates, or runtime behavior.

Files changed in this pass:

- `supabase/migrations/20260507173254_contractor_groups_foundation.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/platform-admin/starter-pack-targeting-core.ts`
- `apps/web/lib/platform-admin/starter-pack-targeting.test.ts`
- `apps/web/lib/platform-admin/contractor-groups.test.ts`
- `apps/web/components/contractor-group-manager.tsx`
- `apps/web/components/starter-pack-targeting-preview.tsx`
- `apps/web/components/platform-starter-pack-manager.tsx`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-review.md`

Implemented:

- Added `contractor_groups` and `contractor_group_memberships` with constrained status/type/source values, platform actor references, company references, timestamps, and one membership per organization/group.
- Enabled and forced RLS on both tables and revoked broad `anon` / `authenticated` grants. Platform-admin management stays behind the existing server-side platform role check and service-role-backed server utilities.
- Added platform-admin helpers/actions to list groups, create/update/archive groups, assign organizations, remove assignments, and list group memberships.
- Added `/super-admin/groups` with group metadata, status/type chips, organization counts, manual assignment/removal, and explicit "platform segmentation only" copy.
- Added contractor group membership context to `/super-admin/templates` Targeting Preview. `future_contractor_group` assignment intent now matches only explicit membership to the referenced group key and remains planning-only.

Guardrails preserved:

- No entitlement enforcement, module gating, pricing/package enforcement, starter-pack auto-provisioning, assignment enforcement, contractor permission change, contractor navigation change, tax/payroll/financial change, invoice/contract generation change, user preference behavior change, or runtime behavior was added.
- Contractor groups are separate from contractor organization membership roles and do not create a duplicate tenant-role system.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 6B as contractor-group operator QA and live-environment verification. Apply/verify the contractor-groups migration, confirm RLS/grants, browser-QA `/super-admin/groups`, verify starter-pack targeting preview reflects explicit group membership, and confirm no entitlement/runtime/provisioning/default behavior changed."
- [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md)
- [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- [docs/local-qa-auth-session-note.md](C:/FloorConnector/docs/local-qa-auth-session-note.md)
- [docs/qa-estimate-send-approval-contract-prerequisites.md](C:/FloorConnector/docs/qa-estimate-send-approval-contract-prerequisites.md)

## AI-Assisted Operating System Planning Docs

Documentation-only planning pass added target AI-assisted operating system direction.

New docs:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)
- [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md)

Updated planning/source docs now point to those files: `docs/developer-source-of-truth.md`, `docs/vision.md`, `docs/Roadmap.md`, `docs/sales-to-production.md`, `docs/target-ia.md`, `docs/system-overview.md`, and `docs/README.md`.

Future Codex sessions must treat these AI, communications, intake, calendar, scheduling, voice, onboarding, and support assistant docs as target planning only unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says a capability is implemented. Preserve the guardrails that AI is an operating layer, not a parallel system; communications attach to canonical records; FloorConnector owns the canonical schedule; external providers are adapters; and risky AI actions require human confirmation through approved workflows.

## Lead Communication And Customer-Visible Appointment UI

Lead detail UI and server-action wiring are implemented on top of the existing schema/data foundation from `20260507180043_lead_communication_appointment_visibility.sql`.

Files changed in this pass:

- `apps/web/app/(app)/leads/[leadId]/page.tsx`
- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/components/opportunity-communication-log-form.tsx`
- `apps/web/components/opportunity-follow-up-form.tsx`
- `apps/web/components/appointment-form.tsx`
- `apps/web/components/appointment-quick-create-form.tsx`
- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/schemas.ts`
- `apps/web/lib/appointments/actions.ts`
- `apps/web/lib/appointments/schemas.ts`
- `apps/web/lib/lead-communication-foundation.test.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented:

- Lead Workspace now includes a Communication & Follow-Up section.
- Contractors can log manual opportunity communication as call, email note, text note, voicemail, internal note, or appointment note.
- Manual lead communication defaults internal; customer-visible must be selected explicitly.
- Lead Workspace shows recent opportunity communication activity with kind, visibility, timestamp, actor type, and body.
- Lead Workspace can set, update, or clear `next_follow_up_at` and `next_follow_up_note`.
- Appointment Quick-Create and Appointment Workspace now expose customer-visible appointment controls plus separate internal appointment notes and customer-visible appointment notes.
- Focused schema coverage validates manual communication visibility/body rules, follow-up set/clear behavior, and appointment note/visibility parsing.

Still not implemented:

- portal appointment display
- portal message display
- provider-backed SMS/email/chat/voice
- Google/Outlook calendar sync
- AI drafting, summaries, scheduling, or receptionist behavior

Validation:

- `pnpm exec tsx --test apps/web/lib/lead-communication-foundation.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

## Login Entry Points And Post-Login Routing

The public homepage now includes explicit `Log in -> /login` entry points in the header and hero while preserving `Start early access -> /signup?next=/setup/company`.

Post-auth routing is centralized:

- safe internal `next` paths are honored, but `next=/super-admin` requires a real platform `platform_admin` role from `platform_user_roles`
- platform admins without an explicit `next` land on `/super-admin`
- contractor users with completed company setup land on `/dashboard`
- authenticated contractor users without completed company setup land on `/setup/company`

Focused regression coverage:

- `e2e/marketing-login.spec.js` verifies the marketing login and early-access CTAs
- `pnpm e2e:super-admin` regenerates contractor and platform storage states through the real `/login` flow; the platform setup now expects the default platform login to land on `/super-admin`

## Platform Super Admin Access Cleanup

Super-admin authorization now stays strictly on the platform role assignment layer:

- `/super-admin` and nested routes require a `platform_user_roles` assignment to the existing platform `platform_admin` role.
- Contractor organization roles (`owner`, `admin`, `manager`, `member`) do not imply super-admin access.
- The old first-visitor bootstrap behavior in the super-admin access helper was removed; visiting `/super-admin` no longer grants platform access when no assignments exist.
- First platform admin setup is explicit through `pnpm platform-admin grant <email>` or `PLATFORM_SUPER_ADMIN_EMAIL` plus `pnpm platform-admin grant`.
- `jfilamonte@gmail.com` is intended to remain a normal contractor owner/test account, not a platform operator. Use `pnpm platform-admin revoke jfilamonte@gmail.com` and `pnpm platform-admin status jfilamonte@gmail.com` to verify it has no platform role while retaining contractor membership.
- The helper requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; it does not create contractor organizations or memberships.
- `platform@floorconnector.com` is the intended local platform operator account, but it must sign up or log in through the normal Supabase Auth flow once before the grant script can find it in `public.users`.
- Focused Playwright coverage now lives in `e2e/super-admin-access.spec.js` with the `chromium-super-admin-access` project and `pnpm e2e:super-admin`. It uses contractor auth from `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD` and platform auth from `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`.

Manual QA checklist:

- Sign in as the configured platform admin and open `/super-admin`; confirm the platform admin surface loads.
- Sign in as `jfilamonte@gmail.com` or another contractor-only owner and open `/super-admin`; confirm it redirects to `/dashboard?error=Platform+admin+access+is+required.`.
- As the contractor-only account, open normal contractor routes such as `/dashboard`, `/projects`, and `/settings`; confirm contractor access still works.
- Run `pnpm platform-admin status jfilamonte@gmail.com` and confirm `Platform roles: none`.

Latest verification note:

- `platform@floorconnector.com` now exists as a real auth/canonical user and `pnpm platform-admin status platform@floorconnector.com` confirms `Platform roles: platform_admin`.
- After real login, the existing auth bootstrap may also create a normal contractor owner membership for the platform account; that membership is not required for `/super-admin` and does not grant platform access.
- `pnpm platform-admin status jfilamonte@gmail.com` confirms `Platform roles: none` and contractor membership `jfilamonte: owner (active)`.
- `.env.local` includes the local-only dual-account Playwright variables for `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD` and `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`.
- `jfilamonte@gmail.com` completed the real `/setup/company` flow through the app UI during verification so contractor route-continuity checks can reach `/dashboard`, `/projects`, and `/settings`.
- `pnpm e2e:super-admin` passes and generates both local auth storage states through the real login flow.

## Super Admin Platform Console Phase 1

Phase 1 of the super-admin platform console UI pass is complete as a presentation-layer/configuration-clarity pass.

Files changed in this pass:

- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`
- `apps/web/app/(super-admin)/super-admin/admin/page.tsx`
- `apps/web/components/super-admin-console.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/platform-template-seed-card.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- The existing super-admin left-side navigation remains in place.
- Target super-admin areas now have lightweight top tab navigation for local orientation.
- The overview and platform defaults surfaces explain platform defaults, contractor-owned copies, future organization overrides, and future user preferences more explicitly.
- Platform financial defaults and workflow defaults now use the shared save-state form/button pattern: unchanged forms show `Saved`, dirty forms show `Save`, submitting shows `Saving...`, and successful saves return to a saved state after the existing action redirect.
- Starter templates are grouped by estimate, invoice, and contract with save-state feedback on existing starter-template actions.
- Starter catalogs are grouped by item type with clearer seed counts and save-state feedback on existing catalog-seed actions.
- Module controls now render as an admin policy matrix over the existing platform feature-policy records instead of a loose card stack.
- Platform admin keeps tenant status actions and wraps tenant numbering edits in the shared save-state pattern.
- Future capability placeholders are labeled non-functional for template assignments, starter packs, contractor groups, entitlements, tax profiles, and platform operations/errors.

Guardrails preserved:

- no database migrations
- no new tables
- no RLS changes
- no schema, workflow, financial, tax, payroll, entitlement-enforcement, contractor navigation, or canonical data-model changes
- existing platform admin role checks, data access functions, and server actions remain the write path

Phase 2 recommendation:

- Build the configuration resolver as an explicit read model before adding enforcement: platform default -> contractor-owned setting/copy -> future organization override -> future user preference.
- Keep resolver output inspectable in super admin before any entitlement or tenant-runtime enforcement work.

## Super Admin Platform Console Phase 2A

Phase 2A is implemented as a read-model and inspection pass only. It adds a typed server-side configuration resolution preview for current platform defaults, selected contractor-owned settings/copies, and clearly labeled future layers.

Files changed in this pass:

- `apps/web/lib/platform-admin/configuration-resolution.ts`
- `apps/web/components/super-admin-console.tsx`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- `/super-admin/platform` now has a `Resolution Preview` tab/section.
- Platform admins can inspect platform-only resolution or select an existing tenant from platform tenant oversight data.
- The resolver returns inspectable objects with key, label, category, effective value, source layer, source id, inherited/contractor-owned flags, future-user-override flag, and explanatory notes.
- Current implemented layers are platform defaults, organization-owned financial/workflow settings when present, organization-owned default document templates, adopted platform template seed copies, and adopted platform catalog item copies.
- Future organization override registry, user preferences, and record snapshots are visible as non-functional placeholders only.

Guardrails preserved:

- No migrations, new tables, RLS changes, entitlement enforcement, tax/payroll logic, financial calculations, estimate/invoice/contract generation behavior, contractor navigation, starter packs, contractor groups, tax profiles, user preferences, or runtime flags were added.
- Existing platform admin role checks and existing platform/organization/template/catalog tables remain the source of truth.

Testing note:

- No unit test was added because the repo currently has Playwright specs but no stable lightweight unit-test harness for server utilities.

Recommended Phase 2B:

- Add user-level preference planning and read-model stubs only after deciding the exact preference scope, storage model, and precedence rules. Keep it inspectable in super admin first, with no runtime enforcement until the resolver contract is reviewed.

## Super Admin Platform Console Phase 2B

Phase 2B is implemented as the first narrow real user-preference foundation.

Files changed in this pass:

- `supabase/migrations/20260506194133_user_estimate_template_preferences.sql`
- `apps/web/lib/user-preferences/estimate-template-preference.ts`
- `apps/web/components/preferred-estimate-template-card.tsx`
- `apps/web/app/(app)/settings/profile/page.tsx`
- `apps/web/lib/settings/actions.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/platform-admin/configuration-resolution.ts`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `apps/web/components/super-admin-console.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- Active contractor users can set or reset a personal preferred estimate document template from `/settings/profile`.
- The preference can only point to an active organization-owned estimate template visible in the current organization.
- The preference is stored separately from organization template defaults and never mutates the company default template.
- Estimate Quick-Create stores the user's valid preferred template on the new estimate's existing `template_id`; if no preference exists, the existing organization/default-template behavior remains unchanged.
- Existing estimates, contracts, invoices, approved snapshots, taxes, payroll, entitlements, module controls, and workflow enforcement are not changed.
- `/super-admin/platform` Resolution Preview can inspect the real user-preference layer when a tenant and user are selected. Other user preference layers remain future placeholders.

Security/RLS:

- `user_estimate_template_preferences` is tenant-owned by `organization_id` and `user_id`.
- RLS allows authenticated users to read, insert, update, and delete only their own preference in an organization where they are active members.
- Normal user preference reads/writes use the regular Supabase server client, not service-role shortcuts.
- Platform-admin inspection remains through existing platform-admin server paths.

Testing note:

- No focused unit test was added because the repo still does not have a stable lightweight unit-test harness for server utilities. Validation used typecheck, lint, and diff whitespace checks.

Recommended Phase 2C:

- Add a small resolver contract test or test harness for configuration resolution before broadening user preferences. Keep Phase 2C limited to review/QA unless the next preference scope is explicitly approved.

## Super Admin Platform Console Phase 2C

Phase 2C is implemented as a hardening and verification pass only. No new preference types or product features were added.

Files changed in this pass:

- `apps/web/lib/user-preferences/estimate-template-preference-core.ts`
- `apps/web/lib/user-preferences/estimate-template-preference.ts`
- `apps/web/lib/user-preferences/estimate-template-preference.test.ts`
- `apps/web/lib/platform-admin/configuration-resolution-core.ts`
- `apps/web/lib/platform-admin/configuration-resolution.ts`
- `apps/web/lib/platform-admin/configuration-resolution.test.ts`
- `apps/web/lib/estimates/data.ts`
- `supabase/migrations/20260506194133_user_estimate_template_preferences.sql`
- `docs/chat-handoff.md`

Verification added:

- A minimal Node/tsx server-utility test path now covers pure configuration/preference behavior without needing a browser session or live Supabase data.
- Preference validation coverage confirms active same-organization estimate templates are accepted, cross-organization templates are rejected, inactive templates are rejected, and non-estimate templates are rejected.
- Quick-Create template resolution coverage confirms a valid personal preference returns the template id, while no preference or invalid stored preference resolves to `null` so existing company/default behavior remains in place.
- Resolver coverage confirms source-layer reporting for platform default, organization-owned default, real user preference, and the inspectable fallback state when no user is selected.

Security/RLS review:

- The migration still uses a one-purpose table rather than a generic preference blob.
- RLS remains scoped to `authenticated`, active organization membership, and `user_id = auth.uid()`.
- The policies now explicitly require `auth.uid()` to be non-null.
- Insert/update policies still require the preferred template to be an active same-organization estimate template.
- Normal user preference reads/writes continue to use the regular Supabase server client; platform-admin inspection remains on existing platform-admin server paths.
- Server helper persistence errors now return generic user-safe messages instead of forwarding database error detail.

Validation:

- `pnpm exec tsx --test apps/web/lib/user-preferences/estimate-template-preference.test.ts apps/web/lib/platform-admin/configuration-resolution.test.ts` passes.
- `pnpm typecheck`, `pnpm lint`, and `git diff --check` were run for the pass.

Recommended next prompt:

- "Implement Phase 2D as a docs-and-operator verification pass for applying the new migration in the target Supabase environment and manually QAing `/settings/profile` plus `/super-admin/platform` against real tenant data. Do not add new preference types."

## Super Admin Platform Console Phase 2D

Phase 2D is complete as an operator/live-environment verification pass with one narrow security/UI fix. No new preference types or product features were added.

Files changed in this pass:

- `apps/web/lib/settings/actions.ts`
- `supabase/migrations/20260506213000_tighten_user_estimate_template_preference_grants.sql`
- `docs/chat-handoff.md`

Migration/application status:

- `20260506194133_user_estimate_template_preferences.sql` was not yet applied to the linked remote Supabase project at the start of this pass.
- `pnpm exec supabase db push --linked --dry-run` showed only `20260506194133_user_estimate_template_preferences.sql` pending, then `pnpm exec supabase db push --linked --yes` applied it.
- A follow-up grants-only hardening migration, `20260506213000_tighten_user_estimate_template_preference_grants.sql`, was added and applied after live metadata showed broader inherited/default table privileges than this narrow preference table needs.
- Live migration list now shows both `20260506194133` and `20260506213000` applied locally and remotely.

Live schema/RLS/security checks:

- Live table metadata confirms `public.user_estimate_template_preferences` exists with RLS enabled and forced.
- Live policy metadata confirms the four intended policies exist: select, insert, update, and delete own preference.
- Insert/update policy text confirms active membership, `user_id = auth.uid()`, same-organization template, `template_type = 'estimate'`, and `status = 'active'` checks.
- Live grants now show only `authenticated` with `DELETE, INSERT, SELECT, UPDATE`; `anon` has no table privileges.
- An unauthenticated/anon read attempt is blocked with Postgres error code `42501`.
- Authenticated write spot-check blocked a same-organization active non-estimate template with error code `42501`.
- Cross-organization active estimate and same-organization inactive estimate spot-checks were skipped because the live QA dataset did not contain candidate records.

Browser QA:

- Browser MCP was not exposed in this session, so authenticated UI QA used Playwright against the already-running local app at `http://localhost:3000`.
- Contractor QA user id: `e839f92c-fc0d-403b-beef-8fac2e0dce5a`.
- Contractor organization id: `865f87c3-376e-4d89-8d2c-ed4132264719`.
- Estimate template used: `Default Estimate Template` (`0ab37a74-e9bd-4b06-8c63-6ad66a0b29a4`).
- Project context used for Quick-Create: `Demo Warehouse Floor` (`a4bbe66f-5c62-41a3-a13a-178189a17492`).
- `/settings/profile` displays `Your estimate template preference` for the active contractor user.
- Saving the template now shows the shared save-state behavior and persists after reload.
- Resetting to company default deletes the preference row and persists after reload.
- Quick-Create with a saved preference created estimate `3366` (`96b50651-e526-4ae7-9bbf-25c45f01894c`) and stored `template_id = 0ab37a74-e9bd-4b06-8c63-6ad66a0b29a4`.
- Quick-Create after reset created estimate `3367` (`9a675a78-d518-4e85-915c-c76244f7dc83`) and preserved the existing no-preference baseline, `template_id = null`.
- Dataset caveat: this organization currently has one active estimate template, so the preferred-template path and any company-default template are not visually distinguishable by name. The database check distinguishes preference-on (`template_id` stored) from preference-reset baseline (`template_id = null`).
- `/super-admin/platform?tenantId=865f87c3-376e-4d89-8d2c-ed4132264719&userId=e839f92c-fc0d-403b-beef-8fac2e0dce5a#resolution-preview` renders Resolution Preview, `User preferred estimate template`, real personal preference language while the preference is saved, and future/non-functional layer language.

Bug fixes made:

- The preference server action now returns through the shared save-state form instead of redirecting on success/error, so the button can show `Saved`, `Save`, and `Saving...` correctly.
- A grants-only migration revokes table privileges from `anon` and reduces `authenticated` privileges to CRUD on the preference table.

Validation:

- `pnpm exec tsx --test apps/web/lib/user-preferences/estimate-template-preference.test.ts apps/web/lib/platform-admin/configuration-resolution.test.ts` passes, 8/8.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes with existing LF-to-CRLF warnings only.

Recommended next prompt:

- "Implement Phase 4A template governance/starter packs as a platform-admin governance pass over existing template seed/adoption models. Do not add entitlement enforcement, tax profiles, payroll, or duplicate template models."

## Super Admin Platform Console Phase 4A

Phase 4A is implemented as the first real template governance / starter pack foundation. Starter packs are platform-owned bundles over existing platform template seeds and platform catalog item seeds only; they are inspectable and manageable in super admin, but they do not provision tenant records or change runtime behavior.

Files changed in this pass:

- `supabase/migrations/20260506223000_platform_starter_packs.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/platform-admin/configuration-resolution.ts`
- `apps/web/lib/platform-admin/configuration-resolution-core.ts`
- `apps/web/components/platform-starter-pack-manager.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Schema:

- `platform_starter_packs` stores platform pack metadata: `pack_key`, name, description, status (`draft`, `published`, `archived`), optional `segment_key`, audit users, and timestamps.
- `platform_starter_pack_items` stores pack membership rows referencing either one existing `platform_template_seeds.id` or one existing `platform_catalog_item_seeds.id`.
- Constraints enforce valid item types, exactly one seed reference per item row, non-negative sort order, and no duplicate template/catalog seed inside the same pack.
- The schema is relational and does not duplicate template, catalog, tax, billing, entitlement, or contractor settings models.

Security/RLS:

- RLS is enabled and forced on both starter-pack tables.
- `anon` and `authenticated` table privileges are revoked.
- Platform pack reads/writes go through existing platform-admin server paths using the existing explicit platform-admin role check before service-role-backed data access.
- Contractor organizations cannot mutate platform starter packs through normal tenant-scoped routes, and no tenant-owned templates/catalog items are touched by pack actions.

UI:

- `/super-admin/templates` now includes a `Starter Packs` top tab/section.
- Platform admins can create starter packs, edit pack metadata/status, add existing platform template seeds, add existing platform catalog item seeds, and remove pack items.
- `/super-admin/catalogs` now points starter-pack management back to Super Admin Templates and states that packs do not provision tenant catalog items.
- `/super-admin/platform` Resolution Preview includes starter packs as inspectable platform-governed bundles only; starter packs do not affect default resolution.

Manual QA:

- Migration `20260506223000_platform_starter_packs.sql` was applied to the linked remote Supabase target after `supabase db push --linked --dry-run` showed only that migration pending.
- Live metadata confirmed both starter-pack tables have RLS enabled and forced, and no `anon`/`authenticated` grants.
- Authenticated UI QA used the platform-admin account against `http://localhost:3000`.
- QA pack: `Phase 4A QA Starter Pack 1778108719396` / `phase-4a-qa-1778108719396` / id `e80832dd-7b20-4598-a713-3c26868e0081`.
- Added template seed `Default Estimate Template` (`02321564-adb5-4c99-9ec4-370d8680683b`) and catalog seed `Resinous Basecoat` (`b212540b-6875-4039-8071-2dd1ced731fc`), confirmed grouping/count display, removed one item, and archived the pack.
- Contractor-owned `document_templates` count stayed `3` before/after, and contractor-owned `catalog_items` count stayed `8` before/after.
- Transient debug QA packs created during verification were removed; the archived QA pack remains as the auditable Phase 4A record with one remaining catalog-seed item.

Validation:

- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes with existing LF-to-CRLF warnings only.

Guardrails preserved:

- No estimate creation behavior, template adoption behavior, catalog adoption behavior, contractor organization templates/catalog items, entitlements, tax profiles, payroll, runtime flags, financial calculations, invoice/contract generation behavior, or user preference behavior changed.

Recommended next prompt:

- "Implement Phase 4B starter-pack assignment planning as an inspectable platform-admin read model for future contractor groups and onboarding profiles. Do not auto-provision packs, enforce entitlements, or mutate contractor-owned templates/catalog items."

## Super Admin Platform Console Phase 4B

Phase 4B is implemented as a starter-pack assignment planning/read-model foundation. Assignment intent is platform-owned metadata that says who a starter pack may target later; it does not provision tenant records or change runtime behavior.

Files changed in this pass:

- `supabase/migrations/20260506224500_platform_starter_pack_assignments.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/components/platform-starter-pack-manager.tsx`
- `apps/web/components/super-admin-console.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/lib/platform-admin/configuration-resolution.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Schema/security:

- New table: `platform_starter_pack_assignments`.
- Supported assignment types: `all_organizations`, `organization`, `onboarding_profile`, `region`, `trade_segment`, `plan_tier`, and `future_contractor_group`.
- Supported statuses: `draft`, `active`, and `inactive`.
- Constraints require organization assignments to reference `companies.id`, non-organization keyed assignments to provide `assignment_key`, and all-organizations assignments to have no organization/key target.
- Partial unique indexes prevent duplicate active assignment intent for the same pack/type/target where practical.
- RLS is enabled and forced; `anon` and `authenticated` table privileges are revoked.
- Platform assignment reads/writes go through existing platform-admin server paths behind the existing platform-admin role check before service-role-backed data access.

UI/read model:

- `/super-admin/templates` Starter Packs now includes an Assignment intent section per pack.
- Platform admins can add all-organizations, organization-specific, onboarding-profile, region/state, trade-segment, plan-tier, and future-contractor-group assignment intent; edit status/label/notes; and remove intent rows.
- Organization assignment uses existing platform tenant oversight data from `companies`; no new tenant-management model was added.
- `/super-admin/platform` Resolution Preview now shows starter-pack assignment intent counts as planning-only context. Assignment intent does not affect effective configuration.

Manual QA:

- Migration `20260506224500_platform_starter_pack_assignments.sql` was applied to the linked remote Supabase target after dry run showed only that migration pending.
- Live metadata confirmed `platform_starter_pack_assignments` has RLS enabled and forced, and no `anon`/`authenticated` grants.
- Authenticated UI QA used the platform-admin account against `http://localhost:3000`.
- QA pack reused: `Phase 4A QA Starter Pack 1778108719396` / `phase-4a-qa-1778108719396` / id `e80832dd-7b20-4598-a713-3c26868e0081`.
- Created an active all-organizations assignment intent, changed it to inactive, and removed it.
- Created an active region assignment intent for `TX`, confirmed target-key display, and removed it.
- Created a draft organization assignment intent using the existing tenant selector, confirmed display, and removed it.
- Confirmed `/super-admin/platform` Resolution Preview renders assignment intent counts.
- Contractor-owned `document_templates` count stayed `3`, contractor-owned `catalog_items` count stayed `8`, and `estimates` count stayed `15`; no contractor-owned templates/catalog items or estimates were changed.
- QA assignment rows were removed after verification; the Phase 4A archived QA pack remains with zero assignment intents.

Validation:

- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes.

Guardrails preserved:

- No auto-provisioning, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, duplicate template/catalog/settings models, or contractor navigation changes were added.

Recommended next prompt:

- "Implement Phase 4C starter-pack assignment resolver preview as a read-only targeting explainer. It should calculate which planning assignments would match a selected organization by existing company fields and labels only, without provisioning, entitlement enforcement, contractor groups, or runtime behavior changes."

## Super Admin Platform Console Phase 4C

Phase 4C is implemented as a read-only starter-pack assignment targeting explainer. It evaluates existing assignment intent against selected organization metadata so platform admins can see why a pack would match before any provisioning/enforcement workflow exists.

Files changed in this pass:

- `apps/web/lib/platform-admin/starter-pack-targeting-core.ts`
- `apps/web/lib/platform-admin/starter-pack-targeting.test.ts`
- `apps/web/components/starter-pack-targeting-preview.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/lib/platform-admin/data.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- `/super-admin/templates` now includes a `Targeting Preview` top tab/section below the Starter Packs manager.
- Platform admins can select an existing organization from tenant oversight data and inspect matched, not matched/possible, and unavailable starter-pack assignment intent.
- Matching rules are deterministic and read-only:
  - `all_organizations` matches active organizations.
  - `organization` matches exact `organization_id`.
  - `region` uses the selected company's active location `state_region` when available.
  - `trade_segment` uses `companies.primary_trade` when available.
  - `plan_tier` uses current subscription plan key/name when available.
  - `onboarding_profile` remains unavailable because no durable onboarding profile field exists.
  - `future_contractor_group` remains unavailable because contractor groups do not exist.
- The preview returns and displays organization metadata, matched/unmatched/unavailable pack groups, assignment-level reasons, and explicit planning-only copy.

Manual QA:

- Authenticated UI QA used the platform-admin account against `http://localhost:3000`.
- QA pack reused: `Phase 4A QA Starter Pack 1778108719396` / `phase-4a-qa-1778108719396` / id `e80832dd-7b20-4598-a713-3c26868e0081`.
- Created active all-organizations, organization-specific, and future-contractor-group assignment intents through the UI.
- Selected active organization `QA Early Access` / `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1` and confirmed:
  - all-organizations intent matched because the organization is active
  - organization-specific intent matched the selected organization
  - future contractor group displayed as planning-only/unavailable
- Selected non-target organization `platform` / `e19c182b-923b-402d-996b-c4c20728a79f` and confirmed the organization-specific intent did not match.
- Removed the QA assignment rows after verification.
- Contractor-owned `document_templates` count stayed `3`, contractor-owned `catalog_items` count stayed `8`, and `estimates` count stayed `15`; no contractor-owned templates/catalog items or estimates were changed.
- The archived Phase 4A QA pack remains with zero assignment intents after cleanup.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passes.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes.

Guardrails preserved:

- No migrations, new tables, RLS changes, auto-provisioning, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference behavior changes, or duplicate template/catalog/settings models were added.

Recommended next prompt:

- "Implement Phase 4D starter-pack provisioning plan review as a read-only dry-run report. It should show exactly which template/catalog seed copies would be created for a selected organization if provisioning were later approved, but it must not write tenant-owned templates/catalog items or change defaults."

## Super Admin Platform Console Phase 4D

Phase 4D is implemented as a read-only starter-pack provisioning dry-run report. It explains what organization-owned document template and catalog item copies would be created from a selected starter pack for a selected organization, without writing tenant-owned records or adding any provisioning action.

Files changed in this pass:

- `apps/web/lib/platform-admin/starter-pack-provisioning-dry-run-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-dry-run.test.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/lib/platform-admin/data.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- `/super-admin/templates` now includes a `Dry Run` top tab/section below the Targeting Preview.
- Platform admins can select an existing organization and starter pack, then inspect read-only summary counts for templates to create, catalog items to create, already adopted items, blocked items, and unavailable seed references.
- Item rows show source seed type/id/name, destination record type, action, source status/type/category, exact or conservative match type, matching organization-owned record id when detected, and reason text.
- Template seed matching prefers exact `source_seed_id` / `source_seed_key` linkage on organization-owned `document_templates`; when no linkage exists it uses conservative normalized matching by template type and name.
- Catalog seed matching prefers exact `source_seed_id` / `source_seed_key` linkage on organization-owned `catalog_items`; when no linkage exists it uses conservative normalized matching by item type, category, and name.
- Inactive platform seeds are marked blocked. Missing seed references are marked unavailable.
- Draft or archived starter packs show an explicit warning, but remain inspectable because this is a dry run only.

Validation and QA:

- Focused dry-run utility coverage added with the existing Node/tsx harness.
- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-dry-run.test.ts` passes.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes with the existing LF-to-CRLF working-copy warnings only.
- Authenticated browser QA used the platform-admin account against `http://localhost:3000`.
- QA organization reused: `QA Early Access` / `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`.
- QA starter pack reused: `Phase 4A QA Starter Pack 1778108719396` / `phase-4a-qa-1778108719396` / id `e80832dd-7b20-4598-a713-3c26868e0081`, currently archived.
- Opened `/super-admin/templates?dryRunOrganizationId=b434be1d-2340-4fd9-95e4-43b2a3c5e9c1&dryRunStarterPackId=e80832dd-7b20-4598-a713-3c26868e0081` and confirmed:
  - `Starter-pack copy impact report` rendered
  - `Dry run only. No contractor-owned records are created.` rendered
  - archived-pack warning rendered
  - dry-run action rows rendered
  - no button named `Provision`, `Apply`, or `Copy to organization` was present
  - no browser console errors were captured
- Remote Supabase count check before and after browser QA stayed `document_templates = 3` and `catalog_items = 8`, confirming this pass did not write tenant-owned template/catalog records.

Guardrails preserved:

- No migrations, new tables, RLS changes, tenant-owned writes, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference behavior changes, or duplicate template/catalog/settings models were added.

Recommended next prompt:

- "Implement Phase 4E starter-pack provisioning approval design as a planning/safety spec only. Define the future server-side guardrails, audit requirements, conflict handling, and rollback strategy for eventual provisioning, but do not add a provisioning action yet."

## Super Admin Platform Console Phase 4E

Phase 4E is complete as a planning/specification pass only. It defines the future starter-pack provisioning safety model before any real tenant-owned writes are introduced.

Files changed in this pass:

- `docs/starter-pack-provisioning-plan.md`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/README.md`

Planning/spec behavior:

- Added `docs/starter-pack-provisioning-plan.md` as the future approval design for starter-pack provisioning.
- The plan defines the future workflow, operator approval requirements, dry-run review requirements, server-side guardrails, transaction boundaries, audit run/item model, idempotency strategy, conflict handling, rollback/void strategy, partial failure handling, permissions, service-role boundary guidance, tenant-owned record creation rules, snapshot requirements, source seed lineage requirements, draft/archived/published pack rules, and pre-release tests.
- At the time of Phase 4E, the plan explicitly said it was not implemented behavior and that no provisioning action, provisioning run table, audit table, rollback action, background job, entitlement enforcement, tenant-owned write, or template/catalog copy behavior existed yet. Phase 5A now adds the audit schema only; provisioning actions and tenant-owned writes remain unimplemented.
- `/super-admin/templates` Dry Run area now includes a non-functional information panel pointing operators to the future approval design and repeating that the current surface is inspect-only.

Implementation checklist before any future real provisioning action:

- Add provisioning run and item audit schema with RLS/grant review.
- Keep the server action behind the existing platform-admin role check before service-role data access.
- Rebuild the dry run server-side immediately before approval writes.
- Require a fresh dry-run fingerprint and reject stale approval.
- Block draft and archived packs.
- Block approval when dry-run rows are `blocked` or `unavailable`.
- Create only `would_create` rows and skip already-adopted/equivalent rows.
- Store source seed lineage on every created tenant-owned record.
- Preserve existing organization defaults, existing organization-owned templates/catalog items, estimates, invoices, contracts, taxes, payroll, entitlements, modules, and workflow settings.
- Prove transaction, idempotency, retry, partial failure, and void behavior before enabling a production action.

Validation required for the future provisioning implementation:

- unit coverage for draft/archived block, clean published approval, stale dry-run rejection, source-linkage skip, conservative-match skip, created-record lineage, unchanged organization defaults, no unrelated business-record changes, retry idempotency, transaction rollback, platform-admin allow, and contractor-only reject
- browser QA confirming explicit confirmation copy, no single-click provisioning, audit result visibility, and no hidden background retry
- remote Supabase migration status verification before any production run

Guardrails preserved:

- No migrations, new tables, RLS changes, tenant-owned writes, actual provisioning action, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference behavior changes, duplicate template/catalog/settings models, provisioning persistence, rollback action, or background jobs were added during Phase 4E. Phase 5A later adds only the audit schema.

Recommended next prompt:

- "Implement Phase 5A starter-pack provisioning audit schema only. Add run/item audit tables and RLS/grants for future provisioning, but do not add a provisioning action or tenant-owned writes."

## Super Admin Platform Console Phase 5A

Phase 5A is implemented as starter-pack provisioning audit schema only. It adds durable future run/item audit tables and read-only super-admin visibility, but no approval, execution, rollback, background job, or tenant-owned write path exists.

Files changed in this pass:

- `supabase/migrations/20260507001940_platform_starter_pack_provisioning_audit.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`

Schema added:

- `platform_starter_pack_provisioning_runs` references `platform_starter_packs` and `companies`, stores requested/approved actor references, status, dry-run snapshot, confirmation text, idempotency key, lifecycle timestamps, error message, and timestamps.
- `platform_starter_pack_provisioning_run_items` references a provisioning run, optional starter-pack item, one matching template or catalog source seed, destination record type/id, action, status, source/destination snapshots, reason/error, and timestamps.
- Constraints keep template seed rows paired with `document_template`, catalog seed rows paired with `catalog_item`, require exactly one matching source seed reference, validate run/item statuses and actions, require JSON object snapshots, and keep idempotency keys unique when present.

RLS/grants:

- RLS is enabled and forced on both audit tables.
- Broad `anon` and `authenticated` grants are revoked.
- No client write path, server action, approval action, provisioning action, rollback action, or background job was added.
- Future platform-admin writes must still go through the planned platform-admin server path after explicit role checks.

UI/read helper:

- Added read-only `listRecentStarterPackProvisioningRuns()` for platform-admin server rendering.
- `/super-admin/templates` Dry Run area now shows a read-only Provisioning Audit Foundation panel with recent run rows when they exist, or an empty state explaining that no approval/execution exists yet.
- No create/approve/run/provision/copy/void button was added.

Validation status:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Remote Supabase dry run showed `20260507001940_platform_starter_pack_provisioning_audit.sql` pending, then `pnpm exec supabase db push --linked --yes` applied it.
- Remote `schema_migrations` contains version `20260507001940`.
- Remote metadata confirms both audit tables have RLS enabled and forced.
- Remote grant check returned no `anon` or `authenticated` table grants for either audit table.
- Remote count check returned `provisioning_runs = 0`, `provisioning_run_items = 0`, `document_templates = 3`, and `catalog_items = 8`; tenant-owned template/catalog counts matched the pre-migration check.
- `git diff --check` passed with the existing LF-to-CRLF working-copy warnings only.

Guardrails preserved:

- No real provisioning action, tenant-owned writes, template/catalog copying, dry-run approval action, contractor default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, duplicate template/catalog/settings models, or background jobs were added.

Recommended next prompt:

- "Implement Phase 5B starter-pack provisioning approval draft/read model. Let platform admins create an approval draft from a fresh dry run into the audit tables, but do not execute provisioning or write tenant-owned template/catalog records."

## Super Admin Platform Console Phase 5B

Phase 5B is implemented as a starter-pack provisioning approval draft/read-model pass. Platform admins can create a durable draft audit run from a fresh server-side dry run, but the draft is not approved, not executed, and not provisioning.

Files changed in this pass:

- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-draft.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `packages/types/src/index.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`

Behavior:

- `/super-admin/templates` Dry Run area now includes `Create approval draft`.
- The action requires the existing platform-admin role check before service-role data access.
- The server action accepts only organization id and starter pack id, then recomputes the dry run server-side at submit time.
- Missing organizations, missing starter packs, draft packs, archived packs, empty packs, blocked dry-run rows, and unavailable dry-run rows are rejected.
- Clean published-pack dry runs create one `platform_starter_pack_provisioning_runs` row with status `draft` and matching `platform_starter_pack_provisioning_run_items` rows.
- `would_create` rows become draft item action/status `would_create` / `pending`.
- `already_exists` rows become `skipped_existing` / `skipped`.
- Draft item rows keep `destination_record_id = null` because nothing is created.
- A stable draft idempotency key prevents duplicate drafts for repeated submission by the same operator against the same organization, starter pack, and dry-run fingerprint.
- The Provisioning Audit panel lists recent draft/runs with pack, organization, status, and item count.

Manual QA:

- QA organization: `QA Early Access` / `b434be1d-2340-4fd9-95e4-43b2a3c5e9c1`.
- QA starter pack: `Phase 4A QA Starter Pack 1778108719396` / `e80832dd-7b20-4598-a713-3c26868e0081`.
- The QA starter pack was temporarily set from archived to published to create one approval draft through the authenticated `/super-admin/templates` UI, then restored to archived.
- Created draft run `80afd530-e4fd-42c6-b1d6-2b47b618623f` with status `draft` and one audit item.
- Draft item `6bdddc41-b066-40d0-866d-24e1fc6e1a6a` mirrors the dry-run catalog seed row as `would_create` / `pending`, has `destination_record_id = null`, and references source catalog seed `b212540b-6875-4039-8071-2dd1ced731fc`.
- Browser QA confirmed the created draft banner renders and no enabled button named approve, run, execute, provision, copy to organization, rollback, or void appears.
- After restoring the pack to archived, browser QA confirmed `Create approval draft` is disabled for that archived pack.
- Remote count check after QA returned `document_templates = 3`, `catalog_items = 8`, `provisioning_runs = 1`, and `provisioning_run_items = 1`; tenant-owned template/catalog counts did not change.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-dry-run.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft.test.ts` passes.
- `pnpm typecheck` passes.
- `pnpm lint` passes after tightening one Supabase response id cast.
- `git diff --check` passes with the existing LF-to-CRLF working-copy warnings only.

Guardrails preserved:

- No tenant-owned `document_templates` writes, tenant-owned `catalog_items` writes, provisioning execution, approval execution, rollback/void action, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, duplicate template/catalog/settings models, or client/browser service-role usage were added.

Recommended next prompt:

- "Implement Phase 5C starter-pack provisioning approval review hardening. Add read-only draft detail inspection and stale-dry-run comparison, but do not approve, execute, provision, copy tenant records, or add rollback."

## Super Admin Platform Console Phase 5C

Phase 5C is implemented as starter-pack provisioning draft review hardening. Platform admins can inspect an existing draft audit run against a fresh server-side dry run, but there is still no approval, execution, provisioning, copy, rollback, or void behavior.

Files changed in this pass:

- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-review-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`

Behavior:

- `/super-admin/templates` Provisioning Audit rows now include a read-only `Review` link.
- The review loads the stored provisioning run header/items, target organization, starter pack, and a fresh current dry run rebuilt through the existing dry-run read model.
- The review reports freshness as `fresh`, `stale`, `invalid`, or `unavailable`.
- Issue rows are labeled `info`, `warning`, or `blocking`.
- Item comparisons are labeled `unchanged`, `changed`, `missing_from_current`, `added_in_current`, or `invalid_now`.
- Stale checks cover pack status, organization/pack identity, item count, source ids/types, actions, already-existing destination matches, and blocked/unavailable source state.
- The UI copy explicitly says review is inspection only and does not approve, execute, provision, copy, roll back, void, or mutate contractor-owned records.

Testing:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts` passes.
- Coverage includes fresh draft, archived-pack invalidation, removed item, added item, action changed from `would_create` to `already_exists`, and source seed unavailable.

Guardrails preserved:

- No migrations, new tables, RLS/grant changes, tenant-owned writes, approval action, execution/provisioning action, rollback/void action, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, duplicate template/catalog/settings models, or client/browser service-role usage were added.

Recommended next prompt:

- "Implement Phase 5D starter-pack provisioning approval gate design or audit-only approval status transition, but do not execute provisioning or create contractor-owned template/catalog copies."

## Super Admin Platform Console Phase 5D

Phase 5D is implemented as an audit-only provisioning approval gate. Platform admins can mark a fresh, non-blocking draft provisioning run as `approved` for future execution only; no execution/provisioning/copy/rollback/void behavior exists.

Files changed in this pass:

- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-review-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`

Behavior:

- `/super-admin/templates` Provisioning Audit review now shows an `Approve audit draft` control for draft runs only.
- The approval form requires typing `APPROVE DRY RUN ONLY` exactly.
- The server action recomputes the Phase 5C draft review at submit time and approves only when the run is `draft`, the starter pack is still `published`, freshness is `fresh`, there are no blocking issues, and the run has at least one item.
- Approval updates only the provisioning run header audit fields: `status`, `approved_by`, `approved_at`, and `confirmation_text`.
- Approved runs display approved metadata and remain explicitly labeled as future-execution audit records only.
- No run items are updated and no `destination_record_id` is set by approval.

Testing:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-dry-run.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts` passes.
- Approval eligibility coverage includes fresh draft allowed, stale draft blocked, invalid draft blocked, non-draft status blocked, blocking issue blocked, missing confirmation blocked, and exact confirmation accepted.

Manual/remote QA notes:

- Browser QA was not rerun in this pass.
- Read-only remote count check returned `document_templates = 3`, `catalog_items = 8`, `provisioning_runs = 1`, `provisioning_run_items = 1`, and `run_items_with_destination = 0`; no tenant-owned template/catalog copy or destination record linkage was created by this pass.

Guardrails preserved:

- No migrations, new tables, RLS/grant changes, tenant-owned writes, execution/provisioning action, rollback/void action, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, duplicate template/catalog/settings models, or client/browser service-role usage were added.

Recommended next prompt:

- "Implement Phase 5E starter-pack provisioning execution design and transaction/RPC plan only. Use the approved audit run model to specify execution guardrails, but do not add execution, tenant-owned writes, or copy behavior yet."

## Super Admin Platform Console Phase 5E

Phase 5E is complete as a planning/specification pass only. It defines the future starter-pack provisioning execution design for approved audit runs, but it does not add execution, tenant-owned writes, copy behavior, an RPC, a server action, a background job, or a provisioning button.

Files changed in this pass:

- `docs/starter-pack-provisioning-plan.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Design summary:

- Future execution preconditions are now explicit: run must be `approved`, target organization must still exist/eligible, starter pack must still be `published`, Phase 5C review must still be `fresh`, no blocking issues may exist, run items must still match the current dry run, and destination ids must remain unset unless a later idempotent-resume design is implemented.
- Actor boundaries are platform-admin only, server-side only, and never client/service-role exposed.
- The recommended future split is a server action that validates platform-admin access and fresh review, then calls a private/unexposed Postgres RPC such as `private.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_user_id uuid)`.
- The recommended transaction model locks the approved run and its items, transitions `approved -> running`, creates tenant-owned copies, updates audit item outcomes/destination ids, and transitions to `completed`, `completed_with_warnings`, or `failed` in one transaction.
- Document template copy rules specify existing `document_templates` fields, source seed lineage, active non-default copy behavior, and no default mutation.
- Catalog item copy rules specify existing `catalog_items` fields, source seed lineage, active non-default copy behavior, vendor-reference caution, and no tax/estimate/invoice behavior changes.
- Audit update rules, idempotency/replay protection, status transitions, concurrency locking, rollback/void posture, partial failure handling, operations/error visibility, and pre-release QA gates are now spelled out.

Guardrails preserved:

- No migrations, new tables, RLS/grant changes, tenant-owned writes, execution/provisioning action, RPC/function implementation, provisioning button, rollback/void action, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, or duplicate template/catalog/settings models were added.

Validation:

- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes with existing LF/CRLF warnings only.

Recommended next prompt:

- "Implement Phase 5F starter-pack provisioning execution RPC/server-action readiness review. Before writing execution code, verify destination table constraints, source-lineage uniqueness, transaction feasibility, and exact copy field mappings against the live Supabase schema. Return an implementation plan and do not add tenant-owned writes yet."

## Super Admin Platform Console Phase 5F

Phase 5F is complete as a provisioning execution readiness review only. It verifies the live schema, source-lineage fields, destination copy mappings, uniqueness assumptions, audit schema readiness, and transaction/RPC feasibility for a future starter-pack provisioning execution implementation.

Files changed in this pass:

- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/chat-handoff.md`

Readiness verdict:

- Ready with caveats.
- No schema blocker was found for a first conservative execution implementation.
- The first real execution pass should still be platform-admin-only, server-side only, and implemented through one transaction/private RPC or an equivalent atomic boundary.

Live/read-only inspection:

- `platform_template_seeds`, `document_templates`, `platform_catalog_item_seeds`, `catalog_items`, `platform_starter_pack_provisioning_runs`, and `platform_starter_pack_provisioning_run_items` columns were inspected through linked Supabase metadata.
- Destination lineage fields exist on both destination tables: `document_templates.source_seed_id/source_seed_key` and `catalog_items.source_seed_id/source_seed_key`.
- Live uniqueness indexes exist for destination source lineage: `document_templates_company_seed_unique_idx` and `catalog_items_company_seed_unique_idx`.
- Phase 4D dry-run matching already uses the same source-lineage fields future execution should use.
- Audit run/item tables support the needed run statuses, item statuses/actions, snapshots, and `destination_record_id`.

Caveats to resolve in the implementation prompt:

- Decide whether catalog `sort_order` copies seed order or appends after the organization's current max sort order.
- Treat platform catalog seed `vendor_id` as null unless same-tenant/reference safety is explicitly proven.
- Generate destination `created_by`, `updated_by`, timestamps, normalized catalog fields, and `tax_code_id` intentionally rather than copying them blindly.
- Decide whether skipped existing rows keep `destination_record_id = null` or store matched existing ids with clear destination-snapshot semantics.
- Keep failed pre-write execution status behavior explicit: either leave the run `approved` or mark it `failed` outside the rolled-back tenant-write transaction.

Validation:

- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `git diff --check` passes with existing LF/CRLF warnings only.

Guardrails preserved:

- No migrations, new tables, RLS/grant changes, execution/provisioning action, RPC/function implementation, tenant-owned writes, template/catalog copying, contractor-default changes, estimate/catalog behavior changes, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference changes, or duplicate template/catalog/settings models were added.

Recommended next prompt:

- "Implement Phase 5G starter-pack provisioning execution as the first real guarded execution slice. Use a private/unexposed transaction/RPC, require an approved fresh run, create only missing tenant-owned document_templates/catalog_items from source seeds, update audit items, and keep all financial/tax/payroll/entitlement/workflow behavior unchanged."

## Super Admin Platform Console Phase 5G

Phase 5G is implemented as the first guarded starter-pack provisioning execution slice. This is the first pass that can create tenant-owned copies, and it is intentionally limited to one approved, fresh, non-blocking provisioning audit run at a time.

Files changed in this pass:

- `supabase/migrations/20260507025730_starter_pack_provisioning_execution.sql`
- `apps/web/lib/platform-admin/starter-pack-provisioning-execution-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`

Behavior:

- Added private function `private.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid)` and locked-down public wrapper `public.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid)` for the existing Supabase RPC path.
- The wrapper is granted to `service_role` only; `anon` and `authenticated` do not have execute privilege.
- The platform-admin server action requires existing platform-admin access, recomputes the Phase 5C review server-side, requires the run to be `approved`, fresh, published-pack, non-blocking, and requires exact confirmation `EXECUTE STARTER PACK`.
- Execution locks the run and run items, transitions `approved -> running -> completed`, creates only missing organization-owned `document_templates` and `catalog_items`, stores `source_seed_id/source_seed_key`, updates item actions to `created` / `completed`, and sets `destination_record_id`.
- Completed runs are idempotent: rerunning the same completed run returns an already-completed result and creates no duplicate tenant records.
- Catalog copies append after the organization's current max `sort_order`, do not copy `vendor_id`, set `tax_code_id = null`, set `status = active`, and set `is_default = false`.
- Document template copies set `status = active`, `is_default = false`, and preserve platform template seed lineage.
- Skipped existing audit rows remain skipped and store a matched destination id when the approved snapshot includes a valid same-organization match.

Manual QA:

- Migration `20260507025730_starter_pack_provisioning_execution.sql` was applied to the linked Supabase target.
- Function privilege check confirmed both private and public execution functions are not executable by `anon` or `authenticated`, and are executable by `service_role`.
- QA organization: `qa-early-access-1778025789203` / `b049ad3d-5066-44a8-b114-441c0eb9514e`.
- QA starter pack: `Phase 5G QA Execution Pack` / `2a92b429-69bf-4b62-9574-345462e0dbe4`.
- QA run: `9251e67b-97ca-43f4-a01a-17dbd7196c8c`.
- Before execution for the QA organization: `document_templates = 0`, `catalog_items = 0`, `provisioning_runs = 0`, `provisioning_run_items = 0`.
- Execution result: `completed`, `createdTemplateCount = 1`, `createdCatalogItemCount = 1`, `skippedCount = 0`.
- After execution for the QA organization: `document_templates = 1`, `catalog_items = 1`, `provisioning_runs = 1`, `provisioning_run_items = 2`.
- Created document template lineage: `source_seed_id = 02321564-adb5-4c99-9ec4-370d8680683b`, `source_seed_key = default-estimate-v1`, `status = active`, `is_default = false`.
- Created catalog item lineage: `source_seed_id = 0da1057e-cb6b-4ade-9c6f-9201e8f66cf3`, `source_seed_key = diamond-grinding-prep-v1`, `status = active`, `is_default = false`, `vendor_id = null`, `tax_code_id = null`, `sort_order = 10`.
- Run item audit rows both ended `action = created`, `status = completed`, with non-null `destination_record_id`.
- Re-running the completed run returned `alreadyCompleted = true`; counts remained `document_templates = 1`, `catalog_items = 1`, and `runItemsWithDestination = 2`.
- Linked Supabase CLI checks hit intermittent pooler temp-role auth/circuit-breaker failures during parallel follow-up queries; final lineage/idempotency verification was completed through the app's server-side service-role Supabase client without printing secrets.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-dry-run.test.ts` passes.
- `pnpm typecheck` passes.
- `pnpm lint` pending for this session.
- `git diff --check` pending for this session.

Guardrails preserved:

- No broad provisioning beyond approved audit run execution, unapproved run execution, draft run execution, stale run execution, rollback/void action, entitlements, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference behavior changes, contractor navigation changes, duplicate template/catalog/settings models, default mutation, catalog `vendor_id` copying, or client/browser service-role exposure was added.

Recommended next prompt:

- "Implement Phase 5H starter-pack provisioning post-execution hardening. Add focused tests/QA for stale approved-run rejection, draft-run rejection, skipped-existing destination id handling, and UI review of completed runs. Do not add rollback/void or assignment-based auto-provisioning."

## Super Admin Platform Console Phase 5H

Phase 5H is complete as a post-execution hardening and QA pass over the existing Phase 5G guarded starter-pack provisioning execution path.

Files changed in this pass:

- `apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`

Tests added/updated:

- execution eligibility now covers fresh approved execution, stale review rejection, unavailable review rejection, invalid review rejection, draft-run rejection, completed-run UI/action ineligibility, blocking review issue rejection, missing/wrong confirmation rejection, create item with destination id rejection, and skipped-existing item eligibility
- static migration guard coverage verifies the Phase 5G execution function returns completed runs idempotently before insert work, stores destination ids for created and skipped items, keeps provisioned records active but not defaults, and leaves copied catalog `vendor_id` / `tax_code_id` null

UI hardening:

- completed provisioning run review still shows completed status and destination counts
- item-level review rows now also show the audit item action/status and `destination_record_id` when the selected run item has a created or skipped destination reference
- the execute control remains limited to approved runs with fresh/non-blocking review state; completed runs do not show the execute form
- rollback/void remains explicitly unavailable

Server-path QA:

- QA organization: `qa-early-access-1778025789203` / `b049ad3d-5066-44a8-b114-441c0eb9514e`
- QA starter pack: `Phase 5G QA Execution Pack` / `2a92b429-69bf-4b62-9574-345462e0dbe4`
- rejected draft run: `9ebf7f20-13a4-4d58-8cf2-8c335900b876`
- rejected stale approved run: `904391d6-0285-4e0f-a238-a27d41b55d74`
- before rejected attempts: `document_templates = 1`, `catalog_items = 1`
- draft execution attempt failed safely with `Only approved provisioning runs can be executed.`
- stale approved attempt failed safely with `Template seed is already linked to an organization-owned template. Rerun dry-run review.`
- after rejected attempts: `document_templates = 1`, `catalog_items = 1`
- rejected draft run remained `draft` with no `started_at` or `completed_at`
- rejected stale approved run remained `approved` with no `started_at` or `completed_at`

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-dry-run.test.ts` was run for this pass.
- `pnpm typecheck`, `pnpm lint`, and `git diff --check` should be rerun before handoff completion if this section is being read mid-turn.

Guardrails preserved:

- No rollback/void action, new provisioning feature, assignment enforcement, entitlement behavior, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference behavior changes, contractor navigation changes, duplicate template/catalog/settings models, defaults mutation, catalog `vendor_id` copying, or client/browser service-role exposure was added.

Recommended next prompt:

- "Implement Phase 5I starter-pack provisioning operator observability as a read-only operations/errors panel for completed/rejected/failed provisioning audit runs. Do not add rollback/void, assignment-based auto-provisioning, or new tenant-owned write behavior."

## Super Admin Platform Console Phase 5I

Phase 5I is implemented as read-only operator observability over the existing starter-pack provisioning audit run history. It does not add new execution behavior, rollback, void, rejected-attempt persistence, tenant-owned writes, or assignment enforcement.

Files changed in this pass:

- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-observability-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`

Behavior:

- The `/super-admin/templates` Provisioning Audit area now shows observability summary counts for total, draft, approved, completed, failed, attention-needed, destination-linked, and last completed run state.
- Audit filters cover all, draft, approved, completed, failed, and attention-needed runs.
- Recent runs show read-only health chips for draft, approved, completed, failed, needs-review, stale, and execution-unavailable states.
- Run summaries include item outcome counts, destination-link counts, safe error messages when present, and review links.
- Selected run review now surfaces request/approval/start/completion timestamps, item action/status totals, destination ids, and item-level reason/error copy.
- Rejected execution attempts are not persisted as a separate operations table yet; the UI surfaces stored failed run state and live review blockers only.

Tests added:

- `apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts` covers completed run summaries, draft/approved counts, stale review attention state, safe failed-run display, and blocking review health mapping.

Guardrails preserved:

- No migrations, new tables, RLS/grant changes, tenant-owned writes, rollback/void action, new provisioning execution behavior, assignment enforcement, entitlement behavior, contractor groups, tax profiles, payroll, runtime flags, financial calculation changes, invoice/contract generation changes, user-preference behavior changes, contractor navigation changes, duplicate template/catalog/settings models, or client/browser service-role exposure were added.

Manual QA notes:

- Browser QA should confirm `/super-admin/templates` shows the Provisioning Audit summary, filters work, completed run review has no execute control, destination ids are visible, and no rollback/void/provision-copy controls were added.
- Rejected attempts should still be checked by count comparisons when operator credentials and a QA run are available; this pass itself adds no rejected-attempt write logging.

Recommended next prompt:

- "Implement Phase 5J starter-pack provisioning operations/rejected-attempt audit logging. Add a narrow server-side operations log for rejected execution attempts and surfaced blockers without adding rollback/void, assignment enforcement, or new tenant-owned writes."

## Super Admin Platform Console Phase 5J

Phase 5J is implemented as narrow operations/rejected-attempt audit logging for starter-pack provisioning execution attempts. It does not add rollback, void, new provisioning behavior, assignment enforcement, or tenant-owned writes from rejected attempts.

Files changed in this pass:

- `supabase/migrations/20260507035025_platform_starter_pack_provisioning_attempts.sql`
- `packages/types/src/index.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-attempts-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-attempts.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`

Behavior:

- New table `platform_starter_pack_provisioning_attempts` stores server-side `execute` attempts with outcomes `rejected`, `blocked`, `failed_before_execution`, and `already_completed`.
- The execute action logs schema-validation failures such as missing/wrong confirmation and invalid run id before redirecting.
- The execute server utility logs run-load failures, stale/non-fresh eligibility failures, blocking review issues, database guard rejections, and completed-run no-op attempts using safe messages.
- Successful executions remain represented by `platform_starter_pack_provisioning_runs` and `platform_starter_pack_provisioning_run_items`; they are not duplicated into the attempt log.
- `/super-admin/templates` Provisioning Audit now includes a read-only Operation Attempts section with attempted time, run/pack/org labels where available, outcome, reason code, safe message, run status, and review status.

Security/RLS:

- Attempt logging table has RLS enabled and forced.
- Broad `anon` and `authenticated` table grants are revoked.
- Platform-admin read/write remains server-side through existing platform-admin checks and service-role server utilities.
- Attempt metadata is intentionally small and safe: no secrets, raw provider errors, raw database details, or template/catalog payloads.

Tests added:

- `apps/web/lib/platform-admin/starter-pack-provisioning-attempts.test.ts` covers missing confirmation, invalid run id, stale review, blocking review issue, already-completed no-op, and safe database-guard message mapping.

Manual QA notes:

- After applying the migration in the target Supabase environment, attempt execution with a wrong confirmation and with a draft/stale run, then confirm attempts appear in `/super-admin/templates`.
- Confirm `document_templates` and `catalog_items` counts do not change for rejected attempts.
- Confirm completed/idempotent paths still do not duplicate tenant-owned records.
- Confirm no retry, rollback, void, assignment enforcement, or new provisioning controls appear.

Recommended next prompt:

- "Implement Phase 5K starter-pack provisioning operations QA. Apply the Phase 5J attempts migration in the target Supabase environment, verify RLS/grants, perform browser QA for wrong-confirmation and stale/draft execution attempts, and confirm tenant-owned template/catalog counts stay unchanged."

## Super Admin Platform Console Phase 5K

Phase 5K is complete as an operator QA and live-environment verification pass for Phase 5J rejected/no-op provisioning attempt logging. No rollback, void, assignment enforcement, new provisioning behavior, or rejected-attempt tenant-owned writes were added.

Migration/application status:

- `pnpm exec supabase migration list --linked` initially showed local migration `20260507035025_platform_starter_pack_provisioning_attempts.sql` pending remotely.
- `pnpm exec supabase db push --linked --dry-run` confirmed only `20260507035025_platform_starter_pack_provisioning_attempts.sql` would be applied.
- `pnpm exec supabase db push --linked --yes` applied the migration to the linked Supabase project.
- A follow-up dry run reported `Remote database is up to date`.
- `supabase_migrations.schema_migrations` now contains version `20260507035025`.

Live RLS/grant verification:

- `public.platform_starter_pack_provisioning_attempts` exists.
- `pg_class.relrowsecurity = true`.
- `pg_class.relforcerowsecurity = true`.
- `information_schema.role_table_grants` returned no direct `anon` or `authenticated` grants for the attempts table.
- Platform-admin visibility remains through the existing server-side platform-admin data path.

QA records used:

- QA organization: `qa-early-access-1778025789203` (`b049ad3d-5066-44a8-b114-441c0eb9514e`).
- Starter pack: `Phase 5G QA Execution Pack` (`2a92b429-69bf-4b62-9574-345462e0dbe4`, published).
- Approved stale run: `904391d6-0285-4e0f-a238-a27d41b55d74`.
- Draft run: `9ebf7f20-13a4-4d58-8cf2-8c335900b876`.
- Completed run: `9251e67b-97ca-43f4-a01a-17dbd7196c8c`.

Operator QA completed:

- Refreshed the platform-admin browser session through the real `/login` fallback email/password path using local QA credentials from `.env.local`; no secrets were printed.
- `/super-admin/templates` renders the Provisioning Audit Operation Attempts section for the platform admin.
- Wrong-confirmation execution attempt was rejected and logged with reason `missing_or_invalid_confirmation`; after the fix below, the attempt row includes run, starter pack, organization, and run-status context.
- Draft-run execution attempt was blocked and logged with reason `run_not_approved`.
- Stale approved-run execution attempt was blocked and logged with reason `review_not_fresh`.
- Completed-run no-op attempt was logged with outcome `already_completed`; no duplicates were created.
- The normal UI already disables/hides execution controls for stale, draft, and completed states. For server-side rejection QA, the existing execute form was submitted through browser DOM instrumentation so the server action could prove it blocks those paths; this did not bypass server validation or write tenant-owned records.
- Operation Attempts UI shows safe reason/message text only and includes no retry, rollback, void, assignment-enforcement, provision-copy, or raw service-error controls.

Before/after counts for QA organization:

- Before rejected/no-op attempts: `document_templates = 1`, `catalog_items = 1`, `platform_starter_pack_provisioning_attempts = 0`.
- After rejected/no-op attempts and one wrong-confirmation retest after the context-label fix: `document_templates = 1`, `catalog_items = 1`, `platform_starter_pack_provisioning_attempts = 6`.
- Run status spot-check after QA: approved run remained `approved` with no `started_at` / `completed_at`; draft run remained `draft`; completed run remained `completed`.

Defect fixed:

- Valid run-id schema-validation failures, such as wrong execution confirmation, previously logged only `run_id`, causing the Operation Attempts UI to show unknown starter pack/organization labels. `executeStarterPackProvisioningRunAction` now loads the run context for valid run ids before writing the attempt row and stores starter pack id, organization id, and run status when available.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-attempts.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`

Recommended next prompt:

- "Implement Phase 5L as a rollback/void design pass only for completed starter-pack provisioning runs. Define void eligibility, downstream-usage checks, archive-vs-retain rules, audit requirements, and UI copy, but do not add a void action, rollback action, new tables, or tenant-owned writes."

## Super Admin Platform Console Phase 5L

Phase 5L is complete as a rollback/void design pass only for completed starter-pack provisioning runs. No rollback action, void action, schema, migration, RLS/grant change, tenant-owned write, archive, delete, detach-lineage behavior, assignment enforcement, or new provisioning behavior was added.

Files changed:

- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/chat-handoff.md`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`

Design summary:

- Rollback is treated as an operator request that must resolve into an explicit strategy; it is not an automatic undo.
- Void is defined as an audit state, not automatic deletion, archive, or lineage removal.
- Archive is a real tenant-owned mutation and must require usage checks.
- Detach lineage is deferred because source lineage is also used for dry-run duplicate detection and operator explainability.
- Hard delete is not recommended because provisioned templates/catalog items become contractor-owned records that may be referenced by canonical workflow records.

Recommended first safe void strategy:

- audit-only void first
- allow only `completed` / `completed_with_warnings` runs with destination records into void review
- require platform-admin role, explicit confirmation, impacted-record review, and a safe reason
- update only provisioning audit state in the first implementation
- leave contractor-owned `document_templates` and `catalog_items` untouched

Future usage checks documented:

- document templates: estimates, invoices, contracts, approved estimate snapshots, organization workflow default contract template, user estimate-template preferences, active defaults, and future generated-document snapshots
- catalog items: estimate lines, invoice lines, approved estimate snapshot items, catalog system components, floor-system template components, inventory links, active defaults, and future material/job-cost/production records

Future void blockers/caveats:

- current run schema supports `voided` and `voided_at`, and item rows support `voided`, but there is no `voided_by`, `void_reason`, `void_strategy`, or durable usage-check snapshot field yet
- audit-only void likely needs a small audit metadata migration for operator-grade actor/reason reporting
- archive/detach strategies require centralized usage helper coverage before implementation
- skipped-existing records must never be archived as part of a provisioning-run void because the run did not create them

UI copy:

- Completed provisioning run review now explicitly says void/rollback is not implemented and that future action requires usage checks.
- No button, form, disabled control, server action, or mutation path was added.

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with LF-to-CRLF working-copy warnings only

Recommended next prompt:

- "Implement Phase 5M as rollback/void readiness utilities only. Add pure read-model helpers and tests that compute template/catalog usage for completed provisioning run destinations, but do not add a void action, schema, tenant writes, archive/delete/detach behavior, or UI mutation control."

## Super Admin Platform Console Phase 5M

Phase 5M is implemented as rollback/void readiness utilities only. No rollback action, void action, schema, migration, RLS/grant change, tenant-owned write, archive, delete, detach-lineage behavior, assignment enforcement, default change, or new provisioning behavior was added.

Files changed:

- `apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `docs/current-state.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/chat-handoff.md`

Read-only behavior added:

- `buildStarterPackProvisioningVoidReadiness` computes item-level usage status for completed provisioning run destinations: `unused`, `used`, `unknown`, or `missing_destination`.
- The model reports audit-only void readiness, archive-unused readiness, blocking usage count, warning count, usage source counts, and item-level reasons.
- `getStarterPackProvisioningRunUsage(runId)` loads a run and counts current same-organization references for linked destination ids.
- `/super-admin/templates` completed-run review shows a `Void readiness usage check` panel with read-only status, counts, and source usage. It includes no void, rollback, archive, delete, detach, or mutation controls.

Usage sources counted:

- document templates: `estimates.template_id`, `invoices.template_id`, `contracts.template_id`, `estimate_commercial_snapshots.template_id`, `organization_workflow_settings.approved_estimate_contract_template_id`, `user_estimate_template_preferences.preferred_estimate_template_id`, and active default templates
- catalog items: `estimate_line_items.catalog_item_id`, `invoice_line_items.catalog_item_id`, `estimate_commercial_snapshot_items.catalog_item_id`, `catalog_system_components.system_catalog_item_id`, `catalog_system_components.component_catalog_item_id`, `floor_system_template_components.catalog_item_id`, `inventory_items.catalog_item_id`, and active default catalog items

Conservative decisions:

- used destination records block archive-unused readiness
- unknown usage blocks archive-unused readiness
- missing created destination ids or destination records block archive-unused readiness
- skipped-existing destinations are warnings because the run did not create those records and must not archive them as part of future void work
- non-completed runs cannot be considered for audit-only void or archive-unused readiness

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts` passed
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with LF-to-CRLF working-copy warnings only

Manual QA status:

- Browser QA was not run in this pass before handoff text was updated. If a completed run is available, verify `/super-admin/templates?reviewRunId=<completed-run-id>#starter-pack-provisioning-dry-run` shows the read-only usage panel and no void/rollback/archive/delete/detach controls.

Recommended next prompt:

- "Implement Phase 5N as a rollback/void readiness QA pass. Verify the Phase 5M read-only usage panel against a completed provisioning run, record template/catalog counts before and after review, confirm no mutation controls exist, and fix only read-only display or counting defects."

## Super Admin Platform Console Phase 5N

Phase 5N completed the operator QA pass for the Phase 5M read-only void-readiness panel. No rollback action, void action, schema change, migration, RLS/grant change, tenant-owned write, archive, delete, detach-lineage behavior, default change, or new provisioning behavior was added.

Files changed:

- `docs/chat-handoff.md`

QA records used:

- completed provisioning run: `9251e67b-97ca-43f4-a01a-17dbd7196c8c`
- starter pack id: `2a92b429-69bf-4b62-9574-345462e0dbe4`
- organization id: `b049ad3d-5066-44a8-b114-441c0eb9514e`
- run status: `completed`
- run item summary before UI review: 2 total items, 2 linked destinations, 2 created actions

Before counts:

- `document_templates`: 4
- `catalog_items`: 9
- `platform_starter_pack_provisioning_runs`: 4
- `platform_starter_pack_provisioning_run_items`: 5

Browser QA:

- In-app Browser reached the local login page for `/super-admin/templates`, but the local email-submit interaction did not progress in that browser surface. The authenticated UI QA was completed with Chromium using the repo's existing `playwright/.auth/platform-admin.json` platform-admin storage state against the same running localhost app.
- Opened `/super-admin/templates?reviewRunId=9251e67b-97ca-43f4-a01a-17dbd7196c8c#starter-pack-provisioning-dry-run`.
- Confirmed the completed provisioning run review loaded without redirecting to `/login`.
- Confirmed `Void readiness usage check` appears for the completed run.
- Confirmed the panel shows `Read only`, audit-only void review status, archive-unused review status, blocking usage count, warning count, item-level `UNUSED` statuses, and destination ids.
- Confirmed completed-run review still shows linked destination ids and completed-run context.
- Confirmed Provisioning Audit observability remains visible with summary counts, filters, run health chips, and operation attempts.
- Confirmed no void, rollback, archive, delete, detach, or execute mutation button is visible for the completed run.

After counts:

- `document_templates`: 4
- `catalog_items`: 9
- `platform_starter_pack_provisioning_runs`: 4
- `platform_starter_pack_provisioning_run_items`: 5

Security/behavior spot-check:

- The Phase 5M panel is rendered from `getStarterPackProvisioningRunUsage(runId)` and the pure `buildStarterPackProvisioningVoidReadiness` model.
- No new server action was added for void readiness.
- No tenant-owned tables changed during the QA pass.
- Existing unrelated platform-admin utilities still include other mutation paths, but no void/rollback/archive/delete/detach mutation path exists for provisioning run review.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts` passed: 25 tests
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with LF-to-CRLF working-copy warnings only

Recommended next prompt:

- "Implement Phase 5O as audit-only void schema planning or minimal audit metadata foundation for completed starter-pack provisioning runs. Do not add a void action yet; define or add only the metadata needed for a future audit-only void review, including actor, reason, strategy, and durable usage snapshot requirements."

## Super Admin Platform Console Phase 5O

Phase 5O adds the audit-only void metadata foundation for completed starter-pack provisioning runs. It adds durable run-header metadata fields and read-only super-admin visibility only. No void action, rollback action, archive/delete/detach behavior, tenant-owned write, default change, or new provisioning behavior was added.

Files changed:

- `supabase/migrations/20260507150044_platform_starter_pack_provisioning_void_metadata.sql`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Migration:

- `20260507150044_platform_starter_pack_provisioning_void_metadata.sql`

Schema summary:

- Adds `voided_by uuid` referencing `public.users(id)` for a future audit-only void actor.
- Adds `void_reason text` for a future operator-safe reason.
- Adds constrained `void_strategy text` supporting `audit_only`, `archive_unused_future`, and `detach_lineage_future`.
- Adds `void_readiness_snapshot jsonb not null default '{}'::jsonb` for future usage/readiness evidence.
- Preserves/adds `voided_at` idempotently.
- Adds coherence checks so `voided` runs require `voided_at` plus `void_strategy`, and any populated `voided_at` requires a strategy.
- Re-enables/forces RLS and revokes broad `anon` / `authenticated` grants on the run table.

UI/read-model behavior:

- Platform-admin data mapping now exposes void metadata fields on provisioning run details.
- `/super-admin/templates` selected-run review shows a read-only `Void metadata foundation` panel.
- The panel states the future first strategy is audit-only and that no void action exists; it includes no button, form, or mutation control.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts` passed: 37 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Manual verification:

- `pnpm exec supabase migration new platform_starter_pack_provisioning_void_metadata` created `20260507150044_platform_starter_pack_provisioning_void_metadata.sql`.
- `pnpm exec supabase migration list --linked` showed the migration pending before apply.
- `pnpm exec supabase db push --linked --yes` applied the migration to the linked Supabase project; Supabase CLI noted `voided_at` already existed and skipped that idempotent column add.
- `pnpm exec supabase migration list --linked` then showed `20260507150044` applied remotely.
- Live service-role read confirmed the new run columns can be selected: `voided_at`, `voided_by`, `void_reason`, `void_strategy`, and `void_readiness_snapshot`.
- Before counts: `document_templates` 4, `catalog_items` 9, `platform_starter_pack_provisioning_runs` 4, `platform_starter_pack_provisioning_run_items` 5.
- After counts: `document_templates` 4, `catalog_items` 9, `platform_starter_pack_provisioning_runs` 4, `platform_starter_pack_provisioning_run_items` 5.
- RLS/grant posture is preserved in the migration by forcing RLS on `platform_starter_pack_provisioning_runs` and revoking broad `anon` / `authenticated` grants. Direct live catalog introspection was not available in this session: the Supabase MCP SQL tool rejected the metadata query for permissions, and `supabase db dump --linked --schema public` requires Docker, which is not available in this Windows environment.
- Browser QA with the existing `playwright/.auth/platform-admin.json` storage state opened `/super-admin/templates?reviewRunId=9251e67b-97ca-43f4-a01a-17dbd7196c8c#starter-pack-provisioning-dry-run`, confirmed `Void metadata foundation`, `Metadata only`, and `No void action exists here` are visible, and found no void/rollback/archive/delete/detach mutation controls.

Recommended next prompt:

- "Implement Phase 5P as operator QA/live-environment verification for the Phase 5O audit-only void metadata migration and read-only UI. Verify columns, constraints, RLS/grants, completed-run review copy, and unchanged tenant-owned counts; fix only defects."

## Super Admin Platform Console Phase 5P

Phase 5P completed operator QA and live-environment verification for the Phase 5O audit-only void metadata foundation. No defects were found, and no code, schema, RLS/grant, tenant-owned write, void action, rollback action, archive/delete/detach behavior, default change, or new provisioning behavior was added.

Files changed:

- `docs/chat-handoff.md`

QA records used:

- completed provisioning run: `9251e67b-97ca-43f4-a01a-17dbd7196c8c`
- route checked: `/super-admin/templates?reviewRunId=9251e67b-97ca-43f4-a01a-17dbd7196c8c#starter-pack-provisioning-dry-run`
- linked Supabase project ref: `jcnoraopbwdhshcmplgb`

Migration verification:

- `pnpm exec supabase migration list --linked` confirmed `20260507150044` is present locally and remotely.
- Live metadata query confirmed `platform_starter_pack_provisioning_runs` has:
  - `voided_by uuid nullable`
  - `void_reason text nullable`
  - `void_strategy text nullable`
  - `void_readiness_snapshot jsonb not null default '{}'::jsonb`
  - `voided_at timestamptz nullable`
- Live row read for `9251e67b-97ca-43f4-a01a-17dbd7196c8c` confirmed the new void metadata fields can be selected and the run remains `completed` with no stored void metadata.

Constraint verification:

- Live `pg_constraint` query confirmed:
  - `platform_starter_pack_provisioning_runs_void_strategy_check`
  - `platform_starter_pack_provisioning_runs_void_reason_check`
  - `platform_starter_pack_provisioning_runs_void_snapshot_check`
  - `platform_starter_pack_provisioning_runs_void_metadata_check`
- The strategy check constrains values to `audit_only`, `archive_unused_future`, and `detach_lineage_future`.
- The metadata check requires `voided` rows to have `voided_at` plus `void_strategy`, and any populated `voided_at` to have a strategy.

RLS/grant verification:

- Live `pg_class` query confirmed `relrowsecurity = true` and `relforcerowsecurity = true` for `platform_starter_pack_provisioning_runs`.
- Live `information_schema.role_table_grants` query returned no direct grants for `anon` or `authenticated` on `platform_starter_pack_provisioning_runs`.
- Platform-admin access remains server-side through the existing super-admin data loaders/actions; no client/browser direct write path was added.

Before counts:

- `document_templates`: 4
- `catalog_items`: 9
- `platform_starter_pack_provisioning_runs`: 4
- `platform_starter_pack_provisioning_run_items`: 5

Browser QA:

- Used the existing `playwright/.auth/platform-admin.json` platform-admin storage state against the running localhost app.
- Opened `/super-admin/templates?reviewRunId=9251e67b-97ca-43f4-a01a-17dbd7196c8c#starter-pack-provisioning-dry-run`.
- Confirmed completed-run review loaded for the selected run.
- Confirmed `Void metadata foundation` appears.
- Confirmed the panel explains no void action exists and that contractor-owned templates/catalog items are not changed.
- Confirmed `Provisioning audit` observability still renders.
- Confirmed `Operation attempts` still renders.
- Confirmed `Void readiness usage check` still renders.
- Confirmed completed-run review still shows `2 linked destination ids` and item-level `DESTINATION ID` labels.
- Confirmed no void, rollback, archive, delete, or detach button/input/textarea mutation controls exist. Broad page selects still include normal starter-pack status values like `Archived`, but they are existing pack-management controls, not void/rollback controls.

After counts:

- `document_templates`: 4
- `catalog_items`: 9
- `platform_starter_pack_provisioning_runs`: 4
- `platform_starter_pack_provisioning_run_items`: 5

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-draft-review.test.ts` passed: 37 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 5Q as audit-only void action design-to-implementation readiness. Define the exact server-action/RPC preconditions, confirmation phrase, audit-only status update behavior, and QA plan for marking a completed provisioning run voided without touching tenant-owned templates/catalog items. Do not implement the action until the design is reviewed."

## Super Admin Platform Console Phase 5Q

Phase 5Q adds audit-only void action design-to-implementation readiness. It does not add a void server action, rollback action, archive/delete/detach action, migration, new table, RLS/grant change, tenant-owned write, template/catalog mutation, default change, or new provisioning behavior.

Files changed:

- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `docs/chat-handoff.md`

Design summary:

- Adds a dedicated `Audit-Only Void Action Implementation Plan` section to `docs/starter-pack-provisioning-plan.md`.
- Defines future server action shape: `voidCompletedStarterPackProvisioningRunAction(formData)`.
- Defines future confirmation phrase: `VOID AUDIT ONLY`.
- Defines preferred future private RPC shape: `private.audit_only_void_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid, p_void_reason text, p_void_readiness_snapshot jsonb)`.
- Defines allowed future transitions: `completed -> voided` and `completed_with_warnings -> voided`.
- Explicitly blocks future void from `draft`, `approved`, `running`, and `failed` runs.
- Defines already-voided idempotency as readback only: no metadata overwrite.
- Requires a fresh server-side void-readiness usage recomputation at submit time.
- Clarifies that Phase 5C dry-run freshness is not the audit-only void gate for completed runs because completed runs are expected to differ after copies exist.
- Requires future audit-only update to write only run-header metadata:
  - `status = 'voided'`
  - `voided_by`
  - `void_reason`
  - `void_strategy = 'audit_only'`
  - `voided_at`
  - `void_readiness_snapshot`
- Documents safe error messages, lock/concurrency expectations, observability behavior, operator warning copy, and QA gates.
- Documents future archive-unused boundaries and explains why archive/detach remain separate later work.

Readiness summary:

- Existing helpers ready: `getStarterPackProvisioningRunDetail(runId)`, `getStarterPackProvisioningRunUsage(runId)`, `buildStarterPackProvisioningVoidReadiness(...)`, and existing platform-admin action guard patterns.
- Existing schema is ready for audit-only void metadata because Phase 5O added run-level actor/reason/strategy/snapshot fields.
- Remaining blockers before a real audit-only void action:
  - no eligibility helper/test exists yet for `VOID AUDIT ONLY`
  - no void server action exists
  - no private void RPC/transaction helper exists
  - no UI form/control exists
  - no rejected-void attempt logging exists
- Current usage-readiness model is sufficient as evidence for audit-only void because it does not mutate tenant-owned records. It is not sufficient by itself for archive/delete/detach release.

UI copy:

- Completed/selected run review now states: `Audit-only void action is not yet implemented.`
- No button, disabled button, form, action, or mutation control was added.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 5R as a pure eligibility/read-model and test pass for future audit-only void. Add no server action, migration, tenant writes, archive/delete/detach behavior, or UI mutation control."

## Super Admin Platform Console Phase 5R

Phase 5R adds a pure audit-only void eligibility/read model and focused tests. It does not add a void server action, rollback action, archive/delete/detach action, migration, new table, RLS/grant change, tenant-owned write, template/catalog mutation, default change, or new provisioning behavior.

Files changed:

- `apps/web/lib/platform-admin/starter-pack-provisioning-void-eligibility-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-void-eligibility.test.ts`
- `apps/web/components/starter-pack-provisioning-dry-run.tsx`
- `docs/current-state.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/chat-handoff.md`

Read-model behavior:

- `evaluateStarterPackProvisioningVoidEligibility(...)` accepts a provisioning run detail plus the Phase 5M void-readiness usage result.
- The model returns run id, eligible boolean, recommended strategy `audit_only`, confirmation phrase `VOID AUDIT ONLY`, status (`eligible`, `blocked`, `already_voided`, or `unavailable`), issue list, safe operator summary, and required future metadata.
- `completed` and `completed_with_warnings` runs can be eligible when usage readiness is available and the run has a completed or destination-linked item.
- `draft`, `approved`, `running`, and `failed` runs are blocked.
- `voided` runs return an idempotent already-voided state and should not overwrite existing void metadata in a future action.
- used, unknown, and missing destination usage rows create warning issues but do not block audit-only eligibility because audit-only void would not mutate contractor-owned records.
- `archive_unused_future` and `detach_lineage_future` are always unavailable/future-only in this model.

UI:

- `/super-admin/templates` completed/selected run review now shows a read-only `Audit-only void eligibility` panel.
- The panel shows eligibility status, required future metadata, issue list, and copy that no void action exists yet.
- No button, disabled button, form, input, server action, or mutation control was added.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-void-eligibility.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts` passed: 13 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 5S as operator/browser QA for the Phase 5R read-only audit-only void eligibility panel. Verify completed, blocked, and already-voided/readiness-unavailable display states where feasible; confirm no void/rollback/archive/delete/detach controls exist and no tenant-owned counts change. Fix only read-only display or eligibility defects."

## Super Admin Platform Console Phase 5S

Phase 5S completed operator/browser QA for the Phase 5R read-only audit-only void eligibility panel. No defects were found. No migration, schema change, RLS/grant change, tenant-owned write, void action, rollback action, archive/delete/detach behavior, default change, or new provisioning behavior was added.

Files changed:

- `docs/chat-handoff.md`

QA records used:

- completed provisioning run: `9251e67b-97ca-43f4-a01a-17dbd7196c8c`
- draft provisioning run: `9ebf7f20-13a4-4d58-8cf2-8c335900b876`
- approved provisioning run: `904391d6-0285-4e0f-a238-a27d41b55d74`
- organization id for those runs: `b049ad3d-5066-44a8-b114-441c0eb9514e`
- starter pack id for those runs: `2a92b429-69bf-4b62-9574-345462e0dbe4`
- route checked: `/super-admin/templates?reviewRunId=9251e67b-97ca-43f4-a01a-17dbd7196c8c#starter-pack-provisioning-dry-run`

Before counts:

- `document_templates`: 4
- `catalog_items`: 9
- `platform_starter_pack_provisioning_runs`: 4
- `platform_starter_pack_provisioning_run_items`: 5

Browser QA:

- Used the in-app Browser runtime against the already-open localhost tab and reloaded the selected completed-run URL.
- Completed run `9251e67b-97ca-43f4-a01a-17dbd7196c8c` showed `Audit-only void eligibility`.
- Confirmed the completed run shows the eligible copy: `Eligible for future audit-only void review`.
- Confirmed the completed run shows the future confirmation phrase `VOID AUDIT ONLY`.
- Confirmed the completed run shows archive/delete/detach future-only copy: `Archive, delete, and detach-lineage strategies are future-only`.
- Confirmed `Void readiness usage check` still renders.
- Confirmed `Provisioning audit observability` still renders.
- Confirmed `Operation attempts` still renders.
- Confirmed no `Void`, `Rollback`, `Archive`, `Delete`, or `Detach` button exists.
- Confirmed no `void` input or textarea exists.
- Confirmed browser error logs for the completed-run page were empty.

Feasible state checks:

- Draft run `9ebf7f20-13a4-4d58-8cf2-8c335900b876` showed `Audit-only void eligibility`, `Blocked`, and the blocking copy that only completed or completed-with-warnings runs can be considered.
- Approved run `904391d6-0285-4e0f-a238-a27d41b55d74` showed `Audit-only void eligibility`, `Blocked`, and the same completed-run-only blocking copy.
- Already-voided UI state was not available because the QA dataset has no `voided` provisioning run.
- Unavailable state remains covered by unit/read-model tests; no UI record with missing usage-readiness data was available.

After counts:

- `document_templates`: 4
- `catalog_items`: 9
- `platform_starter_pack_provisioning_runs`: 4
- `platform_starter_pack_provisioning_run_items`: 5

Count check caveat:

- Supabase MCP SQL was available but returned a project permission error for direct count queries. Counts were collected through the repo's local server-side Supabase environment using the service-role key without printing secret values.

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/starter-pack-provisioning-void-eligibility.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-observability.test.ts apps/web/lib/platform-admin/starter-pack-provisioning-execution.test.ts` passed: 32 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 5T as audit-only void action planning final review or first implementation only after approval. If implementing, keep it run-header audit metadata only, platform-admin-only, exact confirmation `VOID AUDIT ONLY`, no tenant-owned writes, no archive/delete/detach, and include rejected-attempt logging only if explicitly scoped."

## Super Admin Platform Console Phase 5T

Phase 5T completed a final starter-pack provisioning architecture/operator readiness review before any real void action. This was a documentation/review pass only. No migration, schema change, RLS/grant change, new RPC, new server action, tenant-owned write, void action, rollback action, archive/delete/detach behavior, assignment enforcement, default change, or new provisioning behavior was added.

Files changed:

- `docs/starter-pack-provisioning-review.md`
- `docs/README.md`
- `docs/current-state.md`
- `docs/starter-pack-provisioning-plan.md`
- `docs/starter-pack-provisioning-execution-readiness.md`
- `docs/chat-handoff.md`

Readiness review summary:

- Reviewed the full Phase 4A through Phase 5S lifecycle: starter packs, assignment intent, targeting preview, dry run, approval draft, freshness review, audit approval, guarded execution, observability, operation attempts, void readiness, void metadata, and audit-only void eligibility.
- Strongest current guarantees: platform-admin-only server boundaries, server-recomputed dry runs/reviews, separate approval/execution stages, private locked execution function, source-seed lineage, non-default tenant-owned copies, safe rejected/no-op attempt logging, and read-only void readiness/eligibility before any void lever exists.
- Biggest remaining risks: no real void/rollback path, conservative duplicate matching can still require operator judgment, no rejected-void attempt logging because no void action exists, observability is not a full operations/errors center, and future archive/detach would need item-level outcome metadata plus stricter usage/default checks.
- The review verdict is ready for a narrow future audit-only void action only after explicit approval. It is not ready for archive/delete/detach, assignment auto-provisioning, tenant self-service adoption, entitlement-driven provisioning, or batch/background provisioning.

Operator UX/copy review:

- No UI wording change was made in this pass. Existing `/super-admin/templates` copy already distinguishes dry run, audit approval, execution, operation attempts, void readiness, and audit-only void eligibility, and it states that void/rollback/archive/delete/detach controls do not exist.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with existing LF-to-CRLF working-copy warnings only.

Recommended next prompt:

- "Implement Phase 5U as the first audit-only void action only. It must transition only completed/completed-with-warnings provisioning runs to `voided`, require `VOID AUDIT ONLY`, recompute void-readiness usage server-side, write only run-header void metadata, log rejected void attempts only if explicitly scoped, and never mutate contractor-owned templates/catalog items or defaults."

## Early Access Build Complete

Final early-access onboarding/demo status is documented here for the next session. This is the current operational summary; defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for full implemented truth and [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for canonical workflow rules.

## Stripe Verification Blocked

- `.env.local` currently has blank `STRIPE_SECRET_KEY`.
- `.env.local` currently has blank `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Required values must be Stripe test-mode keys:
  - `sk_test_...`
  - `pk_test_...`
- After adding keys, restart the dev server.
- Rerun `/setup/billing`.
- Verify test card `4242 4242 4242 4242`.
- Verify declined card `4000 0000 0000 9995`.
- Verify no charge and no subscription.
- Verify `companies.stripe_customer_id`.
- Verify `companies.stripe_payment_method_id`.

## Pricing And Activation Readiness Copy

Completed a minimal pricing + activation-readiness layer without adding billing automation, schema, duplicate account models, or subscription creation.

Files changed in this pass:

- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/components/platform-admin/activate-company-form.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/data.ts`
- `docs/chat-handoff.md`

Behavior:

- The public homepage now includes a pricing section with early-access positioning:
  - `Starter / Early Access`
  - `Pro / Coming Soon`
  - `Enterprise / Contact Us`
- Homepage pricing copy explicitly says early access is limited, there is no charge during onboarding, pricing is confirmed before activation, and the current flow does not create charges or subscriptions automatically.
- `/super-admin/early-access` now shows derived activation readiness from existing records only:
  - company profile started from existing `companies` profile fields
  - payment method saved from `companies.stripe_payment_method_id`
  - estimate stage reached from canonical estimate counts
  - guarded external actions locked until `companies.tenant_status = active` and `companies.lifecycle_state = active`
- `Mark active` confirmation now warns that active unlocks guarded production actions, while billing or subscription setup remains a separate operator action unless already implemented.
- Dashboard active-state copy now shows calm `Account active` status. If no payment method exists, it prompts the user to add a billing method. If a payment method exists, it shows `Billing method saved`.

Guardrail status:

- Activation still uses the existing `companies.tenant_status` and `companies.lifecycle_state` fields.
- Activation does not create a Stripe charge.
- Activation does not create a Stripe subscription.
- Activation does not create or update a duplicate billing, company, account, or tenant model.
- The existing SetupIntent-only `/setup/billing` path remains the only card-readiness shell.

Remaining Stripe test-card blocker:

- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` still need valid Stripe test-mode values in `C:/FloorConnector/.env.local`.
- Restart the dev server after adding keys.
- Verify `/setup/billing` with a Stripe test card before claiming payment-method collection is fully tested.
- Do not claim subscriptions, recurring billing, plan enforcement, or automatic charging are implemented.

## Early Access Intake And Feedback Capture

Completed a minimal early-access intake + feedback layer using existing canonical data only. No tables, schemas, analytics system, sandbox/demo mode, billing logic, activation logic, or canonical lifecycle behavior were added or changed.

Files changed in this pass:

- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/components/early-access-request-form.tsx`
- `apps/web/components/early-access-help-button.tsx`
- `apps/web/lib/early-access/actions.ts`
- `apps/web/lib/early-access/intake.ts`
- `apps/web/lib/early-access/feedback-actions.ts`
- `apps/web/lib/early-access/feedback.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `packages/config/src/env/server.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- `/` now includes an optional `Request Early Access` form alongside `Start Free Trial`.
- Public request fields are name, email, company name, trade/service type, and short note.
- Requests write to existing canonical records:
  - `contacts` with `contact_kind = general_inquiry`
  - `opportunities` with `source = early_access` and `source_detail = homepage_request`
- Production public intake must set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` to the existing canonical company that owns public intake leads.
- If `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is missing in production, the public form returns user-friendly fallback copy and does not write to an arbitrary tenant.
- Non-production fallback uses the oldest existing company only so local/manual QA can submit without adding a setup table.
- Protected contractor routes now show a floating `Send Feedback` entry.
- The feedback entry opens a modal with message and optional email.
- Feedback writes to the existing tenant-scoped `workflow_error_events` table with `action = early_access.feedback`, `subject_type = company`, and `subject_id = companies.id`.
- `/super-admin/early-access` now shows:
  - feedback captured / no feedback indicator
  - recent-feedback link per company
  - recent-feedback panel on the same page
  - recent-login signal derived from `company_memberships.last_active_at` and `users.last_sign_in_at`
  - reached-estimate and reached-contract flags derived from existing estimate/contract counts

Known gap:

- There is still no purpose-built company-level feedback/internal-note table. Feedback uses `workflow_error_events` because it is the only existing tenant-scoped company-level internal signal store that does not require a project/customer communication thread or daily-log field note.
- Public pre-auth intake is tenant-owned because `opportunities` are tenant-owned. Production must configure the intake company explicitly with `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`.

## Early Access Production Readiness

Completed the production-readiness closeout for early-access intake and feedback without adding product features, schema, billing logic, activation logic, analytics, or sandbox/demo mode.

Operational truth:

- Public early-access intake storage remains existing `contacts` plus `opportunities`.
- Feedback storage remains existing tenant-scoped `workflow_error_events` rows with `action = early_access.feedback`.
- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is required in production and should point to the canonical company that owns public intake leads.
- Missing production intake company configuration returns user-facing fallback copy instead of selecting a tenant implicitly.
- `.env.example` and `README.md` document the required production intake company env var.

Remaining Stripe test-key blocker:

- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` still need valid Stripe test-mode values in `C:/FloorConnector/.env.local` or the deployment environment.
- Restart the app after setting Stripe keys.
- Verify `/setup/billing` with a Stripe test card before claiming billing-method collection is fully tested.

What not to claim yet:

- Do not claim subscriptions, recurring billing, plan enforcement, or automatic charging are implemented.
- Do not claim Stripe card setup is fully verified until valid test keys are configured and a test card is saved through `/setup/billing`.
- Do not claim pending/trial tenants can send customer-facing estimates/contracts, process checkout payments, or use provider-backed email delivery before activation.
- Do not claim fake demo data, sandbox/demo mode, analytics funnels, AI takeoff, full dispatch optimization, accounting integrations, external e-sign provider integration, or full payment reconciliation are implemented.

## Early Access Launch Checklist

Use this as the final operator checklist before opening early access in production. It is a deployment checklist only; it does not introduce a new workflow, schema, billing system, analytics layer, sandbox mode, or activation model.

Required env vars:

- `NEXT_PUBLIC_APP_URL`: production app URL used by auth redirects and setup links.
- `NEXT_PUBLIC_MARKETING_URL`: production marketing URL when different from the app URL.
- `NEXT_PUBLIC_SUPABASE_URL`: active production Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: active production Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only production service role key; never expose in browser code.
- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`: required in production for public `Request Early Access`; must point to the existing canonical `companies.id` that owns public intake leads.
- `STRIPE_SECRET_KEY`: Stripe test-mode secret key for billing-method readiness verification.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: matching Stripe test-mode publishable key for Stripe Elements.
- `STRIPE_WEBHOOK_SECRET`: configure before relying on webhook-backed payment events.

Supabase migration status:

- Confirm the production Supabase project is linked to the intended environment before applying migrations.
- Run `supabase migration list` and verify local migration files and remote migration history match the intended release.
- Apply pending migrations through the normal migration flow before launch; do not patch production schema manually.
- Confirm the production database includes the existing canonical tables used by early access: `companies`, `company_memberships`, `users`, `contacts`, `opportunities`, `workflow_error_events`, estimates/contracts/jobs/invoices, and the current Stripe reference fields on `companies`.
- Confirm RLS remains enabled for tenant-owned tables and public intake still writes only through the server-side intake action.

Stripe test-mode verification steps:

- Set valid matching test-mode values for `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Restart or redeploy the app after setting Stripe env vars.
- Create a real early-access signup and complete `/setup/company`.
- Visit `/setup/billing` and confirm Stripe Elements renders.
- Save a billing method with a Stripe test card such as `4242 4242 4242 4242`.
- Confirm no charge or subscription is created.
- Confirm the active company row stores only Stripe reference fields such as `stripe_customer_id` and `stripe_payment_method_id`.
- Confirm dashboard copy shows `Billing method saved` after setup.

Production intake company ID setup:

- Create or identify the canonical FloorConnector-owned company that will own public early-access intake leads.
- Set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` to that exact `companies.id`.
- Submit one public `Request Early Access` form from `/`.
- Confirm it creates an existing `contacts` row and existing `opportunities` row with `source = early_access` and `source_detail = homepage_request` under that company.
- If the env var is missing in production, the form should fail gracefully with fallback copy and must not write to any arbitrary tenant.

First test signup path:

- Open `/`.
- Click `Start Free Trial`.
- Confirm the route is `/signup?next=/setup/company`.
- Sign up with a real test user through the implemented Supabase auth flow.
- Complete `/setup/company`.
- Visit `/setup/billing` and either save a Stripe test billing method or confirm the billing-later fallback is clear.
- Continue to `/setup/pending-activation`.
- Enter `/dashboard` and confirm the user can create internal canonical records while guarded external actions remain locked.

Super-admin monitoring path:

- Open `/super-admin/early-access` as a platform admin.
- Confirm the new company appears with tenant status, lifecycle state, company-profile readiness, saved-payment-method status, and project/estimate/contract/invoice counts.
- Confirm light signals derive from existing data only: recent login, reached estimate, reached contract, and feedback presence.
- Confirm recent feedback appears when users submit the protected `Send Feedback` modal.
- Use this page for early-access review before activation.

Activation rules:

- Activation uses only existing `companies.tenant_status` and `companies.lifecycle_state`.
- Marking active unlocks guarded production actions for that company.
- Activation does not create a Stripe charge.
- Activation does not create a Stripe subscription.
- Activation does not create a duplicate billing, account, company, or tenant model.
- Billing/subscription follow-through remains a separate operator action unless later explicitly implemented.

What is intentionally gated before activation:

- Estimate customer sends.
- Contract send-for-signature.
- Customer-facing checkout/payment processing.
- Provider-backed notification email delivery.

What remains available while pending/trial:

- Company setup.
- Dashboard access.
- Internal projects, opportunities, customers, estimates, contracts, jobs, invoices, and related review surfaces, subject to existing workflow and readiness gates.
- In-app feedback capture through existing `workflow_error_events`.
- Super-admin monitoring and operator review.

What not to claim yet:

- Do not claim live subscription billing, recurring billing, plan enforcement, automatic charging, or automatic plan provisioning.
- Do not claim Stripe card setup is fully verified until the test-mode keys are present and a test card has been saved through `/setup/billing`.
- Do not claim pending/trial tenants can send customer-facing estimates/contracts, process checkout payments, or use provider-backed email delivery.
- Do not claim fake demo data, sandbox/demo mode, analytics funnels, AI takeoff, full dispatch optimization, accounting integrations, external e-sign provider integration, full payment reconciliation, or every target architecture item is implemented.

Rollback / disable notes:

- If `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is wrong, remove or correct it immediately; public intake should fail gracefully when missing in production rather than writing to the wrong tenant.
- If intake was submitted to the wrong company, do not bulk-delete blindly; identify the created `contacts` and `opportunities` rows by `source = early_access`, `source_detail = homepage_request`, timestamp, and submitted email/company details, then plan a targeted data correction.
- If Stripe keys are missing, mixed live/test, or incorrect, clear or replace `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, redeploy/restart, and use the billing-later path until test-mode verification passes.
- If Stripe setup behaves unexpectedly, do not mark card collection as verified and do not activate companies based on billing readiness until the issue is resolved.
- If external sends or payment processing must remain disabled for a company, keep `companies.tenant_status` / `companies.lifecycle_state` in pending/trial states and do not mark the company active.
- If launch confidence drops, keep homepage `Start Free Trial` available only if onboarding is intended to remain open; otherwise route interested users through the public `Request Early Access` path after confirming intake env is correct.

## Early Access Readiness Verification - 2026-05-06

Verification-only pass against the linked Supabase project and a local production-mode web server at `http://localhost:3020`. No app code, schema, migrations, workflow logic, billing logic, or activation logic was changed.

Checks run:

- `supabase migration list` connected to the linked remote database and showed local/remote migration history aligned through `20260505194642`.
- `README.md` and `.env.example` document `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`, `STRIPE_SECRET_KEY`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- `.env.local` check: `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` missing, `STRIPE_SECRET_KEY` blank, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` blank, `FLOORCONNECTOR_E2E_EMAIL` present, and `FLOORCONNECTOR_E2E_PASSWORD` present.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production-mode server was started with `NODE_ENV=production`, `PORT=3020`, and `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` intentionally absent.
- Public homepage `/` loaded successfully.
- Public `Request Early Access` form failed gracefully while the intake company ID was missing, showing the configured user-facing fallback instead of writing to an arbitrary tenant.
- Homepage `Start Free Trial` href resolves to `/signup?next=%2Fsetup%2Fcompany`.
- Unauthenticated `/setup/company`, `/setup/billing`, `/setup/pending-activation`, and `/super-admin/early-access` redirected to `/login`.
- `pnpm e2e:auth` passed against `http://localhost:3020` and refreshed `playwright/.auth/local-user.json`.
- Authenticated platform-admin check loaded `/super-admin/early-access`.
- Read-only tenant check for the authenticated QA company showed `tenant_status = trialing`, `lifecycle_state = trial`, a missing saved Stripe payment method, recent activity present, and existing estimates, contracts, jobs, and invoices.
- Authenticated trial user could open internal workflow routes: `/setup/company`, `/projects`, `/estimates`, `/contracts`, `/jobs`, and `/invoices`.
- Authenticated trial user saw `/setup/pending-activation` copy confirming internal records remain available while external sends, customer-facing payment processing, and provider-backed emails stay locked until activation.
- Trial estimate detail verified the `Send estimate` action is disabled with early-access lock copy.
- Trial contract detail verified the `Send for signature` action is disabled with early-access lock copy.
- Trial portal invoice detail verified checkout/payment processing is locked during early access.

Pass/fail summary:

- Passed: migrations aligned on the linked remote database, env docs present, homepage load, missing-intake fallback, signup CTA href, setup-route protection, unauthenticated super-admin protection, platform-admin early-access page load, internal trial workflow access, estimate-send lock, contract-send lock, portal checkout/payment lock, typecheck, lint, and build.
- Blocked for launch claims: production/staging env values are not ready locally because `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is missing and both Stripe keys are blank in `.env.local`.

Exact remaining blockers:

- Set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` in production/staging before accepting public early-access intake; missing production config correctly fails closed.
- Set matching Stripe test-mode `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, then verify `/setup/billing` with a Stripe test card before claiming billing-method collection is fully tested.
- Do not claim subscriptions, automatic charges, live billing, or pending/trial external sends/payments are available.

## Investor Demo Script

Use this script for an investor or customer-facing walkthrough. Keep the language grounded in implemented truth: this is a real early-access product on canonical records, not a fake demo environment, and not a live subscription-billing system.

### 1. Opening pitch

Say:
"FloorConnector is an operating system for specialty surface contractors. The core idea is simple: keep the whole contractor journey connected from opportunity to customer, project, estimate, contract, job, invoice, and payment, so work does not fracture across spreadsheets, inboxes, disconnected estimating tools, and billing systems."

Emphasize:

- FloorConnector is built for epoxy flooring, concrete polishing, and specialty surface contractors.
- The product is not trying to be a generic CRM or generic project-management app.
- The strongest current story is continuity: records move forward instead of being recreated.
- Early access is real product access with activation guardrails.

Do not say:

- Do not say every future module is production-complete.
- Do not say billing subscriptions are live.
- Do not say external sends and payment processing are available before activation.

### 2. Homepage talking points

Open `/`.

Talk through:

- The homepage positions FloorConnector around "lead to payment" continuity.
- The workflow visual should be described as the product spine: Lead / Project / Estimate / Contract / Job / Invoice / Payment in public-facing language, with the internal canonical lifecycle still anchored on `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- The platform section separates implemented foundations from planned layers.
- The comparison section is positioning-focused and should not be represented as an exhaustive competitor audit.
- The pricing section is intentionally early-access-oriented:
  - `Starter / Early Access`
  - `Pro / Coming Soon`
  - `Enterprise / Contact Us`
- Pricing is subject to confirmation before activation.
- No charge is created during onboarding.
- The current flow does not create subscriptions automatically.

Click:

- `Start Free Trial`

Expected route:

- `/signup?next=/setup/company`

### 3. Signup/onboarding talking points

On signup/login:

- Authentication is real Supabase-backed auth.
- Users sign up or log in through the existing auth system.
- There is no fake demo account layer and no sandbox-only persistence.
- First access bootstraps the user into the existing organization/company and membership model.
- The `next=/setup/company` handoff preserves the intended onboarding route.

If asked whether this can support real users:

- Yes, early users enter the real contractor app and create real canonical records.
- Activation guardrails block irreversible external production actions until the operator marks the company active.

### 4. Company setup talking points

On `/setup/company`:

- Company setup writes to the existing `companies` organization record.
- Primary address setup writes through the existing primary `locations` record.
- There is no `company_registration` table or duplicate tenant model.
- Optional profile/brand details are progressive; they improve readiness and app identity but do not create a separate onboarding model.
- This is the first proof point that FloorConnector treats onboarding as part of the real product foundation, not a parallel trial system.

Key fields to mention:

- legal/display company identity
- phone/email/website
- primary trade
- brand/accent direction
- time zone
- primary location/address

### 5. Billing setup caveat

On `/setup/billing`:

- This is payment-method readiness only.
- When Stripe test keys are configured, the route uses Stripe SetupIntent / Elements to save a billing method.
- It does not create a charge.
- It does not create a subscription.
- It stores Stripe customer/payment method references on the existing `companies` row.
- If Stripe keys are missing or setup fails, the user can continue with a safe billing-later path.

Required caveat:
"We can collect a billing method for readiness once Stripe test keys are configured and verified, but early access still requires operator confirmation before activation. This is not automatic subscription billing."

### 6. Pending activation explanation

On `/setup/pending-activation`:

- This page uses the existing `companies.tenant_status` and `companies.lifecycle_state`.
- It lets early users enter the real dashboard.
- It explains that users can create internal records while external production actions remain locked.
- Activation is not a new account model; it is a status/lifecycle transition on the existing company record.

Say:
"Pending activation is the boundary between safe product exploration and production external actions. It lets a contractor start building their real workflow without accidentally sending customer-facing documents or processing payments before review."

### 7. Dashboard/Start Here walkthrough

On `/dashboard`:

- The dashboard is the contractor command center, not a separate analytics product.
- It derives from existing canonical records.
- The Start Here guide points a new company into the first practical workflow:
  - create or review a project
  - create an estimate
  - generate a contract from approved estimate context
  - continue into job or invoice when the workflow is ready
- The guide is dismissible for normal users, but `/dashboard?fresh=true` can force it visible in non-production for demos or QA.
- If the company is active, dashboard copy shows `Account active`.
- If no billing method exists, it prompts for billing method setup.
- If a billing method exists, it shows `Billing method saved`.

Demo note:

- Use the dashboard to show that FloorConnector already has real queues and manager entries for projects, estimates, contracts, jobs, invoices, payments, scheduling, people, vendors, and settings foundations.
- Do not oversell planned/deeper modules as complete.

### 8. Project workspace workflow strip explanation

Open a Project Workspace.

Explain:

- Project is the operational hub.
- The top workflow strip communicates where the job is in the handoff.
- The strip derives from existing records:
  - estimate exists / approved estimate exists
  - contract exists / signed contract exists
  - job exists
  - invoice exists
  - payment activity exists
- The strip is a clarity layer, not a second workflow engine.
- It does not create data or bypass readiness gates.

Say:
"This is the product direction in one screen: the contractor should instantly know what has happened, what is blocked, and what comes next, without jumping between disconnected modules."

### 9. Project -> Estimate -> Contract flow

Walkthrough:

1. From project context, create or open an estimate.
2. Explain that estimates stay linked to the project and derived customer.
3. Explain that estimate line items are canonical estimate rows and the catalog/cost-item foundation feeds estimating without becoming a fake invoice source.
4. Once an estimate is approved, generate the contract from the approved estimate context.
5. Open the Contract Workspace and explain that portal signing and contractor-side onsite signing operate on the same canonical contract record.

Important boundaries:

- Approved estimate does not automatically create invoice, job, payment, or subscription records.
- Contract generation uses the existing estimate/project/customer chain.
- Sending externally may be locked while the tenant is pending/trial.

### 10. Super-admin early-access monitoring

Open `/super-admin/early-access` as a platform admin.

Explain:

- This is platform-admin-only onboarding visibility.
- It reads existing `companies` and canonical workflow counts.
- It shows:
  - company profile readiness
  - saved payment method presence
  - project/estimate/contract/invoice activity counts
  - first workflow progress
  - estimate-stage progress
  - guarded external actions lock/unlock state
- `Mark active` uses the existing company lifecycle/status fields.
- Activation unlocks guarded production actions.
- Activation does not create a subscription or charge.
- The development-only reset is for non-production QA only and is not a demo/sandbox product feature.

### 11. What is intentionally gated

While a company is pending/trial, the activation guard blocks irreversible external production actions, including:

- estimate customer sends
- contract send-for-signature
- customer-facing checkout/payment processing
- provider-backed notification email delivery

Internal work remains available:

- company setup
- dashboard access
- projects
- estimates
- contracts
- invoices
- jobs
- scheduling/review surfaces, subject to existing workflow gates
- settings and admin foundations where the user has permission

### 12. What is planned/coming soon

Frame these as direction, not current production claims:

- deeper scheduling/dispatch controls
- advanced reporting
- AI-assisted estimating / takeoff
- richer mobile field workflows
- deeper communications and delivery proof
- materials and inventory depth
- external e-sign provider integration
- accounting integrations
- subscription billing and plan enforcement
- deeper payment reconciliation
- broader module-dashboard coverage

### 13. What not to claim yet

Do not claim:

- live subscription billing
- automatic plan provisioning
- automatic charges during onboarding
- Stripe card setup fully verified until test keys and test-card flow are confirmed
- pending/trial tenants can send customer-facing estimates/contracts or process checkout payments
- provider-backed email/SMS delivery is enabled for early-access tenants
- fake demo data or sandbox demo mode exists
- AI takeoff is implemented
- full dispatch optimization is implemented
- accounting integrations are implemented
- external e-sign provider integration is implemented
- full payment reconciliation is complete
- every target architecture document is implemented

## Early User Trial Script

Use this for a contractor tester. The tone should be practical: ask them to try the real workflow, notice where the next action is clear or confusing, and report what feels missing.

### What to try first

Ask the tester to:

1. Start at `/`.
2. Use `Start Free Trial`.
3. Sign up or log in with a real test account.
4. Complete `/setup/company`.
5. Visit `/setup/billing`.
6. Continue through billing setup or use the billing-later fallback if Stripe is not configured.
7. Enter the dashboard from `/setup/pending-activation`.
8. Use the Start Here guide on `/dashboard`.
9. Create or open a project.
10. Create the first estimate from project context.
11. Review the Project Workspace workflow strip and next-step panel.
12. Generate or review a contract when an approved estimate is available.
13. Browse the Managers for Projects, Estimates, Contracts, Jobs, Invoices, Payments, Schedule, People, Vendors, and Settings.

Focus questions:

- Did you know what to do next?
- Did the Project Workspace make the workflow stage obvious?
- Did the dashboard feel like a useful home base?
- Did any locked action explain why it was locked?
- Did any route feel like a separate silo instead of one connected workflow?

### What actions are locked

Tell testers:

- Early access lets you create real internal records.
- External production actions remain locked until the company is active.
- Locked actions include:
  - sending estimates to customers
  - sending contracts for signature
  - customer-facing checkout/payment processing
  - provider-backed notification email delivery
- Billing setup is no-charge payment-method readiness only.
- Activation is operator-reviewed and separate from subscription billing.

### How to ask for help

Ask testers to use:

- the in-app `Need help?` support entry on protected contractor routes
- direct support/contact instructions provided by the operator running the test
- screenshots or screen recordings when a workflow is confusing

Ask them to include:

- route or page name
- record type they were working on
- expected next step
- what they clicked
- what happened
- whether the issue blocked work or was just unclear

### What feedback we want

Prioritize feedback on:

- first five minutes after signup
- company setup clarity
- billing setup trust/caveats
- pending activation explanation
- dashboard Start Here usefulness
- project workflow strip clarity
- project-to-estimate handoff
- estimate-to-contract handoff
- locked-action messaging
- terminology that feels too technical
- places where the app feels disconnected or too dense

De-prioritize for this trial:

- requests for full dispatch optimization
- requests for AI takeoff
- requests for accounting sync
- requests for native mobile apps
- requests for subscription plan changes

Those are valid product inputs, but they are not the purpose of the first early-user continuity test.

What is implemented:

- public investor-ready entry at `/` with the primary early-access CTA routing to `/signup?next=/setup/company`
- real signup/login through the existing auth system, with no fake auth or demo-only account flow
- `/setup/company`, writing company setup onto the existing `companies` organization record and primary `locations` row
- `/setup/billing`, using Stripe SetupIntent/Elements only for no-charge payment-method setup when Stripe keys are configured
- `/setup/pending-activation`, showing existing tenant lifecycle/status and allowing entry into the real contractor app
- dashboard early-access guidance, including Start Here guidance into the canonical Project -> Estimate -> Contract path
- protected contractor-route `Send Feedback` early-access entry
- setup-page dashboard escape hatch with `Finish setup to unlock full access`
- shared activation guard for pending/trial organizations
- `/super-admin/early-access` platform-admin view over existing `companies` plus canonical project/estimate/contract/invoice counts
- non-production `DEV MODE` session-reset control
- non-production `/dashboard?fresh=true` clean first-user simulation
- non-production platform-admin onboarding reset for selected early-access test tenants

What is intentionally gated:

- estimate customer sends
- contract send-for-signature
- customer-facing checkout/payment processing
- provider-backed notification email delivery
- activation to full access, which still uses existing `companies.tenant_status` and `companies.lifecycle_state`

How to run the investor demo:

1. Visit `/`.
2. Click `Start Free Trial`.
3. Confirm the route goes to `/signup?next=/setup/company`.
4. Sign up or log in with a real test user.
5. Complete `/setup/company`.
6. Visit `/setup/billing`.
7. If Stripe test keys are configured, save a test billing method; if keys are missing, use the safe billing-later fallback.
8. Continue to `/setup/pending-activation`.
9. Click `Enter Dashboard`.
10. Use Start Here to create or review the real Project -> Estimate -> Contract path.
11. As a platform admin, open `/super-admin/early-access` to review the tenant and mark active only when appropriate.

How to test a clean onboarding flow:

- Use a real early-access test user and tenant.
- In non-production, sign in as a platform admin and open `/super-admin/early-access`.
- Use `Reset onboarding state` only on the selected test company.
- Sign out or use `Reset session`, then start again from `/` or `/signup?next=/setup/company`.
- Confirm setup, dashboard, Start Here, and early-access lock copy still appear without stale local dismissal/session state.

How to use `/dashboard?fresh=true`:

- Works only in non-production.
- Forces the existing Start Here onboarding guide visible.
- Ignores the Start Here localStorage dismissal for that view.
- Does not create fake records, change tenant data, bypass auth, or bypass canonical record reads.

How to use `/super-admin/early-access`:

- Requires platform-admin access.
- Shows existing company status/lifecycle, saved-payment-method presence, and project/estimate/contract/invoice activity counts.
- Derives first workflow, estimate-stage, and contract-stage badges from canonical record counts only.
- `Mark active` confirms first and sets the existing company lifecycle/status to active.
- The dev reset button appears only when `NODE_ENV !== production`.

How dev-only reset works:

- The action is platform-admin-only and server-guarded to non-production.
- It is clearly labeled `DEV / TEST ONLY`.
- It scopes every delete/update to the selected `company_id`.
- It clears onboarding workflow test records for projects, estimates, contracts, invoices, and dependent workflow rows.
- It clears `companies.stripe_payment_method_id`.
- It does not clear `companies.stripe_customer_id`, to avoid duplicate/orphaned Stripe customer assumptions.
- It resets `companies.tenant_status = trialing` and `companies.lifecycle_state = trial`.
- It fails safely before deleting anything if `estimate_system_snapshots` or `contract_system_snapshots` exist, because those binding snapshot records intentionally block lightweight deletion.

Stripe test-key blocker:

- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` still need real Stripe test-mode values in `C:/FloorConnector/.env.local`.
- Restart the dev server after adding keys.
- Verify `/setup/billing` with a Stripe test card before claiming payment-method collection has been fully tested.
- Missing keys should show the safe `Stripe not configured`/billing-later path; test keys should show `Stripe test mode active`.

What not to claim yet:

- Do not claim subscriptions, plans, recurring billing, or charging are implemented.
- Do not claim Stripe card setup is fully verified until test keys are present and a test card is saved through `/setup/billing`.
- Do not claim pending/trial tenants can send externally or process customer-facing payments.
- Do not claim provider-backed email delivery is enabled for early-access tenants.
- Do not claim sandbox/demo mode exists.
- Do not claim fake demo data exists.
- Do not claim advanced dispatch, AI takeoff, external e-sign provider integration, accounting integrations, full payment reconciliation, or full subscription billing are complete.

## Early Access QA Reset Workflow

Added a development-only QA reliability layer for repeatedly testing early-access onboarding without adding schema, sandbox/demo mode, analytics, new business models, billing logic changes, or canonical workflow changes.

Files changed in this pass:

- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/components/dev-qa-tools.tsx`
- `apps/web/components/platform-admin/reset-onboarding-state-form.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/lib/onboarding/billing-setup.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior:

- `/super-admin/early-access` shows a clearly labeled `DEV / TEST ONLY` reset action only when `NODE_ENV !== production`.
- The reset remains platform-admin-only, scopes every delete/update by the selected company id, clears project/estimate/contract/invoice onboarding workflow test records plus dependent workflow rows, clears `companies.stripe_payment_method_id`, and resets `companies.tenant_status = trialing` / `companies.lifecycle_state = trial`.
- The reset does not clear `companies.stripe_customer_id`; retaining it avoids creating orphaned or duplicate Stripe customer assumptions during repeated QA.
- The reset fails safely before deleting anything if the company has `estimate_system_snapshots` or `contract_system_snapshots`, because those insert-only binding records intentionally block lightweight deletion.
- Contractor app routes in non-production show a subtle `DEV MODE` badge with `Reset session`, which clears browser local/session storage, signs out through the existing auth action, and returns to `/login`.
- `/dashboard?fresh=true` in non-production forces the existing Start Here guide visible and ignores its localStorage dismissal without creating fake records.
- `/setup/billing` in non-production shows whether Stripe is in test mode, missing, mixed, or live-key configuration.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.
- Manual destructive reset was not executed against live tenant data during implementation.

## Early Access Onboarding Visibility

Added a thin platform-admin visibility layer for onboarding users without adding analytics tables, duplicate tenant models, billing logic, sandbox mode, or canonical workflow changes.

Files changed in this pass:

- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/settings/navigation.ts`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- Platform admins now have `/super-admin/early-access` for cross-tenant onboarding visibility. This intentionally lives under super admin rather than contractor `/settings` so tenant data is not exposed to regular organization admins.
- The view lists existing `companies` records with company name, created date, tenant status, lifecycle state, payment-method presence derived from `companies.stripe_payment_method_id`, and canonical project/estimate/contract/invoice counts.
- The view derives onboarding progress from existing records only:
  - `Reached first workflow step`: at least one project.
  - `Reached estimate stage`: at least one project and at least one estimate.
  - `Reached contract stage`: at least one project, at least one estimate, and at least one contract.
- The operational "aha moment" remains data-derived: a company has reached the first meaningful product workflow once it has at least one project and at least one estimate. Contract generation is visible as the next stage, not a required tracking row.
- Platform admins can mark a company active from the early-access view using the existing `companies.tenant_status = active` and `companies.lifecycle_state = active` path.
- Dashboard recovery now redirects users with no completed company profile fields to `/setup/company`.
- If Stripe is configured and the company has no saved payment method, the dashboard early-access banner gently points to `/setup/billing`; if Stripe is not configured, billing remains non-blocking.
- Start Here remains the existing dashboard guide, but it is forced visible for zero-project companies and biases to the estimate step once a project exists and no estimate exists.

Guardrail status:

- The existing shared activation guard is unchanged. It still blocks irreversible production actions such as external sends and payment processing while allowing internal project, estimate, contract, invoice, job, scheduling, setup, and review workflows.

## Early Access Safety + Support Layer

Completed a lightweight first-user safety/support pass without adding schema, analytics, sandbox/demo mode, business models, billing logic, or core workflow changes.

Files changed in this pass:

- `apps/web/components/early-access-help-button.tsx`
- `apps/web/components/setup-escape-banner.tsx`
- `apps/web/components/platform-admin/activate-company-form.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/settings-feedback.tsx`
- `apps/web/components/stripe/setup-intent-form.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `apps/web/app/error.tsx`
- `apps/web/app/api/stripe/create-setup-intent/route.ts`
- `apps/web/app/api/stripe/save-payment-method/route.ts`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/lib/onboarding/actions.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- Protected contractor routes now show a small bottom-right `Need help?` entry that opens a simple early-access support panel with email support and a walkthrough placeholder link.
- `/setup/company`, `/setup/billing`, and `/setup/pending-activation` now include a dashboard escape hatch banner: `Finish setup to unlock full access`.
- `/setup/billing` no longer traps users when Stripe is configured but setup fails; Stripe/network/SetupIntent failures show human-readable copy, a retry action, and `Continue and add billing later`.
- Global app errors no longer render raw error messages.
- Settings-style feedback masks technical-looking raw errors before display.
- Projects, estimates, contracts, and invoices first-empty states now carry clearer canonical workflow guidance and primary first-action paths where the workflow can safely provide one.
- `/super-admin/early-access` now confirms before `Mark active` and returns `Company activated` on success.

Validation still required for this pass:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser QA for empty states, setup escape behavior, the Stripe-missing-key path, and super-admin activation confirmation.

## Early Access Demo Readiness

What is ready to show:

- Public homepage at `/` with the early-access CTA and lead-to-payment positioning.
- Real signup entry from `Start Free Trial` into `/signup?next=/setup/company`.
- Early-access setup routes: `/setup/company`, `/setup/billing`, and `/setup/pending-activation`.
- Dashboard entry at `/dashboard`, including `Start Here` guidance into the canonical Project -> Estimate -> Contract path.
- Platform-admin visibility at `/super-admin/early-access`, including company status, saved-payment-method presence, project/estimate/contract/invoice counts, workflow-stage badges, and mark-active control.

Exact investor demo flow:

1. Visit `/`.
2. Click `Start Free Trial`.
3. Complete signup and land at `/setup/company`.
4. Save company basics, then continue to `/setup/billing`.
5. If Stripe is configured, save a billing method; if Stripe is not configured, use the billing fallback to continue.
6. Continue to `/setup/pending-activation`.
7. Click `Enter Dashboard` to reach `/dashboard`.
8. Use `Start Here`.
9. Follow Project -> Estimate -> Contract through the existing Quick-Create and workspace flow.
10. Visit `/super-admin/early-access` as a platform admin to review the tenant, activity counts, workflow-stage badges, and activation control.

Exact early-user signup flow:

1. User visits `/`.
2. User clicks `Start Free Trial`.
3. User creates an account at `/signup?next=/setup/company`.
4. User completes `/setup/company`.
5. User visits `/setup/billing`.
6. User either saves a billing method through Stripe SetupIntent or continues through the safe billing fallback when Stripe is unavailable.
7. User lands on `/setup/pending-activation`.
8. User clicks `Enter Dashboard`.
9. User uses `/dashboard` and `Start Here` to create real internal records.
10. Operator reviews the tenant at `/super-admin/early-access` and marks active only after review.

What is intentionally gated:

- Estimate customer sends.
- Contract send-for-signature.
- Customer-facing checkout/payment processing.
- Provider-backed notification email delivery.
- Activation uses existing `companies.tenant_status` and `companies.lifecycle_state`; no duplicate activation model, sandbox mode, or demo tenant model exists.

What still needs Stripe test keys:

- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be filled in `C:/FloorConnector/.env.local`.
- The dev server must be restarted after filling keys.
- `/setup/billing` must be verified with a Stripe test card before claiming the live card setup path is verified.

What NOT to claim yet:

- Do not claim subscriptions or billing plans are implemented.
- Do not claim Stripe card collection has been fully verified until test keys are present and a test card has been saved through `/setup/billing`.
- Do not claim external sends, payment processing, or provider-backed email are available for pending/trial tenants.
- Do not claim advanced dispatch, full reporting, AI takeoff, mobile field app, external e-sign, accounting integrations, or full payment reconciliation are complete.

Operator Checklist:

- Fill Stripe test keys in `.env.local`.
- Restart dev server.
- Verify `/setup/billing` with test card.
- Use `/super-admin/early-access` to monitor users.
- Mark active only after review.

## Marketing / Onboarding / Early-Access QA Polish

Completed a focused QA + UX polish pass across public marketing, signup entry, early-access setup, billing fallback, pending activation, and dashboard setup guidance.

Files changed in this pass:

- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/components/stripe/setup-intent-form.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior:

- Public homepage copy was tightened around the lead-to-payment workflow without changing routes or adding new product claims.
- Company setup copy now reads as customer-facing setup instead of implementation notes.
- `/setup/billing` still uses Stripe SetupIntent only and does not charge, subscribe, store raw card data, or create duplicate billing records.
- If Stripe keys are blank or card collection fails, billing setup now gives a clear `Continue to activation` path with billing-later copy instead of trapping early-access users.
- `/setup/pending-activation` now reinforces that the workspace is ready while external sends, payment processing, and provider-backed emails remain locked until activation.
- Dashboard early-access banner now includes both `Finish setup` and `View activation status`.
- Start Here copy now directly names the expected project -> estimate -> contract path.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Browser smoke on `http://localhost:3001` confirmed `/` -> `Start Free Trial` -> `/signup?next=/setup/company`.
- Authenticated browser QA confirmed `/setup/company` survives refresh, `/setup/billing` shows the Stripe-unconfigured fallback and can continue to `/setup/pending-activation`, pending activation enters `/dashboard`, and dashboard shows both setup and activation links.
- Authenticated browser QA confirmed `/projects?compose=1`, `/estimates?compose=1`, and `/contracts?compose=1` composer anchors are reachable with no console errors.
- Authenticated browser QA created real internal project `65ada272-cca5-4270-97ae-ae7e6bd56c43`, draft estimate `86f6dad2-fc4f-4d00-b2d9-1d55f39cee62`, and generated contract `261df341-32a9-435c-91cf-e7c94bb77e38` from an existing approved estimate.
- Stripe test-card entry was not exercised because `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are blank in `C:/FloorConnector/.env.local`.

## Early Access Activation Guard

Implemented a minimal shared activation guard for irreversible production actions while keeping early-access users able to explore and create real canonical records.

Files changed:

- `apps/web/lib/organizations/activation-guard.ts`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/invoices/actions.ts`
- `apps/web/lib/notifications/system.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Guarded actions:

- customer-facing checkout/payment processing through `requestPortalInvoicePaymentAction`
- estimate customer send through `sendEstimateToCustomerAction`
- contract send-for-signature through `sendContractForSignatureAction`
- provider-backed notification email delivery through `sendTrackedNotificationEmail`

Not guarded:

- `/setup/company`
- `/setup/billing` SetupIntent card collection
- `/setup/pending-activation`
- `/dashboard`
- internal project, estimate, contract, invoice, job, scheduling, setup, review, and draft/generation records
- contractor-side onsite signature capture and portal review/signature actions once a record has already been externally sent

Behavior:

- The shared helper reads existing `companies.tenant_status` and `companies.lifecycle_state`; no sandbox/demo mode and no duplicate activation/account/billing/company model was added.
- Pending/trial organizations receive: `This action is locked during early access. Your account must be activated before sending externally or processing payments.`
- Active/approved production states are allowed through the shared helper.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Hosted Supabase verification found two current companies; both are `tenant_status = trialing` and `lifecycle_state = trial`.
- Direct server-helper verification against hosted Supabase confirmed company `865f87c3-376e-4d89-8d2c-ed4132264719` is blocked with the exact early-access lock message.
- Direct server-helper verification confirmed `active/active` and `approved/approved` organization states are allowed.
- Browser verification on `http://localhost:3001/dashboard` confirmed the pending/trial E2E user can still enter the dashboard.
- Browser verification on `http://localhost:3001/projects?compose=1` created real canonical project `Activation Guard QA 1778022703327` at `/projects/8b9ec527-d7cc-4765-9df4-5f1d3c3d553c`, confirming internal record creation remains available during early access.
- The estimate send UI was inspected on `/estimates/ebe9f26c-06f9-4fcf-8d16-8dfaa6f3cb2e`; the send button was disabled by existing estimate prerequisites, so the guard was verified through the shared server helper rather than forcing around existing workflow validation.
- No active tenant exists in the current hosted verification data, so active-org behavior was verified through the helper's active/approved state assertion instead of a live active-user browser session.

## Early Access UX Messaging Polish

Polished the user-facing early-access messaging around locked production actions without changing schema, adding sandbox/demo mode, or changing the activation guard decision rules.

Files changed:

- `apps/web/components/early-access-lock-notice.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/lib/organizations/activation-guard.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:

- Dashboard now shows a `Status: Early access` banner for pending/trial organizations with the copy: `You can explore the real system and create records now. External sends and payment processing unlock after activation.`
- The banner links to `/setup/pending-activation`.
- Estimate send, contract send-for-signature, and portal checkout/payment surfaces now share the same visible lock copy:
  - `Locked during early access`
  - `You can keep building real records. Sending externally and processing payments unlock after activation.`
- The guarded UI buttons are disabled for pending/trial organizations, while the server-side activation guard remains the final enforcement boundary.
- `/setup/pending-activation` now clearly says early-access users may enter the dashboard, create real projects/customers/estimates/contracts/invoices/jobs/scheduling records, and wait for activation before external sends or customer-facing payment processing.
- Start Here remains optional, dismissible through localStorage preference only, and derived from real canonical project/estimate/contract/invoice/job counts.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Browser check on `http://localhost:3001/dashboard` confirmed the early-access banner, message, and activation-status link render.
- Browser check on `http://localhost:3001/setup/pending-activation` confirmed dashboard entry, real-record creation copy, and external-send/payment lock copy render.
- Browser check on `http://localhost:3001/estimates/ebe9f26c-06f9-4fcf-8d16-8dfaa6f3cb2e` confirmed the guarded estimate-send UI shows the shared lock copy and the send button is disabled.

## Early Access Onboarding Verification Pass

Verification date: 2026-05-05.

Important Supabase note:

- This repo uses the hosted/linked Supabase project for verification. Do not use local Supabase for this workflow.
- `supabase db push --linked` reported the remote database is up to date.
- Remote `companies` columns confirmed: `stripe_customer_id` and `stripe_payment_method_id` exist.

Commands run:

- `supabase db push --linked`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Command results:

- Remote Supabase push passed.
- Typecheck passed.
- Lint passed.
- Build passed.

Browser routes checked against `http://localhost:3001`:

- `/` rendered and `Start Free Trial` links route to `/signup?next=%2Fsetup%2Fcompany`.
- `/setup/company` saved and reloaded the canonical company profile and primary location values for the authenticated E2E tenant. The company count stayed at `2` before and after save, so no duplicate organization/company record was created.
- `/setup/billing` rendered the intended no-charge billing setup shell and Stripe fallback state.
- `/setup/pending-activation` rendered the early-access state with `tenant_status = trialing`, `lifecycle_state = trial`, and an `Enter Dashboard` link.
- `/dashboard` loaded after `Enter Dashboard` and rendered canonical dashboard queues.

Stripe verification result:

- Live card verification could not be completed in this session because `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are present but blank in `C:/FloorConnector/.env.local`.
- With those env vars blank, `/setup/billing` correctly shows the Stripe-not-configured fallback and does not render a Payment Element.
- The active E2E company currently has `stripe_customer_id = null` and `stripe_payment_method_id = null`.
- Because the card flow could not run, Stripe dashboard confirmation remains pending: no customer/payment-method/no-charge/no-subscription dashboard check was completed.

Dashboard Start Here note:

- The authenticated E2E tenant already has canonical records (`projects = 4`, `estimates = 8`, `contracts = 3`, `invoices = 3`, `jobs = 6`), so `Start Here` was not visible and dismiss-click behavior was not exercised in that tenant state.
- Source behavior still derives the card from real canonical counts and hides it when no incomplete step remains.

Activation guardrail finding:

- Pending users can enter the real contractor dashboard and explore real canonical records.
- Current code has workflow-specific guards, readiness checks, and payment/checkout validation, but this pass did not find a centralized server-side activation guard that blocks production-risk actions solely because `tenant_status/lifecycle_state` are still pending/trial.
- Smallest safe follow-up before implementation: add a narrow shared server-side assertion such as `assertActivatedForProductionAction` that reads the active organization context and gates only external sends, customer-facing checkout/payment processing, and other irreversible production actions. Do not add sandbox/demo mode, new billing/account/company models, or duplicate lifecycle state.

## Stripe SetupIntent Card Collection

Real no-charge billing-method collection is now implemented on `/setup/billing` using Stripe Elements and SetupIntent only.

Files changed:

- `apps/web/app/api/stripe/create-setup-intent/route.ts`
- `apps/web/app/api/stripe/save-payment-method/route.ts`
- `apps/web/components/stripe/setup-intent-form.tsx`
- `apps/web/lib/onboarding/billing-setup.ts`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/lib/organizations/active-context.ts`
- `apps/web/package.json`
- `packages/types/src/index.ts`
- `pnpm-lock.yaml`
- `supabase/migrations/20260505194642_organization_stripe_payment_method_refs.sql`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:

- `/setup/billing` now renders Stripe Elements when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are configured.
- The setup route creates or reuses a Stripe customer for the active organization, creates a SetupIntent with automatic payment methods, and returns only the client secret.
- The client confirms the SetupIntent with `redirect: "if_required"` and does not create a charge or subscription.
- After confirmation, the app server retrieves and verifies the SetupIntent belongs to the active organization's Stripe customer, stores only `companies.stripe_payment_method_id`, and sets the Stripe customer's default payment method.
- Stripe remains the source of truth for payment methods; no raw card data, duplicate billing model, subscription table, or fake card storage was added.
- If Stripe is not configured or SetupIntent/confirmation fails, the billing page shows a fallback/error state and lets early-access users continue to pending activation with billing-later copy.

Validation note:

- The required validation for this slice is `pnpm typecheck`, `pnpm lint`, and `pnpm build`, plus manual Stripe test-card verification with `4242 4242 4242 4242` after the migration is applied and real Stripe test keys are present.

## Stripe Test-Mode Billing Verification Attempt

Verification date: 2026-05-05.

Scope:

- Final test-mode verification for `/setup/billing`.
- No implementation changes, schema changes, subscriptions, charges, sandbox/demo mode, or duplicate billing/account/company models were added.

Pre-checks:

- `.env.local` contains `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, but both values are currently blank.
- Because both Stripe values are blank, the live Payment Element and card-confirmation path could not be exercised in this environment.
- Linked Supabase DB columns exist on `public.companies`: `stripe_customer_id`, `stripe_payment_method_id`.
- Linked Supabase DB values before/after this attempt remain `null` for both Stripe reference columns on the two current companies, because the card flow could not run without keys.

Commands run:

- `supabase db query --linked "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'companies' and column_name in ('stripe_customer_id', 'stripe_payment_method_id') order by column_name;"`
- `supabase db query --linked "select id, stripe_customer_id, stripe_payment_method_id from public.companies order by created_at asc;"`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Command results:

- Linked DB column check passed.
- Linked DB record check confirmed both current company rows have no saved Stripe references yet.
- Typecheck passed.
- Lint passed.
- Build passed.

Browser route checked:

- `http://localhost:3001/setup/billing`

Browser results with current blank Stripe config:

- Billing page rendered the `Add your billing method` shell.
- Early-access no-charge copy rendered.
- Safe Stripe-not-configured fallback rendered.
- Stripe Payment Element did not render, as expected with blank keys.
- Continue-to-activation now remains available with billing-later copy when Stripe config is blank.

Stripe dashboard / API result:

- Not verified in this session because Stripe test keys are blank in `.env.local`.
- No customer/payment-method/no-charge/no-subscription dashboard confirmation could be completed from this environment.

Remaining launch blocker:

- Add real Stripe test-mode values for `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `C:/FloorConnector/.env.local`, restart the dev server, and rerun the `/setup/billing` card test with `4242 4242 4242 4242`.

## Public Homepage And Early Access Onboarding

Investor-ready marketing and early-access setup are now implemented without adding fake demo records, sandbox-only flows, duplicate company models, or duplicate billing models.

Follow-up company profile extension implemented:

- Added `supabase/migrations/20260505192527_company_profile_onboarding_fields.sql` to extend the existing canonical `companies` row with nullable `phone`, `email`, `website_url`, `primary_trade`, `brand_accent_color`, and `time_zone` fields.
- `/setup/company` now saves those fields through the existing organization setup action alongside legal/display name, logo URL/reference, and primary location.
- `/settings/organization` can maintain the same canonical organization profile fields after onboarding.
- The shared organization brand link can use the stored brand accent color where company identity is already rendered.
- No company-registration table, onboarding profile table, duplicate company record, sandbox model, or primary-location behavior change was added.
- Logo upload remains deferred; the current implementation stores only a hosted logo URL or storage reference.

Files changed:

- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/lib/auth/paths.ts`
- `apps/web/lib/onboarding/actions.ts`
- `apps/web/lib/onboarding/company-setup.ts`
- `apps/web/lib/onboarding/billing-setup.ts`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `apps/web/app/(app)/settings/organization/page.tsx`
- `apps/web/components/organization-brand-link.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/components/protected-surface-header.tsx`
- `apps/web/lib/organizations/active-context.ts`
- `apps/web/lib/organizations/admin.ts`
- `apps/web/lib/settings/actions.ts`
- `apps/web/lib/settings/schemas.ts`
- `packages/types/src/index.ts`
- `supabase/migrations/20260505192527_company_profile_onboarding_fields.sql`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:

- Public `/` is now a premium black/white/warm-orange SaaS homepage with hero CTA to `/signup?next=/setup/company`, lifecycle visual, problem framing, canonical-record differentiation, grouped feature sections, careful competitor positioning, planned/coming-soon section, and early-access CTA.
- `/setup/company` is a protected owner/admin setup step that writes to existing `companies` fields and the existing primary `locations` address row, creating the primary location if needed.
- Company setup now stores the deferred contact/profile fields on `companies`: phone, email, website URL, primary trade/service type, brand accent color, and time zone.
- `/setup/billing` is a no-charge billing setup shell. It checks Stripe env readiness, stores Stripe customer/payment-method references on the existing `companies` organization row, and collects the card through Stripe Elements and SetupIntent only. It does not create subscriptions, charge, or fake card collection.
- `/setup/pending-activation` reuses existing `companies.tenant_status` and `companies.lifecycle_state` and lets early-access users enter `/dashboard`.
- Dashboard `Start here` is now optional, dismissible, localStorage-backed preference only, and derives completion from real projects, estimates, contracts, invoices, and jobs.
- Empty-state copy was tightened for projects, estimates, contracts, and invoices around the canonical workflow.

Deferred:

- Logo upload/storage UI remains deferred; use the logo URL/reference field for now.
- Deeper billing, subscription activation, plan selection, reconciliation, and retry workflows remain deferred.
- No new admin activation model was added because super-admin tenant lifecycle controls already exist.

Validation status:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Company profile extension validation: `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed after adding the canonical `companies` fields and setup/settings wiring.
- `supabase db push --local --dry-run` could not run because local Supabase Postgres was not reachable on `127.0.0.1:54322`; `supabase status` also could not inspect local containers because Docker was not available/running in this session.
- Browser save/reload verification for `/setup/company` remains blocked until `20260505192527_company_profile_onboarding_fields.sql` is applied to the database used by the local dev server.
- Browser smoke via Playwright against `http://localhost:3000` confirmed `/` renders and the primary `Start Free Trial` CTA points to `/signup?next=%2Fsetup%2Fcompany`.
- Browser smoke with saved authenticated state confirmed `/setup/company`, `/setup/billing`, `/setup/pending-activation`, and `/dashboard` load.
- Browser smoke confirmed `Enter Dashboard` on `/setup/pending-activation` reaches `/dashboard`.
- Dashboard Start Here was not visible for the current authenticated tenant because the completion conditions were already satisfied, so dismiss-click behavior was not exercised against this tenant state.

## System Layers First Migration Slice

Schema-only first slice implemented for future product/spec and floor system template foundations.

Migration:

- `supabase/migrations/20260505120000_system_layers_first_slice.sql`

Tables added:

- `finish_products`
- `floor_system_templates`
- `floor_system_template_components`

What changed:

- Added tenant-owned product/spec metadata foundation with `company_id`, `created_by`, `updated_by`, generated normalized lookup fields, CHECK constraints, useful indexes, update triggers, RLS enable/force RLS, and membership-based RLS policies.
- Added tenant-owned floor system template and component foundation.
- `floor_system_template_components.catalog_item_id` is required and same-company enforced through composite FK to `catalog_items(company_id, id)`.
- `floor_system_template_components.finish_product_id` is optional product/spec proof metadata and uses column-scoped `on delete set null (finish_product_id)`.

Deferred:

- no selected systems
- no visualizer sessions
- no estimate or contract snapshots
- no shared files/file links
- no communication delivery proof
- no activity timeline
- no seed/demo data
- no app UI, routes, APIs, server actions, tests, or product behavior

Validation:

- targeted migration grep checks passed for forbidden later-slice tables and `organization_id`
- `git diff --check` passed for the migration and touched docs
- `pnpm typecheck` passed
- `pnpm lint` passed
- `supabase db lint` was attempted, but the local Supabase Postgres service was not running on `127.0.0.1:54322`

## System Layers Second Migration Slice

Schema-only second slice implemented for selected system/spec workflow foundations.

Migration:

- `supabase/migrations/20260505140921_selected_floor_systems_foundation.sql`

Table added:

- `selected_floor_systems`

What changed:

- Added tenant-owned selected floor system/spec foundation with required `company_id`.
- Rows require at least one real canonical workflow anchor: opportunity, customer, project, estimate, contract, or job.
- Same-company composite FKs are enforced for existing canonical workflow links plus `floor_system_templates` and `finish_products`.
- Supports multiple systems per project, area/room/phase/option labels, alternates/options, quantity notes, customer-facing/internal notes, source/status/spec-completeness checks, metadata, and created/updated user tracking.
- Only one row per `company_id + project_id` can have `is_primary = true`.
- RLS is enabled and forced with active company membership policies through `public.is_active_company_member(company_id)`.
- Update trigger calls `public.set_updated_at()` without a `WHEN` clause.

Deferred:

- no UI
- no selected-system server actions
- no estimate or contract integration
- no `visualizer_sessions` or public/pre-auth visualizer handoff
- no estimate or contract system snapshots
- no shared files or `file_links`
- no message delivery proof
- no activity timeline
- no changes to current Estimate Editoror or estimate builder behavior

## System Snapshot Migration Slice

Schema-only snapshot slice implemented for future selected-system/spec proof at customer-facing estimate and contract review/signature boundaries.

Migration:

- `supabase/migrations/20260505173600_system_snapshot_foundation.sql`

Tables added:

- `estimate_system_snapshots`
- `contract_system_snapshots`

What changed:

- Added tenant-owned estimate and contract system snapshot tables with required `company_id`.
- `estimate_system_snapshots` uses same-company composite FKs to `estimates` and `selected_floor_systems`.
- `contract_system_snapshots` uses same-company composite FKs to `contracts` and `selected_floor_systems`, plus an optional same-company link to `estimate_system_snapshots`.
- Both tables preserve frozen customer/contract-facing selected-system proof metadata, including system/product/spec fields, area/phase/option labels, quantities, customer-facing description, technical notes, `component_snapshot_json`, and `metadata`.
- `component_snapshot_json` is constrained to a JSON array; `metadata` is constrained to a JSON object.
- Snapshot status values are `active`, `superseded`, `retracted`, `void`, and `amended`; normal delete/soft-delete behavior was not added.
- Partial unique active indexes prevent duplicate active snapshots for the same estimate/contract plus selected system.
- RLS is enabled and forced with active company membership policies through `public.is_active_company_member(company_id)`.
- Update triggers call `public.set_updated_at()` without a `WHEN` clause.
- A database trigger blocks DELETE and restricts UPDATE to `snapshot_status`, `metadata`, `updated_by`, and `updated_at`.

Deferred:

- no UI
- no server actions
- no estimate workflow writes
- no contract workflow writes
- no Estimate Builder integration
- no contract generation integration
- no creation/update of selected systems from estimates or contracts
- no `visualizer_sessions`
- no files or `file_links`
- no message delivery proof
- no activity events
- no seed/demo data
- no current product behavior changes

## System Layers Admin/Data Access Layer

Implemented the first admin/data access layer for the already-created first-slice system tables. This is an admin foundation only and does not add downstream workflow behavior.

Files changed:

- `apps/web/lib/system-layers/constants.ts`
- `apps/web/lib/system-layers/schemas.ts`
- `apps/web/lib/system-layers/data.ts`
- `apps/web/lib/system-layers/actions.ts`
- `apps/web/app/(app)/settings/system-layers/page.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:

- `/settings/system-layers` now lists, creates, edits, and archives tenant-owned `finish_products`.
- `/settings/system-layers` now lists, creates, edits, and archives tenant-owned `floor_system_templates`.
- Template components can be added, removed, reordered, and edited from the same settings surface.
- Server actions validate required fields, allowed status progression, service/finish family values, component quantity basis, JSON formula metadata, and tenant-owned linked records.
- Component writes require a same-company `catalog_items` row and optionally validate a same-company `finish_products` row.
- Component save normalizes `sort_order` to contiguous ordering and increments the parent template version on structural component changes.
- Template service/finish family structural changes increment `template_version`.

Still not added:

- no `visualizer_sessions`
- no estimate integration
- no contract integration
- no snapshots
- no files or file links
- no message delivery attempts/events
- no activity events
- no downstream workflow logic

## Selected Systems Admin/Data Access Layer

Implemented the first admin/data access layer for the already-created `selected_floor_systems` table. This is validation of the selected-system foundation only and does not add downstream workflow behavior.

Files changed:

- `apps/web/lib/selected-systems/constants.ts`
- `apps/web/lib/selected-systems/schemas.ts`
- `apps/web/lib/selected-systems/data.ts`
- `apps/web/lib/selected-systems/actions.ts`
- `apps/web/app/(app)/settings/selected-systems/page.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:

- `/settings/selected-systems` now lists tenant-owned selected floor systems.
- Admin users can create and edit selected systems against existing same-company floor system templates, finish products, and real workflow anchors.
- Server actions validate selected-system check values for status, source, area type, and spec-completeness status.
- Server actions validate nonnegative estimated area and linear-foot quantities.
- Same-company validation is enforced for linked opportunity, customer, project, estimate, contract, job, floor system template, and finish product records.
- Selected systems require at least one real workflow anchor; the create form requires a project by default for the validation slice.
- Project-primary validation is enforced in the data layer: when a selected system is saved as primary for a project, other primary rows for that company/project are unset first.
- Admin users can change status, retract, void, and toggle project-primary state without touching downstream records.

Still not added:

- no estimate integration
- no contract integration
- no job integration
- no snapshots
- no `visualizer_sessions`
- no files or file links
- no message delivery attempts/events
- no activity events
- no customer-facing UI
- no changes to current Estimate Editoror or estimate builder behavior

## Post-Sign Ready-To-Schedule Handoff

Implemented a UI/workflow handoff from signed contract readiness into existing job and schedule foundations. No schema, RLS, auth, route architecture, or duplicate scheduling model was added.

Files changed:

- `apps/web/components/ready-to-schedule-action-panel.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:

- Contract detail now shows a ready-to-schedule action panel only when the contract is fully signed and the existing project readiness snapshot is ready to schedule.
- Project detail now shows the same panel whenever the existing project readiness snapshot is ready to schedule.
- The panel routes to existing canonical job Quick-Create with project context, preserves approved estimate context where available, and links to the existing project-filtered `/schedule` surface.
- When exactly one unscheduled canonical job exists for the project, the ready-to-schedule panel now includes `jobId` with `action=schedule`, and `/schedule` can also infer that single project job from older `projectId + action=schedule` links so the existing schedule action panel opens immediately.
- Job Quick-Create now accepts the URL `estimateId` context from readiness handoffs and passes it into the existing canonical job create action; server-side job creation still validates the approved estimate/project relationship and the centralized readiness gate.
- Scheduling remains on canonical `jobs` and the centralized project readiness gate remains the enforcement point.

## People-Centered Portal Access Refactor

Focused refactor completed to make People the intended management home for customer-contact identity and portal access administration. No schema, RLS, auth, backend route, data-model, financial calculation, signature state-machine, payment-logic, or workflow-table changes were made.

Follow-up workflow recipient cleanup:

- Estimate send now exposes a shared `Send to contact` selector when active project-scoped portal access already provides eligible customer/contact recipients, preferring the main related contact or the only available recipient.
- Estimate send no longer presents recipient/access setup as estimate-owned management; if no eligible contact exists, the estimate page points users back to People.
- Contract send now uses the same `Send to contact` selector copy for eligible portal signers while preserving the existing signer routing and permission guards.
- Invoice send/status workflow remains on the existing canonical invoice status transition, with copy and server comments clarifying that recipient identity and portal access are managed from People rather than the invoice page.
- The stale manual-estimate Playwright resolver was updated to locate a real estimate detail page that actually exposes the current manual decision UI before running the mutation test.

Files changed:

- `apps/web/app/(app)/people/page.tsx`
- `apps/web/components/people-portal-access-panel.tsx`
- `apps/web/components/customer-contact-form.tsx`
- `apps/web/components/portal-access-grant-form.tsx`
- `apps/web/components/portal-project-access-form.tsx`
- `apps/web/lib/contacts/actions.ts`
- `apps/web/lib/portal-access/actions.ts`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/customers/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/components/estimate-form.tsx`
- `apps/web/components/send-to-contact-select.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/components/invoice-form.tsx`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/estimates/schemas.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/invoices/actions.ts`
- `e2e/estimate-manual-approval-action.spec.js`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/developer-source-of-truth.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`

Behavior changed:

- `/people` now loads related customer contacts, portal grants, stored contact-permission readiness, and project visibility using existing canonical loaders.
- Added a People customer-access panel for contact edit/create, main-contact selection, portal invite/access ensure, grant contact-linking, stored permission editing, revoke/reactivate, and project visibility using existing actions and existing canonical tables.
- Existing contact and portal-access server actions now accept an optional safe `returnTo` path for `/people` so the same actions can be hosted from People without duplicating action logic.
- Estimate and contract send surfaces now frame portal access as contact/access readiness, use contact-selection copy where eligible existing access data supports it, and point management back to People instead of making estimate/contract pages feel like access ownership surfaces.
- Customer surfaces now describe People as the portal access administration home while retaining contextual access visibility.

Existing risky access paths found:

- Customer detail was still the full portal access management surface: invite creation, grant linking, stored permission editing, revoke/reactivate, and project visibility were all presented there.
- `/people` copy and implementation were workforce-only and explicitly excluded customer recipient contacts, which conflicted with the new product direction.
- Invoice send is still an invoice status transition rather than a full contact-recipient picker; copy and server comments now make the customer/account fallback explicit.

Validation so far:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Previous Playwright attempt: `pnpm exec playwright test e2e/estimate-manual-approval-action.spec.js --project=chromium-protected` ran auth setup successfully but failed because the stale resolver selected an estimate detail page without the current manual decision UI. The resolver has since been updated to search candidate details for the active decision UI before running the mutation.

Deferred items:

- A deeper removal of duplicate customer-detail portal management controls can be done in a follow-up if the team wants Customer Detail to become read-only/context-only for access.
- A fuller invoice recipient picker is deferred until invoice sending grows a dedicated recipient-selection action; People remains the management home in the meantime.

## Decision-First UI Refactor Final Documentation Phase 14

Phase 14 completed as documentation and safe cleanup for the implemented decision-first UI refactor. No UI redesign, backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made.

Docs changed:

- `docs/current-state.md`
- `docs/ui-patterns.md`
- `docs/chat-handoff.md`
- `packages/ui/README.md`

Cleanup performed:

- Updated `docs/current-state.md` only where implemented UI behavior materially changed, replacing the stale latest UI direction note that still described unresolved clarity gaps.
- Created `docs/ui-patterns.md` as the current pattern guide for decision-first page structure, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, status color semantics, the orange CTA rule, Manager/List Page guidance, and portal/super-admin differences.
- Added `packages/ui/README.md` to document exported decision-first components, shared status helpers, theme exports, and package guardrails.
- Added this final Phase 1-14 summary to `docs/chat-handoff.md`.
- No docs or components were removed; the export/reference inventory did not show a clearly obsolete component that was safe to delete.

Validation:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings.
- `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` passed and listed 19 tests.
- Targeted decision-first primitive Playwright test passed: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/ui-primitives.spec.js --project=chromium-public`.
- Protected detail smoke tests were not rerun in Phase 14 because localhost was not running and this phase changed documentation/package docs only; the Phase 13 authenticated targeted run remains the latest protected decision-first smoke evidence.

Final Phase 1-14 summary:

- Phase 1 established shared `@floorconnector/ui` foundation pieces: theme constants, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, `SecondarySection`, and shared semantic status helpers.
- Phase 2 added contractor layout section wrappers for core workflow, execution, and support sections.
- Phase 3 captured the pre-refactor audit in `docs/ui-refactor-audit.md`.
- Phases 4-9 refactored the main contractor decision surfaces: dashboard, Project Workspace, Estimate Workspace, Invoice Workspace, Job Workspace, and Contract Workspace.
- Phase 10 cleaned up Projects, Estimates, Invoices, Jobs, Contracts, and Customers Manager Pages without changing their actions, filters, search, quick-create, or workflows.
- Phase 11 polished shared contractor UI components so cards, badges, headings, list rows, and orange CTA usage are more consistent.
- Phase 12 audited and then safely cleaned up portal/super-admin UI consistency without copying contractor ActionBar/WorkflowBar patterns or touching access/permission/workflow behavior.
- Phase 13 added targeted Playwright smoke coverage for shared primitives, dashboard PriorityStrip, and project/estimate/invoice/job/contract decision-first fixtures.
- Phase 14 documented the implemented UI baseline and package exports.

Deferred items:

- No broad visual snapshot suite was added.
- No mutation workflow tests were added for approve/send/sign/schedule/payment flows.
- No portal/super-admin structural redesign was started.
- No target IA or architecture docs were changed because their guidance was not materially stale.

## UI Refactor Testing Expansion Phase 13

Phase 13 completed as a tests-only expansion for the decision-first UI system. No UI redesign, backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made.

Files changed:

- `e2e/ui-primitives.spec.js`
- `e2e/detail-workspace-ui.spec.js`
- `e2e/dashboard-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Tests added or updated:

- Added isolated public Playwright coverage for shared UI primitives: `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`, including console error capture.
- Added authenticated dashboard smoke coverage for the PriorityStrip surface.
- Added authenticated project detail and estimate detail smoke coverage for decision-first regions.
- Added authenticated invoice detail smoke coverage for:
  - `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`
  - `/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502`
  - `/invoices/894d1e3a-c3f2-4572-869b-545f00aef027`
- Added authenticated job detail smoke coverage for:
  - `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`
  - `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4`
  - `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80`
- Added authenticated contract detail smoke coverage for:
  - draft `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8`
  - sent `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
  - signed `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4`
- Updated dashboard smoke coverage to assert the projects navigation entry is visible without relying on a brittle broad-text click.
- Updated Playwright project matching so public primitive tests stay public and protected decision-first smoke tests run only under authenticated protected coverage.

Fixtures required:

- Invoice, job, and contract fixtures listed above.
- Project detail fallback: `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`, overrideable with `FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH`.
- Estimate detail fallback: `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`, overrideable with `FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH`.
- Authenticated Playwright storage from `e2e/auth.setup.js` using the existing `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` credentials.

Validation:

- `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` passed; 19 tests listed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e:auth` passed.
- Targeted Phase 13 Playwright run passed: `PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/ui-primitives.spec.js e2e/dashboard-ui.spec.js e2e/project-detail-ui.spec.js e2e/detail-workspace-ui.spec.js --project=chromium-public --project=chromium-protected --no-deps` reported 14 passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings.

Deferred coverage:

- Mutation workflows remain intentionally out of scope: approve/send/sign/schedule/unschedule/payment actions were not exercised.
- Portal and super-admin test expansion remains deferred.
- Visual snapshot and style-only assertions remain deferred; Phase 13 uses resilient role/text checks and console/error capture.

## Portal And Super-Admin UI Consistency Cleanup Phase 12B

Phase 12B completed as a UI-only cleanup limited to the `safe now` items from [docs/portal-superadmin-ui-audit.md](C:/FloorConnector/docs/portal-superadmin-ui-audit.md).

Files changed:

- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/app/(super-admin)/super-admin/layout.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`
- `apps/web/app/(super-admin)/super-admin/admin/page.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/portal-review-ui.tsx`
- `apps/web/components/settings-nav.tsx`
- `apps/web/components/settings-overview-card.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `docs/chat-handoff.md`

Exact cleanup:

- Added neutral visual variants to shared settings shell/card/nav components and applied them only to the super-admin surface, preserving the existing warm defaults for contractor settings.
- Added a neutral `DetailPanel` variant and applied it to super-admin configuration panels where dense admin forms benefit from flatter card chrome.
- Added small shared portal review UI helpers for hero panels, state panels, inset panels, action boxes, secondary links, document panels, and status badges.
- Reduced portal hero/state card radius, glass/shadow weight, gradient panel usage, and passive brand-accent section labels on portal home, project, estimate, contract, invoice, and change-order review surfaces.
- Replaced several neutral portal status pills with shared semantic status badge styling while keeping metadata chips neutral.
- Quieted portal secondary return/review links so approve/sign/pay actions remain the clearest customer CTAs.

QA results:

- authenticated Playwright smoke QA used `playwright/.auth/local-user.json` against `http://localhost:3000`
- `/portal` loaded with status 200, stayed on `/portal`, rendered `Customer Portal`, and produced no console errors, page errors, or 500 responses
- `/super-admin` loaded with status 200, stayed on `/super-admin`, rendered `Platform Admin`, and produced no console errors, page errors, or 500 responses

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- portal visual language/density decisions remain deferred beyond this safe cleanup
- deeper portal semantic color policy remains deferred beyond conservative shared badge use
- no contractor ActionBar/WorkflowBar pattern was copied into portal or super-admin
- no auth, portal access, record loader, super-admin permission, route, schema, backend, RLS, server-action, or workflow changes were made

## Portal And Super-Admin UI Consistency Audit Phase 12A

Audit-only Phase 12A completed. No application implementation changes were made.

Files changed:

- `docs/portal-superadmin-ui-audit.md`
- `docs/chat-handoff.md`

Audit summary:

- Portal is correctly customer-facing and project-scoped, but uses repeated large rounded/glassy cards, gradients, passive brand-accent eyebrows, and neutral status chips that make some review/sign/pay states harder to scan.
- Portal primary actions are generally clear (`Approve`, `Sign`, `Continue to checkout`), but secondary return/open links often use pill styling similar to status chips.
- Super-admin should not copy contractor orange CTA behavior; its slate/black primary save/admin actions fit platform governance.
- Super-admin still carries older settings beige/orange shell chrome through shared settings components such as `SettingsSurfaceLayout`, `SettingsOverviewCard`, and `SettingsSectionCard`.
- Shared semantic status helper adoption is a safe candidate where statuses are truly statuses; metadata chips should stay neutral.
- Contractor patterns that should not be copied directly: Manager Page command bars, Quick-Create/universal-create behavior, contractor operational ActionBar/WorkflowBar assumptions, project-readiness/crew/schedule internals, and orange contractor CTA language.

Recommended phases:

- safe now: neutralize super-admin settings shell chrome, normalize portal/super-admin card radius and border language, apply shared status helpers where purely presentational, and quiet secondary portal links.
- needs design decision: portal softness/density, portal semantic color policy, and whether super-admin remains settings-shell based or gets a dedicated platform-admin shell later.
- defer: portal access/auth/RLS/sign/pay/approval workflow changes, super-admin permissions/tenant lifecycle/module-policy/data-loader changes, route changes, and blanket ActionBar/WorkflowBar rollout.

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- no auth, portal access, record loader, super-admin permission, route, schema, backend, RLS, workflow logic, or application UI implementation changes were made

## Decision-First UI Refactor Phase 11

Global component polish completed as a UI-only shared contractor-component pass. Scope stayed on shared contractor UI primitives and small consistency fixes affecting the already-refactored contractor pages.

Files changed:

- `apps/web/components/app-empty-state.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/linked-record-card.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/universal-create-menu.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/workspace-composer-sheet.tsx`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- Shared workflow/detail primitives already used `rounded-lg` shells and semantic status helpers.
- `ManagerDashboardCard` already had shared status badge support from the manager-page cleanup.
- Remaining reusable drift was concentrated in warm beige/orange shell chrome: manager headers, command bars, empty states, linked record cards, detail headers, quick-create sheets, and the universal-create menu.
- Orange appeared in several passive eyebrow/header/link treatments, not only primary CTAs.

Exact polish made:

- Neutralized shared contractor manager headers, command bars, empty states, linked record cards, detail headers, quick-create sheet chrome, and universal-create menu panels to white/gray system surfaces.
- Kept orange on actual primary create/CTA buttons; removed orange from passive eyebrows, menu group labels, back links, empty-state chrome, and hover-only card emphasis.
- Standardized shared contractor cards and rows around `rounded-lg`, `#e2e5e9` borders, white backgrounds, `#f8fafc` hover/empty surfaces, and gray secondary text.
- Aligned `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, and `SecondarySection` typography/colors with the black/gray decision-first system.
- Removed the heavier primary-section shadow so shared workflow sections feel more consistent with ActionBar/WorkflowBar/summary cards.
- Preserved existing component props, links, forms, conditionals, and status-helper behavior.

QA results:

- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/dashboard` loaded with status 200 and no console errors, page errors, or 500 responses
- `/projects` and project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` loaded with status 200 and no console errors, page errors, or 500 responses
- `/estimates` and estimate detail `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e` loaded with status 200 and no console errors, page errors, or 500 responses
- `/invoices` and invoice detail `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7` loaded with status 200 and no console errors, page errors, or 500 responses
- `/jobs` and job detail `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886` loaded with status 200 and no console errors, page errors, or 500 responses
- `/contracts` and contract detail `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8` loaded with status 200 and no console errors, page errors, or 500 responses
- `/customers` loaded with status 200; opened customer detail `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d` from the customer list path with status 200 and no console errors, page errors, or 500 responses

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- no portal, super-admin, settings, new page layouts, or broader app-shell navigation polish was attempted
- no mutation QA was performed because this phase was visual/component-only
- no backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made

## Decision-First UI Refactor Phase 10C

Customers list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/customers` only.

Files changed:

- `apps/web/app/(app)/customers/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- Customers manager preserved existing search, `New customer` quick-create link, success/error messages, queue card links, recent-record customer links, empty-state create path, `WorkspaceComposerSheet`, `CustomerQuickCreateForm`, and `quickCreateCustomerAction`.
- Existing loaded customer, project, and financial-settings data only was used; no invoice/balance data was introduced because the page does not currently load customer balance context.
- No new filters, server actions, routes, data fetches, workflow states, or mutation paths were introduced.

Exact UI changes:

- Customers summary tiles were normalized to the same compact neutral-card treatment used by the other decision-first manager pages.
- Customer queue cards now use semantic badges for action-oriented records such as missing contact/address and project-linked customers.
- A linked-project count map now supports existing-data project continuity cues without changing data loading.
- Recent customer rows now include a `Continuity` column that shows next cues from existing contact/address/project-link data: add direct contact, add address, linked project count, or ready for first project.
- Financial defaults now use the shared semantic badge helper for taxable/tax-exempt display, with retainage kept secondary.
- The primary `New customer` action, search behavior, quick-create overlay, and empty-state create path remain unchanged.

QA results:

- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/customers` loaded with status 200, `New customer` was visible, customer detail links were present, continuity cues rendered, and no console errors or bad responses were captured
- opened customer detail from the list candidate `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d`; it loaded authenticated with status 200 and no console errors or bad responses

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- no customer detail, portal, super-admin, settings, or other manager page changes were made
- no backend, schema, auth, RLS, server-action, data-model, route, workflow, balance logic, portal-access logic, or customer-create behavior changes were made
- no mutation QA was performed for customer creation or customer editing in this UI-only phase

## Decision-First UI Refactor Phase 10B

Invoices, Jobs, and Contracts list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/invoices`, `/jobs`, `/contracts`, and the invoice records panel used by the Invoices manager.

Files changed:

- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/jobs/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- Invoices manager preserved existing search, invoice status filters, context hidden inputs, rows-per-view control, `New invoice` quick-create link, queue card links, paid-context links, scoped-context clear link, `WorkspaceComposerSheet`, `InvoiceQuickCreateForm`, and `quickCreateInvoiceAction`.
- Jobs manager preserved existing search, job view filters, project scoping, `New job` quick-create link, queue card links, recent-record job links, empty states, `WorkspaceComposerSheet`, `JobQuickCreateForm`, and `quickCreateJobAction`.
- Contracts manager preserved existing search, status filters, `New contract` quick-create link, snapshot-repair estimate link, queue card links, recent-record contract links, empty states, `WorkspaceComposerSheet`, `ContractQuickCreateForm`, and `quickCreateContractFromEstimateAction`.
- Existing loaded data only was used for continuity cues; no new data fetches, filters, server actions, routes, workflow states, or mutation paths were introduced.

Exact UI changes:

- Invoices manager summary, command filters, billing posture, scoped-context notice, paid queue, and invoice records panel were neutralized to reduce passive beige/orange noise while leaving `New invoice` as the clear primary action.
- Invoice records now use shared `getStatusBadgeClassName()` status badges and show a light continuity cue such as finish billing detail, collect payment, settled, or voided from existing status/due-date data.
- Invoice queue cards now use semantic invoice status badges and balance-focused continuity copy while preserving existing balance-due calculations.
- Jobs manager summary tiles were normalized to the same compact neutral-card treatment used by the other decision-first manager pages.
- Jobs queue cards now show semantic dispatch-status badges; the recent records table now uses shared status badges and a `Schedule / crew` column with cues for scheduling, crew vendor, crew assignments, active work, or closeout from existing job/assignment data.
- Contracts manager summary tiles were normalized to the compact neutral-card treatment.
- Contract queue cards and recent records now use shared status badges and signature-readiness cues derived from existing status, readiness, customer signature, contractor countersign, and signed timestamps.
- Contracts keep green/completed styling limited to `signed` records; sent/viewed/readiness states remain warning/neutral/info rather than completed.

QA results:

- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/invoices` loaded with status 200, `New invoice` was visible, a real invoice detail/edit link was present, continuity cues rendered, and no console errors were captured
- `/jobs` loaded with status 200, `New job` was visible, real job detail links were present, schedule/crew cues rendered, and no console errors were captured
- `/contracts` loaded with status 200, `New contract` was visible, real contract detail links were present, signature cues rendered, and no console errors were captured
- opened invoice detail from the list candidate `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`; it loaded authenticated with status 200 and no console errors
- opened job detail from the list candidate `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`; it loaded authenticated with status 200 and no console errors
- opened contract detail from the list candidate `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8`; it loaded authenticated with status 200 and no console errors
- note: the initially running dev server had stale dynamic chunks that produced 404 console noise for jobs/contracts; restarting the local dev server cleared the stale chunk state, and the final QA run had no console errors or bad responses

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed after removing one obsolete invoice helper
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- no customers, portal, super-admin, settings, or detail-page refactors were made
- no backend, schema, auth, RLS, server-action, data-model, route, workflow, balance logic, scheduling logic, crew logic, or signature logic changes were made
- no mutation QA was performed for invoice creation, job creation, contract generation, scheduling, crew assignment, payment, send, sign, or countersign flows in this UI-only phase

## Decision-First UI Refactor Phase 10A

Projects and Estimates list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/projects`, `/estimates`, and the estimate records panel used by the Estimates manager.

Files changed:

- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- Projects manager preserved existing search form, status filters, `New project` quick-create link, queue-card links, recent-record detail links, empty-state create link, `WorkspaceComposerSheet`, `ProjectQuickCreateForm`, and `quickCreateProjectAction`.
- Estimates manager preserved existing search form, status filters, rows-per-view control, `Add estimate` quick-create link, estimate detail/edit links, queue cards, status breakdown links, empty-state create path, `WorkspaceComposerSheet`, `EstimateQuickCreateForm`, `quickCreateEstimateAction`, and inline customer quick-create action.
- Existing loaded data only was used for continuity cues; no new data fetches, actions, filters, routes, or workflow states were introduced.

Exact UI changes:

- Projects manager summary tiles were lightly normalized with the same compact rounded neutral-card treatment used by the decision-first manager direction.
- Projects workflow queue cards now show semantic status/finance badges through the existing `ManagerDashboardCard` status-badge path and use existing project readiness/status fields for concise continuity cues.
- Projects recent records now use shared `getStatusBadgeClassName()` status badges and replace the plain commercial-state column with a clearer continuity column derived from existing readiness/status fields.
- Estimates summary tiles and status breakdown were neutralized to reduce passive beige/orange noise while leaving the orange `Add estimate` action as the primary create CTA.
- Estimates status breakdown now uses shared status badge classes for draft/sent/approved/rejected scan consistency.
- Estimate records panel now uses shared status badge classes, neutral table chrome, tighter hover/divider treatment, and a light `Next:` continuity line derived from existing estimate status/customer-view fields.

QA results:

- authenticated Playwright browser QA ran against `http://localhost:3001` using `playwright/.auth/local-user.json`
- `/projects` loaded authenticated, `New project` quick-create entry was visible, real project detail links were present, and no browser console errors were captured
- opened real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` from the list-link set; it loaded authenticated with expected project-detail content and no browser console errors
- `/estimates` loaded authenticated, `Add estimate` quick-create entry was visible, estimate records/detail links were present, new `Next:` continuity copy rendered in row link text, and no browser console errors were captured
- opened real estimate detail `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e` from the list-link set; it loaded authenticated with expected estimate-detail content and no browser console errors

Validation:

- `pnpm typecheck` passed after aligning the project continuity helper with the real `CommercialReadinessStatus` enum (`not_ready`, not `not_started`)
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- no customer, invoice, job, contract, portal, super-admin, route, workflow, backend, schema, auth, RLS, server-action, or data-model changes were made
- no deeper list-page IA expansion, new ActionBar, new filters, new queues, or mutation QA was added in this phase

## Decision-First UI Refactor Phase 9.1

Contract Detail sent/awaiting fixture setup and QA completed through existing contractor UI/server actions only. No direct contract-state writes or readiness/signer guard bypasses were used.

Files changed:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `docs/chat-handoff.md`

Fixture setup:

- started from draft contract `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
- used the existing Customer Workspace Portal Access invite form for customer `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d`
- scoped the existing active local QA login email to project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` through the normal customer-level portal access path
- returned to Contract Detail, selected the now-eligible customer portal signer through the existing send-for-signature form, and submitted `Send for signature`
- stopped before any customer signature, onsite signature, decline, or contractor countersign action

Sent fixture:

- sent/awaiting contract: `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
- state verified: `sent`, `Awaiting customer`, `0/1 signed`, locked because signature activity has started

Exact UI/QA results:

- authenticated Playwright auth setup passed against `http://localhost:3000`
- draft fixture `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8` loaded with no console errors, kept draft send readiness visible, showed no standalone `Sign` action, kept signer routing and recent signature events visible, and had no green/emerald styling
- sent fixture `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` loaded with no console errors, showed `Await customer signature`, showed no `Send for signature`, showed no standalone `Sign`, showed no contractor countersign action, kept onsite customer signature available as the valid unsigned-customer path, kept sent PDF snapshot visible, kept signer routing and recent signature events visible, and had no green/emerald styling before full signature completion
- signed fixture `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4` loaded with no console errors, showed `Signature complete`, kept signer routing and recent signature events visible, showed no send/sign/countersign controls, and was the only tested state with green completed styling
- WorkflowBar remained conservative: the sent fixture showed contract progress as `0/1 signed`, job as not created, invoice as not linked, and payment as not collected
- small UI-only follow-up made during QA: Contract Detail WorkflowBar no longer marks the upstream Estimate step complete/green until the contract itself is fully signed, satisfying the no-green-before-signed rule

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- portal customer sign/decline mutation testing remains intentionally unexercised for this pass
- contractor countersign mutation testing remains deferred because this fixture was sent without a required contractor countersigner
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 9

Contract Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the Contract Review workspace and the contract detail action component used by that workspace.

Files changed:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- actions/forms preserved: draft edit link, internal approval status updates, send-for-signature customer signer selection, optional contractor countersigner selection, contractor countersign, onsite customer signature modal, void action, and sent PDF snapshot link
- links preserved: contracts manager, source estimate, project readiness hub, customer/project context, project schedule, linked jobs, linked invoices, related conversations, and generated/sent PDF context
- conditional states preserved: draft send readiness, internal approval blockers, signature lock/editability, sent/viewed awaiting customer, declined, void, signed/completed, customer signer routing, optional contractor countersign, signature events/history, and deposit/project-readiness follow-through

Exact UI changes:

- replaced the old agreement identity/next-action summary band with `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`
- made the top `ActionBar` choose the truthful next signature step: edit/review draft readiness, send for signature, await customer, contractor countersign, signature complete, declined, or void
- added a conservative `WorkflowBar` for `Estimate -> Contract -> Job -> Invoice -> Payment`, with green completion only when the existing linked records prove completion
- added a compact `Signature state` summary for contract status, signer progress, signature mode, and edit lock state
- wrapped the agreement body in `PrimarySection` so contract content is the primary review surface
- kept workflow actions, signer routing, schedule handoff, connected workflow links, related conversations, editability/lock details, revisions, and recent signature events visible below the document as supporting context
- changed pre-completion contract action styling so internal approval and contractor countersign states no longer use green; green is reserved for fully signed/completed contract state

QA results:

- authenticated Playwright auth setup passed against `http://localhost:3000`
- draft contract `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` loaded with no console errors, showed the new `ActionBar`, `Contract workflow`, `Signature state`, and `Contract content`, kept `Edit draft`, draft-only send readiness, workflow actions, signer routing, schedule handoff, connected workflow links, and recent signature events visible, and showed no standalone `Sign` action
- signed contract `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4` loaded with no console errors, showed `Signature complete`, conservative downstream workflow state from real linked jobs/invoices/payments, signer progress `1/1 signed`, locked edit state, sent PDF snapshot, signer routing, connected workflow, and recent signature events, with no send, edit, void, sign, or countersign controls visible
- the contracts manager showed 3 visible contracts total: 2 draft ready-to-send contracts and 1 signed contract; it showed 0 sent and 0 viewed contracts
- sent/awaiting browser QA was not exercised because no sent/viewed contract exists locally, and both available draft contracts lacked an eligible customer signer for a safe UI-only send action

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- sent/viewed awaiting-customer Contract Detail QA remains pending until a real sent/viewed contract fixture exists or a safe eligible customer signer is available through normal UI setup
- customer portal sign/decline and contractor countersign mutation testing were not performed in this UI-only pass
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8

Job Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the Job Workspace only.

Files changed:

- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- actions/forms preserved: `updateJobAction` status progression, `scheduleJobAction`, `unscheduleJobAction`, `assignCrewAction`, and `unassignCrewAction`
- links preserved: jobs manager, project hub, customer workspace, linked estimate, linked invoice, invoice creation from completed uninvoiced jobs, time cards, punchlists, and daily logs
- conditional states preserved: job dispatch status progression, completed-job invoice handoff, operational blockers for unscheduled/unassigned/uninvoiced-completed jobs, schedule edit visibility, unschedule visibility, crew assignment rows, and empty states for punchlists/daily logs

Exact UI changes:

- replaced the old top summary band with `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`
- made the top story execution-first: current job action, schedule state, crew state, dispatch status, and project context
- promoted `Schedule and crew` to the first primary working section, with schedule save/unschedule and crew assign/unassign controls kept together
- moved project/customer/estimate/invoice context into secondary connected-record areas and removed estimate total emphasis from the job page
- moved job notes into the side rail and kept daily logs, time, punchlists, and connected records visible but secondary
- removed duplicate status/schedule/crew summaries from the side rail

QA results:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright auth setup passed against `http://localhost:3000`
- authenticated `/jobs` browser QA reached the Jobs Manager Page with no console errors, but the local contractor account currently has 0 jobs, so unscheduled/scheduled/in-progress/completed Job Workspace QA could not be exercised without creating or mutating data

Deferred items:

- browser QA on real unscheduled, scheduled, in-progress, and completed Job Workspace records remains pending until local QA data includes jobs
- no mutation testing of schedule, unschedule, crew assignment, crew unassignment, status progression, or invoice creation was performed in this UI-only pass
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8.1

Job Detail QA fixture setup and verification completed against the preferred `24 Investor Way` QA chain using existing contractor-app UI and server actions only.

Files changed:

- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Exact UI change:

- tightened the Job Workspace unschedule visibility guard so `Unschedule job` renders only for `scheduled` jobs, not `unscheduled`, `in_progress`, or `completed` jobs

QA fixtures created or used:

- unscheduled job: `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`
- scheduled job: `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4`
- in-progress job: `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80`
- project: `/projects/6922a413-1350-496c-89d9-6b03dcbad0f1`

Exact QA results:

- authenticated Playwright auth setup passed against `http://localhost:3000`
- the unscheduled, scheduled, and in-progress Job Workspace pages all loaded as authenticated protected pages with no browser console errors
- `ActionBar` truthfulness verified: unscheduled shows `Mark scheduled`, scheduled shows `Start work`, in-progress shows `Mark complete`
- `WorkflowBar` did not overstate downstream completion for unscheduled or scheduled jobs, and did not claim field work complete for the in-progress job
- `ProjectStateSummary` showed schedule, crew, status, and project context on each fixture
- schedule visibility verified: unscheduled keeps schedule entry visible without `Unschedule job`; scheduled keeps `Unschedule job`; in-progress hides `Unschedule job`
- crew visibility verified: `Add assignment` remains visible; no assignable person or vendor options were available for the tested in-progress fixture, so no `Unassign` control was expected
- project, customer, daily execution context, time, and invoice context remained visible on all three fixture detail pages

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- completed-job fixture QA was not created in this pass; the safe existing UI path was stopped at in-progress
- crew unassignment was not exercised because no assignable crew/person/vendor options were available in the existing assignment UI
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8.2

Job Detail polish and regression review completed against the existing Phase 8.1 fixtures. No new job fixtures were created.

Files changed:

- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:

- changed the schedule form heading to `Set schedule` for unscheduled jobs and `Update schedule` for scheduled or in-progress jobs
- kept unscheduled schedule entry as an explicit `Save schedule` action instead of showing an initial `Saved` state before any schedule exists
- kept the existing schedule save action wiring unchanged for all statuses where schedule updates remain visible
- reduced crew-assignment emphasis when no assignable crew members or labor-provider vendors exist by replacing the empty assignment form/button with a quiet setup note
- preserved the full existing crew assignment form and `assignCrewAction` path when assignable people or labor-provider vendors are available
- left estimate and invoice context in the secondary connected-record area and kept estimate totals out of the job page

QA results:

- authenticated Playwright auth setup passed against `http://localhost:3000`
- unscheduled fixture `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886` loaded with no console errors, showed `Mark scheduled`, showed `Set schedule` with `Save schedule`, did not show `Unschedule job` or `Start work`, kept the conservative workflow/state summary visible, and showed the softened no-crew-options note
- scheduled fixture `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4` loaded with no console errors, showed `Start work`, showed `Update schedule`, showed exactly one `Unschedule job`, kept the WorkflowBar conservative, and showed the softened no-crew-options note
- in-progress fixture `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80` loaded with no console errors, showed `Mark complete`, showed `Update schedule`, did not show `Unschedule job`, marked execution as in progress without claiming field work complete, and showed the softened no-crew-options note
- all three fixtures kept Job Workspace, Job execution workflow, Job execution state, Schedule and crew, Connected Records, Daily Execution Context, and Labor and Time context visible
- browser QA required refreshing the Playwright storage state before individual fixture checks because the local Supabase session rotated during repeated scratch-script page loads; this did not require any app change or data mutation

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:

- completed-job fixture QA remains deferred
- crew assignment and unassignment were not mutation-tested because the existing QA organization has no assignable people or labor-provider vendors available
- no Contract Detail work was started
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Contractor UI Cleanup Pass

Focused shared-component UI cleanup completed after the Project Detail decision-first refactor. This was UI-only polish, not a new feature phase or page-layout refactor.

Files changed:

- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`
- `apps/web/components/linked-record-card.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/chat-handoff.md`

Exact UI cleanup made:

- standardized the new decision-first shells on neutral `8px` radius cards with consistent neutral borders
- changed `WorkflowBar` current/in-progress styling from amber to blue, matching the status-color rule
- split `ProjectStateSummary` tones so active/current can be blue while needs-action/readiness blockers use yellow
- kept non-clickable `ActionBar` next-action labels neutral instead of brand-colored
- removed decorative warm gradients/borders from contractor linked record cards
- calmed contractor manager dashboard cards by neutralizing eyebrow labels, badges, hover states, and secondary action buttons
- updated project detail readiness warning mapping to use the new `needsAction` state summary tone

Behavior preserved:

- no project detail actions, links, forms, guards, server actions, readiness calculations, data loaders, workflow behavior, auth, RLS, route architecture, schema, backend, or data model changed
- dashboard, estimates, invoices, jobs, contracts, portal, super-admin, and list pages were not refactored into new layouts
- the completed Project Detail structure remains intact: `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and core Estimate/Contract/Job/Invoice workflow grouping remain in place

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright QA passed after restarting a stale dev server that was serving a bad client chunk
  - login completed through `/login` using root `.env.local` E2E credentials without printing credential values
  - checked `/dashboard`, real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`, `/estimates`, and `/invoices`
  - project detail rendered the decision-first stack: Project Workspace, Project readiness workflow, Project state summary, Core Workflow, Estimate, Contract, Job, and Invoice
  - project estimate and invoice links remained visible and did not break authentication during interaction checks
  - no browser console errors were captured on the passing QA run
  - screenshots were saved under `test-results/ui-cleanup-*.png`

Intentionally deferred cleanup:

- no `DetailPanel`, portal, or super-admin card restyling in this pass because those shared surfaces cross the contractor-only scope
- no dashboard, estimate, invoice, job, contract, or list-page layout refactors
- no mutation testing of create/save actions; this pass only verified visibility, navigation/auth continuity, and rendering stability

## Contractor UI System Hardening Pass

Focused post-cleanup hardening completed before the Dashboard phase. This was a UI-only and test-infra-only pass scoped to shared contractor UI components, Project Detail, and protected Playwright setup.

Files changed:

- `packages/ui/src/status.ts`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/index.ts`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `e2e/auth.setup.js`
- `e2e/project-detail-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Exact hardening made:

- added one shared `@floorconnector/ui` status presentation helper for status tone mapping and status badge/connector classes
- centralized semantic status colors for gray neutral/draft/not-started, blue active/current/in-progress, yellow needs-action/waiting/readiness-warning, red blocked/error/failed, and green complete/approved/paid/signed
- updated `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, project detail badges, and contractor manager-card badges to use shared status presentation instead of local status-color strings
- preserved orange for primary CTAs only; project follow-up warning actions now render as neutral secondary actions
- removed the remaining passive `brand-*` current-state styling from project readiness stage cards by routing those through the shared status helper
- made `PrimarySection` slightly stronger than secondary/support sections with neutral border weight and a minimal shadow so the Project Detail core workflow has subtle priority
- inspected Project Detail next-action cases without changing business logic; no misleading display/link target was found that required workflow changes
- fixed `e2e/auth.setup.js` to load root `.env.local`, scope to the email/password form, and click `Log in with email` instead of the Google OAuth submit button
- added `e2e/project-detail-ui.spec.js` to smoke-test the Project Detail `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and `Core Workflow`

Behavior preserved:

- no backend, schema, auth logic, RLS, route architecture, server action, data loading, readiness calculation, workflow behavior, forms, permissions, or guards changed
- no dashboard, estimate, invoice, job, contract, portal, super-admin, or list-page layout refactor was started
- Project Detail remains the decision-first workflow/readiness hub with `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and core Estimate/Contract/Job/Invoice grouping intact

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- Playwright auth setup passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
- protected Playwright Project Detail smoke test passed under the `chromium-protected` project
- authenticated browser QA passed for `/dashboard` and real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
- browser QA verified `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` are visible on Project Detail
- safe navigation QA clicked the visible `Review contract` project action and landed on `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` without redirecting to login
- no browser console errors were captured during the passing QA checks

Intentionally deferred:

- no further global card system changes outside the requested shared components
- no portal/super-admin consistency pass
- no Dashboard phase work or other page-level layout refactors
- no mutation testing of create/save/payment/signature actions

## Decision-First UI Refactor Phase 5

Dashboard decision-center refactor completed as a UI-only contractor-app change. Scope stayed on the contractor dashboard surface and dashboard smoke QA; no estimate, invoice, job, contract, portal, super-admin, or list-page layout refactor was started.

Files changed:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/dashboard/priority-strip.tsx`
- `e2e/dashboard-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Inventory before editing:

- visible actions and links included Universal Create, top shortcuts to Projects, Schedule manager, Payments manager, and Cost items database, metric links to Leads, Estimates, Schedule, and Appointments, queue links into attention items, leads, estimates, contracts, projects, jobs, appointments, invoices, payments, and project context links, plus onboarding links to Settings, Customers quick-create, Projects quick-create, and Estimates quick-create
- metrics included leads needing follow-up, estimates awaiting action, jobs needing schedule, appointments today, jobs today/live, role, active projects, open receivables, scheduled appointments, unscheduled jobs, open punchlists, ready progress-billing workspaces, customer count, estimate count, and open receivables
- conditional sections included high-signal attention, onboarding setup guide, commercial queues, operations queues, finance queues, empty states, top shortcut metrics, and quick-create access
- existing data loaders and server actions remained the same: customer, opportunity, estimate, approved-estimate, project, contract, job, appointment, punchlist, invoice, payment, notification, progress-billing, financial settings, workflow settings, and quick-create actions for lead/customer/project/estimate/contract/job/invoice/change order

Exact UI changes:

- added dashboard-only `PriorityStrip` at the top of the dashboard content, derived from existing notification, receivables, estimate, and job queues
- reordered the visible dashboard structure to Priority Strip -> Key Metrics -> Onboarding when needed -> Work Queues
- renamed the metric grid treatment to a clearer key-metrics section: `Pipeline and execution snapshot`
- kept Universal Create in the header as the single orange primary create CTA
- normalized passive dashboard header, onboarding, queue cards, and queue badges toward neutral-first styling
- routed dashboard queue badges and onboarding status badges through the shared `@floorconnector/ui` status helper
- preserved all existing dashboard data sources, links, quick-create action wiring, search, queue filtering, and empty states
- added a protected Playwright dashboard smoke test for the decision-center headings, Universal Create visibility, Projects navigation, and console-error check

Behavior preserved:

- no backend, schema, auth logic, RLS, route architecture, server action, data model, workflow behavior, guards, or data loading changed
- quick-create access remains visible from the dashboard header
- existing dashboard actions and links remain visible where their original conditions apply

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright dashboard smoke QA passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
  - login completed through the existing setup project using root `.env.local` E2E credentials without printing credential values
  - `/dashboard` rendered the new `Decide what needs attention first` priority strip and `Pipeline and execution snapshot` key metrics section
  - Universal Create remained visible
  - the dashboard Projects navigation path worked and landed on `/projects`
  - no browser console errors were captured during the passing dashboard QA run

Intentionally deferred:

- no mutation testing of create/save actions
- no dashboard data-loader or priority algorithm changes beyond existing loaded data
- no refactor of dashboard placeholders or non-rendered quick-create prop plumbing
- no estimates, invoices, jobs, contracts, portal, super-admin, or list-page layout changes

## Phase 5 Dashboard Polish Review

Focused dashboard-only review and polish completed after the Phase 5 decision-center refactor. This remained UI-only and did not expand into other contractor pages or downstream record workspaces.

Files changed:

- `apps/web/components/dashboard/priority-strip.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `docs/chat-handoff.md`

Exact polish made:

- reviewed the Phase 5 dashboard diff for action placement, priority-strip usefulness, metric placement, queue grouping, and passive color noise
- removed the orange CTA from `PriorityStrip` so Universal Create remains the clear primary orange dashboard CTA
- changed `PriorityStrip` count pills from status-colored badges to neutral count markers, reducing duplicate status emphasis above the queues
- kept all PriorityStrip cards clickable to their existing queue/workspace destinations and preserved their action-label guidance as neutral text
- adjusted the priority strip grid to four neutral priority lanes on wide screens so it reads as a compact triage strip instead of a duplicate queue panel
- added a quiet `Work queues` heading before the queue grids so the dashboard clearly transitions from priority and metrics into follow-up lists

Behavior preserved:

- all dashboard data loaders, quick-create server actions, links, filters, search behavior, empty states, and queue destinations were preserved
- no backend, schema, auth, RLS, server action, data model, route, workflow behavior, estimates, invoices, jobs, contracts, portal, super-admin, or list-page behavior changed

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright dashboard QA passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
  - login completed through the existing setup project using root `.env.local` E2E credentials without printing credential values
  - `/dashboard` rendered the priority strip and key metrics
  - Universal Create remained visible
  - the dashboard Projects navigation path worked and landed on `/projects`
  - no browser console errors were captured during the passing dashboard QA run

Deferred:

- no mutation testing of quick-create actions
- no visual polish outside the dashboard
- no additional dashboard data prioritization rules beyond the existing loaded queues

## Decision-First UI Refactor Phase 6

Estimate Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the estimate detail page and preserved the existing editor, estimate calculations, catalog/system insertion, approval states, server actions, and workflow guards.

Files changed:

- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- visible actions included Back to estimates, Back to edit, Generate contract for approved estimates, Open project workspace, the preferred next-action link, approved-estimate contract/SOV/snapshot recovery actions, Send estimate, Manage customer portal access, Open customer, Review linked lead, manual estimate status actions, connected project/contract/job/invoice links, schedule links, and communication links
- links included estimates list, estimate editor, project workspace, contracts, invoices, jobs, schedule, customers, leads, and related communications where records exist
- readiness and blocker messages included estimate status meaning, project readiness status, active project blockers, send prerequisites, missing customer email blocker copy, approval/contract-generation snapshot recovery guidance, schedule approval blockers, and customer timeline events
- related-record sections included readonly line items, scope/SOW, reusable terms/inclusions/exclusions, notes, workflow actions, customer timeline, connected workflow, production schedule/schedule handoff, and related conversations
- server actions/forms preserved on the page were `sendEstimateToCustomerAction`, `EstimateStatusActions`, `quickCreateContractFromEstimateAction`, `openOrCreateScheduleOfValuesAction`, and `rebuildApprovedEstimateSnapshotAction`
- conditional rendering preserved approved-only next steps, draft/rejected send actions, customer email prerequisites, manual decision actions, customer/lead blockers, schedule handoff copy, linked downstream records, and empty downstream workflow messaging

Exact UI behavior changed:

- replaced the older top summary band with the shared `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` directly under the estimate header
- made the ActionBar the dominant next-action surface and moved Back to edit/Open project workspace into neutral secondary actions
- added an Estimate -> Contract -> Job -> Invoice WorkflowBar derived from existing linked records and statuses only
- added an Estimate state summary for status, total/subtotal, tax/discount, line item count, and project readiness/blockers
- moved readonly line items ahead of customer/project/support context so the proposal body is the primary workspace
- removed the duplicate lower Pricing Snapshot panel because subtotal, discount, tax, and total are preserved in the state summary and document header
- switched connected workflow badges to the shared status badge helper for consistent neutral/status-only color usage

Behavior preserved:

- no backend, schema, auth, RLS, server action, data model, route architecture, estimate calculation, tax, discount, line item, catalog/system generation, approval, approved-snapshot, or workflow behavior changed
- estimate editor functionality and save behavior were not refactored
- no dashboard, invoice, job, contract, portal, super-admin, or list-page layout work was started

Validation:

- `pnpm typecheck` passed after correcting display-only status assumptions in the new WorkflowBar/state summary mapping
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright auth setup passed against `http://localhost:3007` using root `.env.local` E2E credentials without printing credential values
- authenticated browser QA passed on real estimate `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`
  - verified `Estimate workflow`, `Estimate state summary`, and `Line items` render on the detail page
  - verified navigation from estimate detail to `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
  - verified draft estimate line-item add through existing catalog quick-add, then remove/save returned the editor to `Saved`
  - no browser console errors were captured during the passing QA run
  - screenshot saved at `test-results/estimate-detail-phase-6.png`

Deferred:

- no test file was added in this phase because the existing protected QA flow covered the required real estimate detail and editor smoke checks without introducing a new framework or broad test surface
- no deeper estimate editor layout refactor; this phase kept edits to the estimate detail page
- no mutation testing of send/approval/contract-generation actions beyond visibility and navigation checks

## Phase 6 Estimate Detail Polish Review

Focused estimate-detail-only review and polish completed after the Phase 6 decision-first refactor. This remained UI-only and did not expand into the estimate edit layout, dashboard, invoices, jobs, contracts, portal, super-admin, or list pages.

Files changed:

- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:

- reviewed the Phase 6 estimate detail diff for ActionBar placement, WorkflowBar state accuracy, summary duplication, totals/line-item hierarchy, and preserved links/actions
- changed draft estimate ActionBar guidance from approval-oriented copy to `Review and send estimate`, linking to the existing estimate editor instead of the manual decision anchor
- clarified sent estimate ActionBar copy as `Record customer decision`, keeping manual approval/rejection framed for offline/non-portal decisions only
- clarified rejected estimate ActionBar copy as `Revise or resend estimate`, linking to the existing editor
- tightened WorkflowBar downstream state display so Job only becomes current when linked jobs exist or the primary contract is signed, and Invoice only becomes current when linked invoices exist or completed linked jobs justify billing review
- kept downstream WorkflowBar descriptions conservative: unsigned or missing contract now reads as after signed contract/readiness rather than implying scheduling is already ready
- removed the duplicate Status card from `ProjectStateSummary`; status remains visible in the ActionBar, while the summary now focuses on total, tax/discount, line items, and project readiness

Behavior preserved:

- existing estimate detail data loading, send actions, manual decision actions, linked record links, project navigation, approved-estimate next-step panel, readiness messages, line item display, forms, guards, editor handoff, and catalog/system workflow behavior were preserved
- no backend, schema, auth, RLS, server action, data model, route, estimate calculation, tax, discount, approval, catalog, system, or workflow behavior changed

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- `pnpm e2e:auth` passed against `http://localhost:3007` using the root `.env.local` E2E credentials and `playwright/.auth/local-user.json`
- authenticated Playwright QA passed on draft estimate `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`
  - verified ActionBar, WorkflowBar, ProjectStateSummary, totals, and line items render
  - verified draft WorkflowBar keeps Contract after approval, Job after signed contract/readiness, and Invoice after production/billing trigger
  - verified navigation from estimate detail to the linked project still works
  - verified draft editor quick-add from catalog, remove, and save flow still works
- authenticated Playwright QA passed on approved estimate `/estimates/72acf60d-4486-4774-a3dd-2f86f0b1f912`
  - verified approved ActionBar renders one of the existing downstream next actions
  - verified the approved estimate edit surface still shows approved/next-step context
  - no browser console errors were captured during the passing QA run

Deferred:

- no new permanent Playwright spec was added during this polish pass because the existing protected auth setup plus targeted one-off browser QA covered the required draft and approved estimate checks
- no estimate editor visual refactor was attempted
- no mutation testing of send, approval, rejection, contract generation, SOV, or deposit actions beyond existing visibility/navigation checks

## Decision-First UI Refactor Phase 7

Invoice Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the invoice detail page and preserved the existing invoice editor, calculations, line items, tax, retainage, balances, payment recording form/action wiring, statuses, server actions, and workflow guards.

Files changed:

- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- visible actions included Back to invoices, Record payment, Open progress billing workspace for AIA progress invoices, Open project readiness hub, continuity links to progress billing or project workspace, the payment recording form, the invoice edit/progress-source panel, linked schedule/job actions, connected-record links, and related-conversation actions
- links included invoices list, project readiness hub, progress billing workspace, customer, estimate, job, schedule, change orders, and related communications where records exist
- readiness and blocker messages included resolved route error/message banners, online payment readiness copy, customer payment/progress copy, recent payment signal copy, void-invoice payment blocking copy, progress billing missing-workspace copy, project readiness metadata, and schedule/job/crew context notices
- related-record sections included invoice review/continuity, line items, billing notes, latest payment activity, totals and billing math, billing configuration, payment recording, edit/progress source, production schedule, connected records, invoice metadata, and related conversations
- server actions/forms preserved on the page were `recordInvoicePaymentAction` through `InvoicePaymentForm` and `updateInvoiceAction` through `InvoiceForm`
- conditional rendering preserved void/draft/sent/partially-paid/paid next-action handling, payment-event messaging, payment recording visibility for non-void invoices, progress-billing workspace handoff, linked job versus project schedule context, connected records, and paid/partially-paid status derivation inside the existing invoice form

Exact UI behavior changed:

- replaced the older top identity/summary band with shared `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` directly below the invoice header
- made the ActionBar the dominant billing next-action surface; sent/partially-paid/open invoices still point at existing payment recording, paid invoices point back to the project hub, void invoices stay review-only, and draft invoices now point to the existing invoice-editing section instead of implying payment collection
- added an Estimate -> Contract -> Job -> Invoice -> Payment WorkflowBar derived only from existing linked records, project readiness snapshot, invoice status, payments, and balance state
- added an Invoice state summary for total, paid, balance due, and retainage held when present, making balance due unmistakable near the top
- moved line items ahead of continuity/support context so billing scope is the primary workspace
- reduced duplicate status/totals emphasis by removing the former invoice identity/current billing state block
- neutralized passive progress-billing and lineage styling so orange remains reserved for the primary CTA
- kept payment activity visible below line items and billing notes as secondary review context

Behavior preserved:

- no backend, schema, auth, RLS, server action, data model, route architecture, invoice calculation, tax, retainage, balance, payment recording, line item, status, readiness, or workflow behavior changed
- no dashboard, estimate, job, contract, portal, super-admin, or list-page layout work was started

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed after removing dead display helpers made obsolete by the top-stack replacement
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- `pnpm e2e:auth` passed against `http://localhost:3000` using the root `.env.local` E2E credentials and `playwright/.auth/local-user.json`
- authenticated browser QA logged in through the app login page and checked `/invoices`, but the authenticated E2E account currently has zero invoice records: Draft 0, Sent 0, Open balance 0, Paid 0, Void 0
- authenticated browser QA also checked real project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`; no invoice detail links were present on that project
- no browser console errors were captured while checking the authenticated invoice manager/create surface

Deferred:

- no permanent Playwright spec was added during initial implementation because fixture coverage was added later through real authenticated QA invoices

## Phase 7 Invoice Detail Fixture Polish

Focused invoice-detail-only review and polish completed against the new real QA fixtures:

- unpaid: `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`
- partial: `/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502`
- paid: `/invoices/894d1e3a-c3f2-4572-869b-545f00aef027`

Files changed:

- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:

- verified the ActionBar remains truthful for sent/unpaid, partially paid, and paid invoice states
- preserved the `Record payment` primary CTA and existing payment form for unpaid and partially paid invoices
- removed misleading payment-recording prompts from settled/paid invoices by replacing the form area with a secondary `Payment Activity` review state
- changed the paid/settled payment readiness label to `Payment settled`
- kept the WorkflowBar conservative by marking Payment complete only when `invoice.status` is `paid`
- renamed the lower support totals panel from `Totals and billing math` to `Detailed billing math` so the top balance summary remains the primary financial focus
- preserved line items as the primary billing workspace and payment activity as secondary review context

Behavior preserved:

- no backend, schema, auth, RLS, server action, data model, route, invoice calculation, tax, retainage, balance, status, line item, payment recording, or workflow behavior changed
- no dashboard, estimates, jobs, contracts, portal, super-admin, list pages, invoice editor, or payment-provider behavior changed

QA results:

- unpaid fixture showed sent invoice state, ActionBar `Record the next payment`, visible `Record payment` link and form, balance due `$594.59`, Payment step `No payment recorded`, and no console errors
- partial fixture showed partially paid invoice state, ActionBar `Collect the remaining deposit balance`, visible `Record payment` link and form, balance due `$394.59`, Payment step `1 recorded payment`, and no console errors
- paid fixture showed paid invoice state, ActionBar `Billing review is current`, no `Record payment` link or form, balance due `$0.00`, settled payment activity copy, Payment step `1 recorded payment`, and no console errors

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred:

- no broader invoice list/editor, dashboard, estimate, job, contract, portal, or super-admin cleanup was attempted
- no permanent Playwright spec was added in this polish pass; coverage remained targeted authenticated browser QA on the three real invoice fixtures

## Snapshot

FloorConnector is a production-first specialty-contractor operating system built on one shared canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Latest Contract Generation Fix

- `/contracts?compose=1` now opens the contract Quick-Create composer consistently, preserves `estimateId` selection context, and displays decoded `error` query blockers inside the composer.
- The missing approved-snapshot blocker now points users back to the estimate recovery path: rebuild the approval snapshot from the approved estimate, then generate the contract again.
- Contract-generation guardrails were not weakened: generation still reads only approved estimate snapshots and still refuses approved estimates with missing snapshot lineage.
- Approval normally creates the required immutable snapshot through the database trigger `snapshot_estimate_on_approval`, which calls `create_estimate_commercial_snapshot` when an estimate status becomes `approved`.
- If an already-approved estimate is missing its approved snapshot, treat it as old/bad data or an environment that missed the snapshot migration. The Estimate Workspace and Estimate Editor now show a warning and expose `Rebuild Approval Snapshot`, which calls the canonical `create_estimate_commercial_snapshot` path only for an approved estimate with no existing snapshot.
- Data-repair note: old approved estimates may need this rebuild action before contract generation. Do not patch a fake snapshot, do not toggle status manually, and do not generate contracts from mutable/current estimate data.
- Backend mismatch fixed after QA: the affected estimate `d5f508a6-61f6-459c-8982-88ef45714472` did have `estimate_commercial_snapshots` row `714f5d9c-407d-45ed-adfc-62e9e4553138` with two `estimate_commercial_snapshot_items`; contract generation was misclassifying it as missing because Supabase returned numeric snapshot fields as JavaScript numbers while the contract snapshot guards only accepted strings.
- Contract generation now accepts string or number numeric values from `estimate_commercial_snapshots` and `estimate_commercial_snapshot_items`, then normalizes them to strings for contract rendering. The rebuild action also verifies the same contract-generation snapshot header and item query before reporting success.
- Follow-up response-shape mismatch fixed after the snapshot guard passed: contract creation inserts and requests `{ id }`, then reloads the full contract record before redirecting. The reload query omitted top-level `contracts.reference_number` even though `isContractRow` requires it, so the helper returned `null` and surfaced `Unexpected contract response after generation`. Contract reloads now use the canonical `contractSelect`, including `reference_number`.
- `workflow_error_events` is now the lightweight tenant-scoped workflow failure log. Contract generation failures are recorded with action `contract.generate_from_estimate`, subject `estimate`, safe metadata, and user context when available. Organization owners/admins can review recent events from `/settings/admin`.
- Approved snapshot rebuild failures are recorded as `estimate.rebuild_approval_snapshot` with safe estimate context only when the recovery action fails.
- Validation run for this fix: `pnpm typecheck` and `pnpm lint` passed. Playwright spec discovery passed with `PLAYWRIGHT_SKIP_WEB_SERVER=1`; a headless `/contracts?compose=1&estimateId=<id>&error=<encoded message>` check reached the local app but redirected to `/login` because no saved contractor auth state or E2E credentials were available in this session.

Current stage:

- Phase B first-pass foundations are now implemented for onboarding readiness polish, reporting basics, Sales Tax Summary, and manual notification-only automation
- Inventory / Cost Item Database Phase 1 audit is recorded in [docs/inventory-cost-item-database-plan.md](C:/FloorConnector/docs/inventory-cost-item-database-plan.md). The safe implementation decision is to keep `catalog_items` as the canonical reusable cost item database, with optional stock tracking through linked `inventory_items` and audited `inventory_transactions`; no new `contractor_cost_items` table was added.
- Catalog item hardening follow-up is documented in [docs/catalog-items-hardening-test-plan.md](C:/FloorConnector/docs/catalog-items-hardening-test-plan.md), and a read-only duplicate-name report lives at [scripts/catalog-items-duplicate-normalized-name-report.sql](C:/FloorConnector/scripts/catalog-items-duplicate-normalized-name-report.sql). No automated test harness exists yet, so no new framework was introduced.
- Cost Items Database UI was safely tightened on the existing catalog item grid: rows now surface type/category, unit, default cost, default price behavior, taxable state, active/archived state, and the default item marker; duplicate name/SKU save errors now return clearer organization-scoped guidance.
- Documentation is now aligned that `catalog_items` is the canonical cost item database and Phase 1 inventory/cost item foundation; deeper estimate/invoice integration is intentionally deferred to future workflow work and should preserve snapshot lineage.
- Catalog-to-estimate/invoice integration is now designed in [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md). It is planning plus current-status alignment: catalog items provide reusable defaults, estimate and invoice line items must snapshot selected values, custom one-off lines remain valid, invoice billing should continue to prefer approved estimate/SOV/change-order lineage, and direct catalog use in invoices is limited to explicit invoice-only manual catalog-backed adjustments.
- Estimate Editor includes a `Catalog Items` panel on the Items workspace. It lists organization-scoped `catalog_items`, supports name search plus type/category filters, shows unit, default price, taxable state, and active/archived status, and previews selected items before insertion.
- Estimate Catalog Selection Phase 2B is now implemented from the Estimate Editoror Catalog Items panel. Active non-system catalog items can be previewed and added to estimates through the existing `insertCatalogItemToEstimateAction` path, creating server-owned estimate line-item snapshots. Archived items remain visible for review but are disabled in the panel and rejected server-side; systems still use the existing system expansion flow. No migrations, invoice behavior, or estimate calculation formulas were changed.
- Phase 2B estimate catalog insertion QA checklist now lives at [docs/qa-estimate-catalog-item-insertion.md](C:/FloorConnector/docs/qa-estimate-catalog-item-insertion.md). It covers active insertion, archived blocking, system-flow preservation, snapshot fields, quantity default, editability, catalog-change immutability, custom one-off items, totals, and `pnpm typecheck` / `pnpm lint`.
- Documentation alignment after catalog-to-estimate work is complete across current-state, developer source of truth, roadmap, workflows, and supporting catalog docs. Current truth: `catalog_items` remains canonical, estimate catalog insertion is implemented for active non-system items with server-owned snapshots, the manual QA checklist exists, and invoice catalog usage is intentionally limited to explicit invoice-only manual catalog-backed adjustments rather than free catalog insertion as normal invoice scope.
- current recommendation is to pause feature expansion and run internal validation before contractor beta; use [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- contractor UI system is stabilized and normalized
- contractor app and portal both run on shared canonical records
- the product now has its implemented financial engine and notification foundation in place
- remaining Phase B gaps are support/release checklist, onboarding runbook, beta candidate criteria, bug triage process, and recorded validation results
- `/people` is still the implemented workforce-oriented route today, while `/directory` now provides the first read-only contractor-facing account/contact workspace over canonical records
- customer, person, vendor, and lead detail pages now include compact Directory-context handoff cards so users can jump back to the read-only index while those canonical record pages remain the editing/workflow homes
- customer detail now also includes a compact related-contacts management section over canonical `contacts` and `customer_contacts`, with contractor-admin add/edit/main-contact controls while canonical `customers.email` still drives estimate/contract/invoice recipient continuity
- `/directory` now also shows related customer contacts as read-only `Customer Contact` rows that point back to the parent customer detail workspace for management
- customer detail now also supports contact-linked portal grants on canonical `portal_access_grants.customer_contact_id`, while null-contact grants still remain valid customer-level access; Directory remains read-only
- customer detail now also stores and edits linked-contact portal permissions on canonical `customer_contact_portal_permissions`
- customer detail now clearly labels customer-level versus linked-contact portal grants and guides admins to attach legacy customer-level grants to existing related contacts when they are ready
- linked-contact grants now enforce stored permissions for portal estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- contractor-side customer signer options now filter out linked-contact portal users when `canSignContracts` is off
- contractor-side onsite contract signing is implemented and verified on the same canonical contract/signature system as portal signing; QA passed contractor UI send, signer routing, onsite canvas signature, canonical `signer_signed` event, signed contract status, and project readiness sync
- verified onsite signing QA record: contract `c6e12b54-985d-4d2c-9618-5e54657e06f9`, estimate `f11c2eae-338d-4b08-8781-fcdb81b918be`, customer signer `7e3cf4ef-cf79-4801-b775-6eaa1b588abe`, project `cbb32597-59c6-424b-9c3c-77f2b40ba0d0`, organization `29230b6a-a870-4b85-8b7d-4bfed4c8dfad`; validation passed with `pnpm typecheck`, `pnpm lint`, and `git diff --check` reporting CRLF warnings only
- deposit follow-through after signature is conditional on organization workflow settings: required deposits use the existing canonical deposit invoice/payment chain, and no deposit invoice is created when deposit readiness is not required
- null-contact customer-level grants still keep legacy behavior, and contract view/countersign, invoice/payment, estimate send, and broader portal view behavior are unchanged
- seed-free internal QA workflow checklist now lives at [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md) for repeatable Phase A manual testing
- local browser QA auth/session setup now lives at [docs/local-qa-auth-session-note.md](C:/FloorConnector/docs/local-qa-auth-session-note.md); use it when protected routes redirect to `/login` from an expired local Supabase session
- estimate send, portal approval, and contract-generation QA prerequisites now live at [docs/qa-estimate-send-approval-contract-prerequisites.md](C:/FloorConnector/docs/qa-estimate-send-approval-contract-prerequisites.md); use it to prepare customer email, portal project access, portal approval, and approved snapshot lineage without bypassing canonical guards
- contractor-initiated portal invites are now implemented on top of canonical `portal_access_grants` and `portal_project_access`: customer detail can create a pending project-scoped invite for a customer/contact email, show a one-time local invite URL, and `/portal/invite?token=...` validates the hashed token before existing login/signup activates the grant for a matching authenticated email
- Phase B validation created a fresh lead -> customer -> project -> draft estimate chain and dedicated customer contacts for portal QA. The previous blocker that portal grants required an already-authenticated portal user is addressed by the contractor-initiated invite/account-bootstrap flow.
- Follow-up portal QA confirmed `jfilamonte@gmail.com` is the contractor owner/admin identity and `filamontej@gmail.com` is the clean customer portal identity. `filamontej@gmail.com` was added as a related contact through the customer UI. The customer-page render blocker was fixed by removing the ambiguous stored-permission relationship embed, and the contractor UI now creates a pending linked-contact portal grant for `filamontej@gmail.com`, creates active project access for the Phase B project, and displays the one-time local invite URL after creation. Do not store raw invite tokens in docs. Resume with clean-session invite acceptance as `filamontej@gmail.com`, portal isolation, estimate send, portal approval, approved snapshot verification, and contract generation.
- internal QA integrity pass tightened context preservation: `/jobs?projectId=...` now actually filters canonical jobs, project completed-job invoice actions carry the `jobId` into invoice Quick-Create, `/invoices` preserves project/estimate/job/deposit context through filters, and Directory copy now reflects implemented linked-contact portal permissions
- Phase A completion report and Phase B readiness checklist now live at [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- contractor onboarding readiness polish is now live: dashboard shows a lightweight `Start here` guide for settings, first customer, first project, and first estimate; leads/customers/projects/estimates empty states include direct Quick-Create actions; no schema, model, or lifecycle logic changed
- Phase B progress checkpoint now lives at [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md), and recommends internal validation before more feature breadth
- Phase B internal validation runbook now lives at [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md), with ordered passes for core workflow, portal permissions, reports, Sales Tax Summary, automation runner, communications, and onboarding/empty states

## New Systems Summary

Added systems:

- Incident + OSHA System

- HR System

- Task System

- Progress Billing

- Marketing + Lead Ingestion

- Purchasing + Inventory

- Subcontractor System

- PTO / Workforce Management

- Service Layer

- Mobile-First Requirements

## Architectural Risks

- Duplicate models: Ensure no separate employee or subcontractor entities.

- Silo systems: All extend canonical entities.

- Data ownership: Service layer read-only.

## Built Now

Implemented on the current branch:

- auth, tenant bootstrap, organization-aware access control
- leads, customers, projects, estimates
- first read-only `/directory` workspace over canonical customers, related customer contacts, workforce people, vendors, and leads, with each row routing back into the existing canonical detail page
- canonical `customers` remain the customer/account source of truth for estimate send, invoice recipient, contract customer context, payment/billing context, and project ownership; a future `Directory` view must not replace that with a generic contact model
- customer detail now surfaces canonical related customer contacts beneath the customer account, with contractor-admin add/edit/main-contact management on top of `contacts` and `customer_contacts`
- customer estimate send, portal review, approval, rejection, and estimate email tracking
- approved estimate commercial snapshots as the downstream commercial baseline
- canonical contracts with signer routing, portal signature actions, and contractor-side onsite signature capture
- canonical change orders with contractor + portal workflow, immutable approved snapshots, and SOV or invoice integration
- server-side Project Readiness Gate is implemented
- jobs, scheduling, and execution workflows are blocked until readiness conditions are met
- canonical jobs with first-pass scheduling fields and crew assignment foundation
- canonical appointments for site visits, estimate meetings, follow-up visits, and internal coordination on the same lead/customer/project chain
- invoices, payments, immutable payment events, and portal payment initiation
- snapshot-based invoice lineage across approved estimate snapshots, SOV rows, approved change-order snapshots, and invoice-only adjustments
- real contractor-side progress billing / schedule-of-values workflow on the canonical approved-estimate snapshot and invoice chain
- first read-only `/reports` surface for internal beta reporting basics:
  - lead pipeline, estimate status, invoice summary/aging, recent payment activity, and project readiness blockers
  - server-side tenant-scoped summaries over canonical `opportunities`, `estimates`, `invoices`, `payments`, and `projects`
  - Sales Tax Summary over canonical `invoice_tax_reporting_entries` / invoice tax snapshots, using invoice issue-date filtering, taxable sales, exempt sales, tax collected, invoice/payment status context, and customer exemption snapshot visibility
  - no reporting tables, exports, BI layer, mutations, tax filing, or tax-provider integration
- notification events, notifications, notification deliveries, and canonical communication threads/messages
- first shared universal-create launcher in the contractor shell and dashboard, routed through canonical Quick-Create flows
- first-login dashboard setup guidance and first-record empty-state actions for the lead -> customer -> project -> estimate startup path
- first real contractor-side global search in the protected header, grouped across canonical records and routing into the existing workspaces
- first real contractor-side notifications layer in the shared shell and dashboard, backed by stored canonical notification records and routing into real downstream workspaces
- seed-free internal QA workflow checklist for opportunity -> payment testing, linked-contact permission checks, communications checks, schedule filter checks, and canonical lineage regression watchlist
- first contractor-side communications surface at `/communications`, reading canonical threads/messages and stored unread notifications with a small safe reply composer plus safe read-triage on canonical per-user communication notifications
- `/communications` now also supports URL-driven filtering for status groups and supported source record types, plus text search over the loaded canonical thread labels and preview text
  - status and source filters now shape the server-side communications loader where safe, while text search remains the safe client-side fallback so URL behavior stays unchanged
  - supported source filters are currently customer, project, estimate, contract, invoice, change order, and payment only; unsupported queries such as `source=job` now show a small help state so job communications are not implied
  - selected threads now show a clearer chronological canonical message history with actor labels, timestamps, compact source context, and a stronger empty state
  - direct thread links now show unavailable-thread guidance when the requested thread is not visible in the current queue instead of silently falling back to another thread
  - reply and notification triage forms now handle the all-sources view safely and clarify that replies do not send email/SMS or trigger automation
- project and customer detail pages now include compact communication-context handoff cards that summarize canonical related threads and deep-link back into `/communications`
- project detail now also includes a compact production-schedule handoff card derived from canonical jobs and job assignments, surfacing schedule counts and next scheduled continuity while leaving scheduling actions in `/schedule`
- project detail next-action guidance now reads more like the operating hub: it uses existing estimate, contract, change-order, job, invoice/payment, and readiness state to surface the next supported action plus clearer blocker copy
- customer detail now also includes a compact production-schedule handoff card derived from canonical customer projects, jobs, and job assignments, surfacing customer-level schedule counts, next scheduled continuity, and project-aware handoff back into `/schedule`
- estimate detail now also includes a compact schedule-handoff card that stays blocked for draft/sent/rejected estimates and, once approved, derives project-level production counts, next scheduled continuity, and crew-state visibility only from canonical estimate `projectId`, project jobs, and job_assignments
- contract detail now also includes a compact schedule-handoff card derived only from canonical contract `projectId` plus canonical jobs and job_assignments, surfacing project-level production counts, next scheduled continuity, and crew-state visibility without introducing a contract/schedule bridge model
- invoice detail now also includes a compact linked-schedule handoff card derived only from canonical invoice `projectId` / optional `jobId` links plus canonical jobs and job assignments, so billed work can be read against current production state without introducing a billing-schedule bridge model
- phase-one lead-to-invoice CTA normalization is now live on dashboard, leads, estimate detail, and project detail; prefer the canonical labels `Start estimate`, `Send estimate`, `Approve estimate`, `Generate contract`, `Open progress billing`, and `Create invoice` in follow-up passes
- contractor-side Estimate Review now intentionally supports manual/offline customer decisions from draft or sent estimates through the shared estimate status-transition action: `Record customer approval` and `Record rejection` are for paper signature, verbal approval, fake email during testing, non-portal customers, and workflow testing before send-mail and portal delivery are complete; this is not a duplicate approval model
- phase-two estimate-builder UI polish is now live on Estimate Editoror: the existing item-entry area is grouped into one clearer estimating-tools cluster, catalog insertion is more visible, manual item wording now clearly means catalog-backed estimate items, and import-from-another-estimate now supports real line-item import for same-organization source estimates into draft destination estimates only
- reusable estimate-content UI polish is now live across Estimate Editoror/detail and the existing defaults/block surfaces: scope / SOW, project details, terms, inclusions, and exclusions now read more clearly as reusable estimating content, defaults are framed as empty-state starting content only, and project-detail/content import is still called out honestly as later work
- reusable-content insertion is now unified inside Estimate Editoror with one shared inserter for Scope / SOW, Terms, Inclusion, and Exclusion blocks; it still uses the current content-block system, still appends into the active estimate, and still does not implement estimate-import or project-details import
- reusable-content import from another estimate is now also live for draft destination estimates only; Scope / SOW, Terms, Inclusions, and Exclusions append into the active estimate from same-organization source estimates only, while project-details/context import still remains out of scope
- estimate import UX now uses one shared source-estimate chooser in the estimating tools area; users pick a source once and then choose line-item or reusable-content import actions from the same compact panel, while all import guardrails and append-only behavior stay unchanged
- `/settings/workflows` now explains estimate defaults more clearly: Scope / SOW, Terms, Inclusions, and Exclusions are starting defaults for empty estimates only, reusable blocks still append on demand, estimate import still copies from a selected prior estimate, and contractor settings are framed as organization-owned defaults even when they began from platform starter defaults
- `/schedule` now also accepts an optional `projectId` query for project-detail handoff, filtering the same canonical jobs list by `jobs.project_id` while keeping existing `q`, crew, view, and action behavior intact
- `/schedule` now also shows a compact active-filter banner for project, search, crew, and selected job/action handoff state, with clear links that drop only that filter while preserving the rest of the current query context
- `/jobs` now also accepts and applies an optional `projectId` query, preserving project-scoped job handoff across status filters, search, and Quick-Create
- `/invoices` now preserves project, estimate, job, and deposit workflow query context across invoice filters/search so invoice creation from project or completed-job context stays tied to the same canonical source
- contract, invoice, change-order, and estimate detail pages now include the same compact communication-context handoff cards over canonical thread summaries
- first contractor-side automation readiness surface at `/settings/automation`, documenting automation concepts against real canonical settings, notifications, communications, scheduling, contracts, estimates, change orders, and payment foundations with readiness summary, missing dependencies, safe-next-build guidance, and recent canonical samples
- `/settings/automation` now saves notification-only automation preferences on the existing organization workflow settings row and includes a manual tenant-scoped runner:
  - supported triggers are customer message received, estimate awaiting approval, contract awaiting signature, and invoice overdue
  - eligible runs create canonical `notification_events` and per-user in-app `notifications`
  - `automation_runs` stores the audit/idempotency ledger for executed, blocked, skipped, and failed outcomes
  - no email/SMS/provider send, customer-facing message, queue/cron, or workflow mutation is performed
- `/settings/automation` now also shows a read-only eligibility preview/debug view so saved preferences can be compared against sample canonical event or record context
- `/settings/automation` now also shows static preview-only notification copy templates for supported future automation categories
  - intended recipients, trigger source, sample subject/body copy, and required canonical context fields are visible for planning
  - templates are not editable, not saved separately, and do not send anything
- `/settings/automation` now also shows a compact read-only automation build plan per category
  - each plan combines saved future preferences, one eligibility sample, and the static preview template definition
  - the plan does not save planner output or mutate canonical workflow records
- contractor dashboard now works as a denser command-center surface with operational metrics, modular queues, dashboard-local Quick-Create, and shortcuts back into shared Manager Pages
- Phase B validation found and fixed CF-parity blockers on dashboard and estimates:
  - contractor dashboard now promotes canonical open estimates, unpaid/overdue invoices, upcoming appointments, leads, active projects, and today/live jobs higher in the board
  - Estimates Manager Page (`/estimates`) now reads more like a CF-style estimating module landing page with recent client responses, pending approval, status breakdown, draft/approved/revision queues, and a denser estimate register
  - Add Estimate now starts from customer/account, then existing-or-new project, then estimate basics, with optional linked opportunity as upstream context only
  - project-launched estimate creation now derives the customer/project context before submit, linked lead/project handoffs preserve existing opportunity context, and create validation errors render inside the Add Estimate sheet instead of on the background page
  - direct `/estimates` creation with an existing customer project now reuses an opportunity already linked to that project when present, instead of creating duplicate upstream opportunity context
  - seed-free estimate QA fixed customer-detail blockers from older schema caches around related contacts/contact permissions and now shows connected estimates on the Customer Workspace
- contractor shell/header now carry breadcrumb and page-context continuity inside the unified top header instead of a separate blue-style page band
- shared contractor shell, Manager Page wrappers, Quick-Create surfaces, and common overview cards now broadly follow the newer black/gray/orange/white contractor theme instead of the older blue-heavy manager styling
- first real contractor-side module dashboards for payments and schedule on top of the shared Manager Page system
- the schedule manager now includes review-first summary metrics, next actions, crew-state continuity, and a real week/day/board calendar-planner layer on the same canonical jobs
- the board layout now groups the filtered canonical job set into operational timing lanes: unscheduled ready work, today, tomorrow, next 7 days, later scheduled, and in progress
- the `/schedule` action panel can now review and unassign crew directly on canonical `job_assignments`, and it blocks crew attachment until the job has a real schedule commitment
- first real contractor-side punchlist system on the shared project/job execution chain
- people, vendors, compliance, time tracking, daily logs, field notes, execution attachments
- contractor settings and super-admin foundations
- Cost Items Database Phase 1 foundation is present on the current branch:
  - `catalog_items` is the organization-scoped reusable cost item master for materials, labor, equipment, subcontractors, other items, and systems
  - no duplicate cost item table should be created; future workflows should extend or snapshot canonical `catalog_items`
  - `inventory_items` is optional stock tracking linked to catalog items where needed
  - `inventory_transactions` records auditable quantity movements
  - `/cost-items-database`, `/cost-items-database/items`, `/cost-items-database/inventory`, `/cost-items-database/systems`, and `/settings/catalogs` are the implemented contractor/admin surfaces
  - estimate and invoice calculations were intentionally left unchanged; line items continue to snapshot selected item data and historical estimates/invoices must not mutate when catalog items change
  - duplicate normalized catalog item name hardening is currently covered by server-helper checks plus a documented test plan and read-only duplicate report script, not automated tests
  - the existing item grid is the safe admin surface for catalog management; it now includes clearer reusable-cost-item empty-state copy without wiring the database into new estimate or invoice behavior

Current Directory-direction reminder:

- a future `Directory` workspace should unify contractor-facing account and contact browsing over canonical records
- customer entries in that future Directory remain full canonical customer/account records
- additional customer contacts remain related contacts beneath the canonical customer/account
- workforce people remain operational `people` records
- vendors remain vendor/company records, with vendor contacts as later related-contact work
- super admin remains platform-only and outside contractor Directory

## Stable Baseline

Treat these as current implementation guardrails:

- top-nav-first contractor shell
- shared Manager Page pattern
- shared Record Workspace pattern for detail pages; do not invent new page structures
- reuse existing context-card patterns and make every workflow page answer "What do I do next?"
- dashboard/header visual direction is now the styling reference point for the broader contractor app
- black/gray/orange/white contractor theme across shared shell and Manager Page surfaces; orange is the default primary action/active accent, blue is not a default contractor-app accent, and green/emerald is reserved for semantic statuses
- global search now lives at the shell level instead of as a dashboard placeholder
- punchlists are now real canonical execution records, not a dashboard placeholder
- appointments are now real canonical coordination records, not a dashboard placeholder
- progress billing / SOV is now real contractor-side billing workflow, not a dashboard placeholder
- Quick-Create -> canonical record -> full workspace
- project detail as the main readiness and continuity hub
- contractor and portal as two surfaces on the same system

## Product Direction

FloorConnector is not a collection of module apps.

Direction now locked in:

- one shared lifecycle system
- continuity over module silos
- dashboards are entry surfaces, not separate product worlds
- Quick-Create should be available broadly, but must always create canonical records

## Not Built Yet

Still intentionally not implemented:

- full dispatch-grade scheduling system
- deeper dispatch automation
- a fully finished page-by-page contractor reskin on every lower-traffic surface
- deeper AIA/pay-app export and reporting workflows beyond the current canonical progress-billing surface
- broader contractor-side send/reply UX on top of the canonical thread/message foundation
- broader contractor-side communications workflow depth beyond the first safe reply composer on `/communications`
- broader automation workflows beyond the first manual notification-only runner
- broader reporting / analytics beyond the first read-only `/reports` basics surface
- broad redesign work

## Next Build Phase

Primary focus for the next phase:

- run and record seed-free Phase B validation from [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- reporting and Sales Tax Summary accuracy checks
- manual automation duplicate-guard and recipient validation
- internal beta support/release checklist
- contractor onboarding runbook and beta candidate criteria

Goal:

- prove the current foundation before contractor beta, then fix only validation-blocking defects before adding more breadth

## Estimate Editoror Group-First Planning

Long-term Estimate Editoror workflow planning now lives at [docs/estimate-editor-group-first-refactor-plan.md](C:/FloorConnector/docs/estimate-editor-group-first-refactor-plan.md). This is planning only: no code, schema, invoice behavior, or estimate calculations changed. Current findings: the editor already has workspace `itemGroups`, line-level `group_name`, grouped customer-facing output, catalog insertion, system expansion, and previous-estimate import; however, catalog/system/import insertion does not yet target a selected group directly. Recommended direction is to make groups the primary authoring surface, move the permanent Catalog Items panel into a group-scoped Add Item drawer, and phase work through UI-only regrouping, group-level catalog add, group-level system/template add, previous-estimate reuse, and a later larger design/v0 pass.

## v0 UI Cleanup Brief

The next header/project/estimate UI cleanup brief now lives at [docs/v0-ui-cleanup-brief-header-project-estimate.md](C:/FloorConnector/docs/v0-ui-cleanup-brief-header-project-estimate.md). This is design/documentation only: no code, schema, estimate calculation, invoice behavior, catalog insertion behavior, or workflow changes. The brief covers responsive top-nav overflow while preserving the top-nav-first shell, searchable project Quick-Create customer selection, project detail contextual workspace navigation with financing status in readiness/financial context, context-aware estimate creation, long-term group-first Estimate Editoror direction, input formatting guidance, a ready-to-use v0 prompt, non-goals, and follow-up Codex implementation phases after design approval.

## Header Rollback Note

The attempted Phase 1 header/navigation implementation was rolled back because the result was not acceptable. The rollback removed the new inline primary-tabs/overflow behavior in `apps/web/components/protected-app-top-nav.tsx` and removed the added `Customers` item from `apps/web/lib/navigation/navigation-config.ts`, restoring the prior header menu behavior as closely as possible.

The rollback intentionally preserved the non-header Phase 1 improvements: project detail sectioning and readiness/financial placement, project Quick-Create searchable customer picker and validation-preservation, estimate Quick-Create context cleanup and create-new handoff, country combobox, phone helper copy, and `ZIP / postal code` labels. No schema, workflow, estimate calculation, invoice logic, or catalog behavior changed.

## v0 Visual Redesign Implementation Pass

The protected contractor app has a visual-only CF-inspired v0 pass implemented across the shared app shell, shared Manager Page primitives, leads/opportunities, estimates, invoices, Quick-Create sheets, and shared record/workspace chrome. The pass keeps the top-nav-first architecture, uses the grouped header menu instead of a permanent global sidebar, widens the working canvas, and moves the active visual language toward black/dark-gray framing, orange primary actions, white work surfaces, warm-neutral borders, flatter panels, denser registers, and calmer table/list styling.

Behavior intentionally unchanged: routes, data loading, auth, permissions, create/update actions, opportunity/customer/project/estimate/invoice workflow rules, estimate calculations, invoice calculations, catalog insertion logic, schemas, migrations, and persistence. Existing Quick-Create flows still create canonical records first and hand off into full workspaces.

Non-visual follow-up items discovered: several lower-traffic Manager Pages still contain older blue-accent utility styling and should be visually normalized in a separate scoped pass; no new behavior should be added to close that gap.

## Visual Bugfix Review Follow-Ups

Latest v0/CF-inspired visual review pass stayed visual/UI-only. No schema, migration, auth, workflow, estimate calculation, invoice calculation, or catalog insertion behavior was changed.

Directory visual audit completed:

- `/directory` render path was traced to `apps/web/app/(app)/directory/page.tsx`, `apps/web/components/contractor-workspace-page.tsx`, `apps/web/components/workspace-command-bar.tsx`, and the empty-state fallback in `apps/web/components/app-empty-state.tsx`.
- `/directory` now opts into the shared workspace header's dark FloorConnector/CF-inspired header tone, keeps the page read-only, and uses existing customer, related-contact, workforce, vendor, and opportunity data only.
- Confirmed stale accent cleanup in the active Directory render path: `AppEmptyState` no longer uses the older `brand-*` empty-state accent when Directory filters return no records.
- Directory search, filters, summary panels, helper panels, status badges, and register rows were visually tightened with warm neutral, black/gray, and orange accents. No routes, actions, permissions, data loading, workflows, or canonical models changed.

Confirmed non-visual follow-up:

- Invoice creation can still be blocked by the existing commercial-readiness guard when the project does not have the required signed-contract and deposit/financing readiness state. This is expected business behavior, not a visual regression. Next validation should use a project that has completed the signed-contract/readiness prerequisites, then verify deposit, completed-job, approved-estimate, and approved-change-order invoice creation paths end to end.

Confirmed behavior issue addressed in this pass:

- Change-order invoice Quick-Create context could be lost when entering `/invoices` with only `changeOrderId` or while moving through invoice manager filters. The UI now resolves the change order's project context and preserves `changeOrderId` across the invoice create sheet and manager links.

## Account Menu / Profile Settings Follow-Up

Profile / Account Settings surface added:

- `/settings/profile` now provides a protected personal account settings surface using the existing Supabase auth user, canonical `public.users` profile extension, and active organization membership context.
- The top-right account menu now links to `Profile / Account settings` while preserving Organization settings, Settings home, and the existing sign-out action.
- The profile page is read-only because this pass found the canonical profile table and self-update RLS, but no existing app-level personal profile update action/helper wired for safe editing.
- Existing organization settings remain admin-gated; the settings layout can render the personal profile page for active members, and admin-only settings pages continue to require organization owner/admin scope.

Confirmed non-visual follow-up:

- Add an explicit personal profile update action only after the intended editable fields, validation rules, and auth/profile sync behavior are approved.

## Black / Gray / Orange Palette Direction

Visual-only contractor-app palette update completed:

- FloorConnector's preferred contractor-app palette is black / gray / orange / white.
- Shared brand tokens now point to the warm orange action palette instead of green/teal, so existing `brand-*` buttons, links, checkboxes, and focus rings resolve to the approved accent direction.
- Shared shell, workspace/sidebar chrome, settings navigation, empty states, and manager headings were normalized away from prior dark-green and bluish heading values.
- Blue remains disallowed as a default contractor-app accent. Green/emerald remains allowed only for semantic success, approved, paid, or completed statuses.
- This pass was visual-only: no workflow, route, schema, auth, permission, estimate, invoice, catalog, calculation, or persistence behavior changed.

## System-Wide Palette Standardization

Visual-only system-wide palette standardization completed:

- Official contractor-app palette is black / gray / orange / white.
- Shared contractor shell, top navigation, workspace/page wrappers, command bars, manager cards, tables/registers, composer sheets, settings surfaces, forms, inputs, empty states, and document rendering styles were audited for stale blue/green/teal/violet utility accents.
- Confirmed non-semantic blue, sky, cyan, indigo, teal, violet, navy, and blue-tinted neutral accents were removed from the protected app/shared contractor component scan.
- Orange is the default primary action, active, highlight, and focus accent. Near-black/dark gray drives chrome and strong headings. White/off-white and warm gray drive work surfaces, borders, and dividers.
- Green/emerald is reserved for semantic success, approved, paid, or completed states. Red/rose remains destructive/error/blocked. Amber remains warning/pending/prerequisite-needed.
- This pass was visual-only: no workflow, route, schema, auth, permission, estimate, invoice, catalog, calculation, or persistence behavior changed.

## Decision-First UI Refactor Phases 1-3

Decision-first UI refactor foundation is started from `plan/refactor-decision-first-ui-1.md`. The prompt referenced `docs/refactor-decision-first-ui-1.md`, but that exact path was not present; the matching plan was found under `plan/`.

Completed in this staged subset:

- Phase 1 foundation components only: shared theme constants, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, and `SecondarySection` were added to `@floorconnector/ui`.
- Phase 2 section layout components: contractor app wrappers `CoreWorkflowSection`, `ExecutionSection`, and `SupportSection` were added under `apps/web/components/layout`.
- Phase 3 UI audit: [docs/ui-refactor-audit.md](C:/FloorConnector/docs/ui-refactor-audit.md) records decision-first anti-patterns and page-level risks before visual implementation.

Behavior preserved:

- no major pages were refactored
- no server actions, forms, permissions, workflows, routes, schema, auth, RLS, Supabase policies, data models, calculations, estimate behavior, invoice behavior, contract behavior, job behavior, or portal/super-admin behavior changed
- project detail remains the primary workflow/readiness hub
- the contractor top-nav-first shell and shared Manager Page direction remain intact

Validation for this subset passed:

- `pnpm typecheck`
- `pnpm lint`
- `git diff --check` with exit code 0; it reported only the usual LF-to-CRLF working-copy warning on `packages/ui/src/index.ts`

Follow-up risk:

- Phase 4 should be handled as its own careful project-detail pass because that page carries the densest readiness and workflow sequencing. Preserve all existing project links/actions and server-side readiness logic when adding `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`.

## Decision-First UI Refactor Phase 4

Project Detail refactor completed as a UI-only contractor-app change in `apps/web/app/(app)/projects/[projectId]/page.tsx`.

Files changed:

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:

- visible actions included Create Estimate, Generate contract when an approved estimate exists without a contract, Create appointment, Create deposit invoice when deposit is required and unsatisfied, Create invoice for completed uninvoiced jobs, primary next-action links, secondary next-action links, follow-up action queue links, financing-status save, project edit save, empty-state create links for appointments, punchlists, daily logs, and change orders, plus schedule handoff actions
- links included projects back link, estimates, contracts, appointments, jobs, punchlists, daily logs, change orders, progress billing, invoices, payments, leads, customers, time cards, schedule, and communications
- readiness and blocker messages included project readiness status, ready-to-schedule date, active blocker list, readiness-stage details, `nextAction.blockerCopy`, deposit/financing/readiness copy, scheduling handoff copy, and the financing form note
- related-record sections included estimates, contracts, appointments, estimate attachments, contract PDFs, jobs, punchlists, daily logs, change orders, progress billing, invoices, payments, field/time signal, project context, project continuity, production schedule, and related conversations
- server actions/forms used on the page remained `updateProjectAction` through the financing-status mini form and the existing `ProjectForm`
- conditional rendering included status/readiness badges, approved-estimate contract generation, deposit invoice creation, completed-job invoice creation, blocker/no-blocker state, readiness stages, empty states, schedule focus, related-record lists, and sidebar continuity cards

Exact UI behavior changed:

- `ActionBar` now appears directly under the existing project page header and carries the current primary next action, secondary action, readiness status, blocker copy, and customer/location meta
- `WorkflowBar` now appears below `ActionBar`, mapping the existing readiness-stage data into the project readiness workflow without changing readiness logic
- `ProjectStateSummary` now appears near the top, summarizing project, readiness, financial, and schedule state from existing computed values
- a new `CoreWorkflowSection` appears before the older readiness/execution/support content and prioritizes Estimate, Contract, Job, and Invoice cards with existing links/actions
- the former duplicate top overview/next-action stack was replaced by the new decision-first top stack
- the former Connected Workflow section was narrowed to Coordination appointments because estimate/contract/job/invoice continuity is now covered in the core workflow section
- Documents now uses `SupportSection`; Operations Hub now uses `ExecutionSection`

Behavior preserved:

- no data loading, server actions, forms, route architecture, permissions, readiness calculations, links, workflow guards, schema, auth, RLS, Supabase policy, estimates, contracts, jobs, invoices, portal, super-admin, dashboard, or global list pages changed
- project detail remains the primary workflow/readiness hub
- existing project detail actions and links remain visible where their original conditions apply

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed after removing dead code from the replaced overview stack
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- browser QA attempted against real project `/projects/cbb32597-59c6-424b-9c3c-77f2b40ba0d0` on `localhost:3000` using `playwright/.auth/local-user.json`, but the saved contractor auth session was stale and redirected to `/login?next=%2Fpeople`; no local `FLOORCONNECTOR_E2E_EMAIL` or `FLOORCONNECTOR_E2E_PASSWORD` values were present in `.env.local`, so authenticated project-detail browser QA is intentionally deferred until a fresh real contractor session is available

Intentionally deferred project-detail polish:

- no deeper visual tuning of lower support panels
- no click-through mutation testing of create/save actions without a fresh authenticated QA session
- no dashboard, estimates, invoices, jobs, contracts, portal, super-admin, or list-page changes

## Decision-First UI Refactor Phases 1-4 Review Pass

Full review and refinement pass completed for the Phase 1-4 decision-first UI work. This was a UI-only QA/refinement pass, not a new feature phase.

Files changed:

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `docs/chat-handoff.md`

Exact UI improvements made:

- Project header actions remain visible, but the duplicate orange `Create Estimate` header CTA was changed to a neutral secondary action so the `ActionBar` owns the dominant next action.
- Duplicate project/readiness status badges were removed from the project header because the same information is now present in `ActionBar` and `ProjectStateSummary`.
- `ActionBar`'s non-clickable next-action label now uses neutral styling instead of orange, preserving orange for the primary CTA.
- `WorkflowBar` current-step styling now uses amber status styling instead of orange primary-action styling.
- `ProjectStateSummary` active tone now uses amber status styling instead of orange primary-action styling.
- Project detail section overview eyebrow styling was neutralized to reduce decorative orange.
- The empty job card's create link now preserves the existing project-scoped jobs handoff path (`/jobs?projectId=...`) instead of introducing a broader query shape.

Behavior preserved:

- existing project detail actions and links remain visible where their original conditions apply
- no data loading, server actions, forms, permissions, route architecture, workflow guards, readiness calculations, schema, auth, RLS, Supabase policy, backend, dashboard, estimates, invoices, jobs, contracts, portal, super-admin, or list pages changed
- project detail remains the primary workflow/readiness hub

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed after removing one unused readiness badge helper made obsolete by the header cleanup
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright QA passed on real project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
  - login was completed through the app `/login` page using `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` from root `.env.local`
  - project detail rendered `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `Core Workflow`, and the expected execution/support sections
  - `Create Estimate` navigated to the existing estimate manager context URL with project/customer/opportunity context preserved
  - the ActionBar `Review contract` link navigated from project detail to `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
  - no browser console errors were captured during the pass
  - screenshot saved locally at `test-results/project-detail-review-pass.png`

Follow-up risks:

- lower project support panels can still receive normal iterative visual polish later, but no structural issue was found in this review
- `e2e/auth.setup.js` currently clicks the first submit button on `/login`, which is the Google flow; protected QA used a focused Playwright login path that targets the email/password submit button instead

## Post Visual System Audit

Documentation + functionality checkpoint completed in [docs/post-visual-system-audit.md](C:/FloorConnector/docs/post-visual-system-audit.md). The audit confirms the canonical lifecycle, `catalog_items` source-of-truth rule, estimate catalog snapshot insertion, invoice readiness guardrails, read-only `/settings/profile`, account menu wiring, and visual/layout passes remain aligned with the current implementation. Audit-only changes were made; no app code, schema, workflow, auth, permission, estimate, invoice, catalog, calculation, styling, or data behavior changed in this pass.

Confirmed follow-up from that audit has now been completed: stale current-state wording around estimate creation context was corrected, and invoice catalog wording now distinguishes implemented invoice-only manual catalog-backed adjustments from forbidden normal-scope catalog-to-invoice billing.

## Audit Documentation Corrections

Post-audit documentation corrections are complete. [docs/current-state.md](C:/FloorConnector/docs/current-state.md) now reflects the implemented estimate creation behavior: project-launched estimates pre-populate and lock the project and derived customer, global estimate creation requires customer plus project selection or creation, and validation preserves entered values. Invoice catalog language was clarified across current-state, developer source of truth, workflows, and the catalog-to-estimate/invoice spec: `catalog_items` remains canonical, estimate catalog insertion is implemented, invoice catalog usage is limited to explicit invoice-only manual catalog-backed adjustments, and free catalog insertion as normal invoice scope remains disallowed.

## Playwright E2E Browser QA Path

Focused Playwright browser QA infrastructure was added for protected contractor flows, starting with Phase B estimate-editor group-targeted catalog insertion. This is test infrastructure only: no app behavior, schema, auth/RLS, workflow, estimate calculation, invoice behavior, or catalog insertion logic changed.

- Playwright config now lives at [playwright.config.js](C:/FloorConnector/playwright.config.js).
- Auth setup lives at [e2e/auth.setup.js](C:/FloorConnector/e2e/auth.setup.js) and uses a real local contractor account through the normal `/login` flow. The setup project requires `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD`, saves `playwright/.auth/local-user.json`, and the protected Playwright project reuses that storage state for contractor app specs.
- The focused estimate spec lives at [e2e/estimate-group-catalog-insertion.spec.js](C:/FloorConnector/e2e/estimate-group-catalog-insertion.spec.js). It requires a safe draft estimate id/path and active non-system catalog item names supplied via environment variables.
- The manual estimate approval spec lives at [e2e/estimate-manual-approval-action.spec.js](C:/FloorConnector/e2e/estimate-manual-approval-action.spec.js). It uses the protected project and shared authenticated storage state, then records a real manual approval through the canonical estimate status-transition path.
- Minimal non-user-facing test ids were added to the Estimate Editoror group, group add-item, catalog search/select/add, catalog preview, and line-item row surfaces so browser QA can use DOM selectors instead of fragile coordinate clicks.
- Running instructions live at [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md).

Dependency repair / validation status:

- The previous install issue was caused by stale running FloorConnector dev-server processes locking native `next` and `turbo` files while pnpm tried to reconcile `node_modules`.
- The local dependency tree was repaired by stopping only those FloorConnector dev-server process trees, removing workspace `node_modules` artifacts, and rerunning `pnpm install --config.offline=false --reporter=append-only`.
- Playwright is installed (`pnpm exec playwright --version` reports 1.59.1), and Chromium was installed with `pnpm exec playwright install chromium`.
- Validation now passes: `pnpm typecheck`, `pnpm lint`, and `git diff --check` all complete successfully. `git diff --check` reports line-ending warnings only.
- Playwright spec discovery works with the web server disabled: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` lists the setup project, unauthenticated fixture tests, and protected estimate specs.
- Authenticated e2e execution still requires local-only setup: `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD`, plus spec-specific data such as `FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID` or path, active non-system catalog item names, or `FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH`.

## Final Documentation Review

Final pre-next-phase documentation consistency review completed. Reviewed, in order: `docs/chat-handoff.md`, `docs/developer-source-of-truth.md`, `docs/current-state.md`, `docs/workflows.md`, `docs/Roadmap.md`, `docs/system-overview.md`, `docs/sales-to-production.md`, `docs/target-ia.md`, `docs/vision.md`, and `README.md`, with `docs/documentation-governance.md` checked for archival rules.

Corrections made were documentation-only:

- `docs/reporting-basics-plan.md` now clearly says the first `/reports` basics surface is implemented and that the plan is retained as guardrail/context, not an unstarted build plan.
- `docs/Roadmap.md` now identifies the current Phase B focus as validation and foundation hardening instead of implying first-pass scheduling, communications, reporting, and automation UI are still future work.
- `docs/system-overview.md` now distinguishes implemented first-pass `/communications`, `/schedule`, `/reports`, and Sales Tax Summary foundations from deeper target-only communication, dispatch, and analytics work.

Known remaining doc risks:

- several detailed implementation plans remain active because they still provide useful guardrails; they should be archived only after the next validation pass confirms they no longer prevent drift.
- no broad link rewrite was done; active source-of-truth docs still use absolute `C:/FloorConnector/...` links by convention.
- the next build phase should remain validation-first: run and record seed-free Phase B validation before adding feature breadth.

## AI Cue Review + Dashboard Surfacing

Project-level deterministic guidance cues are now implemented as a human-confirmed guidance layer. This is not autonomous AI and does not call external AI APIs.

Prior cue slice reviewed:

- Manual lead follow-up and appointment cue bridges were already present.
- Cue links prefill existing lead/appointment work-item forms for human confirmation.
- Work items are not auto-created from lead follow-up state or appointment status.
- Existing source links keep opportunity and appointment relationships locked to canonical records.

Files changed in this slice:

- `apps/web/lib/projects/cues.ts`
- `apps/web/lib/projects/cues.test.ts`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Implemented behavior:

- Project Workspace now shows an `AI guidance cues` panel.
- Cues are deterministic and derived from existing project, estimate, contract, invoice, job, readiness, and field-note context.
- Implemented cue cases include approved estimate missing contract, unpaid deposit invoice, open blocker/issue field notes, signed ready project with no job, and ready project with unscheduled jobs.
- Cue actions link into existing canonical workflows: contract generation, invoice review, daily-log review, job Quick-Create, schedule action panel, or the project workspace.
- Dashboard now previews the highest-priority project cues and links back to the project or existing workflow.

Boundary preserved:

- No new AI task table, duplicate work-item model, duplicate project/job/invoice/contract model, schema change, migration, RLS change, env var, provider key, external AI call, or autonomous write path was added.
- Cues do not auto-create jobs, invoices, contracts, change orders, work items, field notes, payments, or schedule commitments.
- Financial calculations, readiness rules, invoice totals, payment logic, contract signature logic, app shell, and navigation were not changed.

Validation:

- `pnpm exec tsx --test apps/web/lib/projects/cues.test.ts apps/web/lib/work-items/work-items.test.ts apps/web/lib/work-items/prefill.test.ts` passed: 14 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Browser QA passed against `localhost:3000` after refreshing `playwright/.auth/local-user.json` with `PLAYWRIGHT_BASE_URL=http://localhost:3000` and `PLAYWRIGHT_SKIP_WEB_SERVER=1`: `/dashboard` rendered `Suggested project actions`, a real project link opened `/projects/6922a413-1350-496c-89d9-6b03dcbad0f1`, that Project Workspace rendered `Suggested next actions`, and no console/page errors were captured.

Recommended next slice:

- Add an optional manual project-cue-to-work-item bridge only after deciding which project cue types should become assignable internal work, keeping the same human-confirmed work-item form pattern.

## Manual Cue-To-Work-Item Bridge

Manual bridge actions from existing follow-up and appointment cues into internal `work_items` are now implemented. This remains a contractor-side, human-confirmed workflow only.

Files changed in this slice:

- `apps/web/lib/work-items/prefill.ts`
- `apps/web/lib/work-items/prefill.test.ts`
- `apps/web/components/work-items/work-item-create-form.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/leads/page.tsx`
- `apps/web/app/(app)/leads/[leadId]/page.tsx`
- `apps/web/app/(app)/appointments/[appointmentId]/page.tsx`
- `apps/web/lib/work-items/data.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/communications-and-ai-intake.md`
- `docs/calendar-and-scheduling-intelligence.md`
- `docs/chat-handoff.md`

Implemented behavior:

- dashboard lead follow-up cues now include a `Create work item` bridge link into the lead workspace with `workItemCue=follow_up`
- lead-manager follow-up rows now include a `Create work item` bridge link into the same lead workspace flow
- lead workspace work-item creation accepts prefilled title, description, due date, priority, dedupe key, and metadata while keeping `source_type = opportunity` and the source id locked by hidden form fields
- dashboard appointment cues now include bridge links into appointment detail with `workItemCue=confirmation_prep` for scheduled appointments or `workItemCue=appointment_follow_up` for canceled/no-show follow-up cues
- appointment workspace work-item creation accepts prefilled appointment prep or follow-up defaults while keeping `source_type = appointment` and the source id locked
- duplicate cue creation uses the existing `work_items.dedupe_key` unique constraint and now returns the friendlier error `A work item already exists for this cue.`

Boundary preserved:

- no work items are auto-created
- no provider reminders, SMS/email/voice/chat, AI, Google/Outlook sync, customer reminders, or portal task visibility were added
- creating, completing, or dismissing work items does not mutate `opportunities.next_follow_up_at`, lead status, appointment status, schedule state, customer-visible appointment notes, or portal visibility

Validation:

- `pnpm exec tsx --test apps/web/lib/work-items/work-items.test.ts apps/web/lib/work-items/prefill.test.ts` passed: 10 tests
- `pnpm typecheck` passed
- `pnpm lint` passed

## Phase 6K Contractor Group Audit Observability

Phase 6K added read-only contractor group audit observability over the existing durable `contractor_group_audit_events` rows. No migration, RPC, server action, entitlement behavior, runtime behavior, assignment automation, starter-pack auto-provisioning, contractor permission behavior, or tenant-owned template/catalog write path was added.

Files changed in this slice:

- `apps/web/lib/platform-admin/contractor-group-audit-events-core.ts`
- `apps/web/lib/platform-admin/contractor-group-audit-events.test.ts`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `apps/web/components/contractor-group-manager.tsx`
- `docs/current-state.md`
- `docs/contractor-groups-plan.md`
- `docs/chat-handoff.md`

Implemented read-only behavior:

- pure audit observability model summarizes total audit events, events by type, group, organization, assignment source, actor id when available, recent events, recent group activity, recent organization assignment/removal activity, metadata-present versus metadata-absent counts, and missing expected group/organization context warnings
- group detail now shows a read-only audit summary with total events, assignment/removal counts, current membership count, recent timeline rows, and caveats when removed membership rows are historical audit evidence rather than current membership rows
- organization-centric inspection now shows current group memberships beside durable assignment/removal audit history for the selected contractor organization
- `/super-admin/groups` now loads a larger recent audit-event window for observability, adds an audit event type filter, and keeps the existing safety copy that contractor groups are segmentation/audit only

Validation:

- `pnpm exec tsx --test apps/web/lib/platform-admin/contractor-group-audit-events.test.ts apps/web/lib/platform-admin/contractor-group-observability.test.ts apps/web/lib/platform-admin/contractor-groups.test.ts apps/web/lib/platform-admin/starter-pack-targeting.test.ts` passed: 28 tests
- Browser QA in the in-app browser on `http://localhost:3000/super-admin/groups?groupStatus=archived&groupType=custom` confirmed the page DOM included `Audit observability`, `Audit history`, the `All event types` filter, and no-entitlement safety copy after reload; one event-filter click attempt was not completed because the in-app browser click landed off viewport, and subsequent direct navigation temporarily showed the app loading shell, so deeper browser interaction QA should be repeated after the current local dev/browser state is refreshed
- `pnpm typecheck` now passes after the communications appointment subject filter drift was repaired in the appointment confirmation logging foundation pass
- `pnpm lint` now passes after the appointment confirmation preview type cleanup was repaired in the appointment confirmation logging foundation pass
- Focused ESLint on `apps/web/components/contractor-group-manager.tsx`, `apps/web/lib/platform-admin/contractor-group-audit-events-core.ts`, `apps/web/lib/platform-admin/contractor-group-audit-events.test.ts`, and `apps/web/app/(super-admin)/super-admin/groups/page.tsx` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

## System Rules

Keep these short rules in mind:

- no duplicate business models
- no portal-only copies of shared records
- no module-local silos
- workflow, lifecycle, creation-logic, or canonical-relationship changes must update relevant docs in the same change set, as applicable: `docs/developer-source-of-truth.md`, `docs/current-state.md`, and/or `docs/workflows.md`
- dashboards must point back into the shared chain
- Quick-Create must hand off into full workspaces
- project / shared record continuity stays more important than module completeness
