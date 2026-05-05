import type { ReactNode } from "react";

export const primaryActionClassName =
  "inline-flex h-9 items-center justify-center rounded-[4px] border border-[#ef7d32] bg-[#ef7d32] px-3 text-sm font-semibold text-white transition hover:bg-[#de6c22]";

export const secondaryActionClassName =
  "inline-flex h-9 items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

export const overflowActionClassName =
  "block w-full px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950";

type ActionOverflowMenuProps = {
  children: ReactNode;
  label?: string;
  align?: "left" | "right";
};

export function ActionOverflowMenu({
  children,
  label = "More actions",
  align = "right"
}: ActionOverflowMenuProps) {
  return (
    <details className="group relative inline-flex">
      <summary
        aria-label={label}
        className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white text-lg font-semibold leading-none text-slate-700 transition hover:bg-slate-50 marker:hidden [&::-webkit-details-marker]:hidden"
      >
        <span aria-hidden="true">⋯</span>
      </summary>
      <div
        className={[
          "absolute top-10 z-20 min-w-44 overflow-hidden rounded-[4px] border border-slate-200 bg-white py-1 shadow-lg",
          align === "right" ? "right-0" : "left-0"
        ].join(" ")}
      >
        {children}
      </div>
    </details>
  );
}
