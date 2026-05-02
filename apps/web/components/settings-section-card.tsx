import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsSectionCard({
  eyebrow,
  title,
  description,
  children
}: SettingsSectionCardProps) {
  return (
    <section className="border border-[#d9cdc2] bg-white p-6 shadow-[0_24px_80px_-46px_rgba(57,43,30,0.24)] sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a4581a]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#2b2118] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#665446]">{description}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}
