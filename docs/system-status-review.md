# FloorConnector System Status Review

Status: Active
Doc Type: Current Truth / QA / Planning

This review is the full-system map before the next build slice. It reflects repo inspection and documentation review in `C:\FloorConnector` while founder contractor review is pending.

This is a documentation and planning artifact only. It does not change schema, RLS, auth, tenant isolation, payment behavior, signature behavior, portal access behavior, financial calculations, Stripe behavior, or application code.

Use with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-risk-register.md](C:/FloorConnector/docs/system-risk-register.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)

## Review Baseline

Canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Preserved baselines:

- Estimate-led contractor UI baseline.
- Graphite / Copper / warm-neutral visual system.
- Project as operational hub.
- Directory as read/index surface and People as contact/access console.
- Schedule as canonical job/job-assignment command surface.
- Billing Operations at `/super-admin/billing` as durable SaaS billing operator console.
- SaaS billing separated from contractor-customer invoice payments.
- Portal customer auth and project-scoped portal visibility.
- Browser print/save document views as canonical-record renderings, not stored PDFs.
- Existing E2E baseline expectations and auth/storage-state rules.

## Documentation Truth Check

Docs reviewed:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/chat-handoff.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`
- `docs/vision.md`
- `docs/ui-patterns.md`
- `docs/enterprise-ux-consolidation.md`
- `docs/enterprise-ui-system-audit.md`
- `docs/golden-workflow-demo-path.md`
- `docs/founder-demo-readiness.md`
- `docs/founder-prospect-demo-script.md`
- `docs/founder-prospect-feedback.md`
- `docs/portal-identity-review.md`
- `docs/paid-early-access-plan.md`
- `docs/stripe-saas-billing-runbook.md`
- `docs/saas-billing-live-launch-plan.md`
- `docs/e2e-browser-qa.md`

Truth-check findings:

- `current-state`, `workflows`, `system-overview`, and `chat-handoff` consistently describe the implemented operating core as real, while keeping deeper scheduling, reporting, import/export, AI, live billing, stored PDF management, document management, and external integrations as future depth.
- Billing docs now correctly separate test-mode SaaS subscription proof from live SaaS launch. `/super-admin/billing` is durable Billing Operations; early access is a temporary commercial/readiness phase.
- Portal docs correctly use contact-centered language: Supabase Auth proves identity, `portal_access_grants` authorize the contact/customer relationship, and `portal_project_access` scopes project visibility.
- Founder demo docs correctly pause before live billing, activation, customer payment checkout, signature mutation, temporary credentials, raw invite-token exposure, and external sends unless a specific safe QA scope approves them.
- UI docs correctly preserve the Estimate-led Graphite/Copper baseline and warn that protected visual QA requires the correct authenticated role.
- Print/save document language is aligned: current document views are browser-rendered canonical record views, not stored generated PDFs or a document source of truth.
- Import/export remains a gap and trust concern, not an implemented capability.
- AI is described as deterministic cue foundation plus planned/gated AI, not autonomous active AI.

No broad stale contradiction was found that required application code, schema, migration, billing, payment, signature, or portal-access changes.

## Module Status

| Module / area | Status | Implemented capabilities | Current limitations | QA coverage | Risk | Founder-customer required? | Recommended next work |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Marketing / public entry | Usable but shallow | Public homepage, login/start early access CTAs, early-access intake into canonical records. | Contractor-owned websites, tenant domains, SEO pages, campaigns, public AI intake, galleries, reviews are planned. | Public marketing login spec exists. | Medium | Useful, not blocking for controlled founder review. | Keep CTAs honest; defer public acquisition depth. |
| Auth / tenants / memberships | Demo-ready | Supabase Auth, protected routes, tenant bootstrap, memberships, platform role boundary, portal-only redirect behavior. | Production hardening and support operations remain ongoing. | Auth setup, protected, super-admin access coverage. | Medium | Yes | Preserve centralized auth and platform-role separation. |
| Setup / onboarding | Demo-ready | `/setup/company`, `/setup/billing`, `/setup/pending-activation`, no-charge SetupIntent, test-mode SaaS Checkout lane, manual activation. | Live billing and automatic activation deferred. | Founder/demo QA, billing unit coverage, super-admin/setup smoke. | Medium | Yes | Improve first-run clarity only after feedback. |
| Dashboard | Demo-ready | Operational command center, queue widgets, My Work cues, canonical links. | Broader analytics and owner reporting are shallow. | Dashboard and protected smoke coverage. | Medium | Yes | Reporting/dashboard depth only if prospects need it. |
| Leads / opportunities | Demo-ready | Opportunity intake, source/service fields, assessment context, customer/project/estimate handoff. | Public acquisition and full CRM automation deferred. | Protected route and workflow smoke. | Medium | Yes | Tighten import/source continuity later. |
| Customers / contacts | Demo-ready | Canonical customers, contacts, primary-contact linking, customer summary, account/project/financial context. | Legacy email/phone-only customers may need non-destructive cleanup/backfill review. | Customer detail smoke, primary-contact unit coverage. | Medium | Yes | Run contact consistency reports before real data onboarding. |
| Directory / People | Demo-ready | Directory read/index surface; People owns workforce, customer contacts, portal grants, temp credentials, project visibility. | Directory/contact convergence and broader permission UI remain future. | People directory/access spec, portal-access unit coverage. | Medium | Yes | Keep People as access console; avoid duplicate contact models. |
| Portal access / customer auth | Demo-ready with fixture dependency | Contact-scoped grants, project visibility, app-managed invite flow, temporary credential fallback, portal-only auth boundary. | Provider email delivery and broader customer-admin portal management deferred. | Portal fixture/auth/smoke and invite specs. | Medium | Yes | Validate fixture and contact consistency before founder demos. |
| Projects | Demo-ready | Project Workspace command center, connected lanes, readiness context, access visibility, recency summary. | Full activity timeline and shared evidence layer deferred. | Project detail, guidance, cue, schedule handoff specs. | Medium | Yes | Continue project-centered continuity as future slices require. |
| Estimates | Demo-ready | Catalog-first editor, line items, explicit save, snapshots, portal approval, print/save view, reuse/import from estimates. | Advanced takeoff, full system generation, materials planning, stored document output deferred. | Estimate editor/unit and document delivery specs. | Medium | Yes | Catalog/materials depth is a high-confidence future option. |
| Contracts | Demo-ready | Generated contracts, draft edit, portal signing, onsite signing, signer history, print/save view. | External e-sign provider and richer lifecycle tooling deferred. | Detail workspace and contract-related smoke. | Medium | Yes | Preserve canonical contract/signer/signature event model. |
| Change orders | Usable but shallow | Canonical change-order foundation and portal review. | Deeper downstream polish and billing integration depth remain. | Route/UI coverage is lighter than core records. | Medium | Maybe | Deepen after first paid workflow needs it. |
| Invoices | Demo-ready | Canonical invoices, lineage, balances, payment activity, portal review/payment foundation, print/save view. | One-off/direct invoice shortcut and deeper AIA/export forms deferred. | Invoice/detail/document/payment tests. | Medium | Yes | Keep direct invoice out until approved; export readiness may include invoices. |
| Payments | Usable but shallow | Contractor-side payments manager, canonical payments/payment events, portal payment foundation. | Refunds, disputes, retries, deeper reconciliation, accounting sync deferred. | Payments route and webhook/unit coverage where scoped. | Medium | Yes | Do not change payment state in planning/docs pass. |
| Jobs | Demo-ready | Canonical jobs, readiness-gated execution handoff, job detail workspace. | Dispatch depth, capacity, mobile field execution depth deferred. | Job/detail/schedule handoff specs. | Medium | Yes | Scheduling/dispatch depth remains a feedback-driven option. |
| Schedule | Usable but shallow | `/schedule` command center, Ready queue, Scheduled timeline, selected job action panel, crew assignment. | Drag/drop dispatch, route optimization, crew calendars, capacity/conflicts deferred. | Schedule-ready-handoff spec. | Medium | Yes for operational proof | Build dispatch depth only if contractor feedback elevates it. |
| Daily logs / field notes / time | Usable but shallow | Daily logs, field notes, execution attachments, time punches/time cards, readiness-gated execution. | Mobile-first crew workflow, payroll, OSHA/safety depth deferred. | Focused unit/route coverage; not full field E2E. | Medium | Maybe | Keep field depth behind schedule/materials priorities. |
| Communications / notifications | Foundation only | Communication threads/messages, notifications/deliveries, safe reply/triage, deterministic cues. | Provider-backed messaging, delivery proof, unified inbox, broad customer messaging deferred. | Unit and limited route coverage. | Medium | Maybe | Email/provider hardening can be a cleanup option. |
| Documents / print-save | Demo-ready for browser print/save | Contractor and portal estimate/contract/invoice `/pdf` views render canonical records with safe branding. | Stored PDF bytes, document manager, versioning, delivery lifecycle, shared evidence layer deferred. | `estimate-document-pdf-delivery` and portal golden-path checks. | High expectation risk | Yes | State caveat clearly; consider document management later. |
| Billing Operations / SaaS billing | Demo-ready in test mode | `/super-admin/billing`, test Product/Price create/discover, test Checkout, signed SaaS webhook reconciliation, manual activation separation. | Live billing, Customer Portal, entitlement enforcement, dunning/cancellation/waivers deferred. | Billing unit tests, super-admin/setup QA, runbook evidence. | High | Yes for operator readiness | Keep live launch gated; do not auto-activate. |
| Super-admin | Usable but shallow | Platform roles, defaults, starter packs, groups, packages, billing, early access, operations read models. | Many governance surfaces are read-only; entitlement/package activation deferred. | Super-admin access and unit coverage. | Medium | Operator-only | Keep boring/operator-controlled. |
| Settings / workflow guidance | Demo-ready | Guided/Flexible/Manual workflow preferences, financial/workflow/admin settings foundations, AI prefs separated. | Module enablement, automation builder, templates/systems depth deferred. | Workflow preference unit coverage and protected QA. | Medium | Yes | Preserve guidance as presentation, not gate bypass. |
| Reporting | Foundation only | `/reports`, Sales Tax Summary/read-only reporting basics. | Broad analytics, exports, report builder, owner dashboards deferred. | Limited route coverage. | Medium | Maybe | Reporting/dashboard depth is a wait-for-feedback option. |
| Import/export | Planned | Internal estimate line/reusable content import exists; no broad data import/export product surface. | Customer/contact/project/estimate/invoice/job import/export readiness not built. | No dedicated broad import/export QA. | High trust risk | Likely yes | Recommended next slice: import/export readiness. |
| AI / automation | Foundation only | Deterministic operational cues, My Work, rule settings, work-item prefill, notification foundations. | AI summaries, drafts, autonomous actions, public AI intake, automation engine deferred. | Unit/protected cue specs. | Medium expectation risk | No | Keep gated until core trust blockers are lower. |
| Mobile/responsive | Usable but shallow | Responsive detail workspace QA and mobile overflow guards. | Dense manager tables may still use horizontal scroll; card-first mobile not universal. | Mobile overflow checks in selected specs. | Medium | Maybe | Manager/mobile polish is feedback-driven. |
| Design system / UI consistency | Demo-ready | Estimate-led Graphite/Copper baseline, shared workspace/cards/status helpers, enterprise audit. | Directory/older utilities still have hardcoded warm literals; portal density watch list remains. | Enterprise UI audit plus protected smoke expectations. | Low-medium | Yes | Opportunistic token cleanup only; no broad redesign. |
| Security / RLS / tenant isolation | Usable but high-stakes | Supabase RLS, tenant-scoped server utilities, portal access grants, platform role boundary. | Needs continued caution with every new table/action/import/export slice. | Auth, portal, super-admin, RLS-aware tests. | High | Yes | Any next slice must include server-side tenant checks and RLS review. |
| Integrations / Stripe / email / future providers | Foundation only | Stripe customer payment foundation, separate SaaS billing domain, email invite delivery path with activation guard. | Live SaaS billing, Customer Portal, accounting, e-sign, tax, calendar integrations deferred. | Billing/payment/email unit and smoke coverage where scoped. | High | Partial | Harden only one integration boundary at a time. |

## End-To-End Workflow Readiness

| Step | Working today | Friction / limitation | E2E coverage | Founder demo? | Needed for real paid usage |
| --- | --- | --- | --- | --- | --- |
| Opportunity | Lead/opportunity intake and handoff exist. | Public acquisition and import are shallow. | Protected smoke. | Yes | Import/source cleanup likely helpful. |
| Customer | Canonical customer/account and contact linking exist. | Legacy contact consistency may need reporting/backfill. | Customer detail smoke. | Yes | Contact cleanup before real customer invites. |
| Project | Project is operational hub with connected lanes and readiness context. | Full activity/evidence timeline deferred. | Project detail and cue specs. | Yes | Continued hub polish as workflows deepen. |
| Estimate | Catalog-first estimate authoring, approval, snapshots, print/save. | Advanced takeoff/materials depth deferred. | Estimate/document specs. | Yes | More catalog/materials depth may be needed. |
| Contract | Canonical contract, portal/onsite signing, print/save. | External e-sign and advanced provider lifecycle deferred. | Detail/portal coverage. | Yes | Provider e-sign only if requested. |
| Change order | Canonical foundation exists. | Less mature than estimate/contract/invoice. | Lighter coverage. | Optional | Build when paid workflows need changes. |
| Job | Canonical jobs with readiness-gated creation/execution. | Dispatch depth deferred. | Job/schedule specs. | Yes | Dispatch depth if contractor schedule pain dominates. |
| Invoice | Canonical invoices, lineage, payment state, print/save. | Direct invoice shortcut and export forms deferred. | Invoice/document/payment coverage. | Yes | Export/reporting likely needed. |
| Payment | Contractor and portal payment foundation exists. | Deeper reconciliation/refund/dispute/live ops deferred. | Webhook/unit where scoped. | Show, but stop before unsafe checkout unless scoped. | Payment hardening after activation/live billing decisions. |

Supporting loops:

- Customer portal: demo-ready with real portal auth and fixture prerequisites; do not count login/access-denied as success.
- Directory/contact access: demo-ready; People owns management, Project/Customer show summaries.
- Scheduling: usable command surface; not dispatch-grade.
- Documents/print-save: demo-ready as browser print/save, not stored PDF management.
- Billing Operations: demo-ready in test mode; live launch deferred.
- Setup/onboarding: demo-ready for controlled early access.
- Super-admin activation: manual and explicit; no automatic activation.

## UX / Design Consistency

| Surface | Classification | Notes |
| --- | --- | --- |
| Contractor manager pages | Aligned | Use `ContractorWorkspacePage`, `ManagerDashboardCard`, shared status helpers, and compact manager rhythm. |
| Detail workspaces | Aligned | Project, Estimate, Contract, Invoice, and Job use shared header/action/workflow/context patterns; Estimate remains the reference. |
| Project hub | Aligned | Operational command center and connected lanes preserve Project as hub without replacing focused record workspaces. |
| Directory / People | Minor drift / aligned enough | Directory is an index; People is access console. Future token cleanup can be opportunistic. |
| Schedule | Aligned enough | Uses shared contractor workspace pattern and canonical job/job-assignment data. |
| Setup pages | Aligned with watch items | Honest onboarding and billing setup, not marketing chrome. |
| Settings pages | Aligned with watch items | Shared settings/admin panels; avoid route-local color systems. |
| Super-admin pages | Aligned with admin-specific differences | Dense slate/black administrative surfaces; Billing Operations is durable operator console. |
| Portal pages | Aligned with customer-safe differences | Simpler review/action hierarchy; portal density remains a watch item. |
| Print/save pages | Aligned | Customer-facing canonical record renderings; not stored documents. |

UI plan guardrails for future slices:

- Prefer `StandardWorkspaceLayout` for focused editor/workspace surfaces that already use it, and `ContractorWorkspacePage` / current shared manager patterns for manager pages.
- Do not introduce a new shell/layout wrapper without an explicit structural reason.
- Reuse shared components such as `DetailPageHeader`, `LinkedRecordCard`, `ManagerDashboardCard`, `ActionBar`, `WorkflowBar`, and `@floorconnector/ui` status helpers.
- Preserve settings/work/super-admin boundaries.
- Preserve FloorConnector colors, typography, and Graphite/Copper branding.
- Do not touch pricing, estimate, invoice, payment, signature, or billing business logic during UI-only work.

## QA / Test Coverage Findings

Current confidence:

- Core static validation is expected through `pnpm typecheck`, `pnpm lint`, and `git diff --check`.
- Protected browser QA depends on real auth storage state and the matching `PLAYWRIGHT_BASE_URL`.
- Portal QA depends on a real portal customer user plus canonical `portal_access_grants` and `portal_project_access`.
- Super-admin QA depends on explicit `platform_user_roles`, not contractor membership.
- Billing unit coverage exists for Billing Operations, test Product/Price setup, SaaS Checkout, and SaaS webhook reconciliation.
- Document delivery smoke covers protected print/save routes and portal golden-path print routes when fixture records exist.
- Schedule ready handoff coverage verifies `/schedule` URL contract and no load-time schedule mutation.

Known pitfalls:

- Do not count `/login`, access-denied, missing fixture, or setup gate redirects as successful protected/portal QA.
- Run shared-webServer Playwright commands sequentially unless ports are isolated.
- `PLAYWRIGHT_SKIP_WEB_SERVER=1` is valid only when the exact `PLAYWRIGHT_BASE_URL` is already responsive.
- Do not run long E2E during docs-only work unless route status must be refreshed.
- Do not print credentials, env values, invite tokens, token hashes, service-role keys, Stripe secrets, webhook secrets, Checkout URLs, raw webhook payloads, payment details, or private customer data.

## Recommended Next Build Options

High-confidence options while contractor review is pending:

1. Import/export readiness.
   - Why: improves trust and reversibility without depending on a specific contractor workflow preference.
   - Good first scope: read-only export map and first CSV export surfaces/commands for canonical customer/contact/project/estimate/invoice/job basics, plus import-readiness plan and validation rules.
2. QA/docs hardening.
   - Why: keeps current demo path credible while avoiding product drift.
   - Good first scope: link checks, route inventory, fixture readiness report, and stale-doc cleanup.
3. Data/contact consistency reporting.
   - Why: supports portal/customer trust before real contractor data enters the system.
   - Good first scope: non-destructive reports for customers without related contacts, null-contact portal grants, and duplicate contact candidates.

Wait-for-feedback options:

1. Materials/catalog/estimate depth.
   - Build if contractors focus on proposal accuracy, reusable systems, scope clarity, or material/labor assumptions.
2. Scheduling/dispatch depth.
   - Build if contractors focus on crew timing, signed-work handoff, capacity, or job planning.
3. Reporting/dashboard depth.
   - Build if owners cannot evaluate business health from the current app.

Cleanup/QA options:

1. Manager/mobile table-to-card polish on the most-used manager pages.
2. Email/provider delivery hardening for portal invites and customer-facing sends.
3. Billing Operations live-readiness indicators only, with no live provider mutation.

## Recommended Next Slice

Recommended slice: Import/export readiness.

Why:

- It answers a founder-customer trust objection: contractors need confidence they can bring core data in and get core data out.
- It does not require choosing between estimate depth, scheduling depth, reporting depth, or communications depth before contractor feedback arrives.
- It can be scoped around existing canonical records and tenant-safe read models.
- It reinforces the production-first posture without touching billing, payment, signature, portal access, or financial calculations.

Scope:

- Inventory current canonical records and safe export fields for customers, contacts, projects, estimates, invoices, jobs, and payments.
- Define export formats and tenant-scoped server boundaries.
- Build the first narrow export readiness artifact or read-only route only if explicitly approved in the next prompt.
- Define import validation and backfill requirements without writing import mutations in the first slice.

Out of scope:

- No schema changes unless separately approved.
- No destructive imports.
- No financial calculation changes.
- No payment/signature/billing state changes.
- No portal access changes.
- No provider sync.
- No accounting/QuickBooks integration.
- No fake data migration.

Validation:

- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`
- Targeted tests for any read-model/export helpers if code is added.
- Browser QA only if a route/UI surface is added.

