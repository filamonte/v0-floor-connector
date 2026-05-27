import type { ExecutionAttachment } from "@floorconnector/types";

export function isPortalEvidenceGrantEligibleAttachment(
  attachment: Pick<ExecutionAttachment, "subjectType" | "archivedAt">
) {
  return (
    !attachment.archivedAt &&
    (attachment.subjectType === "daily_log" ||
      attachment.subjectType === "field_note")
  );
}
