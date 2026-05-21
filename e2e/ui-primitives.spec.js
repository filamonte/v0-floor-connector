const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "..");
const esbuild = require(path.join(
  repoRoot,
  "node_modules",
  ".pnpm",
  "node_modules",
  "esbuild"
));

let server;
let fixtureUrl;

test.beforeAll(async () => {
  const fixtureDir = path.join(repoRoot, ".playwright-tmp", "ui-primitives");
  const entryPath = path.join(fixtureDir, "fixture.tsx");
  const bundlePath = path.join(fixtureDir, "bundle.js");

  await fs.mkdir(fixtureDir, { recursive: true });
  await fs.writeFile(
    entryPath,
    `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import {
        ActionBar,
        ProjectStateSummary,
        WorkflowBar
      } from "../../packages/ui/src";

      function DecisionFirstFixture() {
        return (
          <main>
            <ActionBar
              title="Schedule this job before crews arrive"
              description="The job can move forward once the schedule and crew are confirmed."
              statusLabel="Needs action"
              statusTone="warning"
              nextActionLabel="Schedule next"
              primaryAction={<button type="button">Schedule job</button>}
              secondaryActions={<a href="#project">Open project</a>}
              meta={<span>Project 24 Investor Way</span>}
            />

            <ActionBar
              title="Billing is blocked"
              statusLabel="Blocked"
              statusTone="danger"
              nextActionLabel="Resolve prerequisite"
            />

            <WorkflowBar
              title="Estimate to payment workflow"
              steps={[
                {
                  id: "estimate",
                  label: "Estimate",
                  description: "Approved",
                  state: "complete"
                },
                {
                  id: "contract",
                  label: "Contract",
                  description: "Awaiting signature",
                  state: "current"
                },
                {
                  id: "job",
                  label: "Job",
                  description: "Blocked until signed",
                  state: "blocked"
                },
                {
                  id: "invoice",
                  label: "Invoice",
                  description: "Upcoming",
                  state: "upcoming"
                }
              ]}
            />

            <ProjectStateSummary
              title="Execution state summary"
              items={[
                {
                  id: "schedule",
                  label: "Schedule",
                  value: "Needs date",
                  detail: "No appointment scheduled",
                  tone: "needsAction"
                },
                {
                  id: "crew",
                  label: "Crew",
                  value: "Assigned",
                  detail: "Vendor crew ready",
                  tone: "complete"
                },
                {
                  id: "status",
                  label: "Status",
                  value: "Blocked",
                  detail: "Waiting on prerequisite",
                  tone: "blocked"
                },
                {
                  id: "project",
                  label: "Project",
                  value: "Active",
                  detail: "24 Investor Way",
                  tone: "active"
                }
              ]}
            />
          </main>
        );
      }

      createRoot(document.getElementById("root")!).render(<DecisionFirstFixture />);
    `,
    "utf8"
  );

  await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    outfile: bundlePath,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    absWorkingDir: repoRoot,
    plugins: [
      {
        name: "web-package-resolution",
        setup(build) {
          build.onResolve({ filter: /^react($|\/)|^react-dom($|\/)/ }, (args) => ({
            path: require.resolve(args.path, {
              paths: [path.join(repoRoot, "apps", "web")]
            })
          }));
        }
      }
    ]
  });

  const bundle = await fs.readFile(bundlePath, "utf8");
  server = http.createServer((request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`
      <!doctype html>
      <html>
        <head>
          <title>Decision-first UI primitives fixture</title>
        </head>
        <body>
          <div id="root"></div>
          <script>${bundle}</script>
        </body>
      </html>
    `);
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  fixtureUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("renders ActionBar states, WorkflowBar states, and ProjectStateSummary", async ({
  page
}) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(fixtureUrl);

  const actionRegions = page.getByRole("region", { name: "Current state and next action" });
  await expect(actionRegions).toHaveCount(2);
  await expect(actionRegions.first()).toContainText("Needs action");
  await expect(actionRegions.first()).toContainText("Schedule next");
  await expect(actionRegions.first().getByRole("button", { name: "Schedule job" })).toBeVisible();
  await expect(actionRegions.nth(1)).toContainText("Blocked");
  await expect(actionRegions.nth(1)).toContainText("Resolve prerequisite");

  const workflow = page.getByRole("region", { name: "Estimate to payment workflow" });
  await expect(workflow).toBeVisible();
  await expect(workflow).toContainText("Approved");
  await expect(workflow).toContainText("Awaiting signature");
  await expect(workflow).toContainText("Blocked until signed");
  await expect(workflow).toContainText("Upcoming");

  const summary = page.getByRole("region", { name: "Execution state summary" });
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("Schedule");
  await expect(summary).toContainText("Needs date");
  await expect(summary).toContainText("Crew");
  await expect(summary).toContainText("Assigned");
  await expect(summary).toContainText("24 Investor Way");

  expect(consoleErrors).toEqual([]);
});
