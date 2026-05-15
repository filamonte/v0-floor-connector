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

## Latest Operational Polish Checkpoint

The Prompt 1-5 operational polish sequence is now branch reality. It tightened shared save-state behavior, note clearing, upload completion clarity, row/card click targets for estimates and invoices, follow-up date/time controls, lead source/service intake, assessment scheduling visibility, lead Scope Intake to Estimate Editor Source assessment prefill, estimate group deletion to Ungrouped Items, SOW Enter-to-add behavior, portal contact/access summaries, invite/revoke clarity, estimate/invoice sorting, and manual/offline approval evidence capture.

This was workflow polish on existing canonical records. It did not change the canonical lifecycle, financial formulas, readiness gates, portal permission architecture, invoice/contract/payment rules, storage architecture, or tenant/RLS boundaries.

Deferred from this polish sequence:

- full dispatch-grade scheduling board and route optimization
- automatic appointment/calendar-event creation beyond existing schedule visibility
- advanced measurement geometry, takeoff, plan/PDF measurement, and automated estimate generation
- full default portal access policy engine and customer-admin portal user management
- deeper permission UI beyond the current linked-contact permission foundation
- communications/delivery-proof lifecycle for estimate, contract, invoice, and portal sends
- shared multi-record file/evidence layer beyond current record-specific attachments/events
- AI automation layers, AI takeoff, AI drafting, and autonomous workflow actions

## Latest UI Checkpoint

