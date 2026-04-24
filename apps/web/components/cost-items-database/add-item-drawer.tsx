"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FileText,
  StickyNote,
  FolderOpen,
  Package,
  Star,
  X,
  Upload,
  Percent
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
    return <Package className="h-5 w-5 text-[#28456f]" />;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-gray-200 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            {getIcon()}
            <SheetTitle className="text-lg font-semibold text-gray-900">{getTitle()}</SheetTitle>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <FileText className="h-4 w-4 text-gray-500" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Star className="h-4 w-4 text-gray-500" />
            </button>
            <button 
              className="p-1.5 hover:bg-gray-100 rounded"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </SheetHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                  isActive
                    ? "text-[#28456f] border-[#28456f]"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
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
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-600">
                      Name<span className="text-red-500">*</span>
                    </Label>
                    <Input className="mt-1 h-9" placeholder="" />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">SKU</Label>
                    <Input className="mt-1 h-9" placeholder="" />
                  </div>

                  <div className="row-span-3 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-gray-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-xs">Add Product Image</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Cost Code</Label>
                    <Select>
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flooring">Flooring Materials (2001)</SelectItem>
                        <SelectItem value="finishing">Finishing Materials (2004)</SelectItem>
                        <SelectItem value="aggregate">Aggregate (Archived)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Variations</Label>
                    <Input className="mt-1 h-9" placeholder="" />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Unit Cost</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input className="h-9 pl-7" placeholder="Unit Cost" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Unit</Label>
                    <Input className="mt-1 h-9" placeholder="Unit" />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Hidden Markup</Label>
                    <div className="flex mt-1">
                      <Input className="h-9 rounded-r-none" placeholder="Hidden Markup" />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 rounded-l-none border-l-0 px-2"
                      >
                        <Percent className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Markup</Label>
                    <div className="flex mt-1">
                      <Input className="h-9 rounded-r-none w-20" defaultValue="35" />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-9 rounded-l-none border-l-0 px-3",
                          markupType === "percent" && "bg-[#28456f] text-white"
                        )}
                        onClick={() => setMarkupType("percent")}
                      >
                        %
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Total Cost Per Unit: </span>
                    <span className="text-[#28456f] font-semibold">$0.00</span>
                  </div>
                </div>
              </div>

              {/* Supplier Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Supplier</Label>
                <Select>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home-depot">Home Depot</SelectItem>
                    <SelectItem value="lowes">Lowe's</SelectItem>
                    <SelectItem value="menards">Menards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Description</Label>
                <Textarea 
                  className="mt-2 min-h-[100px]" 
                  placeholder="Notes added here are transferred to other records (such as an Estimate or PO) and can be optionally made visible to the recipient when submitted."
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Internal Notes</Label>
                <Textarea 
                  className="mt-2 min-h-[100px]" 
                  placeholder="Notes added here are transferred to other records (such as an Estimate or PO) and are not visible to the recipient."
                />
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
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
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <Button className="w-full h-10 bg-[#28456f] hover:bg-[#1e3555] text-white font-medium">
            Create {itemType === "material" ? "Material Item" : itemType === "group" ? "Item Group" : "Item"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
