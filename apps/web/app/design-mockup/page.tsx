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
  copperBorder: "#FCD34D",
  
  // Backgrounds
  cream: "#FAFAF8",
  white: "#FFFFFF",
  
  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  
  // Borders
  borderLight: "#E8E6E1",
  borderMedium: "#D9D5CD",
  
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

// Alternative highlight/selection colors (to replace Copper Muted)
const highlightOptions = {
  // Option A: Soft Graphite - keeps it neutral, no copper association
  softGraphite: { bg: "#F3F4F6", text: "#374151", name: "Soft Graphite" },
  
  // Option B: Warm Stone - earthy, subtle warmth without being orange
  warmStone: { bg: "#F5F5F4", text: "#57534E", name: "Warm Stone" },
  
  // Option C: Slate Blue - adds a cool professional contrast
  slateBlue: { bg: "#F1F5F9", text: "#475569", name: "Slate Blue" },
  
  // Option D: Sage Tint - subtle green, natural/organic feel
  sageTint: { bg: "#F0FDF4", text: "#166534", name: "Sage Tint" },
  
  // Option E: Cream Emphasis - just slightly warmer cream
  creamEmphasis: { bg: "#FEFCE8", text: "#854D0E", name: "Cream Emphasis" },
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
  // Locked selections based on user preferences
  const selectedHighlight = "softGraphite";
  const selectedHeaderStyle = "A";
  const selectedIconStyle = "B"; // Circular backgrounds

  // Header style configurations
  const headerStyles = {
    A: { name: "Dark Graphite Bar", description: "Full dark header with copper logo accent" },
    B: { name: "Light with Dark Accent", description: "White header with graphite left section" },
    C: { name: "Minimal Light", description: "Clean white header, subtle borders" },
    D: { name: "Two-Tone Split", description: "Dark logo area, light navigation" },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };
  
  const currentHighlight = highlightOptions[selectedHighlight];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
      
      {/* ============================================ */}
      {/* DESIGN SELECTIONS - SUMMARY */}
      {/* ============================================ */}
      <div 
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{ backgroundColor: colors.white, borderColor: colors.borderMedium }}
      >
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                FloorConnector Design System
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Header: Dark Graphite Bar | Highlight: Soft Graphite | Icons: Circular | Border: Warm Gray
              </p>
            </div>
            <span 
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{ backgroundColor: colors.infoBg, color: colors.info }}
            >
              Finalized Design
            </span>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* HEADER DESIGN - FINALIZED */}
      {/* ============================================ */}
      <div className="px-6 py-8 border-b" style={{ borderColor: colors.borderLight }}>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: colors.textSecondary }}>
          Header: Dark Graphite Bar
        </h2>
        <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
          Full dark header with copper logo accent and navigation
        </p>
        
        {/* Header A: Dark Graphite Bar - ONLY OPTION SHOWN */}
        {selectedHeaderStyle === "A" && (
          <header 
            className="h-14 flex items-center justify-between px-4 border-b rounded-t-lg"
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
        )}
        
        {/* Header B: Light with Dark Accent */}
        {selectedHeaderStyle === "B" && (
          <header 
            className="h-14 flex items-center border-b rounded-t-lg overflow-hidden"
            style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
          >
            <div 
              className="h-full px-4 flex items-center gap-2"
              style={{ backgroundColor: colors.graphite }}
            >
              <div 
                className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: colors.copper, color: colors.white }}
              >
                FC
              </div>
              <span className="text-white font-semibold text-sm">FloorConnector</span>
            </div>
            <nav className="flex items-center gap-1 ml-6">
              {["Dashboard", "Leads", "Estimates", "Jobs", "Invoices"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-3 py-1.5 text-sm rounded-md transition-colors"
                  style={{
                    backgroundColor: item === "Estimates" ? currentHighlight.bg : "transparent",
                    color: item === "Estimates" ? colors.textPrimary : colors.textSecondary,
                    fontWeight: item === "Estimates" ? 500 : 400,
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3 ml-auto pr-4">
              <button className="p-2 rounded-md hover:bg-gray-100" style={{ color: colors.textSecondary }}>
                <Settings className="w-5 h-5" />
              </button>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: colors.graphite, color: colors.white }}
              >
                JD
              </div>
            </div>
          </header>
        )}
        
        {/* Header C: Minimal Light */}
        {selectedHeaderStyle === "C" && (
          <header 
            className="h-14 flex items-center justify-between px-4 border rounded-t-lg"
            style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: colors.graphite, color: colors.white }}
                >
                  FC
                </div>
                <span className="font-semibold" style={{ color: colors.textPrimary }}>FloorConnector</span>
              </div>
              <div className="w-px h-6" style={{ backgroundColor: colors.borderLight }} />
              <nav className="flex items-center gap-1">
                {["Dashboard", "Leads", "Estimates", "Jobs", "Invoices"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="px-3 py-1.5 text-sm rounded-md transition-colors"
                    style={{
                      color: item === "Estimates" ? colors.copper : colors.textSecondary,
                      fontWeight: item === "Estimates" ? 600 : 400,
                      borderBottom: item === "Estimates" ? `2px solid ${colors.copper}` : "2px solid transparent",
                    }}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md hover:bg-gray-100" style={{ color: colors.textSecondary }}>
                <Settings className="w-5 h-5" />
              </button>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: colors.cream, color: colors.textPrimary, borderColor: colors.borderMedium }}
              >
                JD
              </div>
            </div>
          </header>
        )}
        
        {/* Header D: Two-Tone Split */}
        {selectedHeaderStyle === "D" && (
          <header 
            className="h-14 flex items-center rounded-t-lg overflow-hidden border"
            style={{ borderColor: colors.borderLight }}
          >
            <div 
              className="h-full px-5 flex items-center gap-3"
              style={{ backgroundColor: colors.graphiteDark }}
            >
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: colors.copper, color: colors.white }}
              >
                FC
              </div>
              <div>
                <span className="text-white font-semibold text-sm block leading-tight">FloorConnector</span>
                <span className="text-white/50 text-xs">Pro</span>
              </div>
            </div>
            <div className="flex-1 h-full flex items-center justify-between px-4" style={{ backgroundColor: colors.cream }}>
              <nav className="flex items-center gap-1">
                {["Dashboard", "Leads", "Estimates", "Jobs", "Invoices"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="px-3 py-1.5 text-sm rounded-md transition-colors"
                    style={{
                      backgroundColor: item === "Estimates" ? colors.white : "transparent",
                      color: item === "Estimates" ? colors.textPrimary : colors.textSecondary,
                      fontWeight: item === "Estimates" ? 500 : 400,
                      boxShadow: item === "Estimates" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-md hover:bg-white" style={{ color: colors.textSecondary }}>
                  <Settings className="w-5 h-5" />
                </button>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: colors.graphite, color: colors.white }}
                >
                  JD
                </div>
              </div>
            </div>
          </header>
        )}
      </div>

      {/* ============================================ */}
      {/* ICON STYLE - FINALIZED (CIRCULAR) */}
      {/* ============================================ */}
      <div className="px-6 py-8 border-b" style={{ borderColor: colors.borderLight, backgroundColor: colors.white }}>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: colors.textSecondary }}>
          Icon Style: Circular Backgrounds
        </h2>
        <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
          Icons with circular background containers for better visual weight and touch targets
        </p>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Option 2: With Background Circles - SELECTED */}
          <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.cream }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
              B: Circular Backgrounds (Selected)
            </h3>
          <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
              B: Circular Backgrounds
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ backgroundColor: currentHighlight.bg }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.graphite }}>
                  <Wallet className="w-4 h-4" style={{ color: colors.white }} />
                </div>
                <span className="text-sm font-medium" style={{ color: currentHighlight.text }}>Line Items</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
                  <Grid3X3 className="w-4 h-4" style={{ color: colors.textSecondary }} />
                </div>
                <span className="text-sm" style={{ color: colors.textSecondary }}>Rooms</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
                <FileText className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
                <Users className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
                <Calendar className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.copper }}>
                <Plus className="w-4 h-4" style={{ color: colors.white }} />
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: colors.textMuted }}>
              More visual weight. Better touch targets.
            </p>
          </div>
        </div>
      </div>
      {/* ============================================ */}
      {/* LIVE PREVIEW SECTION */}
      {/* ============================================ */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: colors.textSecondary }}>
          Live Preview: Estimate Workspace
        </h2>
        <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
          See your selected highlight color applied in context
        </p>
      </div>

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
                    backgroundColor: isActive ? currentHighlight.bg : "transparent",
                    color: isActive ? currentHighlight.text : colors.textSecondary,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1">{section.label}</span>
                  {section.count > 0 && (
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: isActive ? colors.graphite : colors.cream,
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
                { name: "Cream", hex: colors.cream, text: colors.textPrimary },
                { name: "White", hex: colors.white, text: colors.textPrimary },
                { name: "Text Primary", hex: colors.textPrimary, text: "white" },
                { name: "Text Secondary", hex: colors.textSecondary, text: "white" },
                { name: "Border Light", hex: colors.borderLight, text: colors.textPrimary },
                { name: "Success", hex: colors.success, text: "white" },
                { name: "Error", hex: colors.error, text: "white" },
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
            
            {/* Selected Highlight Color */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                Selected Highlight Color (Active/Selection State)
              </h4>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-md border flex items-center justify-center"
                  style={{ backgroundColor: currentHighlight.bg, borderColor: currentHighlight.text }}
                >
                  <Check className="w-6 h-6" style={{ color: currentHighlight.text }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{currentHighlight.name}</p>
                  <p className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                    Background: {currentHighlight.bg}
                  </p>
                  <p className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                    Text: {currentHighlight.text}
                  </p>
                </div>
              </div>
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
