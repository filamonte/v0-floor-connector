"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Circle,
  FilePlus2,
  MoreVertical,
} from "lucide-react";
import type {
  CatalogItem,
  Estimate,
  EstimateContentBlock,
  EstimateItemGroup,
  EstimateLineItem,
  EstimateScopeItem,
  EstimateStatus,
  OrganizationFinancialSettings,
  TaxBehavior
} from "@floorconnector/types";

import { CoverSheet } from "@/components/estimates/cover-sheet";
import { EstimateApprovalNextStepsPanel } from "@/components/estimates/approval-next-steps-panel";
import {
  EstimateWorkspaceShell,
  type EstimateWorkspaceSectionId
} from "@/components/estimates/estimate-workspace-shell";
import { FilesSection } from "@/components/estimates/files-section";
import { ItemsSection, type EstimateItemsDraft } from "@/components/estimates/items-section";
import { NotesSection } from "@/components/estimates/notes-section";
import { ScopeOfWork } from "@/components/estimates/scope-of-work";
import { ReusableContentInserter } from "@/components/estimates/reusable-content-inserter";
import { TermsEditor } from "@/components/estimates/terms-editor";
import {
  calculateDiscountedTaxableSales,
  calculateLineTotal,
  calculateSharedUnitPricing,
  formatMoneyValue
} from "@/lib/catalogs/pricing";
import type {
  EstimateInsertResult,
  EstimateAutosaveResult,
  EstimateLineItemImportResult,
  EstimateReusableContentImportResult,
  ExpandedSystemPreviewResult,
  EstimateStatusTransitionResult
} from "@/lib/estimates/actions";
import type { EstimateApprovalOrchestrationState } from "@/lib/estimates/approval-orchestration";
import { stripHtmlToPlainText } from "@/lib/estimates/workspace";

type EditableEstimate = Estimate & {
  lineItems?: EstimateLineItem[];
  attachments?: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    downloadUrl: string | null;
  }>;
  workspaceDefaultsApplied?: boolean;
  estimateDefaultsSource?: "organization" | "platform_fallback";
};

type EstimateFormProps = {
  estimate?: EditableEstimate | null;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  projectServiceAddress?: {
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateRegion: string | null;
    postalCode: string | null;
    countryCode: string | null;
  } | null;
  catalogItems?: CatalogItem[];
  customerTaxExempt: boolean;
  organizationFinancialSettings: Pick<
    OrganizationFinancialSettings,
    "defaultTaxRate" | "defaultTaxBehavior"
  >;
  contentBlocks?: EstimateContentBlock[];
  autosaveAction: (formData: FormData) => Promise<EstimateAutosaveResult>;
  updateStatusAction: (formData: FormData) => Promise<EstimateStatusTransitionResult>;
  previewExpandedSystemAction: (input: {
    systemCatalogItemId: string;
    inputMode: "dimensions" | "direct";
    length: string;
    width: string;
    squareFootage: string;
    linearFootage: string;
    count: string;
  }) => Promise<ExpandedSystemPreviewResult>;
  insertCatalogItemAction: (input: {
    estimateId: string;
    catalogItemId: string;
  }) => Promise<EstimateInsertResult>;
  insertSystemAction: (input: {
    estimateId: string;
    systemCatalogItemId: string;
    squareFootage: string;
    linearFootage: string;
    count: string;
  }) => Promise<EstimateInsertResult>;
  importLineItemsFromEstimateAction: (input: {
    destinationEstimateId: string;
    sourceEstimateId: string;
  }) => Promise<EstimateLineItemImportResult>;
  importReusableContentFromEstimateAction: (input: {
    destinationEstimateId: string;
    sourceEstimateId: string;
    section: "scope" | "terms" | "inclusions" | "exclusions";
  }) => Promise<EstimateReusableContentImportResult>;
  quickCreateCatalogItemAction: (formData: FormData) => Promise<
    | { ok: true; item: CatalogItem }
    | { ok: false; message: string }
  >;
  importSourceEstimates?: Array<{
    id: string;
    referenceNumber: string;
    title: string | null;
    customerName: string | null;
    projectName: string | null;
    status: EstimateStatus;
    updatedAt: string;
    hasScopeContent: boolean;
    hasTermsContent: boolean;
    hasInclusionsContent: boolean;
    hasExclusionsContent: boolean;
  }>;
  approvalOrchestration?: EstimateApprovalOrchestrationState | null;
  contractAction: (formData: FormData) => void | Promise<void>;
  invoiceAction: (formData: FormData) => void | Promise<void>;
  scheduleOfValuesAction: (formData: FormData) => void | Promise<void>;
};

type SaveState = "saved" | "saving" | "error" | "conflict" | "dirty";

type PendingAttachment = {
  id: string;
  file: File;
};

type EstimateFinancialPreview = {
  subtotal: number;
  markup: number;
  taxableSales: number;
  exemptSales: number;
  taxAmount: number;
  total: number;
};

const statusDisplayLabels: Record<EstimateStatus, string> = {
  draft: "Estimating",
  sent: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected"
};

function createRowKey(prefix: string, index: number) {
  return `${prefix}-${index}`;
}

function parseNumericInput(value: string) {
  return Number(value.replace(/[$,%\s,]/g, "")) || 0;
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number) {
  return value.toFixed(2).replace(/\.00$/, "");
}

function formatQuantity(value: number) {
  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "") || "0";
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

function applyDraftPricing(
  lineItem: EstimateItemsDraft,
  options: { preserveUnitPriceOverride?: boolean } = {}
): EstimateItemsDraft {
  const pricing = calculateSharedUnitPricing({
    baseUnitCost: lineItem.baseUnitCost,
    baseUnitPrice: lineItem.baseUnitPrice,
    markupPercent: lineItem.markupPercent,
    hiddenMarkupPercent: lineItem.hiddenMarkupPercent
  });
  const resolvedUnitPrice =
    options.preserveUnitPriceOverride && lineItem.unitPrice.trim().length > 0
      ? parseNumericInput(lineItem.unitPrice)
      : pricing.finalUnitPrice;
  const computedLineTotal = calculateLineTotal(lineItem.quantity, resolvedUnitPrice);

  return {
    ...lineItem,
    baseUnitCost: formatMoneyValue(pricing.baseUnitCost),
    baseUnitPrice:
      pricing.baseUnitPrice == null ? "" : formatMoneyValue(pricing.baseUnitPrice),
    markupPercent: formatPercent(pricing.markupPercent),
    hiddenMarkupPercent: formatMoneyValue(pricing.hiddenMarkupPercent),
    unitPriceBeforeHiddenMarkup: formatMoneyValue(pricing.unitPriceBeforeHiddenMarkup),
    visibleMarkupAmount: formatMoneyValue(pricing.visibleMarkupAmount),
    hiddenMarkupAmount: formatMoneyValue(pricing.hiddenMarkupAmount),
    unitPrice: formatMoney(resolvedUnitPrice),
    lineTotal: formatMoney(computedLineTotal)
  };
}

function buildItemGroups(estimate?: EditableEstimate | null): EstimateItemGroup[] {
  const existingGroups = [...(estimate?.content.itemGroups ?? [])];
  const labels = new Set(
    existingGroups.map((group) => group.label.trim().toLowerCase()).filter(Boolean)
  );

  for (const lineItem of estimate?.lineItems ?? []) {
    const label = lineItem.groupName?.trim();

    if (!label) {
      continue;
    }

    const normalized = label.toLowerCase();

    if (labels.has(normalized)) {
      continue;
    }

    existingGroups.push({
      id: createRowKey("group", existingGroups.length + 1),
      label,
      sortOrder: existingGroups.length
    });
    labels.add(normalized);
  }

  return existingGroups;
}

