import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Not Found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          This page does not exist
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          The route you requested is not available in the current FloorConnector
          foundation.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-900"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
