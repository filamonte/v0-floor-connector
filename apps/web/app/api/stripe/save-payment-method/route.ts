import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { saveSetupIntentPaymentMethodForOrganization } from "@/lib/onboarding/billing-setup";

const savePaymentMethodSchema = z.object({
  setupIntentId: z.string().min(1)
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return NextResponse.json(
      { error: "No active organization is available for billing setup." },
      { status: 400 }
    );
  }

  const parseResult = savePaymentMethodSchema.safeParse(await request.json().catch(() => null));

  if (!parseResult.success) {
    return NextResponse.json({ error: "SetupIntent id is required." }, { status: 400 });
  }

  try {
    const result = await saveSetupIntentPaymentMethodForOrganization({
      organizationId: organizationContext.organization.id,
      setupIntentId: parseResult.data.setupIntentId
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error:
          "We could not save that billing method right now. You can retry or continue setup and add billing later."
      },
      { status: 500 }
    );
  }
}
