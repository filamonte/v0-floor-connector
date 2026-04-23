"use client";

import { useState } from "react";
import {
  Wallet,
  ClipboardList,
  User,
  Wrench,
  FileText,
  Calendar,
  UserCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  MoreVertical,
  XCircle
} from "lucide-react";

type LineItemDraft = {
  key: string;
  type: string;
  name: string;
  costCode: string;
  quantity: string;
  unitCost: string;
  unit: string;
  markup: string;
  total: string;
  tax: boolean;
  assignedTo: string;
};

type ItemGroup = {
  id: string;
  name: string;
  items: LineItemDraft[];
  collapsed: boolean;
};

type ItemsSectionProps = {
  groups?: ItemGroup[];
  onAddItem?: (groupId: string) => void;
  onAddGroup?: () => void;
  totalWithTax?: number;
};

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function FinancialSummaryBar({ totalWithTax = 0 }: { totalWithTax: number }) {
  const categories = [
    { icon: ClipboardList, label: "Totals", color: "bg-gray-100 text-gray-600" },
    { icon: User, label: "Labor", color: "bg-blue-50 text-blue-600" },
    { icon: Wrench, label: "Materials", color: "bg-amber-50 text-amber-600" },
    { icon: FileText, label: "Subcontractor", color: "bg-green-50 text-green-600" },
    { icon: Calendar, label: "Equipment", color: "bg-purple-50 text-purple-600" },
    { icon: UserCircle, label: "Other", color: "bg-gray-100 text-gray-500" }
  ];

  return (
    <div className="h-14 bg-white border border-[#e5e7eb] rounded-lg px-4 flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#fff4e8] flex items-center justify-center">
          <Wallet className="w-4 h-4 text-[#ef7d32]" />
        </div>
        <span className="text-[14px] font-semibold text-gray-900">
          Financial Summary
        </span>
      </div>

      <div className="flex items-center gap-2">
        {categories.map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </div>
        ))}
      </div>

      <div className="text-[16px] font-bold text-gray-900">
        Total w/Tax: {formatMoney(totalWithTax)}
      </div>
    </div>
  );
}

