# Portal And Super-Admin UI Consistency Audit

Status: Phase 12A audit-only review.

Scope:
- customer portal surfaces under `apps/web/app/(portal)/portal`
- platform super-admin surfaces under `apps/web/app/(super-admin)/super-admin`
- shared support components used heavily by those surfaces, including `DetailPanel`, `ProtectedSurfaceHeader`, `SettingsSurfaceLayout`, `SettingsOverviewCard`, `SettingsSectionCard`, and `PlatformTemplateSeedCard`

This audit compares portal and super-admin UI against the stabilized contractor UI system after Phase 11. It does not recommend copying contractor workflows, routes, permissions, loaders, or backend behavior into these surfaces.

No implementation changes are included in this audit.

## Executive Summary

Portal and super-admin are already functionally separated from the contractor app, which is correct. The next UI work should be a small visual consistency pass, not a structural refactor.

Main findings:
- Portal pages use customer-appropriate language and project-centered review flow, but still use large rounded/glassy cards, gradients, and repeated status chips that make review surfaces feel more decorative than the contractor baseline.
- Portal status styling is mostly neutral text/chips rather than the shared semantic status helper language used in contractor pages.
- Portal primary actions are generally clear, but secondary navigation links often use the same pill shape as status chips and can blur action hierarchy.
- Super-admin should not adopt contractor orange CTAs; its black/slate action style is directionally right for platform governance.
- Super-admin still inherits older settings shell chrome with beige/orange borders, eyebrow text, and card backgrounds through shared settings components.
- Super-admin forms are operationally dense and useful, but card radius and panel treatment vary from 8px contractor cards to 24-28px settings cards.

Recommended implementation posture:
- safe now: neutralize old beige/orange shell chrome and align card/list radius/borders in portal and super-admin shared components.
- needs design decision: decide whether portal should keep a softer customer-review visual language or converge closer to contractor density.
- defer: any portal access, super-admin permission, record-loader, workflow, or route changes.

## Audit Findings

### 1. Passive Orange/Beige Usage

Portal:
- Portal surfaces mostly use slate/brand styling, not the old beige/orange contractor chrome.
- Passive `text-brand-700` appears as section eyebrow emphasis in portal home and record pages, for example `Customer Workspace`, `Where you are`, `Signature state`, `Payment state`, and `Scope change`.
- Customer-facing brand emphasis is acceptable, but it should not compete with real decision actions such as approve, sign, or checkout.

Super-admin:
- `SettingsSurfaceLayout`, `SettingsOverviewCard`, and `SettingsSectionCard` still use older warm borders and passive orange eyebrow/link styling:
  - `border-[#d9cdc2]`
  - `text-[#a4581a]`
  - `bg-[#fbf5ee]`
  - warm shadow colors
- This is the clearest safe-now drift from the stabilized contractor component polish.

Recommendation:
- Move super-admin settings shell primitives to neutral slate/white surfaces.
- Keep super-admin primary mutation buttons slate/black, not orange, because platform governance should feel administrative and deliberate rather than contractor-action-oriented.
- Keep portal brand accent for customer action buttons, but reduce passive section-eyebrow accent where it creates repeated visual noise.

### 2. Status Badge Consistency

Portal:
- Portal statuses are rendered as neutral slate chips in project, estimate, contract, invoice, and change-order pages.
- Examples include project status, invoice status, contract status, signer status, and payment actor chips.
- This avoids incorrect green-before-complete issues, but it also makes states like sent, viewed, signed, paid, failed, and void harder to scan.

Super-admin:
- Some super-admin statuses use semantic color manually:
  - feature policy enabled/disabled uses emerald/amber
  - starter default badges use emerald
- Other statuses are plain text or neutral pills, including seed active/inactive, tenant lifecycle, tenant status, and platform admin role context.

Recommendation:
- Use shared semantic status helpers where practical for true statuses, especially portal commercial states and super-admin enabled/disabled/active/inactive/lifecycle states.
- Keep non-status metadata such as seed keys, item types, project names, and actor labels neutral.
- Portal should be conservative with success styling: green only for truly completed states such as signed, paid, approved, or completed payment.

### 3. CTA Hierarchy

Portal:
- Primary customer actions are clear on focused record pages:
  - approve estimate
  - sign contract
  - approve change order
  - continue to checkout
- Destructive or negative decisions use rose-outline treatment, which is appropriate.
- Secondary navigation actions such as `Return to project workspace`, `Review record`, and `Back to project workspace` use rounded pill treatment similar to status chips. This is friendly but can blur link-vs-status hierarchy.

Super-admin:
- Primary save/admin actions use slate/black filled buttons, which fits platform-level administration.
- Secondary saves use outlined slate buttons. This hierarchy is appropriate and should not be replaced with contractor orange.

Recommendation:
- Portal should keep one clear filled customer CTA in each action panel and use quieter rectangular/neutral links for return/open actions.
- Super-admin should keep slate/black for primary saves and neutral outlines for secondary controls.

### 4. Card/Header/List Consistency

