# FloorConnector Full Capability Audit

Status: Active
Doc Type: Current Truth / Audit
Date: 2026-05-17

## 1. Executive Summary

FloorConnector is not a prototype. The current repo contains a real Supabase-backed, multi-tenant contractor operating core across the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The strongest implemented areas are auth and tenant bootstrap, contractor shell/navigation, customers/projects, catalog-first estimates, canonical contracts and signing, invoices/payments, portal review/action foundations, jobs/schedule foundations, daily logs/time/workforce foundations, deterministic operational cues, settings, super-admin, and Playwright-backed smoke coverage.

The largest gaps versus Jeff's full vision are depth gaps, not absence of the core: dispatch-grade scheduling, mature materials/inventory/purchasing, contractor-owned websites/growth tooling, broad communications/delivery proof, true automation/rule engine, broad AI assistance, OSHA/HR depth, mobile/offline readiness, richer reporting/analytics, AIA/progress-billing UX depth, and live provider/integration hardening.

Roadmap, target IA, sales-to-production, and vision docs are direction-setting only. This audit treats `docs/current-state.md`, migrations, route files, server utilities, and tests as implementation evidence.

## 2. Current One-Paragraph Product Truth

FloorConnector currently works as an implemented-foundation contractor operating system: a contractor can authenticate into a tenant, manage opportunities, customers, projects, estimates, contracts, change orders, jobs, invoices, payments, people, vendors, time, daily logs, schedule foundations, portal access, customer reviews, signatures, and payment initiation/completion foundations on shared canonical records. It is demo-ready for a controlled founder/investor story around the connected lifecycle, and beta-ready only for carefully bounded contractor workflows with known gaps called out. It is not yet a complete end-to-end production replacement for all contractor operations, field mobility, public acquisition, dispatch, accounting, OSHA/HR, or automation needs.

## 3. Current Readiness Scorecard

| Area | Readiness | Reason |
|---|---|---|
| Controlled founder/investor demo | Demo-ready | Real lifecycle routes, portal, print/save documents, super-admin, and smoke tests exist. |
| Early contractor beta | Conditional beta-ready | Core workflows are real, but depth gaps must be scoped before onboarding. |
| Full contractor OS replacement | Future-only | Dispatch, reporting, materials, accounting, mobile/offline, HR/safety, and automation are not complete. |
| Canonical architecture | Strong | Migrations and libs preserve shared tenant-owned records rather than module copies. |
| Provider/live operations | Conditional | Supabase is core; Stripe foundations exist, but live provider replay and several integrations remain future. |
| Documentation honesty | Mostly good | Current-state is clear; older/planning docs still need careful interpretation. |

## 4. Category-By-Category Audit Table

