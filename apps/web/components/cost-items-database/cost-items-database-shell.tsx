"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  Users,
  Wrench,
  FileText,
  Layers,
  Calendar,
  Search,
  ChevronDown,
  Plus,
  MoreVertical,
  Star,
  Image as ImageIcon
} from "lucide-react";
import { AddItemDrawer } from "./add-item-drawer";

// Left sidebar nav items matching CF exactly
const sidebarNavItems = [
  { id: "all", icon: LayoutGrid, label: "All Items" },
  { id: "material", icon: Package, label: "Material Items" },
  { id: "labor", icon: Users, label: "Labor" },
  { id: "equipment", icon: Wrench, label: "Equipment" },
  { id: "subcontractor", icon: FileText, label: "Subcontractor" },
  { id: "other", icon: Layers, label: "Other Items" },
  { id: "budgets", icon: Calendar, label: "Budgets" },
  { id: "groups", icon: Layers, label: "Item Groups" }
];

// Mock data for items
const mockItems = [
  { id: 1, type: "material", hasImage: false, sku: "-", name: "$3,500", unitCost: 3500.00, unit: "-", muPercent: 0, total: 3500.00, costCode: "-" },
  { id: 2, type: "material", hasImage: true, sku: "-", name: "0.080\" X 4\" X 120' Vinyl Wall ...", unitCost: 0.91, unit: "LF", muPercent: 35, total: 1.23, costCode: "-" },
  { id: 3, type: "material", hasImage: false, sku: "-", name: "1 Box Nitrile gloves", unitCost: 4.50, unit: "1 box of glov...", muPercent: 0, total: 4.50, costCode: "Aggregate (Archived)" },
  { id: 4, type: "material", hasImage: false, sku: "-", name: "1 Box of trash bags", unitCost: 15.00, unit: "1 box of tras...", muPercent: 0, total: 15.00, costCode: "Aggregate (Archived)" },
  { id: 5, type: "material", hasImage: false, sku: "-", name: "1 gal. #PR-W15 Ultra Pure ...", unitCost: 64.00, unit: "1 Gal", muPercent: 35, total: 86.40, costCode: "-" },
  { id: 6, type: "material", hasImage: false, sku: "-", name: "1 Gallon Mixing Measure", unitCost: 3.10, unit: "1 Gallon Cup", muPercent: 0, total: 3.10, costCode: "Aggregate (Archived)" },
  { id: 7, type: "material", hasImage: false, sku: "-", name: "1 Quart Mixing Measure", unitCost: 1.00, unit: "1 quart cup", muPercent: 0, total: 1.00, costCode: "Aggregate (Archived)" },
  { id: 8, type: "material", hasImage: false, sku: "-", name: "1,500 Grit Finish Upgrade", unitCost: 1250.00, unit: "-", muPercent: 0, total: 1250.00, costCode: "-" },
  { id: 9, type: "material", hasImage: false, sku: "-", name: "1/2\" Gallon Mixing Measure", unitCost: 1.25, unit: "1 1/2 Gallon ...", muPercent: 0, total: 1.25, costCode: "Aggregate (Archived)" },
  { id: 10, type: "material", hasImage: true, sku: "-", name: "1/4 in. D x 7-1/4 in. W x 96 i...", unitCost: 31.85, unit: "3 Pack", muPercent: 35, total: 43.00, costCode: "-" }
];

// Mock data for groups
const mockGroups = [
  { id: 1, name: "2024", itemCount: 26, addedBy: "JF", dateAdded: "05/08/2024" },
  { id: 2, name: "Elite Crete Systems", itemCount: 47, addedBy: "JF", dateAdded: "03/05/2025" },
  { id: 3, name: "Active", itemCount: 0, addedBy: "JF", dateAdded: "03/05/2025" }
];

function TypeIcon({ type, hasImage }: { type: string; hasImage?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <Package className="h-4 w-4 text-[#28456f]" />
      {hasImage && <ImageIcon className="h-3 w-3 text-orange-500" />}
    </div>
  );
}

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white">
          {label}
        </div>
      )}
    </div>
  );
}

