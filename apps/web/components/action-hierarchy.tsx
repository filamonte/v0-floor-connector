import type { ReactNode } from "react";

export const primaryActionClassName =
  "inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--copper)] bg-[var(--copper)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--copper-light)]";

export const secondaryActionClassName =
  "inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--highlight)]";

export const overflowActionClassName =
  "block w-full px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]";

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
        className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-[4px] border border-[var(--border-warm)] bg-white text-lg font-semibold leading-none text-[var(--text-primary)] transition hover:bg-[var(--highlight)] marker:hidden [&::-webkit-details-marker]:hidden"
      >
        <span aria-hidden="true">⋯</span>
      </summary>
      <div
        className={[
          "absolute top-10 z-20 min-w-44 overflow-hidden rounded-[4px] border border-[var(--border-warm)] bg-white py-1 shadow-lg",
          align === "right" ? "right-0" : "left-0"
        ].join(" ")}
      >
        {children}
      </div>
    </details>
  );
}
