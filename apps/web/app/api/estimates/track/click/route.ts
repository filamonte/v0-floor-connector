import { NextResponse, type NextRequest } from "next/server";

import { sanitizeRedirectPath } from "@/lib/auth/paths";
import { trackEstimateEmailClicked } from "@/lib/estimates/data";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const estimateId = request.nextUrl.searchParams.get("estimateId");
  const fallbackPath = estimateId
    ? `/portal/estimates/${estimateId}`
    : "/portal";

  let destinationPath = fallbackPath;

  if (token) {
    try {
      const tracked = await trackEstimateEmailClicked(token);

      if (tracked?.portalPath) {
        destinationPath = tracked.portalPath;
      }
    } catch {
      // Fall back to the portal destination even if click tracking fails.
    }
  }

  return NextResponse.redirect(
    new URL(sanitizeRedirectPath(destinationPath), request.url)
  );
}
