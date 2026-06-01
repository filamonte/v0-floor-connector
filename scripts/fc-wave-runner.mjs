#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const codexWavesRoot = join(repoRoot, ".codex", "waves");
const statusFileName = "stream-status.json";
const reportFileName = "run-report.md";

const commands = new Set([
  "run",
  "prepare",
  "status",
  "validate",
  "merge-check",
  "report",
  "generate",
  "approve",
  "merge"
]);

function usage() {
  console.error(`Usage:
  node scripts/fc-wave-runner.mjs <command> --wave <name> [options]

Commands:
  run          Prepare streams, optionally run agent, validate, merge-check, report
  prepare      Validate manifest and create/update stream worktrees
  status       Print current wave status
  validate     Run stream validation commands
  merge-check  Dry-check stream merges in a scratch integration worktree
  report       Generate report and next-wave proposal
  generate     Generate a schema-validated proposed next wave
  approve      Create approved.json after successful review
  merge        Merge approved streams into main

Options:
  --wave <name>
  --allow-high-risk
  --resume
  --force
  --approved
  --push
  --proposal`);
}

function parseArgs(argv) {
  const [command = "run", ...rest] = argv;
  if (!commands.has(command)) {
    usage();
    throw new Error(`Unknown command: ${command}`);
  }

  const options = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const key = rest[index];
    if (!key.startsWith("--")) {
      throw new Error(`Unexpected argument: ${key}`);
    }

    const name = key.slice(2);
    if (
      [
        "allow-high-risk",
        "resume",
        "force",
        "approved",
        "push",
        "proposal"
      ].includes(name)
    ) {
      options[toCamel(name)] = true;
      continue;
    }

    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${key}`);
    }
    options[toCamel(name)] = value;
    index += 1;
  }

  if (!options.wave) {
    throw new Error("Missing required option: --wave <name>");
  }

  return options;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function tryGit(args, options = {}) {
  try {
    return git(args, options);
  } catch {
    return null;
  }
}

function runProcess(command, options = {}) {
  const result = spawnSync(command, {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
    shell: true,
    stdio: options.inherit ? "inherit" : ["ignore", "pipe", "pipe"]
  });

  return {
    command,
    cwd: options.cwd || repoRoot,
    status: result.status,
    stdout: result.stdout?.trim() || "",
    stderr: result.stderr?.trim() || "",
    error: result.error?.message || ""
  };
}

function requireCleanMain() {
  const branch = git(["branch", "--show-current"]);
  if (branch !== "main") {
    throw new Error(
      `Refusing to continue: current branch is ${branch}, not main.`
    );
  }

  const status = git(["status", "--porcelain"]);
  if (status) {
    throw new Error("Refusing to continue: main working tree is dirty.");
  }
}

function requireMainUpToDate() {
  git(["fetch", "origin"], { cwd: repoRoot });
  const counts = git([
    "rev-list",
    "--left-right",
    "--count",
    "origin/main...HEAD"
  ]);
  const [behind = "0", ahead = "0"] = counts.split(/\s+/);
  if (behind !== "0" || ahead !== "0") {
    throw new Error(
      `Refusing to continue: main is ahead ${ahead}, behind ${behind} vs origin/main.`
    );
  }
}

function loadManifest(waveName) {
  const waveDir = join(codexWavesRoot, waveName);
  const manifestPath = join(waveDir, "wave.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Wave manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return { manifest, waveDir, manifestPath };
}

function saveManifest(waveDir, manifest) {
  writeFileSync(
    join(waveDir, "wave.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function resolveRepoPath(pathValue) {
  return isAbsolute(pathValue) ? pathValue : join(repoRoot, pathValue);
}

function validateManifestShape(manifest, options = {}) {
  const errors = [];
  const streams = Array.isArray(manifest.streams) ? manifest.streams : [];
  const highRiskStreams = streams.filter((stream) => stream.risk === "high");
  const blockedStreams = streams.filter((stream) => stream.risk === "blocked");

  if (!manifest.name) errors.push("manifest.name is required");
  if (!manifest.goal) errors.push("manifest.goal is required");
  if (!manifest.base) errors.push("manifest.base is required");
  if (!manifest.worktreeRoot) errors.push("manifest.worktreeRoot is required");
  if (streams.length === 0)
    errors.push("manifest.streams must include at least one stream");

  for (const stream of streams) {
    for (const field of [
      "name",
      "branch",
      "worktree",
      "prompt",
      "risk",
      "productOutcome"
    ]) {
      if (!stream[field])
        errors.push(`stream ${stream.name || "(unnamed)"} missing ${field}`);
    }
    if (!["low", "medium", "high", "blocked"].includes(stream.risk)) {
      errors.push(
        `stream ${stream.name || "(unnamed)"} has invalid risk: ${stream.risk}`
      );
    }
    if (stream.prompt && !existsSync(resolveRepoPath(stream.prompt))) {
      errors.push(`prompt file not found for ${stream.name}: ${stream.prompt}`);
    }
  }

  if (blockedStreams.length > 0) {
    errors.push(
      `blocked streams are refused: ${blockedStreams.map((stream) => stream.name).join(", ")}`
    );
  }
  if (highRiskStreams.length > 1) {
    errors.push("refusing more than one high-risk stream in one wave");
  }
  if (highRiskStreams.length > 0 && !options.allowHighRisk) {
    errors.push("high-risk streams require --allow-high-risk");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

function requireActiveManifest(manifest, command) {
  if (manifest.state === "proposed") {
    throw new Error(
      `Refusing to ${command} proposed wave ${manifest.name}. Run pnpm fc:wave:approve --wave ${manifest.name} --proposal after human review.`
    );
  }
}

function loadStatus(waveDir) {
  const statusPath = join(waveDir, statusFileName);
  if (!existsSync(statusPath)) {
    return {
      generatedAt: new Date().toISOString(),
      approval: { approved: false, pushApproved: false },
      streams: {}
    };
  }

  return JSON.parse(readFileSync(statusPath, "utf8"));
}

function saveStatus(waveDir, status) {
  mkdirSync(waveDir, { recursive: true });
  status.generatedAt = new Date().toISOString();
  status.reportPath = join(waveDir, reportFileName);
  writeFileSync(
    join(waveDir, statusFileName),
    `${JSON.stringify(status, null, 2)}\n`
  );
}

function updateStreamStatus(status, streamName, patch) {
  status.streams[streamName] = {
    ...(status.streams[streamName] || {}),
    ...patch,
    updatedAt: new Date().toISOString()
  };
}

function currentCommit(cwd) {
  return tryGit(["log", "-1", "--pretty=%H"], { cwd }) || "";
}

function changedFilesAgainstBase(cwd, base = "origin/main") {
  const output = tryGit(["diff", "--name-only", `${base}...HEAD`], { cwd });
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function isDirty(cwd) {
  const output = tryGit(["status", "--porcelain"], { cwd });
  return Boolean(output);
}

function prepareWave(manifest, waveDir, options) {
  requireActiveManifest(manifest, "prepare");
  validateManifestShape(manifest, options);
  git(["fetch", "origin"]);
  requireCleanMain();

  const status = loadStatus(waveDir);
  status.wave = manifest.name;
  status.goal = manifest.goal;
  status.base = manifest.base;
  status.baseCommit = git(["rev-parse", manifest.base]);

  for (const stream of manifest.streams) {
    const worktree = stream.worktree;
    const branchExists = Boolean(
      tryGit(["rev-parse", "--verify", stream.branch])
    );

    if (existsSync(worktree)) {
      if (isDirty(worktree) && !options.resume) {
        throw new Error(
          `Refusing dirty stream worktree without --resume: ${stream.name} (${worktree})`
        );
      }
      updateStreamStatus(status, stream.name, {
        status: "prepared",
        branch: stream.branch,
        worktree,
        prompt: stream.prompt,
        risk: stream.risk,
        latestCommit: currentCommit(worktree),
        note: "worktree already exists"
      });
      continue;
    }

    mkdirSync(dirname(worktree), { recursive: true });
    if (branchExists) {
      spawnGitOrThrow(["worktree", "add", worktree, stream.branch]);
    } else {
      spawnGitOrThrow([
        "worktree",
        "add",
        "-b",
        stream.branch,
        worktree,
        manifest.base
      ]);
    }

    updateStreamStatus(status, stream.name, {
      status: "prepared",
      branch: stream.branch,
      worktree,
      prompt: stream.prompt,
      risk: stream.risk,
      latestCommit: currentCommit(worktree),
      note: branchExists
        ? "existing branch attached"
        : "new branch created from base"
    });
  }

  saveStatus(waveDir, status);
  return status;
}

function spawnGitOrThrow(args, cwd = repoRoot) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    throw new Error(
      result.stderr || result.stdout || `git ${args.join(" ")} failed`
    );
  }
}

function commandFromTemplate(template, manifest, stream) {
  const promptFile = resolveRepoPath(stream.prompt);
  const replacements = {
    wave: manifest.name,
    stream: stream.name,
    branch: stream.branch,
    worktree: stream.worktree,
    promptFile
  };

  return Object.entries(replacements).reduce(
    (value, [key, replacement]) => value.replaceAll(`{${key}}`, replacement),
    template
  );
}

function generatorCommandFromTemplate(template, values) {
  return Object.entries(values).reduce(
    (value, [key, replacement]) => value.replaceAll(`{${key}}`, replacement),
    template
  );
}

function runAgentsIfConfigured(manifest, waveDir, options) {
  const status = loadStatus(waveDir);
  const template = process.env.FLOORCONNECTOR_AGENT_COMMAND;

  for (const stream of manifest.streams) {
    if (!existsSync(stream.worktree)) {
      updateStreamStatus(status, stream.name, {
        status: "manual_agent_required",
        manualCommand: `Start Codex in ${stream.worktree} with prompt ${resolveRepoPath(stream.prompt)}`
      });
      continue;
    }

    if (!template) {
      updateStreamStatus(status, stream.name, {
        status: "manual_agent_required",
        manualCommand: `Start Codex in ${stream.worktree} with prompt ${resolveRepoPath(stream.prompt)}`
      });
      continue;
    }

    if (isDirty(stream.worktree) && !options.resume) {
      throw new Error(
        `Refusing to run agent in dirty stream worktree without --resume: ${stream.name}`
      );
    }

    const command = commandFromTemplate(template, manifest, stream);
    const result = runProcess(command, { cwd: stream.worktree });
    updateStreamStatus(status, stream.name, {
      status: result.status === 0 ? "agent_completed" : "agent_failed",
      agentCommand: command,
      agentExitCode: result.status,
      agentStdout: result.stdout.slice(-4000),
      agentStderr: result.stderr.slice(-4000),
      latestCommit: currentCommit(stream.worktree)
    });

    if (result.status !== 0) {
      saveStatus(waveDir, status);
      throw new Error(`Agent command failed for ${stream.name}`);
    }
  }

  saveStatus(waveDir, status);
  return status;
}

function validateWave(manifest, waveDir) {
  requireActiveManifest(manifest, "validate");
  validateManifestShape(manifest, { allowHighRisk: true });
  const status = loadStatus(waveDir);

  for (const stream of manifest.streams) {
    if (!existsSync(stream.worktree)) {
      updateStreamStatus(status, stream.name, {
        validation: { status: "skipped", reason: "worktree missing" },
        status: status.streams[stream.name]?.status || "not_prepared"
      });
      continue;
    }

    const commandsToRun = Array.isArray(stream.validation)
      ? stream.validation
      : [];
    const results = [];
    let ok = true;

    for (const command of commandsToRun) {
      const result = runProcess(command, { cwd: stream.worktree });
      results.push({
        command,
        exitCode: result.status,
        stdout: result.stdout.slice(-4000),
        stderr: result.stderr.slice(-4000)
      });
      if (result.status !== 0) ok = false;
    }

    updateStreamStatus(status, stream.name, {
      validation: {
        status:
          commandsToRun.length === 0 ? "skipped" : ok ? "passed" : "failed",
        results
      },
      latestCommit: currentCommit(stream.worktree),
      changedFiles: changedFilesAgainstBase(stream.worktree, manifest.base)
    });
  }

  saveStatus(waveDir, status);
  return status;
}

function mergeCheckWave(manifest, waveDir) {
  requireActiveManifest(manifest, "merge-check");
  validateManifestShape(manifest, { allowHighRisk: true });
  git(["fetch", "origin"]);

  const status = loadStatus(waveDir);
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+$/, "");
  const scratchBranch = `scratch/${manifest.name}-merge-check-${timestamp}`;
  const scratchWorktree = join(
    manifest.worktreeRoot || "C:/FC-worktrees",
    `_wave-check-${manifest.name}-${timestamp}`
  );

  mkdirSync(dirname(scratchWorktree), { recursive: true });
  spawnGitOrThrow([
    "worktree",
    "add",
    "-b",
    scratchBranch,
    scratchWorktree,
    manifest.base
  ]);

  const dryResults = [];
  let ok = true;

  for (const stream of manifest.streams) {
    const branchCommit = tryGit(["rev-parse", "--verify", stream.branch]);
    if (!branchCommit) {
      ok = false;
      dryResults.push({
        stream: stream.name,
        branch: stream.branch,
        status: "failed",
        detail: "branch missing"
      });
      updateStreamStatus(status, stream.name, {
        mergeCheck: { status: "failed", detail: "branch missing" }
      });
      continue;
    }

    const result = spawnSync(
      "git",
      ["merge", "--no-commit", "--no-ff", stream.branch],
      {
        cwd: scratchWorktree,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    if (result.status === 0) {
      spawnGitOrThrow(["merge", "--abort"], scratchWorktree);
      dryResults.push({
        stream: stream.name,
        branch: stream.branch,
        status: "passed"
      });
      updateStreamStatus(status, stream.name, {
        mergeCheck: { status: "passed", scratchBranch, scratchWorktree }
      });
      continue;
    }

    ok = false;
    tryGit(["merge", "--abort"], { cwd: scratchWorktree });
    dryResults.push({
      stream: stream.name,
      branch: stream.branch,
      status: "failed",
      detail: (result.stderr || result.stdout || "").trim()
    });
    updateStreamStatus(status, stream.name, {
      mergeCheck: {
        status: "failed",
        scratchBranch,
        scratchWorktree,
        detail: (result.stderr || result.stdout || "").trim()
      }
    });
  }

  status.mergeCheck = {
    status: ok ? "passed" : "failed",
    scratchBranch,
    scratchWorktree,
    results: dryResults
  };

  saveStatus(waveDir, status);
  return status;
}

function productStrideReview(manifest, status) {
  return manifest.streams.map((stream) => {
    const streamStatus = status.streams[stream.name] || {};
    const validationStatus = streamStatus.validation?.status || "not_run";
    const changedFiles = streamStatus.changedFiles || [];
    const productImpact =
      stream.risk === "low" && changedFiles.length <= 2
        ? "low"
        : stream.risk === "high"
          ? "high"
          : "medium";
    const userVisibleImprovement =
      /portal|workspace|daily|field|collections|invoice|customer|project|schedule|e2e|fixture/i.test(
        `${stream.productOutcome} ${stream.name}`
      )
        ? "yes"
        : "no";
    const canonicalWorkflowAlignment =
      /canonical|project|job|daily-log|invoice|customer|contract|portal|record|existing/i.test(
        stream.productOutcome
      )
        ? "yes"
        : "needs review";
    const operationalValue =
      /daily|field|collections|follow-up|portal|fixture|execution|continuity/i.test(
        `${stream.productOutcome} ${stream.name}`
      )
        ? "high"
        : "medium";

    let recommendedAction = "merge";
    if (stream.risk === "blocked") recommendedAction = "reject";
    else if (validationStatus === "failed") recommendedAction = "revise";
    else if (validationStatus !== "passed")
      recommendedAction = "needs human review";
    else if (
      productImpact === "low" &&
      ["medium", "high"].includes(stream.risk)
    ) {
      recommendedAction = "needs human review";
    } else if (changedFiles.length > 30) {
      recommendedAction = "needs human review";
    }

    return {
      stream: stream.name,
      productImpact,
      userVisibleImprovement,
      canonicalWorkflowAlignment,
      operationalValue,
      riskLevel: stream.risk,
      recommendedAction
    };
  });
}

function generateNextWaveProposal(manifest, waveDir, status) {
  const nextWaveName = `${manifest.name}-follow-up`;
  const proposalPath = join(waveDir, "next-wave-proposal.md");
  const streamNotes = manifest.streams
    .map((stream) => {
      const streamStatus = status.streams[stream.name] || {};
      const validation = streamStatus.validation?.status || "not_run";
      const mergeCheck = streamStatus.mergeCheck?.status || "not_run";
      return `- ${stream.name}: validation ${validation}; merge-check ${mergeCheck}; follow-up should preserve ${stream.productOutcome}`;
    })
    .join("\n");

  const content = `# Next Wave Proposal

Status: Generated
Source Wave: ${manifest.name}
Generated: ${new Date().toISOString()}

## Current Wave Goal

${manifest.goal}

## Stream Notes

${streamNotes}

## Proposed Next Wave

Name: ${nextWaveName}

Goal: Continue the strongest validated product outcomes from ${manifest.name}, with one integration-safe follow-up per stream after human review.

## Guardrails For Generated Prompts

- Read the required FloorConnector docs first.
- Start with git status, current branch, and fetch.
- Use existing canonical data and routes.
- Do not add schema, migrations, auth, RLS, payment math, provider behavior, env vars, or route protection unless explicitly approved.
- Keep changes bounded to the named stream outcome.
- Run targeted validation, Prettier on changed supported files, and git diff --check.
- Commit only the completed slice.

## Suggested Follow-Up Prompts

${manifest.streams
  .map(
    (stream) => `### ${stream.name}-follow-up

Refine only after reviewing the ${stream.name} run output. Preserve the original outcome:

${stream.productOutcome}

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.`
  )
  .join("\n\n")}
`;

  writeFileSync(proposalPath, content);
  return proposalPath;
}

const defaultMainValidation = [
  "pnpm.cmd --filter @floorconnector/web typecheck",
  "pnpm.cmd --filter @floorconnector/web lint",
  "pnpm.cmd fc:preflight:fast",
  "git diff --check"
];

const defaultProductStrideCriteria = [
  "Improves daily contractor operations",
  "Connects to canonical workflow records",
  "Reduces manual decision friction",
  "Creates visible user-facing capability",
  "Avoids duplicate models and module silos"
];

const docsForGenerator = [
  "docs/developer-source-of-truth.md",
  "docs/current-state.md",
  "docs/workflows.md",
  "docs/Roadmap.md",
  "docs/target-ia.md",
  "docs/chat-handoff.md",
  "docs/system-overview.md"
];

function firstExistingText(...paths) {
  for (const path of paths) {
    if (existsSync(path)) return readFileSync(path, "utf8");
  }
  return "";
}

function excerptText(text, maxLength = 3000) {
  const compact = text.replace(/\r\n/g, "\n").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength)}\n\n[excerpt truncated]`;
}

