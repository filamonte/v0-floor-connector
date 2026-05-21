import "server-only";

import { getServerEnv } from "@floorconnector/config";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const earlyAccessRequestInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(255)
    .email("Enter a valid email address."),
  companyName: z.string().trim().min(1, "Company name is required.").max(120),
  trade: z
    .string()
    .trim()
    .max(120, "Trade or service type must stay under 120 characters.")
    .transform((value) => (value.length > 0 ? value : null)),
  note: z
    .string()
    .trim()
    .max(1_500, "Note must stay under 1,500 characters.")
    .transform((value) => (value.length > 0 ? value : null))
});

export type EarlyAccessRequestInput = z.infer<
  typeof earlyAccessRequestInputSchema
>;

type IdRow = {
  id: string;
};

export class EarlyAccessIntakeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EarlyAccessIntakeConfigurationError";
  }
}

function isIdRow(value: unknown): value is IdRow {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as Partial<IdRow>).id === "string"
  );
}

async function resolveEarlyAccessIntakeCompanyId() {
  const env = getServerEnv();
  const configuredCompanyId =
    env.FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID?.trim() ?? "";

  if (configuredCompanyId) {
    return configuredCompanyId;
  }

  if (env.NODE_ENV === "production") {
    throw new EarlyAccessIntakeConfigurationError(
      "Early-access intake needs FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID before public request capture is enabled."
    );
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to resolve intake company: ${response.error.message}`);
  }

  if (!isIdRow(data)) {
    throw new Error("No existing company is available for early-access intake.");
  }

  return data.id;
}

export async function createEarlyAccessRequest(input: EarlyAccessRequestInput) {
  const supabase = getSupabaseAdminClient();
  const companyId = await resolveEarlyAccessIntakeCompanyId();
  const contactResponse = await supabase
    .from("contacts")
    .insert({
      company_id: companyId,
      display_name: input.name,
      company_name: input.companyName,
      email: input.email,
      phone: null,
      contact_kind: "general_inquiry",
      notes: input.note
    })
    .select("id")
    .single();
  const contactData: unknown = contactResponse.data;

  if (contactResponse.error || !isIdRow(contactData)) {
    throw new Error(
      `Unable to capture early-access contact: ${contactResponse.error?.message ?? "Insert failed."}`
    );
  }

  const title = `${input.companyName} early access request`.slice(0, 160);
  const notes = [
    input.note,
    "Captured from the public Request Early Access form."
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n\n");
  const opportunityResponse = await supabase
    .from("opportunities")
    .insert({
      company_id: companyId,
      primary_contact_id: contactData.id,
      status: "new",
      title,
      source: "early_access",
      source_detail: "homepage_request",
      service_type: input.trade,
      job_type: input.trade ?? "Early access request",
      site_name: input.companyName,
      prospect_name: input.name,
      prospect_company_name: input.companyName,
      email: input.email,
      phone: null,
      notes,
      requirements_summary: input.note,
      site_assessment_status: "pending"
    })
    .select("id")
    .single();
  const opportunityData: unknown = opportunityResponse.data;

  if (opportunityResponse.error || !isIdRow(opportunityData)) {
    await supabase
      .from("contacts")
      .delete()
      .eq("company_id", companyId)
      .eq("id", contactData.id);

    throw new Error(
      `Unable to capture early-access request: ${opportunityResponse.error?.message ?? "Insert failed."}`
    );
  }

  return {
    organizationId: companyId,
    opportunityId: opportunityData.id
  };
}