function mergeItemGroupsWithLineItems(
  existingGroups: EstimateItemGroup[],
  lineItems: EstimateLineItem[]
) {
  const nextGroups = [...existingGroups];
  const labels = new Set(
    nextGroups.map((group) => group.label.trim().toLowerCase()).filter(Boolean)
  );

  for (const lineItem of lineItems) {
    const label = lineItem.groupName?.trim();

    if (!label || labels.has(label.toLowerCase())) {
      continue;
    }

    nextGroups.push({
      id: createRowKey("group", nextGroups.length + 1),
      label,
      sortOrder: nextGroups.length
    });
    labels.add(label.toLowerCase());
  }

  return nextGroups;
}

function buildLineItemDrafts(
  estimate: EditableEstimate | null | undefined,
  itemGroups: EstimateItemGroup[]
): EstimateItemsDraft[] {
  const groupIdByLabel = new Map(
    itemGroups.map((group) => [group.label.trim().toLowerCase(), group.id] as const)
  );

  if (estimate?.lineItems?.length) {
    return estimate.lineItems.map((lineItem, index) => {
      const legacyRow = estimate.content.itemRows[index];
      const resolvedMarkupPercent =
        Number(lineItem.markupPercent ?? legacyRow?.markupPercent ?? "0").toFixed(2);
      const resolvedBaseUnitPrice = Number(
        lineItem.baseUnitPrice ?? legacyRow?.baseUnitPrice ?? lineItem.unitPrice
      ).toFixed(2);
      const resolvedBaseUnitCost = Number(lineItem.baseUnitCost ?? "0").toFixed(2);
      const groupId = lineItem.groupName
        ? groupIdByLabel.get(lineItem.groupName.trim().toLowerCase()) ?? null
        : legacyRow?.groupId ?? null;

      return applyDraftPricing({
        rowKey: legacyRow?.rowKey ?? createRowKey("row", index + 1),
        catalogItemId: lineItem.catalogItemId,
        sourceType:
          lineItem.sourceType === "system_component"
            ? "system_component"
            : "catalog_item",
        sourceSystemId: lineItem.sourceSystemId,
        sourceComponentId: lineItem.sourceComponentId,
        itemType: lineItem.itemType ?? "service",
        groupId,
        name: lineItem.name,
        description: lineItem.description ?? "",
        quantity: Number(lineItem.quantity).toFixed(2),
        unit: lineItem.unit || "each",
        baseUnitCost: resolvedBaseUnitCost,
        baseUnitPrice: resolvedBaseUnitPrice,
        markupPercent: formatPercent(parseNumericInput(resolvedMarkupPercent)),
        hiddenMarkupPercent: Number(lineItem.hiddenMarkupPercent ?? "0").toFixed(2),
        unitPriceBeforeHiddenMarkup: Number(
          lineItem.unitPriceBeforeHiddenMarkup ?? lineItem.unitPrice
        ).toFixed(2),
        visibleMarkupAmount: Number(lineItem.visibleMarkupAmount ?? "0").toFixed(2),
        hiddenMarkupAmount: Number(lineItem.hiddenMarkupAmount ?? "0").toFixed(2),
        unitPrice: formatMoney(parseNumericInput(lineItem.unitPrice)),
        costCode: lineItem.costCode ?? "",
        taxCode: lineItem.taxable ? "taxable" : "non-taxable",
        assignedTo: lineItem.assignedTo ?? legacyRow?.assignedTo ?? "",
        lineTotal: formatMoney(parseNumericInput(lineItem.lineTotal))
      }, { preserveUnitPriceOverride: true });
    });
  }

  return [];
}

function createBlankScopeItem(nextIndex: number): EstimateScopeItem {
  return {
    id: `scope-${nextIndex}`,
    text: "",
    includeInOutput: true,
    sortOrder: nextIndex
  };
}

function buildScopeItems(estimate?: EditableEstimate | null): EstimateScopeItem[] {
  const existingItems = estimate?.content.scopeItems ?? [];

  if (existingItems.length > 0) {
    return [...existingItems, createBlankScopeItem(existingItems.length + 1)];
  }

  return [createBlankScopeItem(1)];
}

function formatStatusLabel(status: EstimateStatus) {
  return status.replaceAll("_", " ");
}

function calculateEstimateFinancialPreview(input: {
  lineItems: EstimateItemsDraft[];
  discountAmount: string;
  taxBehavior: TaxBehavior;
  taxRate: number;
  customerTaxExempt: boolean;
}): EstimateFinancialPreview {
  const subtotal = input.lineItems.reduce((sum, lineItem) => {
    if (!lineItem.name.trim()) {
      return sum;
    }

    return sum + parseNumericInput(lineItem.lineTotal);
  }, 0);
  const markup = input.lineItems.reduce((sum, lineItem) => {
    if (!lineItem.name.trim()) {
      return sum;
    }

    const quantity = parseNumericInput(lineItem.quantity);
    const visibleMarkup = parseNumericInput(lineItem.visibleMarkupAmount);
    const hiddenMarkup = parseNumericInput(lineItem.hiddenMarkupAmount);

    return sum + quantity * (visibleMarkup + hiddenMarkup);
  }, 0);
  const rawTaxableSales = input.lineItems.reduce((sum, lineItem) => {
    if (!lineItem.name.trim() || lineItem.taxCode !== "taxable") {
      return sum;
    }

    return sum + parseNumericInput(lineItem.lineTotal);
  }, 0);
  const discountAmount = parseNumericInput(input.discountAmount);
  const totals = calculateDiscountedTaxableSales({
    subtotal,
    taxableSubtotal: rawTaxableSales,
    discountAmount,
    taxBehavior: input.taxBehavior,
    taxRate: input.taxRate,
    customerTaxExempt: input.customerTaxExempt
  });

  return {
    subtotal,
    markup,
    taxableSales: totals.taxableSales,
    exemptSales: totals.exemptSales,
    taxAmount: totals.taxAmount,
    total: totals.total
  };
}

function appendHtmlBlock(currentValue: string, blockHtml: string) {
  const trimmedCurrent = currentValue.trim();
  const trimmedBlock = blockHtml.trim();

  if (!trimmedCurrent) {
    return trimmedBlock;
  }

  if (!trimmedBlock) {
    return trimmedCurrent;
  }

  return `${trimmedCurrent}<hr />${trimmedBlock}`;
}

function appendImportedScopeItems(
  currentItems: EstimateScopeItem[],
  importedItems: EstimateScopeItem[]
) {
  const existingItems = currentItems.filter((item) => item.text.trim().length > 0);
  const nextItems = [
    ...existingItems,
    ...importedItems.map((item, index) => ({
      ...item,
      id: createRowKey("scope", existingItems.length + index + 1),
      sortOrder: existingItems.length + index
    }))
  ];

  return [...nextItems, createBlankScopeItem(nextItems.length + 1)].map((item, index) => ({
    ...item,
    sortOrder: index
  }));
}

