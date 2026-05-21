# Google Stitch UI Adoption - Phase 9 Settings Super Admin and Platform Control Visual Alignment

## 1. Docs read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/stitch/README.md`
- `docs/design/stitch/industrial-contrast-DESIGN.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/design/stitch/phase-2-token-dashboard-audit.md`
- `docs/design/stitch/phase-3-dashboard-refresh.md`
- `docs/design/stitch/phase-4-project-workspace-visual-maturity.md`
- `docs/design/stitch/phase-5-commercial-detail-visual-maturity.md`
- `docs/design/stitch/phase-6-manager-pages-global-queue-visual-alignment.md`
- `docs/design/stitch/phase-7-field-schedule-execution-visual-alignment.md`
- `docs/design/stitch/phase-8-portal-customer-facing-visual-alignment.md`

## 2. Files inspected

- `apps/web/app/(app)/settings/layout.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/app/(app)/settings/admin/page.tsx`
- `apps/web/app/(app)/settings/automation/page.tsx`
- `apps/web/app/(app)/settings/catalogs/page.tsx`
- `apps/web/app/(app)/settings/export/page.tsx`
- `apps/web/app/(app)/settings/financial/page.tsx`
- `apps/web/app/(app)/settings/modules/page.tsx`
- `apps/web/app/(app)/settings/operational-intelligence/page.tsx`
- `apps/web/app/(app)/settings/organization/page.tsx`
- `apps/web/app/(app)/settings/profile/page.tsx`
- `apps/web/app/(app)/settings/selected-systems/page.tsx`
- `apps/web/app/(app)/settings/system-layers/page.tsx`
- `apps/web/app/(app)/settings/templates/page.tsx`
- `apps/web/app/(app)/settings/workflows/page.tsx`
- `apps/web/app/(super-admin)/super-admin/layout.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/billing/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/app/(super-admin)/super-admin/groups/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`
- `apps/web/app/(super-admin)/super-admin/operations/page.tsx`
- `apps/web/app/(super-admin)/super-admin/packages/page.tsx`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/settings-overview-card.tsx`
- `apps/web/components/settings-nav.tsx`
- `apps/web/components/settings-feedback.tsx`
- `apps/web/components/feature-policy-card.tsx`
- `apps/web/components/super-admin-console.tsx`
- `apps/web/components/save-feedback/save-state-form.tsx`
- `apps/web/lib/settings/*`
- `apps/web/lib/organizations/*`
- `apps/web/lib/platform-admin/*`
- `apps/web/lib/templates/*`
- `apps/web/lib/catalogs/*`

## 3. Settings/super-admin/platform-control surfaces reviewed

- Contractor settings shell and overview.
- Contractor organization profile, financial, workflow, module, template, catalog, system-layer, selected-system, export/import, operational-intelligence, automation, admin/member, and profile settings routes.
- Super-admin shell and overview.
- Platform defaults, starter templates, starter catalogs, module policy, packages, billing operations, groups, operations, early access, and platform admin routes.
- Shared settings card, section, navigation, feedback, feature-policy, save-state, and super-admin console primitives.

## 4. Shared admin/settings primitives found or missing

Existing shared primitives were strong enough for a bounded implementation pass:

- `SettingsSurfaceLayout` owns the settings/super-admin command shell, scope framing, nav column, and content region.
- `SettingsSectionCard` owns major configuration section framing.
- `SettingsOverviewCard` owns overview/landing-page entry cards for contractor settings and super-admin.
- `FeaturePolicyCard` owns module-control card treatment for contractor feature overrides.
- `super-admin-console.tsx` owns platform tabs, legends, future capability panels, configuration inheritance badges, timelines, and resolution cards.

No new broad admin design system was added. The pass refined existing primitives and used small local constants in the settings overview page for repeated metric/inset/link treatments.

## 5. Visual changes made

- `SettingsSurfaceLayout` now renders a Graphite/Copper command header with an explicit scope label for contractor organization settings or platform control scope.
- Contractor settings and super-admin metadata cards now sit inside the command header with white-on-Graphite admin context treatment.
- `SettingsSectionCard` now uses a controlled card shell, Graphite/Copper or neutral top rule, and clearer internal spacing.
- `SettingsOverviewCard` now uses a consistent 8px card shell, top rule, and stronger action hierarchy.
- `FeaturePolicyCard` now uses the shared admin card shell and wraps its existing form in a calm highlighted configuration panel.
- `super-admin-console` tabs, legends, future capability panels, inheritance timeline, and configuration cards now use calmer platform-control surfaces.
- Contractor Settings overview now replaces older hardcoded warm summary boxes with shared admin metric/inset/link classes that reinforce organization-owned configuration rather than operational queue behavior.
- Super Admin retains its neutral platform-control distinction while inheriting the stronger shared settings shell and platform console primitives.

## 6. Configuration/role/module/default behavior explicitly untouched

This pass did not change:

- Settings or super-admin route structure.
- Settings loaders or super-admin loaders.
- Server actions.
- Organization admin role checks.
- Platform admin role checks.
- Feature policy or module override behavior.
- Platform default behavior.
- Organization-owned settings behavior.
- Template adoption, edit, archive, or default behavior.
- Catalog adoption, edit, archive, or default behavior.
- Financial defaults behavior.
- Workflow defaults behavior.
- Member or role management behavior.
- Schema, migrations, RLS, Supabase logic, auth, tenant scoping, route protection, or canonical workflow relationships.

## 7. Admin/control surfaces still needing follow-up

- Deep settings forms can receive a future form-density pass during Phase 10 if visual QA finds spacing or wrapping issues.
- Super-admin package detail and billing support review detail pages are dense and should be visually QA'd before any deeper composition work.
- Template/catalog seed editors should remain behavior-first; any future polish should preserve platform-default versus contractor-owned-copy language.
- Settings and super-admin screenshots should be included in the Phase 10 visual QA sweep to catch overflow, contrast, and copy hierarchy regressions.

## 8. Recommended next prompt title

`Google Stitch UI Adoption - Phase 10 Visual QA Sweep and Consolidation`