| # | Category | Status | Evidence from docs and code paths | What works today | Missing or weak | Recommended next step | Risk if ignored | Readiness |
|---|---|---|---|---|---|---|---|---|
| 1 | Auth, signup, login, org bootstrap, tenant membership | Built / usable now | `docs/current-state.md`; `README.md`; `apps/web/app/(auth)/*`; `apps/web/app/auth/callback/route.ts`; `apps/web/lib/auth/*`; `apps/web/lib/organizations/*`; migrations `20260409233000`, `20260410000500`, `20260413011000`, `20260414113000` | Supabase auth, Google OAuth, email/password, protected routes, company setup, membership bootstrap, portal-only redirect separation | Production activation and SaaS billing remain controlled/manual; permission UI depth is still evolving | Keep auth centralized; next improve role/permission UI only when scoped | Tenant leakage, duplicate identity, or accidental portal-to-contractor bootstrap | Contractor-beta-ready |
| 2 | Contractor app shell, navigation, dashboard, manager-page UI system | Built / usable now | `docs/graphite-copper-ui-system.md`; `docs/enterprise-ui-system-audit.md`; `apps/web/components/protected-app-shell.tsx`; `apps/web/components/protected-app-top-nav.tsx`; `apps/web/lib/navigation/navigation-config.ts`; `apps/web/components/dashboard/contractor-dashboard-surface.tsx` | Top-nav shell, global search, notifications, Manager Page rhythm, dashboard command center | Some foundation routes are still thin; utility routes may need seeded visual QA | Continue targeted polish only after product-depth slices | UI drift back into disconnected modules | Demo-ready / beta-ready for core |
| 3 | Universal create and quick-create flows | Built / usable now | `docs/current-state.md`; `docs/developer-source-of-truth.md`; `apps/web/components/universal-create-menu.tsx`; `apps/web/components/*-quick-create-form.tsx`; `apps/web/components/workspace-composer-sheet.tsx` | Shell/dashboard create entry, context-aware creation, full-workspace handoff | Not every foundation route has equal create depth | Preserve canonical create -> record -> workspace pattern | Local draft silos and duplicate workflows | Demo-ready |
| 4 | Leads / opportunities / intake | Built / usable now | `apps/web/app/(app)/leads/*`; `apps/web/app/(app)/opportunities/page.tsx`; `apps/web/lib/opportunities/*`; migration `20260415110000`; contact/intake migration `20260421150000` | Opportunity records, lead manager/detail, follow-up, source/service intake, appointments, measurements/observations/attachments foundations | Pre-sale container depth and contact-first convergence still not complete | Deepen opportunity as pre-sale workspace without early duplicate project/customer behavior | Polluted projects and weak acquisition-to-estimate continuity | Contractor-beta-ready with caveats |
| 5 | Customers and customer relationship records | Built / usable now | `apps/web/app/(app)/customers/*`; `apps/web/lib/customers/*`; `apps/web/lib/contacts/*`; migrations `20260414133000`, `20260421150000`, `20260426223100`, `20260427100000` | Customer accounts, contacts, primary contact normalization, portal access summaries | Contact/directory convergence still incomplete; legacy customer email/phone fields remain compatibility | Continue contact-centered customer cleanup | Portal/access confusion and weak relationship history | Beta-ready with caveats |
| 6 | Projects as operational hub | Built / usable now | `apps/web/app/(app)/projects/*`; `apps/web/lib/projects/*`; `apps/web/components/ready-to-schedule-action-panel.tsx`; migration `20260414143000` | Project workspace, readiness, connected lanes, operational command center, linked record continuity | Full project activity timeline and shared evidence layer are future | Add activity/evidence depth after current hub is stable | Users fall back to module-by-module mental model | Demo-ready / beta-ready |
| 7 | Estimate builder, editor, line items, templates, catalog-backed items | Built / usable now | `apps/web/app/(app)/estimates/*`; `apps/web/components/estimate-builder.tsx`; `apps/web/components/estimates/*`; `apps/web/lib/estimates/*`; `apps/web/lib/catalogs/*`; migrations `20260414153000`, `20260414163000`, `20260423133000`, `20260423190000`, `20260423223000` | Catalog-first estimate editor, line items, groups, save-state, templates, PDF, portal approval, snapshots | Full template/layout authoring and takeoff/source traceability are not complete | Build next estimate/catalog/materials depth slice | Estimate credibility suffers in contractor demos | Demo-ready; beta-ready for bounded use |
| 8 | Flooring-specific estimating support | Partially built / foundation exists | `docs/current-state.md`; `apps/web/lib/catalogs/system-expansion.ts`; `apps/web/lib/estimates/source-assessment.ts`; `apps/web/app/(app)/settings/selected-systems/page.tsx`; migrations `20260505120000`, `20260505140921`, `20260505173600` | Floor system templates, finish products, selected systems, manual measurement-based system generation foundations | No visualizer, no plan/PDF takeoff, no AI capture, no full product/system selection-to-closeout workflow | Build scoped flooring system/template generation and selected-system handoff | Generic estimating feel; weak specialty-flooring differentiation | Demo-ready as foundation; beta caveat |
| 9 | Contract generation, approval, portal signing, countersign | Built / usable now | `apps/web/app/(app)/contracts/*`; `apps/web/app/(portal)/portal/contracts/*`; `apps/web/components/contracts/onsite-signature-modal.tsx`; `apps/web/lib/contracts/*`; migrations `20260414233000`, `20260414234500`, `20260418130000`, `20260423213000` | Contracts, draft edits, internal approval, send/signature workflow, portal sign/decline, onsite signing, countersign foundation, signature events | External e-sign provider workflow not implemented; richer provider lifecycle future | Harden provider adapter and document lifecycle when scoped | Legal/signature process remains app-native only | Demo-ready / bounded beta-ready |
| 10 | Change orders, portal approval, invoice impact | Partially built / foundation exists | `apps/web/app/(app)/change-orders/*`; `apps/web/app/(portal)/portal/change-orders/*`; `apps/web/lib/change-orders/*`; migrations `20260420113000`, `20260425190000`, `20260426120000`; `e2e/portal-change-order-actions.spec.js` | Canonical change orders, portal approve/reject, commercial snapshots, invoice lineage support | Deeper downstream polish and manager maturity remain lighter than estimates/invoices | Make change-order workspace as complete as estimate/invoice | Scope changes may not feel operationally complete | Demo-ready for foundation |
| 11 | Jobs / work orders | Built / usable now | `apps/web/app/(app)/jobs/*`; `apps/web/app/(app)/work-orders/page.tsx`; `apps/web/lib/jobs/*`; migration `20260414173000` | Canonical jobs, job workspace, schedule forms, readiness handoffs, job actions | Work-orders route is mostly an alias/foundation over jobs; deeper work-order document output future | Continue jobs as canonical execution record | Duplicate work-order models could appear | Demo-ready / beta-ready |
| 12 | Scheduling, crew assignment, dispatch, calendar/board state | Partially built / foundation exists | `apps/web/app/(app)/schedule/page.tsx`; `apps/web/app/(app)/calendar/page.tsx`; `apps/web/app/(app)/crew-schedule/page.tsx`; `apps/web/lib/schedule/*`; `apps/web/components/schedule-*`; migration `20260420133000`; `e2e/schedule-ready-handoff.spec.js` | Good-enough schedule command center, ready queue, scheduled timeline, selected job panel, crew assignments on canonical jobs | No dispatch-grade drag/drop, route optimization, conflict/capacity, external calendar sync | Build dispatch-depth slice over jobs/job_assignments | Schedule becomes a weak point for operations | Demo-ready foundation; beta caveat |
| 13 | Daily logs, field notes, execution attachments, field evidence | Partially built / foundation exists | `apps/web/app/(app)/daily-logs/*`; `apps/web/lib/daily-logs/*`; `apps/web/lib/field-notes/*`; `apps/web/lib/execution-attachments/*`; migrations `20260417190000`, `20260417193000`, `20260417200000` | Daily logs, field notes, attachments, job/project context, labor summary linkage | Shared multi-record evidence layer, closeout proof, offline capture future | Mobile-friendly field/evidence workflow slice | Field proof stays fragmented/light | Demo-ready foundation |
| 14 | Time tracking, time cards, workforce labor continuity | Partially built / foundation exists | `apps/web/app/(app)/time/page.tsx`; `apps/web/app/(app)/time-cards/*`; `apps/web/lib/time/*`; migration `20260417180000` | Time punch events, time cards, project/job attribution, current punch state | Payroll/export/review depth, crew sheets, job costing integration future | Add manager review and payroll-safe export path | Labor data remains hard to operationalize | Beta foundation |
| 15 | People, employees, vendors, subcontractors, compliance | Partially built / foundation exists | `apps/web/app/(app)/people/*`; `apps/web/app/(app)/vendors/*`; `apps/web/lib/people/*`; `apps/web/lib/vendors/*`; `apps/web/lib/compliance/*`; migrations `20260417160000`, `20260417170000` | People, vendors, compliance records, portal access console, customer-contact links | Employee HR depth, vendor/subcontractor collaboration, permissions granularity future | Complete People/Directory/access convergence | Identity, staffing, and external collaboration remain shallow | Beta foundation |
| 16 | Invoices, line items, deposits, retainage, tax, status | Built / usable now | `apps/web/app/(app)/invoices/*`; `apps/web/lib/invoices/*`; migrations `20260414183000`, `20260414193000`, `20260414210000`, `20260425190000` | Invoices, line items, roles, balances, deposits, retainage fields, lineage, PDF, portal review | Tax administration is shallow; invoice editor depth and automated billing triggers need maturity | Build tax/admin and invoice-editor depth | Billing credibility and compliance risk | Demo-ready; beta with tax caveat |
| 17 | Payments, portal initiation, provider completion, immutable events | Built / usable now | `apps/web/app/(app)/payments/page.tsx`; `apps/web/app/(portal)/portal/invoices/*`; `apps/web/app/api/payments/stripe/webhook/route.ts`; `apps/web/lib/payments/data.ts`; `apps/web/lib/invoices/actions.ts`; migrations `20260418150000`, `20260418163000`, `20260418173000`; payment E2E specs | Payment records, payment events, portal checkout start, provider-isolated local manual gateway, signed synthetic Stripe webhook reconciliation, idempotency | Refunds, disputes, retries, reconciliation UI, live Stripe replay depth | Harden live/test payment runbook and reconciliation UI | Collection state may be wrong under edge cases | Demo-ready; beta conditional |
| 18 | AIA/progress billing, SOV, retainage maturity | Partially built / foundation exists | `apps/web/app/(app)/progress-billing/*`; `apps/web/lib/progress-billing/*`; `apps/web/lib/financial/sov.ts`; migrations `20260414210000`, `20260420235500`, `20260425173000`, `20260426120000` | SOV tables, progress billing route, retainage fields, invoice lineage | G702/G703 export/draw management/pay-app UX depth future | Build progress billing UX/export slice | Commercial project billing remains incomplete | Demo foundation; future for production depth |
| 19 | Customer portal access and review/payment continuity | Built / usable now | `apps/web/app/(portal)/portal/*`; `apps/web/lib/portal/*`; `apps/web/lib/portal-access/*`; migrations `20260418110000`, `20260418113000`, `20260418120000`, `20260426223100`, `20260427100000`, `20260428143000`, `20260513161137`; portal E2E specs | Portal home/project, explicit grants, project access, estimate/contract/change-order/invoice review, signing/payment actions, invite onboarding | Broader portal comms, customer-admin access management, richer status center future | Continue contact-centered portal hardening | Portal could drift into duplicate customer system | Demo-ready / beta-ready with grants |
| 20 | Communications, notifications, reminders, follow-up engine | Partially built / foundation exists | `apps/web/app/(app)/communications/page.tsx`; `apps/web/lib/communications/*`; `apps/web/lib/notifications/*`; migrations `20260426210000`, `20260426223000`, `20260508000315` | Threads/messages, notifications, deliveries, preferences, safe replies, appointment confirmation/reminder foundations | Broad provider-backed email/SMS, delivery proof, unified inbox, customer messaging depth future | Build record-based communications/delivery-proof slice | Follow-up stays manual and fragmented | Demo foundation |
| 21 | AI/guided workflow, deterministic cues, next-best-action, configurable modes | Partially built / foundation exists | `apps/web/lib/operational-cues/*`; `apps/web/lib/workflow-guidance/*`; `apps/web/lib/cue-states/*`; `apps/web/app/(app)/settings/workflows/page.tsx`; `apps/web/app/(app)/settings/operational-intelligence/page.tsx`; migrations `20260509142241`, `20260510031444`, `20260512000910`, `20260512144657` | Deterministic cues, My Work modes, record Needs Attention, dismiss/snooze, guidance mode settings | Broad AI chat/drafting/autonomous execution not implemented | Keep deterministic first; add AI drafts behind approval later | AI could become disconnected or unsafe | Demo-ready as guidance; AI future-only |
| 22 | Automation settings, rule engine, follow-up/custom situations | Partially built / foundation exists | `apps/web/app/(app)/settings/automation/page.tsx`; `apps/web/lib/automation/*`; migration `20260427113000`; `apps/web/lib/work-items/*` | Automation planning dashboard, manual notification-only execution, automation_runs, work items, cue-to-work-item prefill | No cron/rule builder/custom workflow engine/provider sends | Build limited notification automation with audit trail | Users may expect automation that is not real | Future/beta foundation |
| 23 | Reporting, analytics, dashboards, collections/production/profitability visibility | Partially built / foundation exists | `apps/web/app/(app)/reports/page.tsx`; `apps/web/lib/reports/data.ts`; dashboard and financial routes | Reports entry, Sales Tax Summary/read-only basics, dashboard and financial command surfaces | Broad analytics, report builder, profitability, production dashboards future | Build reporting slice from canonical invoices/jobs/time/catalog | Operator decisions lack visibility | Demo foundation |
| 24 | Materials, reusable catalogs, inventory, purchasing, distributor/manufacturer direction | Partially built / foundation exists | `apps/web/app/(app)/cost-items-database/*`; `apps/web/app/(app)/materials/page.tsx`; `apps/web/app/(app)/purchase-orders/page.tsx`; `apps/web/lib/catalogs/*`; migrations `20260416143000`, `20260423190000`, `20260423223000`, `20260424123000`, `20260424150000`, `20260505120000` | Catalog/cost items, systems, inventory items/transactions, finish products, system templates | Purchasing, reservations, distributor/manufacturer integrations, production material planning incomplete | Build materials/catalog go-live depth | Biggest contractor-OS credibility gap | Demo foundation; beta gap |
| 25 | Room visualizer / product visual selection / pre-lead selection handoff | Planned / documented target only | `docs/vision.md`; `docs/sales-to-production.md`; selected-system migrations reserve future `visualizer_handoff` source | Selected floor-system/spec foundation exists after a record is in tenant context | No visualizer UI, no pre-auth sessions, no handoff/claim flow | Plan visualizer as public-edge to opportunity handoff | Could create disconnected pre-lead truth if rushed | Future-only |
| 26 | Contractor websites, SEO, landing pages, attribution, growth tooling | Planned / documented target only | `docs/vision.md`; `docs/target-ia.md`; `docs/sales-to-production.md`; public homepage and early-access intake in `apps/web/app/page.tsx`/marketing components | Public FloorConnector marketing and early-access request feeding canonical intake | No tenant-owned websites, SEO pages, campaign attribution, contractor growth dashboard | Build public acquisition layer after core beta path | Separate website/CRM silo risk | Future-only |
| 27 | Platform super-admin, early access, tenant activation, module controls, feature policy | Built / usable now | `apps/web/app/(super-admin)/super-admin/*`; `apps/web/lib/platform-admin/*`; migrations `20260416143000`, `20260506223000`, `20260509132622`, `20260509150945`, `20260514225406` | Platform roles, early access, billing operations, starter packs, groups, package governance, module policy foundations | Entitlement enforcement/live package billing not complete | Keep activation separate from billing; add read-only live readiness before mutation | Platform controls can overpromise billing/entitlements | Demo-ready; beta admin foundation |
| 28 | Contractor settings, financial/workflow defaults, templates, module controls | Built / usable now | `apps/web/app/(app)/settings/*`; `apps/web/lib/settings/*`; `apps/web/lib/organizations/*`; `apps/web/lib/templates/*`; migrations `20260414210000`, `20260414223000`, `20260416123000`, `20260416143000`, `20260512144657`, `20260515204452`, `20260515220057` | Organization/admin settings, financial defaults, workflows, templates, catalogs, modules, export/import dry-run | Rich template editor, tax rules, module entitlement enforcement, import writes future | Mature settings around tax/templates/catalogs first | Admin setup blocks real contractor use | Beta-ready with caveats |
| 29 | External integrations: e-sign, payment abstraction, tax, accounting, email/SMS, file/PDF | Partially built / foundation exists | `packages/integrations`; `apps/web/app/api/payments/stripe/webhook/route.ts`; `apps/web/app/api/stripe/*`; `apps/web/lib/communications/*`; print/PDF routes | Supabase, Stripe setup/payment foundations, local manual gateway, Postmark readiness checks, browser print/save PDFs | SignWell/external e-sign, accounting, tax provider, SMS, stored PDF/versioning, calendar integrations future | Build adapters one provider at a time behind internal interfaces | Provider logic could scatter or become source of truth | Demo foundation; production caveat |
| 30 | Mobile/field crew UX and offline readiness | Planned / documented target only | `docs/system-overview.md`; responsive UI docs; current web routes `daily-logs`, `time`, `jobs`, `schedule` | Responsive web polish and field foundations | No dedicated mobile app, offline queue, sync conflict handling, crew-first mobile UX | Build mobile field UX after field workflows stabilize | Field adoption suffers | Future-only |
| 31 | OSHA/safety/incident reporting, OSHA 300/300A direction | Partially built / foundation exists | `docs/system-overview.md`; `docs/workflows.md`; `apps/web/app/(app)/incidents/page.tsx`; `apps/web/app/(app)/safety-meetings/page.tsx`; navigation marks incidents/safety as foundation | Incident/safety routes exist as foundation/planning surfaces | No OSHA 300/300A/301 generation confirmed in code; incident schema depth not proven by migrations | Define canonical incident schema/report exports before claims | Compliance liability and demo overstatement | Future-only/foundation |
| 32 | HR/employee portal/time clock/permissions direction | Partially built / foundation exists | `apps/web/app/(app)/people/*`; `apps/web/app/(app)/time*`; people/time/compliance migrations | People, time punches, time cards, compliance records | Employee portal, PTO, payroll, advanced permissions/HR workflows future | Add HR only through canonical people/time/compliance | HR expectations outrun product | Foundation |
| 33 | UI/UX consistency, Graphite/Copper design system, estimate workspace visual standard | Built / usable now | `docs/graphite-copper-ui-system.md`; `docs/enterprise-ui-system-audit.md`; shared components under `apps/web/components/*`; `apps/web/components/workspace/standard-workspace-layout.tsx` | Locked UI baseline, shared primitives, route audit, estimate-led workspace standard | Some utility routes need opportunistic polish/seeded QA | Use docs as PR checklist; avoid broad redesign | Visual drift weakens trust | Demo-ready |
| 34 | Production readiness: env, Supabase, Vercel, local/dev setup, E2E/Playwright, smoke tests | Partially built / foundation exists | `README.md`; `package.json`; `playwright.config.*`; `e2e/*`; `.env.local` as local truth; Supabase migrations | pnpm scripts, typecheck/lint/build/e2e, auth/portal/payment/super-admin specs, env docs | Staging URL/Vercel project unknown in prior docs; live provider QA gated; Supabase CLI auth may be local-dependent | Keep runbooks current and validate staging separately | False confidence in deployment readiness | Controlled-demo-ready |
| 35 | Other stated ambitions: import/export, document writer, marketplace/network, public edge | Partially built / target-only mix | `apps/web/app/(app)/settings/export/*`; `apps/web/app/(app)/document-writer/page.tsx`; `apps/web/app/(app)/directory/page.tsx`; docs `vision`, `target-ia`, `future-platform-expansion`; migrations `20260515204452`, `20260515220057` | Export-first foundation, import dry-run/review batches, document writer route, directory read surface | Import writes, marketplace/network collaboration, public acquisition edge are future | Keep each ambition attached to canonical lifecycle when built | Expansion could fragment product | Export demo-ready; others future |

