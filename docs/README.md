# Docs

Product, engineering, and rollout documentation lives here.

Canonical repository notes:
- GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- primary branch: `main`
- local workspace root: `C:\FloorConnector`
- local web app env source of truth: `C:\FloorConnector\.env.local`

Current foundation priorities to document as the repo grows:
- Google-first authentication with email/password fallback
- package ownership and shared boundaries
- Supabase migration and RLS workflow
- environment setup and operational checks
- modular contractor settings and super-admin boundaries
- platform defaults versus organization-owned copies and overrides
- future Templates & Systems administration for document templates, System Templates, add-ons/options, and sharing/review controls
- future UI, directory/contact, tax, estimate editor, workflow-guidance, and project-address alignment before broader demo/investor polish

Environment notes:
- Local `.env.local` files should use valid localhost URLs including `http://`.
- Vercel environment variables should use the live production domains including `https://`.
- Moving from local to live should be an environment-variable change, not a code change.

Available setup guides:
- `docs/auth-setup.md` for the planned shared auth model, Google-first plus email/password support, redirect URL expectations, and local auth verification routes.

Document roles:
- `docs/documentation-governance.md`: documentation system rules, archival policy, and doc update expectations
- `docs/developer-source-of-truth.md`: short implementation guardrail summary for day-to-day development
- `docs/Architecture.md`: target system design
- `docs/Roadmap.md`: phased implementation plan
- `docs/current-state.md`: source of truth for implemented status
- `docs/workflows.md`: canonical business workflows and near-term workflow direction
- `docs/site-visit-scope-intake-plan.md`: planning guardrails for the lead site visit Scope Intake stage between appointment capture and estimate planning
- `docs/vision.md`: long-term product direction and platform thesis
- `docs/target-ia.md`: target contractor app navigation and workspace structure
- `docs/workflow-spec.md`: primary contractor workflow definition
- `docs/workflow-state-machine.md`: stages, blockers, and transition guidance
- `docs/system-inventory.md`: implemented/foundation/planned system inventory, including current template/catalog foundations and planned Templates & Systems administration
- `docs/ui-data-model-alignment-backlog.md`: planning backlog for contractor UI consistency, module-page patterns, directory/contact direction, estimate editor polish, tax model alignment, workflow guidance, project address display, and later configurable module/dashboard views
- `docs/estimate-builder-build-plan.md`: long-lived Estimate Builder master blueprint
- `docs/estimate-builder-v1-scope.md`: constrained Estimate Builder V1 execution scope
- `docs/estimate-builder-system-generation-spec.md`: planning spec for future system-based estimate generation
- `docs/figma-redesign-brief.md`: exploratory workflow-first design brief for future Figma work
- `docs/archive/README.md`: archive index for historical planning/reference docs
- `docs/opportunity-model.md`: archived pointer to the historical opportunity planning doc
- `docs/opportunity-implementation-plan.md`: archived pointer to the historical opportunity rollout plan

## Documentation Layers

- `docs/current-state.md` -> what is implemented today
- `docs/workflows.md` -> how the implemented and near-term business workflows are intended to operate
- `docs/Roadmap.md` -> what is being built next
- `docs/Architecture.md` -> target system design
- `docs/vision.md` -> where the product is intended to expand over time

Current documentation focus:
- keep implemented truth in `current-state.md`
- keep workflow guidance in `workflows.md`
- keep long-term product direction out of current-state and inside `vision.md`
- keep platform-level defaults and contractor-level administration documented as separate concerns
- move antiquated planning docs into `docs/archive/` instead of deleting them
- use `docs/documentation-governance.md` as the rulebook for future doc cleanup and archival decisions
