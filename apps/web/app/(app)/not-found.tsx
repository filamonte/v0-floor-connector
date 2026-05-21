import Link from "next/link";

export default function ProtectedAppNotFound() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
        Record not found
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        This record is not available in your workspace
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        The page may have been removed, may belong to a different organization,
        or the link may no longer be valid.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Go to dashboard
        </Link>
        <Link
          href="/projects"
          className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Review projects
        </Link>
      </div>
    </section>
  );
}
