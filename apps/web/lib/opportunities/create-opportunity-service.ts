import "server-only";

import { createOpportunity } from "./data";
import { opportunityInputSchema, type OpportunityInput } from "./schemas";

export type CanonicalOpportunityCreateResult = {
  id: string;
  title: string;
  href: string;
};

export async function createCanonicalOpportunityFromValidatedInput(
  input: OpportunityInput
): Promise<CanonicalOpportunityCreateResult> {
  const result = opportunityInputSchema.safeParse(input);

  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ?? "Opportunity input is invalid."
    );
  }

  const opportunity = await createOpportunity(result.data);

  return {
    id: opportunity.id,
    title: opportunity.title,
    href: `/leads/${opportunity.id}`
  };
}
