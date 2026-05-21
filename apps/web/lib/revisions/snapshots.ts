import type {
  ChangeOrder,
  Contract,
  ContractSigner,
  Estimate,
  EstimateLineItem,
  Invoice,
  InvoiceLineItem
} from "@floorconnector/types";

import type { RecordRevisionSnapshot, RecordRevisionSnapshotSummary } from "./types";

type EstimateSnapshotInput = Estimate & {
  lineItems?: EstimateLineItem[];
};

type InvoiceSnapshotInput = Invoice & {
  lineItems?: InvoiceLineItem[];
};

type ContractSnapshotInput = Contract & {
  signers?: ContractSigner[];
};

type ChangeOrderSnapshotInput = ChangeOrder & {
  latestCommercialSnapshotId?: string | null;
  latestCommercialSnapshotItemIds?: string[];
};

function moneySummary(label: string, value: string | number | null | undefined) {
  return {
    label,
    value: value == null ? "Not set" : Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    })
  };
}

function compactLineItem(item: EstimateLineItem | InvoiceLineItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    catalogItemId: item.catalogItemId,
    taxable: item.taxable,
    unitPrice: item.unitPrice,
    discountAmount: item.discountAmount ?? null,
    taxAmount: item.taxAmount ?? null,
    costCode: item.costCode,
    lineTotal: item.lineTotal,
    sortOrder: item.sortOrder
  };
}

function buildBaseSnapshot(input: {
  subjectType: RecordRevisionSnapshot["subjectType"];
  subjectId: string;
  title: string;
  status: string;
  summary: RecordRevisionSnapshotSummary[];
  header: Record<string, unknown>;
  timestamps: Record<string, string | null>;
}): RecordRevisionSnapshot {
  return {
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    capturedAt: new Date().toISOString(),
    title: input.title,
    status: input.status,
    summary: input.summary,
    header: input.header,
    timestamps: input.timestamps
  };
}

export function buildEstimateRevisionSnapshot(
  estimate: EstimateSnapshotInput
): RecordRevisionSnapshot {
  return {
    ...buildBaseSnapshot({
      subjectType: "estimate",
      subjectId: estimate.id,
      title: estimate.title ?? estimate.referenceNumber,
      status: estimate.status,
      summary: [
        { label: "Reference", value: estimate.referenceNumber },
        { label: "Status", value: estimate.status },
        moneySummary("Total", estimate.totalAmount),
        { label: "Line items", value: String(estimate.lineItems?.length ?? 0) }
      ],
      header: {
        organizationId: estimate.organizationId,
        opportunityId: estimate.opportunityId,
        customerId: estimate.customerId,
        projectId: estimate.projectId,
        templateId: estimate.templateId,
        referenceNumber: estimate.referenceNumber,
        title: estimate.title,
        estimateDate: estimate.estimateDate,
        expirationDate: estimate.expirationDate,
        projectType: estimate.projectType,
        sector: estimate.sector,
        subtotalAmount: estimate.subtotalAmount,
        taxableSalesAmount: estimate.taxableSalesAmount,
        exemptSalesAmount: estimate.exemptSalesAmount,
        taxRateApplied: estimate.taxRateApplied,
        taxBehaviorApplied: estimate.taxBehaviorApplied,
        customerTaxExemptSnapshot: estimate.customerTaxExemptSnapshot,
        taxAmount: estimate.taxAmount,
        discountAmount: estimate.discountAmount,
        totalAmount: estimate.totalAmount,
        notes: estimate.notes,
        content: estimate.content
      },
      timestamps: {
        sentAt: estimate.sentAt,
        customerViewedAt: estimate.customerViewedAt,
        approvedAt: estimate.approvedAt,
        rejectedAt: estimate.rejectedAt,
        createdAt: estimate.createdAt,
        updatedAt: estimate.updatedAt
      }
    }),
    lineItems: estimate.lineItems?.map(compactLineItem) ?? []
  };
}

export function buildInvoiceRevisionSnapshot(
  invoice: InvoiceSnapshotInput
): RecordRevisionSnapshot {
  return {
    ...buildBaseSnapshot({
      subjectType: "invoice",
      subjectId: invoice.id,
      title: invoice.referenceNumber,
      status: invoice.status,
      summary: [
        { label: "Reference", value: invoice.referenceNumber },
        { label: "Status", value: invoice.status },
        moneySummary("Total", invoice.totalAmount),
        moneySummary("Balance", invoice.balanceDueAmount)
      ],
      header: {
        organizationId: invoice.organizationId,
        customerId: invoice.customerId,
        projectId: invoice.projectId,
        estimateId: invoice.estimateId,
        jobId: invoice.jobId,
        templateId: invoice.templateId,
        workflowRole: invoice.workflowRole,
        referenceNumber: invoice.referenceNumber,
        billingModel: invoice.billingModel,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        taxRateApplied: invoice.taxRateApplied,
        taxBehaviorApplied: invoice.taxBehaviorApplied,
        customerTaxExemptSnapshot: invoice.customerTaxExemptSnapshot,
        subtotalAmount: invoice.subtotalAmount,
        taxableSalesAmount: invoice.taxableSalesAmount,
        exemptSalesAmount: invoice.exemptSalesAmount,
        taxAmount: invoice.taxAmount,
        taxCollectedAmount: invoice.taxCollectedAmount,
        discountAmount: invoice.discountAmount,
        retainagePercentage: invoice.retainagePercentage,
        retainageHeldAmount: invoice.retainageHeldAmount,
        totalAmount: invoice.totalAmount,
        balanceDueAmount: invoice.balanceDueAmount,
        notes: invoice.notes
      },
      timestamps: {
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt
      }
    }),
    lineItems: invoice.lineItems?.map(compactLineItem) ?? []
  };
}

