import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type { MessageCenterSummary } from "@/lib/messagecenter/summary";

export type ProofCenterTone = "ready" | "attention" | "missing" | "neutral";

export type ProofCenterItemTone = "ready" | "attention" | "missing" | "neutral";

export type ProofCenterNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type ProofCenterSectionItem = {
  id: string;
  label: string;
  status: string;
  detail: string;
  href: string;
  tone: ProofCenterItemTone;
};

export type ProofCenterSection = {
  id:
    | "commercial_records"
    | "customer_actions"
    | "billing_proof"
    | "field_proof"
    | "closeout_support";
  title: string;
  items: ProofCenterSectionItem[];
};

export type ProofCenterCounts = {
  estimates: number;
  contracts: number;
  signedContracts: number;
  invoices: number;
  paidInvoices: number;
  paymentTrailItems: number;
  signatureTrailItems: number;
  sendTrailItems: number;
  changeOrders: number;
  dailyJobLogs: number;
  jobNotes: number;
  evidenceItems: number;
  warrantyDocuments: number;
  serviceTickets: number;
  customerAccessItems: number;
};

export type ProofCenterSummary = {
  proofTone: ProofCenterTone;
  primaryMessage: string;
  sections: ProofCenterSection[];
  counts: ProofCenterCounts;
  missingProofItems: string[];
  nextMove: ProofCenterNextMove;
};

export type ProofCenterContract = {
  id: string;
  status: string;
};

export type ProofCenterInvoice = {
  id: string;
  status: string;
};

export type ProofCenterChangeOrder = {
  id: string;
  status: string;
};

