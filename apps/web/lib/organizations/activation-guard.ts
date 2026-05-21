import "server-only";

import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  PRODUCTION_ACTION_LOCKED_MESSAGE,
  assertOrganizationStateAllowsProductionAction,
  isOrganizationActivatedForProductionAction
} from "@/lib/organizations/activation-guard-core";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export {
  PRODUCTION_ACTION_LOCKED_MESSAGE,
  assertOrganizationStateAllowsProductionAction,
  isOrganizationActivatedForProductionAction
};

async function getOrganizationActivationState(organizationId: string) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("companies")
    .select("id, tenant_status, lifecycle_state")
    .eq("id", organizationId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load organization activation state: ${response.error.message}`
    );
  }

  const data = response.data as
    | {
        id?: string | null;
        tenant_status?: string | null;
        lifecycle_state?: string | null;
      }
    | null;

  if (!data?.id) {
    throw new Error("Organization not found for activation guard.");
  }

  return {
    id: data.id,
    tenantStatus: data.tenant_status ?? null,
    lifecycleState: data.lifecycle_state ?? null
  };
}

export async function assertActiveOrganizationCanPerformProductionAction(
  userId: string
) {
  const organizationContext = await getActiveOrganizationContext(userId);

  if (!organizationContext) {
    throw new Error("No active organization is available for this action.");
  }

  assertOrganizationStateAllowsProductionAction({
    id: organizationContext.organization.id,
    tenantStatus: organizationContext.organization.tenantStatus,
    lifecycleState: organizationContext.organization.lifecycleState
  });

  return organizationContext;
}

export async function assertOrganizationCanPerformProductionAction(
  organizationId: string
) {
  const organization = await getOrganizationActivationState(organizationId);
  assertOrganizationStateAllowsProductionAction(organization);

  return organization;
}

export async function getOrganizationProductionActionLockState(organizationId: string) {
  const organization = await getOrganizationActivationState(organizationId);

  return {
    organization,
    isLocked: !isOrganizationActivatedForProductionAction(organization)
  };
}

export async function assertInvoiceOrganizationCanPerformProductionAction(
  invoiceId: string
) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("invoices")
    .select("company_id")
    .eq("id", invoiceId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load invoice organization for activation guard: ${response.error.message}`
    );
  }

  const data = response.data as { company_id?: string | null } | null;

  if (!data?.company_id) {
    throw new Error("Invoice not found for activation guard.");
  }

  return assertOrganizationCanPerformProductionAction(data.company_id);
}
