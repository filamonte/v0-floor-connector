"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  void error;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="rounded-3xl border border-rose-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">
          Page error
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          We could not load this page
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Try again, or use Need help if this keeps happening during early access.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-900"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
