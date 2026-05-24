import type { ExecutionAttachment as ExecutionAttachmentRecord } from "@floorconnector/types";

export type ExecutionAttachmentArchiveState = Pick<
  ExecutionAttachmentRecord,
  "archivedAt"
>;

export type ExecutionAttachmentArchivePartition<T> = {
  active: T[];
  archived: T[];
};

export function isExecutionAttachmentArchived(
  attachment: ExecutionAttachmentArchiveState
) {
  return Boolean(attachment.archivedAt);
}

export function filterActiveExecutionAttachments<
  T extends ExecutionAttachmentArchiveState
>(attachments: T[]) {
  return attachments.filter(
    (attachment) => !isExecutionAttachmentArchived(attachment)
  );
}

export function partitionExecutionAttachmentsByArchiveState<
  T extends ExecutionAttachmentArchiveState
>(attachments: T[]): ExecutionAttachmentArchivePartition<T> {
  return attachments.reduce<ExecutionAttachmentArchivePartition<T>>(
    (partitioned, attachment) => {
      if (isExecutionAttachmentArchived(attachment)) {
        partitioned.archived.push(attachment);
      } else {
        partitioned.active.push(attachment);
      }

      return partitioned;
    },
    { active: [], archived: [] }
  );
}
