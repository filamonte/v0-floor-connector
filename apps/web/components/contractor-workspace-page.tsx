import type { ReactNode } from "react";

import { WorkspaceCommandBar } from "@/components/workspace-command-bar";

type ContractorWorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  headerTone?: "default" | "dark";
  summary?: ReactNode;
  commandBar?: {
    searchSlot?: ReactNode;
    filterSlot?: ReactNode;
    actionSlot?: ReactNode;
    supportSlot?: ReactNode;
  };
  children: ReactNode;
};

export function ContractorWorkspacePage({
  eyebrow,
  title,
  description,
  headerTone = "default",
  summary,
  commandBar,
  children
}: ContractorWorkspacePageProps) {
  const darkHeader = headerTone === "dark";

  return (
    <div className="space-y-3">
      <section
        className={[
          "overflow-hidden rounded-lg border px-4 py-3 shadow-[0_16px_44px_-38px_rgba(31,41,55,0.48)] sm:px-5",
          darkHeader
            ? "border-[var(--graphite)] bg-[linear-gradient(135deg,var(--graphite-dark)_0%,var(--graphite)_78%)] text-white"
            : "border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]"
        ].join(" ")}
      >
        <div
          className={[
            "-mx-4 -mt-3 mb-3 h-1 sm:-mx-5",
            darkHeader ? "bg-[var(--copper)]" : "bg-[var(--graphite)]"
          ].join(" ")}
        />
        <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.22em]",
                darkHeader
                  ? "text-[var(--copper-light)]"
                  : "text-[var(--copper)]"
              ].join(" ")}
            >
              {eyebrow}
            </p>
            <h1
              className={[
                "mt-1 text-[20px] font-semibold tracking-tight sm:text-[22px]",
                darkHeader ? "text-white" : "text-[var(--text-primary)]"
              ].join(" ")}
            >
              {title}
            </h1>
            <p
              className={[
                "mt-1 max-w-4xl text-[13px] leading-5",
                darkHeader ? "text-gray-200" : "text-[var(--text-secondary)]"
              ].join(" ")}
            >
              {description}
            </p>
          </div>
          {summary ? (
            <div className="xl:max-w-[560px] xl:flex-shrink-0">{summary}</div>
          ) : null}
        </div>
      </section>

      {commandBar ? <WorkspaceCommandBar {...commandBar} /> : null}

      {children}
    </div>
  );
}
