import Link from "next/link";

type DashboardMetricCardProps = {
  title: string;
  value: number;
  href: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "warning" | "success";
};

export function DashboardMetricCard({
  title,
  value,
  href,
  description,
  trend,
  variant = "default"
}: DashboardMetricCardProps) {
  const variantStyles = {
    default: "border-neutral-200 bg-white",
    warning: "border-amber-200 bg-amber-50",
    success: "border-green-200 bg-green-50"
  };

  const valueStyles = {
    default: "text-neutral-900",
    warning: "text-amber-700",
    success: "text-green-700"
  };

  return (
    <Link
      href={href}
      className={`group block rounded-xl border p-5 transition-all hover:shadow-md ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        {trend && (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full ${
              trend === "up"
                ? "bg-green-100 text-green-600"
                : trend === "down"
                  ? "bg-red-100 text-red-600"
                  : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {trend === "up" ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : trend === "down" ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            )}
          </span>
        )}
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${valueStyles[variant]}`}>
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      )}
    </Link>
  );
}
