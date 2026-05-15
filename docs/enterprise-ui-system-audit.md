# Enterprise UI System Audit

Status: Active
Doc Type: UI / QA Audit

This note records the 2026-05-15 enterprise visual-system audit pass. It is a presentation-layer audit only. It does not authorize schema changes, RLS changes, auth changes, payment/signature behavior changes, portal access changes, document-storage changes, or new business workflows.

## Baseline

Estimates remain the tuning fork for the secured contractor app:

- proposal-first record clarity
- compact headers and dense manager rhythm
- shared `DetailPageHeader`, `DetailPanel`, `LinkedRecordCard`, `ManagerDashboardCard`, `StandardWorkspaceLayout`, `ActionBar`, `WorkflowBar`, and shared status helpers
- Graphite / Copper / white / warm-neutral surfaces
- copper for primary action emphasis, not passive status
- green only for accepted/complete/paid/signed outcomes
- red only for destructive, error, blocked, declined, rejected, or void states
- amber for warning, waiting, prerequisite, or attention states
- neutral graphite/warm gray for draft, metadata, in-progress utility, current, already assigned, advisory, and read-only review states

## Route Classification

Classification is based on repo inspection and the current shared UI pattern docs. Authenticated browser QA must still confirm protected rendering before a route is counted as manually reviewed.

| Surface | Routes | Classification | Notes |
| --- | --- | --- | --- |
| Contractor manager spine | `/dashboard`, `/leads`, `/customers`, `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`, `/people` | matches estimate-led system | Current implementation uses shared manager/workspace rhythm closely enough to remain the baseline. |
| Contractor detail spine | `/leads/[leadId]`, `/customers/[customerId]`, `/projects/[projectId]`, `/estimates/[estimateId]`, `/contracts/[contractId]`, `/invoices/[invoiceId]`, `/jobs/[jobId]` | matches estimate-led system | Detail pages share compact headers, semantic badges, connected-record cards, context rails, and progressive disclosure. Contract/change-order local status helpers were normalized to the shared UI helper in this pass. |
| Estimate Editor | `/estimates/[estimateId]/edit` | matches estimate-led system | Uses `StandardWorkspaceLayout`, compact copper save/action treatment, and shared status helpers. |
| Change orders | `/change-orders`, `/change-orders/[changeOrderId]` | minor visual drift fixed | Local status badge helpers duplicated the shared badge system; replaced with `@floorconnector/ui` helper. |
| Settings | `/settings` plus `/settings/admin`, `/settings/automation`, `/settings/catalogs`, `/settings/financial`, `/settings/modules`, `/settings/operational-intelligence`, `/settings/organization`, `/settings/profile`, `/settings/selected-systems`, `/settings/system-layers`, `/settings/templates`, `/settings/workflows` | matches with minor watch items | Settings use shared settings cards/layout. Keep admin/config panels compact and avoid route-local color systems. |
| Setup | `/setup/company`, `/setup/billing`, `/setup/pending-activation` | matches with minor watch items | Setup remains a real onboarding flow, not a marketing surface. Stripe/setup controls must stay honest and non-mutating unless explicitly scoped. |
| Directory | `/directory` | minor visual drift | Route intentionally reads as an index and already uses warm graphite/copper tones; future polish should reduce remaining hardcoded color literals by folding into shared tokens. |
| Cost Items Database | `/cost-items-database` and subroutes | matches with minor watch items | Uses workspace pattern; keep as operational workspace and avoid a separate module shell. |
| Super-admin home/governance | `/super-admin`, `/super-admin/admin`, `/super-admin/platform`, `/super-admin/modules`, `/super-admin/catalogs`, `/super-admin/templates`, `/super-admin/packages` and package detail routes | matches with minor drift fixed | Super-admin keeps slate/black administrative hierarchy. Generic sky/indigo informational badges in package assignment details were normalized to neutral graphite treatment. |
| Super-admin early access | `/super-admin/early-access` | matches with minor watch items | Must remain founder readiness/activation review, not the durable billing console. |
| Super-admin billing | `/super-admin/billing` | matches estimate-compatible admin system | Billing Operations is a durable operator console. Keep manual evidence, Stripe references, webhook health, and activation separation visually distinct. |
| Super-admin groups | `/super-admin/groups` | minor visual drift fixed | Generic sky/violet review states and blue information panels were normalized to neutral graphite/amber semantics. |
| Portal home/project/review | `/portal`, `/portal/projects/[projectId]`, `/portal/estimates/[estimateId]`, `/portal/contracts/[contractId]`, `/portal/invoices/[invoiceId]`, `/portal/change-orders/[changeOrderId]` | matches with minor watch items | Portal is customer-safe and simpler than contractor pages. Existing portal review components use shared status badges and warm-neutral panels. |
| Portal invite | `/portal/invite` | matches with auth-sensitive QA requirement | Must be reviewed without exposing invite tokens. Do not count unauthenticated redirects as portal review success unless the route intentionally tests invite onboarding. |
| Print/save documents | contractor `/estimates/:id/pdf`, `/contracts/:id/pdf`, `/invoices/:id/pdf`; portal `/portal/estimates/:id/pdf`, `/portal/contracts/:id/pdf`, `/portal/invoices/:id/pdf` | matches | Browser print/save views use canonical records and shared customer document presentation. Keep branded, customer-facing, and non-storage-source-of-truth. |
| Public/auth-adjacent | `/login`, `/signup`, `/forgot-password`, `/update-password`, marketing root | out of scope/deferred | These are adjacent surfaces. They should stay brand-aligned but are not secured app workspace surfaces. |

## Drift Sources Found

- Local status badge helpers in contract and change-order workspaces duplicated the shared status helper.
- Super-admin package/group review surfaces used sky/indigo/violet as generic information colors.
- Some older routes still contain hardcoded warm color literals; most are compatible with Graphite/Copper but should migrate to shared variables opportunistically.
- Portal pages still have some large `rounded-2xl` card treatment. This is acceptable for customer-facing review today, but should not spread into dense contractor manager/admin surfaces.
- Global decorative gradients remain in `globals.css` from the accepted Graphite & Copper shell. Do not add new route-local gradients unless a future visual system doc explicitly approves them.

## Fixes Applied In This Pass

- Replaced local contract and change-order status helpers with `getStatusBadgeClassName` from `@floorconnector/ui`.
- Replaced generic sky/indigo/violet informational styling in super-admin package/group proposal surfaces with neutral graphite/warm-gray treatment or amber when metadata is missing.
- Preserved semantic green/red/amber usage where it represents success, blocked/error, or warning/prerequisite states.

## Remaining Visual Watch List

- Continue migrating hardcoded warm hex colors in Directory and older workspace utilities to shared variables when those files are next touched.
- Consider a later small portal density pass if authenticated customer QA shows cards feeling oversized on mobile.
- Keep setup and billing pages visually calm and honest; do not make Stripe readiness controls look like customer payment success.
- Keep super-admin pages dense and scannable; do not turn platform governance into contractor workflow chrome.

## Authenticated QA Requirement

Protected visual QA is not complete unless each route is loaded with the correct role:

- contractor app routes: contractor auth storage state
- super-admin routes: platform-admin/super-admin auth storage state
- portal routes: portal customer auth storage state plus canonical portal grants

Routes that land on `/login`, access denied, setup gates, or missing-fixture pages must be reported as inaccessible or skipped for that role instead of counted as reviewed.
