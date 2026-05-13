import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  CustomerContactPortalPermission as CustomerContactPortalPermissionRecord,
  PortalAccessGrant as PortalAccessGrantRecord,
  PortalProjectAccess as PortalProjectAccessRecord
} from "@floorconnector/types";

import type {
  CustomerContactPortalPermissionInput,
  PortalInviteInput,
  PortalAccessGrantInput,
  PortalProjectAccessInput
} from "./schemas";
import { buildPortalInviteEmailContent } from "./email";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getOrganizationProductionActionLockState } from "@/lib/organizations/activation-guard";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isPostmarkEmailConfigured } from "@floorconnector/integrations";

type PortalAdminScope = {
  userId: string;
  organizationId: string;
  organizationName: string;
};

type PortalAccessGrantRow = {
  id: string;
  company_id: string;
  customer_id: string;
  customer_contact_id: string | null;
  user_id: string | null;
  status: PortalAccessGrantRecord["status"];
  invited_email: string | null;
  invited_by: string | null;
  invite_expires_at: string | null;
  invite_accepted_at: string | null;
  activated_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        email: string | null;
      }
    | null;
  portal_user?:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
  customer_contact?:
    | {
        id: string;
        customer_id: string;
        contact_id: string;
        relationship_label: string | null;
        is_primary: boolean;
        contacts?:
          | {
              id: string;
              display_name: string;
              email: string | null;
            }
          | null;
      }
    | null;
  invited_by_user?:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
};

type PortalProjectAccessRow = {
  id: string;
  company_id: string;
  portal_access_grant_id: string;
  project_id: string;
  status: PortalProjectAccessRecord["status"];
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  projects?:
    | {
        id: string;
        customer_id: string;
        name: string;
        status: string;
      }
    | null;
};

type CustomerContactPortalPermissionRow = {
  id: string;
  company_id: string;
  customer_contact_id: string;
  portal_access_grant_id: string | null;
  can_view_estimates: boolean;
  can_approve_estimates: boolean;
  can_sign_contracts: boolean;
  can_approve_change_orders: boolean;
  can_view_pay_invoices: boolean;
  can_request_quotes: boolean;
  management_source: "system_default" | "contractor_admin" | "main_contact" | "migration";
  created_at: string;
  updated_at: string;
};

type PortalInviteNotificationEventRow = {
  id: string;
  payload: Record<string, unknown> | null;
  occurred_at: string;
};

type PortalInviteNotificationDeliveryRow = {
  id: string;
  notification_event_id: string;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed";
  error_message: string | null;
  sent_at: string | null;
  failed_at: string | null;
  created_at: string;
};

export type PortalAccessGrantListItem = PortalAccessGrantRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
  } | null;
  customerContact: {
    id: string;
    customerId: string;
    contactId: string;
    relationshipLabel: string | null;
    isPrimary: boolean;
    contact: {
      id: string;
      displayName: string;
      email: string | null;
    } | null;
  } | null;
  portalUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  invitedByUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  inviteEmailDelivery: PortalInviteEmailDeliverySummary;
};

export type PortalInviteEmailDeliverySummary = {
  status: "not_sent" | "sent" | "failed";
  sendCount: number;
  lastSentAt: string | null;
  lastFailedAt: string | null;
  lastAttemptAt: string | null;
  lastFailureMessage: string | null;
};

export type PortalProjectAccessListItem = PortalProjectAccessRecord & {
  project: {
    id: string;
    customerId: string;
    name: string;
    status: string;
  } | null;
};

export type PortalInviteCreationResult = {
  portalAccessGrant: PortalAccessGrantListItem;
  projectAccess: PortalProjectAccessListItem | null;
  invitedEmail: string;
  inviteToken: string | null;
  inviteExpiresAt: string | null;
  activatedImmediately: boolean;
  reusedExistingGrant: boolean;
};

export type PortalInviteEmailSendResult = {
  portalAccessGrant: PortalAccessGrantListItem;
  invitedEmail: string;
  inviteToken: string;
  inviteExpiresAt: string;
  emailStatus: "sent" | "not_sent" | "failed";
  message: string;
  reason: "sent" | "activation_locked" | "not_configured" | "provider_failed";
};

export type PortalInvitePreview = {
  portalAccessGrantId: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerCompanyName: string | null;
  projectId: string;
  projectName: string;
  invitedEmail: string;
  status: PortalAccessGrantRecord["status"];
  expiresAt: string | null;
  acceptedAt: string | null;
};

export type PortalInviteAcceptanceResult = {
  accepted: boolean;
  projectId: string | null;
  message: string;
};

export type CustomerContactPortalPermissionListItem =
  CustomerContactPortalPermissionRecord;

export type PortalScopedPermissionKey =
  | "canApproveEstimates"
  | "canApproveChangeOrders"
  | "canSignContracts";

export type PortalScopedPermissionResolution =
  | {
      allowed: true;
      grantType: "customer_level" | "linked_contact";
      portalAccessGrant: PortalAccessGrantRecord;
      customerContactPermission: CustomerContactPortalPermissionRecord | null;
    }
  | {
      allowed: false;
      grantType: "linked_contact";
      portalAccessGrant: PortalAccessGrantRecord;
      customerContactPermission: CustomerContactPortalPermissionRecord | null;
    };

