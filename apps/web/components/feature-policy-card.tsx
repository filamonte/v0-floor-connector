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
    <section className="overflow-hidden rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_48px_-40px_rgba(34,26,20,0.28)]">
      <div className="h-1 bg-[linear-gradient(90deg,var(--graphite),var(--copper))]" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
          {badges}
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {description ?? "No additional description has been added yet."}
        </p>
        <div className="mt-5 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4">
          {form}
        </div>
      </div>
    </section>
  );
}
