# Public Demo Readiness QA

Status: Active
Doc Type: QA

## Purpose

This checkpoint records the public/demo-readiness QA pass after Marketing Demo
Refresh Phase 1. The goal was to confirm that the public homepage, auth entry
routes, setup handoff copy, demo docs, and public claims agree with the
implemented operating core without adding product behavior.

This pass did not add schema, migrations, routes, server actions, auth/RLS
changes, tenant logic, payment/signature behavior, estimate math, invoice math,
portal grants, settings behavior, platform-admin behavior, provider behavior,
AI, automation, notifications, or fake production data.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/system-overview.md`
- `docs/workflows.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/design/marketing-demo-refresh-phase-1.md`
- `docs/design/operating-core-demo-smoke-checkpoint.md`
- `docs/operating-core-validation-checklist.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/graphite-copper-ui-system.md`

## Files Inspected

- `apps/web/app/page.tsx`
- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/app/(marketing)/layout.tsx`
- `apps/web/app/(auth)/layout.tsx`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/signup/page.tsx`
- `apps/web/components/auth-shell.tsx`
- `apps/web/components/auth-login-page.tsx`
- `apps/web/components/auth-signup-page.tsx`
- `apps/web/components/early-access-request-form.tsx`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `e2e/marketing-login.spec.js`
- `docs/README.md`
- `docs/chat-handoff.md`

## Public Routes Checked

- `/`
- `/login`
- `/signup`
- `/signup?next=/setup/company`
- `/setup/company`
- `/setup/billing`
- `/setup/pending-activation`

The setup routes are protected app routes. Browser QA should record redirects
to `/login` as expected when no contractor session is present; this pass did
not change auth or setup route protection. In the public smoke, anonymous setup
route requests redirected to `/login` with an existing safe return target
rather than loading setup content.

## Claims Verified

- Homepage positions FloorConnector as connected operating software for
  specialty surface contractors.
- Homepage describes the operating core around Project Workspace, CrewBoard,
  FieldTrail, MessageCenter, CloseoutTrail, Proof Center, Send Trail, Document
  Engine, Portal Customer Window, Financial Control, Accounting Readiness, and
  Service Center.
- Current claims match `docs/current-state.md` and
  `docs/demo/operating-core-demo-path.md`: the demo story is route-based,
  source-record-backed, and centered on existing canonical records.
- Coming-later claims are labeled in the homepage `Coming later` section.
- Public copy keeps the operating-core story distinct from target-only AI,
  dispatch, accounting, stored-document, mobile/offline, and integration depth.

## Claims Revised Or Avoided

- Removed public signup footer links to `/terms` and `/privacy` because those
  routes are not implemented in the current app.
- Replaced login footer "Create one for free" with early-access language so it
  does not imply an open self-serve free plan.
- Reworded auth shell copy to avoid internal architecture terms such as
  "shared identity layer."
- Reworded visible setup cancellation/status copy from tenant language to
  workspace language where the user-facing meaning is account readiness.

The homepage continues to avoid claims for drag/drop dispatch, accounting sync,
stored PDFs, full document management, AI summaries or autonomous AI, customer
service requests, customer-facing FieldTrail, external integrations, and
offline/native mobile app depth.

## CTAs Checked

- Homepage early-access CTAs point to `/signup?next=%2Fsetup%2Fcompany`.
- Homepage login links point to `/login`.
- In-page marketing navigation points to existing homepage anchors:
  `#platform`, `#core`, `#demo`, and `#later`.
- Auth login and signup pages preserve the existing safe `next` redirect
  handling.
- Setup handoff links preserve existing routes and behavior.

## Issues Fixed

- Removed broken public auth links to missing legal pages.
- Aligned login/signup wording with founder early-access activation reality.
- Reduced visible internal setup terminology on protected setup surfaces.
- Refreshed the public marketing/auth smoke test so it checks current CTA copy,
  auth route rendering, setup-route anonymous redirects, and mobile homepage
  overflow.

## Behavior Preserved

- No route structure changed.
- No auth, redirect, or protected-route behavior changed.
- No setup, billing, Stripe, payment, subscription, or activation behavior
  changed.
- No schema, migrations, RLS, tenant checks, server actions, provider adapters,
  portal grants, settings, platform-admin logic, AI, automation, notifications,
  estimate math, invoice math, or signature behavior changed.

## Follow-Up Candidates

- Add real `/terms` and `/privacy` pages only when legal copy is approved.
- Refresh public screenshots after the target deployment environment is
  available and public route QA is repeated there.
- Consider a narrow auth-page visual/copy pass if founder early-access
  onboarding becomes the next public sales handoff surface.
- Keep demo route checks using real records and saved auth state; do not add
  demo-only public data or mock protected workflows.
