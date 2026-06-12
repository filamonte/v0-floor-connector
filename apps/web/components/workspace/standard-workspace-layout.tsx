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
  supportArea?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
};

export function StandardWorkspaceLayout<TView extends string>({
  header,
  sidebar,
  currentView,
  summaryBand,
  commandBar,
  supportArea,
  contentClassName,
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
    <div className="space-y-4">
      <section className="border border-[#d1d5db] bg-white px-4 py-4 shadow-none sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            {header.eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
                {header.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 whitespace-normal break-words text-[26px] font-semibold leading-tight tracking-tight text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-[30px]">
              {header.title}
            </h1>
            {header.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                {header.description}
              </p>
            ) : null}
          </div>
          {header.actions ? (
            <div className="xl:max-w-[420px] xl:flex-shrink-0 xl:self-start">
              {header.actions}
            </div>
          ) : null}
        </div>
      </section>

      {summaryBand}
      {commandBar}

      <section className="overflow-hidden border border-[#d1d5db] bg-white shadow-none">
        <div
          className={[
            "grid min-h-[620px] bg-[#f4f4f5]",
            hasSidebar
              ? "grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)]"
              : "grid-cols-1"
          ].join(" ")}
        >
          {hasSidebar ? (
            <aside className="border-b border-[#d1d5db] bg-[#f9fafb] px-3 py-3 lg:sticky lg:top-[8.5rem] lg:max-h-[calc(100vh-9.5rem)] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <p className="hidden px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] lg:block">
                Workspace sections
              </p>
              <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {sidebar?.map((item) => {
                  const Icon = iconMap[item.iconName];
                  const active = item.id === activeView;
                  const className = [
                    "inline-flex min-h-11 min-w-fit items-center justify-center gap-2 rounded-[4px] border px-3 py-2 transition lg:w-full lg:justify-start",
                    active
                      ? "border-[#005eb8] bg-white text-[#003d7c] shadow-[inset_3px_0_0_#005eb8]"
                      : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[#c7d2e2] hover:bg-white hover:text-[var(--text-primary)]"
                  ].join(" ");

                  if (item.href && !item.disabled) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={(event) => {
                          if (
                            item.id === activeView &&
                            item.href?.startsWith("#")
                          ) {
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
                        aria-current={active ? "page" : undefined}
                        data-active={active ? "true" : undefined}
                        className={className}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                        <span className="whitespace-nowrap text-left text-[12px] font-semibold leading-4 [overflow-wrap:anywhere] lg:whitespace-normal">
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
                      aria-current={active ? "page" : undefined}
                      data-active={active ? "true" : undefined}
                      disabled={item.disabled}
                      className={[
                        className,
                        item.disabled ? "cursor-not-allowed opacity-50" : ""
                      ].join(" ")}
                    >
                      <Icon className="h-[15px] w-[15px]" />
                      <span className="whitespace-nowrap text-left text-[12px] font-semibold leading-4 [overflow-wrap:anywhere] lg:whitespace-normal">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          ) : null}

          <div
            className={[
              "min-w-0 bg-white",
              supportArea
                ? "grid gap-5 bg-[#f4f4f5] p-4 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px] sm:p-6"
                : "",
              contentClassName
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="min-w-0">{children}</div>
            {supportArea ? (
              <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
                {supportArea}
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
