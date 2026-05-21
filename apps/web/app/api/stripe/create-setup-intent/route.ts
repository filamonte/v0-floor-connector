import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createBillingSetupIntent } from "@/lib/onboarding/billing-setup";

export async function POST() {
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

  try {
    const setupIntent = await createBillingSetupIntent({
      organizationId: organizationContext.organization.id,
      organizationName: organizationContext.organization.displayName,
      userEmail: user.email ?? null
    });

    return NextResponse.json({
      clientSecret: setupIntent.clientSecret
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Secure billing is not available right now. You can continue setup and add billing later."
      },
      { status: 500 }
    );
  }
}