## Next Codex Prompt

```text
Chat: FloorConnector Import/Export Readiness Slice

You are working in C:\FloorConnector.

Read first:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/system-status-review.md
- docs/system-risk-register.md
- docs/portal-identity-review.md
- docs/e2e-browser-qa.md

Goal:
Plan and implement the smallest safe Import/Export Readiness slice that improves founder-customer trust without changing business behavior.

Guardrails:
- Preserve canonical lifecycle: opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment
- No duplicate models
- No schema changes unless you stop and ask for approval first
- No payment, signature, invoice, Stripe, portal-access, activation, entitlement, RLS, tenant-isolation, or financial-calculation changes
- No live provider calls
- Do not print credentials, env values, tokens, Stripe keys, webhook secrets, Checkout URLs, payment details, or private customer data

Preferred first slice:
- Create an import/export readiness plan and, only if implementation is clearly safe, a tenant-scoped read-only export foundation for core records.
- Start with export before import.
- Favor canonical records: customers, contacts/customer_contacts, projects, estimates, invoices, jobs, and payments.
- Keep exports tenant-scoped and server-validated.
- Use existing data access conventions and shared UI patterns if a UI is introduced.

Required outputs:
1. Current import/export inventory
2. Safe export field map
3. Import readiness/backfill caveats
4. Implementation, if approved by the repo shape
5. Files changed
6. Env vars required
7. Validation results
8. Follow-up tasks
```

## Files Created By This Review

- `docs/system-status-review.md`
- `docs/system-risk-register.md`

## Schema / Migration Decision

No schema or migration changes are required for this review.