## 5. Detailed Category Notes

1. Auth and tenancy are among the most production-shaped parts of the system. The key caveat is not auth existence; it is keeping contractor, portal, and platform-admin authorization boundaries separate as permissions deepen.

2. The protected contractor app has an established shell and Manager Page grammar. The navigation config explicitly distinguishes `live` versus `foundation` modules, which is useful honesty for demo scripts.

3. Universal/Quick-Create is real and should remain narrow: capture minimum required fields, create the canonical record, then route to the full workspace.

4. Opportunity/intake is real, but it still carries one of the most important product-shape risks: pre-sale work must not create noisy operational records too early.

5. Customers are usable, and contacts/portal access have moved in the right direction. The remaining issue is convergence: People/Directory/contact identity should become clearer without replacing canonical customers.

6. Project Workspace is the operational hub now, not merely target language. Its current connected lanes and command-center summaries are derived read models, not a new activity table.

7. Estimate is one of the strongest modules. The current editor is catalog-first and canonical-line-item based, but the full specialty-estimator dream still needs richer system templates, product selection, takeoff, and output controls.

8. Flooring-specific support exists as system/template/finish/selected-system foundations, plus manual measurement generation. It is not yet a visualizer or takeoff product.

9. Contract signing is real on the canonical contract. External e-sign integration should be an adapter, not a separate signed-document model.

