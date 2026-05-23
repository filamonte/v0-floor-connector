# Next Build Priority Checkpoint

Status: Active
Doc Type: Planning / Priority Checkpoint

Date: 2026-05-23

## Purpose

This checkpoint reviews FloorConnector's current operating-core, portal,
financial, document, staging, and Company Documents state after the recent
Company Documents Phase 1C planning commit. It recommends the next three
highest-value build slices without implementing application behavior.

This pass is planning and prioritization only. It does not implement features,
add schema or migrations, change routes, server actions, auth/RLS, tenant
logic, payments, signatures, estimate math, invoice math, portal grants,
settings, platform-admin logic, env vars, provider calls, external resources,
or deployment settings.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/product-language.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/design/operating-core-checkpoint.md`
- `docs/design/documentation-governance-cleanup.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/staging-owner-runbook.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/design/company-documents-phase-1c-starter-documents-plan.md`
- `docs/design/company-documents-phase-1-qa-checkpoint.md`
- `docs/design/financial-control-phase-1-collections-payment-attention.md`
- `docs/design/portal-maturity-phase-4-shared-documents.md`
- `docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md`
- `docs/design/warranty-service-phase-1-workspace-depth.md`

## Files Inspected

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/financials/accounting-readiness/page.tsx`
- `apps/web/app/(app)/settings/company-documents/page.tsx`
- `apps/web/lib/company-documents/*`
- `apps/web/lib/portal/*`
- `apps/web/lib/financials/*`
- `apps/web/lib/projectpulse/*`
- `apps/web/lib/fieldtrail/*`
- `apps/web/lib/messagecenter/*`
- `apps/web/lib/proofcenter/*`
- `apps/web/lib/servicecenter/*`

## Current Operating-Core Snapshot

FloorConnector now has a real connected operating foundation:

