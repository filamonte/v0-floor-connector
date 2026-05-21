# Local Image `nstaller` Error Diagnostic Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Identify why Codex attempted to read a local image from `nstaller` and either correct the caller-provided path or add a narrow guard where FloorConnector owns image path handling.

**Architecture:** Start by proving whether the error originates inside FloorConnector or from the Codex attachment invocation. If the repo owns the faulty path, add validation at the narrowest existing image/file boundary without changing persistence, auth, tenancy, or database schema. If the repo does not own it, document the correct operator action and do not modify app code.

**Tech Stack:** pnpm 9.12.3, Next.js app in `apps/web`, TypeScript, Playwright where UI verification is needed, existing Supabase-backed data boundaries.

---

## Initial Findings

- `rg -n "nstaller|installer|local image|image" .` found no `nstaller` reference in application code.
- Existing image/file surfaces include:
  - `apps/web/components/catalog-manager/inventory-item-drawer.tsx`
  - `apps/web/components/estimates/files-section.tsx`
  - `apps/web/components/execution-attachment-form.tsx`
  - `apps/web/components/opportunity-form.tsx`
  - `apps/web/components/ui/signature-pad.tsx`
  - `apps/web/app/api/estimates/track/open/route.ts`
- The exact message, `Codex could not read the local image at \`nstaller\`: The system cannot find the file specified. (os error 2)`, looks like a local attachment path passed to Codex, not a Next.js runtime error.

## File Structure

No code file should be changed unless Task 2 proves FloorConnector owns the bad path.

Expected documentation-only file:
- Create: `docs/superpowers/plans/2026-05-16-local-image-nstaller-error.md`

Conditional code files if the bug is found in FloorConnector image/file handling:
- Modify: `apps/web/components/catalog-manager/inventory-item-drawer.tsx`
  - Responsibility: browser-side file selection and upload presentation for catalog inventory images.
- Modify: `apps/web/components/estimates/files-section.tsx`
  - Responsibility: display existing estimate file attachments and identify image previews.
- Modify: `apps/web/lib/execution-attachments/schemas.ts`
  - Responsibility: validate execution attachment metadata at server boundaries.
- Test: nearest existing unit or e2e test that covers the identified component or action.

## Task 1: Reproduce and Classify the Error

**Files:**
- Inspect: `AGENTS.md`
- Inspect: `package.json`
- Inspect: files surfaced by `rg -n "nstaller|installer|local image|image" .`

- [ ] **Step 1: Confirm the current workspace**

Run:

```powershell
Get-Location
```

Expected: `C:\FloorConnector`

- [ ] **Step 2: Confirm no app-owned `nstaller` reference exists**

Run:

```powershell
rg -n "nstaller|installer" .
```

Expected: no `nstaller` match. `installer` may appear in contractor group tests, docs, or text labels only.

- [ ] **Step 3: Inspect recent local image files**

Run:

```powershell
Get-ChildItem -File -Include *.png,*.jpg,*.jpeg,*.webp -Recurse | Select-Object FullName,Length,LastWriteTime
```

Expected: existing files have full paths such as `C:\FloorConnector\tmp-estimates-dashboard.png`; no file literally named `nstaller`.

- [ ] **Step 4: Classify ownership**

If the error only occurs when a user attaches an image to Codex, classify it as a caller path error. The corrective action is to re-send the image with a valid absolute path, for example:

```text
C:\FloorConnector\tmp-estimates-dashboard.png
```

If the error occurs while running FloorConnector in the browser or tests, continue to Task 2.

- [ ] **Step 5: Commit if only documentation changed**

Run:

```powershell
git add docs/superpowers/plans/2026-05-16-local-image-nstaller-error.md
git commit -m "docs: plan local image path diagnostic"
```

Expected: commit succeeds if the task scope is documentation-only.

## Task 2: Trace FloorConnector Image/File Boundaries

**Files:**
- Inspect: `apps/web/components/catalog-manager/inventory-item-drawer.tsx`
- Inspect: `apps/web/components/estimates/files-section.tsx`
- Inspect: `apps/web/components/execution-attachment-form.tsx`
- Inspect: `apps/web/components/opportunity-form.tsx`
- Inspect: `apps/web/lib/execution-attachments/schemas.ts`

- [ ] **Step 1: Search for file path usage**

Run:

```powershell
rg -n "downloadUrl|filePath|path|FileReader|URL.createObjectURL|accept=\"image|mimeType" apps\web
```

Expected: identify the exact boundary that receives image paths or file metadata.

- [ ] **Step 2: Inspect the likely boundary**

Run one focused command for the file identified in Step 1:

```powershell
Get-Content apps\web\components\catalog-manager\inventory-item-drawer.tsx
```

Expected: determine whether the component uses browser `File` objects, stored URLs, or user-entered path strings.

- [ ] **Step 3: Decide whether validation belongs in app code**

If the app only accepts browser `File` objects or absolute remote URLs, do not add app validation for Codex local attachment paths.

If the app accepts user-entered image paths, add validation to reject relative local paths before they reach rendering or server actions.

Use this TypeScript helper shape only if needed:

```ts
function isSupportedImageReference(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("http://") || value.startsWith("data:image/");
}
```

Expected: no production workflow accepts `nstaller` as a valid image reference.

## Task 3: Add a Narrow Regression Test if App Code Changes

**Files:**
- Test: nearest existing test for the changed module.

- [ ] **Step 1: Write the failing test**

If validation is added, include a test case equivalent to:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSupportedImageReference } from "./image-reference";

describe("isSupportedImageReference", () => {
  it("rejects local relative paths", () => {
    assert.equal(isSupportedImageReference("nstaller"), false);
  });

  it("accepts http image references", () => {
    assert.equal(isSupportedImageReference("https://example.com/logo.png"), true);
  });

  it("accepts data image references", () => {
    assert.equal(isSupportedImageReference("data:image/png;base64,abc"), true);
  });
});
```

Expected: test fails until the helper exists and is wired into the relevant boundary.

- [ ] **Step 2: Run the focused test**

Run:

```powershell
pnpm --filter @floorconnector/web test -- image-reference
```

If the package has no `test` script for this target, use the repo's established typecheck and lint commands in Task 4 instead.

Expected: test fails before implementation and passes after implementation.

## Task 4: Verify the Final State

**Files:**
- Verify all files changed in the task.

- [ ] **Step 1: Typecheck**

Run:

```powershell
pnpm typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 2: Lint**

Run:

```powershell
pnpm lint
```

Expected: no lint errors.

- [ ] **Step 3: Run focused browser verification if UI changed**

Run:

```powershell
pnpm dev
```

Then open the affected route and verify image/file UI behavior manually or with the Browser plugin. Expected: invalid local path input is rejected or never accepted; valid stored image URLs still render.

- [ ] **Step 4: Document outcome**

Record one of these outcomes in the final response:

```text
Outcome A: The error is outside FloorConnector app code. Re-send the image using an existing absolute file path.
Outcome B: FloorConnector accepted an invalid image reference. Validation was added at <file>, with tests covering `nstaller`.
```

## Self-Review

- Spec coverage: This plan covers diagnosing the missing `nstaller` local image error, deciding repo ownership, adding validation only if FloorConnector owns the input, and verifying lint/typecheck.
- Placeholder scan: No TBD or deferred implementation placeholders remain.
- Type consistency: The optional helper is consistently named `isSupportedImageReference` in the plan.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-16-local-image-nstaller-error.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.
