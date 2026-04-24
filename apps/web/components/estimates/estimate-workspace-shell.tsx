"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  FileText,
  FolderOpen,
  Lock,
  MoreVertical,
  NotebookPen,
  PackageCheck,
  RefreshCcw,
  ScrollText,
  Wallet,
  CheckSquare,
  Briefcase,
  Pencil
} from "lucide-react";

export type EstimateWorkspaceSectionId =
  | "details"
  | "items"
  | "terms"
  | "scope"
  | "bidding"
  | "files"
  | "cover-sheet"
  | "notes";

type EstimateWorkspaceShellProps = {
  title: string;
  subtitle?: string | null;
  estimateNumber?: string | null;
  statusLabel?: string | null;
  activeSection: EstimateWorkspaceSectionId;
  onSectionChange: (sectionId: EstimateWorkspaceSectionId) => void;
  children: ReactNode;
  statusStrip: ReactNode;
  headerActions?: ReactNode;
  saveStateLabel?: string;
  titleEditing?: boolean;
  onTitleEditToggle?: () => void;
  onTitleChange?: (value: string) => void;
  onTitleBlur?: () => void;
};

const sectionConfig: Array<{
  id: EstimateWorkspaceSectionId;
  label: string;
  icon: typeof FileText;
}> = [
  { id: "items", label: "Items", icon: Wallet },
  { id: "details", label: "Details", icon: FileText },
  { id: "terms", label: "Terms", icon: ScrollText },
  { id: "scope", label: "Scope of Work", icon: CheckSquare },
  { id: "bidding", label: "Bidding", icon: Briefcase },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "cover-sheet", label: "Cover Sheet", icon: PackageCheck },
  { id: "notes", label: "Notes", icon: NotebookPen }
];

function formatStatusBadge(statusLabel?: string | null) {
  if (!statusLabel) {
    return "DRAFT";
  }

  return statusLabel.toUpperCase();
}

export function EstimateWorkspaceShell({
  title,
  subtitle,
  estimateNumber,
  statusLabel,
  activeSection,
  onSectionChange,
  children,
  statusStrip,
  headerActions,
  saveStateLabel,
  titleEditing,
  onTitleEditToggle,
  onTitleChange,
  onTitleBlur
}: EstimateWorkspaceShellProps) {
  return (
    <div className="overflow-hidden border border-[#e6e9ef] bg-white">
      <div className="grid min-h-[calc(100vh-15rem)] grid-cols-[230px_minmax(0,1fr)] bg-[#f8f8f6]">
        <aside className="flex flex-col bg-[#28456f] text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <button type="button" className="inline-flex items-center gap-2 text-[15px] font-medium text-white/85">
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="rounded-[2px] p-1.5 text-white/70">
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </div>
          </div>

          <nav className="flex-1 py-2">
            {sectionConfig.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={[
                    "flex h-[46px] w-full items-center gap-4 px-4 text-left text-[15px]",
                    isActive
                      ? "bg-[#f4812a] font-medium text-white"
                      : "text-[#b8c7df] hover:bg-white/5 hover:text-white"
                  ].join(" ")}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col bg-white">
          <header className="border-b border-[#e6e9ef]">
            <div className="flex items-start justify-between gap-6 px-6 py-5">
              <div className="flex min-w-0 items-start gap-5">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[4px] border-[#f4812a] text-[#f4812a]">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="min-w-0 pt-1">
                  <div className="flex items-center gap-3">
                    {titleEditing ? (
                      <input
                        value={title}
                        onChange={(event) => onTitleChange?.(event.target.value)}
                        onBlur={onTitleBlur}
                        className="h-11 min-w-[320px] max-w-[520px] border border-[#d8deea] px-3 text-[20px] font-semibold text-[#23395d] outline-none"
                      />
                    ) : (
                      <h1 className="truncate text-[20px] font-semibold text-[#23395d]">{title}</h1>
                    )}
                    {onTitleEditToggle ? (
                      <button
                        type="button"
                        onClick={onTitleEditToggle}
                        className={[
                          "inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#e3e7ee] text-[#6b7c96] hover:bg-[#f7f8fb]",
                          titleEditing ? "bg-[#f7f8fb]" : ""
                        ].join(" ")}
                        title="Edit estimate title"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[14px] text-[#70819c]">
                  <span>{subtitle ?? "Project/Opportunity"}</span>
                  <span className="rounded-[6px] bg-[#fff1e4] px-3 py-1 text-[13px] font-medium text-[#f4812a]">
                    {formatStatusBadge(statusLabel)}
                  </span>
                  {estimateNumber ? <span>Estimate #{estimateNumber}</span> : null}
                </div>
                <p className="mt-2 text-[13px] text-[#8694ab]">
                  Items is the primary estimating workspace. Details, scope, files, and terms support
                  the build around it.
                </p>
              </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="pt-1">{statusStrip}</div>

                <div className="flex items-center gap-3 pt-3 text-[#6b7c96]">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-[6px] border border-[#e3e7ee] p-2.5 hover:bg-[#f7f8fb]"
                  >
                    <RefreshCcw className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Locking is not supported yet in the estimate backend."
                    className="rounded-[6px] border border-[#e3e7ee] p-2.5 text-[#b4bed0]"
                  >
                    <Lock className="h-5 w-5" />
                  </button>
                  <div>{headerActions ?? <MoreVertical className="h-5 w-5" />}</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-white">{children}</main>

          <footer className="border-t border-[#e6e9ef] bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] font-medium text-[#70819c]">
                {saveStateLabel ?? "All changes saved."}
              </p>
              <button
                type="submit"
                className="inline-flex min-w-[196px] items-center justify-center rounded-[6px] bg-[#f4812a] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#e47421]"
              >
                Save now
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
