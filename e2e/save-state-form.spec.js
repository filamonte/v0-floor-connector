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
  const fixtureDir = path.join(repoRoot, ".playwright-tmp", "save-state-form");
  const entryPath = path.join(fixtureDir, "fixture.tsx");
  const bundlePath = path.join(fixtureDir, "bundle.js");

  await fs.mkdir(fixtureDir, { recursive: true });
  await fs.writeFile(
    entryPath,
    `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import {
        SaveStateForm,
        SaveStateSubmitButton
      } from "../../apps/web/components/save-feedback/save-state-form";

      declare global {
        interface Window {
          resolveSave?: () => void;
          rejectSave?: () => void;
          submitCount?: number;
        }
      }

      function SaveStateFixture() {
        async function action() {
          window.submitCount = (window.submitCount ?? 0) + 1;

          await new Promise<void>((resolve, reject) => {
            window.resolveSave = resolve;
            window.rejectSave = () => reject(new Error("Intentional save failure"));
          });
        }

        return (
          <>
            <SaveStateForm action={action} pendingLabel="Saving..." className="fixture-form">
              <label>
                Tracked value
                <input name="trackedValue" defaultValue="baseline" aria-label="Tracked value" />
              </label>
              <SaveStateSubmitButton submitLabel="Save" pendingLabel="Saving..." />
            </SaveStateForm>
            <SaveStateForm
              action={action}
              enabled={false}
              resetOnSuccess
              pendingLabel="Logging..."
              aria-label="Create note"
              className="create-fixture-form"
            >
              <label>
                Create note body
                <textarea name="body" aria-label="Create note body" />
              </label>
              <SaveStateSubmitButton submitLabel="Log note" pendingLabel="Logging..." />
            </SaveStateForm>
          </>
        );
      }

      createRoot(document.getElementById("root")!).render(<SaveStateFixture />);
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
    ],
    alias: {
      "@": path.join(repoRoot, "apps", "web")
    }
  });

  const bundle = await fs.readFile(bundlePath, "utf8");
  server = http.createServer((request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`
      <!doctype html>
      <html>
        <head>
          <title>SaveStateForm fixture</title>
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

test("tracks saved, dirty, reverted, saving, success, and failure states", async ({ page }) => {
  page.on("pageerror", (error) => {
    if (!error.message.includes("Intentional save failure")) {
      throw error;
    }
  });

  await page.goto(fixtureUrl);

  const input = page.getByLabel("Tracked value");
  const saveButton = page.getByRole("button", { name: "Save" });

  await expect(saveButton).toHaveText("Saved");
  await expect(saveButton).toBeDisabled();

  await input.fill("edited");
  await expect(saveButton).toHaveText("Save");
  await expect(saveButton).toBeEnabled();

  await input.fill("baseline");
  await expect(saveButton).toHaveText("Saved");
  await expect(saveButton).toBeDisabled();

  await input.fill("persisted");
  await saveButton.click();
  await expect(saveButton).toHaveText("Saving...");
  await expect(saveButton).toBeDisabled();

  await page.evaluate(() => window.resolveSave?.());
  await expect(saveButton).toHaveText("Saved");
  await expect(saveButton).toBeDisabled();

  await input.fill("baseline");
  await expect(saveButton).toHaveText("Save");
  await input.fill("persisted");
  await expect(saveButton).toHaveText("Saved");

  await input.fill("failed edit");
  await saveButton.click();
  await expect(saveButton).toHaveText("Saving...");

  await page.evaluate(() => window.rejectSave?.());
  await expect(saveButton).toHaveText("Save");
  await expect(saveButton).toBeEnabled();
});

test("resets create-style forms after a successful save and shows completion feedback", async ({ page }) => {
  await page.goto(fixtureUrl);

  const form = page.getByRole("form", { name: "Create note" });
  const noteBody = form.getByLabel("Create note body");
  const submitButton = form.getByRole("button", { name: "Log note" });

  await noteBody.fill("This note should clear after save.");
  await submitButton.click();
  await expect(submitButton).toHaveText("Logging...");

  await page.evaluate(() => window.resolveSave?.());

  await expect(noteBody).toHaveValue("");
  await expect(submitButton).toHaveText("Saved");
});
