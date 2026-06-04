import "server-only";

import type { PersonId } from "@floorconnector/types";

import { requireEstimateScope } from "@/lib/estimates/data";
import { requireOpportunityScope } from "@/lib/opportunities/data";
import { requireProjectScope } from "@/lib/projects/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  EstimateRoleSlotsInput,
  OpportunityRoleSlotsInput,
  ProjectRoleSlotsInput
} from "./schemas";

type PersonRoleSlotRow = {
  id: string;
};

function collectPersonIds(values: Array<PersonId | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  );
}

function isPersonRoleSlotRowArray(
  value: unknown
): value is PersonRoleSlotRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<PersonRoleSlotRow>).id === "string"
    )
  );
}

async function assertAssignableRoleSlotPeople(input: {
  organizationId: string;
  personIds: Array<PersonId | null>;
}) {
  const ids = collectPersonIds(input.personIds);

  if (ids.length === 0) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("is_active", true)
    .eq("is_assignable", true)
    .in("id", ids);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to validate role slot people: ${response.error.message}`
    );
  }

  if (!isPersonRoleSlotRowArray(data) || data.length !== ids.length) {
    throw new Error(
      "Role slots can only use active assignable people in the current organization."
    );
  }
}

export async function updateOpportunityRoleSlots(
  input: OpportunityRoleSlotsInput
) {
  const scope = await requireOpportunityScope(input.returnTo);

  await assertAssignableRoleSlotPeople({
    organizationId: scope.organizationId,
    personIds: [input.onsiteRepPersonId, input.relationshipOwnerPersonId]
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .update({
      onsite_rep_person_id: input.onsiteRepPersonId,
      relationship_owner_person_id: input.relationshipOwnerPersonId,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.opportunityId)
    .select("id")
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to update lead role slots: ${response.error?.message ?? "Lead not found."}`
    );
  }
}

export async function updateProjectRoleSlots(input: ProjectRoleSlotsInput) {
  const scope = await requireProjectScope(input.returnTo);

  await assertAssignableRoleSlotPeople({
    organizationId: scope.organizationId,
    personIds: [
      input.onsiteRepPersonId,
      input.relationshipOwnerPersonId,
      input.followUpOwnerPersonId,
      input.salesCreditOwnerPersonId
    ]
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .update({
      onsite_rep_person_id: input.onsiteRepPersonId,
      relationship_owner_person_id: input.relationshipOwnerPersonId,
      follow_up_owner_person_id: input.followUpOwnerPersonId,
      sales_credit_owner_person_id: input.salesCreditOwnerPersonId,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.projectId)
    .select("id")
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to update project role slots: ${response.error?.message ?? "Project not found."}`
    );
  }
}

export async function updateEstimateRoleSlots(input: EstimateRoleSlotsInput) {
  const scope = await requireEstimateScope(input.returnTo);

  await assertAssignableRoleSlotPeople({
    organizationId: scope.organizationId,
    personIds: [input.estimateWriterPersonId]
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .update({
      estimate_writer_person_id: input.estimateWriterPersonId,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.estimateId)
    .select("id")
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to update estimate role slots: ${response.error?.message ?? "Estimate not found."}`
    );
  }
}