export async function resolvePortalScopedPermissionForGrantRecord(input: {
  organizationId: string;
  customerId: string;
  projectId: string;
  portalAccessGrantId: string;
  customerContactId: string | null;
  permission: PortalScopedPermissionKey;
}): Promise<PortalScopedPermissionResolution> {
  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("portal_access_grant_id")
    .eq("company_id", input.organizationId)
    .eq("portal_access_grant_id", input.portalAccessGrantId)
    .eq("project_id", input.projectId)
    .eq("status", "active")
    .maybeSingle();
  const projectAccessRow =
    (projectAccessResponse.data as { portal_access_grant_id?: string } | null) ?? null;

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate project-scoped portal access: ${projectAccessResponse.error.message}`
    );
  }

  if (!projectAccessRow?.portal_access_grant_id) {
    throw new Error("This record is not available in the current portal scope.");
  }

  const portalAccessGrant: PortalAccessGrantRecord = {
    id: input.portalAccessGrantId,
    organizationId: input.organizationId,
    customerId: input.customerId,
    customerContactId: input.customerContactId,
    userId: "",
    status: "active",
    invitedEmail: null,
    invitedByUserId: null,
    inviteExpiresAt: null,
    inviteAcceptedAt: null,
    activatedAt: null,
    revokedAt: null,
    createdAt: "",
    updatedAt: ""
  };

  if (!input.customerContactId) {
    return {
      allowed: true,
      grantType: "customer_level",
      portalAccessGrant,
      customerContactPermission: null
    };
  }

  const permissionResponse = await supabase
    .from("customer_contact_portal_permissions")
    .select(customerContactPortalPermissionSelect)
    .eq("company_id", input.organizationId)
    .eq("customer_contact_id", input.customerContactId)
    .maybeSingle();
  const permissionData: unknown = permissionResponse.data;

  if (permissionResponse.error) {
    throw new Error(
      `Unable to load stored portal permissions for this contact: ${permissionResponse.error.message}`
    );
  }

  const permissionRecord = isCustomerContactPortalPermissionRow(permissionData)
    ? mapCustomerContactPortalPermission(permissionData)
    : null;
  const allowed = permissionRecord?.[input.permission] === true;

  if (allowed) {
    return {
      allowed: true,
      grantType: "linked_contact",
      portalAccessGrant,
      customerContactPermission: permissionRecord
    };
  }

  return {
    allowed: false,
    grantType: "linked_contact",
    portalAccessGrant,
    customerContactPermission: permissionRecord
  };
}

const portalAccessGrantSelect = `
  id,
  company_id,
  customer_id,
  customer_contact_id,
  user_id,
  status,
  invited_email,
  invited_by,
  invite_expires_at,
  invite_accepted_at,
  activated_at,
  revoked_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    email
  ),
  portal_user:users!portal_access_grants_user_id_fkey (
    id,
    email,
    full_name
  ),
  customer_contact:customer_contacts!portal_access_grants_company_customer_contact_fkey (
    id,
    customer_id,
    contact_id,
    relationship_label,
    is_primary,
    contacts:contacts!customer_contacts_contact_company_fkey (
      id,
      display_name,
      email
    )
  ),
  invited_by_user:users!portal_access_grants_invited_by_fkey (
    id,
    email,
    full_name
  )
`;

const portalAccessGrantWithoutCustomerContactSelect = `
  id,
  company_id,
  customer_id,
  customer_contact_id,
  user_id,
  status,
  invited_email,
  invited_by,
  invite_expires_at,
  invite_accepted_at,
  activated_at,
  revoked_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    email
  ),
  portal_user:users!portal_access_grants_user_id_fkey (
    id,
    email,
    full_name
  ),
  invited_by_user:users!portal_access_grants_invited_by_fkey (
    id,
    email,
    full_name
  )
`;

const portalProjectAccessSelect = `
  id,
  company_id,
  portal_access_grant_id,
  project_id,
  status,
  revoked_at,
  created_at,
  updated_at,
  projects (
    id,
    customer_id,
    name,
    status
  )
`;

const customerContactPortalPermissionSelect = `
  id,
  company_id,
  customer_contact_id,
  portal_access_grant_id,
  can_view_estimates,
  can_approve_estimates,
  can_sign_contracts,
  can_approve_change_orders,
  can_view_pay_invoices,
  can_request_quotes,
  management_source,
  created_at,
  updated_at
