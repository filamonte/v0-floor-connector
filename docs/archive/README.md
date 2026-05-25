# Archive

Status: Active
Doc Type: Historical

This folder preserves older planning and reference documents that are no longer active source-of-truth docs for the current branch.

Archive rules:

- do not delete historical docs just because they are outdated
- move outdated planning/reference docs here when their assumptions no longer match the implemented system
- keep active truth in `docs/current-state.md`
- keep active maturity sequencing in `docs/Roadmap.md`
- keep active workflow guidance in `docs/workflows.md` and `docs/workflow-spec.md`
- update this index whenever docs are moved into or out of the archive
- if an old active path remains as a pointer stub, mark it clearly as archived or deprecated and link to the replacement

Current archived items:

- `superseded/opportunity-model.md`
- `superseded/opportunity-implementation-plan.md`
- `historical/vision.md.old`

Active pointer stubs:

- `../opportunity-model.md` points directly to the archived historical opportunity model and current truth docs
- `../opportunity-implementation-plan.md` points directly to the archived historical rollout plan and current truth docs

Removed redundant archive pointers:

- `opportunity-model.md`
- `opportunity-implementation-plan.md`
- `vision.md.old`

Archive structure:

- `historical/` for old drafts, backups, and historical context
- `superseded/` for older planning or implementation docs replaced by the current system
- `exploratory/` for design or planning material that is useful reference but not active guidance
