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
      className={[
        "border p-5 sm:p-6",
        neutral
          ? "rounded-lg border-[var(--border-warm)] bg-white shadow-sm"
          : "rounded-lg border-[var(--border-warm)] bg-white shadow-sm"
      ].join(" ")}
    >
      <div className="space-y-2.5">
        <p
          className={[
            "text-[11px] font-semibold uppercase tracking-[0.26em]",
            neutral ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
          ].join(" ")}
        >
          {title}
        </p>
        {description ? (
          <p className="max-w-[65ch] text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