function ensureNextWaveSchema() {
  const schemaPath = join(codexWavesRoot, "templates", "next-wave.schema.json");
  if (existsSync(schemaPath)) return schemaPath;

  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "FloorConnector next wave proposal",
    type: "object",
    additionalProperties: false,
    required: [
      "name",
      "goal",
      "rationale",
      "base",
      "worktreeRoot",
      "maxConcurrency",
      "productStrideCriteria",
      "mainValidation",
      "streams"
    ],
    properties: {
      name: { type: "string" },
      goal: { type: "string" },
      rationale: { type: "string" },
      base: { type: "string" },
      worktreeRoot: { type: "string" },
      maxConcurrency: { type: "integer", minimum: 1, maximum: 6 },
      productStrideCriteria: {
        type: "array",
        minItems: 1,
        items: { type: "string" }
      },
      mainValidation: {
        type: "array",
        minItems: 1,
        items: { type: "string" }
      },
      streams: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "name",
            "branch",
            "worktree",
            "promptFile",
            "risk",
            "productOutcome",
            "whyThisMatters",
            "dependsOn",
            "expectedFiles",
            "validation",
            "acceptanceCriteria",
            "boundaries",
            "promptBody"
          ],
          properties: {
            name: { type: "string" },
            branch: { type: "string" },
            worktree: { type: "string" },
            promptFile: { type: "string" },
            risk: { enum: ["low", "medium", "high", "blocked"] },
            productOutcome: { type: "string" },
            whyThisMatters: { type: "string" },
            dependsOn: { type: "array", items: { type: "string" } },
            expectedFiles: { type: "array", items: { type: "string" } },
            validation: {
              type: "array",
              minItems: 1,
              items: { type: "string" }
            },
            acceptanceCriteria: {
              type: "array",
              minItems: 1,
              items: { type: "string" }
            },
            boundaries: {
              type: "array",
              minItems: 1,
              items: { type: "string" }
            },
            promptBody: { type: "string" }
          }
        }
      }
    }
  };

  writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
  return schemaPath;
}

function safeTimestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "");
}

function createGenerationAttemptDir(waveDir) {
  const attemptDir = join(waveDir, ".tmp", "generation", safeTimestamp());
  mkdirSync(attemptDir, { recursive: true });
  return attemptDir;
}

function writeJsonFile(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function buildGeneratorContext(manifest, sourceWaveDir, status, outputDir) {
  const lines = [
    "# Wave Generator Context",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Current main commit: ${tryGit(["rev-parse", "HEAD"]) || ""}`,
    "",
    "## Recent Git Log",
    "",
    "```text",
    tryGit(["log", "--oneline", "-12"]) || "(unavailable)",
    "```",
    "",
    "## Current Wave",
    "",
    `Name: ${manifest.name}`,
    `Goal: ${manifest.goal}`,
    "",
    "## Current Wave Streams",
    "",
    ...manifest.streams.map(
      (stream) =>
        `- ${stream.name}: ${stream.risk}; ${stream.productOutcome}; status ${
          status.streams?.[stream.name]?.status || "unknown"
        }; validation ${status.streams?.[stream.name]?.validation?.status || "not_run"}`
    ),
    "",
    "## Product Stride Review",
    "",
    "```json",
    JSON.stringify(status.productStrideReview || [], null, 2),
    "```",
    "",
    "## Current Run Report",
    "",
    excerptText(firstExistingText(join(sourceWaveDir, reportFileName)), 5000),
    "",
    "## Explicit Generator Instruction",
    "",
    "Generate an outcome-based next wave that materially advances FloorConnector. Avoid cosmetic-only crumbs. Prefer 3 to 5 bounded streams that connect to the canonical contractor workflow.",
    "",
    "## Relevant Doc Excerpts",
    ""
  ];

  for (const docPath of docsForGenerator) {
    lines.push(`### ${docPath}`, "");
    lines.push(excerptText(firstExistingText(join(repoRoot, docPath)), 4500));
    lines.push("");
  }

  const contextPath = join(outputDir, "generator-context.md");
  writeFileSync(contextPath, `${lines.join("\n")}\n`);
  return contextPath;
}

function buildGeneratorPrompt(
  manifest,
  outputDir,
  contextPath,
  schemaPath,
  outputPath
) {
  const promptPath = join(outputDir, "generate-next-wave.prompt.md");
  const prompt = `# Generate Next FloorConnector Wave

Use the context bundle:

\`${contextPath}\`

Use the JSON schema:

\`${schemaPath}\`

Write only JSON matching the schema to:

\`${outputPath}\`

Output contract:

- Output only JSON matching the schema.
- Do not include Markdown, commentary, logs, analysis, or follow-up text.

Wave rules:

- Generate 3 to 5 product-outcome streams only.
- Do not generate meta/debug/tooling-only streams.
- Do not generate streams named or themed around blocked file writes, docs reading, cleanup checks, validation-only, or sandbox diagnostics.
- Every stream must materially advance FloorConnector using existing canonical records.
- Avoid cosmetic-only crumbs.
- Prefer operational product areas:
  - Field execution command
  - Collections follow-up context
  - Portal trust continuity
  - E2E fixture refresh
  - Reporting/operational visibility
  - Customer/project continuity
- Keep streams mergeable and reviewable.
- Respect FloorConnector canonical lifecycle guardrails.
- Do not propose schema, migrations, auth, RLS, payment math, provider behavior, env vars, route protection, or production mutation tasks.
- No blocked streams.
- Every stream risk must be low or medium unless explicitly allowed by the runner.
- No high-risk streams unless --allow-high-risk is explicitly being used.
- Every stream branch must be stream/<kebab-case-name>.
- Every stream worktree should be under C:/FC-worktrees/<kebab-case-name-without-stream-prefix>.
- Every promptFile must be .codex/waves/<next-wave-name>/prompts/<stream-name>.md.
- Do not approve, run, merge, push, or activate the generated wave.

Every promptBody must include:

- Chat: <stream title>
- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.
- Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.

Required promptBody boundaries:

- Read the required FloorConnector docs first.
- Use existing canonical records.
- Do not create duplicate business models.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.

Current wave: ${manifest.name}
`;

  writeFileSync(promptPath, prompt);
  return promptPath;
}

function defaultGeneratedWave(manifest) {
  const nextWaveName = `${manifest.name}-ai-proposed`;
  const promptBase = `.codex/waves/${nextWaveName}/prompts`;
  const streams = [
    {
      name: "project-readiness-stride-v1",
      branch: "stream/project-readiness-stride-v1",
      worktree: "C:/FC-worktrees/project-readiness-stride",
      promptFile: `${promptBase}/project-readiness-stride-v1.md`,
      risk: "medium",
      productOutcome:
        "Tighten Project Workspace readiness and next-action continuity over existing project, estimate, contract, job, invoice, and payment records.",
      whyThisMatters:
        "Project remains the operating hub, and clearer readiness makes the existing canonical loop easier to act on without adding new models.",
      dependsOn: [],
      expectedFiles: [
        "apps/web/app/(app)/projects",
        "apps/web/lib/projects",
        "docs/current-state.md"
      ],
      validation: defaultMainValidation,
      acceptanceCriteria: [
        "Project-facing changes use existing canonical records and read models.",
        "No schema, auth, RLS, payment math, provider, or route-protection changes are made.",
        "Users can identify the next safe operational action more quickly."
      ],
      boundaries: [
        "Do not create a project activity table or duplicate project state.",
        "Do not mutate source records from read-model surfaces.",
        "Do not expose portal-only or contractor-only data incorrectly."
      ],
      promptBody: ""
    },
    {
      name: "crewboard-field-handoff-stride-v1",
      branch: "stream/crewboard-field-handoff-stride-v1",
      worktree: "C:/FC-worktrees/crewboard-field-handoff-stride",
      promptFile: `${promptBase}/crewboard-field-handoff-stride-v1.md`,
      risk: "medium",
      productOutcome:
        "Improve CrewBoard to field execution handoff clarity using canonical jobs, job assignments, daily logs, field notes, and project context.",
      whyThisMatters:
        "The schedule-to-field boundary is where operations become real work, and it should be clear without creating a dispatch or field silo.",
      dependsOn: [],
      expectedFiles: [
        "apps/web/app/(app)/schedule",
        "apps/web/lib/schedule",
        "docs/current-state.md"
      ],
      validation: defaultMainValidation,
      acceptanceCriteria: [
        "CrewBoard handoff remains advisory/read-only unless using existing actions.",
        "Daily Log and Job links route to canonical records.",
        "No new schedule, dispatch, or field task model is introduced."
      ],
      boundaries: [
        "Do not add route optimization, automated scheduling, or dispatch tables.",
        "Do not bypass Ready Check or project readiness gates.",
        "Do not expose field internals to portal users."
      ],
      promptBody: ""
    },
    {
      name: "portal-operational-trust-stride-v1",
      branch: "stream/portal-operational-trust-stride-v1",
      worktree: "C:/FC-worktrees/portal-operational-trust-stride",
      promptFile: `${promptBase}/portal-operational-trust-stride-v1.md`,
      risk: "medium",
      productOutcome:
        "Clarify customer-safe portal continuity across project, contract, invoice, payment, and shared document review paths.",
      whyThisMatters:
        "The portal should reinforce the same shared operational loop without leaking contractor-only state or creating portal-owned truth.",
      dependsOn: [],
      expectedFiles: [
        "apps/web/app/portal",
        "apps/web/lib/portal",
        "docs/current-state.md"
      ],
      validation: defaultMainValidation,
      acceptanceCriteria: [
        "Portal copy remains customer-safe and scoped by existing access checks.",
        "Customer actions route to canonical estimate, contract, invoice, and payment records.",
        "No portal-owned copies or access-rule changes are introduced."
      ],
      boundaries: [
        "Do not change portal grants, RLS, auth, or route protection.",
        "Do not expose internal blockers, Job Notes, provider diagnostics, or contractor-only evidence.",
        "Do not create portal-specific business records."
      ],
      promptBody: ""
    }
  ];

  for (const stream of streams) {
    stream.promptBody = buildDefaultPromptBody(stream);
  }

  return {
    name: nextWaveName,
    goal: "Advance FloorConnector operational continuity across Project Workspace, CrewBoard field handoff, and customer-safe portal trust without schema changes.",
    rationale:
      "Template fallback selected high-value operational strides from current docs and wave context while preserving canonical records and human approval.",
    base: "origin/main",
    worktreeRoot: "C:/FC-worktrees",
    maxConcurrency: 2,
    productStrideCriteria: defaultProductStrideCriteria,
    mainValidation: defaultMainValidation,
    streams
  };
}

function buildDefaultPromptBody(stream) {
  return `# Chat: ${titleFromSlug(stream.name)}

Branch: \`${stream.branch}\`
Worktree: \`${stream.worktree.replaceAll("/", "\\")}\`

## Goal

${stream.productOutcome}

## Required Docs

Read these before implementation:

- \`docs/developer-source-of-truth.md\`
- \`docs/current-state.md\`
- \`docs/workflows.md\`
- \`docs/chat-handoff.md\`
- \`docs/system-overview.md\`
- \`.codex/worktree-rules.md\`
- \`.codex/active-stream-plan.md\`

## Boundaries

${stream.boundaries.map((boundary) => `- ${boundary}`).join("\n")}
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or unrelated business logic.
- Do not create duplicate business models or portal-owned operational state.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Implementation Requirements

- Preserve existing repo conventions and canonical records.
- Keep the slice bounded to the named product outcome.
- Update docs only if implemented behavior changes.

## Acceptance Criteria

${stream.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}

## Validation

Run:

\`\`\`powershell
${stream.validation.join("\n")}
\`\`\`

## Final Response Requirements

Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
Also report skipped checks, assumptions, and follow-up dependencies when applicable.
`;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractJson(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("generator output was empty");
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return JSON.parse(fenced[1]);

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first)
    return JSON.parse(trimmed.slice(first, last + 1));

  throw new Error("could not find JSON object in generator output");
}

function trimStrings(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map((item) => trimStrings(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, trimStrings(item)])
    );
  }
  return value;
}

