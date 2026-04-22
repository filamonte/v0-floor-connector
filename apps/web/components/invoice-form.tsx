"use client";

import { useRef, useState } from "react";
import type {
  CatalogItem,
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
  catalogItems?: CatalogItem[];
};

type LineItemDraft = {
  key: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
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

function createBlankLineItem(key: string): LineItemDraft {
  return {
    key,
    name: "",
    description: "",
    quantity: "1.00",
    unit: "each",
    unitPrice: "0.00"
  };
}

function createInitialLineItems(
  invoice?: EditableInvoice | null,
  initialLineItems?: InvoiceFormProps["initialLineItems"]
): LineItemDraft[] {
  if (invoice?.lineItems && invoice.lineItems.length > 0) {
    return invoice.lineItems.map((lineItem, index) => ({
      key: lineItem.id || `existing-${index}`,
      name: lineItem.name,
      description: getValue(lineItem.description),
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      unitPrice: lineItem.unitPrice
    }));
  }

  if (initialLineItems && initialLineItems.length > 0) {
    return initialLineItems.map((lineItem, index) => ({
      key: `initial-${index}`,
      name: lineItem.name,
      description: getValue(lineItem.description),
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      unitPrice: lineItem.unitPrice
    }));
  }

  return [createBlankLineItem("new-0")];
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
  subtotal,
  discountAmount,
  taxBehavior,
  taxRate,
  customerTaxExempt,
  retainagePercentage,
  recordedPayments,
  invoiceStatus
}: {
  subtotal: number;
  discountAmount: number;
  taxBehavior: TaxBehavior;
  taxRate: number;
  customerTaxExempt: boolean;
  retainagePercentage: number;
  recordedPayments: number;
  invoiceStatus: InvoiceStatus;
}): FinancialPreview {
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

  if (taxBehavior === "inclusive") {
    const taxableSales = Number((discountedSubtotal / (1 + taxRate)).toFixed(2));
    const taxAmount = Number((discountedSubtotal - taxableSales).toFixed(2));
    const total = Number(discountedSubtotal.toFixed(2));
    const balanceDue =
      invoiceStatus === "void"
        ? 0
        : Number(Math.max(0, total - retainageHeld - recordedPayments).toFixed(2));

    return {
      discountedSubtotal: total,
      taxableSales,
      exemptSales: 0,
      taxAmount,
      retainageHeld,
      total,
      balanceDue
    };
  }

  const taxableSales = Number(discountedSubtotal.toFixed(2));
  const taxAmount = Number((taxableSales * taxRate).toFixed(2));
  const total = Number((taxableSales + taxAmount).toFixed(2));
  const balanceDue =
    invoiceStatus === "void"
      ? 0
      : Number(Math.max(0, total - retainageHeld - recordedPayments).toFixed(2));

  return {
    discountedSubtotal: taxableSales,
    taxableSales,
    exemptSales: 0,
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
      className="rounded-[28px] border border-[#d8e0eb] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)] sm:px-6"
    >
      <div className="border-b border-[#e5ebf2] pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-[#17243b]">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="pt-5">{children}</div>
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
  catalogItems = []
}: InvoiceFormProps) {
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() =>
    createInitialLineItems(invoice, initialLineItems)
  );
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
  const nextLineItemId = useRef(lineItems.length);
  const [itemSearch, setItemSearch] = useState("");
  const [discountAmount, setDiscountAmount] = useState(
    getValue(invoice?.discountAmount ?? initialDiscountAmount) || "0.00"
  );
  const normalizedItemSearch = itemSearch.trim().toLowerCase();
  const visibleCatalogItems = catalogItems
    .filter((item) => item.status === "active")
    .filter((item) =>
      normalizedItemSearch.length === 0
        ? true
        : [item.name, item.description ?? "", item.itemType, item.unit]
            .join(" ")
            .toLowerCase()
            .includes(normalizedItemSearch)
    )
    .slice(0, 8);

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

  const recordedPayments = parseAmount(invoice?.paidAmount ?? paidAmount ?? "0.00");
  const subtotal = lineItems.reduce(
    (sum, lineItem) => sum + parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice),
    0
  );
  const preview = calculateFinancialPreview({
    subtotal,
    discountAmount: parseAmount(discountAmount),
    taxBehavior: resolvedTaxBehavior,
    taxRate: resolvedTaxRate,
    customerTaxExempt,
    retainagePercentage,
    recordedPayments,
    invoiceStatus: invoice?.status ?? "draft"
  });
  const derivedStatus = invoice?.status ?? "draft";

  function updateLineItem(
    key: string,
    field: keyof Omit<LineItemDraft, "key">,
    value: string
  ) {
    setLineItems((current) =>
      current.map((lineItem) =>
        lineItem.key === key ? { ...lineItem, [field]: value } : lineItem
      )
    );
  }

  function addLineItem() {
    const nextKey = `new-${nextLineItemId.current}`;

    nextLineItemId.current += 1;
    setLineItems((current) => [...current, createBlankLineItem(nextKey)]);
  }

  function removeLineItem(key: string) {
    setLineItems((current) =>
      current.length > 1 ? current.filter((lineItem) => lineItem.key !== key) : current
    );
  }

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
  }

  function handleWorkflowRoleChange(nextRole: InvoiceWorkflowRole) {
    setWorkflowRole(nextRole);

    if (nextRole === "deposit") {
      setSelectedJobId("");
    }
  }

  function addCatalogItem(item: CatalogItem) {
    const nextKey = `catalog-${nextLineItemId.current}`;

    nextLineItemId.current += 1;
    setLineItems((current) => [
      ...current,
      {
        key: nextKey,
        name: item.name,
        description: getValue(item.description),
        quantity: "1.00",
        unit: item.unit,
        unitPrice: item.defaultUnitPrice
      }
    ]);
  }

  return (
    <form action={action} className="space-y-5">
      {invoice ? <input type="hidden" name="invoiceId" value={invoice.id} /> : null}

      <WorkspaceSection
        id="details"
        title="Details"
        description="Build billing details here first. This stays the primary invoice workspace, with send and collections remaining downstream."
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
              <select
                name="projectId"
                value={selectedProjectId}
                onChange={(event) => handleProjectChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current status
                  </p>
                  <p className="mt-2 text-lg font-semibold capitalize text-[#17243b]">
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
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                onChange={(event) => setSelectedEstimateId(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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

          <div className="space-y-4">
            <div className="rounded-[22px] border border-[#d8e0eb] bg-[#f8fafc] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Financial defaults
              </p>
              <dl className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
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

            <div className="rounded-[22px] border border-[#d8e0eb] bg-[#f8fafc] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Calculated totals
              </p>
              <dl className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
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
        description="Invoices should build from approved estimate continuity and the shared inventory, with manual billing lines reserved for genuine exceptions."
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-[#dfe6f0] bg-[#fbfcfe] px-5 py-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Shared inventory</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Pull invoice lines from the same canonical inventory used in estimating. Linked approved estimates remain the preferred downstream source when they exist.
                  </p>
                </div>
                <input
                  type="search"
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search inventory items"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100 lg:max-w-xs"
                />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {visibleCatalogItems.length > 0 ? (
                  visibleCatalogItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addCatalogItem(item)}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-brand-200 hover:bg-[#fffdfb]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {item.itemType} / {item.unit}
                        </p>
                        {item.description ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand-700">
                        {formatMoney(Number(item.defaultUnitPrice))}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500 lg:col-span-2">
                    No shared inventory items match this search yet. Manual invoice lines still work, but they should remain the fallback path.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Invoice items</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Build the invoice body here before review and send. The resulting totals remain tied to canonical invoice, payment, and project continuity.
                </p>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Add line item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((lineItem, index) => {
                const lineTotal =
                  parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice);

                return (
                  <div
                    key={lineItem.key}
                    className="rounded-[24px] border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">Line item {index + 1}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600">
                          {formatMoney(lineTotal)}
                        </span>
                        {lineItems.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeLineItem(lineItem.key)}
                            className="text-sm font-medium text-rose-700 transition hover:text-rose-800"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-slate-800">Name</span>
                        <input
                          name="lineItemName"
                          type="text"
                          value={lineItem.name}
                          onChange={(event) =>
                            updateLineItem(lineItem.key, "name", event.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          placeholder="Main floor epoxy install"
                          required
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Description
                        </span>
                        <textarea
                          name="lineItemDescription"
                          value={lineItem.description}
                          onChange={(event) =>
                            updateLineItem(lineItem.key, "description", event.target.value)
                          }
                          rows={3}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          placeholder="Optional billing notes for this line item"
                        />
                      </label>

                      <AuthField
                        label="Quantity"
                        id={`${lineItem.key}-quantity`}
                        name="lineItemQuantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={lineItem.quantity}
                        onChange={(event) =>
                          updateLineItem(lineItem.key, "quantity", event.target.value)
                        }
                        required
                      />
                      <AuthField
                        label="Unit"
                        id={`${lineItem.key}-unit`}
                        name="lineItemUnit"
                        type="text"
                        value={lineItem.unit}
                        onChange={(event) =>
                          updateLineItem(lineItem.key, "unit", event.target.value)
                        }
                        placeholder="each"
                        required
                      />
                      <AuthField
                        label="Unit price"
                        id={`${lineItem.key}-unit-price`}
                        name="lineItemUnitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={lineItem.unitPrice}
                        onChange={(event) =>
                          updateLineItem(lineItem.key, "unitPrice", event.target.value)
                        }
                        required
                      />
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="block text-sm font-medium text-slate-800">
                          Line total
                        </span>
                        <span className="mt-2 block text-lg font-semibold text-slate-950">
                          {formatMoney(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-[#d8e0eb] bg-[#f8fafc] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Totals
              </p>
              <dl className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
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

            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-sm leading-6 text-slate-500">
              Stored totals are recalculated on the server from canonical line items, tax snapshots, retainage, and payment records.
            </div>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="billing-notes-terms"
        title="Billing Notes / Terms"
        description="Payment timing and billing adjustments stay in the workspace instead of being split into a disconnected finance-only flow."
      >
        <div className="grid gap-4 md:grid-cols-2">
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
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-slate-600">
            Tax comes from organization settings unless the customer is exempt. Retainage defaults come from the customer profile and remain part of the same canonical invoice record.
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="files"
        title="Files"
        description="File handling stays attached to this invoice record even before richer attachment tooling is expanded."
      >
        <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm leading-6 text-slate-500">
          Invoice files are not being managed directly in this form yet. This section preserves the CF-like workspace structure without creating a detached document system.
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="payments"
        title="Payments"
        description="Payment history remains canonical and downstream, but it should not overshadow invoice building."
      >
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-900">Recorded payments</p>
            <p className="text-base font-semibold text-slate-950">
              {formatMoney(recordedPayments)}
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
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
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
          <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[220px]">
            <span>{submitLabel}</span>
          </AuthSubmitButton>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Saving here updates the primary invoice workspace. Customer send, open balance, overdue, and payment collection remain visible in the invoice manager and detail flow.
          </p>
        </div>
      </WorkspaceSection>
    </form>
  );
}
