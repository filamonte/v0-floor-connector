import Link from "next/link";
import type { ReactNode } from "react";

import { DocumentPrintButton } from "@/components/document-print-button";
import { sanitizeHtml } from "@/lib/html/sanitize";

export type DocumentBrand = {
  name: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  accentColor?: string | null;
};

export type DocumentFact = {
  label: string;
  value: ReactNode;
};

export type CustomerDocumentLineItem = {
  id: string;
  name: string;
  description?: string | null;
  quantity: string | number;
  unit: string;
  unitPrice: string | number;
  lineTotal: string | number;
};

export function formatDocumentMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export function formatDocumentDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString();
}

export function formatDocumentStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function formatDocumentAddress(parts: Array<string | null | undefined>) {
  const filtered = parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part.length > 0);

  return filtered.length > 0 ? filtered.join(", ") : "Not provided";
}

export function CustomerDocumentPrintView({
  brand,
  title,
  subtitle,
  statusLabel,
  backHref,
  backLabel,
  facts,
  children,
  footerNote
}: {
  brand: DocumentBrand;
  title: string;
  subtitle: string;
  statusLabel: string;
  backHref: string;
  backLabel: string;
  facts: DocumentFact[];
  children: ReactNode;
  footerNote?: string;
}) {
  const accentColor = brand.accentColor ?? "#ef7d32";
  const contactParts = [brand.phone, brand.email, brand.websiteUrl].filter(
    (value): value is string => Boolean(value)
  );

  return (
    <main
      aria-label="Customer document"
      className="mx-auto max-w-4xl bg-white px-5 py-6 text-[var(--text-primary)] sm:px-8 lg:px-10 print:max-w-none print:bg-white print:px-0 print:py-0"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3 print:hidden">
        <Link
          href={backHref}
          className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--copper)]"
        >
          {backLabel}
        </Link>
        <DocumentPrintButton />
      </div>

      <article
        data-testid="customer-document-print-view"
        className="rounded-lg border border-[var(--border-warm)] bg-white shadow-sm print:border-none print:shadow-none"
      >
        <header
          className="break-inside-avoid border-t-4 px-6 py-8 sm:px-8 print:break-inside-avoid"
          style={{ borderTopColor: accentColor }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-4">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  className="max-h-14 max-w-48 object-contain print:max-h-12"
                />
              ) : (
                <p
                  data-testid="customer-document-brand-name"
                  className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--copper)]"
                >
                  {brand.name}
                </p>
              )}
              {brand.logoUrl ? (
                <span data-testid="customer-document-brand-name" className="sr-only">
                  {brand.name}
                </span>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Customer document
                </p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-normal text-[var(--text-primary)]">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
              </div>
            </div>

            <div
              className="min-w-[10rem] rounded-md border bg-[var(--paper)] px-4 py-3 text-sm print:break-inside-avoid"
              style={{ borderColor: accentColor }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Status
              </p>
              <p className="mt-1 font-semibold capitalize leading-6 text-[var(--text-primary)]">
                {statusLabel}
              </p>
            </div>
          </div>

          {contactParts.length > 0 ? (
            <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
              {contactParts.join(" | ")}
            </p>
          ) : null}
        </header>

        <section className="grid gap-3 border-y border-[var(--border-warm)] bg-[var(--paper)] px-6 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 print:break-inside-avoid">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {fact.label}
              </p>
              <div className="mt-1 text-sm font-medium leading-6 text-[var(--text-primary)]">
                {fact.value}
              </div>
            </div>
          ))}
        </section>

        <div className="space-y-8 px-6 py-7 sm:px-8">{children}</div>

        <footer className="break-inside-avoid border-t border-[var(--border-warm)] px-6 py-5 text-xs leading-5 text-[var(--text-muted)] sm:px-8 print:break-inside-avoid">
          {footerNote ?? "This PDF/print view is a customer-facing rendering of the shared FloorConnector record."}
        </footer>
      </article>
    </main>
  );
}

export function CustomerDocumentSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="break-inside-avoid space-y-3 print:break-inside-avoid">
      <h2 className="border-b border-[var(--border-warm)] pb-2 text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CustomerDocumentHtml({ html }: { html: string | null | undefined }) {
  if (!html || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">Not provided.</p>;
  }

  return (
    <div
      className="prose prose-sm max-w-none text-[var(--text-secondary)]"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

export function CustomerDocumentLineItemsTable({
  lineItems
}: {
  lineItems: CustomerDocumentLineItem[];
}) {
  if (lineItems.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">No line items are listed.</p>;
  }

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border-warm)] text-left text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <th className="py-2 pr-3 font-semibold">Item</th>
            <th className="px-3 py-2 font-semibold">Qty</th>
            <th className="px-3 py-2 text-right font-semibold">Unit price</th>
            <th className="py-2 pl-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className="border-b border-[var(--border-warm)] align-top">
              <td className="py-3 pr-3">
                <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                {item.description ? (
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.description}</p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-[var(--text-secondary)]">
                {Number(item.quantity).toFixed(2)} {item.unit}
              </td>
              <td className="px-3 py-3 text-right text-[var(--text-secondary)]">
                {formatDocumentMoney(item.unitPrice)}
              </td>
              <td className="py-3 pl-3 text-right font-medium text-[var(--text-primary)]">
                {formatDocumentMoney(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerDocumentTotals({
  rows,
  totalLabel = "Total"
}: {
  rows: Array<{ label: string; value: string | number; isTotal?: boolean }>;
  totalLabel?: string;
}) {
  return (
    <dl className="ml-auto max-w-sm break-inside-avoid space-y-2 text-sm print:break-inside-avoid">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex items-center justify-between gap-5 ${
            row.isTotal ? "border-t border-[var(--border-warm)] pt-3 text-base font-semibold" : ""
          }`}
        >
          <dt>{row.isTotal ? totalLabel : row.label}</dt>
          <dd>{formatDocumentMoney(row.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
