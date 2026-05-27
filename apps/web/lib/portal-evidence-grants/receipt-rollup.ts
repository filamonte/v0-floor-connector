import type { PortalEvidenceDeliveryProofSummary } from "./summary";
import type {
  PortalEvidenceSharingItem,
  PortalSharedEvidenceItem,
  ProjectPortalEvidenceSharingSummary,
  PortalSharedEvidenceSummary
} from "./summary";

export type SharedEvidenceReceiptStatus =
  | "no_shared_evidence"
  | "shared_not_viewed"
  | "viewed_or_downloaded"
  | "partially_acknowledged"
  | "fully_acknowledged"
  | "revoked_or_changed";

export type SharedEvidenceReceiptRow = {
  key: string;
  grantId: string | null;
  title: string;
  fileName: string;
  sourceCategory: string;
  customerNote: string | null;
  currentStatus: PortalEvidenceDeliveryProofSummary["currentStatus"];
  statusLabel: string;
  sharedAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
  lastDownloadedAt: string | null;
  downloadCount: number;
  acknowledgedAt: string | null;
  acknowledgedByLabel: string | null;
  revokedAt: string | null;
  customerVisible: boolean;
};

export type SharedEvidenceReceiptRollup = {
  status: SharedEvidenceReceiptStatus;
  statusLabel: string;
  primaryMessage: string;
  activeSharedCount: number;
  viewedCount: number;
  downloadedCount: number;
  acknowledgedCount: number;
  revokedCount: number;
  unacknowledgedSharedCount: number;
  lastSharedAt: string | null;
  lastViewedAt: string | null;
  lastDownloadedAt: string | null;
  lastAcknowledgedAt: string | null;
  lastRevokedAt: string | null;
  lastCustomerInteractionAt: string | null;
  customerRows: SharedEvidenceReceiptRow[];
  contractorRows: SharedEvidenceReceiptRow[];
  exportNotice: string;
  acknowledgementDisclaimer: string;
};

type ReceiptInputRow = {
  key: string;
  grantId: string | null;
  title: string;
  fileName: string;
  sourceCategory: string;
  customerNote: string | null;
  customerVisible: boolean;
  deliveryProof: PortalEvidenceDeliveryProofSummary;
};

function latestDate(values: Array<string | null | undefined>) {
  const sorted = values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right));

  return sorted.at(-1) ?? null;
}

function getReceiptStatus(input: {
  activeSharedCount: number;
  revokedCount: number;
  viewedCount: number;
  downloadedCount: number;
  acknowledgedCount: number;
}): SharedEvidenceReceiptStatus {
  if (input.revokedCount > 0) {
    return "revoked_or_changed";
  }

  if (input.activeSharedCount === 0) {
    return "no_shared_evidence";
  }

  if (input.acknowledgedCount === input.activeSharedCount) {
    return "fully_acknowledged";
  }

  if (input.acknowledgedCount > 0) {
    return "partially_acknowledged";
  }

  if (input.viewedCount > 0 || input.downloadedCount > 0) {
    return "viewed_or_downloaded";
  }

  return "shared_not_viewed";
}

function getStatusLabel(status: SharedEvidenceReceiptStatus) {
  switch (status) {
    case "fully_acknowledged":
      return "Fully acknowledged";
    case "partially_acknowledged":
      return "Partially acknowledged";
    case "viewed_or_downloaded":
      return "Viewed or downloaded";
    case "shared_not_viewed":
      return "Shared, not viewed";
    case "revoked_or_changed":
      return "Receipt history changed";
    case "no_shared_evidence":
      return "No shared evidence";
  }
}

function getPrimaryMessage(input: {
  status: SharedEvidenceReceiptStatus;
  activeSharedCount: number;
  acknowledgedCount: number;
  revokedCount: number;
}) {
  switch (input.status) {
    case "fully_acknowledged":
      return "All active shared evidence has customer acknowledgement recorded.";
    case "partially_acknowledged":
      return `${input.acknowledgedCount} of ${input.activeSharedCount} active shared evidence items have customer acknowledgement recorded.`;
    case "viewed_or_downloaded":
      return "Shared evidence has customer portal activity, but acknowledgement is still incomplete.";
    case "shared_not_viewed":
      return "Evidence has been shared to the portal, but no customer portal view, download, or acknowledgement is recorded yet.";
    case "revoked_or_changed":
      return `Receipt history includes ${input.revokedCount} revoked item${input.revokedCount === 1 ? "" : "s"}. Review active shared evidence before closeout.`;
    case "no_shared_evidence":
      return "No customer-visible project evidence has been explicitly shared yet.";
  }
}