- The 2026-05-15 enterprise UI system audit lives in [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md). It records the route-by-route visual classification, confirms Estimates remain the tuning fork, and documents a small presentation-only cleanup that replaced local contract/change-order badge helpers and generic sky/indigo/violet super-admin review styling with shared semantic Graphite/Copper status treatment.
- Phase 0 estimate-led workspace standardization tightened the existing UI baseline without reopening the shell: Estimate remains the reference surface, and Project, Contract, Invoice, and Job Workspaces should continue using the same header, next-action, workflow-summary, semantic status, context-rail, connected-record, and internal follow-through grammar.
- The enterprise UX consolidation map now lives in [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md). The current pass keeps People as the access-management owner, Customer as account summary, Project as operational hub, Estimate/Contract/Invoice as focused record review surfaces, and Portal as customer-safe review/action.
- Phase 2 of that consolidation specifically shortened record-workspace right rails and plain-language portal copy: Project, Estimate, Contract, and Invoice now keep primary context visible while extra linked records, metadata, revision history, manual payment entry, invoice editing, and lower-frequency activity use progressive disclosure. This remained presentation-only.
- Phase 3 of that consolidation closed the mobile-density pass: shared linked-record cards, detail headers, detail panels, manager cards, project forms, and customer pickers were tightened for responsive wrapping, and protected/portal smoke coverage now includes mobile viewport overflow checks.
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
- Founder Demo Readiness now lives in [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md). It is the operator rehearsal script for setup, billing, dashboard, leads, customers, projects, estimates, contracts, invoices/payments, jobs/schedule, People/portal access, branded print/save documents, and `/super-admin/early-access`.
- A founder-demo dry run captured a local screenshot package at `C:\Users\veron\AppData\Local\Temp\floorconnector-founder-demo-final-dry-run-2026-05-14T10-47-41-629Z`. The main dry run loaded the protected, portal, and platform-admin route chain with saved auth states and no route failures. Final polish removed visible internal copy from the lead workspace, customer workspace summary, and print footer language, and the local `DEV MODE / Reset session` helper is now opt-in through `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS=1` so founder-demo screenshots stay clean by default.
- The path is a QA/demo spine through existing contractor routes, not a new workflow engine or seeded demo environment.
- The primary founder-demo sequence is `/setup/company -> /setup/billing -> /setup/pending-activation -> /dashboard?fresh=true -> /leads -> /customers -> /projects -> /estimates -> /contracts -> /invoices -> /payments -> /jobs -> /schedule -> /people -> /portal -> /super-admin/early-access`, with linked detail and print/save routes opened where real fixture data exists.
- Project Workspace remains the continuity hub, Estimate Workspace remains the proposal-first UI/workflow reference, and Guided mode remains the primary demo mode.
- Flexible and Manual guidance checks must confirm that critical financial, payment, signature, portal, readiness, and security facts remain visible even when coaching prompts are reduced.
- Portal/customer-facing signature and payment checks require valid portal/customer auth or scoped portal routes; access-denied or login screens are not successful portal QA unless access denial is the expected result.
- Phase 1.1 adds an opt-in portal/customer E2E auth path: `pnpm e2e:portal-auth` writes `playwright/.auth/portal-user.json` when `FLOORCONNECTOR_PORTAL_E2E_EMAIL` and `FLOORCONNECTOR_PORTAL_E2E_PASSWORD` are configured for a real portal customer user, and `pnpm e2e:portal` runs portal smoke checks. Phase 1.2 adds `pnpm e2e:portal-fixture` to validate the stable portal customer fixture, plus explicit write mode gated by `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1` to create or repair the portal Supabase Auth user/password and canonical dev/test customer, contact, customer-contact, project, opportunity, catalog item, access-grant, estimate, contract, signer, and invoice records. Missing portal credentials, missing project access grants, and missing shared estimate/contract/invoice links are explicit skipped prerequisites, not successful QA.
- New contractor-created portal invites are contact-centered: choose the customer contact, invite/authenticate the contact's email through Supabase Auth, then grant project visibility beneath that contact's portal grant. Legacy null-contact grants remain visible compatibility records and should be linked forward to customer contacts when known.
- People customer-access administration now uses a portal access console instead of rendering all management panels at once. The default view shows filters, access-state counts, and compact contact/grant rows; Manage access opens one focused panel for invite delivery, temporary login help, stored permissions, and per-contact project visibility. The copy-from-primary-contact action remains an intentional preset that only adds or reactivates projects active for the primary contact; additional customer contacts do not silently inherit blanket customer-account project access.
- Project Workspace now shows read-only customer contact access for the current project and links back to People for management. Estimates, contracts, and invoices should continue to show contextual signer/review/payment access rather than becoming identity-management islands.
- Portal invite delivery now sends or resends branded provider email only when Postmark is configured and activation guard allows external sends; otherwise the UI reports no-send status and shows the fresh app invite link as copy-link fallback. Normal invite flow still does not call Supabase Auth-admin invites for portal customers.
- Portal account onboarding now stays on the app-managed invite path: `/portal/invite?token=...` shows customer-safe context, routes unauthenticated contacts to signup, sign-in, or password reset with the invited email, and preserves a safe `next` path back to invite acceptance.
- Contractor-side temporary portal credentials are implemented as a support fallback for owner/admin users on linked customer-contact grants. The action uses server-only Supabase Auth Admin calls to create or update the real Auth user, shows the generated password once, stores only audit/status fields, and requires password change after login before portal continuation.
- Portal-bound auth redirects intentionally skip contractor tenant bootstrap, and active portal-only customers with no contractor membership are returned to `/portal` if they try to open contractor workspace routes. A customer portal account should not become a contractor owner account just because it authenticated.
- Lead/customer primary contact normalization is now wired through the intake edge: direct customer creation, project inline new-customer creation, and opportunity/estimate handoff use a server-side helper to create or link the first captured person as the primary `customer_contacts` relationship when person details exist. No schema change or historical backfill was added; use the non-destructive reporting queries in [docs/portal-identity-review.md](C:/FloorConnector/docs/portal-identity-review.md) before planning cleanup of older customer-level email/phone-only records.
- Customer Detail now has a protected smoke at `e2e/customer-detail-ui.spec.js` for the contact-centered portal access surface. The Customer Workspace uses customer-scoped estimate/job/invoice loaders and keeps provider-backed invite email code out of the RSC read path, so customer detail should render past `Preparing your workspace` before portal invite QA.
- Local Playwright webServer startup now derives the Next dev port from `PLAYWRIGHT_BASE_URL`; the default remains `http://localhost:3001`, while explicit `PLAYWRIGHT_BASE_URL=http://localhost:3000` starts or reuses port `3000`. Use `PLAYWRIGHT_SKIP_WEB_SERVER=1` only when a matching server is already responsive, and run shared-webServer Playwright commands sequentially.
- One-off/direct invoice behavior remains out of scope for Phase 1.