const generatedWaveSafeName = /^[a-z0-9][a-z0-9-]*$/;
const generatedWaveSafeBranch = /^stream\/[a-z0-9][a-z0-9-]*$/;
const generatedWaveSafeWorktree = /^C:\/FC-worktrees\/[a-z0-9][a-z0-9-]*$/;
const generatedWaveSecretPatterns = [
  /\.env/i,
  /secret/i,
  /service[_-]?role/i,
  /password/i,
  /token/i
];
const generatedWaveHighRiskTerms =
  /\b(add|create|change|modify|update|implement|apply|run)\s+(schema|migration|migrations|rls|auth|payment math|provider|webhook|env|route protection)\b/i;
const generatedWaveMetaStreamTerms =
  /\b(meta|debug|sandbox diagnostics?|blocked file writes?|docs reading|cleanup checks?|validation-only|tooling-only)\b|blocked-file-write|docs-read|cleanup-check/i;
const generatedWaveProductOutcomeTerms =
  /field|collections?|portal|e2e|fixture|reporting|operational|visibility|customer|project|schedule|crew|invoice|payment|communications?|daily|job|handoff|continuity/i;

const mandatoryPromptPhrases = {
  gitStart:
    "Start by checking git status, current branch, and ahead/behind state.",
  fetch: "Run git fetch origin.",
  avoidStaging: "Avoid staging unrelated changes.",
  diffCheck: "Run git diff --check.",
  stageOnly: "Stage only intended files.",
  commit: "Commit the completed slice.",
  finalResponse:
    "Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations."
};

