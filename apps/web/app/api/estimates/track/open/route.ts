import { NextResponse, type NextRequest } from "next/server";

import { trackEstimateEmailOpened } from "@/lib/estimates/data";

const transparentGif = Buffer.from(
  "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (token) {
    try {
      await trackEstimateEmailOpened(token);
    } catch {
      // Email tracking should never break image rendering in the client.
    }
  }

  return new NextResponse(transparentGif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
