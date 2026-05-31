#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const queueDir = join(process.cwd(), ".agent", "queue");

function readMetadata(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`^- ${escaped}:\\s*(.*)$`, "im"));
  return match?.[1]?.trim() || "";
}

function readTitle(content) {
  const match = content.match(/^# Task:\s*(.+)$/im);
  return match?.[1]?.trim() || "";
}

if (!existsSync(queueDir)) {
  console.log("No queued tasks: .agent/queue does not exist.");
  process.exit(0);
}

const files = readdirSync(queueDir)
  .filter((file) => file.endsWith(".md"))
  .filter((file) => file !== ".gitkeep")
  .sort();

if (files.length === 0) {
  console.log("No queued tasks.");
  process.exit(0);
}

console.log("Queued tasks:");
for (const file of files) {
  const path = join(queueDir, file);
  const content = readFileSync(path, "utf8");
  console.log(`\n${basename(file)}`);
  console.log(`  Title: ${readTitle(content) || "(missing)"}`);
  console.log(`  Stream: ${readMetadata(content, "Stream") || "(missing)"}`);
  console.log(
    `  Priority: ${readMetadata(content, "Priority") || "(missing)"}`
  );
  console.log(`  Mode: ${readMetadata(content, "Mode") || "(missing)"}`);
  console.log(`  Created: ${readMetadata(content, "Created") || "(missing)"}`);
}
