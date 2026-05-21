# AI Documentation Rules

Status: Stable
Doc Type: AI Guidance

AI tools should read FloorConnector docs as a governed documentation system, not as a loose pile of notes.

## Reading Order

1. `docs/developer-source-of-truth.md`
2. `docs/current-state.md`
3. task-specific architecture/workflow docs
4. `docs/Roadmap.md` and target docs only after current truth is understood

## Interpretation Rules

- If a doc says target, future, planned, or deferred, do not treat it as implemented.
- If a doc says foundation, assume deeper workflow depth is still missing.
- If a route is listed in target IA, verify current implementation before claiming it exists.
- Do not turn target IA into route changes without explicit implementation scope.
- Do not treat diagrams as exhaustive schema, route, or module truth.
- If current-state and another doc conflict, current-state wins.
- If a plan contains old steps, use it as context only unless a current doc says the plan is still active.

## Writing Rules

- Prefer concise linked docs over repeated platform stories.
- Add explicit current/future labels.
- Keep investor/product marketing separate from engineering truth.
- Use ADRs for settled architecture decisions.
- Update diagrams when architecture relationships change.
- Archive or deprecate superseded docs instead of leaving stale active guidance.