## Latest Revenue Readiness Checkpoint

- Project Detail smoke assertions should not require Project Workspace coaching regions that can be reduced by Guided/Flexible/Manual workflow guidance settings. Stable protected smoke should assert non-negotiable Project state, recency, internal follow-through, and customer/readiness/schedule facts unless a test explicitly sets Guided mode first.
- `pnpm e2e:portal-fixture` remains validation-first. Missing fixture env is reported by env var name only, write mode remains gated by `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`, and portal smoke success still requires real portal authentication plus canonical portal access grants.
- Paid early-access prep now lives in [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md). Phase 2.2 adds a test-mode-only FloorConnector SaaS subscription Checkout Session bridge from `/setup/billing`, gated by matching Stripe test keys, either `platform_billing_settings.stripe_price_id` or `STRIPE_FOUNDER_PLAN_PRICE_ID`, and contractor owner/admin access. Phase 2.3 adds the separate `/api/stripe/saas-billing-webhook` route for signed `billing_domain=floorconnector_saas` Stripe subscription events. The Phase 2.1 operating layer still owns `/super-admin/early-access` founder tenant buckets and platform-admin-entered founder billing evidence. Checkout return and webhook reconciliation do not activate tenants, do not touch contractor-customer invoice payments, and do not change portal payment state.
- Phase 2.4 adds `/super-admin/billing` as the durable Billing Operations console. Phase 2.5 adds `platform_billing_settings` plus a platform-admin-only, test-mode-only Stripe Product/recurring Price create-or-discover action inside Billing Operations. The console shows names-only Stripe configuration health, app-managed and env fallback price-reference status, Checkout readiness, webhook health, tenant subscription/reference status, manual billing evidence, and manual activation separation. It now classifies Stripe key readiness by safe prefix only: Product/Price setup requires `STRIPE_SECRET_KEY` to start with `sk_test_`, local test Checkout expects `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to start with `pk_test_`, and unknown/live keys keep recovery actions blocked. `/super-admin/early-access` now links to Billing Operations and stays focused on founder readiness, workflow progress, and activation rather than being the long-term billing command center. The console can store non-secret test Product/Price references but does not create live Stripe resources, write env files, store webhook secrets, create Checkout Sessions from super admin, create customers/subscriptions/payment links, activate tenants, or touch contractor-customer invoice payments.
- SaaS billing webhook closeout added [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md). Use it for Stripe CLI forwarding/replay, Dashboard endpoint setup, required metadata, and safe schema/state checks. Keep `/api/stripe/saas-billing-webhook` separate from `/api/payments/stripe/webhook`.
- Stripe SaaS replay prep on 2026-05-15 stayed names-only and stopped correctly before provider mutation: local Stripe key prefixes were not safely recognizable as test-mode, no app-managed platform billing Product/Price reference existed, `STRIPE_FOUNDER_PLAN_PRICE_ID` was missing, and `STRIPE_WEBHOOK_SECRET` was blank. No Product/Price action, Checkout Session, Stripe CLI forwarding, or webhook replay was run. The next replay can use the app-managed platform price reference after a platform admin runs the test-mode Product/Price setup action with a clearly `sk_test_` Stripe secret key; `STRIPE_WEBHOOK_SECRET` is still required before webhook forwarding/replay and still comes from Stripe CLI or the Stripe Dashboard endpoint, not the database.
- If local protected Playwright auth times out because the dev server is on `localhost:3000` while Playwright defaults to `localhost:3001`, rerun with `PLAYWRIGHT_BASE_URL=http://localhost:3000` and do not count `/login` as successful protected QA.

