import type { CloseoutTrailTone } from "@/lib/closeouttrail/summary";
import type { ProofCenterTone } from "@/lib/proofcenter/summary";

export type ProjectEvidenceContinuityTone =
  | "ready"
  | "attention"
  | "blocked"
  | "neutral";

export type ProjectEvidenceContinuityDocumentTone =
  | "ready"
  | "attention"
  | "missing"
  | "neutral";

export type ProjectEvidenceContinuityTimelineType =
  | "document"
  | "field"
  | "archive"
  | "closeout";

export type ProjectEvidenceContinuityAttachment = {
  id: string;
  subjectType: "daily_log" | "field_note";
  subjectId: string;
  attachmentType: string;
  fileName: string;
  mimeType: string;
  caption: string | null;
  createdAt: string;
  archivedAt: string | null;
  restoredAt?: string | null;
};

export type ProjectEvidenceContinuityDailyLog = {
  id: string;
  jobId: string | null;
  logDate: string;
  status: string;
  summary: string | null;
  updatedAt: string;
};

export type ProjectEvidenceContinuityFieldNote = {
  id: string;
  dailyLogId: string;
  jobId: string | null;
  noteType: string;
  title: string;
  status: string;
  updatedAt: string;
};

export type ProjectEvidenceContinuityRecord = {
  id: string;
  status: string;
  label?: string | null;
  referenceNumber?: string | null;
  updatedAt?: string | null;
};

export type ProjectEvidenceContinuityInvoice =
  ProjectEvidenceContinuityRecord & {
    balanceDueAmount?: string | number | null;
  };

export type ProjectEvidenceContinuityWarrantyDocument = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
};

export type ProjectEvidenceContinuityNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type ProjectEvidenceContinuityDocumentItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
  href: string;
  tone: ProjectEvidenceContinuityDocumentTone;
  customerSafe: boolean;
};

export type ProjectEvidenceContinuityDocumentGroup = {
  id: "customer_safe_records" | "internal_proof" | "closeout_handoff";
  title: string;
  items: ProjectEvidenceContinuityDocumentItem[];
};

export type ProjectEvidenceContinuityTimelineItem = {
  id: string;
  type: ProjectEvidenceContinuityTimelineType;
  title: string;
  detail: string;
  href: string;
  occurredAt: string;
  customerSafe: boolean;
};

export type ProjectEvidenceContinuitySummary = {
  tone: ProjectEvidenceContinuityTone;
  statusLabel: string;
  primaryMessage: string;
  nextMove: ProjectEvidenceContinuityNextMove;
  counts: {
    activeEvidence: number;
    archivedEvidence: number;
    photos: number;
    pdfs: number;
    dailyLogs: number;
    fieldNotes: number;
    unresolvedFieldNotes: number;
    customerSafeRecords: number;
    internalOnlyEvidence: number;
    closeoutDocuments: number;
  };
  boundary: {
    customerSafeLabel: string;
    internalEvidenceLabel: string;
    archiveLabel: string;
  };
  officeReviewItems: string[];
  documentGroups: ProjectEvidenceContinuityDocumentGroup[];
  timeline: ProjectEvidenceContinuityTimelineItem[];
};

