#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

const mode = process.argv[2] || "fast";
if (!["fast", "full"].includes(mode)) {
  console.error("Usage: node scripts/fc-preflight.mjs [fast|full]");
  process.exit(2);
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const scripts = packageJson.scripts || {};
const pnpm = "pnpm";
const summary = [];

function runStep(name, command, args, options = {}) {
  console.log(`\n== ${name} ==`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    ...options
  });

  if (result.error) {
    summary.push({ name, status: "failed", detail: result.error.message });
    return false;
  }

  if (result.status === 0) {
    summary.push({ name, status: "passed" });
    return true;
  }

  summary.push({ name, status: "failed", detail: `exit ${result.status}` });
  return false;
}

function skipStep(name, detail) {
  console.log(`\n== ${name} ==`);
  console.log(`Skipped: ${detail}`);
  summary.push({ name, status: "skipped", detail });
}

function gitOutput(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function changedFiles() {
  const tracked = gitOutput([
    "diff",
    "--name-only",
    "--diff-filter=ACMRTUXB",
    "HEAD",
    "--"
  ])
    .split(/\r?\n/)
    .filter(Boolean);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"])
    .split(/\r?\n/)
    .filter(Boolean);
  return [...new Set([...tracked, ...untracked])].filter((file) =>
    existsSync(file)
  );
}

function prettierFiles(files) {
  return files.filter((file) =>
    /\.(cjs|css|html|js|json|jsx|md|mjs|ts|tsx|yaml|yml)$/.test(file)
  );
}

let ok = true;

const filesForPrettier = prettierFiles(changedFiles());
if (filesForPrettier.length > 0) {
  ok =
    runStep("prettier changed files", pnpm, [
      "exec",
      "prettier",
      "--check",
      ...filesForPrettier
    ]) && ok;
} else {
  skipStep("prettier changed files", "no changed supported files");
}

if (scripts.lint) {
  ok = runStep("lint", pnpm, ["lint"]) && ok;
} else {
  skipStep("lint", "package.json has no lint script");
}

if (scripts.typecheck) {
  ok = runStep("typecheck", pnpm, ["typecheck"]) && ok;
} else {
  skipStep("typecheck", "package.json has no typecheck script");
}

ok = runStep("git diff --check", "git", ["diff", "--check"]) && ok;

if (mode === "full") {
  if (scripts.test) {
    ok = runStep("test", pnpm, ["test"]) && ok;
  } else {
    skipStep("test", "package.json has no generic test script");
  }
}

console.log("\nPreflight summary");
for (const item of summary) {
  const suffix = item.detail ? ` - ${item.detail}` : "";
  console.log(`- ${item.name}: ${item.status}${suffix}`);
}

process.exit(ok ? 0 : 1);
