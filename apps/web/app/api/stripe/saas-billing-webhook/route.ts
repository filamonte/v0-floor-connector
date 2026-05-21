import { NextResponse } from "next/server";

import { processSaasBillingWebhookEvent } from "@/lib/onboarding/saas-billing-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const result = await processSaasBillingWebhookEvent({
      headers: request.headers,
      rawBody
    });

    return NextResponse.json({
      received: true,
      handled: result.handled,
      duplicate: result.duplicate,
      eventType: result.eventType,
      reason: "reason" in result ? result.reason : undefined
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to process SaaS billing webhook.";
    const lowerMessage = message.toLowerCase();
    const status =
      lowerMessage.includes("signature") || lowerMessage.includes("webhook secret")
        ? 400
        : 500;

    return NextResponse.json(
      {
        received: false,
        error: message
      },
      { status }
    );
  }
}
