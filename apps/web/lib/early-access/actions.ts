"use server";

import { revalidatePath } from "next/cache";

import {
  createEarlyAccessRequest,
  EarlyAccessIntakeConfigurationError,
  earlyAccessRequestInputSchema
} from "@/lib/early-access/intake";

export type EarlyAccessRequestFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function requestEarlyAccessAction(
  _previousState: EarlyAccessRequestFormState,
  formData: FormData
): Promise<EarlyAccessRequestFormState> {
  const result = earlyAccessRequestInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    email: getFieldValue(formData, "email"),
    companyName: getFieldValue(formData, "companyName"),
    trade: getFieldValue(formData, "trade"),
    note: getFieldValue(formData, "note")
  });

  if (!result.success) {
    return {
      status: "error",
      message:
        result.error.issues[0]?.message ??
        "We could not capture the early-access request."
    };
  }

  try {
    await createEarlyAccessRequest(result.data);
  } catch (error) {
    if (error instanceof EarlyAccessIntakeConfigurationError) {
      return {
        status: "error",
        message:
          "Early-access requests are not available yet. Use Start Free Trial or contact support."
      };
    }

    return {
      status: "error",
      message:
        "We could not capture that request yet. Use Start Free Trial or contact support."
    };
  }

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/super-admin/early-access");

  return {
    status: "success",
    message: "Request received. We will review it for early access."
  };
}
