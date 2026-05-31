#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const allowedStatuses = new Set(["done", "blocked", "failed", "needs-review"]);
const repoRoot = process.cwd();
const logsDir = join(repoRoot, ".agent", "logs");
const templatePath = join(repoRoot, ".agent", "templates", "run-summary.md");

function usage() {
  console.error(
    "Usage: node scripts/fc-task-summary.mjs --task <path> --status <done|blocked|failed|needs-review> [--commit <hash>] [--pr <number-or-url>]"
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

function readTemplate() {
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, "utf8");
  }

  return `# Run Summary: <TITLE>

- Date:
- Stream:
- Branch/worktree:
- Starting status:
- Final status:
- Commit:

## Summary

-

## Files Changed

-

## Validation

-

## Skipped

-

## Blockers / Follow-Up

-
`;
}

function readTitle(content, fallback) {
  const match = content.match(/^# Task:\s*(.+)$/im);
  return match?.[1]?.trim() || fallback;
}

function readMetadata(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`^- ${escaped}:\\s*(.*)$`, "im"));
  return match?.[1]?.trim() || "";
}

const args = parseArgs(process.argv.slice(2));
const taskArg = requireArg(args, "task");
const status = requireArg(args, "status");
const commit = args.commit?.trim() || "Pending";
const pr = args.pr?.trim() || "Pending";

if (!allowedStatuses.has(status)) {
  console.error(`Invalid status: ${status}`);
  console.error("Allowed statuses: done, blocked, failed, needs-review");
  process.exit(2);
}

const taskPath = resolve(repoRoot, taskArg);
if (!existsSync(taskPath)) {
  console.error(`Task file not found: ${taskPath}`);
  process.exit(1);
}

const taskContent = readFileSync(taskPath, "utf8");
const taskSlug = basename(taskPath, ".md");
const outputPath = join(logsDir, `${taskSlug}-summary.md`);
if (existsSync(outputPath)) {
  console.error(`Run summary already exists: ${outputPath}`);
  process.exit(1);
}

const title = readTitle(taskContent, taskSlug);
const stream = readMetadata(taskContent, "Stream") || "Pending";
const template = readTemplate();
const content = template
  .replace("# Run Summary: <TITLE>", `# Run Summary: ${title}`)
  .replace("- Date:", `- Date: ${new Date().toISOString()}`)
  .replace("- Stream:", `- Stream: ${stream}`)
  .replace("- Branch/worktree:", "- Branch/worktree: Pending")
  .replace(
    "- Starting status:",
    `- Starting status: See task file: ${taskPath}`
  )
  .replace("- Final status:", `- Final status: ${status}`)
  .replace("- Commit:", `- Commit: ${commit}`)
  .replace(
    "## Summary\n\n-",
    `## Summary\n\n- Task path: ${taskPath}\n- Status: ${status}\n- PR: ${pr}\n- Next action: <fill in next action>`
  )
  .replace(
    "## Files Changed\n\n-",
    "## Files Changed\n\n- <fill in changed files>"
  )
  .replace(
    "## Validation\n\n-",
    "## Validation\n\n- <fill in validation commands and results>"
  )
  .replace(
    "## Skipped\n\n-",
    "## Skipped\n\n- <fill in skipped checks and why>"
  )
  .replace(
    "## Blockers / Follow-Up\n\n-",
    "## Blockers / Follow-Up\n\n- <fill in blockers or questions>"
  );

mkdirSync(logsDir, { recursive: true });
writeFileSync(outputPath, content, "utf8");

console.log(`Created run summary: ${outputPath}`);
console.log("Original task file was not moved or deleted.");