`;

function isPortalAccessGrantRow(value: unknown): value is PortalAccessGrantRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PortalAccessGrantRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    (typeof row.user_id === "string" || row.user_id === null) &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPortalAccessGrantRowArray(value: unknown): value is PortalAccessGrantRow[] {
  return Array.isArray(value) && value.every((row) => isPortalAccessGrantRow(row));
}

function isPortalProjectAccessRow(value: unknown): value is PortalProjectAccessRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PortalProjectAccessRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.portal_access_grant_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPortalProjectAccessRowArray(value: unknown): value is PortalProjectAccessRow[] {
  return Array.isArray(value) && value.every((row) => isPortalProjectAccessRow(row));
}

function isCustomerContactPortalPermissionRow(
  value: unknown
): value is CustomerContactPortalPermissionRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<CustomerContactPortalPermissionRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_contact_id === "string" &&
    typeof row.can_view_estimates === "boolean" &&
    typeof row.can_approve_estimates === "boolean" &&
    typeof row.can_sign_contracts === "boolean" &&
    typeof row.can_approve_change_orders === "boolean" &&
    typeof row.can_view_pay_invoices === "boolean" &&
    typeof row.can_request_quotes === "boolean" &&
    typeof row.management_source === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isCustomerContactPortalPermissionRowArray(
  value: unknown
): value is CustomerContactPortalPermissionRow[] {
  return Array.isArray(value) && value.every((row) => isCustomerContactPortalPermissionRow(row));
}

function isMissingCustomerContactPortalPermissionsTable(error: { message?: string } | null) {
  const message = error?.message ?? "";

  return (
    message.includes("customer_contact_portal_permissions") &&
    (/schema cache/i.test(message) || /does not exist/i.test(message))
  );
}

function isMissingPortalGrantCustomerContactRelationship(error: { message?: string } | null) {
  const message = error?.message ?? "";

  return (
    message.includes("portal_access_grants") &&
    message.includes("customer_contacts") &&
    /schema cache/i.test(message)
  );
}

function mapPortalAccessGrant(row: PortalAccessGrantRow): PortalAccessGrantRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    customerContactId: row.customer_contact_id,
    userId: row.user_id,
    status: row.status,
    invitedEmail: row.invited_email,
    invitedByUserId: row.invited_by,
    inviteExpiresAt: row.invite_expires_at,
    inviteAcceptedAt: row.invite_accepted_at,
    activatedAt: row.activated_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPortalAccessGrantListItem(
  row: PortalAccessGrantRow
): PortalAccessGrantListItem {
  return {
    ...mapPortalAccessGrant(row),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          email: row.customers.email
        }
      : null,
    customerContact: row.customer_contact
      ? {
          id: row.customer_contact.id,
          customerId: row.customer_contact.customer_id,
          contactId: row.customer_contact.contact_id,
          relationshipLabel: row.customer_contact.relationship_label,
          isPrimary: row.customer_contact.is_primary,
          contact: row.customer_contact.contacts
            ? {
                id: row.customer_contact.contacts.id,
                displayName: row.customer_contact.contacts.display_name,
                email: row.customer_contact.contacts.email
              }
            : null
        }
      : null,
    portalUser: row.portal_user
      ? {
          id: row.portal_user.id,
          email: row.portal_user.email,
          fullName: row.portal_user.full_name
        }
      : null,
    invitedByUser: row.invited_by_user
      ? {
          id: row.invited_by_user.id,
          email: row.invited_by_user.email,
          fullName: row.invited_by_user.full_name
        }
      : null,
    inviteEmailDelivery: emptyPortalInviteEmailDeliverySummary()
  };
}

function emptyPortalInviteEmailDeliverySummary(): PortalInviteEmailDeliverySummary {
  return {
    status: "not_sent",
    sendCount: 0,
    lastSentAt: null,
    lastFailedAt: null,
    lastAttemptAt: null,
    lastFailureMessage: null
  };
}

function mapPortalProjectAccess(
  row: PortalProjectAccessRow
): PortalProjectAccessRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    portalAccessGrantId: row.portal_access_grant_id,
    projectId: row.project_id,
    status: row.status,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPortalProjectAccessListItem(
  row: PortalProjectAccessRow
): PortalProjectAccessListItem {
  return {
    ...mapPortalProjectAccess(row),
    project: row.projects
      ? {
          id: row.projects.id,
          customerId: row.projects.customer_id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null
  };
}

function mapCustomerContactPortalPermission(
  row: CustomerContactPortalPermissionRow
): CustomerContactPortalPermissionRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerContactId: row.customer_contact_id,
    portalAccessGrantId: row.portal_access_grant_id,
    canViewEstimates: row.can_view_estimates,
    canApproveEstimates: row.can_approve_estimates,
    canSignContracts: row.can_sign_contracts,
    canApproveChangeOrders: row.can_approve_change_orders,
    canViewPayInvoices: row.can_view_pay_invoices,
    canRequestQuotes: row.can_request_quotes,
    managementSource: row.management_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getPortalAccessGrantIdFromPayload(payload: Record<string, unknown> | null) {
  return typeof payload?.portalAccessGrantId === "string"
    ? payload.portalAccessGrantId
    : null;
}

function summarizePortalInviteEmailDeliveries(
  eventRows: PortalInviteNotificationEventRow[],
  deliveryRows: PortalInviteNotificationDeliveryRow[]
) {
  const eventIdToGrantId = new Map<string, string>();

  for (const event of eventRows) {
    const grantId = getPortalAccessGrantIdFromPayload(event.payload);

    if (grantId) {
      eventIdToGrantId.set(event.id, grantId);
    }
  }

  const summaries = new Map<string, PortalInviteEmailDeliverySummary>();

  for (const delivery of deliveryRows) {
    const grantId = eventIdToGrantId.get(delivery.notification_event_id);

    if (!grantId) {
      continue;
    }

    const existing = summaries.get(grantId) ?? emptyPortalInviteEmailDeliverySummary();
    const attemptAt = delivery.sent_at ?? delivery.failed_at ?? delivery.created_at;
    const isSent =
      delivery.status === "sent" ||
      delivery.status === "delivered" ||
      delivery.status === "opened" ||
      delivery.status === "clicked";
    const isFailed = delivery.status === "failed";

    summaries.set(grantId, {
      status: isFailed && existing.status !== "sent" ? "failed" : isSent ? "sent" : existing.status,
      sendCount: existing.sendCount + (isSent ? 1 : 0),
      lastSentAt:
        isSent && (!existing.lastSentAt || attemptAt.localeCompare(existing.lastSentAt) > 0)
          ? attemptAt
          : existing.lastSentAt,
      lastFailedAt:
        isFailed && (!existing.lastFailedAt || attemptAt.localeCompare(existing.lastFailedAt) > 0)
          ? attemptAt
          : existing.lastFailedAt,
      lastAttemptAt:
        !existing.lastAttemptAt || attemptAt.localeCompare(existing.lastAttemptAt) > 0
          ? attemptAt
          : existing.lastAttemptAt,
      lastFailureMessage:
        isFailed && delivery.error_message
          ? delivery.error_message.slice(0, 240)
          : existing.lastFailureMessage
    });
  }

  return summaries;
}

async function getPortalInviteEmailDeliverySummaries(input: {
  organizationId: string;
  portalAccessGrantIds: string[];
}) {
  if (input.portalAccessGrantIds.length === 0) {
    return new Map<string, PortalInviteEmailDeliverySummary>();
  }

  const supabase = await getSupabaseServerClient();
  const eventsResponse = await supabase
    .from("notification_events")
    .select("id, payload, occurred_at")
    .eq("company_id", input.organizationId)
    .eq("event_type", "portal_invite.email_requested")
    .order("occurred_at", { ascending: false })
    .limit(250);

  if (eventsResponse.error) {
    throw new Error(
      `Unable to load portal invite email events: ${eventsResponse.error.message}`
    );
  }

  const eventRows = ((eventsResponse.data as PortalInviteNotificationEventRow[] | null) ?? [])
    .filter((event) => {
      const grantId = getPortalAccessGrantIdFromPayload(event.payload);
      return grantId ? input.portalAccessGrantIds.includes(grantId) : false;
    });

  if (eventRows.length === 0) {
    return new Map<string, PortalInviteEmailDeliverySummary>();
  }

  const deliveriesResponse = await supabase
    .from("notification_deliveries")
    .select("id, notification_event_id, status, error_message, sent_at, failed_at, created_at")
    .eq("company_id", input.organizationId)
    .in(
      "notification_event_id",
      eventRows.map((event) => event.id)
    )
    .order("created_at", { ascending: false });
  const deliveryRows =
    (deliveriesResponse.data as PortalInviteNotificationDeliveryRow[] | null) ?? [];

  if (deliveriesResponse.error) {
    throw new Error(
      `Unable to load portal invite email deliveries: ${deliveriesResponse.error.message}`
    );
  }

  return summarizePortalInviteEmailDeliveries(eventRows, deliveryRows);
}

async function attachPortalInviteEmailDeliverySummaries(
  organizationId: string,
  grants: PortalAccessGrantListItem[]
) {
  const summaries = await getPortalInviteEmailDeliverySummaries({
    organizationId,
    portalAccessGrantIds: grants.map((grant) => grant.id)
  });

  return grants.map((grant) => ({
    ...grant,
    inviteEmailDelivery:
      summaries.get(grant.id) ?? emptyPortalInviteEmailDeliverySummary()
  }));
}

async function getPortalAdminScope(next = "/settings"): Promise<PortalAdminScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    organizationName:
      organizationContext.organization.displayName?.trim() ||
      organizationContext.organization.legalName?.trim() ||
      "your contractor"
  };
}

export async function requirePortalAdminScope(next = "/settings") {
  const scope = await getPortalAdminScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for portal access management yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function ensureScopedCustomer(organizationId: string, customerId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", customerId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the portal customer: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Customer not found for this organization.");
  }

  return data;
}

async function ensureScopedCustomerContact(
  organizationId: string,
  customerId: string,
  customerContactId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        id,
        customer_id,
        contact_id,
        relationship_label,
        is_primary,
        contacts:contacts!customer_contacts_contact_company_fkey (
          id,
          display_name,
          email
        )
      `
    )
    .eq("company_id", organizationId)
    .eq("customer_id", customerId)
    .eq("id", customerContactId)
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        customer_id?: string;
        contact_id?: string;
        relationship_label?: string | null;
        is_primary?: boolean;
        contacts?:
          | {
              id?: string;
              display_name?: string;
              email?: string | null;
            }
          | null;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the related customer contact: ${response.error.message}`);
  }

  if (!data?.id || !data.customer_id || !data.contact_id) {
    throw new Error("Related customer contact not found for this customer account.");
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    contactId: data.contact_id,
    relationshipLabel: data.relationship_label ?? null,
    isPrimary: data.is_primary ?? false,
    contact: data.contacts?.id && data.contacts.display_name
      ? {
          id: data.contacts.id,
          displayName: data.contacts.display_name,
          email: data.contacts.email ?? null
        }
      : null
  };
}

async function ensureScopedProject(organizationId: string, projectId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id, customer_id, name, status")
    .eq("company_id", organizationId)
    .eq("id", projectId)
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        customer_id?: string;
        name?: string;
        status?: string;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the portal project: ${response.error.message}`);
  }

  if (!data?.id || !data.customer_id || !data.name || !data.status) {
    throw new Error("Project not found for this organization.");
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    name: data.name,
    status: data.status
  };
}

