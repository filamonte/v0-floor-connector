# Portal Capability Wave v1

Status: Planning Only
Doc Type: Design Plan

## 1. Status And Intent

This is a planning-only document. It is not an implementation claim, and it
does not add portal routes, schema, server actions, UI behavior, schedule state,
field state, billing state, or project state.

Portal maturity should follow contractor-side project, schedule, and field
truth because the portal is a customer-facing surface over FloorConnector's
canonical operating system. The contractor app owns project readiness,
Scheduling/CrewBoard owns visibility and action over canonical jobs and
`job_assignments`, and field/mobile work continues through canonical jobs,
Daily Logs, Field Notes, execution attachments, People, vendors, and time
records. The portal should make that truth understandable to customers only
after the contractor-side state is scoped, stable, and customer-safe.

The Wave v1 goal is to make the portal feel like the customer's live window into
their project while preserving canonical ownership. Customers should see clear
status, next actions, shared commercial records, payment progress, and
intentionally shared evidence without the portal becoming a second project,
schedule, field, billing, document, message, contract, invoice, change-order, or
payment system.

## 2. Source Docs Read

Read first:

- `docs/developer-source-of-truth.md`

Requested docs read:

- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`

Additional portal and coordination docs read:

- `docs/portal-architecture.md`
- `docs/portal-identity-review.md`
- `docs/adr/0003-shared-portal-records.md`
- `docs/design/portal-maturity-phase-1-customer-project-window.md`
- `docs/design/portal-maturity-phase-2-project-status-window.md`
- `docs/design/portal-maturity-phase-3-project-timeline.md`
- `docs/design/portal-maturity-phase-4-shared-documents.md`
- `docs/design/customer-safe-closeout-package.md`
- `docs/design/shared-file-visibility-portal-evidence-grants.md`
- `docs/design/shared-evidence-delivery-proof-and-acknowledgement.md`
- `docs/design/communications-v1-portal-safe-replies.md`

Requested docs missing in this stream worktree during the original planning
pass:

- `docs/design/project-workspace-capability-wave-v1.md`
- `docs/design/scheduling-capability-wave-v1.md`
- `docs/design/field-mobile-capability-wave-v1.md`

Because those cross-stream wave docs were missing there, this plan used the
current chat guidance as coordination context instead of inventing file
contents.

Reconciled-docs note: all three sibling wave docs are now present in the main
docs set. The missing-doc note above is preserved as historical stream-planning
context, not current missing-doc status.

## 3. Current Implemented Baseline

Current branch reality, based on the source docs and inspected code:

- Portal access grants exist on canonical `portal_access_grants`.
- Project-scoped portal visibility exists on canonical `portal_project_access`.
- Portal access is contact-centered for new contractor-created invites, with
  customer contacts and explicit project visibility. Auth identity alone does
  not grant portal visibility.
- The portal shell and home route exist at `apps/web/app/(portal)/portal`.
  Portal home lists explicitly accessible projects and customer-safe project
  cues.
- Portal project workspaces exist at
  `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx` and load scoped
  project summary, appointments, estimates, contracts, invoices, change orders,
  warranty documents, shared evidence, and project communication summaries
  through portal loaders.
- Estimate review exists on canonical estimates. Portal customers can review
  shared estimates and approve/reject sent estimates where scoped permissions
  allow it.
- Contract review/sign/decline exists on canonical contracts,
  `contract_signers`, and `contract_signature_events`. Portal signing and
  decline act on the same contract record the contractor uses.
- Invoice review and payment initiation exist on canonical invoices, payments,
  and payment events. Portal invoice review can show payment state, and checkout
  start creates or reuses canonical pending payment state.
- Payment state continuity is implemented through canonical `payments` and
  append-only/effectively immutable `payment_events`, with provider-isolated
  checkout and webhook coverage in E2E specs.
- Change-order review/approval/rejection exists for sent canonical change
  orders when contact permission allows it.
- Portal record view and audit foundations exist where current workflows record
  portal views, customer actions, signature events, payment events, and explicit
  portal evidence delivery events.
- Customer-safe closeout handoff, shared documents, project timeline, project
  status window, shared evidence grants, evidence delivery proof, receipt
  rollups, and portal-safe replies are implemented as scoped read models and
  guarded actions over canonical records.

Do not overread that baseline. The portal is not a full customer operations app,
does not own schedule or field truth, does not expose internal FieldTrail or
Proof Center by default, and does not provide customer self-scheduling or broad
customer-facing field notes/photos.

## 4. Product Goal

Portal Wave v1 should define the next implementation-safe maturity slice as:

- a customer-facing project window over canonical project truth
- clear status and next-step visibility
- estimate, contract, invoice, and change-order continuity
- payment progress visibility through customer-safe payment state and payment
  event summaries
- controlled document/file visibility only where existing foundations support
  it, such as current portal review/print routes and explicit evidence grants
- customer-safe schedule visibility only if contractor-side schedule truth and
  scoped portal loaders support it
- customer-safe field/progress visibility only if contractor-side field truth,
  evidence sharing, and redaction rules support it
- no portal-owned business state

## 5. Wave v1 Scope

Wave v1 may include planning or future implementation slices for:

- portal home and project summary polish that makes current status and shared
  project context easier to scan
- clearer Customer Next Step and customer action hierarchy
- continuity cards for estimate, contract, invoice, and change-order records
  already exposed through scoped portal loaders
- payment state and customer-safe payment-event visibility polish
- signed-contract and open-invoice guidance that points customers to existing
  canonical review/sign/pay routes
- project status language that avoids promising unbuilt scheduling or field
  capabilities
- portal access and project-grant management review where contractor-side
  surfaces already exist on Customer Workspace and People
- customer-safe activity/audit visibility only where existing view/action/event
  foundations support it
- optional schedule and field visibility as read-only future-adjacent planning,
  not an implementation promise

## 6. Out Of Scope

Explicitly excluded:

- portal-owned schedule state
- portal-owned field progress state
- portal-owned project status
- duplicate portal message tables
- duplicate portal documents model
- duplicate portal contract, invoice, change-order, payment, estimate, or
  project records
- customer self-scheduling
- customer-facing field notes/photos by default
- autonomous AI or customer actions
- new schema or migrations unless a later implementation slice proves a
  specific need
- broad portal redesign unrelated to maturity and continuity
- customer-facing exposure of contractor-only FieldTrail, Proof Center, Daily
  Log internals, Job Notes, readiness internals, provider metadata, or internal
  blockers by default

## 7. Proposed Decomposition

Future implementation should break into safe slices:

1. Portal read-model/access audit: verify current scoped loaders, grant checks,
   permission helpers, and customer-safe fields before any UI change.
2. Portal project summary/next-action polish: improve copy and hierarchy over
   already-loaded data only.
3. Estimate/contract/invoice/change-order continuity cards: refine existing
   cards and links without adding new record ownership.
4. Payment state messaging polish: clarify pending, failed, voided, partial,
   and paid states using canonical payment events.
5. Portal access management review: audit Customer Workspace and People access
   surfaces for explicit contact/project grant clarity.
6. Customer-safe activity/audit panel if supported: derive only from existing
   portal record views, signature events, payment events, change-order/estimate
   decisions, communication messages, and explicit evidence delivery events.
7. Schedule/field visibility design gate: define exactly which customer-safe
   fields can be shown after contractor-owned schedule/field truth is confirmed.
8. Portal E2E/QA hardening: tighten existing portal smoke/action/payment tests
   and auth fixture guidance before adding visible scope.

## 8. Hotspot Map

Confirmed portal route hotspots:

- `apps/web/app/(portal)/portal/layout.tsx`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/app/(portal)/portal/invite/page.tsx`
- `apps/web/app/(portal)/portal/warranty-documents/[warrantyDocumentId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/pdf/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/pdf/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/pdf/page.tsx`
- `apps/web/app/(portal)/portal/warranty-documents/[warrantyDocumentId]/print/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/evidence/[grantId]/download/route.ts`
- `apps/web/app/(portal)/portal/projects/[projectId]/evidence/receipt/page.tsx`

