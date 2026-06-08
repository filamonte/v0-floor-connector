import type { ReactNode } from "react";

type DetailPanelProps = {
  id?: string;
  title: string;
  description?: string;
  tone?: "soft" | "neutral";
  collapsed?: boolean;
  children: ReactNode;
};

export function DetailPanel({
  id,
  title,
  description,
  tone = "soft",
  collapsed = false,
  children
}: DetailPanelProps) {
  const neutral = tone === "neutral";
  const panelClassName =
    "min-w-0 rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-sm sm:p-5";
  const eyebrowClassName = [
    "text-[11px] font-semibold uppercase tracking-[0.18em]",
    neutral ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
  ].join(" ");
  const header = (
    <div className="space-y-2.5">
      <h2 className={eyebrowClassName}>{title}</h2>
      {description ? (
        <p className="max-w-[65ch] text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );

  if (collapsed) {
    return (
      <details id={id} className={`${panelClassName} group`}>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
          {header}
          <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="mt-5 min-w-0">{children}</div>
      </details>
    );
  }

  return (
    <section id={id} className={panelClassName}>
      {header}
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}
