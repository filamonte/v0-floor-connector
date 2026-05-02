type AppLoadingStateProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function AppLoadingState({
  eyebrow = "Loading",
  title = "Preparing your workspace",
  description = "We are loading the latest organization-scoped data for this screen."
}: AppLoadingStateProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#f8f8f8_0%,#f8f8f8_100%)]"
          />
        ))}
      </div>
    </div>
  );
}
