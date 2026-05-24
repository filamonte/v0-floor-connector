import type { ExecutionAttachment as ExecutionAttachmentRecord } from "@floorconnector/types";

export const EXECUTION_ATTACHMENT_SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

export type ExecutionAttachmentPreviewKind = "image" | "pdf" | "file";

export type ExecutionAttachmentPreviewDisplay = {
  kind: ExecutionAttachmentPreviewKind;
  actionLabel: string;
  statusLabel: string;
};

export type ExecutionAttachmentPreviewState =
  ExecutionAttachmentPreviewDisplay & {
    signedUrl: string | null;
    unavailableLabel: string;
  };

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isExternalExecutionAttachmentReference(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function isPrivateFieldEvidenceStoragePath(
  attachment: Pick<ExecutionAttachmentRecord, "organizationId" | "storagePath">
) {
  return (
    !isExternalExecutionAttachmentReference(attachment.storagePath) &&
    attachment.storagePath.startsWith(
      `${attachment.organizationId}/projects/`
    ) &&
    attachment.storagePath.includes("/field-evidence/daily-logs/")
  );
}

export function getExecutionAttachmentPreviewDisplay(
  attachment: Pick<
    ExecutionAttachmentRecord,
    "attachmentType" | "mimeType" | "storagePath" | "organizationId"
  >
): ExecutionAttachmentPreviewDisplay {
  const normalizedMimeType = attachment.mimeType.trim().toLowerCase();

  if (
    attachment.attachmentType === "photo" &&
    imageMimeTypes.has(normalizedMimeType)
  ) {
    return {
      kind: "image",
      actionLabel: "Open image",
      statusLabel: "Private image preview"
    };
  }

  if (normalizedMimeType === "application/pdf") {
    return {
      kind: "pdf",
      actionLabel: "Open PDF",
      statusLabel: "Private PDF preview"
    };
  }

  return {
    kind: "file",
    actionLabel: "Open file",
    statusLabel: "Private file preview"
  };
}

export function buildExecutionAttachmentPreviewState(
  attachment: Pick<
    ExecutionAttachmentRecord,
    "attachmentType" | "mimeType" | "storagePath" | "organizationId"
  >,
  signedUrl: string | null
): ExecutionAttachmentPreviewState {
  return {
    ...getExecutionAttachmentPreviewDisplay(attachment),
    signedUrl,
    unavailableLabel: "Preview unavailable"
  };
}
