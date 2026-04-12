"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="rounded-3xl border border-rose-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">
          Application Error
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Something went wrong
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          The application hit an unexpected error while rendering this page.
        </p>
        {error.message ? (
          <pre className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm text-slate-100">
            {error.message}
          </pre>
        ) : null}
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