async function ensureScopedPortalAccessGrant(
  organizationId: string,
  portalAccessGrantId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_access_grants")
    .select(portalAccessGrantSelect)
    .eq("company_id", organizationId)
    .eq("id", portalAccessGrantId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the portal access grant: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Portal access grant not found for this organization.");
  }

  return mapPortalAccessGrantListItem(data);
}

async function validatePortalAccessGrantInput(
  organizationId: string,
  input: PortalAccessGrantInput
) {
  await ensureScopedCustomer(organizationId, input.customerId);

  if (input.customerContactId) {
    await ensureScopedCustomerContact(
      organizationId,
      input.customerId,
      input.customerContactId
    );
  }
}

async function validatePortalProjectAccessInput(
  organizationId: string,
  input: PortalProjectAccessInput
) {
  const [portalAccessGrant, project] = await Promise.all([
    ensureScopedPortalAccessGrant(organizationId, input.portalAccessGrantId),
    ensureScopedProject(organizationId, input.projectId)
  ]);

  if (project.customerId !== portalAccessGrant.customerId) {
    throw new Error(
      "Portal project visibility must stay inside the same canonical customer."
    );
  }

  return {
    portalAccessGrant,
    project
  };
}

function mapPortalAccessGrantMutation(input: PortalAccessGrantInput) {
  const now = new Date().toISOString();

  return {
    status: input.status,
    invited_email: input.invitedEmail,
    activated_at: input.status === "active" ? now : null,
    revoked_at: input.status === "revoked" ? now : null
  };
}

function mapPortalProjectAccessMutation(input: PortalProjectAccessInput) {
  return {
    status: input.status,
    revoked_at: input.status === "revoked" ? new Date().toISOString() : null
  };
}

function generatePortalInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPortalInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getPortalInviteExpiration() {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 14);

  return expiration.toISOString();
}

function isUniquePortalAccessGrantViolation(message: string) {
  return message.includes("portal_access_grants_company_customer_user_unique");
}

function isUniquePortalProjectAccessViolation(message: string) {
  return message.includes("portal_project_access_grant_project_unique");
}

async function clearPortalPermissionGrantTraceability(
  organizationId: string,
  portalAccessGrantId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contact_portal_permissions")
    .update({
      portal_access_grant_id: null
    })
    .eq("company_id", organizationId)
    .eq("portal_access_grant_id", portalAccessGrantId);

  if (response.error) {
    throw new Error(
      `Unable to clear existing portal permission grant traceability: ${response.error.message}`
    );
  }
}

async function ensurePortalPermissionSeedForLinkedGrant(input: {
  organizationId: string;
  portalAccessGrantId: string;
  customerContact: Awaited<ReturnType<typeof ensureScopedCustomerContact>>;
}) {
  await clearPortalPermissionGrantTraceability(input.organizationId, input.portalAccessGrantId);

  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("customer_contact_portal_permissions")
    .select(customerContactPortalPermissionSelect)
    .eq("company_id", input.organizationId)
    .eq("customer_contact_id", input.customerContact.id)
    .maybeSingle();
  const existingData: unknown = existingResponse.data;

  if (existingResponse.error) {
    throw new Error(
      `Unable to load stored portal permissions for the linked customer contact: ${existingResponse.error.message}`
    );
  }

  if (isCustomerContactPortalPermissionRow(existingData)) {
    const updateResponse = await supabase
      .from("customer_contact_portal_permissions")
      .update({
        portal_access_grant_id: input.portalAccessGrantId
      })
      .eq("company_id", input.organizationId)
      .eq("id", existingData.id);

    if (updateResponse.error) {
      throw new Error(
        `Unable to sync stored portal permissions for the linked customer contact: ${updateResponse.error.message}`
      );
    }

    return;
  }

  const insertResponse = await supabase.from("customer_contact_portal_permissions").insert({
    company_id: input.organizationId,
    customer_contact_id: input.customerContact.id,
    portal_access_grant_id: input.portalAccessGrantId,
    can_view_estimates: true,
    can_approve_estimates: true,
    can_sign_contracts: true,
    can_approve_change_orders: true,
    can_view_pay_invoices: true,
    can_request_quotes: true,
    management_source: "system_default"
  });

  if (insertResponse.error) {
    throw new Error(
      `Unable to seed stored portal permissions for the linked customer contact: ${insertResponse.error.message}`
    );
  }
}

async function synchronizePortalPermissionStateForGrant(input: {
  organizationId: string;
  portalAccessGrantId: string;
  customerId: string;
  customerContactId: string | null;
}) {
  if (!input.customerContactId) {
    await clearPortalPermissionGrantTraceability(input.organizationId, input.portalAccessGrantId);
    return;
  }

  const customerContact = await ensureScopedCustomerContact(
    input.organizationId,
    input.customerId,
    input.customerContactId
  );

  await ensurePortalPermissionSeedForLinkedGrant({
    organizationId: input.organizationId,
    portalAccessGrantId: input.portalAccessGrantId,
    customerContact
  });
}

