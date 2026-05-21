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
