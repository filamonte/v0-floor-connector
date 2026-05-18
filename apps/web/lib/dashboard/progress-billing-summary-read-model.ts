import "server-only";

import { cache } from "react";

import type { InvoiceStatus } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type DashboardScheduleOfValuesRow = {
  id: string;
  estimate_id: string;
};

type DashboardScheduleOfValueItemRow = {
  id: string;
  schedule_of_values_id: string;
  scheduled_value_amount: string | number;
  percent_complete: string | number;
};

type DashboardProgressInvoiceRow = {
  id: string;
  estimate_id: string | null;
  status: InvoiceStatus;
};

type DashboardProgressInvoiceLineItemRow = {
  invoice_id: string;
  schedule_of_value_item_id: string | null;
  line_total: string | number;
};

export type DashboardProgressBillingSummaryReadModel = {
  readyToBillCount: number;
};

function parseMoney(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function groupByKey<T, K extends string | null | undefined>(
  items: T[],
  getKey: (item: T) => K
) {
  const grouped = new Map<Exclude<K, null | undefined>, T[]>();

  for (const item of items) {
    const key = getKey(item);

    if (!key) {
      continue;
    }

    const normalizedKey = key as Exclude<K, null | undefined>;
    const existing = grouped.get(normalizedKey);

    if (existing) {
      existing.push(item);
    } else {
      grouped.set(normalizedKey, [item]);
    }
  }

  return grouped;
}

function deriveDashboardProgressBillingStatus(input: {
  items: DashboardScheduleOfValueItemRow[];
  progressInvoices: DashboardProgressInvoiceRow[];
  progressInvoiceLineItemsBySovItemId: Map<
    string,
    DashboardProgressInvoiceLineItemRow[]
  >;
}) {
  const invoiceById = new Map(
    input.progressInvoices.map((invoice) => [invoice.id, invoice] as const)
  );
  const billedStatuses = new Set<InvoiceStatus>([
    "sent",
    "partially_paid",
    "paid"
  ]);

  const totals = input.items.reduce(
    (sum, item) => {
      const linkedLineItems =
        input.progressInvoiceLineItemsBySovItemId.get(item.id) ?? [];
      const previousBilledAmount = roundMoney(
        linkedLineItems.reduce((lineSum, lineItem) => {
          const invoice = invoiceById.get(lineItem.invoice_id);

          if (!invoice || !billedStatuses.has(invoice.status)) {
            return lineSum;
          }

          return lineSum + parseMoney(lineItem.line_total);
        }, 0)
      );
      const scheduledValueAmount = roundMoney(
        parseMoney(item.scheduled_value_amount)
      );
      const minimumAllowedPercentComplete =
        scheduledValueAmount > 0
          ? roundMoney((previousBilledAmount / scheduledValueAmount) * 100)
          : 0;
      const percentComplete = Math.max(
        parseMoney(item.percent_complete),
        minimumAllowedPercentComplete
      );
      const completedToDateAmount = roundMoney(
        scheduledValueAmount * (percentComplete / 100)
      );
      const currentToBillAmount = roundMoney(
        Math.max(0, completedToDateAmount - previousBilledAmount)
      );
      const balanceToFinishAmount = roundMoney(
        Math.max(0, scheduledValueAmount - completedToDateAmount)
      );

      return {
        currentBillableTotal: roundMoney(
          sum.currentBillableTotal + currentToBillAmount
        ),
        previouslyBilledTotal: roundMoney(
          sum.previouslyBilledTotal + previousBilledAmount
        ),
        balanceToFinishTotal: roundMoney(
          sum.balanceToFinishTotal + balanceToFinishAmount
        )
      };
    },
    {
      currentBillableTotal: 0,
      previouslyBilledTotal: 0,
      balanceToFinishTotal: 0
    }
  );

  if (totals.balanceToFinishTotal <= 0) {
    return "fully_billed";
  }

  if (totals.currentBillableTotal > 0) {
    return "ready_to_bill";
  }

  if (totals.previouslyBilledTotal > 0) {
    return "in_progress";
  }

  return "not_started";
}

export const getDashboardProgressBillingSummaryReadModel = cache(
  async (input: {
    organizationId: string;
  }): Promise<DashboardProgressBillingSummaryReadModel> => {
    const supabase = await getSupabaseServerClient();
    const scheduleOfValuesResponse = await supabase
      .from("schedule_of_values")
      .select("id, estimate_id")
      .eq("company_id", input.organizationId);

    if (scheduleOfValuesResponse.error) {
      throw new Error(
        `Unable to load dashboard progress billing schedules: ${scheduleOfValuesResponse.error.message}`
      );
    }

    const scheduleOfValuesRows = Array.isArray(scheduleOfValuesResponse.data)
      ? (scheduleOfValuesResponse.data as DashboardScheduleOfValuesRow[])
      : [];
    const scheduleOfValuesIds = scheduleOfValuesRows.map((row) => row.id);

    if (scheduleOfValuesIds.length === 0) {
      return {
        readyToBillCount: 0
      };
    }

    const [itemsResponse, progressInvoicesResponse] = await Promise.all([
      supabase
        .from("schedule_of_value_items")
        .select(
          "id, schedule_of_values_id, scheduled_value_amount, percent_complete"
        )
        .eq("company_id", input.organizationId)
        .in("schedule_of_values_id", scheduleOfValuesIds),
      supabase
        .from("invoices")
        .select("id, estimate_id, status")
        .eq("company_id", input.organizationId)
        .eq("billing_model", "aia_progress")
    ]);

    if (itemsResponse.error) {
      throw new Error(
        `Unable to load dashboard progress billing items: ${itemsResponse.error.message}`
      );
    }

    if (progressInvoicesResponse.error) {
      throw new Error(
        `Unable to load dashboard progress invoices: ${progressInvoicesResponse.error.message}`
      );
    }

    const itemRows = Array.isArray(itemsResponse.data)
      ? (itemsResponse.data as DashboardScheduleOfValueItemRow[])
      : [];
    const progressInvoices = Array.isArray(progressInvoicesResponse.data)
      ? (progressInvoicesResponse.data as DashboardProgressInvoiceRow[])
      : [];
    const progressInvoiceIds = progressInvoices.map((invoice) => invoice.id);
    const lineItemsResponse =
      progressInvoiceIds.length > 0
        ? await supabase
            .from("invoice_line_items")
            .select("invoice_id, schedule_of_value_item_id, line_total")
            .eq("company_id", input.organizationId)
            .in("invoice_id", progressInvoiceIds)
            .not("schedule_of_value_item_id", "is", null)
        : null;

    if (lineItemsResponse?.error) {
      throw new Error(
        `Unable to load dashboard progress invoice line links: ${lineItemsResponse.error.message}`
      );
    }

    const lineItems = Array.isArray(lineItemsResponse?.data)
      ? (lineItemsResponse.data as DashboardProgressInvoiceLineItemRow[])
      : [];
    const itemsByScheduleOfValuesId = groupByKey(
      itemRows,
      (item) => item.schedule_of_values_id
    );
    const invoicesByEstimateId = groupByKey(
      progressInvoices,
      (invoice) => invoice.estimate_id
    );
    const lineItemsBySovItemId = groupByKey(
      lineItems,
      (lineItem) => lineItem.schedule_of_value_item_id
    );

    const readyToBillCount = scheduleOfValuesRows.filter((scheduleOfValues) => {
      const status = deriveDashboardProgressBillingStatus({
        items: itemsByScheduleOfValuesId.get(scheduleOfValues.id) ?? [],
        progressInvoices:
          invoicesByEstimateId.get(scheduleOfValues.estimate_id) ?? [],
        progressInvoiceLineItemsBySovItemId: lineItemsBySovItemId
      });

      return status === "ready_to_bill";
    }).length;

    return {
      readyToBillCount
    };
  }
);