export async function findPortalUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("lookup_portal_user_by_email", {
    target_email: normalizedEmail
  });
  const rows = (response.data as
    | Array<{
        user_id?: string;
        email?: string;
        full_name?: string | null;
      }>
    | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to resolve the portal user email: ${response.error.message}`);
  }

  const row = rows[0];

  if (!row?.user_id || !row.email) {
    return null;
  }

  return {
    id: row.user_id,
    email: row.email,
    fullName: row.full_name ?? null
  };
}

function isPortalInvitePreviewRow(value: unknown): value is {
  portal_access_grant_id: string;
  company_id: string;
  customer_id: string;
  customer_name: string;
  customer_company_name: string | null;
  project_id: string;
  project_name: string;
  invited_email: string;
  status: PortalAccessGrantRecord["status"];
  expires_at: string | null;
  accepted_at: string | null;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.portal_access_grant_id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.customer_name === "string" &&
    typeof row.project_id === "string" &&
    typeof row.project_name === "string" &&
    typeof row.invited_email === "string" &&
    typeof row.status === "string"
  );
}

export async function getPortalInvitePreview(token: string): Promise<PortalInvitePreview | null> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("get_portal_invite_preview", {
    target_token_hash: hashPortalInviteToken(normalizedToken)
  });
  const rows = (response.data as unknown[] | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to load the portal invite: ${response.error.message}`);
  }

  const row = rows[0];

  if (!isPortalInvitePreviewRow(row)) {
    return null;
  }

  return {
    portalAccessGrantId: row.portal_access_grant_id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerCompanyName: row.customer_company_name,
    projectId: row.project_id,
    projectName: row.project_name,
    invitedEmail: row.invited_email,
    status: row.status,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at
  };
}

export async function acceptPortalInvite(token: string): Promise<PortalInviteAcceptanceResult> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return {
      accepted: false,
      projectId: null,
      message: "Portal invite token is missing."
    };
  }

  await requireAuthenticatedUser(`/portal/invite?token=${encodeURIComponent(normalizedToken)}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("accept_portal_invite", {
    target_token_hash: hashPortalInviteToken(normalizedToken)
  });
  const rows = (response.data as
    | Array<{
        accepted?: boolean;
        project_id?: string | null;
        message?: string | null;
      }>
    | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to accept the portal invite: ${response.error.message}`);
  }

  const row = rows[0];

  return {
    accepted: row?.accepted === true,
    projectId: row?.project_id ?? null,
    message: row?.message ?? "Unable to accept the portal invite."
  };
}

export const listPortalAccessGrants = cache(
  async (): Promise<PortalAccessGrantListItem[]> => {
    const scope = await requirePortalAdminScope("/settings");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("portal_access_grants")
      .select(portalAccessGrantSelect)
      .eq("company_id", scope.organizationId)
      .order("created_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(`Unable to load portal access grants: ${response.error.message}`);
    }

    if (!isPortalAccessGrantRowArray(data)) {
      return [];
    }

    return attachPortalInviteEmailDeliverySummaries(
      scope.organizationId,
      data.map(mapPortalAccessGrantListItem)
    );
  }
);

export async function listPortalAccessGrantsByCustomer(
  customerId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);
  await ensureScopedCustomer(scope.organizationId, customerId);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_access_grants")
    .select(portalAccessGrantSelect)
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    if (isMissingPortalGrantCustomerContactRelationship(response.error)) {
      const fallbackResponse = await supabase
        .from("portal_access_grants")
        .select(portalAccessGrantWithoutCustomerContactSelect)
        .eq("company_id", scope.organizationId)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      const fallbackData: unknown = fallbackResponse.data;

      if (!fallbackResponse.error && isPortalAccessGrantRowArray(fallbackData)) {
        return attachPortalInviteEmailDeliverySummaries(
          scope.organizationId,
          fallbackData.map(mapPortalAccessGrantListItem)
        );
      }

      return [];
    }

    throw new Error(
      `Unable to load portal access grants for the customer: ${response.error.message}`
    );
  }

  if (!isPortalAccessGrantRowArray(data)) {
    return [];
  }

  return attachPortalInviteEmailDeliverySummaries(
    scope.organizationId,
    data.map(mapPortalAccessGrantListItem)
  );
}

export async function getPortalAccessGrantById(
  portalAccessGrantId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);

  return ensureScopedPortalAccessGrant(scope.organizationId, portalAccessGrantId);
}

