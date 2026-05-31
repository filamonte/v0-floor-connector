#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const worktreesByStream = new Map([
  ["main", "C:\\FloorConnector"],
  ["architecture-coordination", "C:\\FC-worktrees\\architecture-coordination"],
  ["verification", "C:\\FC-worktrees\\verification"],
  ["project-workspace", "C:\\FC-worktrees\\project-workspace"],
  ["scheduling", "C:\\FC-worktrees\\scheduling"],
  ["communications", "C:\\FC-worktrees\\communications"],
  ["financials-reporting", "C:\\FC-worktrees\\financials-reporting"],
  ["financials", "C:\\FC-worktrees\\financials"],
  ["field-mobile", "C:\\FC-worktrees\\field-mobile"],
  ["portal", "C:\\FC-worktrees\\portal"]
]);

function usage() {
  console.error(
    "Usage: node scripts/fc-agent-runner.mjs --task <path> [--execute]"
  );
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--execute") {
      args.execute = true;
      continue;
    }

    if (!key.startsWith("--")) {
      console.error(`Unexpected argument: ${key}`);
      usage();
      process.exit(2);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      console.error(`Missing value for ${key}`);
      usage();
      process.exit(2);
    }

    args[key.slice(2)] = value;
    index += 1;
  }
  return args;
}

function requireArg(args, name) {
  const value = args[name]?.trim();
  if (!value) {
    console.error(`Missing required argument: --${name}`);
    usage();
    process.exit(2);
  }
  return value;
}

function readMetadata(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`^- ${escaped}:\\s*(.*)$`, "im"));
  return match?.[1]?.trim() || "";
}

const args = parseArgs(process.argv.slice(2));
const taskPath = resolve(process.cwd(), requireArg(args, "task"));

if (args.execute) {
  console.error("execute mode not enabled in Phase 1");
  process.exit(1);
}

if (!existsSync(taskPath)) {
  console.error(`Task file not found: ${taskPath}`);
  process.exit(1);
}

const taskContent = readFileSync(taskPath, "utf8");
const stream = readMetadata(taskContent, "Stream") || "(missing)";
const worktree = worktreesByStream.get(stream) || "<confirm worktree manually>";

console.log("Agent runner instruction mode");
console.log(`Task file exists: ${taskPath}`);
console.log(`Stream: ${stream}`);
console.log(`Recommended worktree: ${worktree}`);
console.log("Required preflight: pnpm fc:preflight:fast");
console.log(
  "Boundary: no auto-merge, no auto-push, no migrations, no production actions, no secrets."
);

console.log("\nCodex CLI instruction block:");
console.log("```text");
console.log(`Start in ${worktree}.`);
console.log(`Use the task file at ${taskPath}.`);
console.log("Run git status --short --branch and git fetch origin first.");
console.log("Read the required docs listed in the task file.");
console.log("Run pnpm fc:preflight:fast before editing.");
console.log("Implement only the allowed scope.");
console.log("Run targeted validation and git diff --check.");
console.log(
  "Stage only intended files and commit only if the task asks for it."
);
console.log(
  "Do not push, merge, rebase, apply migrations, touch secrets, or run production/provider actions."
);
console.log(
  "Report final branch/status, changed files, validation, commit, skipped checks, and follow-up."
);
console.log("```");
