"use client";

import { useState } from "react";
import {
  FileText,
  StickyNote,
  FolderOpen,
  Package,
  Star,
  X,
  Upload,
  Users,
  Wrench,
  FileBox,
  Layers,
  ChevronDown
} from "lucide-react";

type AddItemDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: string | null;
};

const tabItems = [
  { id: "details", icon: FileText, label: "Details" },
  { id: "notes", icon: StickyNote, label: "Notes" },
  { id: "files", icon: FolderOpen, label: "Files" }
];

export function AddItemDrawer({ open, onOpenChange, itemType }: AddItemDrawerProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [markupType, setMarkupType] = useState<"percent" | "dollar">("percent");

  if (!open) return null;

  const getTitle = () => {
    switch (itemType) {
      case "material":
        return "Add Material Item";
      case "labor":
        return "Add Labor Item";
      case "equipment":
        return "Add Equipment Item";
      case "subcontractor":
        return "Add Subcontractor Item";
      case "other":
        return "Add Other Item";
      case "group":
        return "Add Item Group";
      default:
        return "Add Item";
    }
  };

  const getIcon = () => {
    switch (itemType) {
      case "material":
        return <Package className="h-5 w-5 text-[#28456f]" />;
      case "labor":
        return <Users className="h-5 w-5 text-[#28456f]" />;
      case "equipment":
        return <Wrench className="h-5 w-5 text-[#28456f]" />;
      case "subcontractor":
        return <FileText className="h-5 w-5 text-[#28456f]" />;
      case "other":
        return <FileBox className="h-5 w-5 text-[#28456f]" />;
      case "group":
        return <Layers className="h-5 w-5 text-[#28456f]" />;
      default:
        return <Package className="h-5 w-5 text-[#28456f]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0"
        aria-label="Close drawer"
      />
      <aside className="relative z-10 flex h-full w-[600px] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            {getIcon()}
            <span className="text-lg font-semibold text-gray-900">{getTitle()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded p-1.5 hover:bg-gray-100">
              <FileText className="h-4 w-4 text-gray-500" />
            </button>
            <button className="rounded p-1.5 hover:bg-gray-100">
              <Star className="h-4 w-4 text-gray-500" />
            </button>
            <button
              className="rounded p-1.5 hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[#28456f] text-[#28456f]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Details Section */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="mt-1 h-9 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#28456f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">SKU</label>
                    <input
                      type="text"
                      className="mt-1 h-9 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#28456f] focus:outline-none"
                    />
                  </div>

                  <div className="row-span-3 flex flex-col items-center justify-center">
                    <div className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-xs">Add Product Image</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Cost Code</label>
                    <div className="relative mt-1">
                      <select className="h-9 w-full appearance-none rounded border border-gray-300 bg-white px-3 pr-8 text-sm focus:border-[#28456f] focus:outline-none">
                        <option value="">Select</option>
                        <option value="flooring">Flooring Materials (2001)</option>
                        <option value="finishing">Finishing Materials (2004)</option>
                        <option value="aggregate">Aggregate (Archived)</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Variations</label>
                    <input
                      type="text"
                      className="mt-1 h-9 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#28456f] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Unit Cost</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                      <input
                        type="text"
                        placeholder="Unit Cost"
                        className="h-9 w-full rounded border border-gray-300 pl-7 pr-3 text-sm focus:border-[#28456f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Unit</label>
                    <input
                      type="text"
                      placeholder="Unit"
                      className="mt-1 h-9 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#28456f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Hidden Markup</label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        placeholder="Hidden Markup"
                        className="h-9 w-full rounded-l border border-r-0 border-gray-300 px-3 text-sm focus:border-[#28456f] focus:outline-none"
                      />
                      <button
                        type="button"
                        className="flex h-9 items-center justify-center rounded-r border border-gray-300 bg-gray-50 px-2"
                      >
                        <Wrench className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Markup</label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        defaultValue="35"
                        className="h-9 w-16 rounded-l border border-r-0 border-gray-300 px-3 text-right text-sm focus:border-[#28456f] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setMarkupType("percent")}
                        className={`flex h-9 items-center justify-center rounded-r border border-gray-300 px-3 text-sm font-medium ${
                          markupType === "percent"
                            ? "bg-[#28456f] text-white"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <div className="text-sm">
                    <span className="text-gray-600">Total Cost Per Unit: </span>
                    <span className="font-semibold text-[#f97316]">$0.00</span>
                  </div>
                </div>
              </div>

              {/* Supplier Section */}
              <div className="rounded-lg border border-gray-200 p-4">
                <label className="text-sm text-gray-600">Supplier</label>
                <div className="relative mt-1">
                  <select className="h-9 w-full appearance-none rounded border border-gray-300 bg-white px-3 pr-8 text-sm focus:border-[#28456f] focus:outline-none">
                    <option value="">Select</option>
                    <option value="home-depot">Home Depot</option>
                    <option value="lowes">{"Lowe's"}</option>
                    <option value="menards">Menards</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  className="mt-2 min-h-[100px] w-full rounded border border-gray-300 p-3 text-sm focus:border-[#28456f] focus:outline-none"
                  placeholder="Notes added here are transferred to other records (such as an Estimate or PO) and can be optionally made visible to the recipient when submitted."
                />
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <label className="text-sm text-gray-600">Internal Notes</label>
                <textarea
                  className="mt-2 min-h-[100px] w-full rounded border border-gray-300 p-3 text-sm focus:border-[#28456f] focus:outline-none"
                  placeholder="Notes added here are transferred to other records (such as an Estimate or PO) and are not visible to the recipient."
                />
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <Upload className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  Drag and drop files here, or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <button
            type="button"
            className="h-10 w-full rounded bg-[#28456f] font-medium text-white hover:bg-[#1e3555]"
          >
            Create {itemType === "material" ? "Material Item" : itemType === "group" ? "Item Group" : "Item"}
          </button>
        </div>
      </aside>
    </div>
  );
}
