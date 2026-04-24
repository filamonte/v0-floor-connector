"use client";

import { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Eye,
  EyeOff,
  FileSpreadsheet,
  GripVertical,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Settings2,
  Trash2,
  Users,
  Wrench
} from "lucide-react";
import type { CatalogItem, CatalogItemType, EstimateItemGroup } from "@floorconnector/types";

type EstimateLineItem = {
  rowKey: string;
  catalogItemId: string | null;
  sourceType: "catalog_item" | "system_component" | "manual";
  itemType: CatalogItemType;
  groupId: string | null;
  name: string;
  costCode: string;
  quantity: string;
  unitCost: string;
  unit: string;
  markupPercent: string;
  total: string;
  taxable: boolean;
  assignedTo: string;
};

type CFEstimateItemsWorkspaceProps = {
  estimateTitle: string;
  estimateNumber: string;
  projectLabel: string;
  status: "draft" | "estimating" | "pending_approval" | "approved" | "completed";
  lineItems: EstimateLineItem[];
  itemGroups: EstimateItemGroup[];
  catalogItems: CatalogItem[];
  showMarkup: boolean;
  showOnlyZeroItems: boolean;
  estimatedCost: string;
  markupAmount: string;
  markupPercent: string;
  subtotal: string;
  taxAmount: string;
  grandTotal: string;
  hours: string;
  profitMargin: string;
  profitMarginPercent: string;
  onToggleMarkup: (value: boolean) => void;
  onToggleShowOnlyZeroItems: (value: boolean) => void;
  onLineItemChange: (rowKey: string, field: keyof EstimateLineItem, value: string) => void;
  onMoveLineItem: (rowKey: string, direction: -1 | 1) => void;
  onRemoveLineItem: (rowKey: string) => void;
  onAddItem: () => void;
  onAddSystem: () => void;
};

const ITEM_TYPE_ICONS: Record<CatalogItemType, typeof Package> = {
  material: Package,
  labor: Users,
  service: Settings2,
  equipment: Wrench,
  subcontractor: Users,
  other: FileSpreadsheet,
  system: FileSpreadsheet
};

const STATUS_STEPS = [
  { id: "estimating", label: "Estimating", icon: FileSpreadsheet },
  { id: "pending_approval", label: "Pending Ap...", icon: Clock },
  { id: "approved", label: "Approved - ...", icon: CheckCircle2 },
  { id: "completed", label: "Approved", icon: Check },
  { id: "done", label: "Completed", icon: CheckCircle2 }
];

function getStatusIndex(status: string) {
  switch (status) {
    case "draft":
    case "estimating":
      return 0;
    case "pending_approval":
      return 1;
    case "approved":
      return 3;
    case "completed":
      return 4;
    default:
      return 0;
  }
}