export async function createPortalAccessGrant(input: PortalAccessGrantInput) {
  const scope = await requirePortalAdminScope("/settings");
  await validatePortalAccessGrantInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalAccessGrantMutation(input);
  const response = await supabase
    .from("portal_access_grants")
    .insert({
      company_id: scope.organizationId,
      customer_id: input.customerId,
      customer_contact_id: input.customerContactId,
      user_id: input.userId,
      invited_by: scope.userId,
      ...mutation
    })
    .select(portalAccessGrantSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalAccessGrantViolation(response.error.message)) {
      throw new Error(
        "Portal access already exists for this customer and authenticated user."
      );
    }

    throw new Error(`Unable to create portal access: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Unexpected portal access grant response after create.");
  }

  await synchronizePortalPermissionStateForGrant({
    organizationId: scope.organizationId,
    portalAccessGrantId: data.id,
    customerId: input.customerId,
    customerContactId: input.customerContactId
  });

  return mapPortalAccessGrantListItem(data);
}

export async function createPortalInvite(input: PortalInviteInput): Promise<PortalInviteCreationResult> {
  const scope = await requirePortalAdminScope("/settings");

  if (!input.customerContactId) {
    throw new Error("Portal invites must be created from a related customer contact.");
  }

  await validatePortalAccessGrantInput(scope.organizationId, {
    customerId: input.customerId,
    customerContactId: input.customerContactId,
    userId: "00000000-0000-0000-0000-000000000000",
    invitedEmail: input.invitedEmail,
    status: "invited"
  });

  const project = await ensureScopedProject(scope.organizationId, input.projectId);

  if (project.customerId !== input.customerId) {
    throw new Error("Portal invites must be scoped to a project for the same canonical customer.");
  }

  if (!input.invitedEmail) {
    throw new Error("Enter the customer email to invite.");
  }

  const invitedEmail = input.invitedEmail;
  const existingPortalUser = await findPortalUserByEmail(invitedEmail);
  const inviteToken = existingPortalUser ? null : generatePortalInviteToken();
  const inviteTokenHash = inviteToken ? hashPortalInviteToken(inviteToken) : null;
  const inviteExpiresAt = inviteToken ? getPortalInviteExpiration() : null;
  const now = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  const existingGrantResponse = await supabase
    .from("portal_access_grants")
    .select(portalAccessGrantSelect)
    .eq("company_id", scope.organizationId)
    .eq("customer_id", input.customerId)
    .eq("invited_email", invitedEmail)
    .in("status", ["invited", "active"])
    .order("created_at", { ascending: false })
    .limit(1);
  const existingGrantRows = (existingGrantResponse.data as unknown[] | null) ?? [];

  if (existingGrantResponse.error) {
    throw new Error(
      `Unable to check existing portal invite state: ${existingGrantResponse.error.message}`
    );
  }

  const existingGrantData = existingGrantRows[0];

  if (isPortalAccessGrantRow(existingGrantData)) {
    let existingGrant = existingGrantData;

    if (
      existingGrant.customer_contact_id &&
      existingGrant.customer_contact_id !== input.customerContactId
    ) {
      throw new Error(
        "Portal access for this email is already linked to a different customer contact."
      );
    }

    if (!existingGrant.customer_contact_id) {
      const linkResponse = await supabase
        .from("portal_access_grants")
        .update({
          customer_contact_id: input.customerContactId
        })
        .eq("company_id", scope.organizationId)
        .eq("id", existingGrant.id)
        .select(portalAccessGrantSelect)
        .maybeSingle();
      const linkData: unknown = linkResponse.data;

      if (linkResponse.error) {
        throw new Error(
          `Unable to link the existing portal invite to the selected customer contact: ${linkResponse.error.message}`
        );
      }

      if (!isPortalAccessGrantRow(linkData)) {
        throw new Error("Existing portal invite was not found for contact linking.");
      }

      await synchronizePortalPermissionStateForGrant({
        organizationId: scope.organizationId,
        portalAccessGrantId: linkData.id,
        customerId: input.customerId,
        customerContactId: input.customerContactId
      });

      existingGrant = linkData;
    }

    const projectAccessResponse = await supabase
      .from("portal_project_access")
      .insert({
        company_id: scope.organizationId,
        portal_access_grant_id: existingGrant.id,
        project_id: input.projectId,
        status: "active"
      })
      .select(portalProjectAccessSelect)
      .single();
    const projectAccessData: unknown = projectAccessResponse.data;

    if (projectAccessResponse.error) {
      if (!isUniquePortalProjectAccessViolation(projectAccessResponse.error.message)) {
        throw new Error(
          `Unable to add project visibility for the existing portal invite: ${projectAccessResponse.error.message}`
        );
      }
    }

    return {
      portalAccessGrant: mapPortalAccessGrantListItem(existingGrant),
      projectAccess: isPortalProjectAccessRow(projectAccessData)
        ? mapPortalProjectAccessListItem(projectAccessData)
        : null,
      invitedEmail,
      inviteToken: null,
      inviteExpiresAt: existingGrant.invite_expires_at,
      activatedImmediately: existingGrant.status === "active",
      reusedExistingGrant: true
    };
  }

  const response = await supabase
    .from("portal_access_grants")
    .insert({
      company_id: scope.organizationId,
      customer_id: input.customerId,
      customer_contact_id: input.customerContactId,
      user_id: existingPortalUser?.id ?? null,
      invited_by: scope.userId,
      invited_email: invitedEmail,
      status: existingPortalUser ? "active" : "invited",
      activated_at: existingPortalUser ? now : null,
      invite_token_hash: inviteTokenHash,
      invite_expires_at: inviteExpiresAt,
      invite_accepted_at: existingPortalUser ? now : null
    })
    .select(portalAccessGrantSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalAccessGrantViolation(response.error.message)) {
      throw new Error(
        "Portal access already exists for this customer and authenticated user."
      );
    }

    throw new Error(`Unable to create the portal invite: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Unexpected portal invite response after create.");
  }

  await synchronizePortalPermissionStateForGrant({
    organizationId: scope.organizationId,
    portalAccessGrantId: data.id,
    customerId: input.customerId,
    customerContactId: input.customerContactId
  });

  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .insert({
      company_id: scope.organizationId,
      portal_access_grant_id: data.id,
      project_id: input.projectId,
      status: "active"
    })
    .select(portalProjectAccessSelect)
    .single();
  const projectAccessData: unknown = projectAccessResponse.data;

  if (projectAccessResponse.error) {
    if (!isUniquePortalProjectAccessViolation(projectAccessResponse.error.message)) {
      throw new Error(
        `Unable to add project visibility for the portal invite: ${projectAccessResponse.error.message}`
      );
    }
  }

  return {
    portalAccessGrant: mapPortalAccessGrantListItem(data),
    projectAccess: isPortalProjectAccessRow(projectAccessData)
      ? mapPortalProjectAccessListItem(projectAccessData)
      : null,
    invitedEmail,
    inviteToken,
    inviteExpiresAt,
    activatedImmediately: Boolean(existingPortalUser),
    reusedExistingGrant: false
  };
}

