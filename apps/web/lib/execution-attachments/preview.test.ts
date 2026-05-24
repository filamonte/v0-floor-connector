import assert from "node:assert/strict";
import test from "node:test";

import {
  EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS,
  buildExecutionAttachmentPreviewState,
  getExecutionAttachmentPreviewDisplay,
  isExternalExecutionAttachmentReference,
  isPrivateFieldEvidenceStoragePath
} from "./preview";

const baseAttachment = {
  organizationId: "company-uuid",
  storagePath:
    "company-uuid/projects/project-uuid/field-evidence/daily-logs/daily-log-uuid/attachment-photo.jpg"
};

void test("getExecutionAttachmentPreviewDisplay maps uploaded images to Open image", () => {
  assert.deepEqual(
    getExecutionAttachmentPreviewDisplay({
      ...baseAttachment,
      attachmentType: "photo",
      mimeType: "image/jpeg"
    }),
    {
      kind: "image",
      actionLabel: "Open image",
      statusLabel: "Private image preview"
    }
  );
});

void test("getExecutionAttachmentPreviewDisplay maps PDFs to Open PDF", () => {
  assert.deepEqual(
    getExecutionAttachmentPreviewDisplay({
      ...baseAttachment,
      attachmentType: "file",
      mimeType: "application/pdf"
    }),
    {
      kind: "pdf",
      actionLabel: "Open PDF",
      statusLabel: "Private PDF preview"
    }
  );
});

void test("getExecutionAttachmentPreviewDisplay falls back to Open file", () => {
  assert.deepEqual(
    getExecutionAttachmentPreviewDisplay({
      ...baseAttachment,
      attachmentType: "file",
      mimeType: "application/octet-stream"
    }),
    {
      kind: "file",
      actionLabel: "Open file",
      statusLabel: "Private file preview"
    }
  );
});

void test("buildExecutionAttachmentPreviewState preserves unavailable fallback", () => {
  assert.deepEqual(
    buildExecutionAttachmentPreviewState(
      {
        ...baseAttachment,
        attachmentType: "photo",
        mimeType: "image/webp"
      },
      null
    ),
    {
      kind: "image",
      actionLabel: "Open image",
      statusLabel: "Private image preview",
      signedUrl: null,
      unavailableLabel: "Preview unavailable"
    }
  );
});

void test("isPrivateFieldEvidenceStoragePath accepts only private field evidence paths", () => {
  assert.equal(
    isPrivateFieldEvidenceStoragePath({
      organizationId: "company-uuid",
      storagePath:
        "company-uuid/projects/project-uuid/field-evidence/daily-logs/daily-log-uuid/file.pdf"
    }),
    true
  );
  assert.equal(
    isPrivateFieldEvidenceStoragePath({
      organizationId: "company-uuid",
      storagePath:
        "other-company/projects/project-uuid/field-evidence/daily-logs/daily-log-uuid/file.pdf"
    }),
    false
  );
  assert.equal(
    isPrivateFieldEvidenceStoragePath({
      organizationId: "company-uuid",
      storagePath: "https://example.test/file.pdf"
    }),
    false
  );
});

void test("preview constants and external reference checks stay explicit", () => {
  assert.equal(EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS, 60 * 60);
  assert.equal(
    isExternalExecutionAttachmentReference("https://example.test/file.pdf"),
    true
  );
  assert.equal(
    isExternalExecutionAttachmentReference("company/projects/file.pdf"),
    false
  );
});
