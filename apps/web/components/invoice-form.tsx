"use client";

import { useState } from "react";
import type {
  EstimateStatus,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  InvoiceWorkflowRole,
  JobStatus,
  OrganizationFinancialSettings,
  Project,
  TaxBehavior
} from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import {
  invoiceBaseSourceTypesList,
  editableInvoiceStatusesList,
  invoiceWorkflowRolesList
} from "@/lib/invoices/schemas";

type InvoiceProjectOption = Pick<Project, "id" | "name" | "customerId"> & {
  customerName?: string | null;
  customerTaxExempt?: boolean;
  customerRetainagePercentageDefault?: string;
};

type InvoiceEstimateOption = {
  id: string;
  referenceNumber: string;
  projectId: string;
  projectName: string | null;
  status: EstimateStatus;
};

type InvoiceJobOption = {
  id: string;
  projectId: string;
  projectName: string | null;
  dispatchStatus: JobStatus;
  estimateId: string | null;
};

type EditableInvoice = Invoice & {
  lineItems?: InvoiceLineItem[];
  paidAmount?: string;
};

type InvoiceSourceOptionSet = {
  scheduleOfValueItems: Array<{
    id: string;
    scheduleOfValuesId: string;
    estimateId: string;
    projectId: string;
    name: string;
    description: string | null;
    scheduledValueAmount: string;
  }>;
  changeOrderSnapshotItems: Array<{
    id: string;
    changeOrderId: string;
    projectId: string;
    invoiceId: string | null;
    name: string;
    description: string | null;
    lineTotal: string;
  }>;
};

type CatalogItemOption = {
  id: string;
  name: string;
  unit: string;
  defaultUnitPrice: string | null;
  status: string;
};

type InvoiceFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  projects: InvoiceProjectOption[];
  estimates: InvoiceEstimateOption[];
  jobs: InvoiceJobOption[];
  organizationFinancialSettings: Pick<
    OrganizationFinancialSettings,
    "defaultTaxRate" | "defaultTaxBehavior"
  >;
  invoice?: EditableInvoice | null;
  initialProjectId?: string | null;
  initialEstimateId?: string | null;
  initialJobId?: string | null;
  initialWorkflowRole?: InvoiceWorkflowRole | null;
  initialDiscountAmount?: string | null;
  initialLineItems?: Array<{
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
  }> | null;
  paidAmount?: string | null;
  sourceOptions: InvoiceSourceOptionSet;
  catalogItems: CatalogItemOption[];
};

type LineItemDraft = {
  key: string;
  catalogItemId: string | null;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  taxable: boolean;
  baseUnitCost: string;
  baseUnitPrice: string;
  markupPercent: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  costCode: string;
};

type BaseSourceType = (typeof invoiceBaseSourceTypesList)[number];

type ManualCatalogItemDraft = {
  key: string;
  catalogItemId: string;
  quantity: string;
};

type ExplicitAdjustmentDraft = {
  key: string;
  name: string;
  description: string;
  amount: string;
};

