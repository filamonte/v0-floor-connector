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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:gap-8">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700 sm:text-sm">
            Authentication Foundation
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {description}
          </p>

          {message ? (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {message}
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm text-slate-600">{footer}</div> : null}
        </section>

        <aside className="rounded-[2rem] border border-brand-100 bg-brand-50/85 p-6 text-slate-700 shadow-[0_24px_80px_-40px_rgba(33,104,105,0.45)] backdrop-blur sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700 sm:text-sm">
            FloorConnector
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">
            One login for every platform surface.
          </h2>
          <p className="mt-4 text-sm leading-7">
            This foundation supports marketing, contractor operations, customer portal access, and super admin under a shared identity layer.
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">Supported now</p>
              <p className="mt-1 text-sm text-slate-600">
                Google OAuth and email/password use the same shared auth
                foundation.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">Testing focus</p>
              <p className="mt-1 text-sm text-slate-600">
                Use these pages to validate redirects, confirmation flows, and
                protected-route access before the final product UI is added.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Back to marketing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-transparent bg-brand-700 px-4 py-2 text-white transition hover:bg-brand-900"
            >
              Go to dashboard
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
