import type { DocumentTemplate } from "@floorconnector/types";

export type PreferredEstimateTemplatePreferenceShape = {
  template: DocumentTemplate | null;
};

export function validatePreferredEstimateTemplateSelection(input: {
  organizationId: string;
  template: DocumentTemplate | null;
}) {
  const { organizationId, template } = input;

  if (!template || template.organizationId !== organizationId) {
    throw new Error(
      "Choose an active estimate template owned by your current organization."
    );
  }

  if (template.templateType !== "estimate" || template.status !== "active") {
    throw new Error(
      "Choose an active estimate template owned by your current organization."
    );
  }

  return template;
}

export function resolvePreferredEstimateTemplateForCreate(
  preference: PreferredEstimateTemplatePreferenceShape | null
) {
  const template = preference?.template ?? null;

  return template?.templateType === "estimate" && template.status === "active"
    ? template.id
    : null;
}