## Latest AI / Follow-Up Planning Checkpoint

- Operational Intelligence / Intelligent Follow-Up foundation is closed as a deterministic, evidence-backed workflow guidance layer over canonical records. It includes query-time operational cues, Dashboard My Work display modes, record-level Needs Attention panels, Project Workspace suggested actions, cue-to-work-item prefill for approved human-confirmed contexts, user-scoped dismiss/snooze through `workflow_cue_states`, and admin-facing rule guidance at `/settings/operational-intelligence`.
- Project Workspace workflow guidance has been tightened without new workflow behavior: the workflow overview names the linked record or workspace driving the next step, and Suggested project actions now separate canonical workflow actions from human follow-up actions.
- Project Workspace now has an `Operational command center` and compact `Connected record lanes` for Sales / Estimate, Contract / Signature, Change Orders, Billing / Payments, Job / Schedule, Field / Daily Logs, and Customer Access. These summarize existing canonical records and link to the focused workspaces; they do not create a new project activity model or duplicate record editor.
- `/schedule` now has the good-enough scheduling command layer: a command-center summary, Ready work queue, Scheduled timeline, and selected job action panel for project/job handoffs, schedule/reschedule context, and crew assignment on canonical jobs/job assignments. It remains separate from full dispatch automation, route optimization, and any schedule-only record model.
- Good-enough document/PDF delivery now adds customer-facing `Print / save PDF` views for canonical estimates, contracts, and invoices in contractor and portal scopes. The routes render canonical data for browser print/save; portal print routes now use safe contractor organization branding after portal record access is scoped. They do not create a separate document source of truth, stored PDF versioning, portal-only copies, financial mutations, payment mutations, or signature mutations.
- Founder demo final dry run captured the setup, protected contractor, portal review/print, and super-admin early-access path in `C:\Users\veron\AppData\Local\Temp\floorconnector-founder-demo-final-dry-run-2026-05-14T10-47-41-629Z`. The app-owned `DEV MODE / Reset session` helper is hidden by default unless `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS=1` is set. The dry run kept Checkout, activation, reset/temp credentials, payment, signature, and invite-link actions untouched; `/setup/billing` showed the safe billing-unavailable fallback while local Stripe setup remains a test-mode replay follow-up.
- Project Workspace linked-record continuity now includes a compact recency breadcrumb summary from existing estimates, contracts, jobs, invoices, change orders, daily logs, and field-note context. It highlights the driving linked record when it matches the next-step driver, but it is not a new activity feed, event model, automation layer, or query-time cue mechanic.
- Project Workspace guidance/recency is closed as a presentation-only project-continuity slice. It preserved standalone module routes, canonical workflow routing, readiness gates, cue behavior, and global queue surfaces.
- Current cue coverage and guidance remain bounded to supported estimate, contract, invoice, job, and project contexts. Cue actions route to existing canonical workflows where possible; work-item creation remains user-confirmed; dashboard cue mutation controls are not implemented.
- Current settings support only existing deterministic rule fields and responsibility defaults: enabled state, threshold days, urgency, and People-first starter role defaults. The rule cards explain trigger, impact, surface, safe next action, and visibility behavior; they are not an automation builder.
- Validation across the foundation has passed in focused unit tests, `pnpm typecheck`, `pnpm lint`, `git diff --check`, protected browser smoke for project guidance/recency, protected browser smoke for record cue-state controls, dashboard awareness-only checks, and `/settings/operational-intelligence` smoke.
- Deferred: company-scoped resolve/mark-handled, dashboard dismiss/snooze controls, broader cue-to-work-item bridging, AI summaries/drafts, controlled automation, cue event trails, and any customer-visible/provider-backed AI action.
- Founder Demo Readiness is now packaged as a rehearsal path. Recommended next product slices should be chosen from the demo's real blockers: materials/catalog depth, live Stripe test-mode replay, deeper scheduling/dispatch, or founder onboarding/marketing polish.
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