function buildRows(rows: ReceiptInputRow[]): SharedEvidenceReceiptRow[] {
  return rows
    .map((row) => ({
      key: row.key,
      grantId: row.grantId,
      title: row.title,
      fileName: row.fileName,
      sourceCategory: row.sourceCategory,
      customerNote: row.customerNote,
      currentStatus: row.deliveryProof.currentStatus,
      statusLabel: row.deliveryProof.statusLabel,
      sharedAt: row.deliveryProof.firstSharedAt,
      lastViewedAt: row.deliveryProof.lastViewedAt,
      viewCount: row.deliveryProof.viewCount,
      lastDownloadedAt: row.deliveryProof.lastDownloadedAt,
      downloadCount: row.deliveryProof.downloadCount,
      acknowledgedAt: row.deliveryProof.acknowledgedAt,
      acknowledgedByLabel: row.deliveryProof.acknowledgedByLabel,
      revokedAt: row.deliveryProof.revokedAt,
      customerVisible: row.customerVisible
    }))
    .sort((left, right) =>
      (right.sharedAt ?? "").localeCompare(left.sharedAt ?? "")
    );
}

function deriveSharedEvidenceReceiptRollup(
  rows: ReceiptInputRow[]
): SharedEvidenceReceiptRollup {
  const receiptRows = buildRows(rows);
  const activeRows = receiptRows.filter(
    (row) => row.currentStatus !== "revoked"
  );
  const revokedRows = receiptRows.filter(
    (row) => row.currentStatus === "revoked" || Boolean(row.revokedAt)
  );
  const acknowledgedRows = activeRows.filter((row) =>
    Boolean(row.acknowledgedAt)
  );
  const viewedRows = activeRows.filter((row) => row.viewCount > 0);
  const downloadedRows = activeRows.filter((row) => row.downloadCount > 0);
  const status = getReceiptStatus({
    activeSharedCount: activeRows.length,
    revokedCount: revokedRows.length,
    viewedCount: viewedRows.length,
    downloadedCount: downloadedRows.length,
    acknowledgedCount: acknowledgedRows.length
  });

  return {
    status,
    statusLabel: getStatusLabel(status),
    primaryMessage: getPrimaryMessage({
      status,
      activeSharedCount: activeRows.length,
      acknowledgedCount: acknowledgedRows.length,
      revokedCount: revokedRows.length
    }),
    activeSharedCount: activeRows.length,
    viewedCount: viewedRows.length,
    downloadedCount: downloadedRows.length,
    acknowledgedCount: acknowledgedRows.length,
    revokedCount: revokedRows.length,
    unacknowledgedSharedCount: activeRows.length - acknowledgedRows.length,
    lastSharedAt: latestDate(receiptRows.map((row) => row.sharedAt)),
    lastViewedAt: latestDate(receiptRows.map((row) => row.lastViewedAt)),
    lastDownloadedAt: latestDate(
      receiptRows.map((row) => row.lastDownloadedAt)
    ),
    lastAcknowledgedAt: latestDate(
      receiptRows.map((row) => row.acknowledgedAt)
    ),
    lastRevokedAt: latestDate(receiptRows.map((row) => row.revokedAt)),
    lastCustomerInteractionAt: latestDate(
      receiptRows.flatMap((row) => [
        row.lastViewedAt,
        row.lastDownloadedAt,
        row.acknowledgedAt
      ])
    ),
    customerRows: receiptRows.filter((row) => row.customerVisible),
    contractorRows: receiptRows,
    exportNotice:
      "This receipt summary is generated from current explicit evidence sharing grants and append-only portal evidence events. Printing or saving it does not send files, create delivery proof, or change acknowledgement, scope, price, schedule, or payment status.",
    acknowledgementDisclaimer:
      "Customer acknowledgement confirms receipt of access to a shared file. It is not a signature, legal acceptance, scope approval, price approval, schedule approval, or payment-term change."
  };
}

function mapContractorItem(
  item: PortalEvidenceSharingItem
): ReceiptInputRow | null {
  if (item.status === "internal") {
    return null;
  }

  return {
    key: `execution-attachment:${item.id}`,
    grantId: null,
    title: item.title,
    fileName: item.title,
    sourceCategory:
      item.attachmentType === "photo" ? "Project photo" : "Project file",
    customerNote: item.customerNote,
    customerVisible: item.status === "shared",
    deliveryProof: item.deliveryProof
  };
}

function mapPortalItem(item: PortalSharedEvidenceItem): ReceiptInputRow {
  return {
    key: item.key,
    grantId: item.grantId,
    title: item.title,
    fileName: item.fileName,
    sourceCategory: item.sourceCategory,
    customerNote: item.customerNote,
    customerVisible: true,
    deliveryProof: item.deliveryProof
  };
}

export function deriveSharedEvidenceReceiptRollupFromProjectSharing(
  summary: ProjectPortalEvidenceSharingSummary
) {
  return deriveSharedEvidenceReceiptRollup(
    summary.items
      .map(mapContractorItem)
      .filter((item): item is ReceiptInputRow => item !== null)
  );
}

export function deriveSharedEvidenceReceiptRollupFromPortalSummary(
  summary: PortalSharedEvidenceSummary
) {
  return deriveSharedEvidenceReceiptRollup(summary.items.map(mapPortalItem));
}