10. Change orders exist and portal approvals are covered, but the workspace is less mature than estimates/invoices.

11. Jobs are canonical and schedule-ready. Work-order vocabulary must continue to map onto jobs rather than creating a parallel model.

12. Schedule is good enough for handoffs and early operations. It is not dispatch-grade.

13. Daily logs, field notes, and execution attachments are useful foundations. Shared evidence/document memory remains future.

14. Time tracking has real punch and time-card records. Payroll-grade review, approvals, exports, and costing are not complete.

15. People/vendors/compliance are foundations, not full HR/subcontractor collaboration.

16. Invoices are real and tied to canonical lineage. Tax administration is the major financial weakness.

17. Payments are stronger than a placeholder: canonical payment events and webhook reconciliation tests exist. Refund/dispute/retry/reconciliation depth remains future.

18. AIA/progress billing has SOV foundations. The production-grade pay-app experience is not complete.

19. Portal is a real shared-record surface. It must remain grant-scoped and contact-centered.

20. Communications and notifications exist, but provider-backed delivery proof and unified messaging depth remain future.

21. AI is not broadly implemented. Deterministic operational cues and guidance preferences are the current safe intelligence layer.

22. Automation is mostly planning/manual notification-only. Do not describe it as a general automation engine.

23. Reporting is foundational. Current reports are useful but not a BI/report-builder layer.

