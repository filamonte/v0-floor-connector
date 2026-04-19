import Link from "next/link";

type DashboardActionCardProps = {
  href: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: "blue" | "green" | "amber";
};

const badgeStyles = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700"
};

export function DashboardActionCard({
  href,
  title,
  description,
  badge,
  badgeColor
}: DashboardActionCardProps) {
  return (
    <Link
      href={href}
      className="block px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900">{title}</p>
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[badgeColor]}`}
        >
          {badge}
        </span>
      </div>
    </Link>
  );
}
