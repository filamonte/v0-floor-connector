import type { ReactNode } from "react";
import Link from "next/link";

import { WorkspaceCommandBar } from "@/components/workspace-command-bar";

type ContractorWorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  headerTone?: "default" | "dark";
  summary?: ReactNode;
  ownership?: {
    owns: string;
    acts: string;
    configuration?: {
      href: string;
      label: string;
      detail: string;
    };
  };
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
  ownership,
  commandBar,
  children
}: ContractorWorkspacePageProps) {
  const darkHeader = headerTone === "dark";

  return (
    <div className="space-y-4">
      <section
        className={[
          "overflow-hidden rounded-[4px] border px-4 py-4 shadow-none sm:px-6",
          darkHeader
            ? "border-[#27272a] bg-[#09090b] text-white"
            : "border-[#d1d5db] bg-white"
        ].join(" ")}
      >
        <div
          className={[
            "-mx-4 -mt-4 mb-4 h-1 sm:-mx-6",
            darkHeader ? "bg-[#005eb8]" : "bg-[#005eb8]"
          ].join(" ")}
        />
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.22em]",
                darkHeader ? "text-[#8fc7ff]" : "text-[#005eb8]"
              ].join(" ")}
            >
              {eyebrow}
            </p>
            <h1
              className={[
                "mt-2 break-words text-[24px] font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-[28px]",
                darkHeader ? "text-white" : "text-[var(--text-primary)]"
              ].join(" ")}
            >
              {title}
            </h1>
            <p
              className={[
                "mt-2 max-w-4xl break-words text-sm leading-6 [overflow-wrap:anywhere]",
                darkHeader ? "text-gray-200" : "text-[var(--text-secondary)]"
              ].join(" ")}
            >
              {description}
            </p>
          </div>
          {summary ? (
            <div className="min-w-0 xl:max-w-[620px] xl:flex-shrink-0">
              {summary}
            </div>
          ) : null}
        </div>

        {ownership ? (
          <div
            className={[
              "mt-3 grid gap-px overflow-hidden rounded-[6px] border text-xs leading-5 sm:grid-cols-2",
              ownership.configuration ? "xl:grid-cols-3" : "",
              darkHeader
                ? "border-white/15 bg-white/15"
                : "border-[#d1d5db] bg-[#d1d5db]"
            ].join(" ")}
          >
            {[
              { label: "Owns", detail: ownership.owns },
              { label: "Act here", detail: ownership.acts }
            ].map((item) => (
              <div
                key={item.label}
                className={[
                  "min-w-0 px-3 py-2.5",
                  darkHeader ? "bg-white/[0.08]" : "bg-white"
                ].join(" ")}
              >
                <p
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.16em]",
                    darkHeader ? "text-[#8fc7ff]" : "text-[#005eb8]"
                  ].join(" ")}
                >
                  {item.label}
                </p>
                <p
                  className={[
                    "mt-1 break-words [overflow-wrap:anywhere]",
                    darkHeader
                      ? "text-gray-100"
                      : "text-[var(--text-secondary)]"
                  ].join(" ")}
                >
                  {item.detail}
                </p>
              </div>
            ))}
            {ownership.configuration ? (
              <Link
                href={ownership.configuration.href}
                className={[
                  "min-w-0 px-3 py-2.5 transition",
                  darkHeader
                    ? "bg-white/[0.08] text-gray-100 hover:bg-white/[0.13]"
                    : "bg-white text-[var(--text-secondary)] hover:bg-[var(--highlight)]"
                ].join(" ")}
              >
                <p
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.16em]",
                    darkHeader ? "text-[#8fc7ff]" : "text-[#005eb8]"
                  ].join(" ")}
                >
                  Configure in Settings
                </p>
                <p
                  className={[
                    "mt-1 font-semibold",
                    darkHeader ? "text-white" : "text-[var(--text-primary)]"
                  ].join(" ")}
                >
                  {ownership.configuration.label}
                </p>
                <p className="mt-1 break-words [overflow-wrap:anywhere]">
                  {ownership.configuration.detail}
                </p>
              </Link>
            ) : null}
          </div>
        ) : null}

        {commandBar ? (
          <div
            className={[
              "mt-3 border-t pt-3",
              darkHeader ? "border-white/12" : "border-[#e5e7eb]"
            ].join(" ")}
          >
            <WorkspaceCommandBar {...commandBar} embedded />
          </div>
        ) : null}
      </section>

      {children}
    </div>
  );
}
