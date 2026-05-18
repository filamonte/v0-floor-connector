import "server-only";

import { cache } from "react";
import type { NotificationEventCategory } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ContractorNotificationItem,
  ContractorNotificationSection,
  ContractorNotificationsSummary
} from "@/lib/notifications/types";

type NotificationRow = {
  id: string;
  company_id: string;
  notification_event_id: string;
  user_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  notification_events?: {
    id: string;
    category: NotificationEventCategory;
    severity: "critical" | "warning" | "neutral";
    title: string;
    message: string;
    link_path: string;
    occurred_at: string;
  } | null;
};

const categoryLabels: Record<NotificationEventCategory, string> = {
  estimates: "Estimates",
  contracts: "Contracts",
  invoices: "Invoices",
  change_orders: "Change orders",
  payments: "Payments",
  communication: "Communication",
  system: "System"
};

function formatBadge(category: NotificationEventCategory) {
  switch (category) {
    case "change_orders":
      return "Change order";
    case "payments":
      return "Payment";
    case "communication":
      return "Message";
    case "system":
      return "System";
    default:
      return category.slice(0, -1).replace("_", " ");
  }
}

function mapNotificationRow(
  row: NotificationRow
): ContractorNotificationItem | null {
  if (!row.notification_events) {
    return null;
  }

  return {
    id: row.notification_event_id,
    notificationId: row.id,
    category: row.notification_events.category,
    tone: row.notification_events.severity,
    title: row.notification_events.title,
    description: row.notification_events.message,
    href: row.notification_events.link_path,
    badge: formatBadge(row.notification_events.category),
    occurredAt: row.notification_events.occurred_at,
    isRead: row.is_read
  };
}

export const listContractorNotifications = cache(
  async (): Promise<ContractorNotificationsSummary> => {
    const user = await requireAuthenticatedUser("/dashboard");
    const organizationContext = await getActiveOrganizationContext(user.id);

    if (!organizationContext) {
      return {
        totalCount: 0,
        sections: [],
        visibleItems: []
      };
    }

    return listContractorNotificationsForContext(
      user.id,
      organizationContext.organization.id
    );
  }
);

export const listContractorNotificationsForContext = cache(
  async (
    userId: string,
    organizationId: string
  ): Promise<ContractorNotificationsSummary> => {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("notifications")
      .select(
        `
          id,
          company_id,
          notification_event_id,
          user_id,
          is_read,
          read_at,
          created_at,
          updated_at,
          notification_events (
            id,
            category,
            severity,
            title,
            message,
            link_path,
            occurred_at
          )
        `
      )
      .eq("company_id", organizationId)
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(50);
    const rows = (response.data as NotificationRow[] | null) ?? [];

    if (response.error) {
      throw new Error(
        `Unable to load notifications: ${response.error.message}`
      );
    }

    const items = rows
      .map(mapNotificationRow)
      .filter((value): value is ContractorNotificationItem => value !== null);
    const sectionsByCategory = new Map<
      NotificationEventCategory,
      ContractorNotificationItem[]
    >();

    for (const item of items) {
      sectionsByCategory.set(item.category, [
        ...(sectionsByCategory.get(item.category) ?? []),
        item
      ]);
    }

    const sections = [...sectionsByCategory.entries()].map(
      ([category, categoryItems]): ContractorNotificationSection => ({
        key: category,
        label: categoryLabels[category],
        count: categoryItems.length,
        items: categoryItems
      })
    );

    return {
      totalCount: items.length,
      sections,
      visibleItems: items.slice(0, 6)
    };
  }
);
