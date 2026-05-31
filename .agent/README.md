# FloorConnector Agent Handoff

This folder stores repo-native task handoff artifacts so the owner does not
need to copy/paste between ChatGPT, VS Code, local Codex CLI, and Codex Cloud.

## Folders

- `queue/`: task handoff files ready for an agent to run.
- `logs/`: agent run summaries, including branch, commit, validation, and
  blockers.
- `reports/`: integration, status, PR readiness, and audit outputs.
- `templates/`: reusable task and run-summary templates.

Keep secrets out of this folder. Queue files should describe scope, not embed
credentials or private tokens.
