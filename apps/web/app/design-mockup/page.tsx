"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Grid3X3,
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Save,
  Send,
  Settings,
  Trash2,
  Users,
  Wallet,
  X,
  Check,
  Clock,
  AlertCircle,
  Home,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  Copy,
  Download,
  Printer,
} from "lucide-react";

// Graphite & Copper Design System Colors
const colors = {
  // Primary
  graphite: "#374151",
  graphiteLight: "#4B5563",
  graphiteDark: "#1F2937",
  
  // Accent
  copper: "#B45309",
  copperLight: "#D97706",
  copperMuted: "#FEF3C7",
  copperBorder: "#FCD34D",
  
  // Backgrounds
  cream: "#FAFAF8",
  white: "#FFFFFF",
  
  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  
  // Borders
  borderLight: "#E5E7EB",
  borderMedium: "#D1D5DB",
  
  // Semantic
  success: "#059669",
  successBg: "#ECFDF5",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  info: "#0284C7",
  infoBg: "#F0F9FF",
};

// Sample estimate data
const estimateData = {
  id: "EST-2024-0847",
  customer: "Anderson Commercial Properties",
  project: "Warehouse Floor Coating - Building C",
  status: "draft",
  created: "May 8, 2024",
  validUntil: "Jun 7, 2024",
  sqft: 12500,
  subtotal: 47250.00,
  tax: 3780.00,
  total: 51030.00,
};

const lineItems = [
  { id: 1, product: "Surface Preparation - Diamond Grinding", qty: 12500, unit: "sq ft", unitPrice: 0.85, total: 10625.00 },
  { id: 2, product: "Epoxy Primer Coat - Industrial Grade", qty: 12500, unit: "sq ft", unitPrice: 0.65, total: 8125.00 },
  { id: 3, product: "Self-Leveling Epoxy - Medium Build", qty: 12500, unit: "sq ft", unitPrice: 1.45, total: 18125.00 },
  { id: 4, product: "Polyurethane Top Coat - High Gloss", qty: 12500, unit: "sq ft", unitPrice: 0.75, total: 9375.00 },
  { id: 5, product: "Joint Filling - Polyurea", qty: 450, unit: "ln ft", unitPrice: 2.25, total: 1012.50 },
];

const sidebarSections = [
  { id: "items", label: "Line Items", icon: Wallet, count: 5 },
  { id: "rooms", label: "Rooms", icon: Grid3X3, count: 3 },
  { id: "options", label: "Options", icon: Layers, count: 2 },
  { id: "notes", label: "Notes", icon: MessageSquare, count: 1 },
  { id: "approvals", label: "Approvals", icon: ListChecks, count: 0 },
];

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    draft: { bg: colors.cream, text: colors.textSecondary, border: colors.borderMedium, label: "Draft" },
    pending: { bg: colors.warningBg, text: colors.warning, border: colors.copperBorder, label: "Pending Approval" },
    approved: { bg: colors.successBg, text: colors.success, border: "#86EFAC", label: "Approved" },
    rejected: { bg: colors.errorBg, text: colors.error, border: "#FECACA", label: "Rejected" },
  };
  
  const style = statusStyles[status] || statusStyles.draft;
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
      style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.text }} />
      {style.label}
    </span>
  );
}

