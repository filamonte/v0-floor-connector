type AppModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AppModulePlaceholder({
  eyebrow,
  title,
  description
}: AppModulePlaceholderProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </section>
  );
}
