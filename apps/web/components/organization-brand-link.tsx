import Link from "next/link";

type OrganizationBrandLinkProps = {
  href: string;
  organizationName: string;
  logoUrl?: string | null;
  productLabel?: string;
  supportingLabel?: string;
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
  productLabel = "FloorConnector",
  supportingLabel,
  className = ""
}: OrganizationBrandLinkProps) {
  const initials = getInitials(organizationName);

  return (
    <Link
      href={href}
      className={[
        "group inline-flex min-w-0 items-center gap-3 transition",
        className
      ].join(" ")}
    >
      {logoUrl ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-[#d8dee8] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={`${organizationName} logo`}
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border border-[#d8dee8] bg-[#233a64] text-sm font-semibold uppercase tracking-[0.12em] text-white">
          {initials}
        </span>
      )}

      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-[#243a67] group-hover:text-[#1b2d4d]">
          {productLabel}
        </span>
        <span className="mt-1 block truncate text-[13px] font-medium text-slate-800 group-hover:text-slate-950">
          {organizationName}
        </span>
        {supportingLabel ? (
          <span className="mt-1 block truncate text-[11px] leading-4 text-[#64748b]">
            {supportingLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
