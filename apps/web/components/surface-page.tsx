type SurfacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SurfacePage({
  eyebrow,
  title,
  description
}: SurfacePageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="max-w-3xl rounded-3xl border border-[var(--border-warm)] bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(34,26,20,0.35)] backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--copper)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
          {description}
        </p>
      </div>
    </main>
  );
}