function ActionButton({ 
  children, 
  variant = "secondary",
  size = "default",
  icon: Icon,
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
  icon?: React.ElementType;
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150";
  const sizeStyles = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  
  const variantStyles = {
    primary: {
      backgroundColor: colors.copper,
      color: colors.white,
      border: "none",
    },
    secondary: {
      backgroundColor: colors.white,
      color: colors.textPrimary,
      border: `1px solid ${colors.borderMedium}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.textSecondary,
      border: "none",
    },
  };
  
  return (
    <button className={`${baseStyles} ${sizeStyles} hover:opacity-90`} style={variantStyles[variant]}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export default function DesignMockupPage() {
  const [activeSection, setActiveSection] = useState("items");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
      {/* Top Navigation Bar */}
      <header 
        className="h-14 flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: colors.graphite, borderColor: colors.graphiteDark }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: colors.copper, color: colors.white }}
            >
              FC
            </div>
            <span className="text-white font-semibold">FloorConnector</span>
          </div>
          <nav className="flex items-center gap-1 ml-8">
            {["Dashboard", "Leads", "Estimates", "Jobs", "Invoices"].map((item) => (
              <a
                key={item}
                href="#"
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  item === "Estimates" ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10">
            <Settings className="w-5 h-5" />
          </button>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: colors.copperLight, color: colors.white }}
          >
            JD
          </div>
        </div>
      </header>

      {/* Breadcrumb + Action Bar */}
      <div 
        className="h-12 flex items-center justify-between px-6 border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
      >
        <div className="flex items-center gap-2 text-sm">
          <a href="#" style={{ color: colors.textSecondary }} className="hover:underline">Estimates</a>
          <ChevronRight className="w-4 h-4" style={{ color: colors.textMuted }} />
          <span style={{ color: colors.textPrimary }} className="font-medium">{estimateData.id}</span>
          <StatusBadge status={estimateData.status} />
        </div>
        <div className="flex items-center gap-2">
          <ActionButton variant="ghost" size="sm" icon={Copy}>Duplicate</ActionButton>
          <ActionButton variant="ghost" size="sm" icon={Printer}>Print</ActionButton>
          <ActionButton variant="ghost" size="sm" icon={Download}>Export</ActionButton>
          <div className="w-px h-5 mx-1" style={{ backgroundColor: colors.borderLight }} />
          <ActionButton variant="secondary" size="sm" icon={Save}>Save Draft</ActionButton>
          <ActionButton variant="primary" size="sm" icon={Send}>Send to Customer</ActionButton>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className="w-56 border-r flex flex-col"
          style={{ backgroundColor: colors.white, borderColor: colors.borderLight, minHeight: "calc(100vh - 104px)" }}
        >
          {/* Estimate Info Summary */}
          <div className="p-4 border-b" style={{ borderColor: colors.borderLight }}>
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.cream }}
              >
                <Building2 className="w-5 h-5" style={{ color: colors.graphite }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>
                  {estimateData.customer}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: colors.textSecondary }}>
                  {estimateData.project}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span style={{ color: colors.textMuted }}>Created</span>
                <p style={{ color: colors.textPrimary }} className="font-medium">{estimateData.created}</p>
              </div>
              <div>
                <span style={{ color: colors.textMuted }}>Valid Until</span>
                <p style={{ color: colors.textPrimary }} className="font-medium">{estimateData.validUntil}</p>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <nav className="flex-1 p-2">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors"
                  style={{
                    backgroundColor: isActive ? colors.copperMuted : "transparent",
                    color: isActive ? colors.copper : colors.textSecondary,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1">{section.label}</span>
                  {section.count > 0 && (
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: isActive ? colors.copper : colors.cream,
                        color: isActive ? colors.white : colors.textSecondary,
                      }}
                    >
                      {section.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Totals Summary */}
          <div className="p-4 border-t" style={{ borderColor: colors.borderLight }}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Subtotal</span>
                <span style={{ color: colors.textPrimary }}>{formatCurrency(estimateData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Tax (8%)</span>
                <span style={{ color: colors.textPrimary }}>{formatCurrency(estimateData.tax)}</span>
              </div>
              <div 
                className="flex justify-between pt-2 border-t font-semibold"
                style={{ borderColor: colors.borderLight }}
              >
                <span style={{ color: colors.textPrimary }}>Total</span>
                <span style={{ color: colors.copper }}>{formatCurrency(estimateData.total)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Line Items</h2>
              <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                {lineItems.length} items totaling {formatCurrency(estimateData.subtotal)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton variant="secondary" size="sm" icon={Plus}>Add from Catalog</ActionButton>
              <ActionButton variant="secondary" size="sm" icon={Plus}>Custom Item</ActionButton>
            </div>
          </div>

          {/* Data Table */}
          <div 
            className="rounded-lg border overflow-hidden"
            style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.cream }}>
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                    Product / Service
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide w-24" style={{ color: colors.textSecondary }}>
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide w-20" style={{ color: colors.textSecondary }}>
                    Unit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide w-28" style={{ color: colors.textSecondary }}>
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide w-32" style={{ color: colors.textSecondary }}>
                    Total
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr 
                    key={item.id}
                    className="border-t transition-colors hover:bg-gray-50"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {item.product}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm" style={{ color: colors.textPrimary }}>
                        {item.qty.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm" style={{ color: colors.textPrimary }}>
                        {formatCurrency(item.unitPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {formatCurrency(item.total)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        style={{ color: colors.textMuted }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Add Row */}
          <button 
            className="w-full mt-2 py-3 border border-dashed rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:border-solid"
            style={{ 
              borderColor: colors.borderMedium, 
              color: colors.textSecondary,
              backgroundColor: "transparent",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Line Item
          </button>

          {/* Color Palette Reference */}
          <div className="mt-12 p-6 rounded-lg border" style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Graphite & Copper Color Palette Reference
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Graphite", hex: colors.graphite, text: "white" },
                { name: "Graphite Light", hex: colors.graphiteLight, text: "white" },
                { name: "Graphite Dark", hex: colors.graphiteDark, text: "white" },
                { name: "Copper", hex: colors.copper, text: "white" },
                { name: "Copper Light", hex: colors.copperLight, text: "white" },
                { name: "Copper Muted", hex: colors.copperMuted, text: colors.copper },
                { name: "Cream", hex: colors.cream, text: colors.textPrimary },
                { name: "White", hex: colors.white, text: colors.textPrimary },
                { name: "Text Primary", hex: colors.textPrimary, text: "white" },
                { name: "Text Secondary", hex: colors.textSecondary, text: "white" },
                { name: "Border Light", hex: colors.borderLight, text: colors.textPrimary },
                { name: "Success", hex: colors.success, text: "white" },
              ].map((color) => (
                <div key={color.name} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md border flex items-center justify-center text-xs font-mono"
                    style={{ backgroundColor: color.hex, color: color.text, borderColor: colors.borderLight }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{color.name}</p>
                    <p className="text-xs font-mono" style={{ color: colors.textSecondary }}>{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Button Variants */}
          <div className="mt-6 p-6 rounded-lg border" style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Button Variants
            </h3>
            <div className="flex items-center gap-4">
              <ActionButton variant="primary" icon={Send}>Primary Action</ActionButton>
              <ActionButton variant="secondary" icon={Save}>Secondary Action</ActionButton>
              <ActionButton variant="ghost" icon={Copy}>Ghost Action</ActionButton>
            </div>
          </div>

          {/* Status Badges */}
          <div className="mt-6 p-6 rounded-lg border" style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Status Badges
            </h3>
            <div className="flex items-center gap-4">
              <StatusBadge status="draft" />
              <StatusBadge status="pending" />
              <StatusBadge status="approved" />
              <StatusBadge status="rejected" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
