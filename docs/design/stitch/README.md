# Google Stitch Design Artifacts

Status: Active
Doc Type: Design Reference

## Purpose

This folder records how FloorConnector treats the Google Stitch design export for the Industrial Contrast / Graphite + Copper direction.

The Stitch export is design inspiration and design-system input. It is not implementation truth, route truth, workflow truth, or data-model truth.

FloorConnector's implemented truth remains [docs/current-state.md](C:/FloorConnector/docs/current-state.md). Architecture and workflow rules remain governed by:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)

## Artifact Boundary

Stitch HTML, screenshots, generated screen names, and sample content may be used as reference material for future UI work. They must not be copied blindly into production app routes.

Do not:

- replace real data-backed FloorConnector pages with static Stitch screens
- introduce Stitch sample names, demo customers, demo projects, or demo workflows into app code
- create duplicate estimate, contract, invoice, payment, portal, project, schedule, or job models to match a mockup
- use Stitch route or screen concepts as proof that the capability is implemented
- bypass FloorConnector's top-nav-first shell, Manager Page rhythm, Record Workspace grammar, or canonical workflow rules

Do:

- use Stitch as visual acceleration for density, contrast, card hierarchy, dashboard composition, and mobile review patterns
- preserve canonical record handoffs and real loaders/actions during future UI implementation
- update [docs/current-state.md](C:/FloorConnector/docs/current-state.md) only when implementation actually changes

## Current Export Status

No `stitch_floorconnector_enterprise_design_system.zip`, `DESIGN.md`, `industrial_contrast`, `project_management`, `estimate_details`, `platform_administration`, or non-`node_modules` Stitch artifacts were found in this workspace during this adoption pass.

Because the export was not present, [docs/design/stitch/industrial-contrast-DESIGN.md](C:/FloorConnector/docs/design/stitch/industrial-contrast-DESIGN.md) is a curated adoption summary based on the requested Stitch direction and the existing FloorConnector Graphite / Copper UI doctrine, not a copied export file.
