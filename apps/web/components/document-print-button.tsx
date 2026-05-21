"use client";

export function DocumentPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-md bg-[var(--graphite)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--graphite-light)] print:hidden"
    >
      Print / save PDF
    </button>
  );
}
