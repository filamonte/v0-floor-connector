"use client";

import { useState, useMemo } from "react";
import {
  Briefcase,
  Building2,
  FileSpreadsheet,
  Folder,
  HardHat,
  Home,
  Info,
  Layers,
  Package,
  Search,
  Settings,
  Users,
  Wrench,
  X
} from "lucide-react";
import type { CatalogItem, CatalogItemType } from "@floorconnector/types";

import { calculateSharedUnitPricing, formatMoneyValue } from "@/lib/catalogs/pricing";

type CFAddItemPickerProps = {
  open: boolean;
  onClose: () => void;
  catalogItems: CatalogItem[];
  selectedItems: string[];
  onAddItem: (item: CatalogItem) => void;
  onCreateManualItem: (item: {
    name: string;
    itemType: CatalogItemType;
    costCode: string;
    unitCost: string;
    unit: string;
    quantity: string;
    markupPercent: string;
    taxable: boolean;
    description: string;
  }) => void;
};

type SourceCategory =
  | "manual"
  | "home-depot"
  | "1build"
  | "material"
  | "labor"
  | "equipment"
  | "subcontractor"
  | "other"
  | "group";

const SOURCE_CATEGORIES: Array<{
  id: SourceCategory;
  label: string;
  icon: typeof Package;
  disabled?: boolean;
  disabledText?: string;
}> = [
  { id: "manual", label: "Add Manual Item", icon: Briefcase },
  { id: "home-depot", label: "Home Depot", icon: Home, disabled: true, disabledText: "This feature is coming soon." },
  { id: "1build", label: "1Build.com Database", icon: Building2 },
  { id: "material", label: "Material", icon: Package },
  { id: "labor", label: "Labor", icon: HardHat },
  { id: "equipment", label: "Equipment", icon: Wrench },
  { id: "subcontractor", label: "Subcontractor", icon: Users },
  { id: "other", label: "Other Items", icon: Settings },
  { id: "group", label: "Group", icon: Layers }
];

function mapSourceToItemType(source: SourceCategory): CatalogItemType | null {
  switch (source) {
    case "material":
      return "material";
    case "labor":
      return "labor";
    case "equipment":
      return "equipment";
    case "subcontractor":
      return "subcontractor";
    case "other":
      return "other";
    case "group":
      return "system";
    default:
      return null;
  }
}

