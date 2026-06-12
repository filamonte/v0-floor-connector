type AppShellProps = {
  title: string;
  description: string;
  status?: "unconfigured" | "connected" | "error";
  statusDetail?: string;
};

const statusStyles = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-amber-200 bg-amber-50 text-amber-700",
  unconfigured: "border-slate-200 bg-slate-100 text-slate-700"
} as const;

export function AppShell({
  title,
  description,
  status = "unconfigured",
  statusDetail
}: AppShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-6 py-16">
      <section className="w-full max-w-3xl rounded-[6px] border border-slate-300 bg-white p-10 shadow-none">
        <div className="mb-6 inline-flex rounded-[4px] bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          Monorepo scaffold
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
        <div
          className={`mt-8 rounded-[6px] border px-4 py-3 ${statusStyles[status]}`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">
            Supabase status: {status}
          </p>
          <p className="mt-2 text-sm leading-6">
            {statusDetail ?? "Configure your environment variables to connect."}
          </p>
        </div>
      </section>
    </main>
  );
}
