import type { ReactNode } from "react";

type DetailPanelProps = {
  id?: string;
  title: string;
  description?: string;
  tone?: "soft" | "neutral";
  children: ReactNode;
};

export function DetailPanel({
  id,
  title,
  description,
  tone = "soft",
  children
}: DetailPanelProps) {
  const neutral = tone === "neutral";

  return (
    <section
      id={id}
      className="min-w-0 rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="space-y-2.5">
        <p
          className={[
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            neutral ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
          ].join(" ")}
        >
          {title}
        </p>
        {description ? (
          <p className="max-w-[65ch] text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        ) : null}
      </div>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}
