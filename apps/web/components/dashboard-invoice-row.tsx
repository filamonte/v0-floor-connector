import Link from "next/link";

type DashboardInvoiceRowProps = {
  id: string;
  referenceNumber: string;
  customer: string;
  amount: number;
  status: string;
  dueDate?: string;
};

const statusStyles: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-neutral-100 text-neutral-500"
};

export function DashboardInvoiceRow({
  id,
  referenceNumber,
  customer,
  amount,
  status,
  dueDate
}: DashboardInvoiceRowProps) {
  const statusStyle = statusStyles[status] ?? "bg-neutral-100 text-neutral-700";

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  const formattedDate = dueDate
    ? new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    : "—";

  return (
    <Link
      href={`/invoices/${id}`}
      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-900">
            {referenceNumber}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle}`}
          >
            {status}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{customer}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-neutral-900">{formattedAmount}</p>
        <p className="text-xs text-neutral-500">Due {formattedDate}</p>
      </div>
    </Link>
  );
}