export type ProjectEvidenceContinuityInput = {
  projectId: string;
  dailyLogs: ProjectEvidenceContinuityDailyLog[];
  fieldNotes: ProjectEvidenceContinuityFieldNote[];
  attachments: ProjectEvidenceContinuityAttachment[];
  estimates: ProjectEvidenceContinuityRecord[];
  contracts: ProjectEvidenceContinuityRecord[];
  invoices: ProjectEvidenceContinuityInvoice[];
  changeOrders: ProjectEvidenceContinuityRecord[];
  warrantyDocuments: ProjectEvidenceContinuityWarrantyDocument[];
  serviceTicketCount: number;
  customerAccessCount: number;
  closeoutTone: CloseoutTrailTone;
  closeoutBlockers: string[];
  closeoutNextMove: ProjectEvidenceContinuityNextMove;
  proofTone: ProofCenterTone;
  proofMissingItems: string[];
  proofNextMove: ProjectEvidenceContinuityNextMove;
  fieldTrailNextMove: ProjectEvidenceContinuityNextMove;
  dailyLogsHref: string;
  fieldTrailHref: string;
  proofCenterHref: string;
  closeoutHref: string;
  closeoutPackageHref: string;
  customerAccessHref: string;
  warrantyServiceHref: string;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function isArchived(attachment: ProjectEvidenceContinuityAttachment) {
  return Boolean(attachment.archivedAt);
}

function isPhoto(attachment: ProjectEvidenceContinuityAttachment) {
  return attachment.attachmentType === "photo";
}

function isPdf(attachment: ProjectEvidenceContinuityAttachment) {
  return attachment.mimeType.toLowerCase().includes("pdf");
}

function isUnresolvedFieldNote(note: ProjectEvidenceContinuityFieldNote) {
  return note.status !== "resolved";
}

function isOpenBlocker(note: ProjectEvidenceContinuityFieldNote) {
  return (
    note.status === "open" &&
    (note.noteType === "blocker" || note.noteType === "issue")
  );
}

function isSignedContract(record: ProjectEvidenceContinuityRecord) {
  return record.status === "signed";
}

function isPaidInvoice(record: ProjectEvidenceContinuityInvoice) {
  return record.status === "paid" || Number(record.balanceDueAmount ?? 0) <= 0;
}

function isOpenInvoice(record: ProjectEvidenceContinuityInvoice) {
  return (
    record.status !== "paid" &&
    record.status !== "void" &&
    Number(record.balanceDueAmount ?? 0) > 0
  );
}

function isApprovedChangeOrder(record: ProjectEvidenceContinuityRecord) {
  return record.status === "approved";
}

function firstRecordHref(
  records: ProjectEvidenceContinuityRecord[],
  baseHref: string,
  fallbackHref: string
) {
  return records[0] ? `${baseHref}/${records[0].id}` : fallbackHref;
}

function buildDocumentItem(
  item: ProjectEvidenceContinuityDocumentItem
): ProjectEvidenceContinuityDocumentItem {
  return item;
}

function getAttachmentHref(
  attachment: ProjectEvidenceContinuityAttachment,
  fieldNotesById: Map<string, ProjectEvidenceContinuityFieldNote>
) {
  if (attachment.subjectType === "daily_log") {
    return `/daily-logs/${attachment.subjectId}#field-evidence`;
  }

  const fieldNote = fieldNotesById.get(attachment.subjectId);

  return fieldNote
    ? `/daily-logs/${fieldNote.dailyLogId}#field-evidence`
    : "/daily-logs";
}

function getAttachmentDetail(attachment: ProjectEvidenceContinuityAttachment) {
  return attachment.caption?.trim() || attachment.fileName;
}

function pushTimelineItem(
  items: ProjectEvidenceContinuityTimelineItem[],
  item: ProjectEvidenceContinuityTimelineItem
) {
  items.push(item);
}

function buildTimeline(input: {
  attachments: ProjectEvidenceContinuityAttachment[];
  dailyLogs: ProjectEvidenceContinuityDailyLog[];
  fieldNotes: ProjectEvidenceContinuityFieldNote[];
  contracts: ProjectEvidenceContinuityRecord[];
  invoices: ProjectEvidenceContinuityInvoice[];
  changeOrders: ProjectEvidenceContinuityRecord[];
  warrantyDocuments: ProjectEvidenceContinuityWarrantyDocument[];
}) {
  const fieldNotesById = new Map(
    input.fieldNotes.map((note) => [note.id, note])
  );
  const timeline: ProjectEvidenceContinuityTimelineItem[] = [];

  for (const attachment of input.attachments) {
    const archived = isArchived(attachment);

    pushTimelineItem(timeline, {
      id: `${archived ? "archived" : "attachment"}:${attachment.id}`,
      type: archived ? "archive" : "field",
      title: archived ? "Field evidence archived" : "Field evidence added",
      detail: getAttachmentDetail(attachment),
      href: getAttachmentHref(attachment, fieldNotesById),
      occurredAt: attachment.archivedAt ?? attachment.createdAt,
      customerSafe: false
    });
  }

  for (const dailyLog of input.dailyLogs) {
    pushTimelineItem(timeline, {
      id: `daily_log:${dailyLog.id}`,
      type: "field",
      title:
        dailyLog.status === "finalized"
          ? "Daily Job Log finalized"
          : "Daily Job Log updated",
      detail: dailyLog.summary?.trim() || dailyLog.logDate,
      href: `/daily-logs/${dailyLog.id}`,
      occurredAt: dailyLog.updatedAt,
      customerSafe: false
    });
  }

  for (const fieldNote of input.fieldNotes) {
    pushTimelineItem(timeline, {
      id: `field_note:${fieldNote.id}`,
      type: "field",
      title: `${formatStatusLabel(fieldNote.noteType)} note ${formatStatusLabel(fieldNote.status)}`,
      detail: fieldNote.title,
      href: `/daily-logs/${fieldNote.dailyLogId}#job-notes`,
      occurredAt: fieldNote.updatedAt,
      customerSafe: false
    });
  }

  for (const contract of input.contracts.filter(isSignedContract)) {
    pushTimelineItem(timeline, {
      id: `contract:${contract.id}`,
      type: "document",
      title: "Contract signed",
      detail: contract.referenceNumber ?? contract.label ?? "Signed contract",
      href: `/contracts/${contract.id}`,
      occurredAt: contract.updatedAt ?? "",
      customerSafe: true
    });
  }

  for (const invoice of input.invoices.filter(isPaidInvoice)) {
    pushTimelineItem(timeline, {
      id: `invoice:${invoice.id}`,
      type: "document",
      title: "Invoice paid",
      detail: invoice.referenceNumber ?? invoice.label ?? "Paid invoice",
      href: `/invoices/${invoice.id}`,
      occurredAt: invoice.updatedAt ?? "",
      customerSafe: true
    });
  }

  for (const changeOrder of input.changeOrders.filter(isApprovedChangeOrder)) {
    pushTimelineItem(timeline, {
      id: `change_order:${changeOrder.id}`,
      type: "document",
      title: "Change order approved",
      detail:
        changeOrder.referenceNumber ??
        changeOrder.label ??
        "Approved change order",
      href: `/change-orders/${changeOrder.id}`,
      occurredAt: changeOrder.updatedAt ?? "",
      customerSafe: true
    });
  }

  for (const warrantyDocument of input.warrantyDocuments) {
    pushTimelineItem(timeline, {
      id: `warranty_document:${warrantyDocument.id}`,
      type: "closeout",
      title: "Warranty document connected",
      detail: warrantyDocument.title,
      href: `/warranty-documents/${warrantyDocument.id}`,
      occurredAt: warrantyDocument.updatedAt,
      customerSafe: warrantyDocument.status === "sent"
    });
  }

  return timeline
    .filter((item) => item.occurredAt)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 10);
}

