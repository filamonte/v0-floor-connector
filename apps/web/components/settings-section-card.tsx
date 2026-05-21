import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: "warm" | "neutral";
  children: ReactNode;
};

export function SettingsSectionCard({
  id,
  eyebrow,
  title,
  description,
  tone = "warm",
  children
}: SettingsSectionCardProps) {
  const neutral = tone === "neutral";

  return (
    <section
      id={id}
      className={[
        "overflow-hidden rounded-lg border bg-white shadow-[0_22px_60px_-44px_rgba(34,26,20,0.32)]",
        neutral ? "border-slate-200" : "border-[var(--border-warm)]"
      ].join(" ")}
    >
      <div
        className={[
          "h-1",
          neutral
            ? "bg-[linear-gradient(90deg,var(--graphite),#64748b)]"
            : "bg-[linear-gradient(90deg,var(--graphite),var(--copper))]"
        ].join(" ")}
      />
      <div className="p-6 sm:p-8">
        <p
          className={[
            "text-[11px] font-semibold uppercase tracking-[0.24em]",
            neutral ? "text-[var(--text-tertiary)]" : "text-[var(--copper)]"
          ].join(" ")}
        >
          {eyebrow}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
