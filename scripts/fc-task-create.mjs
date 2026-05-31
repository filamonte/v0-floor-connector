#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const allowedPriorities = new Set(["low", "normal", "high"]);
const allowedModes = new Set(["local", "cloud", "review"]);
const repoRoot = process.cwd();
const queueDir = join(repoRoot, ".agent", "queue");
const templatePath = join(repoRoot, ".agent", "templates", "task.md");

function usage() {
  console.error(
    "Usage: node scripts/fc-task-create.mjs --stream <name> --title <title> [--chat <chat/session>] [--priority <low|normal|high>] [--mode <local|cloud|review>]"
  );
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) {
      console.error(`Unexpected argument: ${key}`);
      usage();
      process.exit(2);
    }

    const name = key.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      console.error(`Missing value for ${key}`);
      usage();
      process.exit(2);
    }

    args[name] = next;
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

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestampForFilename(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function defaultTemplate() {
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, "utf8");
  }

  return `# Task: <TITLE>

- Stream:
- Branch/worktree:
- Owner:
- Status:

## Goal

<Describe the intended outcome.>

## Required Docs

- \`docs/developer-source-of-truth.md\`
- \`docs/current-state.md\`
- \`docs/workflows.md\`
- \`docs/chat-handoff.md\`
- \`.codex/control-tower.md\`
- \`.codex/stream-contracts/<stream>.md\`

## Scope Allowed

-

## Scope Not Allowed

-

## Validation

\`\`\`powershell
pnpm fc:preflight:fast
git diff --check
\`\`\`

## Completion Report

- final branch/status
- commit hash/message
- changed files
- validation results
- skipped commands
- follow-up
`;
}

const args = parseArgs(process.argv.slice(2));
const stream = requireArg(args, "stream");
const title = requireArg(args, "title");
const chat = args.chat?.trim() || "Development Control Tower Automation";
const priority = args.priority?.trim() || "normal";
const mode = args.mode?.trim() || "local";

if (!allowedPriorities.has(priority)) {
  console.error(`Invalid priority: ${priority}`);
  console.error("Allowed priorities: low, normal, high");
  process.exit(2);
}

if (!allowedModes.has(mode)) {
  console.error(`Invalid mode: ${mode}`);
  console.error("Allowed modes: local, cloud, review");
  process.exit(2);
}

const now = new Date();
const createdAt = now.toISOString();
const filename = `${timestampForFilename(now)}-${slugify(`${stream}-${title}`)}.md`;
const outputPath = join(queueDir, filename);

if (existsSync(outputPath)) {
  console.error(`Task file already exists: ${outputPath}`);
  process.exit(1);
}

const template = defaultTemplate();
const content = template
  .replace("# Task: <TITLE>", `# Task: ${title}`)
  .replace("- Stream:", `- Stream: ${stream}`)
  .replace("- Branch/worktree:", "- Branch/worktree: <confirm before work>")
  .replace("- Owner:", "- Owner: human-approved local handoff")
  .replace("- Status:", "- Status: queued")
  .replace(
    "## Goal\n\n<Describe the intended outcome.>",
    "## Goal\n\n<Describe the intended outcome.>"
  )
  .replace(
    "- `.codex/stream-contracts/<stream>.md`",
    `- \`.codex/stream-contracts/${stream}.md\``
  );

const metadata = `- Chat/session: ${chat}
- Priority: ${priority}
- Mode: ${mode}
- Created: ${createdAt}
`;

let finalContent = content.replace(
  "- Status: queued",
  `- Status: queued\n${metadata}`
);

if (!/^## Risk Notes$/im.test(finalContent)) {
  finalContent = `${finalContent.trimEnd()}\n\n## Risk Notes\n\n-\n`;
}

mkdirSync(queueDir, { recursive: true });
writeFileSync(outputPath, finalContent, "utf8");

console.log(`Created task: ${outputPath}`);
console.log(`Next: pnpm fc:agent:run -- --task ${outputPath}`);
