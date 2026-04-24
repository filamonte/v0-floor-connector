"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
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

export function CostItemsDatabaseShell() {
  const [activeNav, setActiveNav] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<string | null>(null);

  const activeNavItem = sidebarNavItems.find((item) => item.id === activeNav);
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
    <TooltipProvider>
      <div className="flex h-[calc(100vh-104px)] bg-white">
        {/* Left Sidebar - CF style dark navy icons */}
        <div className="w-[52px] bg-[#28456f] flex flex-col items-center py-2 gap-1">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded transition-colors",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white text-xs px-2 py-1">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={getSearchPlaceholder()}
                  className="pl-9 w-[280px] h-9 text-sm border-gray-300"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[100px] h-9 bg-[#f97316] text-white border-0 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 px-4 text-sm font-medium text-[#28456f] border-[#28456f]">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>Video: Cost Codes vs Cost Items</DropdownMenuItem>
                  <DropdownMenuItem>Import from 1build.com Items Database</DropdownMenuItem>
                  <DropdownMenuItem>Import/Export to CSV</DropdownMenuItem>
                  <DropdownMenuItem>Apply/Bulk Markup</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {activeNav === "all" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-9 px-4 text-sm font-medium bg-white text-[#28456f] border border-[#28456f] hover:bg-gray-50">
                      <Plus className="mr-2 h-4 w-4" />
                      {getAddButtonLabel()}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAddItem("material")}>
                      <Plus className="mr-2 h-4 w-4" /> Material Item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddItem("labor")}>
                      <Plus className="mr-2 h-4 w-4" /> Labor Item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddItem("equipment")}>
                      <Plus className="mr-2 h-4 w-4" /> Equipment Item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddItem("subcontractor")}>
                      <Plus className="mr-2 h-4 w-4" /> Subcontractor Item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddItem("other")}>
                      <Plus className="mr-2 h-4 w-4" /> Other Item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddItem("group")}>
                      <Plus className="mr-2 h-4 w-4" /> Item Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  className="h-9 px-4 text-sm font-medium bg-white text-[#28456f] border border-[#28456f] hover:bg-gray-50"
                  onClick={() => handleAddItem(activeNav)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {getAddButtonLabel()}
                </Button>
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
    </TooltipProvider>
  );
}

function ItemsTable({ items, showTypeColumn }: { items: typeof mockItems; showTypeColumn: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 sticky top-0">
        <tr className="border-b border-gray-200">
          <th className="w-10 px-3 py-2 text-left">
            <input type="checkbox" className="rounded border-gray-300" />
          </th>
          {showTypeColumn && (
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
          )}
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
            <div className="flex items-center gap-1">
              Name
              <ChevronDown className="h-3 w-3 rotate-180" />
            </div>
          </th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Unit Cost</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">MU %</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Cost Code</th>
          <th className="w-24 px-3 py-2"></th>
        </tr>
        {/* Filter row */}
        <tr className="border-b border-gray-200 bg-white">
          <th className="px-3 py-1"></th>
          {showTypeColumn && <th className="px-3 py-1"></th>}
          <th className="px-3 py-1">
            <Input placeholder="Search SKU" className="h-7 text-xs border-gray-300" />
          </th>
          <th className="px-3 py-1">
            <Input placeholder="Search Name" className="h-7 text-xs border-gray-300" />
          </th>
          <th className="px-3 py-1"></th>
          <th className="px-3 py-1">
            <Input placeholder="Search Unit" className="h-7 text-xs border-gray-300" />
          </th>
          <th className="px-3 py-1">
            <Input placeholder="Search MU %" className="h-7 text-xs border-gray-300" />
          </th>
          <th className="px-3 py-1"></th>
          <th className="px-3 py-1">
            <Select>
              <SelectTrigger className="h-7 text-xs border-gray-300">
                <SelectValue placeholder="Select Cost Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="aggregate">Aggregate (Archived)</SelectItem>
                <SelectItem value="flooring">Flooring Materials (2001)</SelectItem>
              </SelectContent>
            </Select>
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
            <td className="px-3 py-2 text-gray-900">${item.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td className="px-3 py-2 text-gray-600">{item.unit}</td>
            <td className="px-3 py-2 text-gray-900 text-center">{item.muPercent}</td>
            <td className="px-3 py-2 text-gray-900">${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td className="px-3 py-2 text-gray-600">{item.costCode}</td>
            <td className="px-3 py-2">
              <div className="flex items-center justify-end gap-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <FileText className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Star className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
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
      <thead className="bg-gray-50 sticky top-0">
        <tr className="border-b border-gray-200">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase"># Items</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Added By</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
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
                <div className="w-6 h-6 rounded-full bg-[#28456f] flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900">{group.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-gray-900 text-center">{group.itemCount}</td>
            <td className="px-4 py-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
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
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
