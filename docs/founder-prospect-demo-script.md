# Founder Prospect Demo Script

Status: Active
Doc Type: Demo Operations

This guide prepares FloorConnector for controlled demos with one or two trusted founder prospects. It is an operator script and feedback worksheet, not a feature plan, sales automation system, pricing launch, or permission to expand product scope during a demo.

Use this with [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md), [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md), [docs/founder-prospect-feedback.md](C:/FloorConnector/docs/founder-prospect-feedback.md), [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md), [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md), and [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md).

## Controlled First-Demo Operating Mode

Use this mode for the first one or two founder-prospect calls only.

The goal is to learn from trusted contractors without implying public launch, self-serve onboarding, live billing, autonomous AI, or complete workflow depth. The operator should show the proven path, pause when a screen needs context, record friction in the feedback worksheet, and choose the next build slice from observed prospect reactions.

Before scheduling:

- Pick a prospect who matches the qualification rules below and is comfortable with founder access.
- Confirm the demo will be a feedback conversation, not a procurement or production rollout meeting.
- Send no live Checkout, Customer Portal, invoice payment, activation, temporary credential, or invite-token links before the call.
- Prepare a clean browser profile or window with contractor, portal customer, and platform-admin sessions available only if those roles will be shown.
- Keep a private notes document open for [docs/founder-prospect-feedback.md](C:/FloorConnector/docs/founder-prospect-feedback.md).

During the call:

- Start with the contractor's current workflow pain before opening routes.
- Use the 20-minute path unless the prospect has already confirmed strong fit and wants depth.
- Narrate the connected record chain, not every field on every page.
- Use caveats as control points: "this is intentionally gated" rather than "this is missing."
- Stop before any irreversible external action unless the run was explicitly scoped for safe test-mode QA.

After the call:

- Complete the feedback worksheet the same day.
- Tag every blocker as workflow, data, UX, trust, billing, reporting, import/export, or support.
- Choose one recommended next build slice only after reviewing the feedback.
- Do not promise a date, live billing, full migration, custom report, or autonomous AI behavior during the follow-up.

## Guardrails

- Demo only to trusted prospects who understand this is controlled founder access.
- Use real authenticated contractor, portal customer, and platform-admin sessions.
- Do not print credentials, env values, invite tokens, Stripe keys, Checkout URLs, payment details, or private customer data.
- Do not click live Stripe Checkout, customer payment checkout, tenant activation, reset controls, temporary credential generation, or raw invite-link copy actions unless the call is explicitly scoped for that safe test action.
- Do not describe roadmap items as implemented. Say "planned", "controlled", or "future" when a capability is not current branch reality.
- Preserve the canonical lifecycle: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.

## Founder Prospect Qualification

Best-fit first prospects:

- Specialty flooring, epoxy, concrete polishing, coatings, garage floor, commercial flooring, or surface-prep contractors.
- Owner-led or operations-led companies where the decision maker feels the pain of estimating, customer follow-up, scheduling, and billing continuity.
- Small enough to tolerate founder-access constraints, but busy enough that disconnected tools are already costing time.
- Ideally running enough jobs that estimate-to-contract-to-invoice handoff and project visibility matter every week.
- Willing to give candid feedback, sit through follow-up calls, and accept manual activation/billing while the product hardens.

Strong pain signals:

- Estimates, contracts, invoices, and project notes live in separate tools.
- Customers ask for status, copies, or links because the contractor has no clean shared portal.
- Scheduling starts after contract signature but is not clearly tied back to project readiness.
- Office staff re-enter the same job information across proposal, contract, invoice, and field workflow.
- The contractor knows generic CRMs are too broad, while field-service tools miss flooring-specific proposal and project detail.

Disqualifying conditions for the first two demos:

- Needs a fully live billing system, automated activation, or production subscription management immediately.
- Requires deep accounting, inventory, dispatch automation, custom reporting, or data migration before evaluating the core workflow.
- Wants a public self-serve signup today.
- Cannot tolerate early-access caveats or direct founder feedback loops.
- Expects AI to autonomously quote, schedule, invoice, message customers, or change records.

