export type ContractorNotificationCategory =
  | "jobs"
  | "collections"
  | "contracts"
  | "appointments"
  | "punchlists"
  | "progress-billing";

export type ContractorNotificationTone = "critical" | "warning" | "neutral";

export type ContractorNotificationItem = {
  id: string;
  category: ContractorNotificationCategory;
  tone: ContractorNotificationTone;
  title: string;
  description: string;
  href: string;
  badge: string;
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
