import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  error?: string;
  message?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  error,
  message
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Authentication Foundation
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {description}
          </p>
          <div className="mt-10">{children}</div>
          {footer ? <div className="mt-8 text-sm text-slate-600">{footer}</div> : null}
        </section>

        <aside className="rounded-3xl border border-brand-100 bg-brand-50/85 p-8 text-slate-700 shadow-[0_24px_80px_-40px_rgba(33,104,105,0.45)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            FloorConnector
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">
            One login for every platform surface.
          </h2>
          <p className="mt-4 text-sm leading-7">
            This foundation supports marketing, contractor operations, customer portal access, and super admin under a shared identity layer.
          </p>
          {message ? (
            <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Back to marketing
            </Link>
            <Link
              href="/app"
              className="rounded-full border border-transparent bg-brand-700 px-4 py-2 text-white transition hover:bg-brand-900"
            >
              Go to app
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
