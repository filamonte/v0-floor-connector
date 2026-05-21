"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCueStateActionSupportForIdentity } from "./apply";
import {
  parseWorkflowCueSnoozeActionFormData,
  parseWorkflowCueStateActionFormData,
  type CueStateSnoozePreset,
  type WorkflowCueStateActionInput
} from "./schemas";

function buildRedirect(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function revalidateCueStateSurfaces(returnTo: string) {
  revalidatePath(returnTo);
  revalidatePath("/dashboard");
}

function calculateSnoozedUntil(preset: CueStateSnoozePreset, now = new Date()) {
  const date = new Date(now);

  switch (preset) {
    case "later_today":
      date.setHours(date.getHours() + 6);
      break;
    case "tomorrow":
      date.setDate(date.getDate() + 1);
      break;
    case "next_week":
      date.setDate(date.getDate() + 7);
      break;
  }

  return date.toISOString();
}

async function requireCueStateScope(input: WorkflowCueStateActionInput) {
  const user = await requireAuthenticatedUser(input.returnTo);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for cue state.");
  }

  if (organizationContext.organization.id !== input.companyId) {
    throw new Error("Cue state must belong to the active organization.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

async function requireCueSubjectInCompany(input: WorkflowCueStateActionInput) {
  const subjectTables = {
    contract: "contracts",
    estimate: "estimates",
    invoice: "invoices",
    job: "jobs",
    project: "projects"
  } as const;
  const tableName = subjectTables[input.subjectType as keyof typeof subjectTables];

  if (!tableName) {
    throw new Error("That cue subject is not supported for cue state.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(tableName)
    .select("id")
    .eq("id", input.subjectId)
    .eq("company_id", input.companyId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to verify cue subject: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Cue subject must belong to the active organization.");
  }
}

async function writeUserCueState(input: {
  actionInput: WorkflowCueStateActionInput;
  userId: string;
  state: "dismissed" | "snoozed";
  snoozedUntil?: string | null;
}) {
  const nowIso = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  const existing = await supabase
    .from("workflow_cue_states")
    .select("id")
    .eq("company_id", input.actionInput.companyId)
    .eq("cue_family", input.actionInput.cueFamily)
    .eq("cue_key", input.actionInput.cueKey)
    .eq("cue_version", input.actionInput.cueVersion)
    .eq("cue_fingerprint", input.actionInput.cueFingerprint)
    .eq("subject_type", input.actionInput.subjectType)
    .eq("subject_id", input.actionInput.subjectId)
    .eq("scope", "user")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(`Unable to inspect cue state: ${existing.error.message}`);
  }

  const values = {
    company_id: input.actionInput.companyId,
    cue_family: input.actionInput.cueFamily,
    cue_key: input.actionInput.cueKey,
    cue_version: input.actionInput.cueVersion,
    cue_fingerprint: input.actionInput.cueFingerprint,
    subject_type: input.actionInput.subjectType,
    subject_id: input.actionInput.subjectId,
    project_id: input.actionInput.projectId,
    scope: "user",
    user_id: input.userId,
    state: input.state,
    snoozed_until: input.state === "snoozed" ? input.snoozedUntil : null,
    dismissed_at: input.state === "dismissed" ? nowIso : null,
    resolved_at: null,
    metadata: {},
    created_by: input.userId,
    updated_by: input.userId
  };

  const response = existing.data?.id
    ? await supabase
        .from("workflow_cue_states")
        .update({
          state: values.state,
          snoozed_until: values.snoozed_until,
          dismissed_at: values.dismissed_at,
          resolved_at: null,
          project_id: values.project_id,
          updated_by: values.updated_by
        })
        .eq("id", existing.data.id)
        .eq("company_id", input.actionInput.companyId)
    : await supabase.from("workflow_cue_states").insert(values);

  if (response.error) {
    throw new Error(`Unable to save cue state: ${response.error.message}`);
  }
}

async function clearUserCueState(input: WorkflowCueStateActionInput & { userId: string }) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("workflow_cue_states")
    .delete()
    .eq("company_id", input.companyId)
    .eq("cue_family", input.cueFamily)
    .eq("cue_key", input.cueKey)
    .eq("cue_version", input.cueVersion)
    .eq("cue_fingerprint", input.cueFingerprint)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .eq("scope", "user")
    .eq("user_id", input.userId);

  if (response.error) {
    throw new Error(`Unable to clear cue state: ${response.error.message}`);
  }
}

function ensureSupportedAction(input: {
  actionInput: WorkflowCueStateActionInput;
  action: "dismiss" | "snooze";
}) {
  const support = getCueStateActionSupportForIdentity(input.actionInput);

  if (!support[input.action]) {
    throw new Error("That cue does not support this action.");
  }
}

export async function dismissWorkflowCueAction(formData: FormData) {
  const result = parseWorkflowCueStateActionFormData(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/dashboard", {
        error: result.error.issues[0]?.message ?? "Unable to dismiss cue."
      })
    );
  }

  try {
    ensureSupportedAction({ actionInput: result.data, action: "dismiss" });
    const scope = await requireCueStateScope(result.data);
    await requireCueSubjectInCompany(result.data);
    await writeUserCueState({
      actionInput: result.data,
      userId: scope.userId,
      state: "dismissed"
    });
    revalidateCueStateSurfaces(result.data.returnTo);
  } catch (error) {
    redirect(
      buildRedirect(result.data.returnTo, {
        error: error instanceof Error ? error.message : "Unable to dismiss cue."
      })
    );
  }

  redirect(buildRedirect(result.data.returnTo, { message: "Cue dismissed." }));
}

export async function snoozeWorkflowCueAction(formData: FormData) {
  const result = parseWorkflowCueSnoozeActionFormData(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/dashboard", {
        error: result.error.issues[0]?.message ?? "Unable to snooze cue."
      })
    );
  }

  try {
    ensureSupportedAction({ actionInput: result.data, action: "snooze" });
    const scope = await requireCueStateScope(result.data);
    await requireCueSubjectInCompany(result.data);
    await writeUserCueState({
      actionInput: result.data,
      userId: scope.userId,
      state: "snoozed",
      snoozedUntil: calculateSnoozedUntil(result.data.snoozePreset)
    });
    revalidateCueStateSurfaces(result.data.returnTo);
  } catch (error) {
    redirect(
      buildRedirect(result.data.returnTo, {
        error: error instanceof Error ? error.message : "Unable to snooze cue."
      })
    );
  }

  redirect(buildRedirect(result.data.returnTo, { message: "Cue snoozed." }));
}

export async function clearWorkflowCueStateAction(formData: FormData) {
  const result = parseWorkflowCueStateActionFormData(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/dashboard", {
        error: result.error.issues[0]?.message ?? "Unable to clear cue state."
      })
    );
  }

  try {
    const scope = await requireCueStateScope(result.data);
    await requireCueSubjectInCompany(result.data);
    await clearUserCueState({
      ...result.data,
      userId: scope.userId
    });
    revalidateCueStateSurfaces(result.data.returnTo);
  } catch (error) {
    redirect(
      buildRedirect(result.data.returnTo, {
        error: error instanceof Error ? error.message : "Unable to clear cue state."
      })
    );
  }

  redirect(buildRedirect(result.data.returnTo, { message: "Cue state cleared." }));
}
