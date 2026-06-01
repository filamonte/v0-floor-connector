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
  approve      Create approved.json after successful review
  merge        Merge approved streams into main

Options:
  --wave <name>
  --allow-high-risk
  --resume
  --force
  --approved
  --push`);
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
      ["allow-high-risk", "resume", "force", "approved", "push"].includes(name)
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
      case "approve":
        approveWave(manifest, waveDir, options);
        break;
      case "merge":
        mergeWave(manifest, waveDir, options);
        break;
      case "run":
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
