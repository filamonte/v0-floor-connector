import type { NextRequest } from "next/server";

import { updateAuthSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateAuthSession(request);
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/portal/:path*", "/super-admin/:path*"]
};
