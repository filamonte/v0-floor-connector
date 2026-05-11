import type { PerspectiveView } from "./types";

export type PerspectiveOwnershipFields = {
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
  ownerUserId?: string | null;
  assignedUserId?: string | null;
  sentByUserId?: string | null;
  assignedPersonMembershipUserId?: string | null;
};

export function matchesPerspective(
  fields: PerspectiveOwnershipFields,
  perspective: PerspectiveView,
  userId: string
) {
  if (perspective === "company") {
    return true;
  }

  return [
    fields.createdByUserId,
    fields.updatedByUserId,
    fields.ownerUserId,
    fields.assignedUserId,
    fields.sentByUserId,
    fields.assignedPersonMembershipUserId
  ].some((value) => value === userId);
}

export function buildPerspectiveSearchParams(
  entries: Record<string, string | null | undefined>,
  view: PerspectiveView
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    if (value && value.trim().length > 0) {
      searchParams.set(key, value);
    }
  }

  if (view !== "company") {
    searchParams.set("view", view);
  }

  return searchParams;
}