24. Materials/catalogs remain a go-live depth gap even though catalog and inventory schema exists. The Estimate Editor now has a small usability improvement for catalog discovery and inline item categorization, but purchasing, reservations, distributor/manufacturer workflows, and production material planning remain future.

25. Visualizer is target-only, with selected-system schema reserved for future handoff.

26. Contractor websites/growth tooling are target-only except FloorConnector's own public marketing/early-access intake.

27. Super-admin is meaningful, but live entitlements and full billing operations are not complete.

28. Contractor settings are broad and useful; the next hardening work should focus on tax, templates, catalogs, and import/export.

29. Integrations are foundation-level except Supabase and Stripe-related payment/SaaS billing slices.

30. Mobile/offline is not implemented as a field product. Current responsive web work is not the same as offline readiness.

31. Safety/OSHA is directional/foundation only. Do not demo OSHA reports as built.

32. HR is people/time/compliance foundation only.

33. Graphite/Copper is the current UI baseline.

34. Production readiness is good for local validation and controlled demos, but staging/live-provider readiness must be verified separately.

35. Import/export is a real additional strength; marketplace/network and broader public edge remain future.

## 6. What Is Truly Built Now

- Supabase auth, organization bootstrap, protected routes, and tenant-scoped access.
- Contractor app shell, dashboard, navigation, global search, notifications, Manager Page rhythm, and Quick-Create foundations.
- Canonical opportunities/leads, customers, contacts, projects, estimates, contracts, change orders, jobs, invoices, payments, people, vendors, time, daily logs, field notes, attachments, portal grants, and portal project access.
- Catalog-first estimate authoring, reusable catalog items, system components, manual measurement/system expansion foundations, estimate line items, estimate save/approval/snapshot behavior, and customer print/save views.
- Canonical contract signing across portal and contractor onsite surfaces, with contract signers and signature events.
- Canonical invoices, line items, payments, payment events, portal checkout initiation, and provider-isolated payment/webhook test coverage.
- Good-enough schedule command center over canonical jobs/job assignments.
- Deterministic operational cue foundation with My Work, Needs Attention panels, dismiss/snooze, and admin rule settings.
- Portal home/project/estimate/contract/change-order/invoice review surfaces over shared canonical records.
- Settings and super-admin foundations, including early access, billing operations, starter packs, package governance, module/settings surfaces, export/import-review foundations.
- Graphite/Copper UI baseline and current route audit docs.