function buildNextMove(input: {
  archivedEvidenceCount: number;
  latestArchivedAttachment: ProjectEvidenceContinuityAttachment | null;
  fieldNotesById: Map<string, ProjectEvidenceContinuityFieldNote>;
  closeoutTone: CloseoutTrailTone;
  closeoutBlockers: string[];
  closeoutNextMove: ProjectEvidenceContinuityNextMove;
  proofMissingItems: string[];
  proofNextMove: ProjectEvidenceContinuityNextMove;
  activeEvidenceCount: number;
  fieldHistoryCount: number;
  fieldTrailNextMove: ProjectEvidenceContinuityNextMove;
  proofCenterHref: string;
}) {
  if (input.closeoutTone === "blocked" || input.closeoutBlockers.length > 0) {
    return input.closeoutNextMove;
  }

  if (input.proofMissingItems.length > 0) {
    return input.proofNextMove;
  }

  if (input.fieldHistoryCount > 0 && input.activeEvidenceCount === 0) {
    return input.fieldTrailNextMove;
  }

  if (input.archivedEvidenceCount > 0 && input.latestArchivedAttachment) {
    return {
      label: "Review archived evidence",
      href: getAttachmentHref(
        input.latestArchivedAttachment,
        input.fieldNotesById
      ),
      reason:
        "Archived evidence is hidden from active proof counts but remains available for internal record review."
    };
  }

  return {
    label: "Review proof package",
    href: input.proofCenterHref,
    reason:
      "Project proof is connected enough to review the current document and evidence package."
  };
}

