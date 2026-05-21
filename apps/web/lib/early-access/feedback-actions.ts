"use server";

import { revalidatePath } from "next/cache";

import {
  createEarlyAccessFeedback,
  earlyAccessFeedbackInputSchema
} from "@/lib/early-access/feedback";

export type EarlyAccessFeedbackFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function sendEarlyAccessFeedbackAction(
  _previousState: EarlyAccessFeedbackFormState,
  formData: FormData
): Promise<EarlyAccessFeedbackFormState> {
  const result = earlyAccessFeedbackInputSchema.safeParse({
    message: getFieldValue(formData, "message"),
    email: getFieldValue(formData, "email"),
    path: getFieldValue(formData, "path")
  });

  if (!result.success) {
    return {
      status: "error",
      message: result.error.issues[0]?.message ?? "Unable to send feedback."
    };
  }

  try {
    await createEarlyAccessFeedback(result.data);
  } catch {
    return {
      status: "error",
      message: "We could not send that feedback yet. Try again from the dashboard."
    };
  }

  revalidatePath("/super-admin/early-access");

  return {
    status: "success",
    message: "Feedback sent. Thank you."
  };
}
