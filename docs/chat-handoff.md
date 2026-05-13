# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact operational handoff for the current branch. It is not a competing source of truth.

## Required First Read

Before doing implementation or documentation work, read [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md).

Then use:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented truth
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md) for maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md) for concise module status
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for workflow rules
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md) for doc maintenance rules
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md) for settled architecture decisions
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md) for AI-readable boundaries

## What FloorConnector Is

FloorConnector is a production-first SaaS operating system for specialty flooring contractors. It is built around one connected contractor workflow, not disconnected modules:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Current Branch Reality

The current branch has a real operational foundation: auth, tenancy, opportunities/leads, customers, projects, estimates, contracts, change orders, jobs, invoices, payments, portal foundations, workforce/time/field foundations, settings, super admin, and normalized contractor UI patterns.

It is best understood as a platform operating-system foundation with evolving UX depth, reporting depth, automation depth, integration depth, and AI depth. It is not an early prototype.

## Current Active Focus

Current work should generally preserve the implemented operational core while tightening:

- project-centered continuity
- workflow/readiness guidance
- scheduling and dispatch depth
- materials/catalog/document depth
- financial/reporting/integration depth
- communications, automation, and AI assistance as layers on canonical records

## Latest UI Checkpoint

- Phase 0 estimate-led workspace standardization tightened the existing UI baseline without reopening the shell: Estimate remains the reference surface, and Project, Contract, Invoice, and Job Workspaces should continue using the same header, next-action, workflow-summary, semantic status, context-rail, connected-record, and internal follow-through grammar.
- This Phase 0 pass was presentation/documentation only. It did not change schema, RLS, auth behavior, data loading, server actions, route architecture, business logic, financial calculations, workflow transitions, or app navigation.
- The v0 / Graphite & Copper validation sequence is closed. Graphite & Copper is the accepted contractor-app visual-token foundation, and Estimates served as the first reference surface for the pass.
- Final validation covered token cleanup, authenticated desktop QA, mobile/tablet QA, E2E auth selector cleanup, regression validation, forensic scope audit, and closeout cleanup. `pnpm typecheck`, `pnpm lint`, `git diff --check`, `pnpm e2e:auth`, `pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected`, and `pnpm exec playwright test e2e/dashboard-ui.spec.js --project=chromium-protected` passed during closeout.
- The accepted work preserved the top-nav-first contractor shell, Manager Page rhythm, and shared Record Workspace language. It did not change schema, RLS, auth behavior, middleware, server actions, data loading, route protection, business logic, financial calculations, workflow transitions, or app navigation.
- The stale protected Playwright project-workflow assertion was updated to the current `Project workflow` accessible region name. The malformed invoice route from the prompt is not present in repo files; if the prior invoice fixture is needed again, use `a6c30047-5307-43d7-8b7a-aeb1c4d14604`.
- Do not reopen broad visual-system validation unless a specific regression appears. Next product work should start from the current Graphite & Copper baseline, follow [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md), and focus on targeted product depth such as project-centered continuity, workflow/readiness guidance, scheduling/dispatch depth, materials/catalog/document depth, financial/reporting/integration depth, and communications/AI layers on canonical records.

## Latest Workflow Guidance Checkpoint

- Phase 0.5 adds the first tenant-owned workflow guidance preference layer on the existing `organization_workflow_settings` row.
- Contractor admins can manage Guided/Flexible/Manual workflow mode, next-best-action visibility, readiness-guidance visibility, strict blocker presentation, shortcut cleanup prompt visibility, workflow explanation copy, and separate AI-assistance intent flags from `/settings/workflows`.
- Project Workspace is the first surface wired to these preferences: next-best-action and readiness guidance panels can be reduced or shown by organization settings.
- These controls are presentation/configuration only. They do not change schema beyond the workflow-settings JSONB preference column, do not loosen readiness gates, do not alter invoice/payment/signature/portal behavior, do not create autonomous AI actions, and do not introduce one-off/direct invoice behavior.
- One-off/direct invoice shortcuts remain a documented follow-up: the future path must still create or use canonical customer/project context and canonical invoice/payment records.
- Protected route QA must use the configured Playwright authenticated storage state or E2E auth setup. Do not count a redirect to `/login` as successful protected-page QA.

## Latest Golden Workflow Demo Checkpoint

