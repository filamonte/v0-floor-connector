# Project Workspace Lifecycle QA

## Purpose

This pass reviews the full Project Workspace operating loop after the CrewBoard, FieldTrail, MessageCenter, ProjectPulse, and CloseoutTrail slices. The goal is stabilization: keep the page readable as one operating hub, preserve one clear Next Move hierarchy, and avoid adding another named product layer.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/projectpulse-phase-1-project-health-summary.md`
- `docs/design/project-workspace-os-consolidation-qa.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/graphite-copper-ui-system.md`

## Files Inspected

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/lib/projectpulse/summary.ts`
- `apps/web/lib/fieldtrail/summary.ts`
- `apps/web/lib/messagecenter/summary.ts`
- `apps/web/lib/closeouttrail/summary.ts`
- `apps/web/lib/schedule/warnings.ts`
- Focused summary tests for ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, and schedule warnings
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`

## Lifecycle Layers Reviewed

- ProjectPulse remains the high-level health and Next Move summary near the top of the Project Workspace.
- CrewBoard remains the schedule and dispatch surface reached through existing schedule links.
- FieldTrail remains the supporting field execution and evidence section.
- MessageCenter remains the supporting communication and send/sign/pay timeline.
- CloseoutTrail remains the closeout readiness and proof section after execution history and before the Financial Hub.

## Issues Found

- The hierarchy was fundamentally correct, but the page had too many adjacent summary/helper blocks after ProjectPulse.
- ProjectPulse, FieldTrail, MessageCenter, and CloseoutTrail already used distinct Next Move labels, but supporting copy could better explain that ProjectPulse owns the top-level decision.
- CloseoutTrail proof counts repeated daily-log and evidence totals as separate tiles, increasing density without adding much scan value.
- One project-page empty state used an internal-facing "canonical" term where contractor-facing copy was enough.

## Cleanup Changes Made

- ProjectPulse and CloseoutTrail lead helper lists now show the two strongest items instead of four.
- CloseoutTrail combines daily-log and evidence counts into one compact Field proof tile.
- The post-ProjectPulse supporting summary is labeled "Workflow snapshot" and explicitly stays secondary to the ProjectPulse Next Move.
- The project attention-panel description now uses contractor-facing follow-up language instead of implementation language.
- A change-order empty state now says "connected change order" instead of "canonical change order."

## Next Move Hierarchy Decision

ProjectPulse owns the top-level project Next Move.

Section-level actions stay scoped:

- FieldTrail uses Field Next Move.
- MessageCenter uses Communication Next Move.
- CloseoutTrail uses Closeout Next Move.

Those section-level actions may point to the same route family as ProjectPulse, but they should read as supporting review paths rather than competing project-level instructions.

## Behavior Preserved

This pass did not add schema, migrations, routes, server actions, data models, automation, AI, notifications, provider integrations, auth changes, RLS changes, tenant-boundary changes, payment behavior, signature behavior, estimate math, invoice math, job readiness gate changes, portal grants, settings behavior, platform-admin behavior, or fake data.

## Remaining Follow-Up Candidates

- Browser QA should keep checking the Project Workspace at desktop and mobile-ish widths as the hub grows.
- A future component extraction may be useful if ProjectPulse, FieldTrail, MessageCenter, and CloseoutTrail continue sharing header and summary-list patterns.
- Documents / Files / Proof Center is a stronger next product slice than another named project panel, because CloseoutTrail will need retrievable proof packages later.
