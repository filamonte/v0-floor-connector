type ServiceCenterTicket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  ticketType: string;
  projectId: string | null;
  jobId: string | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
};

type ServiceCenterWarrantyDocument = {
  id: string;
  title: string;
  status: string;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
  signatureSummary?: {
    signerCount: number;
    requestedSignerCount: number;
    signedSignerCount: number;
  };
};

type ServiceCenterJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate: string | null;
};

export type ServiceCenterNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type ServiceCenterSummary = {
  openTicketCount: number;
  closedTicketCount: number;
  warrantyDocumentCount: number;
  serviceJobCount: number;
  unscheduledServiceJobCount: number;
  requestedSignatureCount: number;
  signedSignatureCount: number;
  coverageLabel: string;
  latestServiceTicketStatus: string | null;
  evidenceContextLabel: string;
  nextMove: ServiceCenterNextMove;
  highlights: string[];
  warnings: string[];
};

const closedTicketStatuses = new Set(["resolved", "closed", "canceled"]);
const urgentPriorities = new Set(["urgent", "high"]);

function isOpenTicket(ticket: ServiceCenterTicket) {
  return !closedTicketStatuses.has(ticket.status);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getTicketHref(ticket: ServiceCenterTicket) {
  return `/service-tickets/${ticket.id}`;
}

function getWarrantyDocumentHref(document: ServiceCenterWarrantyDocument) {
  return `/warranty-documents/${document.id}`;
}

function getServiceJobScheduleHref(job: ServiceCenterJob) {
  return `/schedule?jobId=${job.id}&action=schedule#schedule-action`;
}

function deriveCoverageLabel(input: {
  tickets: ServiceCenterTicket[];
  warrantyDocuments: ServiceCenterWarrantyDocument[];
}) {
  const activeWarrantyDocument = input.warrantyDocuments.find(
    (document) => document.status !== "void"
  );

  if (activeWarrantyDocument) {
    return activeWarrantyDocument.warrantyStartDate ||
      activeWarrantyDocument.warrantyEndDate
      ? "Warranty handoff documented"
      : "Warranty document linked";
  }

  const ticketWithCoverage = input.tickets.find(
    (ticket) =>
      Boolean(ticket.warrantyBasis) ||
      Boolean(ticket.warrantyStartDate) ||
      Boolean(ticket.warrantyEndDate)
  );

  if (ticketWithCoverage) {
    return "Warranty context on ticket";
  }

  return "Warranty handoff not recorded";
}

export function deriveServiceCenterSummary(input: {
  tickets: ServiceCenterTicket[];
  warrantyDocuments: ServiceCenterWarrantyDocument[];
  serviceJobs?: ServiceCenterJob[];
  serviceCenterHref?: string;
  closeoutPackageHref?: string | null;
  proofContextCount?: number;
  closeoutReady?: boolean;
}): ServiceCenterSummary {
  const serviceJobs = input.serviceJobs ?? [];
  const openTickets = input.tickets.filter(isOpenTicket);
  const closedTickets = input.tickets.filter((ticket) =>
    closedTicketStatuses.has(ticket.status)
  );
  const urgentTicket = openTickets.find((ticket) =>
    urgentPriorities.has(ticket.priority)
  );
  const latestOpenTicket = openTickets[0] ?? null;
  const unscheduledServiceJob = serviceJobs.find(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const requestedSignatureDocument = input.warrantyDocuments.find(
    (document) =>
      (document.signatureSummary?.requestedSignerCount ?? 0) >
      (document.signatureSummary?.signedSignerCount ?? 0)
  );
  const requestedSignatureCount = input.warrantyDocuments.reduce(
    (total, document) =>
      total + (document.signatureSummary?.requestedSignerCount ?? 0),
    0
  );
  const signedSignatureCount = input.warrantyDocuments.reduce(
    (total, document) =>
      total + (document.signatureSummary?.signedSignerCount ?? 0),
    0
  );
  const proofContextCount = input.proofContextCount ?? 0;
  const serviceCenterHref = input.serviceCenterHref ?? "/service-tickets";
  const evidenceContextLabel =
    proofContextCount > 0
      ? `${proofContextCount} proof/context item${proofContextCount === 1 ? "" : "s"} available`
      : "Review Proof Center and CloseoutTrail for original project context";

  let nextMove: ServiceCenterNextMove;

  if (urgentTicket) {
    nextMove = {
      label: "Review high-priority ticket",
      href: getTicketHref(urgentTicket),
      reason: `${urgentTicket.title} is still ${formatLabel(
        urgentTicket.status
      )}.`
    };
  } else if (latestOpenTicket) {
    nextMove = {
      label: "Review open service ticket",
      href: getTicketHref(latestOpenTicket),
      reason: `${latestOpenTicket.title} is the latest open follow-up.`
    };
  } else if (unscheduledServiceJob) {
    nextMove = {
      label: "Schedule service job",
      href: getServiceJobScheduleHref(unscheduledServiceJob),
      reason: "A linked service job exists but is not scheduled yet."
    };
  } else if (requestedSignatureDocument) {
    nextMove = {
      label: "Review warranty signature",
      href: getWarrantyDocumentHref(requestedSignatureDocument),
      reason: `${requestedSignatureDocument.title} has requested signer follow-up.`
    };
  } else if (input.closeoutPackageHref) {
    nextMove = {
      label: "Review closeout proof",
      href: input.closeoutPackageHref,
      reason:
        "Use the current closeout package and proof records before starting new service work."
    };
  } else {
    nextMove = {
      label: "Open Service Center",
      href: serviceCenterHref,
      reason:
        "No active service ticket is blocking this record; create one only when follow-up is needed."
    };
  }

  const highlights = [
    input.closeoutReady
      ? "CloseoutTrail is currently ready for service handoff context."
      : null,
    proofContextCount > 0
      ? "Proof Center and field evidence can support service evaluation."
      : null,
    input.warrantyDocuments.length > 0
      ? "Warranty documents are linked to this record."
      : null
  ].filter((value): value is string => Boolean(value));

  const warnings = [
    openTickets.length > 0
      ? `${openTickets.length} open service ticket${openTickets.length === 1 ? "" : "s"} need follow-through.`
      : null,
    unscheduledServiceJob
      ? "At least one service job is not scheduled yet."
      : null,
    requestedSignatureDocument
      ? "Warranty signature follow-up is still requested."
      : null,
    input.warrantyDocuments.length === 0
      ? "Warranty handoff has not been added yet."
      : null
  ].filter((value): value is string => Boolean(value));

  return {
    openTicketCount: openTickets.length,
    closedTicketCount: closedTickets.length,
    warrantyDocumentCount: input.warrantyDocuments.length,
    serviceJobCount: serviceJobs.length,
    unscheduledServiceJobCount: serviceJobs.filter(
      (job) => job.dispatchStatus === "unscheduled"
    ).length,
    requestedSignatureCount,
    signedSignatureCount,
    coverageLabel: deriveCoverageLabel(input),
    latestServiceTicketStatus: input.tickets[0]?.status ?? null,
    evidenceContextLabel,
    nextMove,
    highlights,
    warnings
  };
}
