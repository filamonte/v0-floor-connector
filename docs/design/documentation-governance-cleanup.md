# Documentation Governance Cleanup

Status: Active
Doc Type: Design / Documentation Checkpoint

## 1. Purpose

This checkpoint records the documentation governance cleanup after the recent
operating-core, portal, financial, document-engine, staging-readiness, and
demo-data planning work.

The cleanup is documentation-only. It does not implement app features, add
schema or migrations, change routes, change server actions, alter auth/RLS,
change tenant logic, affect payments or signatures, change estimate or invoice
math, alter portal grants, change settings or platform-admin logic, update env
vars, call providers, create external resources, deploy, or write data.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/documentation-governance.md`
- `docs/product-language.md`
- `docs/operating-core-validation-checklist.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/staging-owner-runbook.md`
- `docs/local-auth-qa-recovery.md`
- root `README.md`

## 3. Docs Inspected

Inspected active Markdown files under:

- `docs/*.md`
- `docs/design/*.md`
- `docs/demo/*.md`
- `docs/archive/**/*.md`

The pass also checked the archive index and root README to confirm the current
docs map and archive posture.

## 4. Inventory Changes

`docs/README.md` now groups the active docs into navigable sections:

- Start Here
- Implemented Truth And Guardrails
- Product And Workflow Direction
- Operating Core Feature Docs
- Portal And Customer Docs
- Financial And Reporting Docs
- Document, Staging, And Demo Docs
- Validation And QA
- Design System And UX
- AI, Communications, Automation, And Integrations
- Feature Planning Reference
- Governance And Archive

The intent is to keep active docs findable without making every phase note
compete with `docs/current-state.md`.

## 5. README Organization Changes

The previous docs index had grown into a long flat list with duplicated staging
and demo entries. The new index keeps source-of-truth docs near the top, groups
recent phase docs by product area, and labels implementation-history docs as
evidence rather than current truth.

Staging and demo docs are now grouped together so future sessions can find the
operating-core demo path, staging readiness audit, owner runbook, demo data
plan, and seed script spec without confusing them with app implementation.

## 6. Handoff Compression Changes

`docs/chat-handoff.md` was compressed into a current-orientation handoff:

- required first reads
- current operating-core snapshot
- staging/demo status
- guardrails
- QA caveats
- recommended next build options

Long historical phase-by-phase narrative was replaced with pointers to the
durable design, demo, staging, and validation docs.

## 7. Current-State / Roadmap / Product-Language Adjustments

`docs/current-state.md` was reviewed as the implemented-truth anchor. No concise
correction was needed in this pass.

`docs/Roadmap.md` was reviewed for stale "not built" statements after the recent
operating-core and staging work. No surgical roadmap update was needed; it
already frames current operating core, CrewBoard, Project Workspace layers,
Reports, Send Trail, Company Documents, and future-only GateKeeper/AI depth with
the right current/future boundary.

`docs/product-language.md` was updated to include the current approved terms:

- Project Workspace
- Portal Customer Window
- Project Status Window
- Project Timeline
- Shared Documents
- Accounting Export Prep

It also reinforces that portal copy should stay customer-safe and that product
language work does not rename routes, schema, actions, payloads, tests, or
internal models.

## 8. Archived / Superseded Docs

No docs were archived in this pass.

Reason: the recent operating-core, portal, financial, document-engine, staging,
demo, and Company Documents planning docs remain useful as implementation
history, QA evidence, or future planning boundaries. They were reorganized and
indexed rather than moved to archive.

Current archive structure remains:

- `docs/archive/superseded/`
- `docs/archive/exploratory/`
- `docs/archive/historical/`

## 9. Remaining Documentation Follow-Ups

- Continue keeping `docs/chat-handoff.md` compact after major work.
- If a future implementation supersedes one of the phase notes, add a short
  archived/superseded note and move it according to
  `docs/documentation-governance.md`.
- Consider a future pass over older planning docs in the root `docs/` folder to
  decide whether any should move into `docs/archive/exploratory/`.
- Keep staging/demo data work dry-run-first and owner-approved until the future
  seed script is explicitly implemented.
