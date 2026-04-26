import type {
  NotificationEventCategory,
  NotificationEventSeverity
} from "@floorconnector/types";

export type ContractorNotificationCategory = NotificationEventCategory;
export type ContractorNotificationTone = NotificationEventSeverity;

export type ContractorNotificationItem = {
  id: string;
  notificationId: string;
  category: ContractorNotificationCategory;
  tone: ContractorNotificationTone;
  title: string;
  description: string;
  href: string;
  badge: string;
  occurredAt: string;
  isRead: boolean;
  contextHref?: string | null;
  contextLabel?: string | null;
};

export type ContractorNotificationSection = {
  key: ContractorNotificationCategory;
  label: string;
  count: number;
  items: ContractorNotificationItem[];
};

export type ContractorNotificationsSummary = {
  totalCount: number;
  sections: ContractorNotificationSection[];
  visibleItems: ContractorNotificationItem[];
};
