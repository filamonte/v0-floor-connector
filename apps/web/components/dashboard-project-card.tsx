import Link from "next/link";

type DashboardProjectCardProps = {
  id: string;
  name: string;
  customer: string;
  status: string;
};

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-neutral-100 text-neutral-700",
  on_hold: "bg-red-100 text-red-700"
};

export function DashboardProjectCard({
  id,
  name,
  customer,
  status
}: DashboardProjectCardProps) {
  const statusStyle = statusStyles[status] ?? "bg-neutral-100 text-neutral-700";
  const statusLabel = status.replace(/_/g, " ");

  return (
    <Link
      href={`/projects/${id}`}
      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{customer}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle}`}
      >
        {statusLabel}
      </span>
    </Link>
  );
}
