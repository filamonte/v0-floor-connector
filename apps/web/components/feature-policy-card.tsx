import type { ReactNode } from "react";

type FeaturePolicyCardProps = {
  title: string;
  description: string | null;
  badges?: ReactNode;
  form: ReactNode;
};

export function FeaturePolicyCard({
  title,
  description,
  badges,
  form
}: FeaturePolicyCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_-42px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight text-slate-950">{title}</h3>
        {badges}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description ?? "No additional description has been added yet."}
      </p>
      <div className="mt-5">{form}</div>
    </section>
  );
}
