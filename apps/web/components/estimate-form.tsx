"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Circle,
  FilePlus2,
  MoreVertical,
} from "lucide-react";
import { estimateStatusTransitions } from "@floorconnector/domain";
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
import {
  EstimateWorkspaceShell,
  type EstimateWorkspaceSectionId
} from "@/components/estimates/estimate-workspace-shell";
import { FilesSection } from "@/components/estimates/files-section";
import { ItemsSection, type EstimateItemsDraft } from "@/components/estimates/items-section";
import { NotesSection } from "@/components/estimates/notes-section";
import { ScopeOfWork } from "@/components/estimates/scope-of-work";
import { TermsEditor } from "@/components/estimates/terms-editor";
import { buildExpandedSystemPreview } from "@/lib/catalogs/system-expansion";
import {
  calculateDiscountedTaxableSales,
  calculateLineTotal,
  calculateSharedUnitPricing,
  formatMoneyValue
} from "@/lib/catalogs/pricing";
import type {
  EstimateAutosaveResult
} from "@/lib/estimates/actions";
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
};

type EstimateFormProps = {
  estimate?: EditableEstimate | null;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  catalogItems?: CatalogItem[];
  customerTaxExempt: boolean;
  organizationFinancialSettings: Pick<
    OrganizationFinancialSettings,
    "defaultTaxRate" | "defaultTaxBehavior"
  >;
  contentBlocks?: EstimateContentBlock[];
  autosaveAction: (formData: FormData) => Promise<EstimateAutosaveResult>;
  updateStatusAction: (formData: FormData) => Promise<
    | { ok: true; estimateId: string; updatedAt: string; referenceNumber: string; status: EstimateStatus }
    | { ok: false; type: "conflict" | "error"; message: string }
  >;
  quickCreateCatalogItemAction: (formData: FormData) => Promise<
    | { ok: true; item: CatalogItem }
    | { ok: false; message: string }
  >;
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

function applyDraftPricing(lineItem: EstimateItemsDraft): EstimateItemsDraft {
  const pricing = calculateSharedUnitPricing({
    baseUnitCost: lineItem.baseUnitCost,
    baseUnitPrice: lineItem.baseUnitPrice,
    markupPercent: lineItem.markupPercent,
    hiddenMarkupPercent: lineItem.hiddenMarkupPercent
  });
  const computedLineTotal = calculateLineTotal(lineItem.quantity, pricing.finalUnitPrice);

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
    unitPrice: formatMoney(pricing.finalUnitPrice),
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
        taxCode: lineItem.taxable ? "taxable" : "non-taxable",
        assignedTo: lineItem.assignedTo ?? legacyRow?.assignedTo ?? "",
        lineTotal: formatMoney(parseNumericInput(lineItem.lineTotal))
      });
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