function renderDetailsSection(input: {
  currentStatus: EstimateStatus;
  title: string;
  customerName?: string | null;
  projectName?: string | null;
  opportunityTitle?: string | null;
  projectServiceAddressLabel: string;
  estimateDate: string;
  expirationDate: string;
  projectType: string;
  sector: string;
  discountAmount: string;
  taxBehaviorLabel: string;
  taxRateLabel: string;
  customerTaxExempt: boolean;
  taxableSalesLabel: string;
  exemptSalesLabel: string;
  derivedTaxLabel: string;
  onEstimateDateChange: (value: string) => void;
  onExpirationDateChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onDiscountAmountChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}) {
  const {
    currentStatus,
    title,
    customerName,
    projectName,
    opportunityTitle,
    projectServiceAddressLabel,
    estimateDate,
    expirationDate,
    projectType,
    sector,
    discountAmount,
    taxBehaviorLabel,
    taxRateLabel,
    customerTaxExempt,
    taxableSalesLabel,
    exemptSalesLabel,
    derivedTaxLabel,
    onEstimateDateChange,
    onExpirationDateChange,
    onProjectTypeChange,
    onSectorChange,
    onDiscountAmountChange,
    onTitleChange
  } = input;

  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] bg-[#f7f8fb] px-4 py-3">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[#23395d]">
          <span>Project details and estimate context</span>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-[#6b7c96]">
          This section keeps the project-specific estimate context together. Reusable scope, terms,
          inclusions, and exclusions live in their own content areas, and project-details import is
          still coming later.
        </p>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#5d6f8a]">Estimate Title</label>
            <input
              onChange={(event) => onTitleChange(event.target.value)}
              value={title}
              className="mt-1.5 h-11 w-full border border-[#d8deea] px-3 text-[14px] text-[#243a5f] outline-none focus:border-[#8ca0bf]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5d6f8a]">Customer</label>
            <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] text-[#243a5f]">
              {customerName ?? "No customer linked"}
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5d6f8a]">
              Project / Opportunity
            </label>
            <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] text-[#243a5f]">
              {projectName ?? opportunityTitle ?? "Opportunity continuity linked"}
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5d6f8a]">
              Project Service Address
            </label>
            <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] leading-5 text-[#243a5f]">
              {projectServiceAddressLabel}
            </div>
            <p className="mt-1.5 text-[12px] leading-5 text-[#7b8ba5]">
              Jobsite/service address, separate from customer billing or contact address.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Estimate Date</label>
              <input
                type="date"
                value={estimateDate}
                onChange={(event) => onEstimateDateChange(event.target.value)}
                className="mt-1.5 h-11 w-full border border-[#d8deea] px-3 text-[14px] text-[#243a5f] outline-none focus:border-[#8ca0bf]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Expiration Date</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(event) => onExpirationDateChange(event.target.value)}
                className="mt-1.5 h-11 w-full border border-[#d8deea] px-3 text-[14px] text-[#243a5f] outline-none focus:border-[#8ca0bf]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#5d6f8a]">Status</label>
            <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] capitalize text-[#243a5f]">
              {formatStatusLabel(currentStatus)}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Project Type</label>
              <input
                value={projectType}
                onChange={(event) => onProjectTypeChange(event.target.value)}
                placeholder="Select type"
                className="mt-1.5 h-11 w-full border border-[#d8deea] px-3 text-[14px] text-[#243a5f] outline-none focus:border-[#8ca0bf]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Sector</label>
              <input
                value={sector}
                onChange={(event) => onSectorChange(event.target.value)}
                placeholder="Select sector"
                className="mt-1.5 h-11 w-full border border-[#d8deea] px-3 text-[14px] text-[#243a5f] outline-none focus:border-[#8ca0bf]"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">
                Discount Amount
              </label>
              <input
                value={discountAmount}
                onChange={(event) => onDiscountAmountChange(event.target.value)}
                className="mt-1.5 h-11 w-full border border-[#d8deea] px-3 text-[14px] text-[#243a5f] outline-none focus:border-[#8ca0bf]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Tax Rule</label>
              <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] text-[#243a5f]">
                {taxBehaviorLabel} at {taxRateLabel}
                {customerTaxExempt ? " | Customer exempt" : ""}
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Taxable Sales</label>
              <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] text-[#243a5f]">
                {taxableSalesLabel}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Exempt Sales</label>
              <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] text-[#243a5f]">
                {exemptSalesLabel}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5d6f8a]">Derived Tax</label>
              <div className="mt-1.5 min-h-11 border border-[#d8deea] bg-[#fbfcfe] px-3 py-3 text-[14px] text-[#243a5f]">
                {derivedTaxLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderBiddingStub() {
  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] bg-[#f7f8fb] px-4 py-3 text-[15px] font-semibold text-[#23395d]">
        Bidding
      </div>
      <div className="px-5 py-6 text-[14px] leading-6 text-[#5f7190]">
        Bidding remains limited in this run. The workspace is preserving the section and estimate
        continuity, but full bid-package behavior is still outside scope.
      </div>
    </section>
  );
}