export function buildContractRevisionSnapshot(
  contract: ContractSnapshotInput
): RecordRevisionSnapshot {
  return {
    ...buildBaseSnapshot({
      subjectType: "contract",
      subjectId: contract.id,
      title: contract.title,
      status: contract.status,
      summary: [
        { label: "Reference", value: contract.referenceNumber },
        { label: "Status", value: contract.status },
        { label: "Signature", value: contract.signatureReadinessStatus },
        { label: "Signers", value: String(contract.signers?.length ?? 0) }
      ],
      header: {
        organizationId: contract.organizationId,
        customerId: contract.customerId,
        projectId: contract.projectId,
        estimateId: contract.estimateId,
        templateId: contract.templateId,
        referenceNumber: contract.referenceNumber,
        title: contract.title,
        renderedSubject: contract.renderedSubject,
        renderedContent: contract.renderedContent,
        generatedFromEstimateReference: contract.generatedFromEstimateReference,
        internalApprovalStatus: contract.internalApprovalStatus,
        signatureReadinessStatus: contract.signatureReadinessStatus,
        signatureProvider: contract.signatureProvider,
        signatureProviderReference: contract.signatureProviderReference,
        lockedAt: contract.lockedAt,
        editLockReason: contract.editLockReason
      },
      timestamps: {
        signatureStartedAt: contract.signatureStartedAt,
        customerViewedAt: contract.customerViewedAt,
        customerSignedAt: contract.customerSignedAt,
        contractorCountersignedAt: contract.contractorCountersignedAt,
        signatureDeclinedAt: contract.signatureDeclinedAt,
        sentAt: contract.sentAt,
        viewedAt: contract.viewedAt,
        signedAt: contract.signedAt,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt
      }
    }),
    signers:
      contract.signers?.map((signer) => ({
        id: signer.id,
        signerRole: signer.signerRole,
        signerStatus: signer.signerStatus,
        customerId: signer.customerId,
        portalUserId: signer.portalUserId,
        organizationUserId: signer.organizationUserId,
        displayName: signer.displayName,
        email: signer.email,
        signerOrder: signer.signerOrder,
        viewedAt: signer.viewedAt,
        signedAt: signer.signedAt,
        declinedAt: signer.declinedAt
      })) ?? []
  };
}

export function buildChangeOrderRevisionSnapshot(
  changeOrder: ChangeOrderSnapshotInput
): RecordRevisionSnapshot {
  return buildBaseSnapshot({
    subjectType: "change_order",
    subjectId: changeOrder.id,
    title: changeOrder.title,
    status: changeOrder.status,
    summary: [
      { label: "Reference", value: changeOrder.referenceNumber },
      { label: "Status", value: changeOrder.status },
      moneySummary("Adjustment", changeOrder.priceAdjustment),
      {
        label: "Snapshot items",
        value: String(changeOrder.latestCommercialSnapshotItemIds?.length ?? 0)
      }
    ],
    header: {
      organizationId: changeOrder.organizationId,
      customerId: changeOrder.customerId,
      projectId: changeOrder.projectId,
      contractId: changeOrder.contractId,
      invoiceId: changeOrder.invoiceId,
      appliedInvoiceLineItemId: changeOrder.appliedInvoiceLineItemId,
      referenceNumber: changeOrder.referenceNumber,
      title: changeOrder.title,
      description: changeOrder.description,
      scopeChangeNotes: changeOrder.scopeChangeNotes,
      priceAdjustment: changeOrder.priceAdjustment,
      decisionNote: changeOrder.decisionNote,
      latestCommercialSnapshotId: changeOrder.latestCommercialSnapshotId ?? null,
      latestCommercialSnapshotItemIds: changeOrder.latestCommercialSnapshotItemIds ?? []
    },
    timestamps: {
      sentAt: changeOrder.sentAt,
      customerViewedAt: changeOrder.customerViewedAt,
      approvedAt: changeOrder.approvedAt,
      rejectedAt: changeOrder.rejectedAt,
      createdAt: changeOrder.createdAt,
      updatedAt: changeOrder.updatedAt
    }
  });
}
