#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const runChecks = process.argv.includes("--run-checks");

const requiredFiles = [
  "pnpm-workspace.yaml",
  "apps/web/package.json",
  ".env.example",
  "docs/staging-deployment-readiness-audit.md",
  "docs/staging-owner-runbook.md",
  "docs/demo/operating-core-demo-path.md"
];

const expectedRootScripts = [
  "dev",
  "build",
  "lint",
  "typecheck",
  "e2e:auth",
  "e2e:portal",
  "e2e:super-admin",
  "staging:preflight"
];

const expectedWebScripts = ["dev", "build", "lint", "typecheck"];

const expectedEnvNames = [
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_MARKETING_URL",
  "NEXT_PUBLIC_SUPPORT_URL",
  "NEXT_PUBLIC_PRIVACY_POLICY_URL",
  "NEXT_PUBLIC_TERMS_OF_SERVICE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NODE_ENV",
  "APP_ENV",
  "APP_SECRET",
  "SESSION_SECRET",
  "ENCRYPTION_KEY",
  "CRON_SECRET",
  "INTERNAL_API_TOKEN",
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_CONNECT_WEBHOOK_SECRET",
  "STRIPE_FOUNDER_PLAN_PRICE_ID",
  "STRIPE_PRICE_ID_BASE",
  "FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID",
  "FLOORCONNECTOR_SHOW_DEV_QA_TOOLS",
  "PLATFORM_SUPER_ADMIN_EMAIL",
  "FLOORCONNECTOR_PLATFORM_E2E_EMAIL",
  "FLOORCONNECTOR_PLATFORM_E2E_PASSWORD",
  "FLOORCONNECTOR_PORTAL_E2E_EMAIL",
  "FLOORCONNECTOR_PORTAL_E2E_PASSWORD",
  "PLAYWRIGHT_PORTAL_STORAGE_STATE",
  "FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE",
  "POSTMARK_SERVER_TOKEN",
  "POSTMARK_MESSAGE_STREAM",
  "POSTMARK_BROADCAST_STREAM",
  "POSTMARK_FROM_EMAIL",
  "SIGNWELL_API_KEY",
  "SIGNWELL_WEBHOOK_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "QUICKBOOKS_CLIENT_ID",
  "QUICKBOOKS_CLIENT_SECRET",
  "QUICKBOOKS_REDIRECT_URI",
  "QUICKBOOKS_ENVIRONMENT",
  "COMPANYCAM_CLIENT_ID",
  "COMPANYCAM_CLIENT_SECRET",
  "COMPANYCAM_REDIRECT_URI",
  "COMPANYCAM_WEBHOOK_SECRET",
  "N8N_BASE_URL",
  "N8N_WEBHOOK_URL",
  "N8N_API_KEY"
];

const recommendedCommands = [
  "pnpm install",
  "pnpm --filter @floorconnector/web typecheck",
  "pnpm --filter @floorconnector/web lint",
  "pnpm.cmd --filter @floorconnector/web exec tsx --test lib/projectpulse/summary.test.ts",
  "pnpm exec playwright test --project=chromium-public e2e/marketing-login.spec.js",
  "pnpm e2e:auth",
  "pnpm exec playwright test e2e/dashboard-ui.spec.js e2e/schedule-ready-handoff.spec.js --project=chromium-protected"
];

const failures = [];
const warnings = [];

function resolveWorkspacePath(relativePath) {
  return path.join(workspaceRoot, relativePath);
}

