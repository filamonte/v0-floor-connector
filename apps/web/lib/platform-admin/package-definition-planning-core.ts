export type PlatformPackagePlanningClassification =
  | "product_packaging"
  | "commercial_billing"
  | "runtime_entitlement"
  | "module_visibility"
  | "usage_limits"
  | "onboarding_defaults"
  | "segmentation"
  | "provider_mapping"
  | "feature_flag"
  | "lifecycle_status"
  | "contract_exception";

export type PlatformPackagePlanningConcept = {
  id: string;
  label: string;
  classification: PlatformPackagePlanningClassification;
  futurePurpose: string;
  currentBoundary: string;
};

export type PlatformPackagePlanningLifecycleState = {
  state: string;
  description: string;
};

export type PlatformPackageDefinitionPlanningModel = {
  readOnly: true;
  runtimeEnforcement: false;
  mutationControlsAvailable: false;
  planningOnly: true;
  proposedDimensions: PlatformPackagePlanningConcept[];
  futureLifecycleStates: PlatformPackagePlanningLifecycleState[];
  futureRequiredApprovals: string[];
  futureDataDependencies: string[];
  futureEnforcementBoundaries: string[];
  risksAndCaveats: string[];
};

export function buildPlatformPackageDefinitionPlanningModel(): PlatformPackageDefinitionPlanningModel {
  return {
    readOnly: true,
    runtimeEnforcement: false,
    mutationControlsAvailable: false,
    planningOnly: true,
    proposedDimensions: [
      {
        id: "package_definition",
        label: "Package definition",
        classification: "product_packaging",
        futurePurpose:
          "Defines the business-facing package a contractor can be sold or assigned to, including included capabilities, target segment, and lifecycle.",
        currentBoundary:
          "Not implemented as a real package table or assignment system; the current page only inspects existing subscription-plan references."
      },
      {
        id: "billing_plan",
        label: "Billing plan",
        classification: "commercial_billing",
        futurePurpose:
          "Represents commercial billing terms and the future subscription/provider mapping for a package.",
        currentBoundary:
          "No billing-plan mutation, subscription operation, invoice creation, charge, or Stripe provider write is available here."
      },
      {
        id: "plan_tier",
        label: "Plan tier",
        classification: "product_packaging",
        futurePurpose:
          "Groups packages into comparable tiers for packaging, sales, reporting, and migration planning.",
        currentBoundary:
          "No current tier resolver affects runtime access, pricing, billing, or contractor visibility."
      },
      {
        id: "module_availability",
        label: "Module availability",
        classification: "module_visibility",
        futurePurpose:
          "Defines which module families may become visible or configurable for a future package.",
        currentBoundary:
          "No module visibility or module gate is enforced by package governance today."
      },
      {
        id: "usage_limits",
        label: "Usage limits",
        classification: "usage_limits",
        futurePurpose:
          "Defines future package limits such as seats, active projects, storage, sends, or provider-backed usage.",
        currentBoundary:
          "No usage counter, cap, throttle, or runtime limiter is implemented by this planning model."
      },
      {
        id: "starter_pack_defaults",
        label: "Onboarding/default starter packs",
        classification: "onboarding_defaults",
        futurePurpose:
          "Maps a future package to default onboarding seeds for templates, catalogs, and starter systems.",
        currentBoundary:
          "Starter packs remain onboarding/provisioning governance, not billing enforcement or entitlement gates."
      },
      {
        id: "contractor_group_targeting",
        label: "Contractor group targeting",
        classification: "segmentation",
        futurePurpose:
          "Uses platform segmentation to suggest package fit, onboarding defaults, or migration cohorts.",
        currentBoundary:
          "Contractor groups are segmentation metadata, not billing plans, tenant roles, entitlements, or package assignments."
      },
      {
        id: "billing_provider_mapping",
        label: "Billing provider mapping",
        classification: "provider_mapping",
        futurePurpose:
          "Maps an internal billing plan to future provider artifacts such as Stripe products, prices, subscriptions, and invoices.",
        currentBoundary:
          "The planning model does not call Stripe, expose secrets, sync provider state, or create/update/cancel subscriptions."
      },
      {
        id: "entitlements",
        label: "Entitlements",
        classification: "runtime_entitlement",
        futurePurpose:
          "Defines future server-side capability checks that decide whether a contractor may use a feature.",
        currentBoundary:
          "No entitlement checks, permission changes, or runtime capability gates are added by this slice."
      },
      {
        id: "feature_flags",
        label: "Feature flags",
        classification: "feature_flag",
        futurePurpose:
          "Allows controlled rollout and kill-switch behavior around future package-controlled capabilities.",
        currentBoundary:
          "Existing feature-policy records are not converted into package enforcement or runtime flags here."
      },
      {
        id: "trial_early_access_status",
        label: "Trial / early-access status",
        classification: "lifecycle_status",
        futurePurpose:
          "Keeps package planning separate from tenant activation, trial, and early-access lifecycle states.",
        currentBoundary:
          "Activation remains on existing company tenant status and lifecycle fields; this model does not toggle activation."
      },
      {
        id: "grandfathered_custom_contracts",
        label: "Grandfathered / custom contracts",
        classification: "contract_exception",
        futurePurpose:
          "Records future exceptions where a contractor's commercial contract differs from standard packages or provider terms.",
        currentBoundary:
          "No custom contract, price override, invoice, tax, payroll, or subscription behavior is implemented here."
      }
    ],
    futureLifecycleStates: [
      {
        state: "draft",
        description: "Package is being designed and is not assignable."
      },
      {
        state: "review",
        description: "Package semantics, billing mapping, and enforcement boundaries need approval."
      },
      {
        state: "published",
        description: "Package can become selectable only after future schema, billing, entitlement, and QA gates exist."
      },
      {
        state: "grandfathered",
        description: "Package remains available only for existing/custom-contract tenants."
      },
      {
        state: "retired",
        description: "Package is no longer available for new assignments."
      }
    ],
    futureRequiredApprovals: [
      "Product approval for package names, target segments, included modules, limits, and packaging language.",
      "Billing approval for commercial terms, provider mapping, taxes, invoices, subscription operations, and customer notices.",
      "Security approval for server-side entitlement boundaries, RLS posture, provider secrets, and service-role isolation.",
      "Operations approval for migrations, grandfathering, trial transitions, support runbooks, and rollback strategy."
    ],
    futureDataDependencies: [
      "Internal package-definition records with lifecycle, tier, included dimensions, and audit history.",
      "Billing-plan/provider mapping records for Stripe products, prices, subscriptions, invoices, and provider status.",
      "Explicit organization package assignment records with effective dates, custom-contract exceptions, and approval evidence.",
      "Server-side entitlement and module-visibility resolution that can be tested before any contractor-facing change.",
      "Usage counters and limit snapshots only after the product decides which limits matter and where they are enforced."
    ],
    futureEnforcementBoundaries: [
      "Package definitions describe product packaging; they do not by themselves grant runtime access.",
      "Billing plans describe commercial/provider terms; they do not by themselves become entitlements.",
      "Entitlements must be enforced server-side at the workflow boundary that owns the protected capability.",
      "Module visibility can hide or reveal navigation, but server-side checks must still protect privileged behavior.",
      "Contractor groups can target or segment packages, but they are not billing plans, tenant roles, or permissions.",
      "Starter pack assignments can seed onboarding defaults, but they are not entitlement or billing enforcement."
    ],
    risksAndCaveats: [
      "Combining package definitions, billing plans, entitlements, and module visibility into one table would blur product, commercial, and runtime responsibilities.",
      "Stripe provider IDs must never be printed with secrets or treated as the source of product truth without internal mapping records.",
      "Grandfathered and custom-contract tenants need explicit handling before package enforcement can safely exist.",
      "Usage limits need clear counters and support policy before any runtime limit is enforced.",
      "This model is static planning output only and should not be used as a billing, entitlement, module, or runtime resolver."
    ]
  };
}