## 7. What Is Partially Built

- Scheduling/dispatch.
- Materials, inventory, catalogs, systems, and purchasing.
- Progress billing/AIA.
- Communications, notifications, reminders, and delivery proof.
- Reporting/analytics.
- People, vendors, subcontractor collaboration, compliance, HR, safety.
- Selected-system/product specification workflow.
- Portal depth beyond review/sign/pay.
- Automation/rule engine.
- Integrations beyond Supabase and payment/SaaS billing foundations.
- Production/staging/live-provider readiness.

## 8. What Is Target-Only

- Contractor-owned websites, tenant-owned domains, SEO/service/location pages, campaign attribution, and growth tooling.
- Room visualizer and public pre-lead product/finish selection handoff.
- AI receptionist, website AI chat, broad AI copilot, autonomous workflow execution, and AI-owned approval queues.
- Dispatch-grade scheduling, route optimization, external calendar sync, conflict/capacity planning.
- Full mobile/offline field app.
- OSHA 300/300A/301 report production.
- Payroll-grade HR/employee portal.
- Marketplace/networked contractor collaboration beyond conceptual direction.
- Live SaaS billing launch, entitlement enforcement, Stripe Customer Portal, dunning/cancellation automation.

## 9. Biggest Gaps Versus Jeff's Full Vision