Confirmed portal read-model and access hotspots:

- `apps/web/lib/portal/data.ts`
- `apps/web/lib/portal/next-step.ts`
- `apps/web/lib/portal/project-status-window.ts`
- `apps/web/lib/portal/project-timeline.ts`
- `apps/web/lib/portal/shared-documents.ts`
- `apps/web/lib/portal/closeout-handoff.ts`
- `apps/web/lib/portal/status-explanation.ts`
- `apps/web/lib/portal/appointment-visibility.ts`
- `apps/web/lib/portal/warranty-documents.ts`
- `apps/web/lib/portal-access/data.ts`
- `apps/web/lib/portal-access/actions.ts`
- `apps/web/lib/portal-access/customer-access-summary.ts`
- `apps/web/lib/portal-access/temporary-credentials.ts`
- `apps/web/lib/portal-access/schemas.ts`
- `apps/web/lib/communications/portal-project-data.ts`
- `apps/web/lib/communications/portal-project-summary.ts`
- `apps/web/lib/portal-evidence-grants/data.ts`
- `apps/web/lib/portal-evidence-grants/actions.ts`
- `apps/web/lib/portal-evidence-grants/summary.ts`
- `apps/web/lib/portal-evidence-grants/receipt-rollup.ts`
- `apps/web/lib/portal-evidence-grants/eligibility.ts`