- canonical lifecycle remains
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`;
- Project Workspace is the continuity hub, with ProjectPulse, FieldTrail,
  MessageCenter, CloseoutTrail, Proof Center, Send Trail context, service and
  warranty continuity, customer access, and closeout package handoff;
- CrewBoard on `/schedule` is a good-enough canonical job, appointment, and
  assignment scheduling surface without drag/drop dispatch;
- Portal Customer Window includes Customer Next Step, Project Status Window,
  Project Timeline, Shared Documents, warranty document review/sign where
  applicable, and existing portal print routes;
- Financial Control, Accounts Receivable, Accounting Readiness, and Accounting
  Export Prep are read-only review/export-prep surfaces over canonical
  invoices, payments, payment events, customers, and projects;
- Document Engine print/save surfaces cover source-record exports and the
  contractor closeout package without stored PDFs or delivery proof mutation;
- Company Documents Phase 1A/1B/QA is tenant-owned, scoped, and documented;
- Company Documents Phase 1C is planned but not implemented;
- staging/demo readiness has a dry-run seed planner, owner runbook, and clear
  external setup hold points, but no owner-approved write-mode demo dataset.

The next slice should strengthen what is already coherent. The main risk now is
not a missing product backbone; it is overreaching into provider, portal,
financial, AI, billing, or deployment behavior before the next guardrails are
chosen.

## Candidate Evaluation

| Candidate                                                            | User/business value                                                                        | Technical risk                            | Architectural risk                                  | Schema required                                 | External services required        | Demo/staging support | Operational stickiness | Recommended scope boundary                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------- | --------------------------------------------------- | ----------------------------------------------- | --------------------------------- | -------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Company Documents Phase 1C-A - Starter Document Adoption             | High for onboarding and settings value; gives contractors useful admin content immediately | Low to medium                             | Low if `document_templates` stays separate          | Prefer no                                       | No                                | Medium               | Medium                 | Code-defined starters, preview, adopt into tenant-owned draft Company Documents only |
| Company Documents Phase 1D - Document Engine export/polish           | Medium; improves current document trust                                                    | Low                                       | Low                                                 | No                                              | No                                | Medium               | Medium                 | Copy/layout/export polish only; no stored PDFs, delivery proof, or provider sends    |
| Staging Demo Seed Phase 1 - Write-mode design or dry-run expansion   | High for external demo credibility                                                         | Medium                                    | Medium                                              | No schema if script-only                        | No provider calls                 | Very high            | Medium                 | Owner-approved design/guarded dry-run expansion before any write mode                |
| Portal Maturity Phase 5 - Customer service/warranty visibility       | High customer value                                                                        | Medium                                    | Medium to high                                      | Maybe, depending on portal request/status model | No provider required              | Medium               | High                   | Start with read-only warranty/service status plan; no customer ticket creation yet   |
| Mobile Field Phase 2 - Quick Job Notes / evidence capture            | High field value and daily stickiness                                                      | Low to medium                             | Low if it reuses Daily Logs, Job Notes, attachments | Prefer no                                       | No                                | High                 | High                   | Fast capture over existing records; no native/offline/photo-upload overhaul          |
| CrewBoard Phase 3 - Drag/drop design spec only                       | Medium ops value                                                                           | Low as design, high as implementation     | Medium                                              | No for design                                   | No                                | Medium               | Medium                 | Specification only; no drag/drop implementation yet                                  |
| Reporting Phase 2 - Owner dashboards / trend charts                  | Medium to high owner value                                                                 | Medium                                    | Medium                                              | Maybe later for performance summaries           | No                                | Medium               | Medium                 | Read-only trends from canonical records; no analytics warehouse                      |
| Financial Control Phase 2 - Payment reconciliation depth             | High for money operations                                                                  | Medium to high                            | High near provider/accounting boundaries            | Maybe                                           | Possibly if provider sync expands | Medium               | High                   | Reconciliation review depth only; no refunds, retries, posting, or sync              |
| Document Engine Phase 2B - Portal closeout package download planning | Medium customer handoff value                                                              | Low as planning, medium as implementation | Medium                                              | Maybe later                                     | No                                | Medium               | Medium                 | Planning only until visibility/version/storage policy is explicit                    |
| Super Admin / Entitlements hardening                                 | High platform governance value                                                             | Medium                                    | High if entitlements affect runtime                 | Maybe                                           | No                                | Low to medium        | Medium                 | Read-only/config hardening first; no tenant gating without policy                    |
| Billing/subscription setup for SaaS plans                            | High business infrastructure value                                                         | High                                      | High                                                | Maybe                                           | Stripe                            | Medium               | Medium                 | Readiness indicators/test-mode only unless live launch approved                      |
| Accounting integration planning                                      | Medium to high owner value                                                                 | Low as planning, high as implementation   | High                                                | No for planning                                 | QuickBooks/Xero later             | Medium               | Medium                 | Planning/export-contract only; no provider sync or ledger posting                    |
| Contractor Network / certified service provider planning             | Long-term platform value                                                                   | Medium as planning                        | High                                                | Likely later                                    | Maybe later                       | Low                  | Medium                 | Future-only doctrine; no marketplace, bidding exchange, or duplicate records         |
| Marketing/demo assets or investor deck                               | Medium go-to-market value                                                                  | Low                                       | Low                                                 | No                                              | Maybe external creative tools     | High                 | Low                    | Truthful assets from current-state only; no product behavior changes                 |
| Staging deployment owner-action execution                            | High deployment value                                                                      | Medium to high                            | Medium                                              | Remote migration alignment may be needed        | Vercel/Supabase/providers         | Very high            | Low                    | Owner-controlled checklist execution only; no unapproved deploy/resources            |

## Top 3 Recommended Next Build Slices

### 1. Company Documents Phase 1C-A - Starter Document Adoption

Why it is next:

- The plan is complete and recent.
- It is a bounded continuation of a fresh, well-tested area.
- It gives contractors immediate value without touching payments, signatures,
  portal access, provider sends, or AI.
- It can likely avoid schema by using a small code-defined starter registry and
  tenant-owned draft adoption.
- It reinforces the platform-defaults-to-contractor-owned-copy pattern already
  used by templates and catalog seeds.

Primary risks:

- Confusing Starter Documents with `document_templates`.
- Accidentally implying legal advice or final legal/compliance readiness.
- Pretending durable starter lineage exists before provenance fields are
  approved.

Recommended boundary:

- code-defined starters;
- contractor preview/adoption;
- owner/admin/manager adoption only;
- adopted copy starts as `draft`;
- no platform-admin management;
- no AI/legal/e-sign/acknowledgement/portal/provider behavior;
- no schema unless duplicate prevention/provenance is explicitly approved.

Codex-ready prompt title:

`Company Documents Phase 1C-A - Starter Document Adoption`

### 2. Staging Demo Seed Phase 2 - Owner-Approved Write-Mode Design

Why it is next:

- The product is now demoable in breadth, but a coherent staging demo dataset is
  still the weak link.
- Current docs already specify the ideal dataset and a dry-run-only planner.
- A design/readiness pass for write mode would make the next owner-approved
  action safer without immediately mutating staging.
- It supports external demos, investor conversations, and QA more than another
  isolated product polish pass.

Primary risks:

- Service-role writes against the wrong environment.
- Fake provider/payment/signature evidence.
- Portal invite-token leakage.
- Destructive cleanup semantics before the demo dataset policy is clear.

Recommended boundary:

- design or dry-run expansion first;
- explicit tenant allowlist and owner confirmation;
- no write execution until separately approved with real staging identifiers;
- no provider calls, auth-user creation, invite-token output, migrations, or
  fake payment/signature events;
- route-discovery validation plan over hardcoded IDs.

Codex-ready prompt title:

`Staging Demo Seed Phase 2 - Owner-Approved Write-Mode Design`

### 3. Mobile Field Phase 2 - Quick Job Notes And Evidence Capture

Why it is next:

- Field capture is a daily-use workflow and increases operational stickiness.
- Phase 1 already improved Daily Job Log capture and added fast paths from Job
  Workspace and CrewBoard.
- The next layer can reuse existing Daily Logs, Job Notes, execution
  attachments, jobs, projects, time cards, and FieldTrail summaries.
- It gives the product more "field crew uses this every day" weight without
  needing native/offline/mobile-app scope.

Primary risks:

- Accidentally creating a second field subsystem outside Daily Logs/Job Notes.
- Expanding into storage/upload policy before evidence rules are ready.
- Exposing contractor-only field evidence to the portal too early.

Recommended boundary:

- quick add Job Note from job/schedule/daily-log contexts;
- optional evidence capture affordance only over existing attachment mechanics;
- mobile viewport polish and fixture-safe tests;
- no native app, offline mode, GPS, push notifications, customer-facing
  FieldTrail, new storage policy, or AI summaries.

Codex-ready prompt title:

`Mobile Field Phase 2 - Quick Job Notes And Evidence Capture`

## Why These Three Beat The Near Alternatives

- Portal service/warranty visibility is valuable, but customer-facing service
  status needs a careful plan first so internal tickets do not leak into the
  portal as a detached helpdesk.
- Financial reconciliation depth is valuable, but it sits close to provider,
  accounting, refund/dispute, and payment-state boundaries. It should follow a
  narrower reconciliation-readiness prompt.
- Document Engine portal closeout downloads are useful, but storage/versioning
  and customer visibility policy should be planned before adding portal package
  behavior.
- Billing/subscription work matters for the business, but live billing,
  entitlements, Customer Portal, and production release gates are not the right
  next default while product/demo readiness still has lower-risk work available.
- Contractor Network planning is strategically interesting, but it is later
  ecosystem work and should not precede stronger demo, field, and company-doc
  foundations.

## What To Avoid Right Now

- AI drafting for Company Documents.
- Legal-document generation claims.
- Portal/customer exposure of Company Documents.
- Employee acknowledgements or e-sign on Company Documents.
- Stored PDFs, provider sends, or delivery proof for Company Documents.
- Drag/drop dispatch implementation before a design spec.
- Live Stripe billing launch, entitlement enforcement, or Customer Portal.
- QuickBooks/Xero sync or ledger posting.
- Provider retry/reminder automation.
- Customer-facing service request creation before portal service policy is
  explicit.
- Native/offline mobile scope before responsive web field capture is stable.
- Staging writes, Vercel deployment, Supabase migration application, provider
  setup, or remote resource creation without explicit owner approval.

## Recommended Order

1. `Company Documents Phase 1C-A - Starter Document Adoption`
2. `Staging Demo Seed Phase 2 - Owner-Approved Write-Mode Design`
3. `Mobile Field Phase 2 - Quick Job Notes And Evidence Capture`

If the immediate business need is an external demo or investor walkthrough,
swap the first two:

1. `Staging Demo Seed Phase 2 - Owner-Approved Write-Mode Design`
2. `Company Documents Phase 1C-A - Starter Document Adoption`
3. `Mobile Field Phase 2 - Quick Job Notes And Evidence Capture`

## Codex-Ready Prompt Titles

- `Company Documents Phase 1C-A - Starter Document Adoption`
- `Staging Demo Seed Phase 2 - Owner-Approved Write-Mode Design`
- `Mobile Field Phase 2 - Quick Job Notes And Evidence Capture`
- `Portal Maturity Phase 5 Planning - Service And Warranty Visibility`
- `Financial Control Phase 2 Planning - Payment Reconciliation Depth`
- `CrewBoard Phase 3 Planning - Drag And Drop Dispatch Boundaries`
- `Document Engine Phase 2B Planning - Portal Closeout Package Download`

## Owner Decisions Needed

- Is the next priority product momentum or external demo readiness?
- For Company Documents adoption: is no-schema adoption acceptable for Phase
  1C-A, with duplicate detection/provenance deferred?
- For staging demo data: which staging tenant, owner/admin user, portal
  customer email, and environment are approved for any future write-mode design
  or execution?
- For field capture: should Phase 2 optimize Job Notes first, evidence
  attachments first, or one combined quick-capture flow?
- Should any customer-facing service/warranty status appear before a portal
  service policy is documented?
- Should billing/subscription work stay behind product/demo readiness, or is a
  commercial launch gate now the business priority?

## Behavior Preserved

This checkpoint changed documentation only. It did not change app behavior,
schema, migrations, routes, server actions, auth/RLS, tenant logic, payments,
signatures, estimate math, invoice math, portal grants, settings,
platform-admin logic, env vars, provider configuration, external resources, or
deployment settings.