Ideal first conversations should answer:

- Is the connected workflow valuable enough to keep discussing?
- Which module would become their first daily habit?
- What missing workflow blocks a paid founder trial?
- Would they accept controlled founder access with known caveats?

## Founder Readiness Checklist

Complete this before the call:

- First prospect: owner, operations lead, or estimator at a specialty flooring, epoxy, concrete polishing, coatings, garage floor, commercial flooring, or surface-prep contractor.
- Demo environment: local or approved preview app is running; no development-only helper is visible unless the call is explicitly internal.
- Contractor session: real contractor auth works and lands past setup gates.
- Platform-admin session: `/super-admin/billing` and `/super-admin/early-access` load only if operator controls will be shown.
- Portal customer session: `pnpm e2e:portal-fixture`, `pnpm e2e:portal-auth`, and `pnpm e2e:portal` are green or the portal section is explicitly skipped.
- Test data: one linked customer/project/estimate/contract/invoice/job path is known; missing fixture routes are not improvised live.
- Print/save documents: contractor and portal estimate, contract, and invoice print/save routes are known where fixture data exists.
- Billing Operations: `/super-admin/billing` can explain test-mode proof, subscription reference status, webhook health, and manual activation separation without live mutation.
- Routes rehearsed: setup, dashboard, leads, customers, projects, estimates, contracts, invoices, payments, jobs, schedule, people, portal, super-admin billing, and early access.
- Browser/session requirements: use clean tabs, avoid exposing env/config terminals, and keep credentials, invite links, Checkout URLs, Stripe references, payment details, and private customer data out of screen share.
- Do-not-click list: live Stripe Checkout, Stripe Customer Portal, contractor-customer payment checkout, tenant activation, dev reset, temporary portal credentials, raw invite-link copy, signature/payment mutation, and external customer communication sends.
- Fallback talking points: use the caveat section below for live billing, activation, AI, scheduling, print/save documents, reporting, import/export, and support.
- Post-demo notes: complete [docs/founder-prospect-feedback.md](C:/FloorConnector/docs/founder-prospect-feedback.md) before making roadmap or build commitments.

## Opening Positioning

Opening story:

"Most flooring contractors do not have one workflow. They have estimates in one place, signatures somewhere else, invoices and payment links somewhere else, job notes in another tool, and customers asking for updates through text threads. FloorConnector is built to keep that same job connected from the first opportunity through project, estimate, contract, job, invoice, payment, and portal."

Short version:

"FloorConnector is an operating system for specialty flooring contractors. The point is not another generic CRM. It is one connected workflow from opportunity to customer, project, estimate, contract, change order, job, invoice, payment, and customer portal."

Why FloorConnector exists:

"The contractor creates the work once, the customer acts on the same records through the portal, and the team keeps operating from updated truth instead of reconciling PDFs, email threads, payment links, and spreadsheets."

Pain points to name:

- Re-entering the same job scope across estimating, contracts, invoices, and scheduling.
- Losing project state between customer approval, signature, deposit, scheduling, and field execution.
- Sending customer-facing documents that are disconnected from the live operating record.
- Treating portal, payment, and signature tools as side systems that must be manually reconciled.
- Having no clean way to know what should happen next after a prospect says yes.

How it differs from generic contractor tools:

- Flooring-specific estimating and project continuity are the center of gravity.
- Project is the operating hub, not an afterthought.
- Estimates, contracts, invoices, payments, jobs, schedule, and portal access stay connected.
- Customer portal and print/save documents are views of the same canonical records, not copies.
- Early AI and automation are intentionally gated behind human-confirmed workflows.

## 20-Minute Demo Path

1. Opening and fit check, 2 minutes
   - Confirm their company type, current tool stack, and biggest handoff pain.
   - Position this as a controlled founder preview, not a public launch.
   - Use the opening story above, then ask: "Where does the job usually fall apart today?"

