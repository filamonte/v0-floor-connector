import type {
  ExecutionAttachment,
  PortalEvidenceDeliveryEvent,
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
  deliveryProof: PortalEvidenceDeliveryProofSummary;
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
  grantId: string;
  title: string;
  fileName: string;
  caption: string | null;
  customerNote: string | null;
  sourceCategory: string;
  mimeType: string;
  sharedAt: string;
  href: string | null;
  statusLabel: string;
  acknowledgementAllowed: boolean;
  deliveryProof: PortalEvidenceDeliveryProofSummary;
};

export type PortalSharedEvidenceSummary = {
  statusLabel: string;
  primaryMessage: string;
  items: PortalSharedEvidenceItem[];
  emptyStateMessage: string;
  storageBoundaryMessage: string;
};

export type PortalEvidenceDeliveryProofSummary = {
  firstSharedAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
  lastDownloadedAt: string | null;
  downloadCount: number;
  acknowledgedAt: string | null;
  acknowledgedByLabel: string | null;
  revokedAt: string | null;
  currentStatus:
    | "available"
    | "viewed"
    | "downloaded"
    | "acknowledged"
    | "revoked";
  statusLabel: string;
};

function emptyDeliveryProof(
  fallback: Partial<PortalEvidenceDeliveryProofSummary> = {}
): PortalEvidenceDeliveryProofSummary {
  return {
    firstSharedAt: null,
    lastViewedAt: null,
    viewCount: 0,
    lastDownloadedAt: null,
    downloadCount: 0,
    acknowledgedAt: null,
    acknowledgedByLabel: null,
    revokedAt: null,
    currentStatus: "available",
    statusLabel: "Available",
    ...fallback
  };
}

function getActorLabel(event: Pick<PortalEvidenceDeliveryEvent, "actorKind">) {
  switch (event.actorKind) {
    case "contractor":
      return "Contractor";
    case "portal_customer":
      return "Customer";
    default:
      return "System";
  }
}

export function derivePortalEvidenceDeliveryProofSummary(input: {
  events: PortalEvidenceDeliveryEvent[];
  grant?: Pick<PortalEvidenceGrant, "status" | "sharedAt" | "revokedAt"> | null;
}): PortalEvidenceDeliveryProofSummary {
  const events = [...input.events].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt)
  );
  const sharedEvents = events.filter((event) => event.eventType === "shared");
  const viewedEvents = events.filter((event) => event.eventType === "viewed");
  const downloadedEvents = events.filter(
    (event) => event.eventType === "downloaded"
  );
  const acknowledgedEvents = events.filter(
    (event) => event.eventType === "acknowledged"
  );
  const revokedEvents = events.filter((event) => event.eventType === "revoked");
  const latestViewed = viewedEvents.at(-1) ?? null;
  const latestDownloaded = downloadedEvents.at(-1) ?? null;
  const latestAcknowledged = acknowledgedEvents.at(-1) ?? null;
  const latestRevoked = revokedEvents.at(-1) ?? null;
  const revokedAt = latestRevoked?.occurredAt ?? input.grant?.revokedAt ?? null;

  if (input.grant?.status === "revoked" || revokedAt) {
    return emptyDeliveryProof({
      firstSharedAt:
        sharedEvents[0]?.occurredAt ?? input.grant?.sharedAt ?? null,
      lastViewedAt: latestViewed?.occurredAt ?? null,
      viewCount: viewedEvents.length,
      lastDownloadedAt: latestDownloaded?.occurredAt ?? null,
      downloadCount: downloadedEvents.length,
      acknowledgedAt: latestAcknowledged?.occurredAt ?? null,
      acknowledgedByLabel: latestAcknowledged
        ? getActorLabel(latestAcknowledged)
        : null,
      revokedAt,
      currentStatus: "revoked",
      statusLabel: "Revoked"
    });
  }

  if (latestAcknowledged) {
    return emptyDeliveryProof({
      firstSharedAt:
        sharedEvents[0]?.occurredAt ?? input.grant?.sharedAt ?? null,
      lastViewedAt: latestViewed?.occurredAt ?? null,
      viewCount: viewedEvents.length,
      lastDownloadedAt: latestDownloaded?.occurredAt ?? null,
      downloadCount: downloadedEvents.length,
      acknowledgedAt: latestAcknowledged.occurredAt,
      acknowledgedByLabel: getActorLabel(latestAcknowledged),
      currentStatus: "acknowledged",
      statusLabel: "Acknowledged"
    });
  }

  if (latestDownloaded) {
    return emptyDeliveryProof({
      firstSharedAt:
        sharedEvents[0]?.occurredAt ?? input.grant?.sharedAt ?? null,
      lastViewedAt: latestViewed?.occurredAt ?? null,
      viewCount: viewedEvents.length,
      lastDownloadedAt: latestDownloaded.occurredAt,
      downloadCount: downloadedEvents.length,
      currentStatus: "downloaded",
      statusLabel: "Download requested"
    });
  }

  if (latestViewed) {
    return emptyDeliveryProof({
      firstSharedAt:
        sharedEvents[0]?.occurredAt ?? input.grant?.sharedAt ?? null,
      lastViewedAt: latestViewed.occurredAt,
      viewCount: viewedEvents.length,
      currentStatus: "viewed",
      statusLabel: "Viewed in portal"
    });
  }

  return emptyDeliveryProof({
    firstSharedAt: sharedEvents[0]?.occurredAt ?? input.grant?.sharedAt ?? null
  });
}

function getGrantForAttachment(
  grants: Pick<
    PortalEvidenceGrant,
    | "id"
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
  deliveryEvents?: PortalEvidenceDeliveryEvent[];
}): ProjectPortalEvidenceSharingSummary {
  const items = input.attachments
    .map((attachment): PortalEvidenceSharingItem => {
      const grant = getGrantForAttachment(input.grants, attachment.id);
      const isArchived = Boolean(attachment.archivedAt);
      const deliveryProof = derivePortalEvidenceDeliveryProofSummary({
        events: grant
          ? (input.deliveryEvents ?? []).filter(
              (event) => event.portalEvidenceGrantId === grant.id
            )
          : [],
        grant
      });
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
        deliveryProof,
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
      downloadHref: string | null;
      grant: Pick<
        PortalEvidenceGrant,
        | "id"
        | "titleOverride"
        | "customerNote"
        | "sharedAt"
        | "status"
        | "revokedAt"
      >;
      deliveryEvents?: PortalEvidenceDeliveryEvent[];
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
    .map((attachment): PortalSharedEvidenceItem => {
      const deliveryProof = derivePortalEvidenceDeliveryProofSummary({
        events: attachment.deliveryEvents ?? [],
        grant: attachment.grant
      });

      return {
        key: `execution-attachment:${attachment.id}`,
        id: attachment.id,
        grantId: attachment.grant.id,
        title: getAttachmentTitle(attachment, attachment.grant.titleOverride),
        fileName: attachment.fileName,
        caption: attachment.caption,
        customerNote: attachment.grant.customerNote,
        sourceCategory: getSourceCategory(attachment),
        mimeType: attachment.mimeType,
        sharedAt: attachment.grant.sharedAt ?? attachment.createdAt,
        href: attachment.downloadHref,
        statusLabel: deliveryProof.statusLabel,
        acknowledgementAllowed:
          deliveryProof.currentStatus !== "acknowledged" &&
          deliveryProof.currentStatus !== "revoked",
        deliveryProof
      };
    })
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