function hasMandatoryPromptGuardrails(promptBody) {
  return [
    mandatoryPromptPhrases.gitStart,
    mandatoryPromptPhrases.fetch,
    mandatoryPromptPhrases.avoidStaging,
    mandatoryPromptPhrases.diffCheck,
    mandatoryPromptPhrases.stageOnly,
    mandatoryPromptPhrases.commit
  ].every((phrase) => promptBody.includes(phrase));
}

function hasMandatoryFinalResponse(promptBody) {
  return promptBody.includes(mandatoryPromptPhrases.finalResponse);
}

function buildMandatoryPromptGuardrailBlock(promptBody) {
  const heading = /## Required Git And Validation Workflow/i.test(promptBody)
    ? "## Runner-Injected Git And Validation Workflow"
    : "## Required Git And Validation Workflow";

  return `${heading}

- ${mandatoryPromptPhrases.gitStart}
- ${mandatoryPromptPhrases.fetch}
- ${mandatoryPromptPhrases.avoidStaging}
- ${mandatoryPromptPhrases.diffCheck}
- ${mandatoryPromptPhrases.stageOnly}
- ${mandatoryPromptPhrases.commit}

## Required Final Response

${mandatoryPromptPhrases.finalResponse}
`;
}

function isPromptBodyNormalizationEligible(candidate, stream, options = {}) {
  if (!candidate || typeof candidate !== "object") return false;
  if (!stream || typeof stream !== "object") return false;
  if (!generatedWaveSafeName.test(candidate.name || "")) return false;
  if (candidate.base !== "origin/main") return false;
  if (candidate.worktreeRoot !== "C:/FC-worktrees") return false;
  if (!Number.isInteger(candidate.maxConcurrency)) return false;
  if (!Array.isArray(candidate.productStrideCriteria)) return false;
  if (!Array.isArray(candidate.mainValidation)) return false;
  if (!Array.isArray(candidate.streams)) return false;

  if (!generatedWaveSafeName.test(stream.name || "")) return false;
  if (!generatedWaveSafeBranch.test(stream.branch || "")) return false;
  if (stream.branch !== `stream/${stream.name}`) return false;
  if (!generatedWaveSafeWorktree.test(stream.worktree || "")) return false;

  const expectedPromptFile = `.codex/waves/${candidate.name}/prompts/${stream.name}.md`;
  if (stream.promptFile !== expectedPromptFile) return false;
  if (!["low", "medium", "high"].includes(stream.risk)) return false;
  if (stream.risk === "high" && !options.allowHighRisk) return false;
  if (stream.risk === "blocked") return false;

  for (const field of ["productOutcome", "whyThisMatters", "promptBody"]) {
    if (typeof stream[field] !== "string" || stream[field].trim() === "") {
      return false;
    }
  }

  for (const field of [
    "dependsOn",
    "expectedFiles",
    "validation",
    "acceptanceCriteria",
    "boundaries"
  ]) {
    if (!Array.isArray(stream[field])) return false;
  }
  for (const field of [
    "expectedFiles",
    "validation",
    "acceptanceCriteria",
    "boundaries"
  ]) {
    if (stream[field].length === 0) return false;
  }

  if (
    generatedWaveMetaStreamTerms.test(
      `${stream.name} ${stream.productOutcome || ""}`
    )
  ) {
    return false;
  }
  if (
    !generatedWaveProductOutcomeTerms.test(
      `${stream.name || ""} ${stream.productOutcome || ""} ${
        stream.whyThisMatters || ""
      }`
    )
  ) {
    return false;
  }

  const joinedText = JSON.stringify(stream);
  const textWithoutProhibitions = joinedText.replace(
    /do not [^.!?\n]+[.!?]?/gi,
    ""
  );
  if (generatedWaveSecretPatterns.some((pattern) => pattern.test(joinedText))) {
    return false;
  }
  if (
    stream.risk !== "high" &&
    generatedWaveHighRiskTerms.test(textWithoutProhibitions)
  ) {
    return false;
  }

  return true;
}

function normalizeGeneratedWave(candidate, options = {}) {
  const normalized = trimStrings(candidate);
  if (!generatedWaveSafeName.test(normalized?.name || "")) return normalized;
  if (!Array.isArray(normalized.streams)) return normalized;

  for (const stream of normalized.streams) {
    if (!generatedWaveSafeName.test(stream?.name || "")) continue;
    stream.promptFile = `.codex/waves/${normalized.name}/prompts/${stream.name}.md`;
    if (
      isPromptBodyNormalizationEligible(normalized, stream, options) &&
      (!hasMandatoryPromptGuardrails(stream.promptBody) ||
        !hasMandatoryFinalResponse(stream.promptBody))
    ) {
      stream.promptBody =
        `${stream.promptBody.replace(/\s+$/g, "")}\n\n${buildMandatoryPromptGuardrailBlock(stream.promptBody)}`.trimEnd();
    }
  }

  return normalized;
}

function generatedWaveValidationError(errors) {
  const error = new Error(errors.join("\n"));
  error.validationErrors = errors;
  return error;
}

