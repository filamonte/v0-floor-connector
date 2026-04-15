import "server-only";

import type { EstimateDetail } from "@/lib/estimates/data";
import { getEstimateById } from "@/lib/estimates/data";
import type { InvoiceDetail } from "@/lib/invoices/data";
import { getInvoiceById } from "@/lib/invoices/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

// Shared merge-data preparation lives here so estimates, invoices, and future
// contracts all reference the same canonical organization/customer/project
// records instead of maintaining separate per-module placeholder maps.

export type TemplateMergeValue =
  | string
  | number
  | boolean
  | null
  | TemplateMergeRecord
  | TemplateMergeValue[];

export type TemplateMergeRecord = {
  [key: string]: TemplateMergeValue;
};

export type FlattenedTemplateMergeFields = Record<string, string>;

function isTemplateMergeRecord(value: TemplateMergeValue): value is TemplateMergeRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatCurrency(value: string | number | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function buildEstimateLineItemSummary(estimate: EstimateDetail) {
  return estimate.lineItems
    .map(
      (lineItem, index) =>
        `${index + 1}. ${lineItem.name} - ${lineItem.quantity} ${lineItem.unit} @ ${formatCurrency(lineItem.unitPrice)} = ${formatCurrency(lineItem.lineTotal)}`
    )
    .join("\n");
}

function buildInvoiceLineItemSummary(invoice: InvoiceDetail) {
  return invoice.lineItems
    .map(
      (lineItem, index) =>
        `${index + 1}. ${lineItem.name} - ${lineItem.quantity} ${lineItem.unit} @ ${formatCurrency(lineItem.unitPrice)} = ${formatCurrency(lineItem.lineTotal)}`
    )
    .join("\n");
}

function stringifyMergeValue(value: TemplateMergeValue): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyMergeValue(item)).filter(Boolean).join(", ");
  }

  return "";
}

export function flattenTemplateMergeData(
  record: TemplateMergeRecord,
  prefix = ""
): FlattenedTemplateMergeFields {
  const flattened: FlattenedTemplateMergeFields = {};

  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isTemplateMergeRecord(value)) {
      Object.assign(
        flattened,
        flattenTemplateMergeData(value, path)
      );
      continue;
    }

    flattened[path] = stringifyMergeValue(value);
  }

  return flattened;
}

export function renderTemplateString(
  template: string | null,
  mergeData: TemplateMergeRecord
) {
  if (!template) {
    return null;
  }

  const flattened = flattenTemplateMergeData(mergeData);

  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, token: string) => {
    return flattened[token] ?? "";
  });
}

async function getOrganizationMergeData(next: string) {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for document merge data yet.");
  }

  return {
    id: organizationContext.organization.id,
    slug: organizationContext.organization.slug,
    legalName: organizationContext.organization.legalName,
    displayName: organizationContext.organization.displayName,
    tenantStatus: organizationContext.organization.tenantStatus,
    lifecycleState: organizationContext.organization.lifecycleState
  };
}

export async function prepareEstimateTemplateMergeData(
  estimateId: string,
  next = "/estimates"
): Promise<TemplateMergeRecord> {
  const [organization, estimate] = await Promise.all([
    getOrganizationMergeData(next),
    getEstimateById(estimateId, next)
  ]);

  if (!estimate) {
    throw new Error("Estimate not found for template merge data.");
  }

  return {
    organization,
    customer: estimate.customer
      ? {
          id: estimate.customer.id,
          name: estimate.customer.name,
          companyName: estimate.customer.companyName,
          phone: estimate.customer.phone,
          email: estimate.customer.email,
          addressLine1: estimate.customer.addressLine1,
          addressLine2: estimate.customer.addressLine2,
          city: estimate.customer.city,
          stateRegion: estimate.customer.stateRegion,
          postalCode: estimate.customer.postalCode,
          countryCode: estimate.customer.countryCode
        }
      : null,
    project: estimate.project
      ? {
          id: estimate.project.id,
          name: estimate.project.name,
          status: estimate.project.status,
          description: estimate.project.description,
          addressLine1: estimate.project.addressLine1,
          addressLine2: estimate.project.addressLine2,
          city: estimate.project.city,
          stateRegion: estimate.project.stateRegion,
          postalCode: estimate.project.postalCode,
          countryCode: estimate.project.countryCode
        }
      : null,
    estimate: {
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      status: estimate.status,
      subtotalAmount: formatCurrency(estimate.subtotalAmount),
      taxAmount: formatCurrency(estimate.taxAmount),
      discountAmount: formatCurrency(estimate.discountAmount),
      totalAmount: formatCurrency(estimate.totalAmount),
      notes: estimate.notes,
      lineItemsSummary: buildEstimateLineItemSummary(estimate)
    },
    contract: null,
    invoice: null
  };
}

export async function prepareInvoiceTemplateMergeData(
  invoiceId: string,
  next = "/invoices"
): Promise<TemplateMergeRecord> {
  const [organization, invoice] = await Promise.all([
    getOrganizationMergeData(next),
    getInvoiceById(invoiceId, next)
  ]);

  if (!invoice) {
    throw new Error("Invoice not found for template merge data.");
  }

  return {
    organization,
    customer: invoice.customer
      ? {
          id: invoice.customer.id,
          name: invoice.customer.name,
          companyName: invoice.customer.companyName,
          phone: invoice.customer.phone,
          email: invoice.customer.email,
          isTaxExempt: invoice.customer.isTaxExempt,
          retainagePercentageDefault: invoice.customer.retainagePercentageDefault
        }
      : null,
    project: invoice.project
      ? {
          id: invoice.project.id,
          name: invoice.project.name,
          status: invoice.project.status
        }
      : null,
    estimate: invoice.estimate
      ? {
          id: invoice.estimate.id,
          referenceNumber: invoice.estimate.referenceNumber,
          status: invoice.estimate.status
        }
      : null,
    invoice: {
      id: invoice.id,
      referenceNumber: invoice.referenceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotalAmount: formatCurrency(invoice.subtotalAmount),
      taxableSalesAmount: formatCurrency(invoice.taxableSalesAmount),
      exemptSalesAmount: formatCurrency(invoice.exemptSalesAmount),
      taxAmount: formatCurrency(invoice.taxAmount),
      taxCollectedAmount: formatCurrency(invoice.taxCollectedAmount),
      discountAmount: formatCurrency(invoice.discountAmount),
      retainagePercentage: `${Number(invoice.retainagePercentage).toFixed(2)}%`,
      retainageHeldAmount: formatCurrency(invoice.retainageHeldAmount),
      totalAmount: formatCurrency(invoice.totalAmount),
      balanceDueAmount: formatCurrency(invoice.balanceDueAmount),
      notes: invoice.notes,
      lineItemsSummary: buildInvoiceLineItemSummary(invoice)
    },
    contract: null
  };
}

export async function prepareContractTemplateMergeDataFromEstimate(
  estimateId: string,
  next = "/estimates"
): Promise<TemplateMergeRecord> {
  const baseMergeData = await prepareEstimateTemplateMergeData(estimateId, next);
  const estimate = await getEstimateById(estimateId, next);

  if (!estimate) {
    throw new Error("Estimate not found for contract template merge data.");
  }

  if (estimate.status !== "approved") {
    throw new Error("Contracts can only be generated from approved estimates.");
  }

  return {
    ...baseMergeData,
    contract: {
      sourceEstimateId: estimate.id,
      sourceEstimateStatus: estimate.status,
      generatedAt: new Date().toISOString(),
      lockState: "draft"
    }
  };
}
