import "server-only";

import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const earlyAccessFeedbackInputSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Feedback message is required.")
    .max(2_000, "Feedback must stay under 2,000 characters."),
  email: z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    })
    .transform((value) => value ?? null),
  path: z
    .string()
    .trim()
    .max(300)
    .transform((value) => (value.length > 0 ? value : null))
});

export type EarlyAccessFeedbackInput = z.infer<
  typeof earlyAccessFeedbackInputSchema
>;

export async function createEarlyAccessFeedback(input: EarlyAccessFeedbackInput) {
  const user = await requireAuthenticatedUser(input.path ?? "/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for feedback.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.from("workflow_error_events").insert({
    organization_id: organizationContext.organization.id,
    user_id: user.id,
    action: "early_access.feedback",
    subject_type: "company",
    subject_id: organizationContext.organization.id,
    message: input.message,
    metadata: {
      email: input.email,
      path: input.path,
      source: "in_app_feedback"
    }
  });

  if (response.error) {
    throw new Error(`Unable to capture feedback: ${response.error.message}`);
  }
}