function validateGeneratedWave(candidate, options = {}) {
  candidate = normalizeGeneratedWave(candidate, options);
  const errors = [];

  const streamErrors = (stream, reason) => {
    errors.push(`stream ${stream?.name || "(unnamed)"} ${reason}`);
  };

  for (const field of [
    "name",
    "goal",
    "rationale",
    "base",
    "worktreeRoot",
    "maxConcurrency",
    "productStrideCriteria",
    "mainValidation",
    "streams"
  ]) {
    if (candidate[field] === undefined || candidate[field] === null) {
      errors.push(`missing required field: ${field}`);
    }
  }

  if (candidate.name && !generatedWaveSafeName.test(candidate.name)) {
    errors.push("name must be lowercase kebab-case");
  }
  if (!Number.isInteger(candidate.maxConcurrency)) {
    errors.push("maxConcurrency must be an integer");
  }

  const streams = Array.isArray(candidate.streams) ? candidate.streams : [];
  if (streams.length < 3 || streams.length > 5) {
    errors.push("streams must contain 3 to 5 streams");
  }

  const highRiskStreams = streams.filter((stream) => stream.risk === "high");
  const blockedStreams = streams.filter((stream) => stream.risk === "blocked");
  if (blockedStreams.length > 0) {
    errors.push(
      `blocked streams are refused: ${blockedStreams.map((stream) => stream.name).join(", ")}`
    );
  }
  if (highRiskStreams.length > 1) {
    errors.push("refusing more than one high-risk stream in one wave");
  }
  if (highRiskStreams.length > 0 && !options.allowHighRisk) {
    errors.push("high-risk generated streams require --allow-high-risk");
  }

  for (const stream of streams) {
    for (const field of [
      "name",
      "branch",
      "worktree",
      "promptFile",
      "risk",
      "productOutcome",
      "whyThisMatters",
      "dependsOn",
      "expectedFiles",
      "validation",
      "acceptanceCriteria",
      "boundaries",
      "promptBody"
    ]) {
      if (
        stream[field] === undefined ||
        stream[field] === null ||
        stream[field] === ""
      ) {
        streamErrors(stream, `missing ${field}`);
      }
    }

    if (stream.name && !generatedWaveSafeName.test(stream.name)) {
      streamErrors(stream, "name must be lowercase kebab-case");
    }
    if (
      generatedWaveMetaStreamTerms.test(
        `${stream.name} ${stream.productOutcome || ""}`
      )
    ) {
      streamErrors(
        stream,
        "must be a product-outcome stream, not meta/debug/blocked/docs/cleanup/sandbox work"
      );
    }
    if (stream.branch && !generatedWaveSafeBranch.test(stream.branch)) {
      streamErrors(stream, "branch must start with stream/ and use kebab-case");
    }
    if (
      stream.name &&
      stream.branch &&
      stream.branch !== `stream/${stream.name}`
    ) {
      streamErrors(stream, "branch must match stream/<stream-name>");
    }
    if (stream.worktree && !generatedWaveSafeWorktree.test(stream.worktree)) {
      streamErrors(
        stream,
        "worktree must be under C:/FC-worktrees/<kebab-case-name>"
      );
    }
    const expectedPromptPrefix = `.codex/waves/${candidate.name}/prompts/`;
    if (
      stream.promptFile &&
      !stream.promptFile.startsWith(expectedPromptPrefix)
    ) {
      streamErrors(stream, `promptFile must be inside ${expectedPromptPrefix}`);
    }
    if (
      stream.name &&
      stream.promptFile &&
      stream.promptFile !== `${expectedPromptPrefix}${stream.name}.md`
    ) {
      streamErrors(
        stream,
        `promptFile must be ${expectedPromptPrefix}${stream.name}.md`
      );
    }
    if (!["low", "medium", "high", "blocked"].includes(stream.risk)) {
      streamErrors(stream, `has invalid risk ${stream.risk}`);
    }
    if (!["low", "medium"].includes(stream.risk) && !options.allowHighRisk) {
      streamErrors(
        stream,
        "risk must be low or medium unless --allow-high-risk"
      );
    }
    if (
      !generatedWaveProductOutcomeTerms.test(
        `${stream.name || ""} ${stream.productOutcome || ""} ${
          stream.whyThisMatters || ""
        }`
      )
    ) {
      streamErrors(
        stream,
        "must materially advance a FloorConnector operational product area"
      );
    }

    const joinedText = JSON.stringify(stream);
    const textWithoutProhibitions = joinedText.replace(
      /do not [^.!?\n]+[.!?]?/gi,
      ""
    );
    if (
      generatedWaveSecretPatterns.some((pattern) => pattern.test(joinedText))
    ) {
      streamErrors(
        stream,
        "references env files, secrets, tokens, or credentials"
      );
    }
    if (
      stream.risk !== "high" &&
      generatedWaveHighRiskTerms.test(textWithoutProhibitions)
    ) {
      streamErrors(stream, "references high-risk work but is not high risk");
    }
    if (!Array.isArray(stream.validation) || stream.validation.length === 0) {
      streamErrors(stream, "must include validation commands");
    }
    if (
      !Array.isArray(stream.acceptanceCriteria) ||
      stream.acceptanceCriteria.length === 0
    ) {
      streamErrors(stream, "must include acceptance criteria");
    }
    const promptBody = stream.promptBody || "";
    if (!/Chat:/i.test(promptBody)) {
      streamErrors(stream, "promptBody must include Chat: <stream title>");
    }
    if (!promptBody.includes(mandatoryPromptPhrases.gitStart)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.gitStart}`
      );
    }
    if (!promptBody.includes(mandatoryPromptPhrases.fetch)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.fetch}`
      );
    }
    if (!promptBody.includes(mandatoryPromptPhrases.avoidStaging)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.avoidStaging}`
      );
    }
    if (!promptBody.includes(mandatoryPromptPhrases.diffCheck)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.diffCheck}`
      );
    }
    if (!promptBody.includes(mandatoryPromptPhrases.stageOnly)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.stageOnly}`
      );
    }
    if (!promptBody.includes(mandatoryPromptPhrases.commit)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.commit}`
      );
    }
    if (!promptBody.includes(mandatoryPromptPhrases.finalResponse)) {
      streamErrors(
        stream,
        `promptBody must include exact phrase: ${mandatoryPromptPhrases.finalResponse}`
      );
    }
  }

  if (errors.length > 0) {
    throw generatedWaveValidationError(errors);
  }

  return candidate;
}

function writeGeneratedWave(candidate, currentWaveDir, generationMode) {
  const nextWaveDir = join(codexWavesRoot, candidate.name);
  const promptsDir = join(nextWaveDir, "prompts");
  mkdirSync(promptsDir, { recursive: true });

  const manifest = {
    state: "proposed",
    name: candidate.name,
    goal: candidate.goal,
    rationale: candidate.rationale,
    base: candidate.base,
    worktreeRoot: candidate.worktreeRoot,
    maxConcurrency: candidate.maxConcurrency,
    mainValidation: candidate.mainValidation,
    productStrideCriteria: candidate.productStrideCriteria,
    streams: candidate.streams.map((stream) => ({
      name: stream.name,
      branch: stream.branch,
      worktree: stream.worktree,
      prompt: stream.promptFile,
      risk: stream.risk,
      productOutcome: stream.productOutcome,
      expectedFiles: stream.expectedFiles,
      validation: stream.validation
    }))
  };

  saveManifest(nextWaveDir, manifest);
  for (const stream of candidate.streams) {
    writeFileSync(resolveRepoPath(stream.promptFile), stream.promptBody);
  }

  const proposed = `# Proposed Wave

Status: Proposed
Source: ${generationMode}
Generated: ${new Date().toISOString()}

This wave is not active. Review \`wave.json\` and prompts, then activate with:

\`\`\`powershell
pnpm fc:wave:approve --wave ${candidate.name} --proposal
\`\`\`

Do not run, merge, or push it before human review.
`;
  writeFileSync(join(nextWaveDir, "PROPOSED.md"), proposed);

  const reviewPath = join(currentWaveDir, "ai-next-wave-review.md");
  const review = `# AI Next Wave Review

Status: ${generationMode === "generator_command" ? "Generated" : "Manual Or Template Fallback"}
Generated: ${new Date().toISOString()}

## Proposed Wave

- Name: ${candidate.name}
- Goal: ${candidate.goal}
- Mode: ${generationMode}
- State: proposed

## Rationale

${candidate.rationale}

## Streams

${candidate.streams
  .map(
    (stream) => `- ${stream.name} (${stream.risk}): ${stream.productOutcome}
  - Why: ${stream.whyThisMatters}`
  )
  .join("\n")}

## Human Review Required

This wave is not approved and was not run. Review the manifest and prompts before activation.

Next command:

\`\`\`powershell
pnpm fc:wave:approve --wave ${candidate.name} --proposal
\`\`\`
`;
  writeFileSync(reviewPath, review);

  return { nextWaveDir, reviewPath };
}

function generatorSandboxFailure(text) {
  return /windows sandbox/i.test(text) && /spawn setup refresh/i.test(text);
}

function writeGenerationAttemptStatus(attemptDir, failure) {
  const failurePath = join(attemptDir, "generation-status.json");
  writeJsonFile(failurePath, failure);
  return failurePath;
}

function formatInvalidProposalFailure(error, attemptDir) {
  const reasons = Array.isArray(error.validationErrors)
    ? error.validationErrors
    : error.message.split(/\r?\n/).filter(Boolean);
  return [
    "AI generated an invalid wave proposal.",
    ...reasons.map((reason) => `- ${reason}`),
    `Scratch attempt: ${attemptDir}`
  ].join("\n");
}

