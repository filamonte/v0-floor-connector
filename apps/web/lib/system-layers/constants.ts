export const systemLayerStatuses = ["draft", "active", "retired", "archived"] as const;

export const serviceFamilyOptions = [
  "decorative_flake",
  "metallic_epoxy",
  "decorative_quartz",
  "solid_color_coating",
  "concrete_polishing",
  "grind_and_seal",
  "future_specialty_system"
] as const;

export const finishFamilyOptions = [
  "decorative_flake",
  "metallic_epoxy",
  "decorative_quartz",
  "solid_color",
  "none",
  "other"
] as const;

export const componentRoleOptions = [
  "standard",
  "basecoat",
  "broadcast",
  "topcoat",
  "primer",
  "prep",
  "labor",
  "equipment",
  "add_on",
  "other"
] as const;

export const quantityBasisOptions = [
  "sqft",
  "linear_ft",
  "each",
  "fixed",
  "hour",
  "day",
  "percentage",
  "formula"
] as const;

export type SystemLayerStatus = (typeof systemLayerStatuses)[number];
export type ServiceFamily = (typeof serviceFamilyOptions)[number];
export type FinishFamily = (typeof finishFamilyOptions)[number];
export type ComponentRole = (typeof componentRoleOptions)[number];
export type QuantityBasis = (typeof quantityBasisOptions)[number];

export function formatSystemLayerOption(value: string | null | undefined) {
  if (!value) {
    return "None";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isAllowedSystemLayerStatusTransition(
  currentStatus: SystemLayerStatus | null,
  nextStatus: SystemLayerStatus
) {
  if (!currentStatus) {
    return nextStatus === "draft";
  }

  if (currentStatus === nextStatus) {
    return true;
  }

  const currentIndex = systemLayerStatuses.indexOf(currentStatus);
  const nextIndex = systemLayerStatuses.indexOf(nextStatus);

  return nextIndex === currentIndex + 1;
}
