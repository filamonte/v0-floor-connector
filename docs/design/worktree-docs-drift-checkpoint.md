# Worktree Docs Drift Checkpoint

Status: Active
Doc Type: Repository Hygiene Checkpoint

## 1. Purpose

This checkpoint records the dirty worktree after recent CrewBoard, Agentic
Operations, and staging demo seed work. It classifies the current unstaged and
untracked files so the next pass can commit coherent slices without mixing
unrelated documentation and tooling changes.

This pass does not discard changes, delete files, implement product features,
change schema, change migrations, change routes, change server actions, change
auth/RLS, change tenant logic, change payments, change signatures, change
portal grants, change settings, change platform-admin behavior, change env
vars, call providers, or deploy.

## 2. Dirty Files Found

Starting branch state:

```text
main...origin/main
```

`git push origin main` returned:

```text
Everything up-to-date
```

Dirty files found:

| File                                                                  | Status    | Likely Topic                                                     | Related To Recent Committed Work?                 | Safe To Commit Now?                      | Recommended Action                                                                                  |
| --------------------------------------------------------------------- | --------- | ---------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `docs/agentic-operations-layer.md`                                    | untracked | Agentic Operations umbrella strategy                             | Related to recent AI docs pass, not yet committed | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs after final docs validation                       |
| `docs/README.md`                                                      | modified  | Mixed: staging seed index plus AI docs ownership index           | Mixed overlap from Agentic and staging seed work  | Not as one blind file                    | Category B: split or commit in a deliberately mixed docs checkpoint only after review               |
| `docs/chat-handoff.md`                                                | modified  | Mixed: staging seed Phase 2A status plus Agentic guardrail       | Mixed overlap from Agentic and staging seed work  | Not as one blind file                    | Category B: split or commit in a deliberately mixed docs checkpoint only after review               |
| `docs/Roadmap.md`                                                     | modified  | Agentic Operations later-stage roadmap direction                 | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/ai-assisted-operating-system.md`                                | modified  | AI doc ownership note                                            | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/ai-contractor-workflows.md`                                     | modified  | AI workflow ownership note                                       | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/ai-guided-system-plan.md`                                       | modified  | deterministic guidance vs agentic umbrella ownership             | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/ai/intelligent-follow-up-engine.md`                             | modified  | deterministic follow-up ownership and formatting                 | Related to AI docs ownership pass                 | Likely yes after review                  | Category A/B: commit with AI/agentic ownership docs if formatting-only table changes are acceptable |
| `docs/automation-layer.md`                                            | modified  | deterministic automation vs agentic AI boundary                  | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/communications-layer.md`                                        | modified  | canonical communication substrate for future AI                  | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/current-state.md`                                               | modified  | not-implemented agentic AI note                                  | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/developer-source-of-truth.md`                                   | modified  | compact AI/agentic guardrails                                    | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/gatekeeper-system-vision.md`                                    | modified  | GateKeeper scope vs agentic umbrella note                        | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/platform-build-registry.md`                                     | modified  | later maturity layer cross-reference                             | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/platform-maturity-model.md`                                     | modified  | later maturity layer cross-reference                             | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/reporting-and-metrics.md`                                       | modified  | reporting as input/output for future insights agents             | Related to AI docs ownership pass                 | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/sales-to-production.md`                                         | modified  | AI-assisted sales-to-production future extension                 | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/system-overview.md`                                             | modified  | future Agentic Operations architecture note                      | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/target-ia.md`                                                   | modified  | contextual AI IA guidance                                        | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/vision.md`                                                      | modified  | high-level Agentic Operations strategic mention                  | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/workflow-spec.md`                                               | modified  | workflow ownership note and formatting                           | Related to AI docs ownership pass                 | Likely yes after review                  | Category A/B: commit with AI/agentic ownership docs if formatting-only changes are acceptable       |
| `docs/workflow-state-machine.md`                                      | modified  | workflow state/gate ownership note and formatting                | Related to AI docs ownership pass                 | Likely yes after review                  | Category A/B: commit with AI/agentic ownership docs if formatting-only changes are acceptable       |
| `docs/workflows.md`                                                   | modified  | future AI workflow participant note                              | Related to Agentic docs pass                      | Yes, with Agentic docs bundle            | Category A: commit with AI/agentic ownership docs                                                   |
| `docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md` | untracked | Phase 2A read-only validation implementation checkpoint          | Related to staging seed Phase 2A work             | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md`             | untracked | Phase 2A QA checkpoint                                           | Related to staging seed QA pass                   | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `docs/demo/staging-demo-data-plan.md`                                 | modified  | dry-run wording correction after validate-target client addition | Related to staging seed Phase 2A work             | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `docs/demo/staging-demo-seed-script-spec.md`                          | modified  | Phase 2A validate-target spec update                             | Related to staging seed Phase 2A work             | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `docs/demo/staging-demo-seed-write-mode-design.md`                    | modified  | write mode remains future; validate-target implemented           | Related to staging seed Phase 2A work             | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `docs/design/staging-demo-seed-phase-1-dry-run-script.md`             | modified  | dry-run wording correction after validate-target client addition | Related to staging seed QA pass                   | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `docs/staging-owner-runbook.md`                                       | modified  | owner command for read-only validate-target                      | Related to staging seed Phase 2A work             | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `package.json`                                                        | modified  | adds `demo:data:seed:validate-target` script                     | Related to staging seed Phase 2A work             | Yes, with staging seed validation bundle | Category A: commit with staging seed validation tooling/docs                                        |
| `scripts/seed-staging-demo-data.mjs`                                  | modified  | read-only validate-target mode and dry-run wording               | Related to staging seed Phase 2A work             | Yes, after tests/checks                  | Category A: commit with staging seed validation tooling/docs                                        |
| `scripts/seed-staging-demo-data.test.mjs`                             | modified  | validate-target safety tests                                     | Related to staging seed Phase 2A work             | Yes, after tests/checks                  | Category A: commit with staging seed validation tooling/docs                                        |

## 3. Recommended Next Actions

Recommended order:

1. Commit the staging seed validation bundle separately:
   `chore: add staging demo seed target validation`
2. Commit the staging seed QA checkpoint separately if it is not included in
   the first commit:
   `chore: checkpoint staging demo seed validation`
3. Commit the Agentic Operations and AI docs ownership bundle separately:
   `docs: clarify ai and automation doc ownership`

Because `docs/README.md` and `docs/chat-handoff.md` contain both staging seed
and Agentic Operations edits, do not blindly stage those files into the wrong
commit. Either use careful patch staging or make one explicit mixed docs
checkpoint commit after confirming that combining the two topics is acceptable.

## 4. Files Intentionally Left Unstaged

All pre-existing dirty files remain unstaged except this checkpoint document.
Nothing was discarded or reverted.

## 5. Risks

- `docs/README.md` and `docs/chat-handoff.md` are overlap files. They should be
  staged carefully so staging seed status and Agentic Operations ownership do
  not accidentally land in the wrong commit.
- `docs/workflow-spec.md`, `docs/workflow-state-machine.md`, and
  `docs/ai/intelligent-follow-up-engine.md` include formatting changes around
  tables or lists in addition to ownership notes. Review those hunks before
  committing the Agentic docs bundle.
- `package.json` and the seed script/test changes are not app behavior, but
  they are tooling changes rather than docs-only changes. Keep them in the
  staging seed validation commit, not in an Agentic docs commit.

## 6. Validation Notes

The earlier staging seed QA pass ran:

- `node scripts/seed-staging-demo-data.test.mjs`
- valid fake dry-run command
- missing-input dry-run command
- missing-input validate-target command
- mocked validate-target command without real Supabase connection
- `pnpm demo:data:seed:dry-run -- ...`
- focused Prettier check
- `git diff --check`

Before committing the staging seed validation bundle, rerun those checks or at
least rerun the seed script tests, focused Prettier, and `git diff --check`.

Before committing the Agentic docs bundle, run focused Prettier on the touched
docs and confirm `docs/current-state.md` still says full autonomous/agentic AI
is not implemented.