function generateWave(manifest, waveDir, options) {
  requireCleanMain();
  git(["fetch", "origin"]);
  validateManifestShape(manifest, { allowHighRisk: true });

  const status = loadStatus(waveDir);
  const schemaPath = ensureNextWaveSchema();
  const attemptDir = createGenerationAttemptDir(waveDir);
  const contextPath = buildGeneratorContext(
    manifest,
    waveDir,
    status,
    attemptDir
  );
  const outputPath = join(attemptDir, "generated-next-wave.json");
  const promptPath = buildGeneratorPrompt(
    manifest,
    attemptDir,
    contextPath,
    schemaPath,
    outputPath
  );
  const generatorCommand = process.env.FLOORCONNECTOR_WAVE_GENERATOR_COMMAND;

  let candidate;
  let generationMode = "template_fallback";
  let commandResult = null;

  if (generatorCommand) {
    generationMode = "generator_command";
    const nextWavePlaceholder = `${manifest.name}-next`;
    const command = generatorCommandFromTemplate(generatorCommand, {
      repo: repoRoot,
      wave: manifest.name,
      currentWave: manifest.name,
      nextWave: nextWavePlaceholder,
      generatorPromptFile: promptPath,
      contextFile: contextPath,
      schemaFile: schemaPath,
      outputFile: outputPath
    });
    commandResult = runProcess(command, { cwd: repoRoot });
    writeFileSync(join(attemptDir, "stdout.txt"), commandResult.stdout);
    writeFileSync(join(attemptDir, "stderr.txt"), commandResult.stderr);
    const raw = existsSync(outputPath)
      ? readFileSync(outputPath, "utf8")
      : `${commandResult.stdout}\n${commandResult.stderr}`;
    writeFileSync(join(attemptDir, "generated-next-wave.raw.txt"), raw);

    if (
      commandResult.status !== 0 &&
      generatorSandboxFailure(
        `${commandResult.stdout}\n${commandResult.stderr}`
      )
    ) {
      const failure = {
        generatedAt: new Date().toISOString(),
        mode: generationMode,
        status: "failed",
        classification:
          "Codex Windows sandbox failed before repo commands could run.",
        command,
        exitCode: commandResult.status,
        stdoutPath: join(attemptDir, "stdout.txt"),
        stderrPath: join(attemptDir, "stderr.txt"),
        contextPath,
        promptPath,
        schemaPath,
        outputPath,
        scratchPath: attemptDir
      };
      writeGenerationAttemptStatus(attemptDir, failure);
      throw new Error(
        `Codex Windows sandbox failed before repo commands could run.\nScratch attempt: ${attemptDir}`
      );
    }

    try {
      candidate = extractJson(raw);
      writeJsonFile(join(attemptDir, "generated-next-wave.json"), candidate);
    } catch (error) {
      const failure = {
        generatedAt: new Date().toISOString(),
        mode: generationMode,
        status: "failed",
        error: error.message,
        command,
        exitCode: commandResult.status,
        stdout: commandResult.stdout.slice(-4000),
        stderr: commandResult.stderr.slice(-4000),
        contextPath,
        promptPath,
        schemaPath,
        outputPath,
        scratchPath: attemptDir
      };
      writeGenerationAttemptStatus(attemptDir, failure);
      throw new Error(
        `Generator output parsing failed. Scratch attempt: ${attemptDir}`
      );
    }
  } else {
    generationMode = "template_fallback";
    candidate = defaultGeneratedWave(manifest);
    writeJsonFile(join(attemptDir, "generated-next-wave.json"), candidate);
  }

  try {
    candidate = validateGeneratedWave(candidate, options);
    writeJsonFile(join(attemptDir, "generated-next-wave.json"), candidate);
  } catch (error) {
    const failure = {
      generatedAt: new Date().toISOString(),
      mode: generationMode,
      status: "failed",
      classification: "AI generated an invalid wave proposal.",
      errors: Array.isArray(error.validationErrors)
        ? error.validationErrors
        : error.message.split(/\r?\n/).filter(Boolean),
      commandExitCode: commandResult?.status ?? null,
      contextPath,
      promptPath,
      schemaPath,
      outputPath,
      scratchPath: attemptDir
    };
    writeGenerationAttemptStatus(attemptDir, failure);
    throw new Error(formatInvalidProposalFailure(error, attemptDir));
  }

  const trackedContextPath = join(waveDir, "generator-context.md");
  const trackedPromptPath = join(waveDir, "generate-next-wave.prompt.md");
  writeFileSync(trackedContextPath, readFileSync(contextPath, "utf8"));
  writeFileSync(trackedPromptPath, readFileSync(promptPath, "utf8"));

  const { nextWaveDir, reviewPath } = writeGeneratedWave(
    candidate,
    waveDir,
    generationMode
  );

  const generationStatus = {
    generatedAt: new Date().toISOString(),
    mode: generatorCommand ? "generator_command" : "template_fallback",
    status: generatorCommand ? "generated" : "manual_ai_required",
    proposedWave: candidate.name,
    proposedWaveDir: nextWaveDir,
    reviewPath,
    contextPath: trackedContextPath,
    promptPath: trackedPromptPath,
    schemaPath,
    outputPath,
    scratchPath: attemptDir,
    validationStatus: "passed",
    commandExitCode: commandResult?.status ?? null
  };

  writeJsonFile(join(waveDir, "generation-status.json"), generationStatus);
  status.generation = generationStatus;
  saveStatus(waveDir, status);
  return generationStatus;
}

function reportWave(manifest, waveDir) {
  validateManifestShape(manifest, { allowHighRisk: true });
  const status = loadStatus(waveDir);
  status.wave = manifest.name;
  status.goal = manifest.goal;
  status.base = manifest.base;
  status.baseCommit =
    tryGit(["rev-parse", manifest.base]) || status.baseCommit || "";

  const nextProposalPath = generateNextWaveProposal(manifest, waveDir, status);
  status.nextWaveProposalPath = nextProposalPath;
  const stride = productStrideReview(manifest, status);
  status.productStrideReview = stride;

  const streamRows = manifest.streams
    .map((stream) => {
      const streamStatus = status.streams[stream.name] || {};
      return `| ${stream.name} | ${stream.risk} | ${streamStatus.status || "unknown"} | ${streamStatus.validation?.status || "not_run"} | ${streamStatus.mergeCheck?.status || "not_run"} | ${streamStatus.latestCommit ? streamStatus.latestCommit.slice(0, 12) : ""} |`;
    })
    .join("\n");

  const validationSections = manifest.streams
    .map((stream) => {
      const streamStatus = status.streams[stream.name] || {};
      const validation = streamStatus.validation;
      const changedFiles = streamStatus.changedFiles || [];
      const commits =
        stream.worktree && existsSync(stream.worktree)
          ? tryGit(["log", "--oneline", `${manifest.base}..HEAD`], {
              cwd: stream.worktree
            }) || "(none)"
          : "(worktree missing)";

      return `### ${stream.name}

- Branch: ${stream.branch}
- Worktree: ${stream.worktree}
- Product outcome: ${stream.productOutcome}
- Status: ${streamStatus.status || "unknown"}
- Latest commit: ${streamStatus.latestCommit || ""}
- Validation: ${validation?.status || "not_run"}
- Merge check: ${streamStatus.mergeCheck?.status || "not_run"}

Commits:

\`\`\`text
${commits}
\`\`\`

Changed files:

${changedFiles.length > 0 ? changedFiles.map((file) => `- ${file}`).join("\n") : "- (none recorded)"}

Validation results:

${formatValidation(validation)}
`;
    })
    .join("\n");

  const strideRows = stride
    .map(
      (item) =>
        `| ${item.stream} | ${item.productImpact} | ${item.userVisibleImprovement} | ${item.canonicalWorkflowAlignment} | ${item.operationalValue} | ${item.riskLevel} | ${item.recommendedAction} |`
    )
    .join("\n");

  const mergeRecommendation = stride.some((item) =>
    ["revise", "reject", "needs human review"].includes(item.recommendedAction)
  )
    ? "Human review required before approval. Do not merge until validation and product-stride concerns are resolved."
    : "Streams are eligible for human approval if the diff review confirms scope and product value.";
  const generation = status.generation;
  const generationSection = generation
    ? `- Status: ${generation.status}
- Mode: ${generation.mode}
- Proposed wave: ${generation.proposedWave || "(none)"}
- Review: ${generation.reviewPath || "(none)"}
- Schema validation: ${generation.validationStatus || "not_run"}

Next proposed-wave command:

\`\`\`powershell
pnpm fc:wave:approve --wave ${generation.proposedWave} --proposal
pnpm fc:wave:prepare --wave ${generation.proposedWave}
\`\`\``
    : "- AI next-wave generation has not run. Run `pnpm fc:wave:generate --wave " +
      manifest.name +
      "`.";

  const report = `# Agent Wave Run Report

Wave: ${manifest.name}
Generated: ${new Date().toISOString()}
Base: ${manifest.base}
Base commit: ${status.baseCommit || ""}

## Goal

${manifest.goal}

## Stream Summary

| Stream | Risk | Status | Validation | Merge check | Latest commit |
| --- | --- | --- | --- | --- | --- |
${streamRows}

## Per-Stream Status

${validationSections}

## Dry Merge Results

${
  status.mergeCheck
    ? `- Status: ${status.mergeCheck.status}
- Scratch branch: ${status.mergeCheck.scratchBranch}
- Scratch worktree: ${status.mergeCheck.scratchWorktree}`
    : "- Not run"
}

## Product Stride Review

| Stream | Product impact | User-visible improvement | Canonical workflow alignment | Operational value | Risk level | Recommended action |
| --- | --- | --- | --- | --- | --- | --- |
${strideRows}

## Next Prompt Proposals

- ${nextProposalPath}

## AI Next-Wave Generation

${generationSection}

## Merge Recommendation

${mergeRecommendation}

## Approval Checklist

- Review every stream diff against its prompt and expected files.
- Confirm no schema, migration, auth, RLS, payment math, provider, env, or route-protection change slipped in.
- Confirm validation results are acceptable.
- Confirm dry merge checks are acceptable.
- Confirm next-wave prompts are present.
- Run \`pnpm fc:wave:approve --wave ${manifest.name}\` only after human approval.

## Exact Commands To Run Next

\`\`\`powershell
pnpm fc:wave:status --wave ${manifest.name}
pnpm fc:wave:approve --wave ${manifest.name}
pnpm fc:wave:merge --wave ${manifest.name} --approved
# Optional after explicit approval:
pnpm fc:wave:merge --wave ${manifest.name} --approved --push
\`\`\`
`;

  writeFileSync(join(waveDir, reportFileName), report);
  saveStatus(waveDir, status);
  return status;
}

