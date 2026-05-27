import type {
  ExecutionAttachment,
  PortalEvidenceGrant
} from "@floorconnector/types";

export type ShareableEvidenceSource = Pick<
  ExecutionAttachment,
  | "id"
  | "subjectType"
  | "subjectId"
  | "attachmentType"
  | "fileName"
  | "mimeType"
  | "caption"
  | "archivedAt"
  | "createdAt"
>;

export type PortalEvidenceSharingState = "internal" | "shared" | "revoked";

export type PortalEvidenceSharingItem = {
  id: string;
  subjectType: "execution_attachment";
  attachmentType: ExecutionAttachment["attachmentType"];
  title: string;
  caption: string | null;
  mimeType: string;
  status: PortalEvidenceSharingState;
  statusLabel: string;
  customerNote: string | null;
  sharedAt: string | null;
  revokedAt: string | null;
  canShare: boolean;
  canRevoke: boolean;
  reason: string;
  createdAt: string;
};

export type ProjectPortalEvidenceSharingSummary = {
  statusLabel: string;
  primaryMessage: string;
  sharedCount: number;
  internalCount: number;
  revokedCount: number;
  archivedCount: number;
  items: PortalEvidenceSharingItem[];
};

export type PortalSharedEvidenceItem = {
  key: string;
  id: string;
  title: string;
  fileName: string;
  caption: string | null;
  customerNote: string | null;
  sourceCategory: string;
  mimeType: string;
  sharedAt: string;
  href: string | null;
  statusLabel: string;
};

export type PortalSharedEvidenceSummary = {
  statusLabel: string;
  primaryMessage: string;
  items: PortalSharedEvidenceItem[];
  emptyStateMessage: string;
  storageBoundaryMessage: string;
};

function getGrantForAttachment(
  grants: Pick<
    PortalEvidenceGrant,
    | "subjectType"
    | "subjectId"
    | "status"
    | "titleOverride"
    | "customerNote"
    | "sharedAt"
    | "revokedAt"
  >[],
  attachmentId: string
) {
  return (
    grants.find(
      (grant) =>
        grant.subjectType === "execution_attachment" &&
        grant.subjectId === attachmentId
    ) ?? null
  );
}

function getAttachmentTitle(
  attachment: Pick<ExecutionAttachment, "fileName" | "caption">,
  titleOverride?: string | null
) {
  return (
    titleOverride?.trim() || attachment.caption?.trim() || attachment.fileName
  );
}

function getSourceCategory(
  attachment: Pick<ExecutionAttachment, "attachmentType">
) {
  return attachment.attachmentType === "photo"
    ? "Project photo"
    : "Project file";
}

export function deriveProjectPortalEvidenceSharingSummary(input: {
  attachments: ShareableEvidenceSource[];
  grants: PortalEvidenceGrant[];
}): ProjectPortalEvidenceSharingSummary {
  const items = input.attachments
    .map((attachment): PortalEvidenceSharingItem => {
      const grant = getGrantForAttachment(input.grants, attachment.id);
      const isArchived = Boolean(attachment.archivedAt);
      const status: PortalEvidenceSharingState = isArchived
        ? "internal"
        : grant?.status === "shared"
          ? "shared"
          : grant?.status === "revoked"
            ? "revoked"
            : "internal";

      return {
        id: attachment.id,
        subjectType: "execution_attachment",
        attachmentType: attachment.attachmentType,
        title: getAttachmentTitle(attachment, grant?.titleOverride),
        caption: attachment.caption,
        mimeType: attachment.mimeType,
        status,
        statusLabel:
          status === "shared"
            ? "Shared with customer"
            : status === "revoked"
              ? "Revoked"
              : isArchived
                ? "Archived internally"
                : "Internal only",
        customerNote: grant?.customerNote ?? null,
        sharedAt: grant?.sharedAt ?? null,
        revokedAt: grant?.revokedAt ?? null,
        canShare: !isArchived && status !== "shared",
        canRevoke: !isArchived && status === "shared",
        reason: isArchived
          ? "Archived evidence is not eligible for new portal sharing."
          : status === "shared"
            ? "This item is visible to customers with active project portal access."
            : status === "revoked"
              ? "This item was shared before and is now hidden from the portal."
              : "This item remains contractor-only until explicitly shared.",
        createdAt: attachment.createdAt
      };
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const sharedCount = items.filter((item) => item.status === "shared").length;
  const revokedCount = items.filter((item) => item.status === "revoked").length;
  const archivedCount = input.attachments.filter((item) =>
    Boolean(item.archivedAt)
  ).length;
  const internalCount = items.length - sharedCount - revokedCount;

  return {
    statusLabel:
      sharedCount > 0
        ? `${sharedCount} shared`
        : items.length > 0
          ? "Internal by default"
          : "No shareable evidence",
    primaryMessage:
      sharedCount > 0
        ? "Selected field evidence is explicitly shared to the customer portal. Everything else remains internal."
        : items.length > 0
          ? "Field evidence is internal by default. Share only the items that are safe for the customer record."
          : "No active field evidence is available for portal sharing yet.",
    sharedCount,
    internalCount,
    revokedCount,
    archivedCount,
    items
  };
}

export function derivePortalSharedEvidenceSummary(input: {
  attachments: Array<
    ShareableEvidenceSource & {
      signedUrl: string | null;
      grant: Pick<
        PortalEvidenceGrant,
        "titleOverride" | "customerNote" | "sharedAt" | "status"
      >;
    }
  >;
}): PortalSharedEvidenceSummary {
  const items = input.attachments
    .filter(
      (attachment) =>
        attachment.grant.status === "shared" &&
        Boolean(attachment.grant.sharedAt) &&
        !attachment.archivedAt
    )
    .map(
      (attachment): PortalSharedEvidenceItem => ({
        key: `execution-attachment:${attachment.id}`,
        id: attachment.id,
        title: getAttachmentTitle(attachment, attachment.grant.titleOverride),
        fileName: attachment.fileName,
        caption: attachment.caption,
        customerNote: attachment.grant.customerNote,
        sourceCategory: getSourceCategory(attachment),
        mimeType: attachment.mimeType,
        sharedAt: attachment.grant.sharedAt ?? attachment.createdAt,
        href: attachment.signedUrl,
        statusLabel: attachment.signedUrl ? "Ready to view" : "Shared metadata"
      })
    )
    .sort((left, right) => right.sharedAt.localeCompare(left.sharedAt));

  return {
    statusLabel:
      items.length > 0
        ? `${items.length} shared evidence item${items.length === 1 ? "" : "s"}`
        : "No shared evidence",
    primaryMessage:
      items.length > 0
        ? "These files were deliberately shared by the contractor for this project."
        : "No field evidence has been shared to this portal project yet.",
    items,
    emptyStateMessage:
      "The contractor may share selected project proof here when it is customer-safe. Internal field notes, Daily Log details, and unshared files stay hidden.",
    storageBoundaryMessage:
      "Only explicitly shared evidence appears here. Private storage paths, internal notes, and unshared field proof are not exposed."
  };
}