export function EstimateForm({
  estimate,
  opportunityTitle,
  customerName,
  projectName,
  projectServiceAddress,
  catalogItems = [],
  customerTaxExempt,
  organizationFinancialSettings,
  contentBlocks = [],
  autosaveAction,
  updateStatusAction,
  previewExpandedSystemAction,
  insertCatalogItemAction,
  insertSystemAction,
  importLineItemsFromEstimateAction,
  importReusableContentFromEstimateAction,
  quickCreateCatalogItemAction,
  importSourceEstimates = [],
  approvalOrchestration = null,
  contractAction,
  invoiceAction,
  scheduleOfValuesAction
}: EstimateFormProps) {
  const initialItemGroups = buildItemGroups(estimate);
  const [activeSection, setActiveSection] =
    useState<EstimateWorkspaceSectionId>("items");
  const formRef = useRef<HTMLFormElement | null>(null);
  const statusInputRef = useRef<HTMLInputElement | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef("");
  const [status, setStatus] = useState<EstimateStatus>(estimate?.status ?? "draft");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMarkup, setShowMarkup] = useState(true);
  const [showOnlyZeroItems, setShowOnlyZeroItems] = useState(false);
  const [title, setTitle] = useState(
    estimate?.title ??
      projectName ??
      opportunityTitle ??
      estimate?.referenceNumber ??
      "Estimate Workspace"
  );
  const [itemGroups, setItemGroups] = useState<EstimateItemGroup[]>(initialItemGroups);
  const [lineItems, setLineItems] = useState<EstimateItemsDraft[]>(() =>
    buildLineItemDrafts(estimate, initialItemGroups)
  );
  const [termsHtml, setTermsHtml] = useState(estimate?.content.termsHtml ?? "");
  const [inclusionsHtml, setInclusionsHtml] = useState(
    estimate?.content.inclusionsHtml ?? ""
  );
  const [exclusionsHtml, setExclusionsHtml] = useState(
    estimate?.content.exclusionsHtml ?? ""
  );
  const [notesHtml, setNotesHtml] = useState(estimate?.content.notesHtml ?? "");
  const [scopeSummaryHtml, setScopeSummaryHtml] = useState(
    estimate?.content.scopeSummaryHtml ?? ""
  );
  const [estimateDate, setEstimateDate] = useState(estimate?.estimateDate ?? "");
  const [expirationDate, setExpirationDate] = useState(estimate?.expirationDate ?? "");
  const [projectType, setProjectType] = useState(estimate?.projectType ?? "");
  const [sector, setSector] = useState(estimate?.sector ?? "");
  const [discountAmount, setDiscountAmount] = useState(
    estimate?.discountAmount?.toString() ?? "0.00"
  );
  const [scopeItems, setScopeItems] = useState<EstimateScopeItem[]>(() =>
    buildScopeItems(estimate)
  );
  const [retainedAttachmentIds, setRetainedAttachmentIds] = useState<string[]>(
    estimate?.attachments?.map((attachment) => attachment.id) ?? []
  );
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [systemInputMode, setSystemInputMode] = useState<"dimensions" | "direct">("dimensions");
  const [systemLength, setSystemLength] = useState("");
  const [systemWidth, setSystemWidth] = useState("");
  const [systemSquareFootage, setSystemSquareFootage] = useState("");
  const [systemLinearFootage, setSystemLinearFootage] = useState("");
  const [systemCount, setSystemCount] = useState("1");
  const [systemPreviewResult, setSystemPreviewResult] =
    useState<ExpandedSystemPreviewResult | null>(null);
  const [systemPreviewMessage, setSystemPreviewMessage] = useState<string | null>(null);
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(estimate?.updatedAt ?? "");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveMessage, setSaveMessage] = useState(
    estimate?.workspaceDefaultsApplied
      ? "Defaults loaded. Your edits will save automatically."
      : "All changes saved."
  );
  const [titleEditing, setTitleEditing] = useState(false);
  const [inventoryCreateError, setInventoryCreateError] = useState<string | null>(null);
  const [catalogInventoryItems, setCatalogInventoryItems] = useState<CatalogItem[]>(catalogItems);
  const [approvalPanelInitialOpen, setApprovalPanelInitialOpen] = useState(false);
  const [approvalState, setApprovalState] = useState<EstimateApprovalOrchestrationState | null>(
    approvalOrchestration
  );
  const [isPending, startSaveTransition] = useTransition();
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const projectServiceAddressLabel = useMemo(() => {
    const parts = [
      projectServiceAddress?.addressLine1,
      projectServiceAddress?.addressLine2,
      projectServiceAddress?.city,
      projectServiceAddress?.stateRegion,
      projectServiceAddress?.postalCode,
      projectServiceAddress?.countryCode
    ].filter((value): value is string => Boolean(value && value.trim().length > 0));

    return parts.length > 0 ? parts.join(", ") : "No project service address provided";
  }, [projectServiceAddress]);

  const filteredCatalogItems = catalogInventoryItems.filter(
    (item) => item.status === "active"
  );
  const activeContentBlocks = contentBlocks.filter((block) => block.status === "active");
  const nextGroupIndex = useMemo(() => itemGroups.length + 1, [itemGroups.length]);
  const taxBehavior = organizationFinancialSettings.defaultTaxBehavior;
  const taxRate =
    customerTaxExempt || taxBehavior === "none"
      ? 0
      : parseNumericInput(organizationFinancialSettings.defaultTaxRate);
  const preview = useMemo(
    () =>
      calculateEstimateFinancialPreview({
        lineItems,
        discountAmount,
        taxBehavior,
        taxRate,
        customerTaxExempt
      }),
    [customerTaxExempt, discountAmount, lineItems, taxBehavior, taxRate]
  );
  const subtotalLabel = formatMoney(preview.subtotal);
  const markupLabel = formatMoney(preview.markup);
  const taxableSubtotalLabel = formatMoney(preview.taxableSales);
  const exemptSubtotalLabel = formatMoney(preview.exemptSales);
  const taxLabel = formatMoney(preview.taxAmount);
  const discountLabel = formatMoney(parseNumericInput(discountAmount));
  const totalAmountLabel = formatMoney(preview.total);
  const totalLabel = `Total w/Tax: ${totalAmountLabel}`;
  const allowedTransitions: readonly EstimateStatus[] = [];
  const taxBehaviorLabel = formatTaxBehaviorLabel(taxBehavior);
  const taxRateLabel = `${(taxRate * 100).toFixed(2)}%`;
  const scopeBlocks = useMemo(
    () => activeContentBlocks.filter((block) => block.blockType === "scope"),
    [activeContentBlocks]
  );
  const inclusionBlocks = useMemo(
    () => activeContentBlocks.filter((block) => block.blockType === "inclusion"),
    [activeContentBlocks]
  );
  const termsBlocks = useMemo(
    () => activeContentBlocks.filter((block) => block.blockType === "terms"),
    [activeContentBlocks]
  );
  const exclusionBlocks = useMemo(
    () => activeContentBlocks.filter((block) => block.blockType === "exclusion"),
    [activeContentBlocks]
  );
  const selectedSystemPreview =
    systemPreviewResult?.ok &&
    systemPreviewResult.systemCatalogItemId === selectedSystemId &&
    systemPreviewResult.squareFootage === Number(systemSquareFootage || 0).toFixed(2) &&
    systemPreviewResult.linearFootage === Number(systemLinearFootage || 0).toFixed(2) &&
    systemPreviewResult.count === Number(systemCount || 1).toFixed(2)
      ? systemPreviewResult.preview
      : null;

  function markDirty() {
    setSaveState("dirty");
    setSaveMessage("Unsaved changes");
  }

  function buildEstimateFormData() {
    const form = formRef.current;

    if (!form) {
      return null;
    }

    const formData = new FormData(form);

    formData.set("estimateId", estimate?.id ?? "");
    formData.set("expectedUpdatedAt", expectedUpdatedAt);

    for (const attachment of pendingAttachments) {
      formData.append("newAttachments", attachment.file);
    }

    return formData;
  }

  async function persistEstimate(reason: "manual" | "autosave" = "autosave") {
    const formData = buildEstimateFormData();

    if (!formData) {
      return null;
    }

    setSaveState("saving");
    setSaveMessage("Saving...");
    const result = await autosaveAction(formData);

    if (!result.ok) {
      setSaveState(result.type === "conflict" ? "conflict" : "error");
      setSaveMessage(result.message);
      return result;
    }

    setExpectedUpdatedAt(result.updatedAt);
    lastSavedSnapshotRef.current = JSON.stringify({
      title,
      status,
      lineItems,
      itemGroups,
      termsHtml,
      inclusionsHtml,
      exclusionsHtml,
      notesHtml,
      scopeSummaryHtml,
      estimateDate,
      expirationDate,
      projectType,
      sector,
      discountAmount,
      scopeItems,
      retainedAttachmentIds,
      pendingAttachmentCount: pendingAttachments.length
    });
    setPendingAttachments([]);
    setSaveState("saved");
    setSaveMessage(
      reason === "manual" ? "Saved." : `Saved ${new Date(result.updatedAt).toLocaleTimeString()}`
    );
    return result;
  }

  function syncServerInsertedLineItems(nextLineItems: EstimateLineItem[], updatedAt: string) {
    const nextGroups = mergeItemGroupsWithLineItems(itemGroups, nextLineItems);
    const nextDrafts = buildLineItemDrafts(
      {
        ...(estimate ?? ({} as EditableEstimate)),
        content: {
          ...(estimate?.content ?? {
            termsHtml: null,
            inclusionsHtml: null,
            exclusionsHtml: null,
            notesHtml: null,
            scopeSummaryHtml: null,
            scopeItems: [],
            itemRows: [],
            itemGroups: []
          }),
          itemGroups: nextGroups,
          itemRows: []
        },
        lineItems: nextLineItems
      },
      nextGroups
    );

    lastSavedSnapshotRef.current = "";
    setItemGroups(nextGroups);
    setLineItems(nextDrafts);
    setExpectedUpdatedAt(updatedAt);
    setSaveState("saved");
    setSaveMessage(`Saved ${new Date(updatedAt).toLocaleTimeString()}`);
  }

  function handleLineItemChange(
    rowKey: string,
    field: keyof EstimateItemsDraft,
    value: string
  ) {
    if (!["quantity", "groupId", "assignedTo", "unitPrice", "taxCode"].includes(field)) {
      return;
    }

    markDirty();
    setLineItems((currentLineItems) =>
      currentLineItems.map((lineItem) => {
        if (lineItem.rowKey !== rowKey) {
          return lineItem;
        }

        const nextGroupId = field === "groupId" ? value || null : lineItem.groupId;
        const nextLineItem = {
          ...lineItem,
          [field]: value,
          groupId: nextGroupId
        };

        return applyDraftPricing(nextLineItem, {
          preserveUnitPriceOverride: field === "quantity" || field === "unitPrice"
        });
      })
    );
  }

  async function insertCatalogItem(catalogItem: CatalogItem) {
    if (!estimate?.id) {
      return;
    }

    const saveResult =
      saveState === "dirty" || saveState === "error" || saveState === "conflict"
        ? await persistEstimate("manual")
        : null;

    if (saveResult && !saveResult.ok) {
      return;
    }

    const result = await insertCatalogItemAction({
      estimateId: estimate.id,
      catalogItemId: catalogItem.id
    });

    if (!result.ok) {
      setSaveState("error");
      setSaveMessage(result.message);
      return;
    }

    syncServerInsertedLineItems(result.lineItems, result.updatedAt);
  }

  function handleAddCatalogItem() {
    const catalogItem = filteredCatalogItems.find((item) => item.id === selectedCatalogItemId);

    if (!catalogItem) {
      return;
    }

    startSaveTransition(async () => {
      await insertCatalogItem(catalogItem);
      setSelectedCatalogItemId("");
    });
  }

  function handleQuickAddCatalogItem(catalogItemId: string) {
    const catalogItem = filteredCatalogItems.find((item) => item.id === catalogItemId);

    if (!catalogItem) {
      return;
    }

    startSaveTransition(async () => {
      await insertCatalogItem(catalogItem);
      setSelectedCatalogItemId("");
    });
  }

  async function handleQuickCreateCatalogItem(input: {
    name: string;
    itemType: CatalogItem["itemType"];
    unit: string;
    category: string | null;
    defaultUnitCost: string;
    defaultUnitPrice: string | null;
  }) {
    const formData = new FormData();
    formData.set("name", input.name);
    formData.set("itemType", input.itemType);
    formData.set("unit", input.unit);
    if (input.category) {
      formData.set("category", input.category);
    }
    formData.set("defaultUnitCost", input.defaultUnitCost);
    if (input.defaultUnitPrice) {
      formData.set("defaultUnitPrice", input.defaultUnitPrice);
    }
    formData.set("taxable", "on");

    const result = await quickCreateCatalogItemAction(formData);

    if (!result.ok) {
      setInventoryCreateError(result.message);
      return false;
    }

    setInventoryCreateError(null);
    setCatalogInventoryItems((currentItems) => [result.item, ...currentItems]);
    setSelectedCatalogItemId(result.item.id);
    startSaveTransition(async () => {
      await insertCatalogItem(result.item);
    });
    return true;
  }

  function resetSystemPreview() {
    setSystemPreviewResult(null);
    setSystemPreviewMessage(null);
  }

  function handleSelectedSystemIdChange(value: string) {
    setSelectedSystemId(value);
    resetSystemPreview();
  }

  function handleSystemMeasurementChange(field: string, value: string) {
    if (field === "inputMode") {
      setSystemInputMode(value === "direct" ? "direct" : "dimensions");
    } else if (field === "length") {
      setSystemLength(value);
      const length = parseNumericInput(value);
      const width = parseNumericInput(systemWidth);
      setSystemSquareFootage(length > 0 && width > 0 ? (length * width).toFixed(2) : "");
      setSystemLinearFootage(length > 0 && width > 0 ? ((length * 2) + (width * 2)).toFixed(2) : "");
    } else if (field === "width") {
      setSystemWidth(value);
      const length = parseNumericInput(systemLength);
      const width = parseNumericInput(value);
      setSystemSquareFootage(length > 0 && width > 0 ? (length * width).toFixed(2) : "");
      setSystemLinearFootage(length > 0 && width > 0 ? ((length * 2) + (width * 2)).toFixed(2) : "");
    } else if (field === "area") {
      setSystemSquareFootage(value);
    } else if (field === "linearFootage") {
      setSystemLinearFootage(value);
    } else if (field === "count") {
      setSystemCount(value);
    }

    resetSystemPreview();
  }

  function handlePreviewSystem() {
    const squareFootage = parseNumericInput(systemSquareFootage);
    const linearFootage = parseNumericInput(systemLinearFootage);
    const count = parseNumericInput(systemCount) || 1;

    if (!selectedSystemId || squareFootage <= 0) {
      setSystemPreviewMessage("Select a system and enter area measurements to preview.");
      setSystemPreviewResult(null);
      return;
    }

    setSystemPreviewMessage(null);
    startPreviewTransition(async () => {
      const result = await previewExpandedSystemAction({
        systemCatalogItemId: selectedSystemId,
        inputMode: systemInputMode,
        length: systemLength,
        width: systemWidth,
        squareFootage: squareFootage.toFixed(2),
        linearFootage: linearFootage.toFixed(2),
        count: count.toFixed(2)
      });

      if (!result.ok) {
        setSystemPreviewResult(null);
        setSystemPreviewMessage(result.message);
        return;
      }

      setSystemPreviewResult(result);
      setSystemPreviewMessage(
        `${result.systemName} previewed from the server at ${formatQuantity(squareFootage)} sqft and ${formatQuantity(linearFootage)} lf.`
      );
    });
  }

  function handleExpandSystem() {
    const squareFootage = Number(systemPreviewResult?.ok ? systemPreviewResult.squareFootage : 0);
    const linearFootage = Number(systemPreviewResult?.ok ? systemPreviewResult.linearFootage : 0);
    const count = Number(systemPreviewResult?.ok ? systemPreviewResult.count : 1);

    if (!estimate?.id || !systemPreviewResult?.ok) {
      return;
    }

    if (
      systemPreviewResult.systemCatalogItemId !== selectedSystemId ||
      systemPreviewResult.squareFootage !== squareFootage.toFixed(2) ||
      systemPreviewResult.linearFootage !== linearFootage.toFixed(2) ||
      systemPreviewResult.count !== count.toFixed(2)
    ) {
      return;
    }

    startSaveTransition(async () => {
      const saveResult =
        saveState === "dirty" || saveState === "error" || saveState === "conflict"
          ? await persistEstimate("manual")
          : null;

      if (saveResult && !saveResult.ok) {
        return;
      }

      const result = await insertSystemAction({
        estimateId: estimate.id,
        systemCatalogItemId: selectedSystemId,
        squareFootage: squareFootage.toFixed(2),
        linearFootage: linearFootage.toFixed(2),
        count: count.toFixed(2)
      });

      if (!result.ok) {
        setSaveState("error");
        setSaveMessage(result.message);
        return;
      }

      syncServerInsertedLineItems(result.lineItems, result.updatedAt);
      setSelectedSystemId("");
      setSystemLength("");
      setSystemWidth("");
      setSystemSquareFootage("");
      setSystemLinearFootage("");
      setSystemCount("1");
      resetSystemPreview();
    });
  }

  async function handleImportLineItemsFromEstimate(sourceEstimateId: string) {
    if (!estimate?.id) {
      return { ok: false as const, message: "Save this estimate before importing line items." };
    }

    if (status !== "draft") {
      return {
        ok: false as const,
        message: "Only draft estimates can import line items from another estimate."
      };
    }

    const saveResult =
      saveState === "dirty" || saveState === "error" || saveState === "conflict"
        ? await persistEstimate("manual")
        : null;

    if (saveResult && !saveResult.ok) {
      return { ok: false as const, message: saveResult.message };
    }

    const result = await importLineItemsFromEstimateAction({
      destinationEstimateId: estimate.id,
      sourceEstimateId
    });

    if (!result.ok) {
      setSaveState("error");
      setSaveMessage(result.message);
      return { ok: false as const, message: result.message };
    }

    syncServerInsertedLineItems(result.lineItems, result.updatedAt);

    return {
      ok: true as const,
      message: `Imported ${result.importedCount} line item${
        result.importedCount === 1 ? "" : "s"
      } from ${result.sourceEstimateReferenceNumber}.`
    };
  }

  async function handleImportReusableContentFromEstimate(
    sourceEstimateId: string,
    section: "scope" | "terms" | "inclusions" | "exclusions"
  ) {
    if (!estimate?.id) {
      return {
        ok: false as const,
        message: "Save this estimate before importing reusable content."
      };
    }

    if (status !== "draft") {
      return {
        ok: false as const,
        message: "Only draft estimates can import reusable content from another estimate."
      };
    }

    const result = await importReusableContentFromEstimateAction({
      destinationEstimateId: estimate.id,
      sourceEstimateId,
      section
    });

    if (!result.ok) {
      setSaveState("error");
      setSaveMessage(result.message);
      return { ok: false as const, message: result.message };
    }

    if (section === "scope") {
      if (result.content.scopeSummaryHtml) {
        setScopeSummaryHtml((currentValue) =>
          appendHtmlBlock(currentValue, result.content.scopeSummaryHtml ?? "")
        );
      }

      if (result.content.scopeItems.length > 0) {
        setScopeItems((currentItems) =>
          appendImportedScopeItems(currentItems, result.content.scopeItems)
        );
      }
    }

    const importedTermsHtml = result.content.termsHtml;
    const importedInclusionsHtml = result.content.inclusionsHtml;
    const importedExclusionsHtml = result.content.exclusionsHtml;

    if (section === "terms" && importedTermsHtml) {
      setTermsHtml((currentValue) => appendHtmlBlock(currentValue, importedTermsHtml));
    }

    if (section === "inclusions" && importedInclusionsHtml) {
      setInclusionsHtml((currentValue) =>
        appendHtmlBlock(currentValue, importedInclusionsHtml)
      );
    }

    if (section === "exclusions" && importedExclusionsHtml) {
      setExclusionsHtml((currentValue) =>
        appendHtmlBlock(currentValue, importedExclusionsHtml)
      );
    }

    markDirty();

    return {
      ok: true as const,
      message: `Imported ${
        section === "scope"
          ? "Scope / SOW"
          : section === "terms"
            ? "Terms"
            : section === "inclusions"
              ? "Inclusions"
              : "Exclusions"
      } from ${result.sourceEstimateReferenceNumber}.`
    };
  }

  function applyScopeBlock(blockHtml: string) {
    markDirty();
    setScopeSummaryHtml((currentValue) => appendHtmlBlock(currentValue, blockHtml));
  }

  function applyTermsBlock(blockHtml: string) {
    markDirty();
    setTermsHtml((currentValue) => appendHtmlBlock(currentValue, blockHtml));
  }

  function applyInclusionBlock(blockHtml: string) {
    markDirty();
    setInclusionsHtml((currentValue) => appendHtmlBlock(currentValue, blockHtml));
  }

  function applyExclusionBlock(blockHtml: string) {
    markDirty();
    setExclusionsHtml((currentValue) => appendHtmlBlock(currentValue, blockHtml));
  }

  function handleAddGroup() {
    const nextGroupId = createRowKey("group", nextGroupIndex);

    setItemGroups((currentGroups) => [
      ...currentGroups,
      {
        id: nextGroupId,
        label: `Item Group ${nextGroupIndex}`,
        sortOrder: currentGroups.length
      }
    ]);
    markDirty();
  }

  function handleGroupLabelChange(groupId: string, value: string) {
    markDirty();
    setItemGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId ? { ...group, label: value } : group
      )
    );
  }

  function handleDeleteGroup(groupId: string) {
    markDirty();
    setItemGroups((currentGroups) =>
      currentGroups
        .filter((group) => group.id !== groupId)
        .map((group, index) => ({
          ...group,
          sortOrder: index
        }))
    );
    setLineItems((currentLineItems) =>
      currentLineItems.map((lineItem) =>
        lineItem.groupId === groupId ? { ...lineItem, groupId: null } : lineItem
      )
    );
  }

  function handleScopeItemTextChange(id: string, value: string) {
    markDirty();
    setScopeItems((currentItems) => {
      const nextItems = currentItems.map((item) =>
        item.id === id ? { ...item, text: value } : item
      );
      const lastItem = nextItems[nextItems.length - 1];

      if (lastItem && lastItem.text.trim().length > 0) {
        nextItems.push(createBlankScopeItem(nextItems.length + 1));
      }

      return nextItems.map((item, index) => ({
        ...item,
        sortOrder: index
      }));
    });
  }

  function handleScopeItemIncludeChange(id: string, checked: boolean) {
    markDirty();
    setScopeItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, includeInOutput: checked } : item
      )
    );
  }

  function handleAddFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    markDirty();
    setPendingAttachments((currentAttachments) => [
      ...currentAttachments,
      ...files.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file
      }))
    ]);
  }

  function handleRemoveLineItem(rowKey: string) {
    markDirty();
    setLineItems((currentLineItems) =>
      currentLineItems.filter((lineItem) => lineItem.rowKey !== rowKey)
    );
  }

  function handleMoveLineItem(rowKey: string, direction: -1 | 1) {
    markDirty();
    setLineItems((currentLineItems) => {
      const index = currentLineItems.findIndex((lineItem) => lineItem.rowKey === rowKey);

      if (index < 0) {
        return currentLineItems;
      }

      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentLineItems.length) {
        return currentLineItems;
      }

      const nextItems = [...currentLineItems];
      const [movedItem] = nextItems.splice(index, 1);
      nextItems.splice(nextIndex, 0, movedItem);
      return nextItems;
    });
  }

  const currentSnapshot = JSON.stringify({
    title,
    status,
    lineItems,
    itemGroups,
    termsHtml,
    inclusionsHtml,
    exclusionsHtml,
    notesHtml,
    scopeSummaryHtml,
    estimateDate,
    expirationDate,
    projectType,
    sector,
    discountAmount,
    scopeItems,
    retainedAttachmentIds,
    pendingAttachmentCount: pendingAttachments.length
  });

  useEffect(() => {
    if (!lastSavedSnapshotRef.current) {
      lastSavedSnapshotRef.current = currentSnapshot;
      return;
    }

    if (currentSnapshot !== lastSavedSnapshotRef.current && saveState !== "conflict") {
      setSaveState("dirty");
      setSaveMessage("Unsaved changes");
    }
  }, [currentSnapshot, saveState]);

  useEffect(() => {
    if (saveState !== "dirty") {
      return;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      startSaveTransition(() => {
        void persistEstimate("autosave");
      });
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [currentSnapshot, saveState]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "error" || saveState === "conflict") {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  const statusStrip = (
    <div className="flex items-start gap-4">
      {(["draft", "sent", "approved", "rejected"] as const).map((candidateStatus, index, statuses) => {
        const isCurrent = status === candidateStatus;
        const canSelect = allowedTransitions.includes(candidateStatus);
        const label = statusDisplayLabels[candidateStatus];

        return (
          <div key={candidateStatus} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  if (canSelect) {
                    setStatus(candidateStatus);
                    if (statusInputRef.current) {
                      statusInputRef.current.value = candidateStatus;
                    }
                    const formData = new FormData();
                    formData.set("estimateId", estimate?.id ?? "");
                    formData.set("currentStatus", status);
                    formData.set("nextStatus", candidateStatus);
                    formData.set("expectedUpdatedAt", expectedUpdatedAt);
                    setSaveState("saving");
                    setSaveMessage("Saving...");
                    const result = await updateStatusAction(formData);

                    if (!result.ok) {
                      setSaveState(result.type);
                      setSaveMessage(result.message);
                      setStatus(status);
                      return;
                    }

                    setExpectedUpdatedAt(result.updatedAt);
                    setApprovalState(result.orchestration);
                    if (result.status === "approved") {
                      setApprovalPanelInitialOpen(true);
                    }
                    setSaveState("saved");
                    setSaveMessage(`Saved ${new Date(result.updatedAt).toLocaleTimeString()}`);
                  }
                })();
              }}
              className="flex flex-col items-center gap-2"
              disabled={!canSelect}
              title={
                canSelect
                  ? `Set status to ${label}`
                  : `Cannot move from ${status} to ${candidateStatus}`
              }
            >
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center border",
                  isCurrent
                    ? "border-[#d8731f] bg-[#d8731f] text-white"
                    : canSelect
                      ? "border-[#cfd6e0] bg-white text-[#d8731f]"
                      : "border-[#d9dee8] bg-white text-[#d9dee8]"
                ].join(" ")}
              >
                {isCurrent ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </div>
              <span className="max-w-[92px] truncate text-center text-[12px] text-[#71829c]">
                {label}
              </span>
            </button>
            {index < statuses.length - 1 ? (
              <div className="mt-[-14px] h-px w-[34px] bg-[#d9dee8]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );

  const headerActions = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => setActiveSection("review-submit")}
        className="inline-flex h-9 items-center justify-center border border-[#d8731f] bg-[#fff1e4] px-3 text-[13px] font-semibold text-[#a4581a] transition hover:bg-[#ffe2c5]"
      >
        Review
      </button>
      {estimate?.id ? (
        <Link
          href={`/estimates/${estimate.id}`}
          className="inline-flex h-9 items-center justify-center border border-[#d8731f] bg-[#d8731f] px-3 text-[13px] font-semibold text-white transition hover:bg-[#bf6519]"
        >
          Open review page
        </Link>
      ) : null}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-9 w-9 items-center justify-center border border-[#cfd6e0] hover:bg-[#f0f3f7]"
          title="More estimate actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-[40px] z-20 min-w-[220px] border border-[#cfd6e0] bg-white p-1">
            {status === "approved" ? (
              <Link
                href={`/contracts?estimateId=${estimate?.id ?? ""}`}
                className="block px-3 py-1.5 text-[13px] text-[#334a70] hover:bg-[#f0f3f7]"
              >
                Generate Contract
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="block w-full px-3 py-1.5 text-left text-[13px] text-[#a7b2c4]"
                title="Contract generation becomes real after estimate approval."
              >
                Generate Contract
              </button>
            )}
            <Link
              href={`/projects/${estimate?.projectId ?? ""}`}
              className="block px-3 py-1.5 text-[13px] text-[#334a70] hover:bg-[#f0f3f7]"
            >
              Open Project
            </Link>
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[#a7b2c4]"
              title="Copy/export actions still need backend continuity and remain out of scope for this run."
            >
              <FilePlus2 className="h-4 w-4" />
              <span>Copy / Export</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {status === "approved" && approvalState ? (
        <EstimateApprovalNextStepsPanel
          orchestration={approvalState}
          contractAction={contractAction}
          invoiceAction={invoiceAction}
          scheduleOfValuesAction={scheduleOfValuesAction}
          initialOpen={approvalPanelInitialOpen}
        />
      ) : null}

      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          startSaveTransition(() => {
            void persistEstimate("manual");
          });
        }}
      >
      <input type="hidden" name="estimateId" value={estimate?.id ?? ""} />
      <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />
      <input type="hidden" name="opportunityId" value={estimate?.opportunityId ?? ""} />
      <input type="hidden" name="projectId" value={estimate?.projectId ?? ""} />
      <input type="hidden" name="title" value={title} />
      <input ref={statusInputRef} type="hidden" name="status" value={status} />
      <input type="hidden" name="estimateDate" value={estimateDate} />
      <input type="hidden" name="expirationDate" value={expirationDate} />
      <input type="hidden" name="projectType" value={projectType} />
      <input type="hidden" name="sector" value={sector} />
      <input type="hidden" name="discountAmount" value={discountAmount} />
      <input type="hidden" name="termsHtml" value={termsHtml} />
      <input type="hidden" name="inclusionsHtml" value={inclusionsHtml} />
      <input type="hidden" name="exclusionsHtml" value={exclusionsHtml} />
      <input type="hidden" name="notesHtml" value={notesHtml} />
      <input type="hidden" name="scopeSummaryHtml" value={scopeSummaryHtml} />
      <input type="hidden" name="notes" value={stripHtmlToPlainText(notesHtml) ?? ""} />

      {itemGroups.map((group) => (
        <div key={`group-hidden-${group.id}`}>
          <input type="hidden" name="itemGroupId" value={group.id} />
          <input type="hidden" name="itemGroupLabel" value={group.label} />
        </div>
      ))}

      {lineItems.map((lineItem) => {
        const groupName =
          itemGroups.find((group) => group.id === lineItem.groupId)?.label ?? "";

        return (
          <div key={`line-item-hidden-${lineItem.rowKey}`}>
            <input type="hidden" name="lineItemRowKey" value={lineItem.rowKey} />
            <input type="hidden" name="lineItemCatalogItemId" value={lineItem.catalogItemId ?? ""} />
            <input type="hidden" name="lineItemSourceType" value={lineItem.sourceType} />
            <input type="hidden" name="lineItemSourceSystemId" value={lineItem.sourceSystemId ?? ""} />
            <input
              type="hidden"
              name="lineItemSourceComponentId"
              value={lineItem.sourceComponentId ?? ""}
            />
            <input type="hidden" name="lineItemQuantity" value={lineItem.quantity} />
            <input type="hidden" name="lineItemUnitPriceOverride" value={lineItem.unitPrice} />
            <input
              type="hidden"
              name="lineItemTaxableOverride"
              value={lineItem.taxCode === "taxable" ? "true" : "false"}
            />
            <input type="hidden" name="lineItemAssignedTo" value={lineItem.assignedTo} />
            <input type="hidden" name="lineItemGroupName" value={groupName} />
          </div>
        );
      })}

      {scopeItems
        .filter((item) => item.text.trim().length > 0)
        .map((item) => (
          <div key={`scope-item-hidden-${item.id}`}>
            <input type="hidden" name="scopeItemId" value={item.id} />
            <input type="hidden" name="scopeItemText" value={item.text} />
            <input
              type="hidden"
              name="scopeItemIncludeInOutput"
              value={item.includeInOutput ? "true" : "false"}
            />
          </div>
        ))}

      {retainedAttachmentIds.map((attachmentId) => (
        <input
          key={`retained-attachment-${attachmentId}`}
          type="hidden"
          name="retainedAttachmentId"
          value={attachmentId}
        />
      ))}

        <EstimateWorkspaceShell
        title={title}
        subtitle={opportunityTitle ?? "Project/Opportunity"}
        estimateNumber={estimate?.referenceNumber ?? null}
        statusLabel={statusDisplayLabels[status]}
        activeSection={activeSection}
        onSectionChange={(section) => {
          if (section === activeSection) {
            return;
          }

          setActiveSection(section);
        }}
        statusStrip={statusStrip}
        headerActions={headerActions}
        saveStateLabel={isPending || saveState === "saving" ? "Saving..." : saveMessage}
        titleEditing={titleEditing}
        onTitleEditToggle={() => setTitleEditing((current) => !current)}
        onTitleChange={(value) => {
          setTitle(value);
          markDirty();
        }}
        onTitleBlur={() => {
          setTitleEditing(false);
          if (saveState === "dirty") {
            startTransition(() => {
              void persistEstimate("manual");
            });
          }
        }}
      >
        <div className={activeSection === "items" ? "block" : "hidden"}>
          <ItemsSection
            totalLabel={totalLabel}
            subtotalAmount={subtotalLabel}
            markupAmount={markupLabel}
            taxableSubtotal={taxableSubtotalLabel}
            exemptSubtotal={exemptSubtotalLabel}
            taxAmount={taxLabel}
            discountAmount={discountLabel}
            totalAmount={totalAmountLabel}
            taxBehaviorLabel={taxBehaviorLabel}
            taxRateLabel={taxRateLabel}
            customerTaxExempt={customerTaxExempt}
            lineItems={lineItems}
            itemGroups={itemGroups}
            showMarkup={showMarkup}
            showOnlyZeroItems={showOnlyZeroItems}
            visibleCatalogItems={filteredCatalogItems}
            estimateStatus={status}
            importSourceEstimates={importSourceEstimates}
            selectedCatalogItemId={selectedCatalogItemId}
            selectedSystemId={selectedSystemId}
            systemInputMode={systemInputMode}
            systemLength={systemLength}
            systemWidth={systemWidth}
            systemSquareFootage={systemSquareFootage}
            systemLinearFootage={systemLinearFootage}
            systemCount={systemCount}
            systemPreview={selectedSystemPreview}
            systemPreviewMessage={systemPreviewMessage}
            isPreviewPending={isPreviewPending}
            onSelectedCatalogItemIdChange={setSelectedCatalogItemId}
            onSelectedSystemIdChange={handleSelectedSystemIdChange}
            onSystemMeasurementChange={handleSystemMeasurementChange}
            onAddCatalogItem={handleAddCatalogItem}
            onQuickAddCatalogItem={handleQuickAddCatalogItem}
            onImportLineItemsFromEstimate={handleImportLineItemsFromEstimate}
            onImportReusableContentFromEstimate={handleImportReusableContentFromEstimate}
            onPreviewSystem={handlePreviewSystem}
            onExpandSystem={handleExpandSystem}
            onToggleMarkup={setShowMarkup}
            onToggleShowOnlyZeroItems={setShowOnlyZeroItems}
            onLineItemChange={handleLineItemChange}
            onAddGroup={handleAddGroup}
            onGroupLabelChange={handleGroupLabelChange}
            onDeleteGroup={handleDeleteGroup}
            onMoveLineItem={handleMoveLineItem}
            onRemoveLineItem={handleRemoveLineItem}
            onQuickCreateCatalogItem={handleQuickCreateCatalogItem}
            inventoryCreateError={inventoryCreateError}
          />
        </div>

        <div className={activeSection === "details" ? "block" : "hidden"}>
          {renderDetailsSection({
            currentStatus: status,
            title,
            customerName,
            projectName,
            opportunityTitle,
            projectServiceAddressLabel,
            estimateDate,
            expirationDate,
            projectType,
            sector,
            discountAmount,
            taxBehaviorLabel,
            taxRateLabel,
            customerTaxExempt,
            taxableSalesLabel: taxableSubtotalLabel,
            exemptSalesLabel: exemptSubtotalLabel,
            derivedTaxLabel: taxLabel,
            onExpirationDateChange: (value) => {
              setExpirationDate(value);
              markDirty();
            },
            onProjectTypeChange: (value) => {
              setProjectType(value);
              markDirty();
            },
            onSectorChange: (value) => {
              setSector(value);
              markDirty();
            },
            onDiscountAmountChange: (value) => {
              setDiscountAmount(value);
              markDirty();
            },
            onEstimateDateChange: (value) => {
              setEstimateDate(value);
              markDirty();
            },
            onTitleChange: (value) => {
              setTitle(value);
              markDirty();
            }
          })}
        </div>

        <div className={activeSection === "terms" ? "block" : "hidden"}>
          <ReusableContentInserter
            scopeBlocks={scopeBlocks}
            termsBlocks={termsBlocks}
            inclusionBlocks={inclusionBlocks}
            exclusionBlocks={exclusionBlocks}
            workspaceDefaultsApplied={estimate?.workspaceDefaultsApplied ?? false}
            defaultsSource={estimate?.estimateDefaultsSource ?? "organization"}
            onApplyScopeBlock={applyScopeBlock}
            onApplyTermsBlock={applyTermsBlock}
            onApplyInclusionBlock={applyInclusionBlock}
            onApplyExclusionBlock={applyExclusionBlock}
          />
          <TermsEditor
            termsHtml={termsHtml}
            inclusionsHtml={inclusionsHtml}
            exclusionsHtml={exclusionsHtml}
            onTermsChange={(value) => {
              setTermsHtml(value);
              markDirty();
            }}
            onInclusionsChange={(value) => {
              setInclusionsHtml(value);
              markDirty();
            }}
            onExclusionsChange={(value) => {
              setExclusionsHtml(value);
              markDirty();
            }}
          />
        </div>

        <div className={activeSection === "scope" ? "block" : "hidden"}>
          <ReusableContentInserter
            scopeBlocks={scopeBlocks}
            termsBlocks={termsBlocks}
            inclusionBlocks={inclusionBlocks}
            exclusionBlocks={exclusionBlocks}
            workspaceDefaultsApplied={estimate?.workspaceDefaultsApplied ?? false}
            defaultsSource={estimate?.estimateDefaultsSource ?? "organization"}
            onApplyScopeBlock={applyScopeBlock}
            onApplyTermsBlock={applyTermsBlock}
            onApplyInclusionBlock={applyInclusionBlock}
            onApplyExclusionBlock={applyExclusionBlock}
          />
          <ScopeOfWork
            summaryHtml={scopeSummaryHtml}
            items={scopeItems}
            onSummaryChange={(value) => {
              setScopeSummaryHtml(value);
              markDirty();
            }}
            onItemTextChange={handleScopeItemTextChange}
            onItemIncludeChange={handleScopeItemIncludeChange}
          />
        </div>

        <div className={activeSection === "bidding" ? "block" : "hidden"}>
          {renderBiddingStub()}
        </div>

        <div className={activeSection === "files" ? "block" : "hidden"}>
          <FilesSection
            existingAttachments={estimate?.attachments ?? []}
            retainedAttachmentIds={retainedAttachmentIds}
            pendingAttachments={pendingAttachments}
            onAddFiles={handleAddFiles}
            onRemoveExistingAttachment={(attachmentId) =>
              {
                markDirty();
                setRetainedAttachmentIds((currentIds) =>
                  currentIds.filter((id) => id !== attachmentId)
                );
              }
            }
            onRemovePendingAttachment={(attachmentId) =>
              {
                markDirty();
                setPendingAttachments((currentAttachments) =>
                  currentAttachments.filter((attachment) => attachment.id !== attachmentId)
                );
              }
            }
          />
        </div>

        <div className={activeSection === "cover-sheet" ? "block" : "hidden"}>
          <CoverSheet enabled={false} />
        </div>

        <div className={activeSection === "notes" ? "block" : "hidden"}>
          <NotesSection
            value={notesHtml}
            onChange={(value) => {
              setNotesHtml(value);
              markDirty();
            }}
          />
        </div>

        <div className={activeSection === "review-submit" ? "block" : "hidden"}>
          <div className="border-t border-[#e6e9ef] bg-white px-4 py-4">
            <div className="border border-[#d7dce4] bg-[#f7f8fa] px-4 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Review and Submit
                  </p>
                  <h2 className="mt-2 text-[20px] font-semibold text-slate-950">
                    Check the customer-facing estimate, then take the next workflow step.
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Use this checkpoint after editing items, scope, terms, files, and notes. The
                    review page shows the proposal output and the real send/contract handoff
                    actions already supported by FloorConnector.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("items")}
                    className="inline-flex h-10 items-center justify-center border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to edit
                  </button>
                  {estimate?.id ? (
                    <Link
                      href={`/estimates/${estimate.id}`}
                      className="inline-flex h-10 items-center justify-center border border-[#d8731f] bg-[#d8731f] px-4 text-sm font-semibold text-white transition hover:bg-[#bf6519]"
                    >
                      Open review page
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <div className="border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Save state
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {isPending || saveState === "saving" ? "Saving..." : saveMessage}
                  </p>
                </div>
                <div className="border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Current status
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {statusDisplayLabels[status]}
                  </p>
                </div>
                <div className="border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Next supported action
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {status === "approved"
                      ? "Generate contract or continue project readiness"
                      : status === "sent"
                        ? "Wait for portal approval or customer feedback"
                        : "Open review page and send when portal access is ready"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </EstimateWorkspaceShell>
      </form>
    </div>
  );
}
