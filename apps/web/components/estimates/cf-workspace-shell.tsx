"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  List,
  FileText,
  ClipboardList,
  Folder,
  FileSpreadsheet,
  StickyNote,
  Send,
  RefreshCw,
  Lock,
  MoreVertical,
  Calendar,
  Clock,
  User,
  FileDown,
  CheckSquare,
  Copy,
  Download,
  Upload,
  Trash2,
  Share2,
  Printer,
  DollarSign,
  Gavel,
  LayoutGrid
} from "lucide-react";
import { useState } from "react";

export type CFWorkspaceStage = {
  id: string;
  label: string;
  status: "active" | "pending" | "complete";
};

export type CFWorkspaceSection = {
  id: string;
  label: string;
  icon?: string;
};

type CFWorkspaceShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string | null;
  referenceNumber?: string | null;
  statusBadge?: string | null;
  stages?: CFWorkspaceStage[];
  sections: CFWorkspaceSection[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  createdAt?: string;
  createdTime?: string;
  createdBy?: string;
  onRefresh?: () => void;
  onLock?: () => void;
  onReviewSubmit?: () => void;
  children: ReactNode;
};

const sectionIcons: Record<string, typeof List> = {
  details: List,
  items: DollarSign,
  terms: FileText,
  "scope-of-work": ClipboardList,
  bidding: Gavel,
  files: Folder,
  "cover-sheet": FileSpreadsheet,
  notes: StickyNote
};