export function deriveProjectEvidenceContinuitySummary(
  input: ProjectEvidenceContinuityInput
): ProjectEvidenceContinuitySummary {
  const activeAttachments = input.attachments.filter(
    (attachment) => !isArchived(attachment)
  );
  const archivedAttachments = input.attachments.filter(isArchived);
  const openBlockers = input.fieldNotes.filter(isOpenBlocker);
  const unresolvedFieldNotes = input.fieldNotes.filter(isUnresolvedFieldNote);
  const signedContracts = input.contracts.filter(isSignedContract);
  const paidInvoices = input.invoices.filter(isPaidInvoice);
  const openInvoices = input.invoices.filter(isOpenInvoice);
  const approvedChangeOrders = input.changeOrders.filter(isApprovedChangeOrder);
  const customerFacingRecords =
    input.estimates.length +
    input.contracts.length +
    input.invoices.length +
    input.changeOrders.length;
  const customerSafeRecords =
    input.customerAccessCount > 0 ? customerFacingRecords : 0;
  const fieldHistoryCount = input.dailyLogs.length + input.fieldNotes.length;
  const fieldNotesById = new Map(
    input.fieldNotes.map((note) => [note.id, note])
  );
  const latestArchivedAttachment =
    [...archivedAttachments].sort((left, right) =>
      (right.archivedAt ?? right.createdAt).localeCompare(
        left.archivedAt ?? left.createdAt
      )
    )[0] ?? null;
  const officeReviewItems = [
    ...input.closeoutBlockers,
    ...input.proofMissingItems,
    ...(openBlockers.length > 0
      ? [
          `${openBlockers.length} open blocker or issue note${
            openBlockers.length === 1 ? "" : "s"
          } need office review.`
        ]
      : []),
    ...(openInvoices.length > 0
      ? [
          `${openInvoices.length} invoice${
            openInvoices.length === 1 ? "" : "s"
          } still have an open balance.`
        ]
      : []),
    ...(archivedAttachments.length > 0
      ? [
          `${archivedAttachments.length} archived evidence item${
            archivedAttachments.length === 1 ? "" : "s"
          } are hidden from active proof counts.`
        ]
      : [])
  ];
  const tone: ProjectEvidenceContinuityTone =
    input.closeoutTone === "blocked"
      ? "blocked"
      : officeReviewItems.length > 0 ||
          input.proofTone === "attention" ||
          input.proofTone === "missing"
        ? "attention"
        : activeAttachments.length > 0 ||
            signedContracts.length > 0 ||
            paidInvoices.length > 0
          ? "ready"
          : "neutral";
  const statusLabel =
    tone === "blocked"
      ? "Closeout blocked"
      : tone === "attention"
        ? "Needs review"
        : tone === "ready"
          ? "Proof connected"
          : "Building proof";
  const primaryMessage =
    tone === "blocked"
      ? "Project closeout proof has a blocking record that needs review before handoff."
      : tone === "attention"
        ? "Project evidence is connected, with proof or closeout items that need office review."
        : tone === "ready"
          ? "Project documents and field proof are connected across customer-safe records and internal evidence."
          : "Project proof will build as documents are sent, field work is logged, evidence is attached, and closeout records connect.";

  return {
    tone,
    statusLabel,
    primaryMessage,
    nextMove: buildNextMove({
      archivedEvidenceCount: archivedAttachments.length,
      latestArchivedAttachment,
      fieldNotesById,
      closeoutTone: input.closeoutTone,
      closeoutBlockers: input.closeoutBlockers,
      closeoutNextMove: input.closeoutNextMove,
      proofMissingItems: input.proofMissingItems,
      proofNextMove: input.proofNextMove,
      activeEvidenceCount: activeAttachments.length,
      fieldHistoryCount,
      fieldTrailNextMove: input.fieldTrailNextMove,
      proofCenterHref: input.proofCenterHref
    }),
    counts: {
      activeEvidence: activeAttachments.length,
      archivedEvidence: archivedAttachments.length,
      photos: activeAttachments.filter(isPhoto).length,
      pdfs: activeAttachments.filter(isPdf).length,
      dailyLogs: input.dailyLogs.length,
      fieldNotes: input.fieldNotes.length,
      unresolvedFieldNotes: unresolvedFieldNotes.length,
      customerSafeRecords,
      internalOnlyEvidence: activeAttachments.length,
      closeoutDocuments:
        input.warrantyDocuments.length + input.serviceTicketCount
    },
    boundary: {
      customerSafeLabel:
        customerSafeRecords > 0
          ? `${pluralize(customerSafeRecords, "customer-safe record")} visible through explicit project access.`
          : customerFacingRecords > 0
            ? "Customer-facing records exist, but explicit project access is not active."
            : "No customer-facing records are shared from this project yet.",
      internalEvidenceLabel:
        activeAttachments.length > 0
          ? `${pluralize(activeAttachments.length, "active evidence item")} remain contractor-only field proof.`
          : "No active contractor-only field evidence is attached yet.",
      archiveLabel:
        archivedAttachments.length > 0
          ? `${pluralize(archivedAttachments.length, "archived item")} are kept for internal review and excluded from active proof counts.`
          : "No archived field evidence is recorded for this project."
    },
    officeReviewItems: officeReviewItems.slice(0, 5),
    documentGroups: [
      {
        id: "customer_safe_records",
        title: "Customer-safe records",
        items: [
          buildDocumentItem({
            id: "estimate",
            label: "Estimates",
            status: pluralize(input.estimates.length, "estimate"),
            detail:
              input.estimates.length > 0
                ? "Proposal records stay customer-safe when shared through portal access."
                : "No estimate document is connected yet.",
            href: firstRecordHref(input.estimates, "/estimates", "/estimates"),
            tone: input.estimates.length > 0 ? "ready" : "missing",
            customerSafe: input.customerAccessCount > 0
          }),
          buildDocumentItem({
            id: "contract",
            label: "Contracts",
            status: `${signedContracts.length} signed / ${input.contracts.length} total`,
            detail:
              signedContracts.length > 0
                ? "Signed agreement proof is connected."
                : input.contracts.length > 0
                  ? "Contract exists, but signature proof still needs review."
                  : "No contract document is connected yet.",
            href: firstRecordHref(input.contracts, "/contracts", "/contracts"),
            tone:
              signedContracts.length > 0
                ? "ready"
                : input.contracts.length > 0
                  ? "attention"
                  : "missing",
            customerSafe: input.customerAccessCount > 0
          }),
          buildDocumentItem({
            id: "invoice",
            label: "Invoices",
            status: `${paidInvoices.length} paid / ${input.invoices.length} total`,
            detail:
              openInvoices.length > 0
                ? "Billing proof has open collection exposure."
                : input.invoices.length > 0
                  ? "Invoice proof is connected to this project."
                  : "No invoice document is connected yet.",
            href: firstRecordHref(input.invoices, "/invoices", "/invoices"),
            tone:
              openInvoices.length > 0
                ? "attention"
                : input.invoices.length > 0
                  ? "ready"
                  : "missing",
            customerSafe: input.customerAccessCount > 0
          }),
          buildDocumentItem({
            id: "change_orders",
            label: "Change orders",
            status: `${approvedChangeOrders.length} approved / ${input.changeOrders.length} total`,
            detail:
              input.changeOrders.length > 0
                ? "Scope-change proof stays on the project commercial chain."
                : "No change-order documents are connected.",
            href: firstRecordHref(
              input.changeOrders,
              "/change-orders",
              "/change-orders"
            ),
            tone:
              input.changeOrders.length > 0 &&
              approvedChangeOrders.length < input.changeOrders.length
                ? "attention"
                : "neutral",
            customerSafe: input.customerAccessCount > 0
          })
        ]
      },
      {
        id: "internal_proof",
        title: "Internal proof",
        items: [
          buildDocumentItem({
            id: "active_field_evidence",
            label: "Active field evidence",
            status: `${activeAttachments.length} active`,
            detail:
              activeAttachments.length > 0
                ? `${pluralize(activeAttachments.filter(isPhoto).length, "photo")} and ${pluralize(activeAttachments.filter(isPdf).length, "PDF")} are attached to Daily Logs or Job Notes.`
                : fieldHistoryCount > 0
                  ? "Field history exists, but active proof files are missing."
                  : "Field evidence appears after Daily Logs or Job Notes receive files.",
            href: input.fieldTrailHref,
            tone:
              activeAttachments.length > 0
                ? "ready"
                : fieldHistoryCount > 0
                  ? "attention"
                  : "neutral",
            customerSafe: false
          }),
          buildDocumentItem({
            id: "archived_field_evidence",
            label: "Archived evidence",
            status: `${archivedAttachments.length} archived`,
            detail:
              archivedAttachments.length > 0
                ? "Archived evidence is retained for internal review but excluded from active proof."
                : "No archived evidence is recorded.",
            href: latestArchivedAttachment
              ? getAttachmentHref(latestArchivedAttachment, fieldNotesById)
              : input.fieldTrailHref,
            tone: archivedAttachments.length > 0 ? "attention" : "neutral",
            customerSafe: false
          }),
          buildDocumentItem({
            id: "job_notes",
            label: "Job Notes",
            status: `${unresolvedFieldNotes.length} unresolved / ${input.fieldNotes.length} total`,
            detail:
              unresolvedFieldNotes.length > 0
                ? "Open field notes may affect billing, warranty, or dispute support."
                : "Field notes do not show unresolved blockers.",
            href: input.fieldTrailHref,
            tone: unresolvedFieldNotes.length > 0 ? "attention" : "ready",
            customerSafe: false
          })
        ]
      },
      {
        id: "closeout_handoff",
        title: "Closeout handoff",
        items: [
          buildDocumentItem({
            id: "closeout_package",
            label: "Closeout package",
            status: input.closeoutTone === "ready" ? "Ready" : statusLabel,
            detail:
              input.closeoutTone === "ready"
                ? "CloseoutTrail is ready enough for package review."
                : "Closeout package review should follow the current closeout blockers.",
            href: input.closeoutPackageHref,
            tone: input.closeoutTone === "ready" ? "ready" : "attention",
            customerSafe: false
          }),
          buildDocumentItem({
            id: "warranty_documents",
            label: "Warranty documents",
            status: pluralize(input.warrantyDocuments.length, "document"),
            detail:
              input.warrantyDocuments.length > 0
                ? "Warranty documents are connected to project handoff."
                : "Warranty documents are not connected yet.",
            href: input.warrantyServiceHref,
            tone: input.warrantyDocuments.length > 0 ? "ready" : "neutral",
            customerSafe: false
          }),
          buildDocumentItem({
            id: "customer_access",
            label: "Customer Access",
            status: pluralize(input.customerAccessCount, "contact"),
            detail:
              input.customerAccessCount > 0
                ? "Customer-safe records have explicit project access."
                : "Do not expose evidence or project files until access is explicit.",
            href: input.customerAccessHref,
            tone: input.customerAccessCount > 0 ? "ready" : "attention",
            customerSafe: input.customerAccessCount > 0
          })
        ]
      }
    ],
    timeline: buildTimeline({
      attachments: input.attachments,
      dailyLogs: input.dailyLogs,
      fieldNotes: input.fieldNotes,
      contracts: input.contracts,
      invoices: input.invoices,
      changeOrders: input.changeOrders,
      warrantyDocuments: input.warrantyDocuments
    })
  };
}
