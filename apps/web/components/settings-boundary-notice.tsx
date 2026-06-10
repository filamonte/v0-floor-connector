type SettingsBoundaryNoticeProps = {
  tone?: "warm" | "neutral";
  title: string;
  items: readonly {
    label: string;
    description: string;
  }[];
};

export function SettingsBoundaryNotice({
  tone = "warm",
  title,
  items
}: SettingsBoundaryNoticeProps) {
  const neutral = tone === "neutral";

  return (
    <section
      className={[
        "rounded-lg border bg-white px-5 py-5 shadow-[0_18px_48px_-40px_rgba(34,26,20,0.24)]",
        neutral ? "border-slate-200" : "border-[var(--border-warm)]"
      ].join(" ")}
    >
      <p
        className={[
          "text-[11px] font-semibold uppercase tracking-[0.22em]",
          neutral ? "text-[var(--text-tertiary)]" : "text-[var(--copper)]"
        ].join(" ")}
      >
        Boundary guide
      </p>
      <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3"
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {item.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
