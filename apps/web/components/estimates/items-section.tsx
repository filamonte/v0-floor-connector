"use client";

import { useState } from "react";
import type { EstimateLineItem } from "@floorconnector/types";
import {
  Eye,
  EyeOff,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  DollarSign,
  User,
  Wrench,
  Package,
  Briefcase,
  Users,
  Calculator,
  FileText
} from "lucide-react";

type ItemsSectionProps = {
  lineItems?: EstimateLineItem[];
  totalWithTax?: number;
};

export function ItemsSection({
  lineItems = [],
  totalWithTax = 0
}: ItemsSectionProps) {
  const [showMarkup, setShowMarkup] = useState(true);
  const [showOnlyZero, setShowOnlyZero] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [groupCollapsed, setGroupCollapsed] = useState(false);

  const totalCost = lineItems.reduce(
    (sum, item) => sum + (item.unitCost ?? 0) * (item.quantity ?? 0),
    0
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Financial Summary Bar */}
      <div className="h-11 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#172b4d]">
          <DollarSign className="w-4 h-4 text-[#36b37e]" />
          Financial Summary
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#deebff] flex items-center justify-center" title="Materials">
            <Package className="w-3.5 h-3.5 text-[#0052cc]" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#e3fcef] flex items-center justify-center" title="Labor">
            <User className="w-3.5 h-3.5 text-[#00875a]" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#fff0b3] flex items-center justify-center" title="Equipment">
            <Wrench className="w-3.5 h-3.5 text-[#ff8b00]" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#eae6ff] flex items-center justify-center" title="Subcontractor">
            <Briefcase className="w-3.5 h-3.5 text-[#5243aa]" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#ffebe6] flex items-center justify-center" title="Other">
            <Calculator className="w-3.5 h-3.5 text-[#bf2600]" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#f4f5f7] flex items-center justify-center" title="Customer">
            <Users className="w-3.5 h-3.5 text-[#5e6c84]" />
          </div>
        </div>
        <div className="ml-auto text-[12px] font-semibold text-[#172b4d]">
          Total w/Tax: ${totalWithTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-9 bg-white border-b border-[#dfe1e6] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMarkup(true)}
            className={`flex items-center gap-1 text-[11px] font-medium ${showMarkup ? "text-[#0052cc]" : "text-[#5e6c84]"}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Show Markup
          </button>
          <button
            type="button"
            onClick={() => setShowMarkup(false)}
            className={`flex items-center gap-1 text-[11px] font-medium ${!showMarkup ? "text-[#0052cc]" : "text-[#5e6c84]"}`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Hide Markup
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5e6c84]">Show Only $0 Items:</span>
          <button
            type="button"
            onClick={() => setShowOnlyZero(true)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${showOnlyZero ? "bg-[#0052cc] text-white" : "bg-[#f4f5f7] text-[#5e6c84]"}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setShowOnlyZero(false)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${!showOnlyZero ? "bg-[#0052cc] text-white" : "bg-[#f4f5f7] text-[#5e6c84]"}`}
          >
            No
          </button>
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="flex items-center gap-1 h-6 px-2 bg-[#0052cc] text-white text-[11px] font-medium rounded hover:bg-[#0747a6]"
            >
              Add Item to Estimate
              <ChevronDown className="w-3 h-3" />
            </button>
            {addMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAddMenuOpen(false)} />
                <div className="absolute right-0 top-7 w-40 bg-white border border-[#dfe1e6] rounded shadow-lg z-50 py-1">
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#172b4d] hover:bg-[#f4f5f7]">
                    <Package className="w-3.5 h-3.5" /> Material
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#172b4d] hover:bg-[#f4f5f7]">
                    <User className="w-3.5 h-3.5" /> Labor
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#172b4d] hover:bg-[#f4f5f7]">
                    <Wrench className="w-3.5 h-3.5" /> Equipment
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#172b4d] hover:bg-[#f4f5f7]">
                    <Briefcase className="w-3.5 h-3.5" /> Subcontractor
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#172b4d] hover:bg-[#f4f5f7]">
                    <Calculator className="w-3.5 h-3.5" /> Other
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Group Header */}
      <div className="h-9 bg-[#f4f5f7] border-b border-[#dfe1e6] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-[#5e6c84] cursor-grab" />
          <button type="button" onClick={() => setGroupCollapsed(!groupCollapsed)} className="p-0.5">
            {groupCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-[#5e6c84]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#5e6c84]" />
            )}
          </button>
          <span className="text-[12px] font-semibold text-[#172b4d]">Item</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#5e6c84]">
            ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <button className="flex items-center gap-1 h-5 px-1.5 bg-[#0052cc] text-white text-[10px] font-medium rounded">
            <Plus className="w-2.5 h-2.5" /> Items
          </button>
          <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6] text-[#5e6c84]">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!groupCollapsed && (
        <>
          {/* Table Header - Dense */}
          <div className="h-7 bg-[#f8f9fa] border-b border-[#dfe1e6] flex items-center text-[10px] font-semibold text-[#5e6c84] uppercase tracking-wide shrink-0">
            <div className="w-[50px] px-2 border-r border-[#dfe1e6]">Type</div>
            <div className="flex-1 min-w-[150px] px-2 border-r border-[#dfe1e6]">Item Name</div>
            <div className="w-[100px] px-2 border-r border-[#dfe1e6]">Cost Code</div>
            <div className="w-[60px] px-2 text-right border-r border-[#dfe1e6]">QTY</div>
            <div className="w-[80px] px-2 text-right border-r border-[#dfe1e6]">Unit Cost</div>
            <div className="w-[50px] px-2 border-r border-[#dfe1e6]">Unit</div>
            <div className="w-[50px] px-2 text-right border-r border-[#dfe1e6]">MU%</div>
            <div className="w-[80px] px-2 text-right border-r border-[#dfe1e6]">Total</div>
            <div className="w-[40px] px-2 text-center border-r border-[#dfe1e6]">Tax</div>
            <div className="w-[80px] px-2 border-r border-[#dfe1e6]">Assigned To</div>
            <div className="w-[30px]"></div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-auto">
            {lineItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#5e6c84]">
                <div className="w-14 h-14 bg-[#f4f5f7] rounded flex items-center justify-center mb-2">
                  <FileText className="w-7 h-7 text-[#b3bac5]" />
                </div>
                <p className="text-[12px] font-medium text-[#172b4d]">No Records Available</p>
              </div>
            ) : (
              lineItems.map((item, idx) => {
                const lineTotal = (item.unitCost ?? 0) * (item.quantity ?? 0);
                return (
                  <div
                    key={item.id}
                    className={`h-8 flex items-center text-[11px] text-[#172b4d] border-b border-[#f0f0f0] ${idx % 2 === 1 ? "bg-[#fafbfc]" : "bg-white"}`}
                  >
                    <div className="w-[50px] px-2 border-r border-[#f0f0f0] flex items-center">
                      <span className="w-5 h-5 rounded bg-[#deebff] flex items-center justify-center">
                        <Package className="w-3 h-3 text-[#0052cc]" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-[150px] px-2 border-r border-[#f0f0f0] truncate font-medium">
                      {item.description || "Untitled"}
                    </div>
                    <div className="w-[100px] px-2 border-r border-[#f0f0f0] text-[#5e6c84] truncate">
                      {item.costCodeId || "-"}
                    </div>
                    <div className="w-[60px] px-2 text-right border-r border-[#f0f0f0]">
                      {item.quantity ?? 0}
                    </div>
                    <div className="w-[80px] px-2 text-right border-r border-[#f0f0f0]">
                      ${(item.unitCost ?? 0).toFixed(2)}
                    </div>
                    <div className="w-[50px] px-2 border-r border-[#f0f0f0] text-[#5e6c84]">
                      {item.unit || "EA"}
                    </div>
                    <div className="w-[50px] px-2 text-right border-r border-[#f0f0f0]">
                      {item.markupPercent ?? 0}%
                    </div>
                    <div className="w-[80px] px-2 text-right border-r border-[#f0f0f0] font-medium">
                      ${lineTotal.toFixed(2)}
                    </div>
                    <div className="w-[40px] px-2 text-center border-r border-[#f0f0f0]">
                      <input type="checkbox" className="w-3 h-3 rounded border-[#dfe1e6]" />
                    </div>
                    <div className="w-[80px] px-2 border-r border-[#f0f0f0] text-[#5e6c84] truncate">-</div>
                    <div className="w-[30px] flex items-center justify-center">
                      <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#5e6c84]">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
