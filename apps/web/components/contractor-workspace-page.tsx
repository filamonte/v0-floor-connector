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
    <div className="space-y-2">
      <section
        className={[
          "border px-4 py-2.5 sm:px-5",
          darkHeader
            ? "border-[var(--graphite)] bg-[var(--graphite)] text-white"
            : "border-[var(--border-warm)] bg-white"
        ].join(" ")}
      >
        <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.22em]",
                darkHeader ? "text-gray-300" : "text-[var(--text-secondary)]"
              ].join(" ")}
            >
              {eyebrow}
            </p>
            <h2
              className={[
                "mt-1 text-[20px] font-semibold tracking-tight sm:text-[22px]",
                darkHeader ? "text-white" : "text-[var(--text-primary)]"
              ].join(" ")}
            >
              {title}
            </h2>
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
