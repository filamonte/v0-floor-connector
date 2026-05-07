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
        "border p-7 sm:p-8",
        neutral
          ? "rounded-lg border-[#e2e5e9] bg-white shadow-[0_16px_40px_-36px_rgba(15,23,42,0.24)]"
          : "rounded-[2rem] border-slate-200/90 bg-white/88 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.32)] backdrop-blur"
      ].join(" ")}
    >
      <div className="space-y-2.5">
        <p
          className={[
            "text-[11px] font-semibold uppercase tracking-[0.26em]",
            neutral ? "text-[#6b7280]" : "text-brand-700"
          ].join(" ")}
        >
          {title}
        </p>
        {description ? (
          <p className="max-w-[65ch] text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
