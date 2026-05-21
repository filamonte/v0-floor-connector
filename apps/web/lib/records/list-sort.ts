export type EstimateListSort =
  | "workflow"
  | "recent"
  | "oldest"
  | "amount_desc"
  | "amount_asc"
  | "customer_asc";

export type InvoiceListSort =
  | "workflow"
  | "recent"
  | "oldest"
  | "due_soon"
  | "balance_desc"
  | "balance_asc"
  | "customer_asc";

type EstimateSortable = {
  referenceNumber: string;
  totalAmount: string;
  status: string;
  updatedAt?: string | null;
  estimateDate?: string | null;
  customer?: { name?: string | null } | null;
  project?: { name?: string | null } | null;
};

type InvoiceSortable = {
  referenceNumber: string;
  balanceDueAmount: string;
  status: string;
  updatedAt?: string | null;
  dueDate?: string | null;
  customer?: { name?: string | null } | null;
  project?: { name?: string | null } | null;
};

const estimateSortOptions = [
  "workflow",
  "recent",
  "oldest",
  "amount_desc",
  "amount_asc",
  "customer_asc"
] as const;

const invoiceSortOptions = [
  "workflow",
  "recent",
  "oldest",
  "due_soon",
  "balance_desc",
  "balance_asc",
  "customer_asc"
] as const;

const estimateStatusPriority = new Map([
  ["draft", 0],
  ["sent", 1],
  ["rejected", 2],
  ["approved", 3]
]);

const invoiceStatusPriority = new Map([
  ["draft", 0],
  ["sent", 1],
  ["partially_paid", 2],
  ["paid", 3],
  ["void", 4]
]);

export function parseEstimateListSort(value: string | null | undefined): EstimateListSort {
  return estimateSortOptions.includes(value as EstimateListSort)
    ? (value as EstimateListSort)
    : "workflow";
}

export function parseInvoiceListSort(value: string | null | undefined): InvoiceListSort {
  return invoiceSortOptions.includes(value as InvoiceListSort)
    ? (value as InvoiceListSort)
    : "workflow";
}

function compareText(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").localeCompare(right ?? "", undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function compareRecent(left: string | null | undefined, right: string | null | undefined) {
  return (right ?? "").localeCompare(left ?? "");
}

function compareNumberDesc(left: string, right: string) {
  return Number(right) - Number(left);
}

function compareNumberAsc(left: string, right: string) {
  return Number(left) - Number(right);
}

export function sortEstimateRecords<T extends EstimateSortable>(
  estimates: readonly T[],
  sort: EstimateListSort
) {
  return [...estimates].sort((left, right) => {
    if (sort === "recent") {
      return compareRecent(left.updatedAt, right.updatedAt);
    }

    if (sort === "oldest") {
      return (left.updatedAt ?? "").localeCompare(right.updatedAt ?? "");
    }

    if (sort === "amount_desc") {
      return compareNumberDesc(left.totalAmount, right.totalAmount);
    }

    if (sort === "amount_asc") {
      return compareNumberAsc(left.totalAmount, right.totalAmount);
    }

    if (sort === "customer_asc") {
      return (
        compareText(left.customer?.name, right.customer?.name) ||
        compareText(left.referenceNumber, right.referenceNumber)
      );
    }

    return (
      (estimateStatusPriority.get(left.status) ?? 99) -
        (estimateStatusPriority.get(right.status) ?? 99) ||
      compareRecent(left.updatedAt, right.updatedAt)
    );
  });
}

export function sortInvoiceRecords<T extends InvoiceSortable>(
  invoices: readonly T[],
  sort: InvoiceListSort
) {
  return [...invoices].sort((left, right) => {
    if (sort === "recent") {
      return compareRecent(left.updatedAt, right.updatedAt);
    }

    if (sort === "oldest") {
      return (left.updatedAt ?? "").localeCompare(right.updatedAt ?? "");
    }

    if (sort === "due_soon") {
      return (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31");
    }

    if (sort === "balance_desc") {
      return compareNumberDesc(left.balanceDueAmount, right.balanceDueAmount);
    }

    if (sort === "balance_asc") {
      return compareNumberAsc(left.balanceDueAmount, right.balanceDueAmount);
    }

    if (sort === "customer_asc") {
      return (
        compareText(left.customer?.name, right.customer?.name) ||
        compareText(left.referenceNumber, right.referenceNumber)
      );
    }

    return (
      (invoiceStatusPriority.get(left.status) ?? 99) -
        (invoiceStatusPriority.get(right.status) ?? 99) ||
      (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31") ||
      compareRecent(left.updatedAt, right.updatedAt)
    );
  });
}
