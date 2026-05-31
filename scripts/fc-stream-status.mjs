#!/usr/bin/env node

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const worktrees = [
  "C:\\FloorConnector",
  "C:\\FC-worktrees\\architecture-coordination",
  "C:\\FC-worktrees\\verification",
  "C:\\FC-worktrees\\project-workspace",
  "C:\\FC-worktrees\\scheduling",
  "C:\\FC-worktrees\\communications",
  "C:\\FC-worktrees\\financials",
  "C:\\FC-worktrees\\financials-reporting",
  "C:\\FC-worktrees\\field-mobile",
  "C:\\FC-worktrees\\portal"
];

function git(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return null;
  }
}

function getBranch(cwd) {
  return git(cwd, ["branch", "--show-current"]) || "(detached or unknown)";
}

function getStatus(cwd) {
  return git(cwd, ["status", "--short", "--branch"]) || "(status unavailable)";
}

function getAheadBehind(cwd) {
  const upstream = git(cwd, [
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{u}"
  ]);

  if (!upstream) {
    return "no upstream";
  }

  const counts = git(cwd, [
    "rev-list",
    "--left-right",
    "--count",
    `${upstream}...HEAD`
  ]);
  if (!counts) {
    return `upstream ${upstream}; counts unavailable`;
  }

  const [behind = "?", ahead = "?"] = counts.split(/\s+/);
  return `ahead ${ahead}, behind ${behind} vs ${upstream}`;
}

function getLatestCommit(cwd) {
  return git(cwd, ["log", "-1", "--pretty=%h %s"]) || "(commit unavailable)";
}

function printWorktree(path) {
  if (!existsSync(path)) {
    console.log(`\n[MISSING] ${path}`);
    return;
  }

  const status = getStatus(path);
  const statusLines = status.split(/\r?\n/);
  const dirty = statusLines.slice(1).some((line) => line.trim().length > 0);

  console.log(`\n[${dirty ? "DIRTY" : "CLEAN"}] ${path}`);
  console.log(`  Branch: ${getBranch(path)}`);
  console.log(`  Upstream: ${getAheadBehind(path)}`);
  console.log(`  Latest: ${getLatestCommit(path)}`);
  console.log("  Status:");
  for (const line of statusLines) {
    console.log(`    ${line}`);
  }
}

console.log("FloorConnector stream status");
console.log(`Generated: ${new Date().toISOString()}`);

for (const worktree of worktrees) {
  printWorktree(worktree);
}
