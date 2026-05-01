"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Briefcase,
  CheckSquare,
  CircleDollarSign,
  ClipboardList,
  FileText,
  FolderKanban,
  FolderOpen,
  HardHat,
  Home,
  Layers3,
  NotebookPen,
  Package,
  PackageCheck,
  ReceiptText,
  ScrollText,
  Send,
  type LucideIcon,
  Wallet,
  Wrench
} from "lucide-react";

export type StandardWorkspaceIconName =
  | "briefcase"
  | "check-square"
  | "circle-dollar-sign"
  | "clipboard-list"
  | "file-text"
  | "folder-kanban"
  | "folder-open"
  | "hard-hat"
  | "home"
  | "layers-3"
  | "notebook-pen"
  | "package"
  | "package-check"
  | "receipt-text"
  | "scroll-text"
  | "send"
  | "wallet"
  | "wrench";

const iconMap: Record<StandardWorkspaceIconName, LucideIcon> = {
  briefcase: Briefcase,
  "check-square": CheckSquare,
  "circle-dollar-sign": CircleDollarSign,
  "clipboard-list": ClipboardList,
  "file-text": FileText,
  "folder-kanban": FolderKanban,
  "folder-open": FolderOpen,
  "hard-hat": HardHat,
  home: Home,
  "layers-3": Layers3,
  "notebook-pen": NotebookPen,
  package: Package,
  "package-check": PackageCheck,
  "receipt-text": ReceiptText,
  "scroll-text": ScrollText,
  send: Send,
  wallet: Wallet,
  wrench: Wrench
};

export type StandardWorkspaceSidebarItem<TView extends string> = {
  id: TView;
  label: string;
  iconName: StandardWorkspaceIconName;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
};

export type StandardWorkspaceLayoutProps<TView extends string> = {
  header: {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
  };
  sidebar?: Array<StandardWorkspaceSidebarItem<TView>>;
  currentView?: TView;
  summaryBand?: ReactNode;
  commandBar?: ReactNode;
  children: ReactNode;
};

export function StandardWorkspaceLayout<TView extends string>({
  header,
  sidebar,
  currentView,
  summaryBand,
  commandBar,
  children
}: StandardWorkspaceLayoutProps<TView>) {
  const hasSidebar = Boolean(sidebar && sidebar.length > 0);
  const [hashView, setHashView] = useState<TView | undefined>(undefined);

  useEffect(() => {
    if (currentView || typeof window === "undefined") {
      return;
    }

    const updateHashView = () => {
      const hash = window.location.hash.replace(/^#/, "");

      if (!hash) {
        setHashView(sidebar?.[0]?.id);
        return;
      }

      const matchingItem = sidebar?.find((item) => item.href === `#${hash}`);
      setHashView(matchingItem?.id);
    };

    updateHashView();
    window.addEventListener("hashchange", updateHashView);

    return () => {
      window.removeEventListener("hashchange", updateHashView);
    };
  }, [currentView, sidebar]);

  const activeView = currentView ?? hashView;

  return (
    <div className="space-y-2">
      {/* Page header bar - matches CF white panel with eyebrow/title/description pattern */}
      <section className="border border-[#e2dcd5] bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            {header.eyebrow ? (
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
                {header.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 whitespace-normal break-words text-[20px] font-semibold leading-tight tracking-tight text-[#221a14] [overflow-wrap:anywhere] sm:text-[22px]">
              {header.title}
            </h2>
            {header.description ? (
              <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#5f564d]">
                {header.description}
              </p>
            ) : null}
          </div>
          {header.actions ? (
            <div className="xl:max-w-[420px] xl:flex-shrink-0 xl:self-start">{header.actions}</div>
          ) : null}
        </div>
      </section>

      {summaryBand}
      {commandBar}

      {/* Main content area with optional left sidebar - matches CF icon sidebar pattern */}
      <section className="overflow-hidden border border-[#e2dcd5] bg-white">
        <div
          className={[
            "grid min-h-[580px] bg-white",
            hasSidebar ? "grid-cols-1 lg:grid-cols-[52px_minmax(0,1fr)]" : "grid-cols-1"
          ].join(" ")}
        >
          {/* Left icon sidebar - matches CF vertical icon-only nav pattern */}
          {hasSidebar ? (
            <aside className="border-b border-[#e2dcd5] bg-[#2f3d33] px-1 py-2 lg:border-b-0 lg:border-r lg:border-[#3d4d41]">
              <div className="flex justify-center gap-1 overflow-x-auto lg:flex-col lg:items-center lg:gap-0.5 lg:overflow-visible">
                {sidebar?.map((item) => {
                  const Icon = iconMap[item.iconName];
                  const active = item.id === activeView;
                  const className = [
                    "group relative inline-flex h-10 w-10 items-center justify-center text-white transition",
                    active
                      ? "bg-[#ef7d32]"
                      : "hover:bg-[#3d4d41]"
                  ].join(" ");

                  if (item.href && !item.disabled) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={(event) => {
                          if (item.id === activeView) {
                            event.preventDefault();
                            return;
                          }
                          item.onSelect?.();
                          if (!currentView) {
                            setHashView(item.id);
                          }
                        }}
                        title={item.label}
                        aria-label={item.label}
                        className={className}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded bg-[#221a14] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
                          {item.label}
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === activeView) {
                          return;
                        }

                        item.onSelect?.();
                      }}
                      title={item.label}
                      aria-label={item.label}
                      disabled={item.disabled}
                      className={[
                        className,
                        item.disabled ? "cursor-not-allowed opacity-50" : ""
                      ].join(" ")}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                        <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded bg-[#221a14] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
                          {item.label}
                        </span>
                      </button>
                  );
                })}
              </div>
            </aside>
          ) : null}

          <div className="min-w-0 bg-white">{children}</div>
        </div>
      </section>
    </div>
  );
}
