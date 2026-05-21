import Link from "next/link";
import type { ReactNode } from "react";

type CommercialDocumentCommandItem = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
};

type CommercialDocumentCommandBandProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  statusLabel: string;
  projectHref?: string | null;
  projectLabel?: string;
  items: CommercialDocumentCommandItem[];
};

export const commercialDocumentHeaderShellClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)] sm:p-6";

export function CommercialDocumentCommandBand({
  eyebrow,
  title,
  description,
  statusLabel,
  projectHref,
  projectLabel = "Open project hub",
  items
}: CommercialDocumentCommandBandProps) {
  return (
    <section
      aria-labelledby="commercial-document-command-title"
      className="mt-4 overflow-hidden rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] shadow-[0_14px_36px_-34px_rgba(31,41,55,0.42)]"
    >
      <div className="flex flex-col gap-4 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
            {eyebrow}
          </p>
          <h2
            id="commercial-document-command-title"
            className="mt-1 text-base font-semibold tracking-tight text-[var(--text-primary)]"
          >
            {title}
          </h2>
          <div className="mt-2 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex h-9 items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {statusLabel}
          </span>
          {projectHref ? (
            <Link
              href={projectHref}
              className="inline-flex h-9 items-center rounded-[4px] border border-[var(--copper)] bg-[var(--copper)] px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--copper-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper-light)]"
            >
              {projectLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-px border-t border-[var(--border-warm)] bg-[var(--border-warm)] md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-white px-4 py-3 text-sm leading-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {item.label}
            </p>
            <div className="mt-1 font-semibold text-[var(--text-primary)]">
              {item.value}
            </div>
            {item.detail ? (
              <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                {item.detail}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