1. Materials/catalog/systems/inventory are not go-live deep enough.
2. Dispatch-grade schedule, crew/resource planning, and route/capacity logic are not built.
3. Tax administration is too shallow for production financial confidence.
4. Reporting/analytics/profitability visibility is foundational only.
5. Communications/delivery proof is not a full provider-backed messaging layer.
6. Broad AI and automation remain future beyond deterministic cues.
7. Contractor websites/growth/SEO/attribution are target-only.
8. Mobile/offline field crew UX is not implemented.
9. OSHA/safety and HR/payroll depth are not implemented as full modules.
10. External integrations for e-sign, accounting, tax, SMS/email depth, PDFs/document storage are not complete.

## 10. Recommended Build Order For The Next 5 To 10 Codex Prompts

1. Create a narrow materials/catalog go-live plan: catalog items, systems, inventory, labor, taxable behavior, and estimate insertion gaps.
2. Continue materials/catalog depth with the next small slice after the Estimate Editor catalog discovery and inline item categorization pass.
3. Audit and harden tax settings: organization defaults, customer exemption, item taxability, invoice/estimate display, and future jurisdiction boundaries.
4. Improve change-order workspace maturity and invoice impact clarity.
5. Build dispatch-depth plan for `/schedule`: day/week board, crew assignment, reschedule flows, conflict/capacity boundaries.
6. Implement one dispatch-depth slice on canonical jobs/job_assignments only.
7. Build reporting/analytics foundation expansion: collections, production, profitability inputs, and report boundaries.
8. Build communications/delivery-proof plan over canonical threads/messages/notification events.
9. Harden live/staging provider readiness runbook for Stripe payment replay, Postmark, SignWell/e-sign, and Vercel.
10. Create mobile/field UX plan for daily logs, time, photos, safety, and offline constraints.

Recommended next prompt:

```text
Read docs/floorconnector-full-capability-audit.md, docs/current-state.md, docs/workflows.md, docs/inventory-cost-architecture.md, and docs/catalog-to-estimate-invoice-integration-spec.md. Create a docs-first implementation plan for the smallest production-correct materials/catalog depth slice that improves estimate usability without changing the canonical lifecycle, duplicating catalog_items, adding fake inventory, or touching payments/auth/RLS unless explicitly required.
```

