# Project Workspace OS Consolidation QA

## Purpose

This pass consolidates the Project Workspace after the recent operational layers:
CrewBoard, FieldTrail, MessageCenter, ProjectPulse, GateKeeper / Ready Check,
Next Move, Payment Trail, Signature Trail, and commercial continuity.

The goal is coherence and QA, not new capability. Project Workspace should read
as one operating hub, with ProjectPulse as the top-level health summary and the
other sections as supporting workspaces.

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
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/graphite-copper-ui-system.md`

## Files Inspected

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/lib/projectpulse/summary.ts`
- `apps/web/lib/fieldtrail/summary.ts`
- `apps/web/lib/messagecenter/summary.ts`
- `apps/web/lib/schedule/warnings.ts`
- `apps/web/components/field-execution-command-band.tsx`
- project readiness, cue, FieldTrail, MessageCenter, and ProjectPulse tests

## Project Workspace Structure Reviewed

The page keeps one record identity and one global chrome. The reviewed flow is:

- project identity / page header
- workflow and project state context
- operational command summary
- ProjectPulse health summary
- supporting guidance, connected record lanes, and recency
- readiness action panel where applicable
- workflow sections
- FieldTrail and MessageCenter inside execution context
- Financial Hub and supporting sidebar continuity

## Issues Found

- ProjectPulse had become the intended top-level summary, but the page still had
  multiple generic "Next Move" labels in supporting sections.
- FieldTrail and MessageCenter actions were useful, but their labels could read
  as competing with the high-level ProjectPulse Next Move.
- ProjectPulse helper copy repeated the product name in body text where plain
  health language was clearer.

## Cleanup Changes Made

- ProjectPulse panel title now reads "Project health summary."
- ProjectPulse keeps the explicit high-level "Next Move" label above its primary
  action.
- The older operational command area now labels its action context as
  "Workflow step" instead of another "Next move."
- FieldTrail action and metric copy now read "Field Next Move."
- MessageCenter action and metric copy now read "Communication Next Move."
- ProjectPulse neutral/attention copy was shortened to reduce branded-term
  repetition.

## Next Move Terminology Decisions

ProjectPulse owns the high-level project Next Move. FieldTrail and MessageCenter
keep section-specific action language because they point to narrower execution
or communication follow-through.

## Behavior Preserved

This pass did not change data loading, mutations, routes, schema, migrations,
server actions, auth, tenant isolation, readiness enforcement, payment behavior,
signature behavior, estimate math, invoice math, portal grants, settings, or
platform-admin behavior.

## Remaining Follow-Up Candidates

- Consider a future component extraction if ProjectPulse, FieldTrail, and
  MessageCenter need to appear on additional record surfaces.
- Revisit the older operational command summary only after ProjectPulse has more
  usage time; avoid removing useful links prematurely.
- Add stable browser coverage later if the Project Workspace settles around this
  structure.