Confirmed contractor-side access management hotspots:

- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/people/page.tsx`
- `apps/web/components/people-portal-access-panel.tsx`
- `apps/web/components/portal-access-grant-form.tsx`
- `apps/web/components/portal-project-access-form.tsx`
- `apps/web/components/portal-invite-email-status.tsx`
- `apps/web/components/temporary-portal-credential-form.tsx`

Confirmed canonical action/helper hotspots used by portal:

- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/change-orders/data.ts`
- `apps/web/lib/change-orders/actions.ts`
- `apps/web/lib/invoices/data.ts`
- `apps/web/lib/invoices/actions.ts`
- `apps/web/lib/payments/data.ts`
- `packages/integrations/src/payments/gateway.ts`
- `apps/web/lib/document-engine/print.ts`
- `apps/web/components/portal-review-ui.tsx`

Confirmed E2E hotspots:

- `e2e/portal-golden-path.spec.js`
- `e2e/portal-invite-acceptance.spec.js`
- `e2e/portal-estimate-actions.spec.js`
- `e2e/portal-contract-actions.spec.js`
- `e2e/portal-invoice-boundary.spec.js`
- `e2e/portal-invoice-checkout-start.spec.js`
- `e2e/portal-change-order-actions.spec.js`
- `e2e/portal-auth.setup.js`
- `e2e/data-export.spec.js`

Risk areas:

- Portal project page already aggregates many read models; new cards should not
  turn it into a contractor-style operational cockpit.
- `apps/web/lib/portal/data.ts` is the primary scope boundary. Adding fields
  there can accidentally expose contractor-only schedule, field, proof, or
  provider details.
- Access helpers in `apps/web/lib/portal-access/data.ts` and actions in
  `apps/web/lib/portal-access/actions.ts` control the contact/project grant
  model. Wave v1 should not weaken explicit grants or silently inherit access.
- Portal commercial action routes must continue to mutate only canonical
  estimates, contracts, change orders, invoices, payments, and events.
- Existing communication replies write canonical communication messages only.
  Wave v1 should not add a portal inbox or duplicate message state.
- Shared evidence grants are explicit and narrow. Wave v1 should not expose
  Daily Log bodies, Job Note bodies, unshared attachments, archived evidence, or
  Work Item evidence.
- Payment state copy must stay tied to canonical invoice/payment/event truth and
  avoid implying payment completion before webhook or recorded-payment evidence
  exists.

## 9. Cross-Stream Coordination

`stream/project-workspace`:

- Project Workspace remains the contractor-side readiness and continuity hub.
- Portal should consume only customer-safe projections of project state, not
  duplicate ProjectPulse, Ready Check, FieldTrail, Proof Center, Copilot, or
  internal blocker logic.
- Conflict warning: do not move readiness ownership into portal copy. The portal
  can explain visible status, but Project Workspace remains where contractors
  resolve readiness and continuity.

