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
    <section className="rounded-[2rem] border border-[#e3d6c7] bg-white/94 p-8 shadow-[0_24px_80px_-40px_rgba(57,43,30,0.28)] backdrop-blur sm:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a4581a]">
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
