import { NextResponse } from "next/server";

import { searchGlobalRecords } from "@/lib/global-search/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  try {
    const results = await searchGlobalRecords(query);

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to search contractor records.";
    const status = message.toLowerCase().includes("authenticated") ? 401 : 500;

    return NextResponse.json(
      {
        query,
        totalCount: 0,
        groups: [],
        error: message
      },
      { status }
    );
  }
}
