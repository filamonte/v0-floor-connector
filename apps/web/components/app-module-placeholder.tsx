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
    <section className="rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-sm sm:p-5">
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
