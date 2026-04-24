"use client";

import { useState } from "react";
import type { CatalogItem, CatalogItemType, EstimateItemGroup } from "@floorconnector/types";

import { CFCostItemsGrid } from "@/components/catalog-manager/cf-cost-items-grid";
import { CFAddItemPicker } from "@/components/estimates/cf-add-item-picker";
import { CFEstimateItemsWorkspace } from "@/components/estimates/cf-estimate-items-workspace";
import { CFContractorHeader } from "@/components/cf-contractor-header";

// Sample data for demo
const SAMPLE_ITEMS: CatalogItem[] = [
  {
    id: "1",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "24\" X 24\" Glue Down Carpet...",
    description: "Premium carpet tiles",
    internalNotes: null,
    unit: "SF",
    defaultUnitCost: "2.87",
    defaultUnitPrice: null,
    markupPercent: "35",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: null,
    category: "Flooring Materials (2001)",
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 0,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "2",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "equipment",
    name: "Drill & extension",
    description: "Equipment rental",
    internalNotes: null,
    unit: "1 Day",
    defaultUnitCost: "250.00",
    defaultUnitPrice: null,
    markupPercent: "20",
    hiddenMarkupPercent: "0",
    taxable: false,
    vendorId: null,
    category: "Equipment Rentals (4...)",
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 1,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "3",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "$3,500",
    description: "Bulk material order",
    internalNotes: null,
    unit: "-",
    defaultUnitCost: "3500.00",
    defaultUnitPrice: null,
    markupPercent: "0",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: null,
    category: null,
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 2,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "4",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "0.080\" X 4\" X 120' Vinyl Wall ...",
    description: "Vinyl wall covering",
    internalNotes: null,
    unit: "LF",
    defaultUnitCost: "0.91",
    defaultUnitPrice: null,
    markupPercent: "35",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: "vendor-1",
    category: null,
    sku: null,
    photoStoragePath: "/images/vinyl.jpg",
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 3,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "5",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "1 Box Nitrile gloves",
    description: "Safety supplies",
    internalNotes: null,
    unit: "1 box of glov...",
    defaultUnitCost: "4.50",
    defaultUnitPrice: null,
    markupPercent: "0",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: null,
    category: "Aggregate (Archived)",
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 4,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "6",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "1 Box of trash bags",
    description: "Cleanup supplies",
    internalNotes: null,
    unit: "1 box of tras...",
    defaultUnitCost: "15.00",
    defaultUnitPrice: null,
    markupPercent: "0",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: null,
    category: "Aggregate (Archived)",
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 5,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "7",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "material",
    name: "1 gal. #PR-W15 Ultra Pure ...",
    description: "Paint primer",
    internalNotes: null,
    unit: "1 Gal",
    defaultUnitCost: "64.00",
    defaultUnitPrice: null,
    markupPercent: "35",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: null,
    category: null,
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 6,
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "8",
    organizationId: "org-1",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: "labor",
    name: "1 Gallon Mixing Measure",
    description: "Mixing equipment",
    internalNotes: null,
    unit: "1 Gallon Cup",
    defaultUnitCost: "3.10",
    defaultUnitPrice: null,
    markupPercent: "0",
    hiddenMarkupPercent: "0",
    taxable: true,
    vendorId: null,
    category: "Aggregate (Archived)",
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 7,
    createdAt: "",
    updatedAt: ""
  }
];

const SAMPLE_LINE_ITEMS = [
  {
    rowKey: "line-1",
    catalogItemId: "1",
    sourceType: "catalog_item" as const,
    itemType: "material" as CatalogItemType,
    groupId: null,
    name: "24\" X 24\" Glue Dow...",
    costCode: "-",
    quantity: "4,545",
    unitCost: "2.87",
    unit: "SF",
    markupPercent: "35",
    total: "17,609.60",
    taxable: true,
    assignedTo: "-"
  },
  {
    rowKey: "line-2",
    catalogItemId: "2",
    sourceType: "catalog_item" as const,
    itemType: "equipment" as CatalogItemType,
    groupId: null,
    name: "Drill & extention",
    costCode: "Equipment Rentals (4...",
    quantity: "3",
    unitCost: "250.00",
    unit: "1 Day",
    markupPercent: "20",
    total: "900.00",
    taxable: false,
    assignedTo: "-"
  }
];

