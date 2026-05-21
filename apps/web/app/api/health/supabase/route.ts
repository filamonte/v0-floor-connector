import { NextResponse } from "next/server";
import { getSupabaseHealth } from "@floorconnector/db";

export async function GET() {
  const health = await getSupabaseHealth();

  return NextResponse.json({
    ok: health.status === "connected",
    service: "web",
    phase: "foundation",
    ...health
  });
}