Portal:
- Portal pages use `DetailPanel`, `DetailPageHeader`, `WorkspaceSummaryBand`, and local record cards.
- The structure is coherent, but the visual shell still leans toward large hero-card treatment:
  - `rounded-3xl`
  - `rounded-[1.85rem]`
  - glassy `bg-white/90`
  - large shadows
  - gradient panel backgrounds
- This is reasonable for a customer review experience, but the repeated heavy containers can make the portal feel more marketing-like than task-first.

Super-admin:
- Super-admin combines settings primitives and `DetailPanel`.
- Card radius ranges from no radius to `rounded-2xl`, `rounded-[1.5rem]`, and `rounded-[1.75rem]`.
- Dense forms are useful, but the surrounding card system is visually inconsistent with the contractor Phase 11 primitives.

Recommendation:
- Portal: reduce repeated giant shells, glass effects, and gradient cards before changing page structure.
- Super-admin: align settings shell cards and list rows to neutral borders, white/slate surfaces, and smaller radii.
- Do not force portal pages into contractor Manager Page density; customer review needs more space and reassurance.

### 5. Overly Noisy Or Duplicate Visual Emphasis

Portal:
- Portal record pages often show the same status in the header action chip, state panel chips, summary band, context facts, and list card badges.
- Portal project detail repeats shared workflow state in both the `Current project state` card and `WorkspaceSummaryBand`.
- Portal home repeats accessible project count, project needing attention, project list statuses, and invoice progress summaries.

Super-admin:
- Super-admin has less duplicate status emphasis, but repeated rounded cards inside rounded settings panels can make dense admin forms feel heavier than necessary.

Recommendation:
- Portal: keep one leading customer-facing next-action/state summary, then make later status appearances compact and semantic.
- Super-admin: reduce nested-card weight in long forms, but preserve grouping because platform defaults and tenant oversight require careful scanning.

### 6. Contractor Patterns That Should Not Be Copied Directly

Do not copy these contractor patterns directly into portal:
- dense Manager Page command bars
- contractor black/orange operational shell framing
- universal create or Quick-Create patterns
- project-readiness/internal workflow state meant for contractor teams
- broad record queues that expose contractor-only operational context

Portal users need:
- project-scoped access clarity
- review-first estimate/contract/invoice content
- clear approve/sign/pay/decline actions when eligible
- softer customer-safe language
- no contractor-only scheduling, readiness, crew, or internal financial controls

Do not copy these contractor patterns directly into super-admin:
- orange primary CTAs
- contractor operational next-action framing
- project/workflow bars
- customer/project/job execution hierarchy

Super-admin users need:
- platform governance clarity
- tenant/default separation
- safe mutation hierarchy
- auditability and permission boundaries
- dense configuration forms where appropriate

## Recommended Implementation Phases

### Safe Now

1. Neutralize super-admin settings shell primitives.
   - Files likely involved: `SettingsSurfaceLayout`, `SettingsOverviewCard`, `SettingsSectionCard`.
   - Replace passive beige/orange shell chrome with slate/white system surfaces.
   - Keep primary admin save buttons slate/black.

2. Normalize portal and super-admin card radius/border language.
   - Reduce repeated `rounded-3xl`, `rounded-[1.85rem]`, and heavy shadow usage where it is purely decorative.
   - Prefer calmer `rounded-lg` or `rounded-2xl` depending on whether the surface is dense admin or customer review.

3. Use shared status helper styling where practical.
   - Portal statuses: estimate, contract, invoice, change order, payment event, signer.
   - Super-admin statuses: enabled/disabled, active/inactive, default, tenant lifecycle.
   - Leave metadata chips neutral.

4. Quiet secondary portal links.
   - Keep approve/sign/pay as the obvious filled primary actions.
   - Make return/open/review links clearly secondary and visually different from status chips.

### Needs Design Decision

1. Portal visual language.
   - Decide whether the portal should remain softer and more spacious than contractor pages or move closer to the contractor card density.
   - Recommendation: keep it softer, but reduce decorative gradients/shadows.

2. Portal semantic color policy.
   - Decide whether `approved` on estimates and change orders should show green immediately, while `sent/viewed/waiting` stays warning/neutral.
   - Recommendation: green only for completed customer decisions or fully paid/signed states.

3. Super-admin layout standard.
   - Decide whether super-admin should stay on settings-oriented navigation or receive a distinct platform-admin shell.
   - Recommendation: keep settings-oriented navigation for now; polish the existing shell first.

### Defer

1. Any portal access, invite, or RLS behavior changes.
2. Any portal customer-sign, estimate-approval, change-order-approval, or payment workflow changes.
3. Any super-admin permission, platform-role, tenant lifecycle, module-policy, or data-loader changes.
4. Any route changes for portal or super-admin.
5. Any attempt to introduce contractor ActionBar/WorkflowBar across portal or super-admin before a design decision.

## Suggested Next Phase

Phase 12B should be a small UI-only polish pass:
- super-admin shared settings primitives first
- portal shared review primitives second
- status helper adoption where it is purely presentational
- no auth, loader, route, schema, backend, RLS, permission, or workflow changes

