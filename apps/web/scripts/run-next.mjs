import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const appDir = path.resolve(scriptDir, "..");
const workspaceRoot = path.resolve(appDir, "..", "..");

const args = process.argv.slice(2);

function loadRootEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envFile = fs.readFileSync(envPath, "utf8");

  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadRootEnv(path.join(workspaceRoot, ".env.local"));

function normalizeWindowsEnv(env) {
  if (process.platform !== "win32") {
    return env;
  }

  const normalized = {};
  const seenKeys = new Map();

  for (const [key, value] of Object.entries(env)) {
    const normalizedKey = key.toLowerCase();
    const existingKey = seenKeys.get(normalizedKey);

    if (!existingKey) {
      seenKeys.set(normalizedKey, key);
      normalized[key] = value;
      continue;
    }

    if (key === "Path" || (existingKey !== "Path" && existingKey !== "PATH")) {
      delete normalized[existingKey];
      seenKeys.set(normalizedKey, key);
      normalized[key] = value;
    }
  }

  return normalized;
}

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: appDir,
  env: normalizeWindowsEnv(process.env),
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