function formatValidation(validation) {
  if (!validation) return "- Not run";
  if (!Array.isArray(validation.results) || validation.results.length === 0) {
    return `- ${validation.status}${validation.reason ? `: ${validation.reason}` : ""}`;
  }

  return validation.results
    .map(
      (result) =>
        `- \`${result.command}\`: ${result.exitCode === 0 ? "passed" : `failed (${result.exitCode})`}`
    )
    .join("\n");
}

function approveWave(manifest, waveDir, options) {
  if (options.proposal) {
    if (manifest.state !== "proposed") {
      throw new Error(
        `Refusing proposal approval: wave ${manifest.name} is not marked proposed.`
      );
    }
    manifest.state = "active";
    manifest.activatedAt = new Date().toISOString();
    saveManifest(waveDir, manifest);
    const proposalApproval = {
      proposalApproved: true,
      activatedAt: manifest.activatedAt,
      wave: manifest.name
    };
    writeFileSync(
      join(waveDir, "proposal-approved.json"),
      `${JSON.stringify(proposalApproval, null, 2)}\n`
    );
    const status = loadStatus(waveDir);
    status.proposalApproval = proposalApproval;
    saveStatus(waveDir, status);
    return status;
  }

  requireActiveManifest(manifest, "approve");
  const status = loadStatus(waveDir);
  const failed = Object.values(status.streams || {}).filter(
    (stream) => stream.validation?.status === "failed"
  );
  if (failed.length > 0 && !options.force) {
    throw new Error(
      "Refusing approval: one or more stream validations failed. Use --force to override."
    );
  }

  const approvedStreams = manifest.streams
    .filter(
      (stream) => status.streams?.[stream.name]?.mergeCheck?.status !== "failed"
    )
    .map((stream) => stream.name);

  const approval = {
    approved: true,
    pushApproved: Boolean(options.push),
    approvedAt: new Date().toISOString(),
    approvedStreams,
    force: Boolean(options.force)
  };

  writeFileSync(
    join(waveDir, "approved.json"),
    `${JSON.stringify(approval, null, 2)}\n`
  );
  status.approval = approval;
  saveStatus(waveDir, status);
  return status;
}

function mergeWave(manifest, waveDir, options) {
  requireActiveManifest(manifest, "merge");
  if (!options.approved) {
    throw new Error("Refusing merge without --approved.");
  }
  if (options.push && !options.approved) {
    throw new Error("Refusing push without --approved.");
  }

  const approvalPath = join(waveDir, "approved.json");
  if (!existsSync(approvalPath)) {
    throw new Error(`Refusing merge: missing ${approvalPath}`);
  }

  const approval = JSON.parse(readFileSync(approvalPath, "utf8"));
  if (!approval.approved) {
    throw new Error(
      "Refusing merge: approved.json does not mark the wave approved."
    );
  }
  if (options.push && !approval.pushApproved) {
    throw new Error(
      "Refusing push: approved.json was not created with push approval."
    );
  }

  requireCleanMain();
  requireMainUpToDate();

  const status = loadStatus(waveDir);
  const approvedStreams = new Set(approval.approvedStreams || []);

  for (const stream of manifest.streams) {
    if (!approvedStreams.has(stream.name)) continue;
    spawnGitOrThrow([
      "merge",
      "--no-ff",
      stream.branch,
      "-m",
      `Merge ${stream.name} wave stream`
    ]);
    updateStreamStatus(status, stream.name, {
      mergedAt: new Date().toISOString(),
      mergeTarget: "main"
    });
  }

  const mainValidation = Array.isArray(manifest.mainValidation)
    ? manifest.mainValidation
    : [];
  const results = [];
  let ok = true;
  for (const command of mainValidation) {
    const result = runProcess(command, { cwd: repoRoot, inherit: true });
    results.push({ command, exitCode: result.status });
    if (result.status !== 0) {
      ok = false;
      break;
    }
  }

  status.mainValidation = { status: ok ? "passed" : "failed", results };
  saveStatus(waveDir, status);

  if (!ok) {
    throw new Error("Stopping after main validation failure.");
  }

  if (options.push) {
    spawnGitOrThrow(["push", "origin", "main"]);
    status.pushedAt = new Date().toISOString();
    saveStatus(waveDir, status);
  }

  return status;
}

function printStatus(manifest, waveDir) {
  validateManifestShape(manifest, { allowHighRisk: true });
  const status = loadStatus(waveDir);
  console.log(`Wave: ${manifest.name}`);
  console.log(`Goal: ${manifest.goal}`);
  console.log(`Base: ${manifest.base}`);
  console.log(
    `Approval: ${status.approval?.approved ? "approved" : "not approved"}`
  );
  console.log("");
  for (const stream of manifest.streams) {
    const streamStatus = status.streams?.[stream.name] || {};
    console.log(`- ${stream.name}`);
    console.log(`  branch: ${stream.branch}`);
    console.log(`  worktree: ${stream.worktree}`);
    console.log(`  prompt: ${stream.prompt}`);
    console.log(`  risk: ${stream.risk}`);
    console.log(`  status: ${streamStatus.status || "not_prepared"}`);
    console.log(
      `  validation: ${streamStatus.validation?.status || "not_run"}`
    );
    console.log(
      `  merge-check: ${streamStatus.mergeCheck?.status || "not_run"}`
    );
    if (streamStatus.manualCommand) {
      console.log(`  manual-agent: ${streamStatus.manualCommand}`);
    }
  }
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const { manifest, waveDir } = loadManifest(options.wave);
    if (manifest.name !== options.wave) {
      throw new Error(
        `Manifest name ${manifest.name} does not match --wave ${options.wave}`
      );
    }

    switch (options.command) {
      case "prepare":
        prepareWave(manifest, waveDir, options);
        break;
      case "status":
        printStatus(manifest, waveDir);
        break;
      case "validate":
        validateWave(manifest, waveDir);
        break;
      case "merge-check":
        mergeCheckWave(manifest, waveDir);
        break;
      case "report":
        reportWave(manifest, waveDir);
        break;
      case "generate":
        generateWave(manifest, waveDir, options);
        break;
      case "approve":
        approveWave(manifest, waveDir, options);
        break;
      case "merge":
        mergeWave(manifest, waveDir, options);
        break;
      case "run":
        requireActiveManifest(manifest, "run");
        prepareWave(manifest, waveDir, options);
        runAgentsIfConfigured(manifest, waveDir, options);
        validateWave(manifest, waveDir);
        mergeCheckWave(manifest, waveDir);
        reportWave(manifest, waveDir);
        break;
      default:
        throw new Error(`Unhandled command: ${options.command}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
