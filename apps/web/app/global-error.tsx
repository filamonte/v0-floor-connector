"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10">
          <div className="rounded-3xl border border-rose-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">
              Fatal Error
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              FloorConnector could not render this request
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              A root-level application error interrupted the request. Refresh the
              page after checking the current environment configuration.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
