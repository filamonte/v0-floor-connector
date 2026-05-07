export type ConfigurationSourceLayer =
  | "platform_default"
  | "organization_owned"
  | "user_preference"
  | "future_organization_override"
  | "future_user_preference"
  | "record_snapshot"
  | "fallback";

export type ConfigurationResolutionCategory =
  | "financial"
  | "workflow"
  | "document_templates"
  | "catalog"
  | "starter_packs";

export type ConfigurationResolutionItem = {
  key: string;
  label: string;
  category: ConfigurationResolutionCategory;
  effectiveValue: string;
  sourceLayer: ConfigurationSourceLayer;
  sourceId: string | null;
  isInherited: boolean;
  isContractorOwned: boolean;
  futureUserOverrideAllowed: boolean;
  notes: string;
};

export type ConfigurationFutureLayer = {
  sourceLayer: ConfigurationSourceLayer;
  label: string;
  status: "not_implemented";
  notes: string;
};

export function makeConfigurationResolutionItem(
  input: ConfigurationResolutionItem
) {
  return input;
}

export function buildUserEstimateTemplateResolutionItem(input: {
  hasSelectedOrganization: boolean;
  selectedUser: { id: string; name: string; email: string } | null;
  organizationDefault: { id: string; name: string } | null;
  platformDefault: { id: string; name: string } | null;
  preferredTemplate: { id: string; name: string } | null;
}) {
  const {
    hasSelectedOrganization,
    selectedUser,
    organizationDefault,
    platformDefault,
    preferredTemplate
  } = input;

  return makeConfigurationResolutionItem({
    key: "templates.estimate.user_preference",
    label: "User preferred estimate template",
    category: "document_templates",
    effectiveValue: selectedUser
      ? (preferredTemplate?.name ??
        organizationDefault?.name ??
        platformDefault?.name ??
        "No active estimate template preference or default visible")
      : hasSelectedOrganization
        ? "Select a user to inspect the personal estimate template layer"
        : "Select a contractor and user to inspect this layer",
    sourceLayer: preferredTemplate
      ? "user_preference"
      : selectedUser
        ? organizationDefault
          ? "organization_owned"
          : platformDefault
            ? "platform_default"
            : "fallback"
        : "fallback",
    sourceId:
      preferredTemplate?.id ?? organizationDefault?.id ?? platformDefault?.id ?? null,
    isInherited: Boolean(selectedUser && !preferredTemplate),
    isContractorOwned: Boolean(!preferredTemplate && organizationDefault),
    futureUserOverrideAllowed: true,
    notes: preferredTemplate
      ? preferredTemplate.id === organizationDefault?.id
        ? "This selected user has a personal estimate-template preference, and it currently matches the company default. It only affects safe new-estimate preselection for that user."
        : "This selected user has a personal estimate-template preference that overrides the company default for safe new-estimate preselection only."
      : selectedUser
        ? "This selected user has no personal estimate-template preference, so the company/default-template behavior remains effective."
        : "The preference table is implemented for estimate templates only. Select a contractor user to inspect whether that personal layer is active."
  });
}