function Dropdown({ trigger, children, align = "end" }: { trigger: React.ReactNode; children: React.ReactNode; align?: "start" | "end" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={`absolute top-full mt-1 z-50 min-w-[200px] rounded-md border border-gray-200 bg-white py-1 shadow-lg ${align === "end" ? "right-0" : "left-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

export function CostItemsDatabaseShell() {
  const [activeNav, setActiveNav] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<string | null>(null);

  const isGroupsView = activeNav === "groups";
  const isMaterialView = activeNav === "material";

  const handleAddItem = (type: string) => {
    setAddItemType(type);
    setIsAddDrawerOpen(true);
  };

  const getSearchPlaceholder = () => {
    if (isGroupsView) return "Search for Item Groups";
    if (isMaterialView) return "Search for Material Items";
    return "Search for All Items";
  };

  const getAddButtonLabel = () => {
    if (isGroupsView) return "Item Group";
    if (isMaterialView) return "Material";
    return "Item";
  };

  return (
    <div className="flex h-[calc(100vh-104px)] bg-white">
      {/* Left Sidebar - CF style dark navy icons */}
      <div className="flex w-[52px] flex-col items-center gap-1 bg-[#28456f] py-2">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <Tooltip key={item.id} label={item.label}>
              <button
                onClick={() => setActiveNav(item.id)}
                className={`flex h-10 w-10 items-center justify-center rounded transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                className="h-9 w-[280px] rounded border border-gray-300 pl-9 pr-3 text-sm focus:border-[#28456f] focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 appearance-none rounded border-0 bg-[#f97316] px-4 pr-8 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              trigger={
                <button className="flex h-9 items-center gap-2 rounded border border-[#28456f] bg-white px-4 text-sm font-medium text-[#28456f] hover:bg-gray-50">
                  Actions
                  <ChevronDown className="h-4 w-4" />
                </button>
              }
            >
              <DropdownItem>Video: Cost Codes vs Cost Items</DropdownItem>
              <DropdownItem>Import from 1build.com Items Database</DropdownItem>
              <DropdownItem>Import/Export to CSV</DropdownItem>
              <DropdownItem>Apply/Bulk Markup</DropdownItem>
            </Dropdown>

            {activeNav === "all" ? (
              <Dropdown
                trigger={
                  <button className="flex h-9 items-center gap-2 rounded border border-[#28456f] bg-white px-4 text-sm font-medium text-[#28456f] hover:bg-gray-50">
                    <Plus className="h-4 w-4" />
                    {getAddButtonLabel()}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                }
              >
                <DropdownItem onClick={() => handleAddItem("material")}>
                  <Plus className="h-4 w-4" /> Material Item
                </DropdownItem>
                <DropdownItem onClick={() => handleAddItem("labor")}>
                  <Plus className="h-4 w-4" /> Labor Item
                </DropdownItem>
                <DropdownItem onClick={() => handleAddItem("equipment")}>
                  <Plus className="h-4 w-4" /> Equipment Item
                </DropdownItem>
                <DropdownItem onClick={() => handleAddItem("subcontractor")}>
                  <Plus className="h-4 w-4" /> Subcontractor Item
                </DropdownItem>
                <DropdownItem onClick={() => handleAddItem("other")}>
                  <Plus className="h-4 w-4" /> Other Item
                </DropdownItem>
                <DropdownItem onClick={() => handleAddItem("group")}>
                  <Plus className="h-4 w-4" /> Item Group
                </DropdownItem>
              </Dropdown>
            ) : (
              <button
                onClick={() => handleAddItem(activeNav)}
                className="flex h-9 items-center gap-2 rounded border border-[#28456f] bg-white px-4 text-sm font-medium text-[#28456f] hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                {getAddButtonLabel()}
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isGroupsView ? (
            <GroupsTable groups={mockGroups} />
          ) : (
            <ItemsTable items={mockItems} showTypeColumn={activeNav === "all"} />
          )}
        </div>
      </div>

      {/* Add Item Drawer */}
      <AddItemDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        itemType={addItemType}
      />
    </div>
  );
}

function ItemsTable({ items, showTypeColumn }: { items: typeof mockItems; showTypeColumn: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-gray-50">
        <tr className="border-b border-gray-200">
          <th className="w-10 px-3 py-2 text-left">
            <input type="checkbox" className="rounded border-gray-300" />
          </th>
          {showTypeColumn && (
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Type</th>
          )}
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">SKU</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">
            <div className="flex items-center gap-1">
              Name
              <ChevronDown className="h-3 w-3 rotate-180" />
            </div>
          </th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Unit Cost</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Unit</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">MU %</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Total</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Cost Code</th>
          <th className="w-24 px-3 py-2"></th>
        </tr>
        {/* Filter row */}
        <tr className="border-b border-gray-200 bg-white">
          <th className="px-3 py-1"></th>
          {showTypeColumn && <th className="px-3 py-1"></th>}
          <th className="px-3 py-1">
            <input
              type="text"
              placeholder="Search SKU"
              className="h-7 w-full rounded border border-gray-300 px-2 text-xs focus:border-[#28456f] focus:outline-none"
            />
          </th>
          <th className="px-3 py-1">
            <input
              type="text"
              placeholder="Search Name"
              className="h-7 w-full rounded border border-gray-300 px-2 text-xs focus:border-[#28456f] focus:outline-none"
            />
          </th>
          <th className="px-3 py-1"></th>
          <th className="px-3 py-1">
            <input
              type="text"
              placeholder="Search Unit"
              className="h-7 w-full rounded border border-gray-300 px-2 text-xs focus:border-[#28456f] focus:outline-none"
            />
          </th>
          <th className="px-3 py-1">
            <input
              type="text"
              placeholder="Search MU %"
              className="h-7 w-full rounded border border-gray-300 px-2 text-xs focus:border-[#28456f] focus:outline-none"
            />
          </th>
          <th className="px-3 py-1"></th>
          <th className="px-3 py-1">
            <select className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-xs focus:border-[#28456f] focus:outline-none">
              <option value="">Select Cost Code</option>
              <option value="all">All</option>
              <option value="aggregate">Aggregate (Archived)</option>
              <option value="flooring">Flooring Materials (2001)</option>
            </select>
          </th>
          <th className="px-3 py-1"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-2">
              <input type="checkbox" className="rounded border-gray-300" />
            </td>
            {showTypeColumn && (
              <td className="px-3 py-2">
                <TypeIcon type={item.type} hasImage={item.hasImage} />
              </td>
            )}
            <td className="px-3 py-2 text-gray-600">{item.sku}</td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                {item.hasImage && <ImageIcon className="h-4 w-4 text-orange-500" />}
                <span className="text-gray-900">{item.name}</span>
              </div>
            </td>
            <td className="px-3 py-2 text-gray-900">${item.unitCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            <td className="px-3 py-2 text-gray-600">{item.unit}</td>
            <td className="px-3 py-2 text-center text-gray-900">{item.muPercent}</td>
            <td className="px-3 py-2 text-gray-900">${item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            <td className="px-3 py-2 text-gray-600">{item.costCode}</td>
            <td className="px-3 py-2">
              <div className="flex items-center justify-end gap-1">
                <button className="rounded p-1 hover:bg-gray-100">
                  <FileText className="h-4 w-4 text-gray-400" />
                </button>
                <button className="rounded p-1 hover:bg-gray-100">
                  <Star className="h-4 w-4 text-gray-400" />
                </button>
                <button className="rounded p-1 hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GroupsTable({ groups }: { groups: typeof mockGroups }) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-gray-50">
        <tr className="border-b border-gray-200">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700"># Items</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Added By</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">
            <div className="flex items-center gap-1">
              Date Added
              <ChevronDown className="h-3 w-3 rotate-180" />
            </div>
          </th>
          <th className="w-10 px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {groups.map((group) => (
          <tr key={group.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#28456f]">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900">{group.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-center text-gray-900">{group.itemCount}</td>
            <td className="px-4 py-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                <span className="text-xs font-medium text-orange-600">{group.addedBy}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                {group.dateAdded}
              </div>
            </td>
            <td className="px-4 py-3">
              <button className="rounded p-1 hover:bg-gray-100">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
