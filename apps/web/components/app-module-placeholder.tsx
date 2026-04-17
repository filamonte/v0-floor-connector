import { AppEmptyState } from "@/components/app-empty-state";

type AppModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AppModulePlaceholder({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel
}: AppModulePlaceholderProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
      <AppEmptyState
        eyebrow={eyebrow}
        title={title}
        description={description}
        actionHref={actionHref}
        actionLabel={actionLabel}
      />
    </section>
  );
}
