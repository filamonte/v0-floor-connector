export type EarlyAccessOperatingState =
  | "pending_setup"
  | "pending_activation"
  | "active_founder_access"
  | "suspended_or_blocked";

export type EarlyAccessOperatingTenantInput = {
  tenantStatus: string;
  lifecycleState: string;
  hasCompanyProfile: boolean;
  hasPaymentMethod: boolean;
  projectCount: number;
  estimateCount: number;
  contractCount: number;
  invoiceCount: number;
};

export type EarlyAccessOperatingModel = {
  state: EarlyAccessOperatingState;
  statusLabel: string;
  billingLabel: string;
  followUpLabel: string;
  allowsProductionActions: boolean;
};

export type EarlyAccessOperatingSummary = {
  pendingSetup: number;
  pendingActivation: number;
  activeFounderAccess: number;
  suspendedOrBlocked: number;
};

function hasLockedLifecycle(input: EarlyAccessOperatingTenantInput) {
  return (
    input.tenantStatus === "suspended" ||
    input.tenantStatus === "locked" ||
    input.lifecycleState === "locked"
  );
}

function hasActiveFounderAccess(input: EarlyAccessOperatingTenantInput) {
  return input.tenantStatus === "active" && input.lifecycleState === "active";
}

export function getEarlyAccessOperatingState(
  input: EarlyAccessOperatingTenantInput
): EarlyAccessOperatingModel {
  if (hasLockedLifecycle(input)) {
    return {
      state: "suspended_or_blocked",
      statusLabel: "Suspended / blocked",
      billingLabel: input.hasPaymentMethod
        ? "SetupIntent payment method saved"
        : "No payment method reference",
      followUpLabel: "Review account status before any activation decision.",
      allowsProductionActions: false
    };
  }

  if (hasActiveFounderAccess(input)) {
    return {
      state: "active_founder_access",
      statusLabel: "Active founder access",
      billingLabel: input.hasPaymentMethod
        ? "SetupIntent payment method saved"
        : "No payment method reference",
      followUpLabel: "Monitor first workflow progress and feedback.",
      allowsProductionActions: true
    };
  }

  if (!input.hasCompanyProfile) {
    return {
      state: "pending_setup",
      statusLabel: "Pending setup",
      billingLabel: input.hasPaymentMethod
        ? "SetupIntent payment method saved"
        : "No payment method reference",
      followUpLabel: "Company profile still needs setup before activation review.",
      allowsProductionActions: false
    };
  }

  return {
    state: "pending_activation",
    statusLabel: "Pending activation",
    billingLabel: input.hasPaymentMethod
      ? "SetupIntent payment method saved"
      : "No payment method reference",
    followUpLabel: input.hasPaymentMethod
      ? "Ready for operator activation review; no subscription is implied."
      : "Billing method can be collected later; activation remains manual.",
    allowsProductionActions: false
  };
}

export function buildEarlyAccessOperatingSummary(
  tenants: EarlyAccessOperatingTenantInput[]
): EarlyAccessOperatingSummary {
  return tenants.reduce<EarlyAccessOperatingSummary>(
    (summary, tenant) => {
      const model = getEarlyAccessOperatingState(tenant);

      if (model.state === "pending_setup") {
        summary.pendingSetup += 1;
      } else if (model.state === "pending_activation") {
        summary.pendingActivation += 1;
      } else if (model.state === "active_founder_access") {
        summary.activeFounderAccess += 1;
      } else {
        summary.suspendedOrBlocked += 1;
      }

      return summary;
    },
    {
      pendingSetup: 0,
      pendingActivation: 0,
      activeFounderAccess: 0,
      suspendedOrBlocked: 0
    }
  );
}