export function CFWorkspaceShell({
  backHref,
  backLabel,
  title,
  subtitle,
  referenceNumber,
  statusBadge,
  stages = [],
  sections,
  activeSection,
  onSectionChange,
  createdAt,
  createdTime,
  createdBy,
  onRefresh,
  onLock,
  onReviewSubmit,
  children
}: CFWorkspaceShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      {/* LEFT SIDEBAR - EXACT CF CLONE */}
      {/* Dark navy #1e3a5f, 200px width, flush edges */}
      <aside className="w-[200px] bg-[#1e3a5f] text-white flex flex-col shrink-0">
        {/* Back Link Row */}
        <div className="h-[44px] flex items-center px-4 border-b border-[#2d4a6f]">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-[13px] text-[#a3bbd9] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
          {/* Grid icon on right - CF has this */}
          <button className="ml-auto w-7 h-7 flex items-center justify-center text-[#a3bbd9] hover:text-white">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Section Nav - CF style with orange active highlight */}
        <nav className="flex-1 py-1 overflow-y-auto">
          {sections.map((section) => {
            const Icon = sectionIcons[section.id] ?? List;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange?.(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 h-[40px] text-[13px] font-medium transition-colors
                  ${isActive 
                    ? "bg-[#ef7d32] text-white" 
                    : "text-[#a3bbd9] hover:bg-[#2d4a6f] hover:text-white"
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Review and Submit Button - CF Orange */}
        <div className="p-3 border-t border-[#2d4a6f]">
          <button
            type="button"
            onClick={onReviewSubmit}
            className="w-full h-[44px] bg-[#ef7d32] hover:bg-[#e06a1f] text-white text-[14px] font-semibold rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Review and Submit
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER - EXACT CF CLONE */}
        {/* White background, border bottom, compact height */}
        <header className="h-[72px] bg-white border-b border-[#e1e4e8] px-5 flex items-center gap-4 shrink-0">
          {/* Left: Estimate Icon + Title Block */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Orange circle with document icon - EXACT CF */}
            <div className="w-[52px] h-[52px] rounded-full bg-[#fef3e8] border-[3px] border-[#ef7d32] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#ef7d32]" />
            </div>
            
            <div className="min-w-0 flex-1">
              {/* Title row */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[16px] font-semibold text-[#172b4d] truncate">{title}</h1>
              </div>
              {/* Subtitle row */}
              <div className="flex items-center gap-2 mt-0.5">
                {subtitle && (
                  <span className="text-[12px] text-[#6b778c]">{subtitle}</span>
                )}
                {statusBadge && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded bg-[#fef3e8] text-[#ef7d32] uppercase tracking-wide">
                    {statusBadge}
                  </span>
                )}
                {referenceNumber && (
                  <span className="text-[12px] text-[#6b778c]">EST. #{referenceNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Status Progression - EXACT CF with connected circles */}
          {stages.length > 0 && (
            <div className="hidden xl:flex items-center gap-0 shrink-0">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="flex items-center">
                  {/* Connector line BEFORE (except first) */}
                  {idx > 0 && (
                    <div 
                      className={`w-[40px] h-[2px] ${
                        stages[idx - 1].status === "complete" 
                          ? "bg-[#36b37e]" 
                          : "bg-[#dfe1e6]"
                      }`}
                    />
                  )}
                  
                  {/* Stage circle + label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-[36px] h-[36px] rounded-full flex items-center justify-center border-2
                        ${stage.status === "active" 
                          ? "bg-[#ef7d32] border-[#ef7d32]" 
                          : stage.status === "complete"
                            ? "bg-white border-[#36b37e]"
                            : "bg-white border-[#dfe1e6]"
                        }
                      `}
                    >
                      {stage.status === "complete" ? (
                        <svg className="w-4 h-4 text-[#36b37e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : stage.status === "active" ? (
                        <FileText className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#dfe1e6]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#6b778c] mt-1 whitespace-nowrap">
                      {stage.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Right: Action Icons - EXACT CF */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              className="w-[32px] h-[32px] flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#6b778c] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              onClick={onLock}
              className="w-[32px] h-[32px] flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#6b778c] transition-colors"
              title="Lock"
            >
              <Lock className="w-[18px] h-[18px]" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-[32px] h-[32px] flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#6b778c] transition-colors"
                title="More actions"
              >
                <MoreVertical className="w-[18px] h-[18px]" />
              </button>
              
              {/* Dropdown Menu - CF style */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-[36px] w-[220px] bg-white border border-[#e1e4e8] rounded shadow-lg z-50 py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] hover:bg-[#f4f5f7] transition-colors">
                      <FileDown className="w-4 h-4 text-[#6b778c]" />
                      View/Email PDF
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] hover:bg-[#f4f5f7] transition-colors">
                      <CheckSquare className="w-4 h-4 text-[#6b778c]" />
                      Submit for Approval
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] hover:bg-[#f4f5f7] transition-colors">
                      <Folder className="w-4 h-4 text-[#6b778c]" />
                      Generate a Project
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] hover:bg-[#f4f5f7] transition-colors">
                      <Copy className="w-4 h-4 text-[#6b778c]" />
                      Make a Copy
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] hover:bg-[#f4f5f7] transition-colors">
                      <Download className="w-4 h-4 text-[#6b778c]" />
                      Download Import Template
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] hover:bg-[#f4f5f7] transition-colors">
                      <Upload className="w-4 h-4 text-[#6b778c]" />
                      Export Items to CSV
                    </button>
                    <div className="border-t border-[#e1e4e8] my-1" />
                    <div className="px-4 py-2 flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#6b778c]">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-[#6b778c]">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f4f5f7] text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA - Full bleed, fills remaining space */}
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>

        {/* BOTTOM FOOTER - EXACT CF CLONE */}
        {/* White bg, border top, compact 48px height */}
        <footer className="h-[48px] bg-white border-t border-[#e1e4e8] px-5 flex items-center justify-between shrink-0">
          {/* Left: Created metadata */}
          <div className="flex items-center gap-4 text-[12px] text-[#6b778c]">
            <span className="font-semibold text-[#172b4d]">Created:</span>
            {createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {createdAt}
              </span>
            )}
            {createdTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {createdTime}
              </span>
            )}
            {createdBy && (
              <span className="flex items-center gap-1.5">
                By
                <User className="w-3.5 h-3.5" />
                {createdBy}
              </span>
            )}
          </div>

          {/* Right: Save as Template + Timeline */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[12px] text-[#6b778c] cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#dfe1e6] text-[#ef7d32] focus:ring-[#ef7d32]"
              />
              Save Estimate as Template
            </label>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#6b778c] border border-[#dfe1e6] rounded hover:bg-[#f4f5f7] transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
