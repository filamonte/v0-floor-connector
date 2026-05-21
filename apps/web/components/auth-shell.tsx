import Link from "next/link";
import type { ReactNode } from "react";

import type { AuthSurfaceContext } from "@/lib/auth/paths";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  error?: string;
  message?: string;
  eyebrow?: string;
  surfaceContext?: AuthSurfaceContext;
};

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-[var(--copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function AuthShell({
  eyebrow = "Account access",
  title,
  description,
  children,
  footer,
  error,
  message,
  surfaceContext
}: AuthShellProps) {
  const features = [
    surfaceContext?.nextStepTitle ?? "Single sign-on ready",
    surfaceContext?.continuityTitle ?? "Unified account system",
    "Enterprise-grade security"
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,var(--cream)_0%,#ffffff_50%,var(--highlight)_100%)]">
      {/* Subtle pattern overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
        {/* Back to marketing link */}
        <div className="absolute left-4 top-6 sm:left-6 lg:left-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-warm)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur transition hover:border-[var(--graphite-light)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-12">
          {/* Main login panel */}
          <section className="order-2 rounded-3xl border border-[var(--border-warm)] bg-white p-6 shadow-[0_24px_80px_-40px_rgba(34,26,20,0.18)] sm:p-8 lg:order-1 lg:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--copper)]/20 bg-[var(--copper)]/5 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--copper)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--copper)]">
                  {eyebrow}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
                {description}
              </p>
            </div>

            {/* Status messages */}
            {message ? (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-800">{message}</p>
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
              >
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            ) : null}

            {/* Form content */}
            <div>{children}</div>

            {/* Footer */}
            {footer ? (
              <div className="mt-8 border-t border-[var(--border-warm)] pt-6 text-sm text-[var(--text-secondary)]">
                {footer}
              </div>
            ) : null}
          </section>

          {/* Sidebar info panel */}
          <aside className="order-1 flex flex-col justify-center lg:order-2">
            {/* Brand header */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--graphite)] text-white shadow-sm">
                  <ShieldIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">FloorConnector</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Secure authentication</p>
                </div>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {surfaceContext?.shellTitle ?? "One login for every platform surface."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {surfaceContext?.shellDescription ??
                  "This foundation supports marketing, contractor operations, customer portal access, and super admin under a shared identity layer."}
              </p>
            </div>

            {/* Feature checklist */}
            <div className="mb-8 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--copper)]/10">
                    <CheckIcon />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Info cards */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--border-warm)] bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {surfaceContext?.nextStepTitle ?? "Supported now"}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                  {surfaceContext?.nextStepDescription ??
                    "Google OAuth and email/password use the same shared auth foundation."}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/50 px-5 py-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {surfaceContext?.continuityTitle ?? "Shared account model"}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                  {surfaceContext?.continuityDescription ??
                    "Google OAuth and email/password both feed the same shared account model across every protected surface."}
                </p>
              </div>
            </div>

            {/* Return destination badge */}
            {surfaceContext ? (
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--graphite)] px-4 py-2 text-sm font-medium text-white shadow-sm">
                  <span>{surfaceContext.returnLabel}</span>
                  <ArrowIcon />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