export function CFAddItemPicker({
  open,
  onClose,
  catalogItems,
  selectedItems,
  onAddItem,
  onCreateManualItem
}: CFAddItemPickerProps) {
  const [activeSource, setActiveSource] = useState<SourceCategory>("material");
  const [search, setSearch] = useState("");

  // Manual item form state
  const [manualName, setManualName] = useState("");
  const [manualItemType, setManualItemType] = useState<CatalogItemType>("material");
  const [manualCostCode, setManualCostCode] = useState("");
  const [manualAssignedTo, setManualAssignedTo] = useState("");
  const [manualVariation, setManualVariation] = useState("");
  const [manualUnitCost, setManualUnitCost] = useState("");
  const [manualUnit, setManualUnit] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [manualMarkup, setManualMarkup] = useState("");
  const [manualMarkupType, setManualMarkupType] = useState<"percent" | "dollar">("percent");
  const [manualOptional, setManualOptional] = useState(false);
  const [manualTaxable, setManualTaxable] = useState(false);
  const [manualDescription, setManualDescription] = useState("");
  const [manualInternalNotes, setManualInternalNotes] = useState("");

  const filteredItems = useMemo(() => {
    const itemType = mapSourceToItemType(activeSource);
    if (!itemType) return [];

    const query = search.trim().toLowerCase();
    return catalogItems.filter((item) => {
      if (item.itemType !== itemType) return false;
      if (item.status !== "active") return false;
      if (!query) return true;
      return item.name.toLowerCase().includes(query);
    });
  }, [catalogItems, activeSource, search]);

  const totalCost = useMemo(() => {
    const cost = parseFloat(manualUnitCost) || 0;
    const qty = parseFloat(manualQuantity) || 0;
    const markup = parseFloat(manualMarkup) || 0;
    const base = cost * qty;
    if (manualMarkupType === "percent") {
      return base + (base * markup / 100);
    }
    return base + markup;
  }, [manualUnitCost, manualQuantity, manualMarkup, manualMarkupType]);

  if (!open) return null;

  const showManualForm = activeSource === "manual";
  const showItemList = ["material", "labor", "equipment", "subcontractor", "other", "group", "1build"].includes(activeSource);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[5vh]">
      <div className="flex h-[85vh] w-full max-w-[1100px] overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Left sidebar - Source categories */}
        <div className="w-[220px] shrink-0 border-r border-[#e2e7ef] bg-[#f8f9fb]">
          <nav className="py-2">
            {SOURCE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeSource === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveSource(cat.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] ${
                    isActive
                      ? "bg-white font-medium text-[#28456f]"
                      : "text-[#607492] hover:bg-white/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <span>{cat.label}</span>
                    {cat.disabled && (
                      <span className="block text-[11px] text-[#f97316]">{cat.disabledText}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e2e7ef] px-5 py-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-[#28456f]" />
              <h2 className="text-[16px] font-semibold text-[#28456f]">Add Estimate Item</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded text-[#8594a8] hover:bg-[#f6f8fb] hover:text-[#28456f]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Form/List area */}
            <div className="flex-1 overflow-y-auto p-5">
              {showManualForm && (
                <div className="space-y-4">
                  {/* Item Name */}
                  <div className="rounded border border-[#d0d7e2] p-4">
                    <label className="block">
                      <span className="text-[13px] font-medium text-[#334a70]">Item Name*</span>
                      <input
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                      />
                    </label>
                  </div>

                  {/* Type & Cost Code row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded border border-[#d0d7e2] p-4">
                      <label className="block">
                        <span className="text-[13px] font-medium text-[#334a70]">Item Type*</span>
                        <select
                          value={manualItemType}
                          onChange={(e) => setManualItemType(e.target.value as CatalogItemType)}
                          className="mt-1.5 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                        >
                          <option value="material">Material</option>
                          <option value="labor">Labor</option>
                          <option value="equipment">Equipment</option>
                          <option value="subcontractor">Subcontractor</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                    </div>
                    <div className="rounded border border-[#d0d7e2] p-4">
                      <label className="block">
                        <span className="text-[13px] font-medium text-[#334a70]">Assigned To</span>
                        <input
                          value={manualAssignedTo}
                          onChange={(e) => setManualAssignedTo(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cost Code & Variation row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded border border-[#d0d7e2] p-4">
                      <label className="block">
                        <span className="text-[13px] font-medium text-[#334a70]">Cost Code</span>
                        <select
                          value={manualCostCode}
                          onChange={(e) => setManualCostCode(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                        >
                          <option value="">Select cost code</option>
                        </select>
                      </label>
                    </div>
                    <div className="rounded border border-[#d0d7e2] p-4">
                      <label className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#334a70]">Variation</span>
                        <Info className="h-4 w-4 text-[#8594a8]" />
                      </label>
                      <input
                        value={manualVariation}
                        onChange={(e) => setManualVariation(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                      />
                    </div>
                  </div>

                  {/* Pricing row */}
                  <div className="rounded border border-[#d0d7e2] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex h-7 w-7 items-center justify-center rounded border border-[#d0d7e2] text-[#8594a8]">
                          <Info className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setManualMarkupType("percent")}
                          className={`flex h-7 w-7 items-center justify-center rounded border text-[12px] font-medium ${
                            manualMarkupType === "percent"
                              ? "border-[#28456f] bg-[#28456f] text-white"
                              : "border-[#d0d7e2] text-[#607492]"
                          }`}
                        >
                          %
                        </button>
                        <button
                          onClick={() => setManualMarkupType("dollar")}
                          className={`flex h-7 w-7 items-center justify-center rounded border text-[12px] font-medium ${
                            manualMarkupType === "dollar"
                              ? "border-[#28456f] bg-[#28456f] text-white"
                              : "border-[#d0d7e2] text-[#607492]"
                          }`}
                        >
                          $
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <label className="block">
                        <span className="text-[12px] text-[#607492]">Unit Cost</span>
                        <div className="mt-1 flex h-10 items-center rounded border border-[#d0d7e2] bg-white px-2">
                          <span className="text-[13px] text-[#8594a8]">$</span>
                          <input
                            value={manualUnitCost}
                            onChange={(e) => setManualUnitCost(e.target.value)}
                            placeholder="Unit Cost"
                            className="h-full flex-1 border-0 bg-transparent px-1 text-[13px] text-[#334a70] outline-none"
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-[12px] text-[#607492]">Unit</span>
                        <input
                          value={manualUnit}
                          onChange={(e) => setManualUnit(e.target.value)}
                          placeholder="Unit"
                          className="mt-1 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[12px] text-[#607492]">QTY</span>
                        <input
                          value={manualQuantity}
                          onChange={(e) => setManualQuantity(e.target.value)}
                          placeholder="Item Quantity"
                          className="mt-1 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[12px] text-[#607492]">Markup</span>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            value={manualMarkup}
                            onChange={(e) => setManualMarkup(e.target.value)}
                            placeholder="MU"
                            className="h-10 w-16 rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none"
                          />
                          <span className="text-[13px] text-[#8594a8]">{manualMarkupType === "percent" ? "%" : "$"}</span>
                          <div className="flex h-10 items-center rounded border border-[#d0d7e2] bg-[#f6f8fb] px-3">
                            <span className="text-[13px] text-[#8594a8]">$</span>
                            <span className="ml-1 text-[13px] text-[#334a70]">Total Markup</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <div className={`relative h-5 w-9 rounded-full ${manualOptional ? "bg-[#28456f]" : "bg-[#d0d7e2]"}`}>
                            <input
                              type="checkbox"
                              checked={manualOptional}
                              onChange={(e) => setManualOptional(e.target.checked)}
                              className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${manualOptional ? "translate-x-4" : "translate-x-0.5"}`} />
                          </div>
                          <span className="flex items-center gap-1 text-[12px] text-[#607492]">
                            <Package className="h-3.5 w-3.5" />
                            Optional
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <div className={`relative h-5 w-9 rounded-full ${manualTaxable ? "bg-[#28456f]" : "bg-[#d0d7e2]"}`}>
                            <input
                              type="checkbox"
                              checked={manualTaxable}
                              onChange={(e) => setManualTaxable(e.target.checked)}
                              className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${manualTaxable ? "translate-x-4" : "translate-x-0.5"}`} />
                          </div>
                          <span className="flex items-center gap-1 text-[12px] text-[#607492]">
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            Apply Tax
                          </span>
                        </label>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-semibold text-[#f97316]">
                          Total Cost: ${totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="rounded border border-[#d0d7e2] p-4">
                    <label className="block">
                      <span className="text-[13px] font-medium text-[#334a70]">Description</span>
                      <p className="mt-0.5 text-[11px] text-[#8594a8]">
                        Notes added here are transferred to other records (such as an Estimate or PO) and can be optionally made visible to the recipient when submitted.
                      </p>
                      <textarea
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded border border-[#d0d7e2] bg-white p-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                      />
                    </label>
                  </div>

                  {/* Internal Notes */}
                  <div className="rounded border border-[#d0d7e2] p-4">
                    <label className="block">
                      <span className="text-[13px] font-medium text-[#334a70]">Internal Notes</span>
                      <p className="mt-0.5 text-[11px] text-[#8594a8]">
                        Notes added here are transferred to other records (such as an Estimate or PO) and are not visible
                      </p>
                      <textarea
                        value={manualInternalNotes}
                        onChange={(e) => setManualInternalNotes(e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded border border-[#d0d7e2] bg-white p-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                      />
                    </label>
                  </div>

                  {/* Add button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onCreateManualItem({
                          name: manualName,
                          itemType: manualItemType,
                          costCode: manualCostCode,
                          unitCost: manualUnitCost,
                          unit: manualUnit,
                          quantity: manualQuantity,
                          markupPercent: manualMarkupType === "percent" ? manualMarkup : "0",
                          taxable: manualTaxable,
                          description: manualDescription
                        });
                      }}
                      className="rounded bg-[#28456f] px-6 py-2.5 text-[13px] font-medium text-white hover:bg-[#1e3a5f]"
                    >
                      Add Manual Item
                    </button>
                  </div>
                </div>
              )}

              {showItemList && (
                <div>
                  {/* Search */}
                  <div className="mb-4 flex h-10 items-center gap-2 rounded border border-[#d0d7e2] bg-white px-3">
                    <Search className="h-4 w-4 text-[#8594a8]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search items..."
                      className="h-full flex-1 border-0 bg-transparent text-[13px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
                    />
                  </div>

                  {/* Items table */}
                  <div className="overflow-hidden rounded border border-[#e2e7ef]">
                    <table className="w-full text-[12px]">
                      <thead className="bg-[#f6f8fb]">
                        <tr className="border-b border-[#e2e7ef]">
                          <th className="px-3 py-2 text-left font-medium text-[#607492]">Name</th>
                          <th className="px-3 py-2 text-right font-medium text-[#607492]">Unit Cost</th>
                          <th className="px-3 py-2 text-left font-medium text-[#607492]">Unit</th>
                          <th className="px-3 py-2 text-right font-medium text-[#607492]">Price</th>
                          <th className="w-10 px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => {
                          const pricing = calculateSharedUnitPricing({
                            baseUnitCost: item.defaultUnitCost,
                            baseUnitPrice: item.defaultUnitPrice,
                            markupPercent: item.markupPercent,
                            hiddenMarkupPercent: item.hiddenMarkupPercent
                          });
                          const isSelected = selectedItems.includes(item.id);

                          return (
                            <tr
                              key={item.id}
                              className={`border-b border-[#e2e7ef] hover:bg-[#f6f8fb] ${
                                isSelected ? "bg-[#e8f4ff]" : ""
                              }`}
                            >
                              <td className="px-3 py-2 text-[#334a70]">{item.name}</td>
                              <td className="px-3 py-2 text-right text-[#334a70]">
                                ${formatMoneyValue(item.defaultUnitCost)}
                              </td>
                              <td className="px-3 py-2 text-[#607492]">{item.unit}</td>
                              <td className="px-3 py-2 text-right text-[#334a70]">
                                ${formatMoneyValue(pricing.finalUnitPrice)}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => onAddItem(item)}
                                  className="flex h-6 w-6 items-center justify-center rounded bg-[#28456f] text-white hover:bg-[#1e3a5f]"
                                >
                                  <span className="text-[14px]">+</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredItems.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-8 text-center text-[#8594a8]">
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel - Currently Selected */}
            <div className="w-[240px] shrink-0 border-l border-[#e2e7ef] bg-[#f8f9fb] p-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#28456f]">
                <Folder className="h-4 w-4" />
                Currently Selected
              </div>
              <p className="mt-2 text-[12px] text-[#8594a8]">
                Selected items will appear here!
              </p>
              {selectedItems.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedItems.map((id) => {
                    const item = catalogItems.find((i) => i.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className="rounded bg-white px-3 py-2 text-[12px] text-[#334a70] shadow-sm">
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e2e7ef] bg-[#f6f8fb] px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded bg-[#607492] py-2.5 text-[13px] font-medium text-white hover:bg-[#4d6078]"
            >
              Add Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