const SAMPLE_VENDORS = [
  { id: "vendor-1", name: "Home Depot", organizationId: "org-1", email: null, phone: null, address: null, notes: null, status: "active" as const, createdAt: "", updatedAt: "" }
];

export default function CFDemoPage() {
  const [activeView, setActiveView] = useState<"grid" | "estimate" | "picker">("grid");
  const [showPicker, setShowPicker] = useState(false);
  const [showMarkup, setShowMarkup] = useState(true);
  const [showOnlyZeroItems, setShowOnlyZeroItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <CFContractorHeader
        organizationName="Danek Flooring Inc"
        userDisplayName="Jeff Filamonte"
        userId="5606120"
        timestampLabel="23/4 09:29 AM"
        homeHref="/dashboard"
        currentRole="admin"
      />

      {/* View switcher */}
      <div className="border-b border-[#e2e7ef] bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#607492]">Demo View:</span>
          <button
            onClick={() => setActiveView("grid")}
            className={`rounded px-3 py-1.5 text-[13px] font-medium ${
              activeView === "grid"
                ? "bg-[#28456f] text-white"
                : "border border-[#d0d7e2] text-[#607492]"
            }`}
          >
            Cost Items Database
          </button>
          <button
            onClick={() => setActiveView("estimate")}
            className={`rounded px-3 py-1.5 text-[13px] font-medium ${
              activeView === "estimate"
                ? "bg-[#28456f] text-white"
                : "border border-[#d0d7e2] text-[#607492]"
            }`}
          >
            Estimate Workspace
          </button>
          <button
            onClick={() => setShowPicker(true)}
            className="rounded border border-[#d0d7e2] px-3 py-1.5 text-[13px] font-medium text-[#607492]"
          >
            Open Add Item Picker
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === "grid" && (
        <CFCostItemsGrid
          items={SAMPLE_ITEMS}
          vendors={SAMPLE_VENDORS}
          onEditItem={(item) => console.log("Edit item:", item)}
          onArchiveItem={(item) => console.log("Archive item:", item)}
          onAddItem={(itemType) => console.log("Add item type:", itemType)}
        />
      )}

      {activeView === "estimate" && (
        <CFEstimateItemsWorkspace
          estimateTitle="test"
          estimateNumber="6154"
          projectLabel="Project/Opportunity"
          status="estimating"
          lineItems={SAMPLE_LINE_ITEMS}
          itemGroups={[]}
          catalogItems={SAMPLE_ITEMS}
          showMarkup={showMarkup}
          showOnlyZeroItems={showOnlyZeroItems}
          estimatedCost="13,794.15"
          markupAmount="4,715.45"
          markupPercent="34"
          subtotal="18,509.60"
          taxAmount="0.00"
          grandTotal="18,509.60"
          hours="0"
          profitMargin="4,715.45"
          profitMarginPercent="25"
          onToggleMarkup={setShowMarkup}
          onToggleShowOnlyZeroItems={setShowOnlyZeroItems}
          onLineItemChange={(rowKey, field, value) => console.log("Line item change:", rowKey, field, value)}
          onMoveLineItem={(rowKey, direction) => console.log("Move line item:", rowKey, direction)}
          onRemoveLineItem={(rowKey) => console.log("Remove line item:", rowKey)}
          onAddItem={() => setShowPicker(true)}
          onAddSystem={() => console.log("Add system")}
        />
      )}

      {/* Add Item Picker Modal */}
      <CFAddItemPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        catalogItems={SAMPLE_ITEMS}
        selectedItems={selectedItems}
        onAddItem={(item) => {
          setSelectedItems([...selectedItems, item.id]);
          console.log("Add item:", item);
        }}
        onCreateManualItem={(item) => console.log("Create manual item:", item)}
      />
    </div>
  );
}
