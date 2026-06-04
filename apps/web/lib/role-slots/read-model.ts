import type { PersonId } from "@floorconnector/types";

export type RoleSlotKey =
  | "onsite_rep"
  | "relationship_owner"
  | "follow_up_owner"
  | "sales_credit_owner"
  | "estimate_writer";

export type RoleSlotPerson = {
  id: PersonId;
  displayName: string;
  isActive: boolean;
  isAssignable: boolean;
};

export type RoleSlotPersonOption = {
  id: PersonId;
  displayName: string;
};

export type RoleSlotDisplay = {
  label: string;
  personName: string | null;
  emptyLabel: string;
  displayText: string;
};

export const roleSlotLabels: Record<RoleSlotKey, string> = {
  onsite_rep: "Onsite Rep",
  relationship_owner: "Relationship Owner",
  follow_up_owner: "Follow-Up Owner",
  sales_credit_owner: "Sales Credit Owner",
  estimate_writer: "Estimate Writer"
};

const missingPersonLabel = "Not captured yet";

export function selectRoleSlotPersonOptions(
  people: RoleSlotPerson[]
): RoleSlotPersonOption[] {
  return people
    .filter((person) => person.isActive && person.isAssignable)
    .map((person) => ({
      id: person.id,
      displayName: person.displayName
    }))
    .sort((first, second) =>
      first.displayName.localeCompare(second.displayName, undefined, {
        sensitivity: "base"
      })
    );
}

export function findRoleSlotPerson(
  people: Array<Pick<RoleSlotPerson, "id" | "displayName">>,
  personId: PersonId | null
) {
  if (!personId) {
    return null;
  }

  return people.find((person) => person.id === personId) ?? null;
}

export function buildRoleSlotDisplay(input: {
  role: RoleSlotKey;
  personId: PersonId | null;
  people: Array<Pick<RoleSlotPerson, "id" | "displayName">>;
  emptyLabel?: string;
}): RoleSlotDisplay {
  const person = findRoleSlotPerson(input.people, input.personId);
  const emptyLabel = input.emptyLabel ?? "Not assigned";
  const personName = person?.displayName ?? null;

  return {
    label: roleSlotLabels[input.role],
    personName,
    emptyLabel,
    displayText: input.personId
      ? (personName ?? missingPersonLabel)
      : emptyLabel
  };
}

export function buildInheritedProjectRoleSlots(input: {
  opportunity: {
    onsiteRepPersonId: PersonId | null;
    relationshipOwnerPersonId: PersonId | null;
  };
}) {
  return {
    onsiteRepPersonId: input.opportunity.onsiteRepPersonId,
    relationshipOwnerPersonId: input.opportunity.relationshipOwnerPersonId
  };
}

export function buildEstimateRoleSlotContext(input: {
  estimate: {
    estimateWriterPersonId: PersonId | null;
  };
  project: {
    relationshipOwnerPersonId: PersonId | null;
    salesCreditOwnerPersonId: PersonId | null;
  } | null;
}) {
  return {
    estimateWriterPersonId: input.estimate.estimateWriterPersonId,
    relationshipOwnerPersonId: input.project?.relationshipOwnerPersonId ?? null,
    salesCreditOwnerPersonId: input.project?.salesCreditOwnerPersonId ?? null
  };
}