- Phase 1 defines the Golden Workflow Demo Path in [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md).
- The path is a QA/demo spine through existing contractor routes, not a new workflow engine or seeded demo environment.
- The primary route sequence is `/dashboard -> /leads -> /customers -> /projects -> /estimates -> /contracts -> /invoices -> /payments -> /jobs -> /schedule -> /daily-logs`, with linked detail workspaces opened where real fixture data exists.
- Project Workspace remains the continuity hub, Estimate Workspace remains the proposal-first UI/workflow reference, and Guided mode remains the primary demo mode.
- Flexible and Manual guidance checks must confirm that critical financial, payment, signature, portal, readiness, and security facts remain visible even when coaching prompts are reduced.
- Portal/customer-facing signature and payment checks require valid portal/customer auth or scoped portal routes; access-denied or login screens are not successful portal QA unless access denial is the expected result.
- Phase 1.1 adds an opt-in portal/customer E2E auth path: `pnpm e2e:portal-auth` writes `playwright/.auth/portal-user.json` when `FLOORCONNECTOR_PORTAL_E2E_EMAIL` and `FLOORCONNECTOR_PORTAL_E2E_PASSWORD` are configured for a real portal customer user, and `pnpm e2e:portal` runs portal smoke checks. Phase 1.2 adds `pnpm e2e:portal-fixture` to validate the stable portal customer fixture, plus explicit write mode gated by `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1` to create or repair the portal Supabase Auth user/password and canonical dev/test customer, contact, customer-contact, project, opportunity, catalog item, access-grant, estimate, contract, signer, and invoice records. Missing portal credentials, missing project access grants, and missing shared estimate/contract/invoice links are explicit skipped prerequisites, not successful QA.
- New contractor-created portal invites are contact-centered: choose the customer contact, invite/authenticate the contact's email through Supabase Auth, then grant project visibility beneath that contact's portal grant. Legacy null-contact grants remain visible compatibility records and should be linked forward to customer contacts when known.
- Portal invite delivery now sends or resends branded provider email only when Postmark is configured and activation guard allows external sends; otherwise the UI reports no-send status and shows the fresh app invite link as copy-link fallback. The app still does not create Supabase Auth users or call Supabase Auth-admin invites for portal customers.
- Portal account onboarding now stays on the app-managed invite path: `/portal/invite?token=...` shows customer-safe context, routes unauthenticated contacts to signup, sign-in, or password reset with the invited email, and preserves a safe `next` path back to invite acceptance.
- Portal-bound auth redirects intentionally skip contractor tenant bootstrap, and active portal-only customers with no contractor membership are returned to `/portal` if they try to open contractor workspace routes. A customer portal account should not become a contractor owner account just because it authenticated.
- Customer Detail now has a protected smoke at `e2e/customer-detail-ui.spec.js` for the contact-centered portal access surface. The Customer Workspace uses customer-scoped estimate/job/invoice loaders and keeps provider-backed invite email code out of the RSC read path, so customer detail should render past `Preparing your workspace` before portal invite QA.
- Local Playwright webServer startup now derives the Next dev port from `PLAYWRIGHT_BASE_URL`; the default remains `http://localhost:3001`, while explicit `PLAYWRIGHT_BASE_URL=http://localhost:3000` starts or reuses port `3000`. Use `PLAYWRIGHT_SKIP_WEB_SERVER=1` only when a matching server is already responsive, and run shared-webServer Playwright commands sequentially.
- One-off/direct invoice behavior remains out of scope for Phase 1.

## Latest Revenue Readiness Checkpoint

- Project Detail smoke assertions should not require Project Workspace coaching regions that can be reduced by Guided/Flexible/Manual workflow guidance settings. Stable protected smoke should assert non-negotiable Project state, recency, internal follow-through, and customer/readiness/schedule facts unless a test explicitly sets Guided mode first.
- `pnpm e2e:portal-fixture` remains validation-first. Missing fixture env is reported by env var name only, write mode remains gated by `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`, and portal smoke success still requires real portal authentication plus canonical portal access grants.
- Paid early-access prep now lives in [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md). Phase 2.2 adds a test-mode-only FloorConnector SaaS subscription Checkout Session bridge from `/setup/billing`, gated by matching Stripe test keys, `STRIPE_FOUNDER_PLAN_PRICE_ID`, and contractor owner/admin access. The Phase 2.1 operating layer still owns `/super-admin/early-access` founder tenant buckets and platform-admin-entered founder billing evidence. Checkout return does not activate tenants, does not touch contractor-customer invoice payments, and still needs a future signed-webhook reconciliation slice before subscription state can be treated as confirmed.
- If local protected Playwright auth times out because the dev server is on `localhost:3000` while Playwright defaults to `localhost:3001`, rerun with `PLAYWRIGHT_BASE_URL=http://localhost:3000` and do not count `/login` as successful protected QA.

## Latest AI / Follow-Up Planning Checkpoint

