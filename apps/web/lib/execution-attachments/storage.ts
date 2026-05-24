import type { ExecutionAttachment as ExecutionAttachmentRecord } from "@floorconnector/types";

export const EXECUTION_ATTACHMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const EXECUTION_ATTACHMENT_MAX_FILE_NAME_LENGTH = 255;

export const EXECUTION_ATTACHMENT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
] as const;

export type ExecutionAttachmentUploadFileLike = {
  name: string;
  type: string;
  size: number;
};

export type ExecutionAttachmentUploadValidationResult =
  | {
      ok: true;
      fileName: string;
      safeFileName: string;
      mimeType: (typeof EXECUTION_ATTACHMENT_ALLOWED_MIME_TYPES)[number];
      fileSizeBytes: number;
      attachmentType: ExecutionAttachmentRecord["attachmentType"];
    }
  | {
      ok: false;
      message: string;
    };

export type ExecutionAttachmentStoragePathInput = {
  companyId: string;
  projectId: string;
  dailyLogId: string;
  fieldNoteId?: string | null;
  attachmentId: string;
  fileName: string;
};

const allowedMimeTypeSet = new Set<string>(
  EXECUTION_ATTACHMENT_ALLOWED_MIME_TYPES
);

export function sanitizeExecutionAttachmentFileName(value: string) {
  const rawFileName = value.split(/[\\/]/).pop()?.trim() ?? "";
  const normalized = rawFileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-+\./g, ".")
    .replace(/^[._-]+|[._-]+$/g, "");

  return normalized || "field-evidence";
}

export function inferExecutionAttachmentType(
  mimeType: string
): ExecutionAttachmentRecord["attachmentType"] {
  return mimeType.startsWith("image/") ? "photo" : "file";
}

export function validateExecutionAttachmentUploadFile(
  file: ExecutionAttachmentUploadFileLike | null | undefined
): ExecutionAttachmentUploadValidationResult {
  if (!file || !Number.isFinite(file.size) || file.size <= 0) {
    return {
      ok: false,
      message: "Choose a photo or PDF before adding field evidence."
    };
  }

  const fileName = file.name.trim();

  if (!fileName) {
    return {
      ok: false,
      message: "Field evidence needs a file name."
    };
  }

  if (fileName.length > EXECUTION_ATTACHMENT_MAX_FILE_NAME_LENGTH) {
    return {
      ok: false,
      message: "Field evidence file names must be 255 characters or fewer."
    };
  }

  if (file.size > EXECUTION_ATTACHMENT_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: "Field evidence files must be 10 MB or smaller."
    };
  }

  const mimeType = file.type.trim().toLowerCase();

  if (!allowedMimeTypeSet.has(mimeType)) {
    return {
      ok: false,
      message: "Field evidence must be a JPG, PNG, WebP, or PDF file."
    };
  }

  return {
    ok: true,
    fileName,
    safeFileName: sanitizeExecutionAttachmentFileName(fileName),
    mimeType:
      mimeType as (typeof EXECUTION_ATTACHMENT_ALLOWED_MIME_TYPES)[number],
    fileSizeBytes: file.size,
    attachmentType: inferExecutionAttachmentType(mimeType)
  };
}

export function buildExecutionAttachmentStoragePath(
  input: ExecutionAttachmentStoragePathInput
) {
  const safeFileName = sanitizeExecutionAttachmentFileName(input.fileName);
  const dailyLogPrefix = `${input.companyId}/projects/${input.projectId}/field-evidence/daily-logs/${input.dailyLogId}`;
  const subjectPrefix = input.fieldNoteId
    ? `${dailyLogPrefix}/field-notes/${input.fieldNoteId}`
    : dailyLogPrefix;

  return `${subjectPrefix}/${input.attachmentId}-${safeFileName}`;
}
