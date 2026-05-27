import assert from "node:assert/strict";
import test from "node:test";

import {
  EXECUTION_ATTACHMENT_MAX_FILE_SIZE_BYTES,
  buildExecutionAttachmentStoragePath,
  inferExecutionAttachmentType,
  sanitizeExecutionAttachmentFileName,
  validateExecutionAttachmentUploadFile
} from "./storage";

void test("sanitizeExecutionAttachmentFileName keeps recognizable safe names", () => {
  assert.equal(
    sanitizeExecutionAttachmentFileName(" Progress Photo 01.JPG "),
    "Progress-Photo-01.JPG"
  );
  assert.equal(
    sanitizeExecutionAttachmentFileName("../unsafe\\panel photo?.png"),
    "panel-photo.png"
  );
  assert.equal(sanitizeExecutionAttachmentFileName("***"), "field-evidence");
});

void test("buildExecutionAttachmentStoragePath keeps company UUID as first segment", () => {
  const path = buildExecutionAttachmentStoragePath({
    companyId: "company-uuid",
    projectId: "project-uuid",
    dailyLogId: "daily-log-uuid",
    attachmentId: "attachment-uuid",
    fileName: "progress photo.jpg"
  });

  assert.equal(
    path,
    "company-uuid/projects/project-uuid/field-evidence/daily-logs/daily-log-uuid/attachment-uuid-progress-photo.jpg"
  );
  assert.ok(!path.startsWith("companies/"));
});

void test("buildExecutionAttachmentStoragePath nests Job Note evidence under the Daily Job Log", () => {
  assert.equal(
    buildExecutionAttachmentStoragePath({
      companyId: "company-uuid",
      projectId: "project-uuid",
      dailyLogId: "daily-log-uuid",
      fieldNoteId: "field-note-uuid",
      attachmentId: "attachment-uuid",
      fileName: "issue.pdf"
    }),
    "company-uuid/projects/project-uuid/field-evidence/daily-logs/daily-log-uuid/field-notes/field-note-uuid/attachment-uuid-issue.pdf"
  );
});

void test("buildExecutionAttachmentStoragePath supports internal Work Item evidence", () => {
  assert.equal(
    buildExecutionAttachmentStoragePath({
      companyId: "company-uuid",
      projectId: "project-uuid",
      workItemId: "work-item-uuid",
      attachmentId: "attachment-uuid",
      fileName: "crack photo.webp"
    }),
    "company-uuid/projects/project-uuid/field-evidence/work-items/work-item-uuid/attachment-uuid-crack-photo.webp"
  );
});

void test("validateExecutionAttachmentUploadFile accepts images and PDFs", () => {
  const photo = validateExecutionAttachmentUploadFile({
    name: "after-photo.webp",
    type: "image/webp",
    size: 1024
  });
  const pdf = validateExecutionAttachmentUploadFile({
    name: "delivery-ticket.pdf",
    type: "application/pdf",
    size: 2048
  });

  assert.equal(photo.ok, true);
  assert.equal(photo.ok ? photo.attachmentType : null, "photo");
  assert.equal(photo.ok ? photo.mimeType : null, "image/webp");
  assert.equal(pdf.ok, true);
  assert.equal(pdf.ok ? pdf.attachmentType : null, "file");
});

void test("validateExecutionAttachmentUploadFile rejects unsafe uploads", () => {
  assert.equal(
    validateExecutionAttachmentUploadFile({
      name: "",
      type: "image/jpeg",
      size: 1
    }).ok,
    false
  );
  assert.equal(
    validateExecutionAttachmentUploadFile({
      name: "script.svg",
      type: "image/svg+xml",
      size: 1
    }).ok,
    false
  );
  assert.equal(
    validateExecutionAttachmentUploadFile({
      name: "large.pdf",
      type: "application/pdf",
      size: EXECUTION_ATTACHMENT_MAX_FILE_SIZE_BYTES + 1
    }).ok,
    false
  );
  assert.equal(
    validateExecutionAttachmentUploadFile({
      name: `${"a".repeat(256)}.pdf`,
      type: "application/pdf",
      size: 1
    }).ok,
    false
  );
});

void test("inferExecutionAttachmentType maps images to photo and PDFs to file", () => {
  assert.equal(inferExecutionAttachmentType("image/png"), "photo");
  assert.equal(inferExecutionAttachmentType("application/pdf"), "file");
});
