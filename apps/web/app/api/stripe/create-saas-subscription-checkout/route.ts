import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createSaasBillingCheckoutSession } from "@/lib/onboarding/saas-billing-checkout";

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

  const userCanManageBilling = ["owner", "admin"].includes(
    organizationContext.membership.role
  );

  if (!userCanManageBilling) {
    return NextResponse.json(
      { error: "Only an organization owner or admin can start subscription checkout." },
      { status: 403 }
    );
  }

  try {
    const session = await createSaasBillingCheckoutSession({
      organizationId: organizationContext.organization.id,
      organizationName: organizationContext.organization.displayName,
      userEmail: user.email ?? null,
      userCanManageBilling,
      fallbackOrigin: new URL(request.url).origin
    });

    return NextResponse.json({ url: session.checkoutUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Subscription checkout is unavailable right now."
      },
      { status: 503 }
    );
  }
}
