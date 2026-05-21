import "server-only";

import type { CatalogItemType, TemplateType } from "@floorconnector/types";

import {
  getPlatformFinancialDefaults,
  getPlatformWorkflowDefaults,
  listPlatformCatalogItemSeeds,
  listPlatformStarterPacks,
  listPlatformTemplateSeedsAdmin
} from "@/lib/platform-admin/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildUserEstimateTemplateResolutionItem,
  makeConfigurationResolutionItem,
  type ConfigurationFutureLayer,
  type ConfigurationResolutionItem
} from "./configuration-resolution-core";

export { buildUserEstimateTemplateResolutionItem } from "./configuration-resolution-core";
export type {
  ConfigurationFutureLayer,
  ConfigurationResolutionCategory,
  ConfigurationResolutionItem,
  ConfigurationSourceLayer
} from "./configuration-resolution-core";

export type ConfigurationResolutionGroup = {
  key: string;
  label: string;
  description: string;
  items: ConfigurationResolutionItem[];
};

export type ConfigurationResolutionPreview = {
  selectedOrganization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  selectedUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  userOptions: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  groups: ConfigurationResolutionGroup[];
  futureLayers: ConfigurationFutureLayer[];
};

type OrganizationFinancialSettingsRow = {
  company_id: string;
  default_tax_rate: string | number;
  default_tax_behavior: string;
  default_retainage_percentage: string | number;
};

type OrganizationWorkflowSettingsRow = {
  company_id: string;
  approved_estimate_contract_template_id: string | null;
  require_contract_internal_approval: boolean;
  require_contract_signature_before_job_scheduling: boolean;
  require_deposit_before_job_scheduling: boolean;
  require_financing_approval_before_job_scheduling: boolean;
  default_deposit_percentage: string | number;
  default_estimate_terms_html: string | null;
  default_estimate_inclusions_html: string | null;
  default_estimate_exclusions_html: string | null;
  default_estimate_scope_summary_html: string | null;
  next_estimate_number: number | null;
  next_invoice_number: number | null;
  next_change_order_number: number | null;
  next_contract_number: number | null;
};

type OrganizationTemplateRow = {
  id: string;
  template_type: TemplateType;
  source_seed_id: string | null;
  source_seed_key: string | null;
  name: string;
  status: "active" | "archived";
  is_default: boolean;
};

type OrganizationCatalogItemRow = {
  id: string;
  source_seed_id: string | null;
  source_seed_key: string | null;
  item_type: CatalogItemType;
  name: string;
  status: "active" | "archived";
  is_default: boolean;
};

type OrganizationUserOption = {
  id: string;
  name: string;
  email: string;
};

type UserEstimateTemplatePreferenceRow = {
  organization_id: string;
  user_id: string;
  preferred_estimate_template_id: string;
  updated_at: string;
};

const templateTypes: TemplateType[] = ["estimate", "invoice", "contract"];
const catalogItemTypes: CatalogItemType[] = [
  "material",
  "labor",
  "service",
  "equipment",
  "subcontractor",
  "other",
  "system"
];

function formatRatePercent(value: string | number) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatDecimalPercent(value: string | number) {
  return `${Number(value).toFixed(2)}%`;
}

function formatBoolean(value: boolean) {
  return value ? "Required" : "Not required";
}

function formatHtmlPresence(value: string | null) {
  return value && value.trim().length > 0 ? "Configured" : "Empty";
}

function sourceForOrganizationRow(
  organizationId: string | null,
  hasOrganizationRow: boolean
) {
  return organizationId && hasOrganizationRow
    ? {
        sourceLayer: "organization_owned" as const,
        sourceId: organizationId,
        isInherited: false,
        isContractorOwned: true
      }
    : {
        sourceLayer: "platform_default" as const,
        sourceId: "default",
        isInherited: Boolean(organizationId),
        isContractorOwned: false
      };
}

function makeItem(input: ConfigurationResolutionItem) {
  return makeConfigurationResolutionItem(input);
}

