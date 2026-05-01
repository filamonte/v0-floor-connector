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
    <div className="space-y-3">
      <section className="border border-[#d7c7b4] bg-[#fbf7f1] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            {header.eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                {header.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 whitespace-normal break-words text-[22px] font-semibold leading-tight tracking-tight text-[#2b2118] [overflow-wrap:anywhere] sm:text-[24px]">
              {header.title}
            </h2>
            {header.description ? (
              <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#665446]">
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

      <section className="overflow-hidden border border-[#d7dce4] bg-white">
        <div
          className={[
            "grid min-h-[620px] bg-white",
            hasSidebar ? "grid-cols-1 lg:grid-cols-[184px_minmax(0,1fr)]" : "grid-cols-1"
          ].join(" ")}
        >
          {hasSidebar ? (
            <aside className="border-b border-[#dfe4ec] bg-[#f6f7f9] px-2 py-2 lg:border-b-0 lg:border-r">
              <div className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
                {sidebar?.map((item) => {
                  const Icon = iconMap[item.iconName];
                  const active = item.id === activeView;
                  const className = [
                    "inline-flex h-10 min-w-[44px] items-center justify-center gap-2 border px-3 text-[#4d5f79] transition lg:w-full lg:justify-start",
                    active
                      ? "border-[#d8731f] bg-[#d8731f] text-white"
                      : "border-[#d4dbe5] bg-white hover:border-[#c6d0dd] hover:bg-[#f0f3f7]"
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
                        <Icon className="h-[15px] w-[15px]" />
                        <span className="hidden whitespace-normal break-words text-left text-[12px] font-semibold leading-4 [overflow-wrap:anywhere] lg:inline">
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
                      <Icon className="h-[15px] w-[15px]" />
                      <span className="hidden whitespace-normal break-words text-left text-[12px] font-semibold leading-4 [overflow-wrap:anywhere] lg:inline">
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
