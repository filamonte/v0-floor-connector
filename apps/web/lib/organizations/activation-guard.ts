import "server-only";

import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const PRODUCTION_ACTION_LOCKED_MESSAGE =
  "This action is locked during early access. Your account must be activated before sending externally or processing payments.";

type OrganizationActivationState = {
  id?: string | null;
  tenantStatus: string | null;
  lifecycleState: string | null;
};

const productionTenantStatuses = new Set(["active", "approved"]);
const productionLifecycleStates = new Set(["active", "approved"]);

export function isOrganizationActivatedForProductionAction(
  organization: OrganizationActivationState
) {
  return (
    productionTenantStatuses.has(organization.tenantStatus ?? "") &&
    productionLifecycleStates.has(organization.lifecycleState ?? "")
  );
}

export function assertOrganizationStateAllowsProductionAction(
  organization: OrganizationActivationState
) {
  if (!isOrganizationActivatedForProductionAction(organization)) {
    throw new Error(PRODUCTION_ACTION_LOCKED_MESSAGE);
  }
}

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
