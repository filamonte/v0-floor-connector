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
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

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
  const logoFrameStyle = brandAccentColor ? { borderColor: brandAccentColor } : undefined;
  const fallbackMarkStyle = brandAccentColor ? { backgroundColor: brandAccentColor } : undefined;

  return (
    <Link
      href={href}
      aria-label={`${organizationName} home`}
      title={`${organizationName} home`}
      className={[
        "group inline-flex min-w-0 items-center gap-3.5 rounded-[8px] px-1 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef7d32] focus-visible:ring-offset-2",
        className
      ].join(" ")}
    >
      {logoUrl ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-[#e0d2c3] bg-white shadow-[0_10px_24px_-20px_rgba(34,26,20,0.4)] sm:h-12 sm:w-12"
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-[#d8c8ba] bg-[#17120f] text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_-20px_rgba(34,26,20,0.42)] sm:h-12 sm:w-12"
          style={fallbackMarkStyle}
        >
          {initials}
        </span>
      )}

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a65b25] group-hover:text-[#8e4515]">
            {productLabel}
          </span>
          {navigationLabel ? (
            <span className="inline-flex items-center rounded-full border border-[#ead8c8] bg-[#fbf5ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a5a43] transition group-hover:border-[#ef7d32] group-hover:text-[#5d3f29]">
              {navigationLabel}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block truncate text-[12px] font-semibold text-[#2f241b] group-hover:text-[#17120f] sm:text-[13px]">
          {organizationName}
        </span>
        {supportingLabel ? (
          <span className="mt-1 hidden truncate text-[11px] leading-4 text-[#7d6f63] sm:block">
            {supportingLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
