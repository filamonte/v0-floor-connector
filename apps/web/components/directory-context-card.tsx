import Link from "next/link";

type DirectoryContextCardProps = {
  href: string;
  recordLabel: string;
  description: string;
};

export function DirectoryContextCard({
  href,
  recordLabel,
  description
}: DirectoryContextCardProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white/88 p-7 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.32)] backdrop-blur sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
            Directory context
          </p>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
            {recordLabel}
          </div>
          <p className="max-w-[36ch] text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Back to Directory
        </Link>
      </div>
    </section>
  );
}