- Operational Intelligence / Intelligent Follow-Up foundation is closed as a deterministic, evidence-backed workflow guidance layer over canonical records. It includes query-time operational cues, Dashboard My Work display modes, record-level Needs Attention panels, Project Workspace suggested actions, cue-to-work-item prefill for approved human-confirmed contexts, user-scoped dismiss/snooze through `workflow_cue_states`, and admin-facing rule guidance at `/settings/operational-intelligence`.
- Project Workspace workflow guidance has been tightened without new workflow behavior: the workflow overview names the linked record or workspace driving the next step, and Suggested project actions now separate canonical workflow actions from human follow-up actions.
- Project Workspace linked-record continuity now includes a compact recency breadcrumb summary from existing estimates, contracts, jobs, invoices, change orders, daily logs, and field-note context. It highlights the driving linked record when it matches the next-step driver, but it is not a new activity feed, event model, automation layer, or query-time cue mechanic.
- Project Workspace guidance/recency is closed as a presentation-only project-continuity slice. It preserved standalone module routes, canonical workflow routing, readiness gates, cue behavior, and global queue surfaces.
- Current cue coverage and guidance remain bounded to supported estimate, contract, invoice, job, and project contexts. Cue actions route to existing canonical workflows where possible; work-item creation remains user-confirmed; dashboard cue mutation controls are not implemented.
- Current settings support only existing deterministic rule fields and responsibility defaults: enabled state, threshold days, urgency, and People-first starter role defaults. The rule cards explain trigger, impact, surface, safe next action, and visibility behavior; they are not an automation builder.
- Validation across the foundation has passed in focused unit tests, `pnpm typecheck`, `pnpm lint`, `git diff --check`, protected browser smoke for project guidance/recency, protected browser smoke for record cue-state controls, dashboard awareness-only checks, and `/settings/operational-intelligence` smoke.
- Deferred: company-scoped resolve/mark-handled, dashboard dismiss/snooze controls, broader cue-to-work-item bridging, AI summaries/drafts, controlled automation, cue event trails, and any customer-visible/provider-backed AI action.
- Recommended next product slice: scheduling/dispatch UI layer on the existing canonical job, appointment, job-assignment, and `/schedule` foundations. Defer a true project activity/event timeline until there is an explicit schema/event-model planning pass. If cue mechanics resume first, start with company-scoped handling planning/tests rather than dashboard controls.
- The working tree is intentionally dirty from the active revision, cue-state, and operational-intelligence slices; do not treat unrelated modified files as part of a future docs-only closeout unless the task explicitly scopes them.

## Latest Revision / Perspective Checkpoint

- First-pass canonical revision infrastructure is implemented through `record_revisions` for estimates, invoices, contracts, and change orders.
- Revision snapshots attach to the active canonical record; no cloned estimates, invoices, contracts, or change orders were introduced.
- Supported record workspaces lazily create an initial snapshot for existing records and show a secondary revision timeline. Compare, restore, branching, merging, rollback, and advanced diffing remain intentionally deferred.
- Contractor-side create/edit/send/status/payment-sensitive hooks create revision snapshots where safe authenticated mutation points exist. Portal/customer events still rely on existing signature, payment, notification, and specialized commercial snapshot evidence unless a future pass explicitly extends generic revisions there.
- Revision creation is now hardened through an authenticated `SECURITY INVOKER` database RPC that keeps RLS active, validates membership and subject ownership, locks the tenant-scoped subject, and atomically demotes the previous current revision before inserting the next current revision.
- Estimates, invoices, and leads now support first-pass `My Work` / `Company` perspectives through `?view=my` and `?view=company`.
- `My Work` uses only existing safe cues: estimate/invoice creator, updater, sender where available, and lead appointment assignment through linked people membership. It does not add permissions, saved views, AI prioritization, or team routing.

## Non-Negotiable Guardrails

- `docs/current-state.md` owns implemented truth.
- Preserve the canonical lifecycle exactly.
- Do not create duplicate business models.
- Do not create portal-only copies of canonical records.
- Do not create module-local silos.
- Contractor app and portal act on the same canonical records.
- Quick create must create canonical records first and route into full workspaces.
- Financial, payment, and signature events extend canonical records and preserve history.
- Top-nav-first contractor shell remains the current UI baseline.
- Roadmap, vision, and target IA docs are future direction unless current-state says otherwise.

## Immediate Documentation / AI Warnings

- Do not read roadmap phases as date-based timelines or week-count build plans.
- Treat `Foundation` as "canonical structure exists, deeper workflow depth remains future."
- Treat target IA routes as target direction, not current route reality.
- Do not use historical handoff entries as current implementation truth.
- If docs conflict, update the non-current-state doc or add a caveat.

## Where To Read Next

- Governance: [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md), [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- Architecture principles: [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md), [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md), [docs/platform-philosophy.md](C:/FloorConnector/docs/platform-philosophy.md)
- Current truth: [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md)
- Operational architecture: [docs/workflows.md](C:/FloorConnector/docs/workflows.md), [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md), [docs/ui-system.md](C:/FloorConnector/docs/ui-system.md), [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md), [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md)
- Future direction: [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md), [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md), [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md)
- ADRs: [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)
- Diagrams: [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)
- AI guidance: [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)