function readJson(relativePath) {
  const filePath = resolveWorkspacePath(relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function checkFileExists(relativePath) {
  if (!fs.existsSync(resolveWorkspacePath(relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function checkNodeVersion() {
  const rootPackage = readJson("package.json");
  const engine = rootPackage.engines?.node;
  const major = Number(process.versions.node.split(".")[0]);

  if (engine && engine.includes("20") && major < 20) {
    failures.push(
      `Node ${process.versions.node} does not satisfy repo engine ${engine}.`
    );
    return;
  }

  console.log(
    `OK Node ${process.versions.node}${engine ? ` satisfies ${engine}` : ""}`
  );
}

function checkPnpmAvailable() {
  const result = spawnSync(`${packageManager} --version`, {
    cwd: workspaceRoot,
    encoding: "utf8",
    shell: true
  });

  if (result.status !== 0) {
    failures.push("pnpm is not available on PATH.");
    return;
  }

  console.log(`OK pnpm ${result.stdout.trim()} is available`);
}

function checkPackageScripts() {
  const rootPackage = readJson("package.json");
  const webPackage = readJson("apps/web/package.json");
  const rootScripts = rootPackage.scripts ?? {};
  const webScripts = webPackage.scripts ?? {};

  for (const script of expectedRootScripts) {
    if (!rootScripts[script]) {
      failures.push(`Missing root package script: ${script}`);
    }
  }

  for (const script of expectedWebScripts) {
    if (!webScripts[script]) {
      failures.push(`Missing apps/web package script: ${script}`);
    }
  }
}

function parseEnvExampleNames() {
  const envText = fs.readFileSync(resolveWorkspacePath(".env.example"), "utf8");
  const names = new Set();

  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=/);
    if (match) {
      names.add(match[1]);
    }
  }

  return names;
}

function checkEnvNames() {
  const envNames = parseEnvExampleNames();
  const missing = expectedEnvNames.filter((name) => !envNames.has(name));

  if (missing.length > 0) {
    failures.push(
      `Missing expected names in .env.example: ${missing.join(", ")}`
    );
  }
}

function checkOptionalLocalHostingState() {
  if (fs.existsSync(resolveWorkspacePath(".vercel/project.json"))) {
    warnings.push(
      ".vercel/project.json is present; confirm it points to the owner-approved staging project before any deploy."
    );
  } else {
    warnings.push(
      ".vercel/project.json is absent; owner must resolve Vercel account/project linking before staging."
    );
  }

  if (!fs.existsSync(resolveWorkspacePath("vercel.json"))) {
    warnings.push(
      "vercel.json is absent; keep repo config unchanged unless a failed build or owner preference proves it is needed."
    );
  }
}

function printRecommendedCommands() {
  console.log("\nRecommended next commands:");
  for (const command of recommendedCommands) {
    console.log(`- ${command}`);
  }
  console.log(
    "\nProtected Playwright commands require real auth state and a matching PLAYWRIGHT_BASE_URL."
  );
}

function runStaticChecks() {
  const checks = [
    [
      "pnpm --filter @floorconnector/web typecheck",
      ["--filter", "@floorconnector/web", "typecheck"]
    ],
    [
      "pnpm --filter @floorconnector/web lint",
      ["--filter", "@floorconnector/web", "lint"]
    ]
  ];

  for (const [label, args] of checks) {
    console.log(`\nRunning ${label}`);
    const result = spawnSync(`${packageManager} ${args.join(" ")}`, {
      cwd: workspaceRoot,
      stdio: "inherit",
      shell: true
    });

    if (result.status !== 0) {
      failures.push(`${label} failed.`);
    }
  }
}

console.log("FloorConnector staging preflight");
console.log(
  "Local-only checks. This script does not read .env.local, deploy, call providers, or mutate remote state.\n"
);

for (const file of requiredFiles) {
  checkFileExists(file);
}

if (failures.length === 0) {
  checkNodeVersion();
  checkPnpmAvailable();
  checkPackageScripts();
  checkEnvNames();
  checkOptionalLocalHostingState();
}

if (runChecks && failures.length === 0) {
  runStaticChecks();
}

if (warnings.length > 0) {
  console.log("\nWarnings / owner checkpoints:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

printRecommendedCommands();

if (failures.length > 0) {
  console.error("\nPreflight failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "\nPreflight passed: local staging readiness structure is in place."
);
