# Estimate Builder V1 Scope

Status:
- Phase 1 execution slice for [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md)
- documentation only
- intentionally constrained implementation scope

If this V1 scope conflicts with the master build plan, this V1 scope controls what should be built now. The master build plan controls long-term direction.

## V1 Included

V1 includes:
- basic catalog/cost item support using the existing reusable catalog foundation where possible
- manual add from catalog
- quantity entry
- total calculation
- price override
- price snapshot on estimate line creation
- simple System Templates
- Quick Build from:
  - length + width
  - direct area
  - direct linear footage
  - counts where applicable
- formulas:
  - `area = length x width`
  - `perimeter = (length x 2) + (width x 2)`
- grouped generated estimate lines
- workflow continuity into contract, job, invoice, and payment

## V1 Excluded

V1 excludes:
- AI takeoff
- PDF or plan takeoff
- image or photo capture
- system sharing or promotion
- advanced template versioning
- multi-room detailed builder
- irregular geometry
- materials planning
- reporting or margin dashboards
- advanced permissions UI

## V1 Done Means

V1 is done when:
- a contractor can generate an estimate from a System Template with simple measurements
- a contractor can add catalog items manually
- a contractor can override price
- customer-facing output hides internal cost and markup
- the estimate continues through the existing FloorConnector workflow

V1 must not implement future-phase behavior unless explicitly requested.
