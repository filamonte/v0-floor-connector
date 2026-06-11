import type { PaymentEventType } from "@floorconnector/types";

import type { PortalAccessibleProjectListItem } from "./data";
import {
  derivePortalSafeStatusExplanation,
  type PortalSafeStatusExplanation
} from "./status-explanation";

export type PortalOrganizationTone =
  | "neutral"
  | "attention"
  | "complete"
  | "warning";

export type PortalHomeAttentionItem = {
  key: string;
  projectId: string;
  projectName: string;
  label: string;
  title: string;
  description: string;
  href: string;
  tone: PortalOrganizationTone;
  updatedAt: string;
};

export type PortalHomeProjectItem = {
  project: PortalAccessibleProjectListItem;
  explanation: PortalSafeStatusExplanation;
  statusLabel: string;
  nextActionLabel: string;
  nextActionHref: string;
  updatedAt: string;
};

export type PortalHomeDocumentItem = {
  key: string;
  projectId: string;
  projectName: string;
  type: "estimate" | "contract";
  label: string;
  statusLabel: string;
  href: string;
  tone: PortalOrganizationTone;
  updatedAt: string;
};

export type PortalHomeInvoiceItem = {
  key: string;
  projectId: string;
  projectName: string;
  referenceNumber: string;
  statusLabel: string;
  balanceLabel: string;
  paymentStateLabel: string;
  href: string;
  tone: PortalOrganizationTone;
  updatedAt: string;
};

export type PortalHomeOrganization = {
  attentionItems: PortalHomeAttentionItem[];
  activeProjects: PortalHomeProjectItem[];
  documentItems: PortalHomeDocumentItem[];
  invoiceItems: PortalHomeInvoiceItem[];
  historyProjects: PortalHomeProjectItem[];
};

function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatMoneyLabel(value: string | number | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getSortTime(value: string | null | undefined) {
  return value ? new Date(value).getTime() || 0 : 0;
}

function sortByAttentionThenRecent<
  T extends { tone?: string; updatedAt: string }
>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.tone !== right.tone) {
      if (left.tone === "attention" || left.tone === "warning") {
        return -1;
      }

      if (right.tone === "attention" || right.tone === "warning") {
        return 1;
      }
    }

    return getSortTime(right.updatedAt) - getSortTime(left.updatedAt);
  });
}

function getProjectStatusLabel(explanation: PortalSafeStatusExplanation) {
  switch (explanation.sourceCategory) {
    case "estimate":
      return "Ready for Review";
    case "contract":
      return explanation.headline.includes("signature")
        ? "Waiting for Signature"
        : "Ready for Review";
    case "change_order":
      return "Ready for Review";
    case "invoice":
    case "payment":
      return "Payment Due";
    case "schedule":
      return explanation.statusTone === "complete"
        ? "Completed"
        : "In Progress";
    case "project":
      return explanation.statusTone === "complete"
        ? "Completed"
        : "In Progress";
    default:
      return "In Progress";
  }
}

function getInvoiceTone(input: {
  status: string | null;
  balanceDueAmount: string | null;
  latestPaymentEventType: PaymentEventType | null;
}): PortalOrganizationTone {
  if (input.latestPaymentEventType === "payment_failed") {
    return "warning";
  }

  if (
    input.latestPaymentEventType === "payment_requested" ||
    input.latestPaymentEventType === "checkout_started"
  ) {
    return "attention";
  }

  if (input.status === "paid" || Number(input.balanceDueAmount ?? 0) <= 0) {
    return "complete";
  }

  if (input.status === "void") {
    return "neutral";
  }

  return "attention";
}

function getInvoicePaymentStateLabel(input: {
  status: string | null;
  balanceDueAmount: string | null;
  latestPaymentEventType: PaymentEventType | null;
}) {
  switch (input.latestPaymentEventType) {
    case "payment_failed":
      return "Payment needs review";
    case "checkout_started":
      return "Payment in progress";
    case "payment_requested":
      return "Payment Due";
    case "payment_succeeded":
      return Number(input.balanceDueAmount ?? 0) > 0
        ? "Partially paid"
        : "Paid";
    default:
      if (input.status === "paid" || Number(input.balanceDueAmount ?? 0) <= 0) {
        return "Paid";
      }

      if (input.status === "partially_paid") {
        return "Partially paid";
      }

      return "Payment Due";
  }
}

function getProjectExplanation(project: PortalAccessibleProjectListItem) {
  return derivePortalSafeStatusExplanation({
    projectId: project.id,
    projectName: project.name,
    projectStatus: project.status,
    estimates:
      project.latestEstimateId && project.latestEstimateStatus
        ? [
            {
              id: project.latestEstimateId,
              status: project.latestEstimateStatus,
              updatedAt: project.updatedAt
            }
          ]
        : [],
    contracts:
      project.latestContractId && project.latestContractStatus
        ? [
            {
              id: project.latestContractId,
              status: project.latestContractStatus,
              updatedAt: project.updatedAt
            }
          ]
        : [],
    invoices:
      project.latestInvoiceId && project.latestInvoiceStatus
        ? [
            {
              id: project.latestInvoiceId,
              status: project.latestInvoiceStatus,
              referenceNumber: project.latestInvoiceReferenceNumber,
              workflowRole: project.latestInvoiceWorkflowRole,
              balanceDueAmount: project.latestInvoiceBalanceDueAmount,
              latestPaymentEventType: project.latestInvoicePaymentEventType,
              latestPaymentEventAt: project.latestInvoicePaymentEventAt,
              updatedAt: project.updatedAt
            }
          ]
        : [],
    jobs:
      project.latestJobId && project.latestJobDispatchStatus
        ? [
            {
              id: project.latestJobId,
              dispatchStatus: project.latestJobDispatchStatus,
              scheduledDate: project.latestJobScheduledDate,
              scheduledStartAt: project.latestJobScheduledStartAt,
              scheduledEndAt: project.latestJobScheduledEndAt,
              updatedAt: project.updatedAt
            }
          ]
        : []
  });
}

