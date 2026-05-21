# Stitch Industrial Contrast Design Summary

Status: Active
Doc Type: Design Reference

## Source Note

The expected Stitch export file, `stitch_floorconnector_enterprise_design_system.zip`, was not present in the workspace during this pass. No source `DESIGN.md` or non-`node_modules` Stitch artifact was found.

This file is therefore a curated summary of the Industrial Contrast / Graphite + Copper direction that FloorConnector is adopting as visual reference. It is not a copied export and does not claim that any Stitch screen is implemented.

## Visual Posture

The approved posture is industrial, high-contrast, premium, and operational. FloorConnector should feel like a serious command center for specialty surface contractors, not a playful construction theme, generic blue SaaS dashboard, or static mockup gallery.

The direction reinforces:

- dense but readable operating surfaces
- strong hierarchy between shell, workspaces, cards, warnings, and actions
- Graphite structure with Copper emphasis
- white or off-white working surfaces for readability
- compact enterprise cards and panels
- visual continuity across dashboard, Manager Pages, Record Workspaces, portal review, settings, and super-admin

## Color Palette Direction

- Graphite and near-black anchor shell chrome, major structure, high-trust headers, and premium operational backgrounds.
- White and off-white remain the primary readable working surfaces.
- Copper and orange are brand accents and primary action emphasis.
- Blue may communicate active, current, or informational state where needed, but it is not the dominant brand replacement for contractor workspaces.
- Green communicates complete, success, paid, signed, or approved.
- Yellow and amber communicate warning, readiness, pending, or attention.
- Red communicates blocked, error, failed, void, declined, rejected, or destructive actions.
- Gray and slate communicate neutral metadata, disabled states, secondary information, and structural support.

## Typography Direction

Typography should stay practical and compact:

- clear page and workspace titles
- strong but not oversized section headings
- tight operational copy for cards, rows, and command surfaces
- readable labels and metadata
- no marketing-scale type inside dense operational panels
- no viewport-scaled typography

## Spacing And Layout Rules

The Stitch direction supports stronger hierarchy without loosening the app into a landing-page feel:

- keep Manager Pages dense and scannable
- keep Record Workspaces review-first and context-aware
- avoid nested cards and decorative shells
- use stable dimensions for repeated controls, stat cards, boards, and action areas
- preserve mobile wrapping and long-record-name resilience
- let dashboards summarize canonical queues rather than becoming separate module worlds

## Component Style Patterns

Approved component inspiration:

- high-contrast command areas
- compact stat cards with clear operational labels
- stronger action zones for the primary next step
- warm-bordered cards and panels
- readable empty states with one clear handoff
- tighter admin/settings forms
- review-first detail sections for estimate, project, contract, invoice, and admin records
- semantic status badges that keep color meaning consistent

Do not use Stitch components as a reason to add new frameworks, fake demo data, static pages, or alternate business models.

## Mobile Patterns

Approved mobile inspiration:

- card-first review flows
- compact bottom-navigation ideas where a future scoped mobile pass proves they fit FloorConnector's app shell
- readable customer/project/record facts before secondary details
- action-first review sections for portal and field-adjacent flows
- safe wrapping for long project, customer, user, and organization names

Mobile inspiration must preserve route protection, tenant isolation, canonical record access, and existing server actions.

## Dashboard And Workspace Patterns

Approved dashboard and workspace ideas:

- darker command-center framing
- clearer separation between operational summary, attention queues, ready-to-move work, and supporting context
- stronger card hierarchy for dashboard summary blocks
- high-contrast areas for primary action and next-best-action cues
- improved empty and blocked states
- project, estimate, and admin detail compositions that make review and handoff easier

Dashboards remain entry and prioritization surfaces over canonical records. They must not become detached products or private module dashboards.

## Key Screen Concepts

The requested Stitch direction references project management, estimate detail, and platform administration concepts. FloorConnector may use those concepts for composition and hierarchy in future passes, with these boundaries:

- Project concepts must reinforce Project Workspace as the readiness and continuity hub.
- Estimate concepts must preserve catalog-first estimate authoring, immutable estimate line-item snapshots, and customer-facing commercial review.
- Administration concepts must keep tenant settings, platform super-admin, billing operations, starter defaults, and activation controls visibly distinct.

Target-only screen concepts are not implemented until [docs/current-state.md](C:/FloorConnector/docs/current-state.md) records an implemented slice.