function ControlsRow({
  showMarkup,
  onToggleMarkup,
  showZeroItems,
  onToggleZeroItems,
  onAddItem
}: {
  showMarkup: boolean;
  onToggleMarkup: () => void;
  showZeroItems: boolean;
  onToggleZeroItems: () => void;
  onAddItem: () => void;
}) {
  return (
    <div className="h-11 flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMarkup}
          className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium border rounded-md transition ${
            showMarkup
              ? "border-[#ef7d32] text-[#ef7d32] bg-[#fff4e8]"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Eye className="w-4 h-4" />
          Show Markup
        </button>
        <button
          type="button"
          onClick={onToggleMarkup}
          className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium border rounded-md transition ${
            !showMarkup
              ? "border-gray-400 text-gray-700 bg-gray-100"
              : "border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          <EyeOff className="w-4 h-4" />
          Hide Markup
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <span>Show Only $0 Items:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => onToggleZeroItems()}
              className={`px-3 py-1 text-[12px] font-medium transition ${
                showZeroItems
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onToggleZeroItems()}
              className={`px-3 py-1 text-[12px] font-medium transition ${
                !showZeroItems
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              No
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-[#ef7d32] hover:bg-[#d95c1f] text-white text-[13px] font-semibold rounded-md transition"
        >
          Add Item to Estimate
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ItemGroupHeader({
  name,
  total,
  collapsed,
  onToggle,
  onAddItem
}: {
  name: string;
  total: number;
  collapsed: boolean;
  onToggle: () => void;
  onAddItem: () => void;
}) {
  return (
    <div className="h-11 bg-[#f9fafb] border border-[#e5e7eb] rounded-t-md px-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
        <button
          type="button"
          onClick={onToggle}
          className="p-0.5 hover:bg-gray-200 rounded transition"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        <span className="text-[14px] font-semibold text-gray-900">{name}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[14px] font-semibold text-gray-900">
          {formatMoney(total)}
        </span>
        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-1 px-2 py-1 text-[12px] font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          <Plus className="w-3 h-3" />
          Items
        </button>
        <button
          type="button"
          className="p-1 hover:bg-gray-200 rounded transition"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

function ItemsTable({ items }: { items: LineItemDraft[] }) {
  if (items.length === 0) {
    return (
      <div className="border border-t-0 border-[#e5e7eb] rounded-b-md">
        {/* Table Header */}
        <div className="h-8 bg-[#f3f4f6] border-b border-[#e5e7eb] flex items-center text-[11px] font-semibold uppercase tracking-wide text-gray-600">
          <div className="w-6" />
          <div className="w-6" />
          <div className="w-8 text-center">Type</div>
          <div className="flex-1 px-2">Item Name</div>
          <div className="w-[100px] px-2">Cost Code</div>
          <div className="w-[60px] px-2 text-right">QTY</div>
          <div className="w-[80px] px-2 text-right">Unit Cost</div>
          <div className="w-[60px] px-2 text-center">Unit</div>
          <div className="w-[60px] px-2 text-right">MU%</div>
          <div className="w-[90px] px-2 text-right">Total</div>
          <div className="w-[50px] px-2 text-center">Tax</div>
          <div className="w-[48px] px-2 text-center">Assigned</div>
          <div className="w-10" />
        </div>

        {/* Empty State */}
        <div className="py-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <XCircle className="w-6 h-6 text-gray-400" />
          </div>
          <span className="text-[14px] text-gray-500">No Records Available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-t-0 border-[#e5e7eb] rounded-b-md overflow-hidden">
      {/* Table Header */}
      <div className="h-8 bg-[#f3f4f6] border-b border-[#e5e7eb] flex items-center text-[11px] font-semibold uppercase tracking-wide text-gray-600">
        <div className="w-6" />
        <div className="w-6" />
        <div className="w-8 text-center">Type</div>
        <div className="flex-1 px-2">Item Name</div>
        <div className="w-[100px] px-2">Cost Code</div>
        <div className="w-[60px] px-2 text-right">QTY</div>
        <div className="w-[80px] px-2 text-right">Unit Cost</div>
        <div className="w-[60px] px-2 text-center">Unit</div>
        <div className="w-[60px] px-2 text-right">MU%</div>
        <div className="w-[90px] px-2 text-right">Total</div>
        <div className="w-[50px] px-2 text-center">Tax</div>
        <div className="w-[48px] px-2 text-center">Assigned</div>
        <div className="w-10" />
      </div>

      {/* Table Rows */}
      {items.map((item, index) => (
        <div
          key={item.key}
          className={`h-9 flex items-center text-[13px] border-b border-[#f0f0f0] ${
            index % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
          }`}
        >
          <div className="w-6 flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-gray-300 cursor-grab" />
          </div>
          <div className="w-6 flex items-center justify-center">
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
          <div className="w-8 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
              <Wrench className="w-3 h-3 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 px-2 truncate text-gray-900">{item.name}</div>
          <div className="w-[100px] px-2 text-gray-600">{item.costCode}</div>
          <div className="w-[60px] px-2 text-right text-gray-900">{item.quantity}</div>
          <div className="w-[80px] px-2 text-right text-gray-900">{formatMoney(Number(item.unitCost))}</div>
          <div className="w-[60px] px-2 text-center text-gray-600">{item.unit}</div>
          <div className="w-[60px] px-2 text-right text-gray-600">{item.markup}%</div>
          <div className="w-[90px] px-2 text-right font-medium text-gray-900">{item.total}</div>
          <div className="w-[50px] px-2 text-center">
            <input
              type="checkbox"
              checked={item.tax}
              readOnly
              className="w-4 h-4 rounded border-gray-300"
            />
          </div>
          <div className="w-[48px] px-2 flex items-center justify-center">
            {item.assignedTo ? (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
                {item.assignedTo.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100" />
            )}
          </div>
          <div className="w-10 flex items-center justify-center">
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ItemsSection({
  groups = [{ id: "default", name: "Item", items: [], collapsed: false }],
  onAddItem,
  onAddGroup,
  totalWithTax = 0
}: ItemsSectionProps) {
  const [showMarkup, setShowMarkup] = useState(true);
  const [showZeroItems, setShowZeroItems] = useState(false);
  const [localGroups, setLocalGroups] = useState(groups);

  const toggleGroupCollapse = (groupId: string) => {
    setLocalGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
      )
    );
  };

  return (
    <section id="items" className="space-y-0">
      <FinancialSummaryBar totalWithTax={totalWithTax} />

      <ControlsRow
        showMarkup={showMarkup}
        onToggleMarkup={() => setShowMarkup(!showMarkup)}
        showZeroItems={showZeroItems}
        onToggleZeroItems={() => setShowZeroItems(!showZeroItems)}
        onAddItem={() => onAddItem?.(localGroups[0]?.id ?? "default")}
      />

      <div className="space-y-4">
        {localGroups.map((group) => {
          const groupTotal = group.items.reduce(
            (sum, item) => sum + Number(item.total.replace(/[^0-9.-]/g, "")),
            0
          );

          return (
            <div key={group.id}>
              <ItemGroupHeader
                name={group.name}
                total={groupTotal}
                collapsed={group.collapsed}
                onToggle={() => toggleGroupCollapse(group.id)}
                onAddItem={() => onAddItem?.(group.id)}
              />
              {!group.collapsed && <ItemsTable items={group.items} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