2. Setup and activation boundary, 2 minutes
   - Open `/setup/company`, `/setup/billing`, and `/setup/pending-activation`.
   - Explain that setup and SaaS billing are real, but activation remains manual.

3. Operating command center, 2 minutes
   - Open `/dashboard?fresh=true`.
   - Show the app as an operating command center, not a disconnected module list.

4. Sales-to-project chain, 4 minutes
   - Open `/leads`, `/customers`, and `/projects`.
   - Show how opportunity and customer context connects into a project workspace.
   - Reopen one project to anchor the rest of the walkthrough.

5. Proposal and document proof, 4 minutes
   - Open `/estimates` and one Estimate Workspace.
   - Show proposal-first context, status, project/customer connection, and `Print / save PDF`.
   - Mention the Estimate Workspace as the current quality bar for connected record workspaces.
   - Phrase it as: "The estimate is not just a PDF generator; it is the commercial source that the rest of the workflow can trust."

6. Contract, invoice, schedule, and People, 4 minutes
   - Open contract and invoice workspaces tied to the same project where fixture data exists.
   - Show invoice/payment continuity without clicking payment checkout.
   - Open `/schedule` and `/people` to show job handoff and contact-centered portal access.

7. Portal and close, 2 minutes
   - Open `/portal` and one shared project or review route.
   - Ask what felt most useful, what would block use, and what they would want next before paying.
   - Closing ask: "If you were going to try this with one real workflow, where would you start, and what would have to be true before you trusted it?"

## 45-Minute Deeper Walkthrough

1. Discovery, 5 minutes
   - Ask about estimate volume, contract workflow, invoice/payment follow-up, scheduling handoff, current tools, and customer communication pain.

2. Controlled onboarding, 5 minutes
   - Show `/setup/company`, `/setup/billing`, `/setup/pending-activation`, and explain manual activation.
   - Keep live billing out of scope. Test-mode SaaS billing is proven; live launch is a separate release decision.

3. Connected contractor workflow, 15 minutes
   - Walk `/dashboard`, `/leads`, `/customers`, `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, and `/schedule`.
   - Keep returning to Project as the operational hub.
   - Show Manager Pages as queues and Workspaces as focused decision surfaces.

4. Customer trust layer, 8 minutes
   - Show `/people` for contact-centered portal access.
   - Show `/portal`, one portal project, and one estimate/contract/invoice review route.
   - Show print/save routes as customer-facing record views.

5. Operator controls, 5 minutes
   - Show `/super-admin/billing` and `/super-admin/early-access` only as platform/operator context.
   - Explain Billing Operations, test-mode proof, manual activation, and no automatic tenant activation.

6. Feedback and founder fit, 7 minutes
   - Complete the feedback worksheet below.
   - Confirm whether they would consider paid founder access and what must be true first.
   - Close with one concrete follow-up: feedback recap, next call, or founder-access readiness review.

## Prospect-Safe Caveats

Use confident, plain language:

- "Documents are browser print/save views of live records today. Stored PDF versioning is a later document-management layer."
- "SaaS billing is proven end-to-end in test mode. Live billing is intentionally not launched until pricing, support, rollback, and release policy are explicit."
- "Tenant activation stays manual so the founder cohort can be reviewed before external actions are unlocked."
- "Scheduling is good enough to prove job handoff and planning. Dispatch automation, route optimization, and deeper crew calendars are future depth."
- "AI is intentionally not autonomous yet. The product is being built around human-confirmed workflow actions."
- "Reporting is early. The current value is workflow continuity first, deeper analytics second."
- "Integrations will be controlled adapters, not separate sources of truth."
- "Portal access is contact and project scoped. It is not a blanket customer-account login."
- "Imports and exports matter, especially for first use. The first demos are meant to identify which data must move cleanly before a founder tenant relies on the product."
- "If you want in, activation is still manually reviewed. That protects both the founder customer and the product while the first cohort is small."

## Feedback Worksheet

Capture answers after each demo. Use [docs/founder-prospect-feedback.md](C:/FloorConnector/docs/founder-prospect-feedback.md) for the fuller copy/paste worksheet.

```text
Prospect:
Company size:
Primary trade:
Current tools:
Most painful workflow today:

