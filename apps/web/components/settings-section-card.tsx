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
        "border bg-white p-6 sm:p-8",
        neutral
          ? "rounded-lg border-[#e2e5e9] shadow-[0_18px_44px_-38px_rgba(15,23,42,0.28)]"
          : "border-[#d9cdc2] shadow-[0_24px_80px_-46px_rgba(57,43,30,0.24)]"
      ].join(" ")}
    >
      <p
        className={[
          "text-[11px] font-semibold uppercase tracking-[0.24em]",
          neutral ? "text-[#6b7280]" : "text-[#a4581a]"
        ].join(" ")}
      >
        {eyebrow}
      </p>
      <h2
        className={[
          "mt-4 text-2xl font-semibold tracking-tight sm:text-3xl",
          neutral ? "text-[#111827]" : "text-[#2b2118]"
        ].join(" ")}
      >
        {title}
      </h2>
      <p
        className={[
          "mt-4 max-w-3xl text-sm leading-7",
          neutral ? "text-[#4b5563]" : "text-[#665446]"
        ].join(" ")}
      >
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </section>
  );
}