async function prepareFreshPortalInviteToken(input: {
  organizationId: string;
  portalAccessGrantId: string;
}) {
  const inviteToken = generatePortalInviteToken();
  const inviteExpiresAt = getPortalInviteExpiration();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_access_grants")
    .update({
      invite_token_hash: hashPortalInviteToken(inviteToken),
      invite_expires_at: inviteExpiresAt
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.portalAccessGrantId)
    .eq("status", "invited")
    .is("user_id", null)
    .select(portalAccessGrantSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to prepare a fresh portal invite link: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Only pending unaccepted portal invites can be sent or resent.");
  }

  return {
    portalAccessGrant: mapPortalAccessGrantListItem(data),
    inviteToken,
    inviteExpiresAt
  };
}

async function getPrimaryProjectForPortalInviteEmail(input: {
  organizationId: string;
  portalAccessGrantId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_project_access")
    .select(portalProjectAccessSelect)
    .eq("company_id", input.organizationId)
    .eq("portal_access_grant_id", input.portalAccessGrantId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load project visibility for portal invite email: ${response.error.message}`
    );
  }

  if (!isPortalProjectAccessRow(data)) {
    throw new Error("Add project visibility before sending a portal invite email.");
  }

  return mapPortalProjectAccessListItem(data);
}

export async function sendPortalInviteEmail(input: {
  portalAccessGrantId: string;
  inviteOrigin: string;
  next?: string;
}): Promise<PortalInviteEmailSendResult> {
  const scope = await requirePortalAdminScope(input.next ?? "/settings");
  const existingGrant = await ensureScopedPortalAccessGrant(
    scope.organizationId,
    input.portalAccessGrantId
  );

  if (existingGrant.status !== "invited") {
    throw new Error("Only pending portal invites can be sent or resent.");
  }

  if (existingGrant.userId) {
    throw new Error("This contact already has an authenticated portal account linked.");
  }

  const invitedEmail = existingGrant.invitedEmail?.trim().toLowerCase();

  if (!invitedEmail) {
    throw new Error("Pending portal invites must have an invited email before sending.");
  }

  const [{ portalAccessGrant, inviteToken, inviteExpiresAt }, projectAccess, lockState] =
    await Promise.all([
      prepareFreshPortalInviteToken({
        organizationId: scope.organizationId,
        portalAccessGrantId: input.portalAccessGrantId
      }),
      getPrimaryProjectForPortalInviteEmail({
        organizationId: scope.organizationId,
        portalAccessGrantId: input.portalAccessGrantId
      }),
      getOrganizationProductionActionLockState(scope.organizationId)
    ]);

  if (lockState.isLocked) {
    return {
      portalAccessGrant,
      invitedEmail,
      inviteToken,
      inviteExpiresAt,
      emailStatus: "not_sent",
      reason: "activation_locked",
      message:
        "A fresh invite link was prepared, but provider-backed email is locked during early access."
    };
  }

  if (!isPostmarkEmailConfigured()) {
    return {
      portalAccessGrant,
      invitedEmail,
      inviteToken,
      inviteExpiresAt,
      emailStatus: "not_sent",
      reason: "not_configured",
      message:
        "A fresh invite link was prepared, but Postmark email delivery is not configured."
    };
  }

  const inviteUrl = `${input.inviteOrigin}/portal/invite?token=${encodeURIComponent(inviteToken)}`;
  const emailContent = buildPortalInviteEmailContent({
    contractorCompanyName: scope.organizationName,
    contactName: portalAccessGrant.customerContact?.contact?.displayName ?? null,
    customerName:
      portalAccessGrant.customer?.companyName ??
      portalAccessGrant.customer?.name ??
      null,
    projectName: projectAccess.project?.name ?? null,
    inviteUrl
  });
  const { createNotificationEvent, sendTrackedNotificationEmail } = await import(
    "@/lib/notifications/system"
  );
  const notificationEvent = await createNotificationEvent({
    organizationId: scope.organizationId,
    category: "communication",
    severity: "neutral",
    eventType: "portal_invite.email_requested",
    subjectType: "customer",
    subjectId: portalAccessGrant.customerId,
    customerId: portalAccessGrant.customerId,
    projectId: projectAccess.projectId,
    actorType: "organization_user",
    actorUserId: scope.userId,
    title: "Portal invite email requested",
    message: `Portal invite email requested for ${portalAccessGrant.customer?.name ?? "customer"}.`,
    linkPath: `/customers/${portalAccessGrant.customerId}`,
    groupKey: `portal_invite:${portalAccessGrant.id}`,
    payload: {
      portalAccessGrantId: portalAccessGrant.id,
      customerContactId: portalAccessGrant.customerContactId,
      projectId: projectAccess.projectId,
      purpose: "portal_invite_email"
    },
    markReadUserIds: [scope.userId]
  });

  try {
    await sendTrackedNotificationEmail({
      organizationId: scope.organizationId,
      notificationEventId: notificationEvent.id,
      recipientEmail: invitedEmail,
      recipientUserId: null,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
      textBody: emailContent.textBody,
      payload: {
        subjectType: "customer",
        subjectId: portalAccessGrant.customerId,
        portalAccessGrantId: portalAccessGrant.id,
        customerContactId: portalAccessGrant.customerContactId,
        projectId: projectAccess.projectId,
        purpose: "portal_invite_email"
      }
    });

    return {
      portalAccessGrant,
      invitedEmail,
      inviteToken,
      inviteExpiresAt,
      emailStatus: "sent",
      reason: "sent",
      message: `Portal invite email sent to ${invitedEmail}.`
    };
  } catch {
    return {
      portalAccessGrant,
      invitedEmail,
      inviteToken,
      inviteExpiresAt,
      emailStatus: "failed",
      reason: "provider_failed",
      message:
        "A fresh invite link was prepared, but the provider email send failed. The failed delivery attempt was recorded when possible."
    };
  }
}

export async function updatePortalAccessGrant(
  portalAccessGrantId: string,
  input: PortalAccessGrantInput
) {
  const scope = await requirePortalAdminScope(`/settings?portalAccessGrantId=${portalAccessGrantId}`);
  await validatePortalAccessGrantInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalAccessGrantMutation(input);
  const response = await supabase
    .from("portal_access_grants")
    .update({
      customer_id: input.customerId,
      customer_contact_id: input.customerContactId,
      user_id: input.userId,
      invited_by: scope.userId,
      ...mutation
    })
    .eq("company_id", scope.organizationId)
    .eq("id", portalAccessGrantId)
    .select(portalAccessGrantSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalAccessGrantViolation(response.error.message)) {
      throw new Error(
        "Portal access already exists for this customer and authenticated user."
      );
    }

    throw new Error(`Unable to update portal access: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Portal access grant not found for this organization.");
  }

  await synchronizePortalPermissionStateForGrant({
    organizationId: scope.organizationId,
    portalAccessGrantId: data.id,
    customerId: input.customerId,
    customerContactId: input.customerContactId
  });

  return mapPortalAccessGrantListItem(data);
}

export async function updatePortalAccessGrantStatus(
  portalAccessGrantId: string,
  status: PortalAccessGrantRecord["status"]
) {
  const scope = await requirePortalAdminScope(`/settings?portalAccessGrantId=${portalAccessGrantId}`);
  await ensureScopedPortalAccessGrant(scope.organizationId, portalAccessGrantId);
  const supabase = await getSupabaseServerClient();
  const now = new Date().toISOString();
  const response = await supabase
    .from("portal_access_grants")
    .update({
      status,
      activated_at: status === "active" ? now : null,
      revoked_at: status === "revoked" ? now : null
    })
    .eq("company_id", scope.organizationId)
    .eq("id", portalAccessGrantId)
    .select(portalAccessGrantSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update portal access: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Portal access grant not found for this organization.");
  }

  return mapPortalAccessGrantListItem(data);
}

export async function listCustomerContactPortalPermissionsByCustomer(
  customerId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);
  await ensureScopedCustomer(scope.organizationId, customerId);
  const supabase = await getSupabaseServerClient();
  const customerContactsResponse = await supabase
    .from("customer_contacts")
    .select("id")
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId);
  const customerContactRows =
    (customerContactsResponse.data as Array<{ id?: string }> | null) ?? [];

  if (customerContactsResponse.error) {
    throw new Error(
      `Unable to load related contacts for stored portal permissions: ${customerContactsResponse.error.message}`
    );
  }

  const customerContactIds = customerContactRows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (customerContactIds.length === 0) {
    return [];
  }

  const response = await supabase
    .from("customer_contact_portal_permissions")
    .select(customerContactPortalPermissionSelect)
    .eq("company_id", scope.organizationId)
    .in("customer_contact_id", customerContactIds)
    .order("created_at", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    if (isMissingCustomerContactPortalPermissionsTable(response.error)) {
      return [];
    }

    throw new Error(
      `Unable to load stored portal permissions for the customer: ${response.error.message}`
    );
  }

  if (!isCustomerContactPortalPermissionRowArray(data)) {
    return [];
  }

  return data.map(mapCustomerContactPortalPermission);
}