export type ProofCenterInput = {
  projectId: string;
  estimates: Array<{ id: string; status: string }>;
  contracts: ProofCenterContract[];
  invoices: ProofCenterInvoice[];
  changeOrders: ProofCenterChangeOrder[];
  jobs: Array<{ id: string; dispatchStatus: string }>;
  fieldTrail: FieldTrailSummary;
  messageCenter: MessageCenterSummary;
  customerAccessCount: number;
  warrantyDocumentCount: number;
  serviceTicketCount: number;
  closeoutReady: boolean;
  latestEstimateHref: string;
  latestContractHref: string;
  latestInvoiceHref: string;
  latestChangeOrderHref: string;
  dailyLogsHref: string;
  fieldTrailHref: string;
  messageCenterHref: string;
  customerAccessHref: string;
  warrantyServiceHref: string;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function hasSignedContract(contract: ProofCenterContract) {
  return contract.status === "signed";
}

function hasPaidInvoice(invoice: ProofCenterInvoice) {
  return invoice.status === "paid";
}

function hasStartedFieldWork(input: ProofCenterInput) {
  return input.jobs.some(
    (job) =>
      job.dispatchStatus === "scheduled" ||
      job.dispatchStatus === "in_progress" ||
      job.dispatchStatus === "completed"
  );
}

function buildItem(item: ProofCenterSectionItem): ProofCenterSectionItem {
  return item;
}

function buildNextMove(input: {
  counts: ProofCenterCounts;
  jobs: ProofCenterInput["jobs"];
  customerFacingRecordCount: number;
  closeoutReady: boolean;
  latestContractHref: string;
  latestInvoiceHref: string;
  dailyLogsHref: string;
  fieldTrailHref: string;
  customerAccessHref: string;
  warrantyServiceHref: string;
  projectId: string;
}): ProofCenterNextMove {
  const fieldWorkStarted = input.jobs.some(
    (job) =>
      job.dispatchStatus === "scheduled" ||
      job.dispatchStatus === "in_progress" ||
      job.dispatchStatus === "completed"
  );

  if (input.counts.contracts > 0 && input.counts.signedContracts === 0) {
    return {
      label: "Review Signature Trail",
      href: input.latestContractHref,
      reason: "A contract exists, but signed agreement proof is still missing."
    };
  }

  if (
    input.counts.invoices > 0 &&
    input.counts.paidInvoices === 0 &&
    input.counts.paymentTrailItems === 0
  ) {
    return {
      label: "Review Payment Trail",
      href: input.latestInvoiceHref,
      reason:
        "Invoices exist, but no paid invoice or payment trail proof is visible yet."
    };
  }

  if (
    input.jobs.length > 0 &&
    (fieldWorkStarted ||
      input.jobs.some((job) => job.dispatchStatus === "unscheduled")) &&
    input.counts.dailyJobLogs === 0
  ) {
    return {
      label: "Review Daily Job Logs",
      href: input.dailyLogsHref,
      reason: "Project jobs exist, but no Daily Job Log proof is attached yet."
    };
  }

  if (
    input.counts.evidenceItems === 0 &&
    (input.counts.dailyJobLogs > 0 || input.counts.jobNotes > 0)
  ) {
    return {
      label: "Review FieldTrail",
      href: input.fieldTrailHref,
      reason:
        "Field history exists, but no evidence attachments or photos are visible yet."
    };
  }

  if (
    input.customerFacingRecordCount > 0 &&
    input.counts.customerAccessItems === 0
  ) {
    return {
      label: "Review Customer Access",
      href: input.customerAccessHref,
      reason:
        "Customer-facing records exist, but no active Customer Access is visible for this project."
    };
  }

  if (
    input.closeoutReady &&
    (input.counts.warrantyDocuments > 0 || input.counts.serviceTickets > 0)
  ) {
    return {
      label: "Review closeout proof",
      href: input.warrantyServiceHref,
      reason:
        "Closeout proof is ready enough to review the connected warranty or service handoff."
    };
  }

  return {
    label: "Review project proof",
    href: `/projects/${input.projectId}#proofcenter`,
    reason: "Project proof is available for review from the records below."
  };
}

export function deriveProofCenterSummary(
  input: ProofCenterInput
): ProofCenterSummary {
  const signedContracts = input.contracts.filter(hasSignedContract);
  const paidInvoices = input.invoices.filter(hasPaidInvoice);
  const counts: ProofCenterCounts = {
    estimates: input.estimates.length,
    contracts: input.contracts.length,
    signedContracts: signedContracts.length,
    invoices: input.invoices.length,
    paidInvoices: paidInvoices.length,
    paymentTrailItems: input.messageCenter.paymentTrailCount,
    signatureTrailItems: input.messageCenter.signatureTrailCount,
    sendTrailItems: input.messageCenter.sendTrailCount,
    changeOrders: input.changeOrders.length,
    dailyJobLogs: input.fieldTrail.dailyLogCount,
    jobNotes: input.fieldTrail.fieldNoteCount,
    evidenceItems: input.fieldTrail.attachmentCount,
    warrantyDocuments: input.warrantyDocumentCount,
    serviceTickets: input.serviceTicketCount,
    customerAccessItems: input.customerAccessCount
  };
  const customerFacingRecordCount =
    counts.estimates + counts.contracts + counts.invoices + counts.changeOrders;
  const fieldWorkStarted = hasStartedFieldWork(input);
  const missingProofItems = [
    ...(counts.contracts > 0 && counts.signedContracts === 0
      ? ["Signed contract proof is missing."]
      : []),
    ...(counts.invoices > 0 &&
    counts.paidInvoices === 0 &&
    counts.paymentTrailItems === 0
      ? ["Payment proof is missing for connected invoices."]
      : []),
    ...(input.jobs.length > 0 && counts.dailyJobLogs === 0
      ? ["Daily Job Log proof is missing for connected jobs."]
      : []),
    ...(counts.evidenceItems === 0 &&
    (fieldWorkStarted || counts.dailyJobLogs > 0 || counts.jobNotes > 0)
      ? ["Field evidence is not attached yet."]
      : []),
    ...(customerFacingRecordCount > 0 && counts.customerAccessItems === 0
      ? ["Customer Access is not active for the project."]
      : [])
  ];
  const sections: ProofCenterSection[] = [
    {
      id: "commercial_records",
      title: "Commercial records",
      items: [
        buildItem({
          id: "estimate",
          label: "Estimate",
          status:
            counts.estimates > 0
              ? pluralize(counts.estimates, "estimate")
              : "Missing",
          detail:
            counts.estimates > 0
              ? "Estimate records are connected to the project."
              : "No estimate record is connected yet.",
          href: input.latestEstimateHref,
          tone: counts.estimates > 0 ? "ready" : "missing"
        }),
        buildItem({
          id: "contract",
          label: "Contract",
          status:
            counts.contracts > 0
              ? `${counts.signedContracts} signed / ${counts.contracts} total`
              : "Missing",
          detail:
            counts.signedContracts > 0
              ? "Signed contract proof is connected."
              : counts.contracts > 0
                ? "Contract exists, but signed proof is still missing."
                : "No contract record is connected yet.",
          href: input.latestContractHref,
          tone:
            counts.signedContracts > 0
              ? "ready"
              : counts.contracts > 0
                ? "attention"
                : "missing"
        }),
        buildItem({
          id: "change_orders",
          label: "Change orders",
          status:
            counts.changeOrders > 0
              ? pluralize(counts.changeOrders, "change order")
              : "None",
          detail:
            counts.changeOrders > 0
              ? "Change-order records are connected to the project."
              : "No change orders are connected.",
          href: input.latestChangeOrderHref,
          tone: counts.changeOrders > 0 ? "neutral" : "neutral"
        })
      ]
    },
    {
      id: "customer_actions",
      title: "Customer actions",
      items: [
        buildItem({
          id: "signature_trail",
          label: "Signature Trail",
          status: pluralize(counts.signatureTrailItems, "event"),
          detail:
            counts.signatureTrailItems > 0
              ? "Signature history is available from connected contracts."
              : counts.contracts > 0
                ? "No signature history is visible yet."
                : "Signature history appears after contract activity.",
          href: input.latestContractHref,
          tone:
            counts.signatureTrailItems > 0 || counts.signedContracts > 0
              ? "ready"
              : counts.contracts > 0
                ? "attention"
                : "neutral"
        }),
        buildItem({
          id: "send_trail",
          label: "Send Trail",
          status: pluralize(counts.sendTrailItems, "event"),
          detail:
            counts.sendTrailItems > 0
              ? "Send and delivery history is connected."
              : "Send history appears when documents are sent or delivery evidence is recorded.",
          href: input.messageCenterHref,
          tone: counts.sendTrailItems > 0 ? "ready" : "neutral"
        }),
        buildItem({
          id: "customer_access",
          label: "Customer Access",
          status: pluralize(counts.customerAccessItems, "contact"),
          detail:
            counts.customerAccessItems > 0
              ? "Active customer visibility is connected to this project."
              : customerFacingRecordCount > 0
                ? "Customer-facing records exist, but access is not active."
                : "Customer Access appears when project sharing is active.",
          href: input.customerAccessHref,
          tone:
            counts.customerAccessItems > 0
              ? "ready"
              : customerFacingRecordCount > 0
                ? "attention"
                : "neutral"
        })
      ]
    },
    {
      id: "billing_proof",
      title: "Billing proof",
      items: [
        buildItem({
          id: "invoice",
          label: "Invoice",
          status:
            counts.invoices > 0
              ? `${counts.paidInvoices} paid / ${counts.invoices} total`
              : "Missing",
          detail:
            counts.invoices > 0
              ? "Invoice records are connected to the project."
              : "No invoice record is connected yet.",
          href: input.latestInvoiceHref,
          tone:
            counts.invoices === 0
              ? "missing"
              : counts.paidInvoices > 0
                ? "ready"
                : "attention"
        }),
        buildItem({
          id: "payment_trail",
          label: "Payment Trail",
          status: pluralize(counts.paymentTrailItems, "event"),
          detail:
            counts.paymentTrailItems > 0
              ? "Payment history is connected to project invoices."
              : counts.invoices > 0
                ? "No payment trail proof is visible yet."
                : "Payment history appears after invoice payment activity.",
          href: input.latestInvoiceHref,
          tone:
            counts.paymentTrailItems > 0 || counts.paidInvoices > 0
              ? "ready"
              : counts.invoices > 0
                ? "attention"
                : "neutral"
        })
      ]
    },
    {
      id: "field_proof",
      title: "Field proof",
      items: [
        buildItem({
          id: "daily_job_logs",
          label: "Daily Job Logs",
          status: pluralize(counts.dailyJobLogs, "log"),
          detail:
            counts.dailyJobLogs > 0
              ? "Daily Job Log proof is connected."
              : input.jobs.length > 0
                ? "Project jobs exist, but no Daily Job Log proof is connected."
                : "Daily Job Logs appear after field execution starts.",
          href: input.dailyLogsHref,
          tone:
            counts.dailyJobLogs > 0
              ? "ready"
              : input.jobs.length > 0
                ? "attention"
                : "neutral"
        }),
        buildItem({
          id: "job_notes",
          label: "Job Notes",
          status: pluralize(counts.jobNotes, "note"),
          detail:
            counts.jobNotes > 0
              ? "Job Notes are connected through field history."
              : "Job Notes appear from Daily Job Log field context.",
          href: input.fieldTrailHref,
          tone: counts.jobNotes > 0 ? "neutral" : "neutral"
        }),
        buildItem({
          id: "field_evidence",
          label: "Evidence / attachments",
          status: pluralize(counts.evidenceItems, "item"),
          detail:
            counts.evidenceItems > 0
              ? "Field evidence and attachments are connected."
              : counts.dailyJobLogs > 0 || counts.jobNotes > 0
                ? "Field history exists, but evidence is not attached yet."
                : "Evidence appears when Daily Job Logs or Job Notes have files.",
          href: input.fieldTrailHref,
          tone:
            counts.evidenceItems > 0
              ? "ready"
              : counts.dailyJobLogs > 0 || counts.jobNotes > 0
                ? "attention"
                : "neutral"
        })
      ]
    },
    {
      id: "closeout_support",
      title: "Closeout / support",
      items: [
        buildItem({
          id: "warranty_documents",
          label: "Warranty documents",
          status: pluralize(counts.warrantyDocuments, "document"),
          detail:
            counts.warrantyDocuments > 0
              ? "Warranty documents are connected to project handoff."
              : "Warranty documents are not connected yet.",
          href: input.warrantyServiceHref,
          tone: counts.warrantyDocuments > 0 ? "ready" : "neutral"
        }),
        buildItem({
          id: "service_tickets",
          label: "Service tickets",
          status: pluralize(counts.serviceTickets, "ticket"),
          detail:
            counts.serviceTickets > 0
              ? "Service tickets are connected to project support history."
              : "Service tickets are not connected yet.",
          href: input.warrantyServiceHref,
          tone: counts.serviceTickets > 0 ? "neutral" : "neutral"
        })
      ]
    }
  ];
  const nextMove = buildNextMove({
    counts,
    jobs: input.jobs,
    customerFacingRecordCount,
    closeoutReady: input.closeoutReady,
    latestContractHref: input.latestContractHref,
    latestInvoiceHref: input.latestInvoiceHref,
    dailyLogsHref: input.dailyLogsHref,
    fieldTrailHref: input.fieldTrailHref,
    customerAccessHref: input.customerAccessHref,
    warrantyServiceHref: input.warrantyServiceHref,
    projectId: input.projectId
  });
  const proofTone: ProofCenterTone =
    missingProofItems.length === 0 &&
    (counts.signedContracts > 0 ||
      counts.paidInvoices > 0 ||
      counts.dailyJobLogs > 0 ||
      counts.evidenceItems > 0)
      ? "ready"
      : missingProofItems.some((item) => item.includes("missing"))
        ? "missing"
        : missingProofItems.length > 0
          ? "attention"
          : "neutral";
  const primaryMessage =
    proofTone === "ready"
      ? "Project proof is connected across commercial, customer, billing, field, and closeout records."
      : proofTone === "missing"
        ? "Some expected project proof is missing from the connected records."
        : proofTone === "attention"
          ? "Project proof exists, with a few records that need review."
          : "Project proof will build as records are sent, signed, paid, logged, or shared.";

  return {
    proofTone,
    primaryMessage,
    sections,
    counts,
    missingProofItems,
    nextMove
  };
}
