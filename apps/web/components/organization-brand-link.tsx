import Link from "next/link";

type OrganizationBrandLinkProps = {
  href: string;
  organizationName: string;
  logoUrl?: string | null;
  productLabel?: string;
  supportingLabel?: string;
  navigationLabel?: string;
  className?: string;
  variant?: "default" | "light";
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
  navigationLabel,
  className = "",
  variant = "default"
}: OrganizationBrandLinkProps) {
  const initials = getInitials(organizationName);
  const isLight = variant === "light";

  return (
    <Link
      href={href}
      aria-label={`${organizationName} home`}
      title={`${organizationName} home`}
      className={[
        "group inline-flex min-w-0 items-center gap-2.5 rounded px-1 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2",
        className
      ].join(" ")}
    >
      {logoUrl ? (
        <span className={[
          "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border",
          isLight ? "border-white/20 bg-white" : "border-[#e0d2c3] bg-white shadow-sm"
        ].join(" ")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={`${organizationName} logo`}
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded border text-[11px] font-bold uppercase tracking-wide",
          isLight 
            ? "border-white/20 bg-white/10 text-white" 
            : "border-[#d8c8ba] bg-[#17120f] text-[#ffd7bb] shadow-sm"
        ].join(" ")}>
          {initials}
        </span>
      )}

      <span className="min-w-0">
        <span className={[
          "block truncate text-[13px] font-semibold",
          isLight ? "text-white" : "text-[#2f241b] group-hover:text-[#17120f]"
        ].join(" ")}>
          {organizationName}
        </span>
        {supportingLabel ? (
          <span className={[
            "block truncate text-[11px]",
            isLight ? "text-white/70" : "text-[#7d6f63]"
          ].join(" ")}>
            {supportingLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