## 11. Demo Readiness Notes

Demo-ready:
- Auth/setup/dashboard.
- Opportunity -> customer -> project -> estimate -> contract -> invoice/payment -> job/schedule -> daily log golden path with known fixtures.
- Portal review/sign/pay foundations with valid portal grants.
- Print/save estimate/contract/invoice views.
- Super-admin early-access and billing-operations foundations, framed honestly.
- Operational cues as deterministic guidance.

Demo caveats:
- Do not claim dispatch-grade scheduling.
- Do not claim full AI, automation, OSHA, HR, accounting, tax, mobile/offline, or contractor websites.
- Do not demo foundation routes as production-complete modules.
- Keep live provider/payment/signature claims scoped to what has actually been verified.

## 12. Investor/Customer Readiness Notes

Investor story is strong if framed as: "The connected operating backbone is real; the next funding/product work deepens high-value operating layers around it."

Customer beta story is credible only for bounded contractors who accept current limits around materials depth, reporting, dispatch, tax, integrations, and mobile/offline field workflows.

Do not position FloorConnector today as a full Contractor Foreman replacement. Position it as a connected specialty-flooring operating-system foundation with unusually strong canonical continuity and a clear go-live hardening roadmap.

## 13. Documentation Drift Findings

- `docs/current-state.md`, `docs/platform-maturity.md`, and `docs/module-status.md` are broadly aligned and honest.
- `docs/system-completion-audit.md` is useful but contains older statements that some contact-first/project-timing gaps were structurally incomplete; the repo now has contact/customer-contact, opportunity measurement/attachment/observation, and selected-system foundations. It should be treated as convergence planning, not current proof by itself.
- `docs/target-ia.md`, `docs/sales-to-production.md`, and `docs/vision.md` correctly label themselves as target/planned, but their breadth can easily be overread as implemented capability.
- `README.md` says Stripe billing readiness requires test-mode keys and notes early-access limits; this remains important and should not be softened.
- Navigation includes many `foundation` routes. Demo scripts should avoid implying those routes are complete modules.

Recommended doc correction:
- Add short cross-links from `docs/module-status.md` and `docs/platform-maturity.md` to this audit after review, so future prompts can distinguish built/foundation/target-only areas quickly.

## 14. Exact Validation Commands Run

Commands run:

```bash
pnpm typecheck
pnpm.cmd typecheck
pnpm lint
pnpm.cmd lint
git diff --check
```

Results:

- `pnpm typecheck`: blocked by Windows PowerShell execution policy for `pnpm.ps1`.
- `pnpm.cmd typecheck`: passed. Turbo reported 8 successful tasks.
- `pnpm lint`: blocked by Windows PowerShell execution policy for `pnpm.ps1`.
- `pnpm.cmd lint`: failed on an existing non-docs code issue outside this audit: `packages/integrations/src/payments/gateway.ts` has unused `withMessage` at line 96.
- `git diff --check`: passed, with the expected CRLF warning for `docs/chat-handoff.md`.

`pnpm test` is not configured in the root `package.json`; the repo uses focused package tests through existing scripts and Playwright E2E scripts instead. No E2E run was required for this docs-only audit.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/chat-handoff.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`
- `docs/vision.md`
- `docs/graphite-copper-ui-system.md`
- `docs/module-status.md`
- `docs/platform-maturity.md`
- `docs/system-completion-audit.md`
- `docs/enterprise-ui-system-audit.md`
- `README.md`

## Files And Areas Inspected

- Route inventory under `apps/web/app/(app)`, `apps/web/app/(portal)`, `apps/web/app/(super-admin)`, and `apps/web/app/api`.
- Shared components under `apps/web/components`, especially shell, dashboard, Manager Page, workspace, portal, estimate, schedule, payment, contract, and settings components.
- Server/domain utilities under `apps/web/lib`, especially auth, organizations, opportunities, customers, contacts, projects, estimates, contracts, change orders, jobs, schedule, invoices, payments, portal, portal-access, communications, automation, operational-cues, cue-states, reports, catalogs, selected-systems, time, daily-logs, people, vendors, compliance, platform-admin, and data-export.
- Supabase migrations under `supabase/migrations`, especially canonical lifecycle, portal, payment, signing, catalog, inventory, selected-system, cue, revision, export/import, super-admin, and billing foundations.
- E2E coverage under `e2e`, especially auth, dashboard, detail workspace, portal, payments, schedule handoff, super-admin, and data export specs.