`stream/scheduling`:

- Scheduling extends canonical jobs and `job_assignments`.
- Portal schedule visibility, if ever shown in Wave v1 implementation, should be
  read-only, customer-safe, and derived from contractor-owned schedule truth.
- Conflict warning: do not add customer self-scheduling, portal schedule edits,
  portal calendar records, AI schedule commitments, or portal-specific schedule
  status.

`stream/field-mobile`:

- Field/mobile continues through canonical jobs, Daily Logs, Field Notes,
  execution attachments, People, vendors, and time records.
- Portal may show only explicitly shared evidence or high-level customer-safe
  progress after redaction rules exist.
- Conflict warning: do not expose internal Daily Log details, Job Notes, Work
  Item evidence, FieldTrail, crew/labor internals, or unreviewed field photos by
  default.

Dashboard/universal-create work:

- Dashboard and universal create should continue to route contractor users into
  canonical records and workspaces.
- Portal should not become another create surface for project, job, schedule,
  invoice, payment, or field records.
- Conflict warning: customer-facing next actions should link to existing portal
  review/sign/pay/acknowledge/reply actions, not create contractor operational
  records.

Communications/document delivery work:

- Existing portal-safe replies use canonical communication threads/messages and
  do not send email/SMS.
- Document delivery, print/save, evidence grants, and receipt rollups stay
  current-record renderings or explicit proof events, not a portal document
  repository.
- Conflict warning: do not add duplicate portal message tables, provider send
  attempts, stored PDFs, portal-only documents, or customer-visible provider
  diagnostics during this wave.

## 10. Acceptance Criteria For Implementation Readiness

Wave v1 is safe to implement only when:

- scoped portal loaders are confirmed for every field surfaced
- no duplicate portal records or models are introduced
- customer-safe status language is defined before UI changes
- canonical action paths for estimates, contracts, invoices, payments, and
  change orders are preserved
- payment, signature, change-order, evidence acknowledgement, and reply actions
  remain server-owned, tenant-safe, and permissioned
- schedule visibility is gated behind contractor-owned canonical schedule truth
- field visibility is gated behind contractor-owned field truth plus explicit
  sharing/redaction rules
- tests and QA targets are identified before code changes
- cross-stream hotspots are assigned so Project Workspace, Scheduling, and
  Field/Mobile do not race over the same customer-facing copy or read-model
  fields
- browser QA blockers such as stale portal auth, missing portal fixtures, or
  Supabase Auth rate limits are reported honestly instead of counted as passed

## 11. Validation Plan

Likely checks for a future implementation slice:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- targeted helper tests, for example portal read-model tests under
  `apps/web/lib/portal/*.test.ts`
- targeted access/evidence/communication tests when touched:
  `apps/web/lib/portal-access/*.test.ts`,
  `apps/web/lib/portal-evidence-grants/*.test.ts`, and
  `apps/web/lib/communications/*portal*.test.ts`
- targeted E2E specs if behavior changes:
  `pnpm.cmd e2e:portal`, `pnpm.cmd e2e:payments:portal`, or focused
  `pnpm.cmd exec playwright test e2e/<portal-spec>.spec.js --project=chromium-portal`
- `git diff --check`
- Prettier check with `pnpm.cmd exec prettier --check docs/design/portal-capability-wave-v1.md`

For this planning-only pass, the minimum validation is `git diff --check` and a
Prettier check for this document.

## 12. Recommended First Implementation Slice

Recommended first code slice: portal read-model/access audit plus customer-safe
copy/next-action polish over existing loaded data.

Keep the slice small:

- audit `apps/web/lib/portal/data.ts`,
  `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`, and
  `apps/web/lib/portal-access/data.ts`
- identify any project summary or next-action copy that implies unbuilt
  schedule/field ownership
- adjust only customer-safe wording or existing card hierarchy if needed
- add or update focused helper tests if a helper output changes

Do not start with schedule or field visibility. Those areas have the highest
cross-stream conflict risk and should wait until Project Workspace, Scheduling,
and Field/Mobile wave docs are merged or reconciled.