function renderDetailsSection(input: {
  currentStatus: EstimateStatus;
  title: string;
  customerName?: string | null;
  projectName?: string | null;
  opportunityTitle?: string | null;
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
          <span>Details</span>
        </div>
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
  catalogItems = [],
  customerTaxExempt,
  organizationFinancialSettings,
  contentBlocks = [],
  autosaveAction,
  updateStatusAction,
  quickCreateCatalogItemAction
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
  const [systemSquareFootage, setSystemSquareFootage] = useState("0");
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
  const [isPending, startSaveTransition] = useTransition();

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
  const allowedTransitions = estimateStatusTransitions[status];
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
  const selectedSystemPreview = useMemo(() => {
    const systemCatalogItem = filteredCatalogItems.find((item) => item.id === selectedSystemId);
    const squareFootage = parseNumericInput(systemSquareFootage);

    if (!systemCatalogItem || squareFootage <= 0) {
      return null;
    }

    const preview = buildExpandedSystemPreview({
      systemCatalogItem,
      catalogItems: filteredCatalogItems,
      squareFootage
    });

    return preview.rows.length > 0 ? preview : null;
  }, [filteredCatalogItems, selectedSystemId, systemSquareFootage]);

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
      return;
    }

    setSaveState("saving");
    setSaveMessage("Saving...");
    const result = await autosaveAction(formData);

    if (!result.ok) {
      setSaveState(result.type === "conflict" ? "conflict" : "error");
      setSaveMessage(result.message);
      return;
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
  }

  function handleLineItemChange(
    rowKey: string,
    field: keyof EstimateItemsDraft,
    value: string
  ) {
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

        return applyDraftPricing(nextLineItem);
      })
    );
  }

  function insertCatalogItem(catalogItem: CatalogItem) {
    setLineItems((currentLineItems) => [
      ...currentLineItems,
      applyDraftPricing({
        rowKey: createRowKey("row", currentLineItems.length + 1),
        catalogItemId: catalogItem.id,
        sourceType: "catalog_item",
        sourceSystemId: null,
        sourceComponentId: null,
        itemType: catalogItem.itemType,
        groupId: null,
        name: catalogItem.name,
        description: catalogItem.description ?? "",
        quantity: "1.00",
        unit: catalogItem.unit,
        baseUnitCost: catalogItem.defaultUnitCost,
        baseUnitPrice: catalogItem.defaultUnitPrice ?? "",
        markupPercent: catalogItem.markupPercent,
        hiddenMarkupPercent: catalogItem.hiddenMarkupPercent,
        unitPriceBeforeHiddenMarkup: "0.00",
        visibleMarkupAmount: "0.00",
        hiddenMarkupAmount: "0.00",
        unitPrice: "$0.00",
        taxCode: catalogItem.taxable ? "taxable" : "non-taxable",
        assignedTo: "",
        lineTotal: "$0.00"
      })
    ]);
    markDirty();
  }

  function handleAddCatalogItem() {
    const catalogItem = filteredCatalogItems.find((item) => item.id === selectedCatalogItemId);

    if (!catalogItem) {
      return;
    }

    insertCatalogItem(catalogItem);
  }

  async function handleQuickCreateCatalogItem(input: {
    name: string;
    itemType: CatalogItem["itemType"];
    unit: string;
    defaultUnitCost: string;
    defaultUnitPrice: string | null;
    taxable: boolean;
  }) {
    const formData = new FormData();
    formData.set("name", input.name);
    formData.set("itemType", input.itemType);
    formData.set("unit", input.unit);
    formData.set("defaultUnitCost", input.defaultUnitCost);
    if (input.defaultUnitPrice) {
      formData.set("defaultUnitPrice", input.defaultUnitPrice);
    }
    if (input.taxable) {
      formData.set("taxable", "on");
    }

    const result = await quickCreateCatalogItemAction(formData);

    if (!result.ok) {
      setInventoryCreateError(result.message);
      return;
    }

    setInventoryCreateError(null);
    setCatalogInventoryItems((currentItems) => [result.item, ...currentItems]);
    setSelectedCatalogItemId(result.item.id);
    insertCatalogItem(result.item);
  }

  function handleExpandSystem() {
    const systemCatalogItem = filteredCatalogItems.find((item) => item.id === selectedSystemId);
    const squareFootage = parseNumericInput(systemSquareFootage);

    if (!systemCatalogItem || squareFootage <= 0) {
      return;
    }

    const expandedSystem = buildExpandedSystemPreview({
      systemCatalogItem,
      catalogItems: filteredCatalogItems,
      squareFootage
    });

    if (expandedSystem.rows.length === 0) {
      return;
    }

    markDirty();

    const nextGroupId = createRowKey("group", nextGroupIndex);
    const nextGroupLabel = `${systemCatalogItem.name} (${formatQuantity(squareFootage)} sqft)`;

    setItemGroups((currentGroups) => [
      ...currentGroups,
      {
        id: nextGroupId,
        label: nextGroupLabel,
        sortOrder: currentGroups.length
      }
    ]);
    setLineItems((currentLineItems) => {
      const generatedRows = expandedSystem.rows.map((component, index) => {
        return applyDraftPricing({
          rowKey: createRowKey("row", currentLineItems.length + index + 1),
          catalogItemId: component.catalogItemId,
          sourceType: "system_component" as const,
          sourceSystemId: systemCatalogItem.id,
          sourceComponentId: component.componentId,
          itemType: component.itemType,
          groupId: nextGroupId,
          name: component.name,
          description: component.description,
          quantity: component.quantity,
          unit: component.unit,
          baseUnitCost: component.baseUnitCost,
          baseUnitPrice: component.baseUnitPrice ?? "",
          markupPercent: component.markupPercent,
          hiddenMarkupPercent: component.hiddenMarkupPercent,
          unitPriceBeforeHiddenMarkup: component.unitPriceBeforeHiddenMarkup,
          visibleMarkupAmount: component.visibleMarkupAmount,
          hiddenMarkupAmount: component.hiddenMarkupAmount,
          unitPrice: formatMoney(parseNumericInput(component.unitPrice)),
          taxCode: component.taxable ? "taxable" : "non-taxable",
          assignedTo: "",
          lineTotal: formatMoney(parseNumericInput(component.linePrice))
        } satisfies EstimateItemsDraft);
      });

      return [...currentLineItems, ...generatedRows];
    });
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
        const canSelect =
          candidateStatus === status || allowedTransitions.includes(candidateStatus);
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
                  "flex h-[48px] w-[48px] items-center justify-center rounded-full border-[2px]",
                  isCurrent
                    ? "border-[#f4812a] bg-[#f4812a] text-white"
                    : canSelect
                      ? "border-[#d9dee8] bg-white text-[#f4812a]"
                      : "border-[#d9dee8] bg-white text-[#d9dee8]"
                ].join(" ")}
              >
                {isCurrent ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </div>
              <span className="max-w-[110px] truncate text-center text-[13px] text-[#71829c]">
                {label}
              </span>
            </button>
            {index < statuses.length - 1 ? (
              <div className="mt-[-18px] h-[2px] w-[42px] bg-[#d9dee8]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );

  const headerActions = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className="rounded-[6px] border border-[#e3e7ee] p-2.5 hover:bg-[#f7f8fb]"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-[52px] z-20 min-w-[220px] rounded-[10px] border border-[#e3e7ee] bg-white p-2 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.4)]">
          <Link
            href={`/estimates/${estimate?.id ?? ""}`}
            className="block rounded-[8px] px-3 py-2 text-[14px] text-[#334a70] hover:bg-[#f7f8fb]"
          >
            Open Review Page
          </Link>
          {status === "approved" ? (
            <Link
              href={`/contracts?estimateId=${estimate?.id ?? ""}`}
              className="block rounded-[8px] px-3 py-2 text-[14px] text-[#334a70] hover:bg-[#f7f8fb]"
            >
              Generate Contract
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="block w-full rounded-[8px] px-3 py-2 text-left text-[14px] text-[#a7b2c4]"
              title="Contract generation becomes real after estimate approval."
            >
              Generate Contract
            </button>
          )}
          <Link
            href={`/projects/${estimate?.projectId ?? ""}`}
            className="block rounded-[8px] px-3 py-2 text-[14px] text-[#334a70] hover:bg-[#f7f8fb]"
          >
            Open Project
          </Link>
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[14px] text-[#a7b2c4]"
            title="Copy/export actions still need backend continuity and remain out of scope for this run."
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Copy / Export</span>
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
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
            <input type="hidden" name="lineItemItemType" value={lineItem.itemType} />
            <input type="hidden" name="lineItemName" value={lineItem.name} />
            <input type="hidden" name="lineItemDescription" value={lineItem.description} />
            <input type="hidden" name="lineItemQuantity" value={lineItem.quantity} />
            <input type="hidden" name="lineItemUnit" value={lineItem.unit} />
            <input
              type="hidden"
              name="lineItemUnitPrice"
              value={parseNumericInput(lineItem.unitPrice).toFixed(2)}
            />
            <input
              type="hidden"
              name="lineItemBaseUnitCost"
              value={parseNumericInput(lineItem.baseUnitCost).toFixed(2)}
            />
            <input
              type="hidden"
              name="lineItemBaseUnitPrice"
              value={
                lineItem.baseUnitPrice.trim().length > 0
                  ? parseNumericInput(lineItem.baseUnitPrice).toFixed(2)
                  : ""
              }
            />
            <input
              type="hidden"
              name="lineItemMarkupPercent"
              value={parseNumericInput(lineItem.markupPercent).toFixed(2)}
            />
            <input
              type="hidden"
              name="lineItemHiddenMarkupPercent"
              value={parseNumericInput(lineItem.hiddenMarkupPercent).toFixed(2)}
            />
            <input
              type="hidden"
              name="lineItemUnitPriceBeforeHiddenMarkup"
              value={parseNumericInput(lineItem.unitPriceBeforeHiddenMarkup).toFixed(2)}
            />
            <input
              type="hidden"
              name="lineItemVisibleMarkupAmount"
              value={parseNumericInput(lineItem.visibleMarkupAmount).toFixed(2)}
            />
            <input
              type="hidden"
              name="lineItemHiddenMarkupAmount"
              value={parseNumericInput(lineItem.hiddenMarkupAmount).toFixed(2)}
            />
            <input type="hidden" name="lineItemTaxCode" value={lineItem.taxCode} />
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
          setActiveSection(section);
          if (saveState === "dirty") {
            startSaveTransition(() => {
              void persistEstimate("manual");
            });
          }
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
            selectedCatalogItemId={selectedCatalogItemId}
            selectedSystemId={selectedSystemId}
            systemSquareFootage={systemSquareFootage}
            systemPreview={selectedSystemPreview}
            onSelectedCatalogItemIdChange={setSelectedCatalogItemId}
            onSelectedSystemIdChange={setSelectedSystemId}
            onSystemSquareFootageChange={setSystemSquareFootage}
            onAddCatalogItem={handleAddCatalogItem}
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
          {(termsBlocks.length > 0 || inclusionBlocks.length > 0 || exclusionBlocks.length > 0) ? (
            <div className="border-t border-[#e6e9ef] bg-[#fbfcfe] px-5 py-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                    Reusable Terms
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {termsBlocks.map((block) => (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => applyTermsBlock(block.contentHtml)}
                        className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-[13px] font-medium text-[#28456f]"
                      >
                        {block.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                    Reusable Inclusions
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {inclusionBlocks.map((block) => (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => applyInclusionBlock(block.contentHtml)}
                        className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-[13px] font-medium text-[#28456f]"
                      >
                        {block.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                    Reusable Exclusions
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exclusionBlocks.map((block) => (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => applyExclusionBlock(block.contentHtml)}
                        className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-[13px] font-medium text-[#28456f]"
                      >
                        {block.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
          {scopeBlocks.length > 0 ? (
            <div className="border-t border-[#e6e9ef] bg-[#fbfcfe] px-5 py-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                Reusable Scope Blocks
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {scopeBlocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => applyScopeBlock(block.contentHtml)}
                    className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-[13px] font-medium text-[#28456f]"
                  >
                    {block.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
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
      </EstimateWorkspaceShell>
    </form>
  );
}
