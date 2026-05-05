export const selectedSystemStatuses = [
  "draft",
  "proposed",
  "selected",
  "locked",
  "superseded",
  "amended",
  "void",
  "retracted",
  "rejected"
] as const;

export const selectedSystemSources = [
  "manual",
  "lead_intake",
  "site_assessment",
  "estimate_builder",
  "visualizer_handoff",
  "other"
] as const;

export const selectedSystemAreaTypes = [
  "room",
  "zone",
  "phase",
  "option",
  "alternate",
  "whole_project",
  "other"
] as const;

export const selectedSystemSpecCompletenessStatuses = [
  "incomplete",
  "ready_for_proposal",
  "customer_facing",
  "locked"
] as const;

export type SelectedSystemStatus = (typeof selectedSystemStatuses)[number];
export type SelectedSystemSource = (typeof selectedSystemSources)[number];
export type SelectedSystemAreaType = (typeof selectedSystemAreaTypes)[number];
export type SelectedSystemSpecCompletenessStatus =
  (typeof selectedSystemSpecCompletenessStatuses)[number];

export function formatSelectedSystemOption(value: string | null | undefined) {
  if (!value) {
    return "None";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
