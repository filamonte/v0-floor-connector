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
  const fixtureDir = path.join(repoRoot, ".playwright-tmp", "estimate-files-section");
  const entryPath = path.join(fixtureDir, "fixture.tsx");
  const bundlePath = path.join(fixtureDir, "bundle.js");

  await fs.mkdir(fixtureDir, { recursive: true });
  await fs.writeFile(
    entryPath,
    `
      import React, { useState } from "react";
      import { createRoot } from "react-dom/client";
      import { FilesSection } from "../../apps/web/components/estimates/files-section";

      type PendingAttachment = {
        id: string;
        file: File;
      };

      function FilesSectionFixture() {
        const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

        return (
          <FilesSection
            existingAttachments={[]}
            retainedAttachmentIds={[]}
            pendingAttachments={pendingAttachments}
            onAddFiles={(files) =>
              setPendingAttachments((current) => [
                ...current,
                ...files.map((file, index) => ({
                  id: \`\${file.name}-\${file.size}-\${file.lastModified}-\${index}\`,
                  file
                }))
              ])
            }
            onRemoveExistingAttachment={() => {}}
            onRemovePendingAttachment={(id) =>
              setPendingAttachments((current) =>
                current.filter((attachment) => attachment.id !== id)
              )
            }
          />
        );
      }

      createRoot(document.getElementById("root")!).render(<FilesSectionFixture />);
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
          build.onResolve({ filter: /^react($|\/)|^react-dom($|\/)|^lucide-react$/ }, (args) => ({
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
          <title>Estimate files fixture</title>
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

test("keeps duplicate selected estimate files from rendering twice", async ({ page }) => {
  await page.goto(fixtureUrl);

  const fileInput = page.locator('input[name="newAttachments"]');
  const filePayload = {
    name: "progress-photo.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-image")
  };

  await fileInput.setInputFiles(filePayload);
  await expect(page.getByText("1 ready to attach")).toBeVisible();
  await expect(page.getByText("Ready to save")).toHaveCount(1);

  await fileInput.setInputFiles(filePayload);
  await expect(page.getByText("1 ready to attach")).toBeVisible();
  await expect(page.getByText("Ready to save")).toHaveCount(1);
});
