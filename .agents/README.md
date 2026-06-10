# FloorConnector Agent Library

This folder contains shared agent resources.

## Purpose

`.agents/` is the shared library for agent roles and reusable skills.

It is not the local task runner and it is not the Codex stream control tower.

## Folders

- `roles/`: shared role definitions used by ChatGPT, Codex, Claude, and future agents.
- `skills/`: reusable skills, procedures, and capability packs.

## Boundaries

- Use `AGENTS.md` as the universal repo constitution.
- Use `.agent/` for local task queue, run logs, reports, and task handoff templates.
- Use `.codex/` for Codex-specific stream plans, prompt templates, worktree rules, and review checklists.
- Use `.claude/` for Claude-specific settings, skills, memory, and command behavior.

No product, architecture, workflow, or approval rule should exist only in `.agents/`.
Anything universal belongs in `AGENTS.md` or the canonical docs.