async function loadOrganizationRows(
  organizationId: string | null,
  selectedUserId: string | null
) {
  if (!organizationId) {
    return {
      organization: null,
      userOptions: [] as OrganizationUserOption[],
      selectedUser: null,
      userEstimateTemplatePreference: null as UserEstimateTemplatePreferenceRow | null,
      financialSettings: null,
      workflowSettings: null,
      templates: [] as OrganizationTemplateRow[],
      catalogItems: [] as OrganizationCatalogItemRow[]
    };
  }

  const supabase = getSupabaseAdminClient();
  const [
    organizationResponse,
    financialResponse,
    workflowResponse,
    templatesResponse,
    catalogItemsResponse,
    membershipsResponse,
    userPreferenceResponse
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, slug, display_name, legal_name")
      .eq("id", organizationId)
      .maybeSingle(),
    supabase
      .from("organization_financial_settings")
      .select(
        "company_id, default_tax_rate, default_tax_behavior, default_retainage_percentage"
      )
      .eq("company_id", organizationId)
      .maybeSingle(),
    supabase
      .from("organization_workflow_settings")
      .select(
        `
          company_id,
          approved_estimate_contract_template_id,
          require_contract_internal_approval,
          require_contract_signature_before_job_scheduling,
          require_deposit_before_job_scheduling,
          require_financing_approval_before_job_scheduling,
          default_deposit_percentage,
          default_estimate_terms_html,
          default_estimate_inclusions_html,
          default_estimate_exclusions_html,
          default_estimate_scope_summary_html,
          next_estimate_number,
          next_invoice_number,
          next_change_order_number,
          next_contract_number
        `
      )
      .eq("company_id", organizationId)
      .maybeSingle(),
    supabase
      .from("document_templates")
      .select(
        "id, template_type, source_seed_id, source_seed_key, name, status, is_default"
      )
      .eq("company_id", organizationId)
      .order("template_type", { ascending: true })
      .order("is_default", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("catalog_items")
      .select(
        "id, source_seed_id, source_seed_key, item_type, name, status, is_default"
      )
      .eq("company_id", organizationId)
      .order("item_type", { ascending: true })
      .order("is_default", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("company_memberships")
      .select(
        `
          user_id,
          member_user:users!company_memberships_user_id_fkey (
            id,
            email,
            full_name
          )
        `
      )
      .eq("company_id", organizationId)
      .eq("membership_status", "active")
      .order("created_at", { ascending: true }),
    selectedUserId
      ? supabase
          .from("user_estimate_template_preferences")
          .select(
            "organization_id, user_id, preferred_estimate_template_id, updated_at"
          )
          .eq("organization_id", organizationId)
          .eq("user_id", selectedUserId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  if (organizationResponse.error) {
    throw new Error(
      `Unable to load organization for configuration preview: ${organizationResponse.error.message}`
    );
  }

  if (financialResponse.error) {
    throw new Error(
      `Unable to load organization financial settings for configuration preview: ${financialResponse.error.message}`
    );
  }

  if (workflowResponse.error) {
    throw new Error(
      `Unable to load organization workflow settings for configuration preview: ${workflowResponse.error.message}`
    );
  }

  if (templatesResponse.error) {
    throw new Error(
      `Unable to load organization templates for configuration preview: ${templatesResponse.error.message}`
    );
  }

  if (catalogItemsResponse.error) {
    throw new Error(
      `Unable to load organization catalog items for configuration preview: ${catalogItemsResponse.error.message}`
    );
  }

  if (membershipsResponse.error) {
    throw new Error(
      `Unable to load organization users for configuration preview: ${membershipsResponse.error.message}`
    );
  }

  if (userPreferenceResponse.error) {
    throw new Error(
      `Unable to load user estimate template preference for configuration preview: ${userPreferenceResponse.error.message}`
    );
  }

  const organization = organizationResponse.data as
    | {
        id: string;
        slug: string;
        display_name: string;
        legal_name: string;
      }
    | null;

  const membershipRows = Array.isArray(membershipsResponse.data)
    ? (membershipsResponse.data as Array<{
        user_id: string;
        member_user:
          | Array<{
              id: string;
              email: string;
              full_name: string | null;
            }>
          | null;
      }>)
    : [];
  const userOptions = membershipRows
    .map((membership) => {
      const user = Array.isArray(membership.member_user)
        ? (membership.member_user[0] ?? null)
        : null;
      const email = user?.email ?? "No email recorded";
      const name = user?.full_name || email;

      return {
        id: membership.user_id,
        name,
        email
      };
    })
    .filter((user) => Boolean(user.id));
  const selectedUser =
    userOptions.find((user) => user.id === selectedUserId) ?? null;

  return {
    organization: organization
      ? {
          id: organization.id,
          name: organization.display_name || organization.legal_name,
          slug: organization.slug
        }
      : null,
    userOptions,
    selectedUser,
    userEstimateTemplatePreference:
      (userPreferenceResponse.data as UserEstimateTemplatePreferenceRow | null) ??
      null,
    financialSettings:
      (financialResponse.data as OrganizationFinancialSettingsRow | null) ?? null,
    workflowSettings:
      (workflowResponse.data as OrganizationWorkflowSettingsRow | null) ?? null,
    templates: Array.isArray(templatesResponse.data)
      ? (templatesResponse.data as OrganizationTemplateRow[])
      : [],
    catalogItems: Array.isArray(catalogItemsResponse.data)
      ? (catalogItemsResponse.data as OrganizationCatalogItemRow[])
      : []
  };
}

export async function getConfigurationResolutionPreview(
  organizationId: string | null,
  options?: { userId?: string | null }
): Promise<ConfigurationResolutionPreview> {
  const [
    platformFinancialDefaults,
    platformWorkflowDefaults,
    platformTemplateSeeds,
    platformCatalogSeeds,
    starterPacks,
    organizationRows
  ] = await Promise.all([
    getPlatformFinancialDefaults(),
    getPlatformWorkflowDefaults(),
    listPlatformTemplateSeedsAdmin(),
    listPlatformCatalogItemSeeds(),
    listPlatformStarterPacks(),
    loadOrganizationRows(organizationId, options?.userId ?? null)
  ]);

  const financialSource = sourceForOrganizationRow(
    organizationRows.organization?.id ?? null,
    Boolean(organizationRows.financialSettings)
  );
  const financialValues =
    organizationRows.financialSettings ?? platformFinancialDefaults;
  const workflowSource = sourceForOrganizationRow(
    organizationRows.organization?.id ?? null,
    Boolean(organizationRows.workflowSettings)
  );
  const workflowValues =
    organizationRows.workflowSettings ?? platformWorkflowDefaults;
  const approvedContractTemplateValue =
    organizationRows.workflowSettings?.approved_estimate_contract_template_id
      ? (organizationRows.templates.find(
          (template) =>
            template.id ===
            organizationRows.workflowSettings?.approved_estimate_contract_template_id
        )?.name ??
        organizationRows.workflowSettings.approved_estimate_contract_template_id)
      : platformWorkflowDefaults.approvedEstimateContractSeedId
        ? (platformTemplateSeeds.find(
            (seed) =>
              seed.id === platformWorkflowDefaults.approvedEstimateContractSeedId
          )?.name ?? platformWorkflowDefaults.approvedEstimateContractSeedId)
        : "Use organization contract default";

  const financialItems: ConfigurationResolutionItem[] = [
    makeItem({
      key: "financial.default_tax_behavior",
      label: "Default tax behavior",
      category: "financial",
      effectiveValue:
        "default_tax_behavior" in financialValues
          ? financialValues.default_tax_behavior
          : financialValues.defaultTaxBehavior,
      futureUserOverrideAllowed: false,
      notes: organizationRows.financialSettings
        ? "This organization has its own financial settings row. The preview does not alter tax calculation behavior."
        : "No contractor-owned financial settings row is selected, so the displayed value is the platform default.",
      ...financialSource
    }),
    makeItem({
      key: "financial.default_tax_rate",
      label: "Default tax rate",
      category: "financial",
      effectiveValue:
        "default_tax_rate" in financialValues
          ? formatRatePercent(financialValues.default_tax_rate)
          : formatRatePercent(financialValues.defaultTaxRate),
      futureUserOverrideAllowed: false,
      notes: "Shown for inspection only. Runtime tax calculations continue to use the existing settings and snapshot paths.",
      ...financialSource
    }),
    makeItem({
      key: "financial.default_retainage_percentage",
      label: "Default retainage",
      category: "financial",
      effectiveValue:
        "default_retainage_percentage" in financialValues
          ? formatDecimalPercent(financialValues.default_retainage_percentage)
          : formatDecimalPercent(financialValues.defaultRetainagePercentage),
      futureUserOverrideAllowed: false,
      notes: "Retainage remains part of existing financial settings and downstream commercial snapshots.",
      ...financialSource
    })
  ];

  const workflowItems: ConfigurationResolutionItem[] = [
    makeItem({
      key: "workflow.approved_estimate_contract_template",
      label: "Approved-estimate contract template",
      category: "workflow",
      effectiveValue: approvedContractTemplateValue,
      futureUserOverrideAllowed: false,
      notes: "This explains the configured default only. Contract generation behavior is unchanged.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.require_contract_internal_approval",
      label: "Internal contract approval",
      category: "workflow",
      effectiveValue:
        "require_contract_internal_approval" in workflowValues
          ? formatBoolean(workflowValues.require_contract_internal_approval)
          : formatBoolean(workflowValues.requireContractInternalApproval),
      futureUserOverrideAllowed: false,
      notes: "Readiness and approval gates keep using existing workflow utilities.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.require_deposit_before_scheduling",
      label: "Deposit before scheduling",
      category: "workflow",
      effectiveValue:
        "require_deposit_before_job_scheduling" in workflowValues
          ? formatBoolean(workflowValues.require_deposit_before_job_scheduling)
          : formatBoolean(workflowValues.requireDepositBeforeJobScheduling),
      futureUserOverrideAllowed: false,
      notes: "Deposit requirements are displayed as configuration provenance only.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.require_signature_before_scheduling",
      label: "Signed contract before scheduling",
      category: "workflow",
      effectiveValue:
        "require_contract_signature_before_job_scheduling" in workflowValues
          ? formatBoolean(
              workflowValues.require_contract_signature_before_job_scheduling
            )
          : formatBoolean(
              workflowValues.requireContractSignatureBeforeJobScheduling
            ),
      futureUserOverrideAllowed: false,
      notes: "Scheduling readiness enforcement is not changed by this preview.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.require_financing_before_scheduling",
      label: "Financing approval before scheduling",
      category: "workflow",
      effectiveValue:
        "require_financing_approval_before_job_scheduling" in workflowValues
          ? formatBoolean(
              workflowValues.require_financing_approval_before_job_scheduling
            )
          : formatBoolean(
              workflowValues.requireFinancingApprovalBeforeJobScheduling
            ),
      futureUserOverrideAllowed: false,
      notes: "Financing readiness remains on the existing canonical workflow settings.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.default_deposit_percentage",
      label: "Default deposit",
      category: "workflow",
      effectiveValue:
        "default_deposit_percentage" in workflowValues
          ? formatDecimalPercent(workflowValues.default_deposit_percentage)
          : formatDecimalPercent(workflowValues.defaultDepositPercentage),
      futureUserOverrideAllowed: false,
      notes: "This is the configured default, not a change to invoice or payment logic.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.default_estimate_content",
      label: "Starter estimate content",
      category: "workflow",
      effectiveValue: [
        "terms",
        "inclusions",
        "exclusions",
        "scope"
      ]
        .map((field) => {
          const value =
            "default_estimate_terms_html" in workflowValues
              ? {
                  terms: workflowValues.default_estimate_terms_html,
                  inclusions: workflowValues.default_estimate_inclusions_html,
                  exclusions: workflowValues.default_estimate_exclusions_html,
                  scope: workflowValues.default_estimate_scope_summary_html
                }[field]
              : {
                  terms: workflowValues.defaultEstimateTermsHtml,
                  inclusions: workflowValues.defaultEstimateInclusionsHtml,
                  exclusions: workflowValues.defaultEstimateExclusionsHtml,
                  scope: workflowValues.defaultEstimateScopeSummaryHtml
                }[field];

          return `${field}: ${formatHtmlPresence(value ?? null)}`;
        })
        .join(", "),
      futureUserOverrideAllowed: false,
      notes: "Estimate starter copy fills empty estimate fields only through existing settings behavior.",
      ...workflowSource
    }),
    makeItem({
      key: "workflow.numbering",
      label: "Next numbering defaults",
      category: "workflow",
      effectiveValue:
        "next_estimate_number" in workflowValues
          ? `Est ${workflowValues.next_estimate_number ?? platformWorkflowDefaults.defaultEstimateStartNumber}, Inv ${workflowValues.next_invoice_number ?? platformWorkflowDefaults.defaultInvoiceStartNumber}, CO ${workflowValues.next_change_order_number ?? platformWorkflowDefaults.defaultChangeOrderStartNumber}, Contract ${workflowValues.next_contract_number ?? platformWorkflowDefaults.defaultContractStartNumber}`
          : `Est ${workflowValues.defaultEstimateStartNumber}, Inv ${workflowValues.defaultInvoiceStartNumber}, CO ${workflowValues.defaultChangeOrderStartNumber}, Contract ${workflowValues.defaultContractStartNumber}`,
      futureUserOverrideAllowed: false,
      notes: "Numbering remains tenant-owned after adoption and still follows existing upward-only protections after records exist.",
      ...workflowSource
    })
  ];

  const templateItems = templateTypes.map((templateType) => {
    const organizationDefault = organizationRows.templates.find(
      (template) =>
        template.template_type === templateType &&
        template.is_default &&
        template.status === "active"
    );
    const platformDefault = platformTemplateSeeds.find(
      (seed) => seed.templateType === templateType && seed.isDefault && seed.isActive
    );
    const adoptedCount = organizationRows.templates.filter(
      (template) =>
        template.template_type === templateType && Boolean(template.source_seed_id)
    ).length;

    return makeItem({
      key: `templates.${templateType}.default`,
      label: `${templateType} default template`,
      category: "document_templates",
      effectiveValue:
        organizationDefault?.name ??
        platformDefault?.name ??
        "No active default template visible",
      sourceLayer: organizationDefault ? "organization_owned" : "platform_default",
      sourceId: organizationDefault?.id ?? platformDefault?.id ?? null,
      isInherited: Boolean(organizationRows.organization && !organizationDefault),
      isContractorOwned: Boolean(organizationDefault),
      futureUserOverrideAllowed: false,
      notes: organizationDefault
        ? `The selected contractor owns this active default template. ${adoptedCount} adopted seed copy/copies are visible for this template type.`
        : "The preview is showing the platform seed/default because no selected contractor default is visible."
    });
  });
  const estimateOrganizationDefault = organizationRows.templates.find(
    (template) =>
      template.template_type === "estimate" &&
      template.is_default &&
      template.status === "active"
  );
  const estimatePlatformDefault = platformTemplateSeeds.find(
    (seed) => seed.templateType === "estimate" && seed.isDefault && seed.isActive
  );
  const preferredEstimateTemplate = organizationRows.userEstimateTemplatePreference
    ? organizationRows.templates.find(
        (template) =>
          template.id ===
            organizationRows.userEstimateTemplatePreference
              ?.preferred_estimate_template_id &&
          template.template_type === "estimate" &&
          template.status === "active"
      )
    : null;
  const userEstimateTemplateItem = buildUserEstimateTemplateResolutionItem({
    hasSelectedOrganization: Boolean(organizationRows.organization),
    selectedUser: organizationRows.selectedUser,
    organizationDefault: estimateOrganizationDefault
      ? {
          id: estimateOrganizationDefault.id,
          name: estimateOrganizationDefault.name
        }
      : null,
    platformDefault: estimatePlatformDefault
      ? {
          id: estimatePlatformDefault.id,
          name: estimatePlatformDefault.name
        }
      : null,
    preferredTemplate: preferredEstimateTemplate
      ? {
          id: preferredEstimateTemplate.id,
          name: preferredEstimateTemplate.name
        }
      : null
  });

  const catalogItems = catalogItemTypes.map((itemType) => {
    const organizationDefault = organizationRows.catalogItems.find(
      (item) =>
        item.item_type === itemType && item.is_default && item.status === "active"
    );
    const platformDefault = platformCatalogSeeds.find(
      (seed) => seed.itemType === itemType && seed.isDefault && seed.isActive
    );
    const adoptedCount = organizationRows.catalogItems.filter(
      (item) => item.item_type === itemType && Boolean(item.source_seed_id)
    ).length;

    return makeItem({
      key: `catalog.${itemType}.default`,
      label: `${itemType} default catalog item`,
      category: "catalog",
      effectiveValue:
        organizationDefault?.name ??
        platformDefault?.name ??
        "No active default catalog item visible",
      sourceLayer: organizationDefault ? "organization_owned" : "platform_default",
      sourceId: organizationDefault?.id ?? platformDefault?.id ?? null,
      isInherited: Boolean(organizationRows.organization && !organizationDefault),
      isContractorOwned: Boolean(organizationDefault),
      futureUserOverrideAllowed: false,
      notes: organizationDefault
        ? `The selected contractor owns this catalog default. ${adoptedCount} adopted seed item(s) are visible for this item type.`
        : "The preview is showing the platform catalog seed/default because no selected contractor default is visible."
    });
  });
  const starterPackItems = starterPacks.map((pack) =>
    makeItem({
      key: `starter_packs.${pack.packKey}`,
      label: pack.name,
      category: "starter_packs",
      effectiveValue: `${pack.templateSeedCount} template seed(s), ${pack.catalogSeedCount} catalog seed(s), ${pack.assignmentCount} assignment intent(s)`,
      sourceLayer: "platform_default",
      sourceId: pack.id,
      isInherited: false,
      isContractorOwned: false,
      futureUserOverrideAllowed: false,
      notes:
        pack.status === "published"
          ? `Published starter pack is inspectable as a platform-governed bundle with ${pack.activeAssignmentCount} active planning assignment intent(s). It does not provision contractor templates/catalog items or change resolution behavior.`
          : `${pack.status} starter pack is inspectable as platform governance only and has ${pack.activeAssignmentCount} active planning assignment intent(s) with no runtime effect.`
    })
  );

  return {
    selectedOrganization: organizationRows.organization,
    selectedUser: organizationRows.selectedUser,
    userOptions: organizationRows.userOptions,
    groups: [
      {
        key: "financial",
        label: "Financial Defaults",
        description:
          "Platform and organization-owned financial settings as they can be inspected today.",
        items: financialItems
      },
      {
        key: "workflow",
        label: "Workflow Defaults",
        description:
          "Readiness, contract, estimate-content, and numbering settings without changing runtime workflow logic.",
        items: workflowItems
      },
      {
        key: "document_templates",
        label: "Document Templates",
        description:
          "Platform template seeds and contractor-owned adopted/default templates where records already exist.",
        items: [...templateItems, userEstimateTemplateItem]
      },
      {
        key: "catalog",
        label: "Starter Catalog",
        description:
          "Platform catalog seeds and contractor-owned adopted/default catalog items where records already exist.",
        items: catalogItems
      },
      {
        key: "starter_packs",
        label: "Starter Packs",
        description:
          "Platform-governed bundles over existing template and catalog seeds. They are inspectable only in this phase.",
        items: starterPackItems
      }
    ],
    futureLayers: [
      {
        sourceLayer: "future_organization_override",
        label: "Organization override registry",
        status: "not_implemented",
        notes:
          "Starter-pack assignment intent exists for future targeting, but no override registry exists yet. This layer is shown so later phases can add explicit overrides without changing current settings ownership."
      },
      {
        sourceLayer: "future_user_preference",
        label: "User preferences",
        status: "not_implemented",
        notes:
          "Only the preferred estimate template user preference is active. Other user preference layers remain future and must not become business truth."
      },
      {
        sourceLayer: "record_snapshot",
        label: "Record snapshots",
        status: "not_implemented",
        notes:
          "Existing estimates, contracts, invoices, and commercial records keep their current snapshot behavior. This preview does not change snapshots."
      }
    ]
  };
}