function mapAttentionItem(
  project: PortalAccessibleProjectListItem,
  explanation: PortalSafeStatusExplanation
): PortalHomeAttentionItem | null {
  if (!explanation.customerActionHref) {
    return null;
  }

  return {
    key: `${project.id}-${explanation.sourceCategory}`,
    projectId: project.id,
    projectName: project.name,
    label: getProjectStatusLabel(explanation),
    title: explanation.headline,
    description: explanation.shortExplanation,
    href: explanation.customerActionHref,
    tone: explanation.statusTone,
    updatedAt: project.updatedAt
  };
}

function mapDocumentItems(
  project: PortalAccessibleProjectListItem
): PortalHomeDocumentItem[] {
  const items: PortalHomeDocumentItem[] = [];

  if (project.latestEstimateId) {
    items.push({
      key: `${project.id}-estimate-${project.latestEstimateId}`,
      projectId: project.id,
      projectName: project.name,
      type: "estimate",
      label: "Estimate",
      statusLabel:
        project.latestEstimateStatus === "sent"
          ? "Ready for Review"
          : formatStatusLabel(project.latestEstimateStatus),
      href: `/portal/estimates/${project.latestEstimateId}`,
      tone:
        project.latestEstimateStatus === "sent"
          ? "attention"
          : project.latestEstimateStatus === "approved"
            ? "complete"
            : "neutral",
      updatedAt: project.updatedAt
    });
  }

  if (project.latestContractId) {
    const contractNeedsAttention =
      project.latestContractStatus !== "signed" &&
      project.latestContractStatus !== "void";

    items.push({
      key: `${project.id}-contract-${project.latestContractId}`,
      projectId: project.id,
      projectName: project.name,
      type: "contract",
      label: "Contract",
      statusLabel: contractNeedsAttention
        ? "Waiting for Signature"
        : formatStatusLabel(project.latestContractStatus),
      href: `/portal/contracts/${project.latestContractId}`,
      tone: contractNeedsAttention
        ? "attention"
        : project.latestContractStatus === "signed"
          ? "complete"
          : "neutral",
      updatedAt: project.updatedAt
    });
  }

  return sortByAttentionThenRecent(items);
}

function mapInvoiceItem(
  project: PortalAccessibleProjectListItem
): PortalHomeInvoiceItem | null {
  if (!project.latestInvoiceId) {
    return null;
  }

  const tone = getInvoiceTone({
    status: project.latestInvoiceStatus,
    balanceDueAmount: project.latestInvoiceBalanceDueAmount,
    latestPaymentEventType: project.latestInvoicePaymentEventType
  });

  return {
    key: `${project.id}-invoice-${project.latestInvoiceId}`,
    projectId: project.id,
    projectName: project.name,
    referenceNumber: project.latestInvoiceReferenceNumber ?? "Invoice",
    statusLabel: formatStatusLabel(project.latestInvoiceStatus),
    balanceLabel: formatMoneyLabel(project.latestInvoiceBalanceDueAmount),
    paymentStateLabel: getInvoicePaymentStateLabel({
      status: project.latestInvoiceStatus,
      balanceDueAmount: project.latestInvoiceBalanceDueAmount,
      latestPaymentEventType: project.latestInvoicePaymentEventType
    }),
    href: `/portal/invoices/${project.latestInvoiceId}`,
    tone,
    updatedAt: project.latestInvoicePaymentEventAt ?? project.updatedAt
  };
}

export function derivePortalHomeOrganization(
  projects: PortalAccessibleProjectListItem[]
): PortalHomeOrganization {
  const projectItems = projects.map((project) => {
    const explanation = getProjectExplanation(project);

    return {
      project,
      explanation,
      statusLabel: getProjectStatusLabel(explanation),
      nextActionLabel: explanation.customerActionLabel ?? "Open Project",
      nextActionHref:
        explanation.customerActionHref ?? `/portal/projects/${project.id}`,
      updatedAt: project.updatedAt
    };
  });
  const attentionItems = sortByAttentionThenRecent(
    projectItems
      .map(({ project, explanation }) => mapAttentionItem(project, explanation))
      .filter((item): item is PortalHomeAttentionItem => Boolean(item))
  );
  const activeProjects = sortByAttentionThenRecent(
    projectItems.filter(
      ({ explanation }) => explanation.statusTone !== "complete"
    )
  );
  const historyProjects = sortByAttentionThenRecent(
    projectItems.filter(
      ({ explanation }) => explanation.statusTone === "complete"
    )
  );
  const documentItems = sortByAttentionThenRecent(
    projects.flatMap(mapDocumentItems)
  );
  const invoiceItems = sortByAttentionThenRecent(
    projects
      .map(mapInvoiceItem)
      .filter((item): item is PortalHomeInvoiceItem => Boolean(item))
  );

  return {
    attentionItems,
    activeProjects,
    documentItems,
    invoiceItems,
    historyProjects
  };
}
