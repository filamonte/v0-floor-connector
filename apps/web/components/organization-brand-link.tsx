import Link from "next/link";

type OrganizationBrandLinkProps = {
  href: string;
  organizationName: string;
  logoUrl?: string | null;
  brandAccentColor?: string | null;
  productLabel?: string;
  supportingLabel?: string;
  navigationLabel?: string;
  className?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "FC";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function OrganizationBrandLink({
  href,
  organizationName,
  logoUrl,
  brandAccentColor,
  productLabel = "FloorConnector",
  supportingLabel,
  navigationLabel,
  className = ""
}: OrganizationBrandLinkProps) {
  const initials = getInitials(organizationName);
  const logoFrameStyle = brandAccentColor
    ? { borderColor: brandAccentColor }
    : undefined;
  const fallbackMarkStyle = brandAccentColor
    ? { backgroundColor: brandAccentColor }
    : undefined;

  return (
    <Link
      href={href}
      aria-label={`${organizationName} home`}
      title={`${organizationName} home`}
      className={[
        "group inline-flex min-w-0 items-center gap-3.5 rounded-[6px] px-1 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2",
        className
      ].join(" ")}
    >
      {logoUrl ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-[var(--border-warm)] bg-white shadow-none sm:h-12 sm:w-12"
          style={logoFrameStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={`${organizationName} logo`}
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-[var(--border-warm)] bg-[var(--graphite-dark)] text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-none sm:h-12 sm:w-12"
          style={fallbackMarkStyle}
        >
          {initials}
        </span>
      )}

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)] group-hover:text-[var(--copper-dark)]">
            {productLabel}
          </span>
          {navigationLabel ? (
            <span className="inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] transition group-hover:border-[var(--copper)] group-hover:text-[var(--text-primary)]">
              {navigationLabel}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block truncate text-[12px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--graphite-dark)] sm:text-[13px]">
          {organizationName}
        </span>
        {supportingLabel ? (
          <span className="mt-1 hidden truncate text-[11px] leading-4 text-[var(--text-secondary)] sm:block">
            {supportingLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
