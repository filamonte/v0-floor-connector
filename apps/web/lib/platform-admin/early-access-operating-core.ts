export type EarlyAccessOperatingState =
  | "pending_setup"
  | "pending_activation"
  | "active_founder_access"
  | "suspended_or_blocked";

export const founderBillingStatuses = [
  "not_started",
  "pending",
  "evidence_received",
  "waived",
  "blocked"
] as const;

export const founderBillingMethods = [
  "manual_invoice",
  "stripe_payment_link",
  "stripe_subscription_future",
  "waived"
] as const;

export type FounderBillingStatus = (typeof founderBillingStatuses)[number];
export type FounderBillingMethod = (typeof founderBillingMethods)[number];

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

export type FounderBillingEvidenceInput = {
  status: FounderBillingStatus;
  method: FounderBillingMethod;
  monthlyAmountCents: number | null;
  evidenceReceivedAt: string | null;
  followUpAt: string | null;
};

export type FounderBillingEvidenceModel = {
  statusLabel: string;
  methodLabel: string;
  amountLabel: string;
  evidenceLabel: string;
  followUpLabel: string;
  tone: "neutral" | "good" | "warning" | "critical";
  hasEvidence: boolean;
};

const founderBillingStatusLabels: Record<FounderBillingStatus, string> = {
  not_started: "Not started",
  pending: "Pending evidence",
  evidence_received: "Evidence received",
  waived: "Waived",
  blocked: "Blocked"
};

const founderBillingMethodLabels: Record<FounderBillingMethod, string> = {
  manual_invoice: "Manual invoice",
  stripe_payment_link: "Stripe Payment Link",
  stripe_subscription_future: "Future Stripe subscription",
  waived: "Waived"
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

function formatCurrencyCents(value: number | null) {
  if (value == null) {
    return "No expected amount";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 100 === 0 ? 0 : 2
  }).format(value / 100);
}

function formatDateLabel(value: string | null, emptyLabel: string) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
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

export function getFounderBillingEvidenceModel(
  input: FounderBillingEvidenceInput
): FounderBillingEvidenceModel {
  const hasEvidence =
    input.status === "evidence_received" ||
    input.status === "waived" ||
    Boolean(input.evidenceReceivedAt);
  const tone =
    input.status === "blocked"
      ? "critical"
      : hasEvidence
        ? "good"
        : input.status === "pending"
          ? "warning"
          : "neutral";

  return {
    statusLabel: founderBillingStatusLabels[input.status],
    methodLabel: founderBillingMethodLabels[input.method],
    amountLabel: formatCurrencyCents(input.monthlyAmountCents),
    evidenceLabel: formatDateLabel(
      input.evidenceReceivedAt,
      "No evidence timestamp"
    ),
    followUpLabel: formatDateLabel(input.followUpAt, "No follow-up set"),
    tone,
    hasEvidence
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