What was clearest?
What was confusing?
Which screen felt most valuable?
Which missing feature blocks real use?
Which workflow would they use first?
Where do they currently lose time or money?
What customer-facing moment would matter most?
Would they pay discounted founder access?
What price range feels fair?
What data import or export do they need?
What competitor or workaround do they use now?
What would make them switch?
What should FloorConnector not try to be?
What would you need exported if you left?
What support response would you expect during founder access?

Founder fit:
- Strong fit / Maybe / Not now

Likely first build slice:
- Project continuity
- Estimate/catalog depth
- Scheduling/dispatch depth
- Portal/customer access polish
- Reporting/export
- Billing/live subscription policy
- Onboarding/data migration
- Other:

Follow-up date:
Next promise made:
```

## Founder Access Operating Checklist

Before inviting:

- Confirm the prospect is a controlled founder candidate, not cold outreach.
- Prepare one clean demo browser/session.
- Confirm contractor auth, portal customer auth, and platform-admin auth work if those routes will be shown.
- Confirm no live Checkout, activation, raw invite link, temporary credential, or customer payment action will be clicked.

If the prospect wants founder access:

1. Create or confirm the company/tenant through the real signup and setup path.
2. Complete `/setup/company` using their real business profile when appropriate.
3. Use `/setup/billing` only inside the approved test-mode or manual founder-billing path.
4. Record manual founder billing evidence in platform-admin surfaces when payment is handled outside the app.
5. Review the tenant in `/super-admin/early-access`.
6. Activate only through the explicit platform-admin action after the operator decides the tenant is ready.
7. Add portal/customer access only for intended contacts and projects.
8. Explain support expectations, known limitations, feedback cadence, and rollback/churn handling.
9. Set a practical data export expectation before any prospect relies on FloorConnector as their system of record.
10. Schedule the first follow-up and record the next build slice candidate.

Founder support expectations:

- Response is founder-led and direct, not public support-center scale.
- Feedback should be specific to real workflows and recorded after each working session.
- Early access can be paused or removed manually if the tenant is not a fit.
- Cancellation/export expectations should stay practical: help the founder leave with their core business records, without promising full migration tooling that does not exist yet.

What not to promise:

- Public self-serve signup.
- Live SaaS billing launch or Stripe Customer Portal access.
- Automated activation after payment.
- Full dispatch optimization, import/export automation, custom reporting, stored PDF management, external e-sign provider depth, or accounting sync.
- Autonomous AI quoting, messaging, scheduling, billing, permission, or customer-facing actions.

Do not:

- Manually create fake `company_subscriptions` or fake paid state.
- Auto-activate a tenant because Checkout completed.
- Mix FloorConnector SaaS billing with contractor-customer invoice payments.
- Tell the prospect a future feature is already production-ready.

## Next Build Slice Rubric

Choose the next slice from observed founder friction, not from abstract roadmap desire.

Prioritize a slice when:

- It blocks a prospect from using the current connected workflow.
- It appears in both the demo conversation and the feedback worksheet.
- It strengthens the canonical lifecycle instead of creating a new module silo.
- It can be built and validated without live billing, activation automation, or broad architecture changes.

Likely next slices:

- Estimate/catalog depth if prospects spend the most time on proposal accuracy, reusable systems, or scope clarity.
- Scheduling/dispatch depth if signed work cannot be operationally managed from the current schedule surface.
- Manager/mobile polish if the product feels useful but too dense for field or owner-operator use.
- Import/export readiness if the demo sells, but first-use setup or exit confidence is the blocker.
- Reporting/dashboard depth if owners cannot evaluate the business without basic operational or financial summaries.
- Live billing readiness controls only after pricing, support, rollback, subscription lifecycle, activation, and entitlement decisions remain explicit and approved.
- Onboarding/marketing polish if the prospect understands the value but the first-run story is too hard to repeat.