export function CFEstimateItemsWorkspace({
  estimateTitle,
  estimateNumber,
  projectLabel,
  status,
  lineItems,
  itemGroups,
  catalogItems,
  showMarkup,
  showOnlyZeroItems,
  estimatedCost,
  markupAmount,
  markupPercent,
  subtotal,
  taxAmount,
  grandTotal,
  hours,
  profitMargin,
  profitMarginPercent,
  onToggleMarkup,
  onToggleShowOnlyZeroItems,
  onLineItemChange,
  onMoveLineItem,
  onRemoveLineItem,
  onAddItem,
  onAddSystem
}: CFEstimateItemsWorkspaceProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const statusIndex = getStatusIndex(status);

  const visibleItems = useMemo(() => {
    if (showOnlyZeroItems) {
      return lineItems.filter((item) => parseFloat(item.total) === 0);
    }
    return lineItems;
  }, [lineItems, showOnlyZeroItems]);

  const totalWithTax = useMemo(() => {
    const sub = parseFloat(subtotal.replace(/[$,]/g, "")) || 0;
    const tax = parseFloat(taxAmount.replace(/[$,]/g, "")) || 0;
    return (sub + tax).toFixed(2);
  }, [subtotal, taxAmount]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Header section */}
      <div className="border-b border-[#e2e7ef] bg-white px-6 py-4">
        <div className="flex items-start justify-between">
          {/* Left - Project info */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#f97316] bg-white">
              <FileSpreadsheet className="h-7 w-7 text-[#f97316]" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-[#28456f]">{estimateTitle}</h1>
              <div className="mt-1 flex items-center gap-3 text-[13px] text-[#607492]">
                <span>{projectLabel}</span>
                <span className="rounded bg-[#fff1e4] px-2 py-0.5 text-[12px] font-medium text-[#f97316]">
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </span>
                <span>EST. #{estimateNumber}</span>
              </div>
            </div>
          </div>

          {/* Right - Status progress */}
          <div className="flex items-center gap-2">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < statusIndex;
              const isCurrent = index === statusIndex;
              const isActive = isCompleted || isCurrent;

              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-[#22c55e] text-white"
                          : isCurrent
                          ? "bg-[#f97316] text-white"
                          : "bg-[#e2e7ef] text-[#8594a8]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`mt-1 text-[10px] ${isActive ? "text-[#28456f]" : "text-[#8594a8]"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-[2px] w-8 ${
                        index < statusIndex ? "bg-[#22c55e]" : "bg-[#e2e7ef]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#28456f]">
              Total w/Tax: ${totalWithTax}
            </span>
            <button className="p-2 text-[#8594a8] hover:text-[#28456f]">
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button className="p-2 text-[#8594a8] hover:text-[#28456f]">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Bar */}
      <div className="border-b border-[#e2e7ef] bg-[#f8f9fb] px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#22c55e]" />
            <span className="text-[14px] font-medium text-[#28456f]">Financial Summary</span>
          </div>

          {/* Progress bars representing item types */}
          <div className="flex flex-1 items-center gap-1">
            <div className="h-2 flex-1 rounded-full bg-[#22c55e]" />
            <div className="h-2 w-6 rounded-full bg-[#f97316]" />
            <div className="h-2 w-4 rounded-full bg-[#8b5cf6]" />
          </div>

          <span className="text-[14px] font-semibold text-[#28456f]">
            Total w/Tax: ${totalWithTax}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#e2e7ef] bg-white px-6 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleMarkup(!showMarkup)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] ${
              showMarkup
                ? "bg-[#28456f] text-white"
                : "border border-[#d0d7e2] bg-white text-[#607492]"
            }`}
          >
            {showMarkup ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {showMarkup ? "Show Markup" : "Hide Markup"}
          </button>
          <button
            onClick={() => onToggleMarkup(!showMarkup)}
            className="flex items-center gap-1.5 rounded border border-[#d0d7e2] bg-white px-3 py-1.5 text-[12px] text-[#607492]"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Hide Markup
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#607492]">Show Only $0 Items:</span>
          <button
            onClick={() => onToggleShowOnlyZeroItems(true)}
            className={`rounded px-3 py-1 text-[12px] ${
              showOnlyZeroItems
                ? "bg-[#28456f] text-white"
                : "border border-[#d0d7e2] text-[#607492]"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onToggleShowOnlyZeroItems(false)}
            className={`rounded px-3 py-1 text-[12px] ${
              !showOnlyZeroItems
                ? "bg-[#28456f] text-white"
                : "border border-[#d0d7e2] text-[#607492]"
            }`}
          >
            No
          </button>

          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 rounded bg-[#28456f] px-3 py-1.5 text-[12px] font-medium text-white"
          >
            Add Item to Estimate
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main content - Items table and summary */}
      <div className="flex flex-1 gap-4 p-4">
        {/* Items Table */}
        <div className="flex-1 rounded border border-[#e2e7ef] bg-white">
          {/* Table header */}
          <div className="flex items-center justify-between border-b border-[#e2e7ef] bg-[#f6f8fb] px-3 py-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-[#8594a8]" />
              <Circle className="h-4 w-4 text-[#8594a8]" />
              <span className="text-[13px] font-medium text-[#28456f]">Item</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#28456f]">
                ${subtotal}
              </span>
              <button className="flex items-center gap-1 rounded bg-[#28456f] px-2 py-1 text-[11px] font-medium text-white">
                <Plus className="h-3 w-3" />
                Items
              </button>
              <button className="p-1 text-[#8594a8]">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f6f8fb]">
                <tr className="border-b border-[#e2e7ef]">
                  <th className="w-8 px-2 py-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#c5cdd8]" />
                  </th>
                  <th className="w-12 px-2 py-2 text-left font-medium text-[#607492]">Type</th>
                  <th className="min-w-[180px] px-2 py-2 text-left font-medium text-[#607492]">Item Name</th>
                  <th className="w-[120px] px-2 py-2 text-left font-medium text-[#607492]">Cost Code</th>
                  <th className="w-[70px] px-2 py-2 text-right font-medium text-[#607492]">QTY</th>
                  <th className="w-[80px] px-2 py-2 text-right font-medium text-[#607492]">Unit Cost</th>
                  <th className="w-[60px] px-2 py-2 text-left font-medium text-[#607492]">Unit</th>
                  {showMarkup && (
                    <th className="w-[60px] px-2 py-2 text-right font-medium text-[#607492]">MU%</th>
                  )}
                  <th className="w-[90px] px-2 py-2 text-right font-medium text-[#607492]">Total</th>
                  <th className="w-[50px] px-2 py-2 text-center font-medium text-[#607492]">Tax</th>
                  <th className="w-[100px] px-2 py-2 text-left font-medium text-[#607492]">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item, index) => {
                  const Icon = ITEM_TYPE_ICONS[item.itemType] ?? Package;
                  const isSelected = selectedRows.has(item.rowKey);

                  return (
                    <tr
                      key={item.rowKey}
                      className={`border-b border-[#e2e7ef] hover:bg-[#f6f8fb] ${
                        isSelected ? "bg-[#e8f4ff]" : index % 2 === 1 ? "bg-[#fafbfc]" : ""
                      }`}
                    >
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-3 w-3 cursor-move text-[#c5cdd8]" />
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedRows);
                              if (e.target.checked) {
                                newSelected.add(item.rowKey);
                              } else {
                                newSelected.delete(item.rowKey);
                              }
                              setSelectedRows(newSelected);
                            }}
                            className="h-4 w-4 rounded border-[#c5cdd8]"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center justify-center text-[#607492]">
                          <Icon className="h-4 w-4" />
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-[#334a70]">{item.name}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-[#8594a8]">{item.costCode || "-"}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => onLineItemChange(item.rowKey, "quantity", e.target.value)}
                          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-right text-[#334a70] outline-none hover:border-[#d0d7e2] focus:border-[#28456f]"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <span className="text-[#334a70]">${item.unitCost}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-[#607492]">{item.unit}</span>
                      </td>
                      {showMarkup && (
                        <td className="px-2 py-1.5 text-right">
                          <span className="text-[#334a70]">{item.markupPercent}</span>
                        </td>
                      )}
                      <td className="px-2 py-1.5 text-right">
                        <span className="font-medium text-[#334a70]">${item.total}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.taxable}
                          onChange={(e) =>
                            onLineItemChange(item.rowKey, "taxable" as keyof EstimateLineItem, e.target.checked ? "true" : "false")
                          }
                          className="h-4 w-4 rounded border-[#c5cdd8]"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-[#8594a8]">{item.assignedTo || "-"}</span>
                      </td>
                    </tr>
                  );
                })}
                {visibleItems.length === 0 && (
                  <tr>
                    <td colSpan={showMarkup ? 11 : 10} className="px-4 py-8 text-center text-[#8594a8]">
                      No items in this estimate. Click &quot;Add Item to Estimate&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side - Summary panels */}
        <div className="w-[320px] shrink-0 space-y-4">
          {/* Cost Summary */}
          <div className="rounded border border-[#e2e7ef] bg-white">
            <div className="border-b border-[#e2e7ef] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#607492]">Estimated Cost</span>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[#22c55e]">${estimatedCost}</span>
                  <button className="p-1 text-[#8594a8]"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[13px] text-[#607492]">Markup</span>
                <span className="text-[15px] font-semibold text-[#22c55e]">
                  ${markupAmount} ({markupPercent}%)
                </span>
              </div>
            </div>

            <div className="border-b border-[#e2e7ef] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#607492]">Sub Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[#22c55e]">${subtotal}</span>
                  <button className="p-1 text-[#8594a8]"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[13px] text-[#607492]">Tax</span>
                <span className="text-[15px] font-semibold text-[#22c55e]">${taxAmount}</span>
              </div>
            </div>

            <div className="bg-[#f6f8fb] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#28456f]">Grand Total</span>
                <span className="text-[16px] font-bold text-[#28456f]">${grandTotal}</span>
              </div>
            </div>

            <div className="border-t border-[#e2e7ef] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#607492]">Hours</span>
                <span className="text-[15px] font-semibold text-[#22c55e]">{hours}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[13px] text-[#607492]">Profit Margin</span>
                <span className="text-[15px] font-semibold text-[#22c55e]">
                  ${profitMargin} ({profitMarginPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Tax/Amount panel */}
          <div className="rounded border border-[#e2e7ef] bg-white">
            <div className="border-b border-[#e2e7ef] px-4 py-3">
              <span className="text-[13px] font-medium text-[#28456f]">Tax/Amount</span>
            </div>
            <div className="px-4 py-3">
              <select className="h-9 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#607492] outline-none">
                <option>Select Tax</option>
              </select>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#607492]">Sub Total</span>
                  <span className="text-[14px] font-semibold text-[#22c55e]">${subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#607492]">Tax: (0%)</span>
                    <button className="p-0.5 text-[#8594a8]"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="text-[14px] font-semibold text-[#22c55e]">${taxAmount}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-[#e2e7ef] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#28456f]">Total</span>
                  <span className="text-[16px] font-bold text-[#28456f]">${grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e2e7ef] bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[12px] text-[#607492]">
            <span>Created: {new Date().toLocaleDateString()}</span>
            <span>{new Date().toLocaleTimeString()}</span>
            <span>By: User</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] text-[#607492]">
              <input type="checkbox" className="h-4 w-4 rounded border-[#c5cdd8]" />
              Save Estimate as Template
            </label>
            <button className="flex items-center gap-1.5 rounded border border-[#d0d7e2] px-3 py-1.5 text-[12px] font-medium text-[#607492]">
              <Clock className="h-3.5 w-3.5" />
              Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