export async function updateCustomerContactPortalPermission(
  input: CustomerContactPortalPermissionInput
) {
  const scope = await requirePortalAdminScope(
    `/settings?portalAccessGrantId=${input.portalAccessGrantId}`
  );
  const portalAccessGrant = await ensureScopedPortalAccessGrant(
    scope.organizationId,
    input.portalAccessGrantId
  );

  if (!portalAccessGrant.customerContactId) {
    throw new Error(
      "Stored contact permissions can only be updated for linked-contact portal grants."
    );
  }

  if (portalAccessGrant.customerContactId !== input.customerContactId) {
    throw new Error(
      "Stored contact permissions must match the linked customer contact on this portal grant."
    );
  }

  await ensureScopedCustomerContact(
    scope.organizationId,
    portalAccessGrant.customerId,
    input.customerContactId
  );

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contact_portal_permissions")
    .upsert(
      {
        company_id: scope.organizationId,
        customer_contact_id: input.customerContactId,
        portal_access_grant_id: input.portalAccessGrantId,
        can_view_estimates: input.canViewEstimates,
        can_approve_estimates: input.canApproveEstimates,
        can_sign_contracts: input.canSignContracts,
        can_approve_change_orders: input.canApproveChangeOrders,
        can_view_pay_invoices: input.canViewPayInvoices,
        can_request_quotes: input.canRequestQuotes,
        management_source: "contractor_admin",
        last_managed_by_user_id: scope.userId,
        last_override_by_user_id: scope.userId
      },
      {
        onConflict: "company_id,customer_contact_id"
      }
    )
    .select(customerContactPortalPermissionSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update stored portal permissions: ${response.error.message}`);
  }

  if (!isCustomerContactPortalPermissionRow(data)) {
    throw new Error("Unexpected stored portal permission response after update.");
  }

  return mapCustomerContactPortalPermission(data);
}

export async function resolvePortalScopedPermissionForCurrentUser(input: {
  customerId: string;
  projectId: string;
  permission: PortalScopedPermissionKey;
  next?: string;
}): Promise<PortalScopedPermissionResolution> {
  const next = input.next ?? "/portal";
  const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
    (grant) => grant.status === "active" && grant.customerId === input.customerId
  );

  if (activeGrants.length === 0) {
    throw new Error("No active portal access is available for this customer.");
  }

  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("portal_access_grant_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("project_id", input.projectId)
    .eq("status", "active");
  const projectAccessRows =
    (projectAccessResponse.data as Array<{ portal_access_grant_id?: string }> | null) ?? [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate project-scoped portal access: ${projectAccessResponse.error.message}`
    );
  }

  const scopedGrantIds = new Set(
    projectAccessRows
      .map((row) => row.portal_access_grant_id)
      .filter((value): value is string => typeof value === "string")
  );
  const scopedGrant = activeGrants.find((grant) => scopedGrantIds.has(grant.id));

  if (!scopedGrant) {
    throw new Error("This record is not available in the current portal scope.");
  }

  return resolvePortalScopedPermissionForGrantRecord({
    organizationId: scopedGrant.organizationId,
    customerId: scopedGrant.customerId,
    projectId: input.projectId,
    portalAccessGrantId: scopedGrant.id,
    customerContactId: scopedGrant.customerContactId,
    permission: input.permission
  });
}

export async function listPortalProjectAccessByGrantId(
  portalAccessGrantId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);
  await ensureScopedPortalAccessGrant(scope.organizationId, portalAccessGrantId);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_project_access")
    .select(portalProjectAccessSelect)
    .eq("company_id", scope.organizationId)
    .eq("portal_access_grant_id", portalAccessGrantId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load portal project visibility: ${response.error.message}`
    );
  }

  if (!isPortalProjectAccessRowArray(data)) {
    return [];
  }

  return data.map(mapPortalProjectAccessListItem);
}

export async function createPortalProjectAccess(input: PortalProjectAccessInput) {
  const scope = await requirePortalAdminScope("/settings");
  await validatePortalProjectAccessInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalProjectAccessMutation(input);
  const response = await supabase
    .from("portal_project_access")
    .insert({
      company_id: scope.organizationId,
      portal_access_grant_id: input.portalAccessGrantId,
      project_id: input.projectId,
      ...mutation
    })
    .select(portalProjectAccessSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalProjectAccessViolation(response.error.message)) {
      throw new Error("Portal project visibility already exists for this grant.");
    }

    throw new Error(`Unable to create portal project visibility: ${response.error.message}`);
  }

  if (!isPortalProjectAccessRow(data)) {
    throw new Error("Unexpected portal project visibility response after create.");
  }

  return mapPortalProjectAccessListItem(data);
}

export async function updatePortalProjectAccess(
  portalProjectAccessId: string,
  input: PortalProjectAccessInput
) {
  const scope = await requirePortalAdminScope(
    `/settings?portalProjectAccessId=${portalProjectAccessId}`
  );
  await validatePortalProjectAccessInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalProjectAccessMutation(input);
  const response = await supabase
    .from("portal_project_access")
    .update({
      portal_access_grant_id: input.portalAccessGrantId,
      project_id: input.projectId,
      ...mutation
    })
    .eq("company_id", scope.organizationId)
    .eq("id", portalProjectAccessId)
    .select(portalProjectAccessSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalProjectAccessViolation(response.error.message)) {
      throw new Error("Portal project visibility already exists for this grant.");
    }

    throw new Error(`Unable to update portal project visibility: ${response.error.message}`);
  }

  if (!isPortalProjectAccessRow(data)) {
    throw new Error("Portal project visibility not found for this organization.");
  }

  return mapPortalProjectAccessListItem(data);
}

export const listPortalAccessGrantsForCurrentUser = cache(
  async (next = "/portal"): Promise<PortalAccessGrantRecord[]> => {
    const user = await requireAuthenticatedUser(next);
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("portal_access_grants")
      .select(
        `
          id,
          company_id,
          customer_id,
          customer_contact_id,
          user_id,
          status,
          invited_email,
          invited_by,
          invite_expires_at,
          invite_accepted_at,
          activated_at,
          revoked_at,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load portal access grants for the authenticated user: ${response.error.message}`
      );
    }

    if (!isPortalAccessGrantRowArray(data)) {
      return [];
    }

    return data.map(mapPortalAccessGrant);
  }
);

export const listPortalAccessibleProjectIdsForCurrentUser = cache(
  async (next = "/portal"): Promise<string[]> => {
    const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
      (grant) => grant.status === "active"
    );

    if (activeGrants.length === 0) {
      return [];
    }

    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("portal_project_access")
      .select(
        `
          id,
          company_id,
          portal_access_grant_id,
          project_id,
          status,
          revoked_at,
          created_at,
          updated_at
        `
      )
      .in(
        "portal_access_grant_id",
        activeGrants.map((grant) => grant.id)
      )
      .eq("status", "active");
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load accessible portal projects for the authenticated user: ${response.error.message}`
      );
    }

    if (!isPortalProjectAccessRowArray(data)) {
      return [];
    }

    return [...new Set(data.map((row) => row.project_id))];
  }
);