type FinancialPreview = {
  discountedSubtotal: number;
  taxableSales: number;
  exemptSales: number;
  taxAmount: number;
  retainageHeld: number;
  total: number;
  balanceDue: number;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatWorkflowRoleLabel(role: InvoiceWorkflowRole) {
  return role === "deposit" ? "Deposit request" : "Standard invoice";
}

function formatTaxBehaviorLabel(taxBehavior: TaxBehavior) {
  switch (taxBehavior) {
    case "exclusive":
      return "Tax added on top";
    case "inclusive":
      return "Tax included in prices";
    case "none":
      return "No tax applied";
    default:
      return taxBehavior;
  }
}

function parseAmount(value: string) {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatRate(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatBaseSourceLabel(sourceType: BaseSourceType) {
  switch (sourceType) {
    case "estimate_snapshot":
      return "Full approved estimate";
    case "sov_items":
      return "Selected SOV lines";
    case "change_order_snapshot_items":
      return "Approved change-order items";
    case "none":
    default:
      return "No base source";
  }
}

function getLineageBadge(lineItem: InvoiceLineItem) {
  switch (lineItem.lineageType) {
    case "estimate_snapshot_item":
      return "Estimate snapshot";
    case "sov_item":
      return "SOV item";
    case "change_order_snapshot_item":
      return "Change order snapshot";
    case "invoice_only_adjustment":
      return lineItem.invoiceOnlyAdjustmentKind === "manual_catalog_item"
        ? "Manual catalog item"
        : "Invoice-only adjustment";
    default:
      return "Legacy row";
  }
}

function ReadonlyValue({
  label,
  value,
  className = ""
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
      <div className="min-h-9 border border-[#d7dce4] bg-[#f7f8fa] px-3 py-2 text-sm text-slate-900">
        {value}
      </div>
    </div>
  );
}

function createBlankLineItem(key: string): LineItemDraft {
  return {
    key,
    catalogItemId: null,
    name: "",
    description: "",
    quantity: "1.00",
    unit: "each",
    taxable: true,
    baseUnitCost: "0.00",
    baseUnitPrice: "",
    markupPercent: "0.00",
    hiddenMarkupPercent: "0.00",
    unitPriceBeforeHiddenMarkup: "0.00",
    visibleMarkupAmount: "0.00",
    hiddenMarkupAmount: "0.00",
    unitPrice: "0.00",
    costCode: ""
  };
}

function createInitialLineItems(
  invoice?: EditableInvoice | null,
  initialLineItems?: InvoiceFormProps["initialLineItems"]
): LineItemDraft[] {
  if (invoice?.lineItems && invoice.lineItems.length > 0) {
    return invoice.lineItems.map((lineItem, index) => ({
      key: lineItem.id || `existing-${index}`,
      catalogItemId: lineItem.catalogItemId,
      name: lineItem.name,
      description: getValue(lineItem.description),
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      taxable: lineItem.taxable,
      baseUnitCost: getValue(lineItem.baseUnitCost) || "0.00",
      baseUnitPrice: getValue(lineItem.baseUnitPrice),
      markupPercent: getValue(lineItem.markupPercent) || "0.00",
      hiddenMarkupPercent: getValue(lineItem.hiddenMarkupPercent) || "0.00",
      unitPriceBeforeHiddenMarkup: getValue(lineItem.unitPriceBeforeHiddenMarkup) || "0.00",
      visibleMarkupAmount: getValue(lineItem.visibleMarkupAmount) || "0.00",
      hiddenMarkupAmount: getValue(lineItem.hiddenMarkupAmount) || "0.00",
      unitPrice: lineItem.unitPrice,
      costCode: getValue(lineItem.costCode)
    }));
  }

  if (initialLineItems && initialLineItems.length > 0) {
    return initialLineItems.map((lineItem, index) => ({
      key: `initial-${index}`,
      catalogItemId: null,
      name: lineItem.name,
      description: getValue(lineItem.description),
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      taxable: true,
      baseUnitCost: "0.00",
      baseUnitPrice: "",
      markupPercent: "0.00",
      hiddenMarkupPercent: "0.00",
      unitPriceBeforeHiddenMarkup: "0.00",
      visibleMarkupAmount: "0.00",
      hiddenMarkupAmount: "0.00",
      unitPrice: lineItem.unitPrice,
      costCode: ""
    }));
  }

  return [createBlankLineItem("new-0")];
}

function inferInitialSourceState(invoice?: EditableInvoice | null) {
  const lineItems = invoice?.lineItems ?? [];
  const baseSourceType: BaseSourceType = lineItems.some(
    (lineItem) => lineItem.lineageType === "estimate_snapshot_item"
  )
    ? "estimate_snapshot"
    : lineItems.some((lineItem) => lineItem.lineageType === "sov_item")
      ? "sov_items"
      : lineItems.some(
            (lineItem) => lineItem.lineageType === "change_order_snapshot_item"
          )
        ? "change_order_snapshot_items"
        : "none";

  return {
    baseSourceType,
    selectedSovItemIds: lineItems
      .filter((lineItem) => lineItem.lineageType === "sov_item" && lineItem.scheduleOfValueItemId)
      .map((lineItem) => lineItem.scheduleOfValueItemId as string),
    selectedChangeOrderSnapshotItemIds: lineItems
      .filter(
        (lineItem) =>
          lineItem.lineageType === "change_order_snapshot_item" &&
          lineItem.changeOrderSnapshotItemId
      )
      .map((lineItem) => lineItem.changeOrderSnapshotItemId as string),
    manualCatalogItems: lineItems
      .filter(
        (lineItem) =>
          lineItem.lineageType === "invoice_only_adjustment" &&
          lineItem.invoiceOnlyAdjustmentKind === "manual_catalog_item" &&
          lineItem.catalogItemId
      )
      .map((lineItem, index) => ({
        key: `manual-existing-${index}`,
        catalogItemId: lineItem.catalogItemId as string,
        quantity: lineItem.quantity
      })),
    explicitAdjustments: lineItems
      .filter(
        (lineItem) =>
          lineItem.lineageType === "invoice_only_adjustment" &&
          lineItem.invoiceOnlyAdjustmentKind === "explicit_adjustment"
      )
      .map((lineItem, index) => ({
        key: `adjustment-existing-${index}`,
        name: lineItem.name,
        description: getValue(lineItem.description),
        amount: lineItem.lineTotal
      })),
    hasLegacyLineItems:
      lineItems.length > 0 && lineItems.some((lineItem) => !lineItem.lineageType)
  };
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultIssueDate(invoice?: Invoice | null) {
  return invoice?.issueDate ?? getTodayDate();
}

function getDefaultDueDate(invoice?: Invoice | null) {
  if (invoice?.dueDate) {
    return invoice.dueDate;
  }

  const due = new Date();
  due.setDate(due.getDate() + 30);
  return due.toISOString().slice(0, 10);
}

function isDerivedStatus(status: InvoiceStatus) {
  return status === "paid" || status === "partially_paid";
}

function calculateFinancialPreview({
  lineItems,
  discountAmount,
  taxBehavior,
  taxRate,
  customerTaxExempt,
  retainagePercentage,
  recordedPayments,
  invoiceStatus
}: {
  lineItems: LineItemDraft[];
  discountAmount: number;
  taxBehavior: TaxBehavior;
  taxRate: number;
  customerTaxExempt: boolean;
  retainagePercentage: number;
  recordedPayments: number;
  invoiceStatus: InvoiceStatus;
}): FinancialPreview {
  const subtotal = lineItems.reduce(
    (sum, lineItem) => sum + parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice),
    0
  );
  const taxableSubtotal = customerTaxExempt
    ? 0
    : lineItems.reduce((sum, lineItem) => {
        if (!lineItem.taxable) {
          return sum;
        }

        return sum + parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice);
      }, 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const retainageHeld = Number(
    Math.max(0, discountedSubtotal * (retainagePercentage / 100)).toFixed(2)
  );

  if (customerTaxExempt || taxBehavior === "none" || taxRate <= 0) {
    const total = Number(discountedSubtotal.toFixed(2));
    const balanceDue =
      invoiceStatus === "void"
        ? 0
        : Number(Math.max(0, total - retainageHeld - recordedPayments).toFixed(2));

    return {
      discountedSubtotal: total,
      taxableSales: 0,
      exemptSales: total,
      taxAmount: 0,
      retainageHeld,
      total,
      balanceDue
    };
  }

  const taxableRatio = subtotal > 0 ? taxableSubtotal / subtotal : 0;
  const discountedTaxableSubtotal = Number(
    (discountedSubtotal * taxableRatio).toFixed(2)
  );
  const discountedExemptSubtotal = Number(
    (discountedSubtotal - discountedTaxableSubtotal).toFixed(2)
  );

  if (taxBehavior === "inclusive") {
    const taxableSales = Number(
      (discountedTaxableSubtotal / (1 + taxRate)).toFixed(2)
    );
    const taxAmount = Number(
      (discountedTaxableSubtotal - taxableSales).toFixed(2)
    );
    const total = Number(discountedSubtotal.toFixed(2));
    const balanceDue =
      invoiceStatus === "void"
        ? 0
        : Number(Math.max(0, total - retainageHeld - recordedPayments).toFixed(2));

    return {
      discountedSubtotal: total,
      taxableSales,
      exemptSales: discountedExemptSubtotal,
      taxAmount,
      retainageHeld,
      total,
      balanceDue
    };
  }

  const taxableSales = discountedTaxableSubtotal;
  const taxAmount = Number((taxableSales * taxRate).toFixed(2));
  const total = Number((discountedSubtotal + taxAmount).toFixed(2));
  const balanceDue =
    invoiceStatus === "void"
      ? 0
      : Number(Math.max(0, total - retainageHeld - recordedPayments).toFixed(2));

  return {
    discountedSubtotal: Number(discountedSubtotal.toFixed(2)),
    taxableSales,
    exemptSales: discountedExemptSubtotal,
    taxAmount,
    retainageHeld,
    total,
    balanceDue
  };
}

function WorkspaceSection({
  id,
  title,
  description,
  children
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-t border-[#dfe4ec] bg-white px-4 py-2.5"
    >
      <div className="border-b border-[#e5ebf2] pb-1.5">
        <h2 className="text-[16px] font-semibold tracking-tight text-[#17243b]">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="pt-2.5">{children}</div>
    </section>
  );
}

export function InvoiceForm({
  action,
  submitLabel,
  pendingLabel,
  projects,
  estimates,
  jobs,
  organizationFinancialSettings,
  invoice,
  initialProjectId,
  initialEstimateId,
  initialJobId,
  initialWorkflowRole,
  initialDiscountAmount,
  initialLineItems,
  paidAmount,
  sourceOptions,
  catalogItems
}: InvoiceFormProps) {
  const [lineItems] = useState<LineItemDraft[]>(() => createInitialLineItems(invoice, initialLineItems));
  const initialSourceState = inferInitialSourceState(invoice);
  const [selectedProjectId, setSelectedProjectId] = useState(
    invoice?.projectId ?? initialProjectId ?? ""
  );
  const [selectedEstimateId, setSelectedEstimateId] = useState(
    invoice?.estimateId ?? initialEstimateId ?? ""
  );
  const [selectedJobId, setSelectedJobId] = useState(invoice?.jobId ?? initialJobId ?? "");
  const [workflowRole, setWorkflowRole] = useState<InvoiceWorkflowRole>(
    invoice?.workflowRole ?? initialWorkflowRole ?? "standard"
  );
  const [discountAmount, setDiscountAmount] = useState(
    getValue(invoice?.discountAmount ?? initialDiscountAmount) || "0.00"
  );
  const [baseSourceType, setBaseSourceType] = useState<BaseSourceType>(
    initialSourceState.baseSourceType
  );
  const [selectedSovItemIds, setSelectedSovItemIds] = useState<string[]>(
    initialSourceState.selectedSovItemIds
  );
  const [selectedChangeOrderSnapshotItemIds, setSelectedChangeOrderSnapshotItemIds] =
    useState<string[]>(initialSourceState.selectedChangeOrderSnapshotItemIds);
  const [manualCatalogItems, setManualCatalogItems] = useState<ManualCatalogItemDraft[]>(
    initialSourceState.manualCatalogItems
  );
  const [explicitAdjustments, setExplicitAdjustments] = useState<ExplicitAdjustmentDraft[]>(
    initialSourceState.explicitAdjustments
  );
  const [catalogItemToAdd, setCatalogItemToAdd] = useState("");

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const invoiceSnapshot =
    invoice && selectedProjectId === invoice.projectId ? invoice : undefined;
  const usingInvoiceSnapshot = Boolean(invoiceSnapshot);
  const customerTaxExempt = usingInvoiceSnapshot
    ? invoiceSnapshot?.customerTaxExemptSnapshot ?? false
    : (selectedProject?.customerTaxExempt ?? false);
  const resolvedTaxBehavior = usingInvoiceSnapshot
    ? invoiceSnapshot?.taxBehaviorApplied ?? organizationFinancialSettings.defaultTaxBehavior
    : organizationFinancialSettings.defaultTaxBehavior;
  const resolvedTaxRate = usingInvoiceSnapshot
    ? parseAmount(invoiceSnapshot?.taxRateApplied ?? "0.00")
    : customerTaxExempt || organizationFinancialSettings.defaultTaxBehavior === "none"
      ? 0
      : parseAmount(organizationFinancialSettings.defaultTaxRate);
  const retainagePercentage = usingInvoiceSnapshot
    ? parseAmount(invoiceSnapshot?.retainagePercentage ?? "0.00")
    : parseAmount(selectedProject?.customerRetainagePercentageDefault ?? "0.00");

  const visibleEstimates = estimates.filter(
    (estimate) =>
      !selectedProjectId ||
      estimate.projectId === selectedProjectId ||
      estimate.id === selectedEstimateId
  );
  const visibleJobs = jobs.filter(
    (job) => !selectedProjectId || job.projectId === selectedProjectId || job.id === selectedJobId
  );
  const visibleSovItems = sourceOptions.scheduleOfValueItems.filter(
    (item) =>
      (!selectedProjectId || item.projectId === selectedProjectId) &&
      (!selectedEstimateId || item.estimateId === selectedEstimateId)
  );
  const visibleChangeOrderItems = sourceOptions.changeOrderSnapshotItems.filter(
    (item) =>
      (!selectedProjectId || item.projectId === selectedProjectId) &&
      (!invoice?.id || item.invoiceId == null || item.invoiceId === invoice.id)
  );
  const manualCatalogItemOptions = catalogItems.filter((item) => item.status === "active");
  const sourceConfiguration = initialSourceState.hasLegacyLineItems
    ? ""
    : JSON.stringify({
        baseSourceType,
        selectedSovItemIds,
        selectedChangeOrderSnapshotItemIds,
        manualCatalogItems: manualCatalogItems.map((item) => ({
          catalogItemId: item.catalogItemId,
          quantity: item.quantity
        })),
        explicitAdjustments: explicitAdjustments.map((item) => ({
          name: item.name,
          description: item.description || null,
          amount: item.amount
        }))
      });
  const manualItemsBlockingSend =
    (invoice?.status ?? "draft") !== "draft" &&
    manualCatalogItems.some((item) => parseAmount(item.quantity) <= 0);

  const recordedPayments = parseAmount(invoice?.paidAmount ?? paidAmount ?? "0.00");
  const subtotal = lineItems.reduce(
    (sum, lineItem) => sum + parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice),
    0
  );
  const preview = calculateFinancialPreview({
    lineItems,
    discountAmount: parseAmount(discountAmount),
    taxBehavior: resolvedTaxBehavior,
    taxRate: resolvedTaxRate,
    customerTaxExempt,
    retainagePercentage,
    recordedPayments,
    invoiceStatus: invoice?.status ?? "draft"
  });
  const derivedStatus = invoice?.status ?? "draft";

  function handleProjectChange(nextProjectId: string) {
    setSelectedProjectId(nextProjectId);

    setSelectedEstimateId((current) => {
      if (!current) {
        return current;
      }

      const nextEstimate = estimates.find((estimate) => estimate.id === current);
      return nextEstimate && nextEstimate.projectId === nextProjectId ? current : "";
    });

    setSelectedJobId((current) => {
      if (!current) {
        return current;
      }

      const nextJob = jobs.find((job) => job.id === current);
      return nextJob && nextJob.projectId === nextProjectId ? current : "";
    });

    setSelectedSovItemIds((current) =>
      current.filter((itemId) =>
        sourceOptions.scheduleOfValueItems.some(
          (item) => item.id === itemId && item.projectId === nextProjectId
        )
      )
    );
    setSelectedChangeOrderSnapshotItemIds((current) =>
      current.filter((itemId) =>
        sourceOptions.changeOrderSnapshotItems.some(
          (item) => item.id === itemId && item.projectId === nextProjectId
        )
      )
    );
  }

  function handleWorkflowRoleChange(nextRole: InvoiceWorkflowRole) {
    setWorkflowRole(nextRole);

    if (nextRole === "deposit") {
      setSelectedJobId("");
    }
  }

  function toggleSelectedSovItem(itemId: string) {
    setSelectedSovItemIds((current) =>
      current.includes(itemId)
        ? current.filter((value) => value !== itemId)
        : [...current, itemId]
    );
  }

  function toggleSelectedChangeOrderSnapshotItem(itemId: string) {
    setSelectedChangeOrderSnapshotItemIds((current) =>
      current.includes(itemId)
        ? current.filter((value) => value !== itemId)
        : [...current, itemId]
    );
  }

  function addManualCatalogItem() {
    if (!catalogItemToAdd || manualCatalogItems.some((item) => item.catalogItemId === catalogItemToAdd)) {
      return;
    }

    setManualCatalogItems((current) => [
      ...current,
      {
        key: `manual-${catalogItemToAdd}`,
        catalogItemId: catalogItemToAdd,
        quantity: "0.00"
      }
    ]);
    setCatalogItemToAdd("");
  }

  function addExplicitAdjustment() {
    setExplicitAdjustments((current) => [
      ...current,
      {
        key: `adjustment-${current.length}`,
        name: "",
        description: "",
        amount: "0.00"
      }
    ]);
  }

  return (
    <form action={action} className="space-y-0">
      {invoice ? <input type="hidden" name="invoiceId" value={invoice.id} /> : null}
      <input type="hidden" name="sourceConfiguration" value={sourceConfiguration} />

      <WorkspaceSection
        id="details"
        title="Details"
        description="Build billing details here first. This stays the primary invoice workspace, with send and collections remaining downstream."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_320px]">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
              <select
                name="projectId"
                value={selectedProjectId}
                onChange={(event) => handleProjectChange(event.target.value)}
                className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                required
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                    {project.customerName ? ` - ${project.customerName}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Workflow role
              </span>
              <select
                name="workflowRole"
                value={workflowRole}
                onChange={(event) =>
                  handleWorkflowRoleChange(event.target.value as InvoiceWorkflowRole)
                }
                className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                required
              >
                {invoiceWorkflowRolesList.map((role) => (
                  <option key={role} value={role}>
                    {formatWorkflowRoleLabel(role)}
                  </option>
                ))}
              </select>
            </label>

            {invoice && isDerivedStatus(invoice.status) ? (
              <>
                <input type="hidden" name="status" value={invoice.status} />
                <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current status
                  </p>
                  <p className="mt-1 text-[15px] font-semibold capitalize text-[#17243b]">
                    {formatStatusLabel(derivedStatus)}
                  </p>
                </div>
              </>
            ) : (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
                <select
                  name="status"
                  defaultValue={invoice?.status ?? "draft"}
                  className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                  required
                >
                  {editableInvoiceStatusesList.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Linked approved estimate
              </span>
              <select
                name="estimateId"
                value={selectedEstimateId}
                onChange={(event) => {
                  const nextEstimateId = event.target.value;
                  setSelectedEstimateId(nextEstimateId);
                  setSelectedSovItemIds((current) =>
                    current.filter((itemId) =>
                      sourceOptions.scheduleOfValueItems.some(
                        (item) =>
                          item.id === itemId &&
                          (!nextEstimateId || item.estimateId === nextEstimateId)
                      )
                    )
                  );
                }}
                className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
              >
                <option value="">No linked estimate</option>
                {visibleEstimates.map((estimate) => (
                  <option key={estimate.id} value={estimate.id}>
                    {estimate.referenceNumber}
                    {estimate.projectName ? ` - ${estimate.projectName}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Linked job</span>
              <select
                name="jobId"
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                disabled={workflowRole === "deposit"}
                className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
              >
                <option value="">No linked job</option>
                {visibleJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.projectName ?? "Job"}
                    {job.estimateId ? " - linked estimate" : ""}
                  </option>
                ))}
              </select>
              {workflowRole === "deposit" ? (
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  Deposit invoices stay upstream of execution and do not attach to a specific job.
                </span>
              ) : null}
            </label>

            <AuthField
              label="Issue date"
              name="issueDate"
              type="date"
              defaultValue={getDefaultIssueDate(invoice)}
              required
            />
            <AuthField
              label="Due date"
              name="dueDate"
              type="date"
              defaultValue={invoice?.dueDate ?? getDefaultDueDate(invoice)}
            />
          </div>

          <div className="space-y-3">
            <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Financial defaults
              </p>
              <dl className="mt-3 space-y-1.5 text-sm leading-5 text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Tax behavior</dt>
                  <dd>{formatTaxBehaviorLabel(resolvedTaxBehavior)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Tax rate</dt>
                  <dd>{formatRate(resolvedTaxRate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Customer tax treatment</dt>
                  <dd>{customerTaxExempt ? "Exempt" : "Taxable"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Retainage default</dt>
                  <dd>{retainagePercentage.toFixed(2)}%</dd>
                </div>
              </dl>
            </div>

            <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Calculated totals
              </p>
              <dl className="mt-3 space-y-1.5 text-sm leading-5 text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-slate-950">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Tax</dt>
                  <dd>{formatMoney(preview.taxAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Discount</dt>
                  <dd>{formatMoney(parseAmount(discountAmount))}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Recorded payments</dt>
                  <dd>{formatMoney(recordedPayments)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-base">
                  <dt className="font-medium text-slate-950">Total</dt>
                  <dd className="font-semibold text-slate-950">{formatMoney(preview.total)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-base">
                  <dt className="font-medium text-slate-950">Balance due</dt>
                  <dd className="font-semibold text-slate-950">
                    {formatMoney(preview.balanceDue)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="items"
        title="Items"
        description="Each invoice row now comes from one explicit lineage path: approved estimate snapshot, selected SOV line, approved change-order snapshot, or invoice-only adjustment."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-4">
            <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Base source
                  </span>
                  <select
                    value={baseSourceType}
                    onChange={(event) =>
                      setBaseSourceType(event.target.value as BaseSourceType)
                    }
                    className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                  >
                    {invoiceBaseSourceTypesList.map((sourceType) => (
                      <option key={sourceType} value={sourceType}>
                        {formatBaseSourceLabel(sourceType)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm leading-5 text-slate-500">
                  {baseSourceType === "estimate_snapshot"
                    ? selectedEstimateId
                      ? "Saving will rebuild the invoice from the latest approved estimate snapshot."
                      : "Pick a linked approved estimate before saving a full estimate invoice."
                    : baseSourceType === "sov_items"
                      ? "Select the exact SOV lines to bill. Nothing is auto-selected."
                      : baseSourceType === "change_order_snapshot_items"
                        ? "Choose approved change-order snapshot items to pull into this invoice."
                        : "Leave the base source empty if this invoice is made only from invoice-only adjustments."}
                </div>
              </div>
            </div>

            {initialSourceState.hasLegacyLineItems ? (
              <div className="border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-900">
                This invoice still contains legacy rows from before strict lineage enforcement.
                Those rows stay unchanged. Save metadata here, but create a new invoice if you
                need the full source-system builder.
              </div>
            ) : null}

            {baseSourceType === "sov_items" ? (
              <div className="space-y-3 border border-[#dfe4ec] bg-white p-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Selected SOV lines</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Choose the exact scope lines to bill from the current SOV chain.
                  </p>
                </div>
                {visibleSovItems.length > 0 ? (
                  <div className="space-y-2">
                    {visibleSovItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 border border-slate-200 px-3 py-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSovItemIds.includes(item.id)}
                          onChange={() => toggleSelectedSovItem(item.id)}
                          className="mt-1 h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-950">{item.name}</p>
                          {item.description ? (
                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              {item.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                            Scheduled value {formatMoney(parseAmount(item.scheduledValueAmount))}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-500">
                    No SOV items are available for the current project and estimate filter.
                  </div>
                )}
              </div>
            ) : null}

            {baseSourceType === "change_order_snapshot_items" ? (
              <div className="space-y-3 border border-[#dfe4ec] bg-white p-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    Approved change-order items
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Positive and negative approved change-order snapshot rows can be billed here.
                  </p>
                </div>
                {visibleChangeOrderItems.length > 0 ? (
                  <div className="space-y-2">
                    {visibleChangeOrderItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 border border-slate-200 px-3 py-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedChangeOrderSnapshotItemIds.includes(item.id)}
                          onChange={() => toggleSelectedChangeOrderSnapshotItem(item.id)}
                          className="mt-1 h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-950">{item.name}</p>
                          {item.description ? (
                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              {item.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                            Snapshot amount {formatMoney(parseAmount(item.lineTotal))}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-500">
                    No approved change-order snapshot items are available for this project yet.
                  </div>
                )}
              </div>
            ) : null}

            <div className="space-y-3 border border-[#dfe4ec] bg-white p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    Manual catalog items
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Add invoice-only manual items from the Cost Items Database. They snapshot
                    current catalog pricing and start at quantity 0.
                  </p>
                </div>
                <div className="flex w-full max-w-xl gap-2">
                  <select
                    value={catalogItemToAdd}
                    onChange={(event) => setCatalogItemToAdd(event.target.value)}
                    className="h-9 min-w-0 flex-1 border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                  >
                    <option value="">Select a catalog item</option>
                    {manualCatalogItemOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.unit}
                        {item.defaultUnitPrice ? ` - ${formatMoney(parseAmount(item.defaultUnitPrice))}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addManualCatalogItem}
                    className="inline-flex h-9 items-center justify-center border border-[#cfd6e0] bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-[#f0f3f7]"
                  >
                    Add manual item
                  </button>
                </div>
              </div>

              {manualCatalogItems.length > 0 ? (
                <div className="space-y-2">
                  {manualCatalogItems.map((item) => {
                    const catalogItem = manualCatalogItemOptions.find(
                      (option) => option.id === item.catalogItemId
                    );

                    return (
                      <div
                        key={item.key}
                        className="grid gap-2 border border-slate-200 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_140px_auto]"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-950">
                            {catalogItem?.name ?? "Catalog item"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                            Starts at quantity 0 and cannot be sent until quantity is greater than 0.
                          </p>
                        </div>
                        <label className="block">
                          <span className="sr-only">Manual item quantity</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(event) =>
                              setManualCatalogItems((current) =>
                                current.map((entry) =>
                                  entry.key === item.key
                                    ? { ...entry, quantity: event.target.value }
                                    : entry
                                )
                              )
                            }
                            className="h-9 w-full border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setManualCatalogItems((current) =>
                              current.filter((entry) => entry.key !== item.key)
                            )
                          }
                          className="inline-flex h-9 items-center justify-center border border-[#cfd6e0] bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-[#f0f3f7]"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-500">
                  No manual catalog items have been added yet.
                </div>
              )}
            </div>

            <div className="space-y-3 border border-[#dfe4ec] bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    Explicit invoice-only adjustments
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Add standalone invoice adjustments that do not come from estimate, SOV, or change-order snapshot lineage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExplicitAdjustment}
                  className="inline-flex h-9 items-center justify-center border border-[#cfd6e0] bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-[#f0f3f7]"
                >
                  Add adjustment
                </button>
              </div>

              {explicitAdjustments.length > 0 ? (
                <div className="space-y-3">
                  {explicitAdjustments.map((item) => (
                    <div key={item.key} className="grid gap-2 border border-slate-200 px-3 py-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) =>
                          setExplicitAdjustments((current) =>
                            current.map((entry) =>
                              entry.key === item.key
                                ? { ...entry, name: event.target.value }
                                : entry
                            )
                          )
                        }
                        placeholder="Adjustment name"
                        className="h-9 border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(event) =>
                          setExplicitAdjustments((current) =>
                            current.map((entry) =>
                              entry.key === item.key
                                ? { ...entry, amount: event.target.value }
                                : entry
                            )
                          )
                        }
                        placeholder="Amount"
                        className="h-9 border border-[#cfd6e0] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                      />
                      <textarea
                        value={item.description}
                        onChange={(event) =>
                          setExplicitAdjustments((current) =>
                            current.map((entry) =>
                              entry.key === item.key
                                ? { ...entry, description: event.target.value }
                                : entry
                            )
                          )
                        }
                        rows={3}
                        placeholder="Optional adjustment note"
                        className="md:col-span-2 w-full border border-[#cfd6e0] bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
                      />
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExplicitAdjustments((current) =>
                              current.filter((entry) => entry.key !== item.key)
                            )
                          }
                          className="inline-flex h-9 items-center justify-center border border-[#cfd6e0] bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-[#f0f3f7]"
                        >
                          Remove adjustment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-500">
                  No explicit invoice-only adjustments have been added yet.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Saved line items</h3>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Saved invoice rows remain immutable snapshots after they are written.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex h-8 items-center justify-center border border-[#cfd6e0] bg-white px-3 text-sm font-medium text-slate-700"
              >
                Snapshot review
              </button>
            </div>

            <div className="space-y-3">
              {invoice?.lineItems && invoice.lineItems.length > 0 ? (
                invoice.lineItems.map((lineItem, index) => (
                  <div key={lineItem.id} className="border border-[#dfe4ec] bg-white p-2.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">Line item {index + 1}</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex border border-[#d7dce4] bg-[#f7f8fa] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          {getLineageBadge(lineItem)}
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          {formatMoney(parseAmount(lineItem.lineTotal))}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
                      <ReadonlyValue label="Name" value={lineItem.name || "-"} className="md:col-span-2" />
                      <ReadonlyValue
                        label="Description"
                        value={lineItem.description || "No billing notes"}
                        className="md:col-span-2"
                      />
                      <ReadonlyValue label="Quantity" value={lineItem.quantity} />
                      <ReadonlyValue label="Unit" value={lineItem.unit} />
                      <ReadonlyValue
                        label="Unit price"
                        value={formatMoney(parseAmount(lineItem.unitPrice))}
                      />
                      <ReadonlyValue
                        label="Base unit cost"
                        value={formatMoney(parseAmount(lineItem.baseUnitCost ?? "0.00"))}
                      />
                      <ReadonlyValue label="Tax" value={lineItem.taxable ? "Taxable" : "Non-taxable"} />
                      <ReadonlyValue
                        label="Line total"
                        value={
                          <span className="font-semibold text-slate-950">
                            {formatMoney(parseAmount(lineItem.lineTotal))}
                          </span>
                        }
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm leading-5 text-slate-500">
                  No saved invoice rows exist yet. Save the current source selection to build the first snapshot set.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Totals
              </p>
              <dl className="mt-3 space-y-1.5 text-sm leading-5 text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Discounted subtotal</dt>
                  <dd>{formatMoney(preview.discountedSubtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Taxable sales</dt>
                  <dd>{formatMoney(preview.taxableSales)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Exempt sales</dt>
                  <dd>{formatMoney(preview.exemptSales)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Tax</dt>
                  <dd>{formatMoney(preview.taxAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Retainage held</dt>
                  <dd>{formatMoney(preview.retainageHeld)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-base">
                  <dt className="font-medium text-slate-950">Balance due</dt>
                  <dd className="font-semibold text-slate-950">
                    {formatMoney(preview.balanceDue)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border border-[#dfe4ec] bg-white px-3 py-2.5 text-sm leading-5 text-slate-500">
              Stored totals are recalculated on the server from canonical line items, tax snapshots, retainage, and payment records.
            </div>

            {manualItemsBlockingSend ? (
              <div className="border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-900">
                Manual catalog items must have quantity greater than zero before this invoice can move out of draft.
              </div>
            ) : null}

            <div className="border border-[#dfe4ec] bg-white px-3 py-2.5 text-sm leading-5 text-slate-500">
              Current builder state: {formatBaseSourceLabel(baseSourceType)} plus{" "}
              {manualCatalogItems.length} manual item
              {manualCatalogItems.length === 1 ? "" : "s"} and {explicitAdjustments.length} explicit
              adjustment{explicitAdjustments.length === 1 ? "" : "s"}.
            </div>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="billing-notes-terms"
        title="Billing Notes / Terms"
        description="Payment timing and billing adjustments stay in the workspace instead of being split into a disconnected finance-only flow."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <AuthField
            label="Discount"
            name="discountAmount"
            type="number"
            step="0.01"
            min="0"
            value={discountAmount}
            onChange={(event) => setDiscountAmount(event.target.value)}
            required
          />
          <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-2.5 text-sm leading-5 text-slate-600">
            Tax comes from organization settings unless the customer is exempt. Retainage defaults come from the customer profile and remain part of the same canonical invoice record.
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="files"
        title="Files"
        description="File handling stays attached to this invoice record even before richer attachment tooling is expanded."
      >
        <div className="border border-dashed border-slate-300 bg-[#f7f8fa] px-3 py-4 text-sm leading-5 text-slate-500">
          Invoice files are not being managed directly in this form yet. This section preserves the CF-like workspace structure without creating a detached document system.
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="payments"
        title="Payments"
        description="Payment history remains canonical and downstream, but it should not overshadow invoice building."
      >
        <div className="border border-[#d7dce4] bg-[#f7f8fa] px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-900">Recorded payments</p>
            <p className="text-base font-semibold text-slate-950">
              {formatMoney(recordedPayments)}
            </p>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            Payment recording continues to live on the invoice record and in the invoice detail view, while this build workspace stays focused on drafting and billing composition.
          </p>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="notes"
        title="Notes"
        description="Internal billing notes stay on the same invoice record for continuity."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Notes</span>
          <textarea
            name="notes"
            defaultValue={getValue(invoice?.notes)}
            rows={6}
            className="w-full border border-[#cfd6e0] bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
            placeholder="Optional notes for the invoice"
          />
        </label>
      </WorkspaceSection>

      <WorkspaceSection
        id="review-send"
        title="Review / Send"
        description="Save the invoice build first, then continue into review, customer send, and collection status handling."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[140px]">
            <span>{submitLabel}</span>
          </AuthSubmitButton>
          <p className="max-w-2xl text-sm leading-5 text-slate-500">
            Saving here updates the primary invoice workspace. Customer send, open balance, overdue, and payment collection remain visible in the invoice manager and detail flow.
          </p>
        </div>
      </WorkspaceSection>
    </form>
  );
}
